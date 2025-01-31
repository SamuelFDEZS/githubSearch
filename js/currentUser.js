const nickContainer = document.querySelector('.header__user-container__nickname');
const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
const userContainer = document.querySelector('.header__user-container');
const userIcon = document.querySelector('.header__user-container__user-icon');
const userArrow = document.querySelector('.header__user-container__arrow');
const userMenu = document.querySelector('.header__user-container__user-menu');

if(currentUser) {
    userIcon.classList.remove('login__element__hidden');
    nickContainer.classList.remove('login__element__hidden');
    nickContainer.innerHTML = currentUser.nickname;
} else {
    userIcon.classList.add('login__element__hidden');
    userContainer.classList.add('login__element__hidden');
}

const handleUserClick = () => {
    userArrow.classList.toggle('fa-angle-rotated');
    userContainer.classList.toggle('header__user-container__active-background');

    userMenu.classList.toggle('visible')
}

userContainer.addEventListener('click', handleUserClick);