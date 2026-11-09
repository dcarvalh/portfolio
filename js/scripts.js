// Phone menu, and highlighting the current section in the sidebar.
window.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('navbarResponsive');
    const toggler = document.querySelector('.navbar-toggler');
    const links = [...menu.querySelectorAll('.nav-link')];
    const sections = links.map((link) => document.querySelector(link.getAttribute('href')));

    const setMenuOpen = (open) => {
        menu.classList.toggle('show', open);
        toggler.setAttribute('aria-expanded', String(open));
    };
    toggler.addEventListener('click', () => setMenuOpen(!menu.classList.contains('show')));
    links.forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));

    const highlightCurrent = () => {
        const line = window.innerHeight * 0.6;
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        let current = 0;
        sections.forEach((section, index) => {
            if (section.getBoundingClientRect().top <= line) {
                current = index;
            }
        });
        if (atBottom) {
            current = sections.length - 1;
        }
        links.forEach((link, index) => link.classList.toggle('active', index === current));
    };
    window.addEventListener('scroll', highlightCurrent, { passive: true });
    window.addEventListener('resize', highlightCurrent);
    window.addEventListener('languageChanged', highlightCurrent);
    highlightCurrent();
});
