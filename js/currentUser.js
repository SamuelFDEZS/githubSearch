const nickContainer = document.querySelector('.header__user-container__nickname');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
const userContainer = document.querySelector('.header__user-container');
const userIcon = document.querySelector('.header__user-container__user-icon');
const logoutButton = document.querySelectorAll('.header__user-container__user-menu__item')[1];
const userArrow = document.querySelector('.header__user-container__arrow');
const userMenu = document.querySelector('.header__user-container__user-menu');
const menuItems = document.querySelectorAll('.header__nav__list__item');
const restrictedMenuItems = [menuItems[1], menuItems[2]];

const setCurrentUser = (value) => {
    currentUser = value;
    handleCurrentUser();
};

const handleCurrentUser = () => {
    // Check if user is logged to navigate
    restrictedMenuItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            if (!currentUser) {
                event.preventDefault();
                window.location.href = 'login.html';
            }
        });
    });

    if (currentUser) {
        userIcon.classList.remove('login__element__hidden');
        nickContainer.classList.remove('login__element__hidden');
        nickContainer.innerHTML = currentUser.nickname;
    } else {
        userIcon.classList.add('login__element__hidden');
        userContainer.classList.add('login__element__hidden');
    }
};
handleCurrentUser();

// Function to handle the click on user's menu (top right menu)
const handleUserClick = () => {
    userArrow.classList.toggle('fa-angle-rotated');
    userContainer.classList.toggle('header__user-container__active-background');

    userMenu.classList.toggle('visible');
};

const logoutUser = () => {
    currentUser = '';
    if (localStorage.getItem('currentUser')) {
        localStorage.removeItem('currentUser');
    } else {
        sessionStorage.removeItem('currentUser');
    }

    window.location.href = '/index.html';
};

const handleUserLogout = () => {
    let background = document.createElement('div');
    background.classList.add('logout-background');

    let main = document.createElement('main');
    main.classList.add('logout-confirmation');

    let h3 = document.createElement('h3');
    h3.classList.add('logout-confirmation__title');
    h3.textContent = 'Are you sure you want to logout?';

    let div = document.createElement('div');
    div.classList.add('logout-confirmation__button-container');

    let button1 = document.createElement('button');
    let button2 = document.createElement('button');

    button1.classList.add('logout-confirmation__button-container__button', 'logout-confirmation__button-container__button--discard');
    button2.classList.add('logout-confirmation__button-container__button', 'logout-confirmation__button-container__button--confirm');

    let span1 = document.createElement('span');
    let span2 = document.createElement('span');

    span1.textContent = 'No';
    span2.textContent = 'Yes';

    button1.appendChild(span1);
    button2.appendChild(span2);

    div.append(button1, button2);
    main.append(h3, div);
    document.body.append(main, background);

    button1.addEventListener('click', () => {
        main.remove();
        background.remove();
    });
    button2.addEventListener('click', logoutUser);
};

userContainer.addEventListener('click', handleUserClick);
logoutButton.addEventListener('click', handleUserLogout);
