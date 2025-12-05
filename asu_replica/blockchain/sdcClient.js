const { ethers } = require('ethers');

const rpcUrl = process.env.AMOY_RPC_URL || process.env.POLYGON_RPC_URL;
const privateKey = process.env.PRIVATE_KEY || process.env.ISSUER_PRIVATE_KEY;
const tokenAddress = process.env.SDC_TOKEN_ADDRESS || process.env.COIN_CONTRACT_ADDRESS || '';
const mockEnabled = process.env.MOCK_CHAIN === 'true' || !rpcUrl || !tokenAddress;
const decimals = Number(process.env.SDC_DECIMALS || 18);

// Minimal ERC20 ABI
const erc20Abi = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)'
];

let provider;
let wallet;
let token;
let cachedSymbol;
let cachedNetworkLabel;

const mockBalances = new Map();

function usesMock() {
    return mockEnabled;
}

function getProvider() {
    if (!provider) {
        provider = new ethers.JsonRpcProvider(rpcUrl);
    }
    return provider;
}

function getWallet() {
    if (!wallet) {
        if (!privateKey) throw new Error('Private key not configured for SDC token actions');
        wallet = new ethers.Wallet(privateKey, getProvider());
    }
    return wallet;
}

function getTokenContract() {
    if (!token) {
        token = new ethers.Contract(tokenAddress, erc20Abi, getWallet());
    }
    return token;
}

async function getSymbol() {
    if (cachedSymbol) return cachedSymbol;
    if (mockEnabled) {
        cachedSymbol = 'SDC';
        return cachedSymbol;
    }
    cachedSymbol = await getTokenContract().symbol();
    return cachedSymbol;
}

async function getBalance(address) {
    if (!address) throw new Error('Address required');
    if (mockEnabled) {
        if (!mockBalances.has(address.toLowerCase())) {
            mockBalances.set(address.toLowerCase(), ethers.parseUnits('1000', decimals));
        }
        const bal = mockBalances.get(address.toLowerCase());
        return {
            balance: bal,
            symbol: await getSymbol(),
            decimals,
            mock: true
        };
    }

    const bal = await getTokenContract().balanceOf(address);
    return {
        balance: bal,
        symbol: await getSymbol(),
        decimals,
        mock: false
    };
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

async function transfer(fromAddress, toAddress, amount) {
    if (!toAddress) throw new Error('Recipient required');
    if (!ethers.isAddress(toAddress)) throw new Error('Recipient address is invalid');
    if (!amount || amount <= 0) throw new Error('Amount must be positive');

    if (mockEnabled) {
        const fromKey = fromAddress.toLowerCase();
        const toKey = toAddress.toLowerCase();
        if (!mockBalances.has(fromKey)) mockBalances.set(fromKey, ethers.parseUnits('1000', decimals));
        if (!mockBalances.has(toKey)) mockBalances.set(toKey, ethers.parseUnits('0', decimals));

        const amountBig = ethers.parseUnits(String(amount), decimals);
        const fromBal = mockBalances.get(fromKey);
        if (fromBal < amountBig) throw new Error('Insufficient SDC balance');

        mockBalances.set(fromKey, fromBal - amountBig);
        mockBalances.set(toKey, mockBalances.get(toKey) + amountBig);
        return { hash: `0xmock-sdc-${Date.now()}`, network: 'mock', mock: true };
    }

    const tokenContract = getTokenContract();
    const weiAmount = ethers.parseUnits(String(amount), decimals);
    const tx = await tokenContract.transfer(toAddress, weiAmount);
    const receipt = await tx.wait();
    const net = await getProvider().getNetwork();
    const networkLabel = net.name && net.name !== 'unknown' ? net.name : `chain-${net.chainId}`;
    return { hash: receipt.hash, network: networkLabel, mock: false };
}

module.exports = {
    getBalance,
    transfer,
    usesMock,
    decimals,
    getSymbol,
    getNetworkLabel
};
