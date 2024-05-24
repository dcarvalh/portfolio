document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('nav');
    menuButton.addEventListener('click', function() {
        const menu = document.querySelector('nav ul');
        if (menu.style.display === 'block') {
            menu.style.display = 'none';
        } else {
            menu.style.display = 'block';
        }
    });
});