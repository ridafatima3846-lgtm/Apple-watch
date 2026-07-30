(function () {
    const logged = localStorage.getItem('watchlux_admin_logged');
    if (logged !== 'true') {
        const path = window.location.pathname;
        const loginUrl = path.substring(0, path.lastIndexOf('/') + 1) + 'login.html';
        const currentFile = path.split('/').pop();
        const redirect = currentFile !== 'login.html' ? '?redirect=' + currentFile : '';
        window.location.href = loginUrl + redirect;
    }
})();
