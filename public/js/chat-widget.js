let chatWidgetState = { chatId: null, orderId: '', polling: null };

function initChatWidget() {
    const html = `
    <div id="chat-widget" style="position:fixed;bottom:80px;right:16px;z-index:9999;font-family:'Inter',sans-serif;">
        <button id="chat-toggle" style="width:56px;height:56px;border-radius:50%;background:var(--gradient);border:none;color:white;font-size:24px;cursor:pointer;box-shadow:0 4px 24px rgba(200,164,92,0.4);display:flex;align-items:center;justify-content:center;transition:transform 0.3s;margin-left:auto;" aria-label="Chat">
            <svg id="chat-icon-open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <svg id="chat-icon-close" style="display:none;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div id="chat-panel" style="display:none;position:absolute;bottom:64px;right:0;width:360px;max-width:calc(100vw - 32px);height:480px;max-height:60vh;background:var(--card-bg);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:0 20px 60px rgba(0,0,0,0.15);overflow:hidden;flex-direction:column;">
            <div style="padding:16px 20px;background:var(--gradient);color:white;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:700;font-size:14px;">💬 WatchLux Chat</span>
                <span id="chat-status" style="font-size:11px;opacity:0.8;">Online</span>
            </div>
            <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:var(--bg-secondary);"></div>
            <div id="chat-login" style="padding:16px;border-top:1px solid var(--border);display:block;">
                <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">Enter your Order ID or phone to start chat</p>
                <div style="display:flex;gap:8px;">
                    <input type="text" id="chat-query" class="form-input" placeholder="e.g. #1234 or 03xx" style="padding:10px 14px;font-size:13px;">
                    <button onclick="chatStart()" class="btn-primary" style="padding:10px 16px;font-size:12px;white-space:nowrap;">Start</button>
                </div>
            </div>
            <div id="chat-input-area" style="display:none;padding:12px 16px;border-top:1px solid var(--border);">
                <div style="display:flex;gap:8px;">
                    <input type="text" id="chat-input" class="form-input" placeholder="Type a message..." style="padding:10px 14px;font-size:13px;" onkeydown="if(event.key==='Enter') chatSend()">
                    <button onclick="chatSend()" class="btn-primary" style="padding:10px 16px;font-size:12px;">Send</button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('chat-toggle').addEventListener('click', () => {
        const panel = document.getElementById('chat-panel');
        const open = document.getElementById('chat-icon-open');
        const close = document.getElementById('chat-icon-close');
        if (panel.style.display === 'flex') {
            panel.style.display = 'none';
            open.style.display = 'block';
            close.style.display = 'none';
            stopPolling();
        } else {
            panel.style.display = 'flex';
            open.style.display = 'none';
            close.style.display = 'block';
        }
    });
}

function chatStart() {
    const query = document.getElementById('chat-query').value.trim();
    if (!query) return;
    const loginEl = document.getElementById('chat-login');
    const inputArea = document.getElementById('chat-input-area');
    const msgEl = document.getElementById('chat-messages');
    loginEl.style.display = 'none';
    inputArea.style.display = 'block';
    msgEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">Connecting...</div>';

    API.trackOrder(query).then(async order => {
        chatWidgetState.orderId = order.orderId;
        const chat = await API.createChat(order.orderId, order.customerName, order.phone);
        chatWidgetState.chatId = chat._id;
        loadChatMessages(chat._id);
        startPolling(chat._id);
    }).catch(() => {
        API.createChat(query, 'Guest', query).then(chat => {
            chatWidgetState.chatId = chat._id;
            chatWidgetState.orderId = query;
            msgEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">Chat started. How can we help you?</div>';
            startPolling(chat._id);
        });
    });
}

async function loadChatMessages(chatId) {
    const msgs = await API.getChatMessages(chatId);
    const msgEl = document.getElementById('chat-messages');
    if (!msgs || msgs.length === 0) {
        msgEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">No messages yet. Send us a message!</div>';
        return;
    }
    msgEl.innerHTML = msgs.map(m => `
        <div style="display:flex;${m.from === 'customer' ? '' : 'justify-content:flex-end;'}">
            <div style="max-width:80%;padding:10px 14px;border-radius:${m.from === 'customer' ? '0 12px 12px 12px' : '12px 0 12px 12px'};background:${m.from === 'customer' ? 'var(--card-bg)' : 'var(--primary)'};color:${m.from === 'customer' ? 'var(--text-primary)' : 'white'};box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                <p style="font-size:13px;line-height:1.5;">${m.text}</p>
                <p style="font-size:10px;opacity:0.6;margin-top:4px;">${new Date(m.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    `).join('');
    msgEl.scrollTop = msgEl.scrollHeight;
    await API.markChatRead(chatId, 'customer');
}

async function chatSend() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !chatWidgetState.chatId) return;
    input.value = '';
    document.getElementById('chat-messages').insertAdjacentHTML('beforeend', `
        <div style="display:flex;justify-content:flex-end;">
            <div style="max-width:80%;padding:10px 14px;border-radius:12px 0 12px 12px;background:var(--primary);color:white;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                <p style="font-size:13px;line-height:1.5;">${text}</p>
                <p style="font-size:10px;opacity:0.6;margin-top:4px;">Just now</p>
            </div>
        </div>
    `);
    const msgEl = document.getElementById('chat-messages');
    msgEl.scrollTop = msgEl.scrollHeight;
    await API.sendMessage(chatWidgetState.chatId, text, 'customer');
}

function startPolling(chatId) {
    stopPolling();
    chatWidgetState.polling = setInterval(async () => {
        const msgs = await API.getChatMessages(chatId);
        const msgEl = document.getElementById('chat-messages');
        const existing = msgEl.querySelectorAll('p:first-child').length;
        if (msgs && msgs.length > existing) {
            loadChatMessages(chatId);
        }
    }, 4000);
}

function stopPolling() {
    if (chatWidgetState.polling) {
        clearInterval(chatWidgetState.polling);
        chatWidgetState.polling = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('link');
    btn.rel = 'stylesheet';
    btn.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
    document.head.appendChild(btn);
    initChatWidget();
});