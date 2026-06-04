const burgerMenu = document.querySelector('.header__burger');
const navBar = document.querySelector('.header__nav');

burgerMenu.addEventListener('click', () => {
    navBar.classList.toggle('visible');
});
