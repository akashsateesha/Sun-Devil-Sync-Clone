// Badge utility scripts for minting and verification pages

document.addEventListener('DOMContentLoaded', () => {
    // Ensure auth state is ready before toggling admin-only UI
    if (window.auth && typeof auth.checkAuth === 'function') {
        auth.checkAuth().finally(() => {
            loadBadgeStatus();
            setupBadgeLookup();
            setupBadgeMinting();
            loadMyBadges();
            loadBadgeList();
        });
    } else {
        loadBadgeStatus();
        setupBadgeLookup();
        setupBadgeMinting();
        loadMyBadges();
        loadBadgeList();
    }
});

function setButtonLoading(button, isLoading, label = 'Submitting...') {
    if (!button) return;
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = label;
        button.disabled = true;
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.disabled = false;
    }
}

async function loadBadgeStatus() {
    const statusEl = document.getElementById('badge-status');
    if (!statusEl) return;

    statusEl.textContent = 'Loading badge config...';
    const status = await api.get('/badges/status');
    if (!status) {
        statusEl.textContent = 'Badge service unavailable.';
        return;
    }

    const badges = [];
    badges.push(status.configured ? 'On-chain ready' : 'Not configured (using mock)');
    badges.push(status.usesMock ? 'Mock mode' : 'Blockchain mode');

    statusEl.innerHTML = `
        <span class="badge badge-${status.configured ? 'success' : 'warning'}">${badges[0]}</span>
        <span class="badge badge-${status.usesMock ? 'info' : 'primary'}">${badges[1]}</span>
    `;
}

function setupBadgeLookup() {
    const form = document.getElementById('badge-lookup-form');
    const input = document.getElementById('badge-token-id');
    if (!form || !input) return;

    const initialToken = getUrlParameter('tokenId');
    if (initialToken) {
        input.value = initialToken;
        fetchBadge(initialToken);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tokenId = input.value.trim();
        if (!tokenId) {
            showToast('Enter a token ID to verify', 'error');
            return;
        }
        await fetchBadge(tokenId);
    });
}

async function fetchBadge(tokenId) {
    const resultEl = document.getElementById('badge-result');
    const statusEl = document.getElementById('badge-lookup-status');
    if (statusEl) statusEl.textContent = '';
    if (resultEl) resultEl.innerHTML = '';

    if (statusEl) statusEl.textContent = 'Looking up badge...';
    const badge = await api.get(`/badges/${tokenId}`);
    if (!badge) {
        if (statusEl) statusEl.textContent = 'Not found.';
        return;
    }

    if (statusEl) statusEl.textContent = '';
    renderBadgeResult(badge, resultEl);
}

function renderBadgeResult(badge, container) {
    if (!container) return;
    const issuedDate = badge.issuedAt ? new Date(badge.issuedAt * 1000).toLocaleString() : 'N/A';

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Badge #${badge.tokenId}</h3>
                <span class="tag tag-secondary">${badge.network || 'unknown'}</span>
            </div>
            <div class="card-body">
                <p><strong>Event:</strong> ${badge.eventName} (ID: ${badge.eventId})</p>
                <p><strong>Date:</strong> ${badge.eventDate}</p>
                <p><strong>Achievement:</strong> ${badge.achievementType}</p>
                <p><strong>Metadata URI:</strong> <a href="${badge.metadataURI}" target="_blank" rel="noopener">${badge.metadataURI}</a></p>
                <p><strong>Issued At:</strong> ${issuedDate}</p>
                <p><strong>Issuer:</strong> ${badge.issuer}</p>
            </div>
        </div>
    `;
}

function setupBadgeMinting() {
    const form = document.getElementById('badge-mint-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const resultEl = document.getElementById('badge-mint-result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            studentWallet: form.studentWallet.value.trim(),
            eventId: form.eventId.value.trim(),
            eventName: form.eventName.value.trim(),
            eventDate: form.eventDate.value,
            achievementType: form.achievementType.value.trim(),
            metadataURI: form.metadataURI.value.trim()
        };

        setButtonLoading(submitBtn, true, 'Minting...');
        const response = await api.post('/badges/mint', payload);
        setButtonLoading(submitBtn, false);

        if (!response) return;

        if (resultEl) {
            resultEl.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Minted Badge #${response.tokenId}</h3>
                        <span class="tag tag-primary">${response.network}</span>
                    </div>
                    <div class="card-body">
                        <p><strong>Tx Hash:</strong> ${response.transactionHash}</p>
                        <p><a href="verify.html?tokenId=${response.tokenId}" class="btn btn-sm btn-secondary">View in verifier</a></p>
                    </div>
                </div>
            `;
        }

        showToast('Badge minted successfully', 'success');
        form.reset();
    });
}

async function loadBadgeList() {
    const listEl = document.getElementById('badge-list');
    if (!listEl) return;

    listEl.innerHTML = '<p class="text-secondary">Loading badges...</p>';
    const badges = await api.get('/badges');
    if (!badges || badges.length === 0) {
        listEl.innerHTML = '<p class="text-secondary">No badges minted yet.</p>';
        return;
    }

    listEl.innerHTML = badges.map(badge => badgeListItem(badge)).join('');
}

function badgeListItem(badge) {
    const issued = badge.created_at ? new Date(badge.created_at).toLocaleString() : '';
    const tokenDisplay = badge.token_id ? `#${badge.token_id}` : 'Untracked';
    const txUrl = explorerLink(badge.tx_hash, badge.network);
    return `
        <div class="card mb-2">
            <div class="card-header">
                <h3 class="card-title">Badge ${tokenDisplay}</h3>
                <span class="tag tag-secondary">${badge.network || 'unknown'}</span>
            </div>
            <div class="card-body">
                <p><strong>Student Wallet:</strong> ${badge.student_wallet}</p>
                <p><strong>Event:</strong> ${badge.event_name || 'N/A'} (ID: ${badge.event_id || 'N/A'})</p>
                <p><strong>Achievement:</strong> ${badge.achievement_type || 'N/A'}</p>
                <p><strong>Metadata URI:</strong> <a href="${badge.metadata_uri}" target="_blank" rel="noopener">${badge.metadata_uri}</a></p>
                <p><strong>Tx Hash:</strong> ${txUrl ? `<a href="${txUrl}" target="_blank" rel="noopener">${badge.tx_hash}</a>` : (badge.tx_hash || 'pending')}</p>
                <p class="text-secondary">Minted: ${issued}</p>
                ${badge.token_id ? `<a class="btn btn-sm btn-primary" href="verify.html?tokenId=${badge.token_id}">Verify</a>` : ''}
            </div>
        </div>
    `;
}

async function loadMyBadges() {
    const section = document.getElementById('my-badges-section');
    const list = document.getElementById('my-badges-list');
    const count = document.getElementById('my-badge-count');
    if (!section || !list) return;

    const user = window.currentUser;
    if (!user) {
        list.innerHTML = '<p class="text-secondary">Log in to see your badges.</p>';
        return;
    }

    list.innerHTML = '<p class="text-secondary">Loading...</p>';
    const badges = await api.get('/my-badges');
    if (!badges || badges.length === 0) {
        list.innerHTML = '<p class="text-secondary">No badges yet. Enroll in an event to mint an enrolled badge.</p>';
        if (count) count.textContent = '0';
        return;
    }

    if (count) count.textContent = `${badges.length}`;
    list.innerHTML = badges.map(badgeListItem).join('');
}

function explorerLink(tx, network) {
    if (!tx || !network) return null;
    const net = network.toLowerCase();
    if (net.includes('amoy')) return `https://amoy.polygonscan.com/tx/${tx}`;
    if (net.includes('polygon')) return `https://polygonscan.com/tx/${tx}`;
    return null;
}
