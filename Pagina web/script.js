// Tabs de la carta
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('activo'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('activo'));
    btn.classList.add('activo');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('activo');
});
});

// Animación de entrada para secciones al hacer scroll
const observer = new IntersectionObserver((entries) => {
entries.forEach(e => {
    if (e.isIntersecting) {
    e.target.style.opacity = 1;
    e.target.style.transform = 'translateY(0)';
    }
});
}, { threshold: 0.1 });

document.querySelectorAll('.menu-item, .dato, .contacto-texto').forEach(el => {
el.style.opacity = 0;
el.style.transform = 'translateY(20px)';
el.style.transition = 'opacity .5s ease, transform .5s ease';
observer.observe(el);
});
