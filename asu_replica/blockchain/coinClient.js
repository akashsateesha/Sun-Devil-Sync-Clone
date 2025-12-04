const { ethers } = require('ethers');
const coinAbi = require('./abi/SunDevilCoin.json');

const rpcUrl = process.env.AMOY_RPC_URL || process.env.POLYGON_RPC_URL;
const rawPrivateKey = process.env.PRIVATE_KEY || process.env.ISSUER_PRIVATE_KEY;
const contractAddress = process.env.COIN_CONTRACT_ADDRESS || process.env.SDC_CONTRACT_ADDRESS;
const mockEnabled = process.env.MOCK_CHAIN === 'true' || !rpcUrl || !contractAddress;

let provider;
let wallet;
let contract;
let cachedNetworkLabel;

const mockBalances = new Map();
let mockSupply = 0n;
const mockIssuer = '0x000000000000000000000000000000000000dEaD';

function usesMock() {
    return mockEnabled;
}

function isConfigured() {
    return Boolean(rpcUrl && contractAddress && rawPrivateKey);
}

function getProvider() {
    if (!provider) {
        provider = new ethers.JsonRpcProvider(rpcUrl);
    }
    return provider;
}

function getWallet() {
    if (!wallet) {
        const normalizedKey = normalizePrivateKey(rawPrivateKey);
        if (!normalizedKey) {
            throw new Error('Private key not configured or invalid. Expect 0x-prefixed 64 hex characters in PRIVATE_KEY or ISSUER_PRIVATE_KEY.');
        }
        wallet = new ethers.Wallet(normalizedKey, getProvider());
    }
    return wallet;
}

function getContract(withSigner = false) {
    if (!contract) {
        const signerOrProvider = withSigner ? getWallet() : getProvider();
        contract = new ethers.Contract(contractAddress, coinAbi, signerOrProvider);
    } else if (withSigner && !contract.signer) {
        contract = contract.connect(getWallet());
    }
    return contract;
}

async function getNetworkLabel() {
    if (cachedNetworkLabel) return cachedNetworkLabel;
    if (mockEnabled) {
        cachedNetworkLabel = 'mock';
        return cachedNetworkLabel;
    }
    const net = await getProvider().getNetwork();
    cachedNetworkLabel = net.name && net.name !== 'unknown' ? net.name : `chain-${net.chainId}`;
    return cachedNetworkLabel;
}

function normalizePrivateKey(value) {
    if (!value) return null;
    let key = value.trim().replace(/^['"]|['"]$/g, '');
    if (!key.startsWith('0x') && key.length === 64) {
        key = `0x${key}`;
    }
    if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
        return null;
    }
    return key;
}

function toWei(amount) {
    if (amount === undefined || amount === null) {
        throw new Error('Amount is required');
    }
    const asString = typeof amount === 'string' ? amount.trim() : amount.toString();
    return ethers.parseUnits(asString, 18);
}

function formatTokens(amountWei) {
    return ethers.formatUnits(amountWei, 18);
}

async function issuerAddress() {
    if (mockEnabled) return mockIssuer;
    return getWallet().address;
}

async function mint({ recipient, amount }) {
    const amountWei = toWei(amount);
    if (mockEnabled) {
        return mockMint(recipient, amountWei);
    }
    if (!isConfigured()) {
        throw new Error('Blockchain not configured. Set AMOY_RPC_URL, COIN_CONTRACT_ADDRESS, and PRIVATE_KEY.');
    }

    const signer = getContract(true);
    const tx = await signer.mint(recipient, amountWei);
    const receipt = await tx.wait();

    return {
        to: recipient,
        amountWei: amountWei.toString(),
        amountTokens: formatTokens(amountWei),
        transactionHash: receipt.hash,
        network: await getNetworkLabel()
    };
}

async function transfer({ recipient, amount }) {
    const amountWei = toWei(amount);
    const from = await issuerAddress();
    if (mockEnabled) {
        return mockTransfer(from, recipient, amountWei);
    }
    if (!isConfigured()) {
        throw new Error('Blockchain not configured. Set AMOY_RPC_URL, COIN_CONTRACT_ADDRESS, and PRIVATE_KEY.');
    }

    const signer = getContract(true);
    const tx = await signer.transfer(recipient, amountWei);
    const receipt = await tx.wait();

    return {
        from,
        to: recipient,
        amountWei: amountWei.toString(),
        amountTokens: formatTokens(amountWei),
        transactionHash: receipt.hash,
        network: await getNetworkLabel()
    };
}

async function balanceOf(address) {
    const amountWei = mockEnabled ? mockBalanceOf(address) : await getContract(false).balanceOf(address);
    return {
        address,
        balanceWei: amountWei.toString(),
        balance: formatTokens(amountWei),
        network: await getNetworkLabel()
    };
}

async function totalSupply() {
    const supplyWei = mockEnabled ? mockSupply : await getContract(false).totalSupply();
    return {
        totalSupplyWei: supplyWei.toString(),
        totalSupply: formatTokens(supplyWei),
        network: await getNetworkLabel()
    };
}

function mockBalanceOf(address) {
    return mockBalances.get(address) || 0n;
}

function mockMint(to, amountWei) {
    if (!to) throw new Error('Recipient required (mock)');
    const current = mockBalanceOf(to);
    mockBalances.set(to, current + amountWei);
    mockSupply += amountWei;

    return {
        to,
        amountWei: amountWei.toString(),
        amountTokens: formatTokens(amountWei),
        transactionHash: `0xmockmint${mockSupply}`,
        network: 'mock'
    };
}

function mockTransfer(from, to, amountWei) {
    const currentFrom = mockBalanceOf(from);
    if (currentFrom < amountWei) {
        throw new Error('Insufficient balance (mock)');
    }
    mockBalances.set(from, currentFrom - amountWei);
    mockBalances.set(to, mockBalanceOf(to) + amountWei);

    return {
        from,
        to,
        amountWei: amountWei.toString(),
        amountTokens: formatTokens(amountWei),
        transactionHash: `0xmocktransfer${Date.now()}`,
        network: 'mock'
    };
}

module.exports = {
    mint,
    transfer,
    balanceOf,
    totalSupply,
    issuerAddress,
    usesMock,
    isConfigured
};
