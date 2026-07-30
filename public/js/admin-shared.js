function logout() {
    localStorage.removeItem('watchlux_admin_logged');
    window.location.href = 'login.html';
}

function showChangePassword() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
        <div style="background:var(--card-bg);border-radius:var(--radius-xl);padding:32px;max-width:400px;width:100%;">
            <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:16px;">🔑 Change Password</h3>
            <div id="cp-error" style="color:#ef4444;font-size:13px;margin-bottom:8px;display:none;"></div>
            <input type="password" id="cp-current" class="form-input" placeholder="Current password" style="margin-bottom:8px;">
            <input type="password" id="cp-new" class="form-input" placeholder="New password" style="margin-bottom:8px;">
            <input type="password" id="cp-confirm" class="form-input" placeholder="Confirm new password" style="margin-bottom:16px;">
            <div style="display:flex;gap:8px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-outline" style="flex:1;justify-content:center;padding:12px;">Cancel</button>
                <button onclick="changePassword()" class="btn-primary" style="flex:1;justify-content:center;padding:12px;">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('cp-current').focus();
}

function changePassword() {
    const current = document.getElementById('cp-current').value;
    const newPass = document.getElementById('cp-new').value;
    const confirm = document.getElementById('cp-confirm').value;
    const errorEl = document.getElementById('cp-error');
    const stored = localStorage.getItem('watchlux_admin_pass') || 'admin123';
    if (current !== stored) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Current password is wrong';
        return;
    }
    if (newPass.length < 4) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'New password must be at least 4 characters';
        return;
    }
    if (newPass !== confirm) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'New passwords do not match';
        return;
    }
    localStorage.setItem('watchlux_admin_pass', newPass);
    errorEl.style.display = 'block';
    errorEl.style.color = '#16a34a';
    errorEl.textContent = '✓ Password changed successfully!';
    setTimeout(() => {
        document.querySelector('div[style*="position:fixed"][style*="z-index:99999"]')?.remove();
    }, 1500);
}
