const express = require('express');
const router = express.Router();
const db = require('../database');
const blockchain = require('../blockchain/client');
const sdc = require('../blockchain/sdcClient');
const { isAddress } = require('ethers');

// Promise helpers for sqlite callbacks
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

// Middleware to check auth
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Get All Groups
router.get('/groups', (req, res) => {
    db.all("SELECT * FROM groups", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse JSON strings back to arrays
        const groups = rows.map(group => ({
            ...group,
            categories: JSON.parse(group.categories || '[]'),
            benefits: JSON.parse(group.benefits || '[]')
        }));
        res.json(groups);
    });
});

// Get All Events
router.get('/events', (req, res) => {
    db.all("SELECT * FROM events", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const events = rows.map(event => ({
            ...event,
            category: JSON.parse(event.category || '[]'),
            tags: JSON.parse(event.tags || '[]'),
            isFree: !!event.isFree,
            rsvpRequired: !!event.rsvpRequired
        }));
        res.json(events);
    });
});

// Join/Leave Group (toggle)
router.post('/groups/:id/join', requireAuth, (req, res) => {
    const groupId = parseInt(req.params.id, 10);
    const userId = req.session.user.id;

    if (!Number.isInteger(groupId)) {
        return res.status(400).json({ error: 'Invalid group id' });
    }

    db.get('SELECT 1 FROM groups WHERE id = ?', [groupId], (err, group) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        db.get('SELECT 1 FROM memberships WHERE user_id = ? AND group_id = ?', [userId, groupId], (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });

            if (existing) {
                db.run('DELETE FROM memberships WHERE user_id = ? AND group_id = ?', [userId, groupId], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    db.run('UPDATE groups SET members = MAX(members - 1, 0) WHERE id = ?', [groupId]);
                    return res.json({ message: 'Left group', status: 'left' });
                });
            } else {
                db.run('INSERT INTO memberships (user_id, group_id) VALUES (?, ?)', [userId, groupId], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    db.run('UPDATE groups SET members = members + 1 WHERE id = ?', [groupId]);
                    return res.json({ message: 'Joined group successfully', status: 'joined' });
                });
            }
        });
    });
});

// RSVP to an event
router.post('/events/:id/rsvp', requireAuth, async (req, res) => {
    const eventId = parseInt(req.params.id, 10);
    const userId = req.session.user.id;

    if (!Number.isInteger(eventId)) {
        return res.status(400).json({ error: 'Invalid event id' });
    }

    try {
        const user = await dbGet('SELECT wallet_address FROM users WHERE id = ?', [userId]);
        const wallet = user ? user.wallet_address : null;

        const existing = await dbGet('SELECT 1 FROM rsvps WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        if (existing) {
            await dbRun('DELETE FROM rsvps WHERE user_id = ? AND event_id = ?', [userId, eventId]);
            await dbRun('UPDATE events SET spotsLeft = spotsLeft + 1, attendees = attendees - 1 WHERE id = ?', [eventId]);
            return res.json({ message: 'RSVP cancelled', status: 'cancelled' });
        }

        if (!wallet) {
            return res.status(400).json({ error: 'Add a wallet address in your portal before enrolling.' });
        }

        const event = await dbGet('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        if (event.spotsLeft <= 0) {
            return res.status(400).json({ error: 'Event is full' });
        }

        await dbRun('INSERT INTO rsvps (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
        await dbRun('UPDATE events SET spotsLeft = spotsLeft - 1, attendees = attendees + 1 WHERE id = ?', [eventId]);

        const badge = await mintEnrollmentBadge({ userId, wallet, event });

        // Reward SDC for enrollment
        const sdcReward = await rewardSdc(wallet, process.env.SDC_REWARD_ENROLL || 10);

        res.json({ message: 'RSVP successful', status: 'confirmed', badge, sdc: sdcReward });
    } catch (err) {
        console.error('RSVP error:', err);
        res.status(500).json({ error: 'Failed to RSVP' });
    }
});
// Get User Memberships
router.get('/my-groups', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    db.all(`SELECT group_id FROM memberships WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => r.group_id));
    });
});

// Get User RSVPs
router.get('/my-rsvps', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    db.all(`SELECT event_id FROM rsvps WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => r.event_id));
    });
});

// SDC balance
router.get('/sdc/balance', requireAuth, async (req, res) => {
    const wallet = req.session.user.wallet_address;
    if (!wallet) return res.status(400).json({ error: 'Add a wallet address first' });
    try {
        const result = await sdc.getBalance(wallet);
        res.json({
            wallet,
            balance: result.balance.toString(),
            symbol: result.symbol || 'SDC',
            decimals: result.decimals,
            mock: result.mock
        });
    } catch (err) {
        console.error('SDC balance error:', err);
        res.status(500).json({ error: err.message || 'Failed to load balance' });
    }
});

// SDC transfer
router.post('/sdc/transfer', requireAuth, async (req, res) => {
    const wallet = req.session.user.wallet_address;
    if (!wallet) return res.status(400).json({ error: 'Add a wallet address first' });

    const { to, amount } = req.body;
    if (!to) return res.status(400).json({ error: 'Recipient address required' });
    if (!isAddress(to)) return res.status(400).json({ error: 'Recipient address is invalid' });
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    try {
        const result = await sdc.transfer(wallet, to, parsedAmount);
        res.json({
            message: 'Transfer sent',
            hash: result.hash,
            network: result.network || (result.mock ? 'mock' : null)
        });
    } catch (err) {
        console.error('SDC transfer error:', err);
        res.status(400).json({ error: err.message || 'Failed to transfer' });
    }
});

// SDC config for front-end (public)
router.get('/sdc/config', async (_req, res) => {
    try {
        const network = await sdc.getNetworkLabel();
        res.json({
            tokenAddress: process.env.SDC_TOKEN_ADDRESS || null,
            decimals: Number(process.env.SDC_DECIMALS || 18),
            network,
            mock: sdc.usesMock(),
            storeWallet: process.env.STORE_WALLET_ADDRESS || null
        });
    } catch (err) {
        res.json({
            tokenAddress: process.env.SDC_TOKEN_ADDRESS || null,
            decimals: Number(process.env.SDC_DECIMALS || 18),
            network: 'unknown',
            mock: sdc.usesMock(),
            storeWallet: process.env.STORE_WALLET_ADDRESS || null
        });
    }
});

module.exports = router;

// Helpers
async function mintEnrollmentBadge({ userId, wallet, event }) {
    const existing = await dbGet(
        'SELECT * FROM minted_badges WHERE student_wallet = ? AND event_id = ? AND achievement_type = ?',
        [wallet, event.id, 'enrolled']
    );
    if (existing) {
        return {
            alreadyMinted: true,
            tokenId: existing.token_id,
            transactionHash: existing.tx_hash,
            network: existing.network,
            metadataURI: existing.metadata_uri,
            achievementType: 'enrolled'
        };
    }

    const ownerFragment = userId || wallet;
    const metadataURI = `ipfs://events/${event.id}/enrolled-${ownerFragment}.json`;
    const result = await blockchain.issueBadge({
        student: wallet,
        eventId: Number(event.id),
        eventName: event.title,
        eventDate: event.date,
        achievementType: 'enrolled',
        metadataURI
    });

    await dbRun(
        `INSERT INTO minted_badges (token_id, student_wallet, user_id, event_id, event_name, event_date, achievement_type, metadata_uri, tx_hash, network)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            result.tokenId,
            wallet,
            userId,
            event.id,
            event.title,
            event.date,
            'enrolled',
            metadataURI,
            result.transactionHash || null,
            result.network || null
        ]
    );

    return {
        tokenId: result.tokenId,
        transactionHash: result.transactionHash,
        network: result.network,
        metadataURI,
        achievementType: 'enrolled'
    };
}

async function rewardSdc(toWallet, amount) {
    if (!toWallet) return null;
    if (!process.env.SDC_TOKEN_ADDRESS) return null;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return null;
    try {
        const res = await sdc.transfer(process.env.STORE_WALLET_ADDRESS || toWallet, toWallet, numericAmount);
        return { amount: numericAmount, hash: res.hash, network: res.network };
    } catch (err) {
        console.error('SDC reward error:', err.message || err);
        return null;
    }
}
