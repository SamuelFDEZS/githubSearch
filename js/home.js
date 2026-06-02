const buttonContainer = document.querySelector('.header__btn-container');
const welcomeLoginBtn = document.querySelector('.welcome__login-btn');
const isUserLogged = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
const burgerMenu = document.querySelector('.header__burger');
const navBar = document.querySelector('.header__nav');

if (isUserLogged) {
    buttonContainer.classList.add('login__element__hidden');
    welcomeLoginBtn.classList.add('login__element__hidden');
} else {
    buttonContainer.classList.remove('login__element__hidden');
    welcomeLoginBtn.classList.remove('login__element__hidden');
}

burgerMenu.addEventListener('click', () => {
    navBar.classList.toggle('visible');
})