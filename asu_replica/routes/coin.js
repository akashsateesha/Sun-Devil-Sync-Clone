const express = require('express');
const { isAddress } = require('ethers');
const coin = require('../blockchain/coinClient');
const db = require('../database');

const router = express.Router();

const requireAdmin = (req, res, next) => {
    const user = req.session.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

router.get('/coin/status', (req, res) => {
    res.json({
        configured: coin.isConfigured(),
        usesMock: coin.usesMock()
    });
});

router.get('/coin/balance/:address', async (req, res) => {
    const address = req.params.address;
    if (!isAddress(address)) {
        return res.status(400).json({ error: 'Valid wallet address required' });
    }
    try {
        const result = await coin.balanceOf(address);
        res.json(result);
    } catch (err) {
        console.error('Balance lookup error:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch balance' });
    }
});

router.get('/coin/total-supply', async (req, res) => {
    try {
        const supply = await coin.totalSupply();
        res.json(supply);
    } catch (err) {
        console.error('Total supply error:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch total supply' });
    }
});

router.post('/coin/mint', requireAdmin, async (req, res) => {
    const { recipient, amount } = req.body;
    if (!isAddress(recipient)) {
        return res.status(400).json({ error: 'Valid recipient address required' });
    }
    if (!amount) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    try {
        const from = await coin.issuerAddress();
        const result = await coin.mint({ recipient, amount });
        res.json({ message: 'Minted SDC', from, ...result });

        db.run(
            `INSERT INTO sdc_transactions (type, from_wallet, to_wallet, amount_wei, amount_tokens, tx_hash, network)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                'mint',
                from,
                recipient,
                result.amountWei || null,
                result.amountTokens || null,
                result.transactionHash || null,
                result.network || null
            ],
            (err) => {
                if (err) console.error('Failed to persist coin mint:', err);
            }
        );
    } catch (err) {
        console.error('Mint SDC error:', err);
        res.status(500).json({ error: err.message || 'Failed to mint SDC' });
    }
});

router.post('/coin/transfer', requireAdmin, async (req, res) => {
    const { recipient, amount } = req.body;
    if (!isAddress(recipient)) {
        return res.status(400).json({ error: 'Valid recipient address required' });
    }
    if (!amount) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    try {
        const from = await coin.issuerAddress();
        const result = await coin.transfer({ recipient, amount });
        res.json({ message: 'Transferred SDC', ...result });

        db.run(
            `INSERT INTO sdc_transactions (type, from_wallet, to_wallet, amount_wei, amount_tokens, tx_hash, network)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                'transfer',
                from,
                recipient,
                result.amountWei || null,
                result.amountTokens || null,
                result.transactionHash || null,
                result.network || null
            ],
            (err) => {
                if (err) console.error('Failed to persist coin transfer:', err);
            }
        );
    } catch (err) {
        console.error('Transfer SDC error:', err);
        res.status(500).json({ error: err.message || 'Failed to transfer SDC' });
    }
});

router.get('/coin/transactions', requireAdmin, async (req, res) => {
    db.all(`SELECT * FROM sdc_transactions ORDER BY created_at DESC LIMIT 100`, [], (err, rows) => {
        if (err) {
            console.error('Fetch coin txs error:', err);
            return res.status(500).json({ error: 'Failed to load transactions' });
        }
        res.json(rows);
    });
});

module.exports = router;
