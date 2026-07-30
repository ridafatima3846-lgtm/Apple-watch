document.addEventListener('DOMContentLoaded', async () => {
    try {
        const banner = await API.getBanner();
        if (banner && banner.active && banner.text) {
            const bar = document.createElement('div');
            bar.id = 'offer-banner';
            bar.style.cssText = 'background:' + (banner.bgColor || '#1a1a1a') + ';color:' + (banner.textColor || '#ffffff') + ';text-align:center;padding:10px 24px;font-size:13px;font-weight:600;position:relative;z-index:9998;cursor:' + (banner.link ? 'pointer' : 'default') + ';';
            bar.textContent = banner.text;
            if (banner.link) {
                bar.style.cursor = 'pointer';
                bar.onclick = () => window.location.href = banner.link;
            }
            document.body.insertBefore(bar, document.body.firstChild);
        }
    } catch (e) {}
});