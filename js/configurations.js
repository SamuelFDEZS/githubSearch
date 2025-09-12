const usernameInput = document.querySelector('#configurations-username');
const nicknameInput = document.querySelector('#configurations-nickname');
const passwordInput = document.querySelector('#configurations-password');
const phoneInput = document.querySelector('#configurations-phone');
const confLogoutButton = document.querySelectorAll('.configurations__menu__option')[1];
const form = document.querySelector('.configurations__info__fields-container');
const discardButton = document.querySelectorAll('.configurations__info__fields-container__button-container__button')[0];
const operationStatus = document.querySelector('.operation-status__text');

usernameInput.value = currentUser.username;
nicknameInput.value = currentUser.nickname;
passwordInput.value = currentUser.password;
phoneInput.value = currentUser.phone;

discardButton.addEventListener('click', (event) => {
    event.preventDefault();
    usernameInput.value = currentUser.username;
    nicknameInput.value = currentUser.nickname;
    passwordInput.value = currentUser.password;
    phoneInput.value = currentUser.phone;
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    let userList = JSON.parse(localStorage.getItem('users'));
    const userIndex = userList.findIndex(user => user.username === currentUser.username);
    const formData = new FormData(form);
    const formDataObj = formDataToObject(formData);

    const findUser = userList.find(user => user.username === formData.get('username'));
    if (!findUser || (findUser && JSON.stringify(findUser) !== JSON.stringify(formDataObj))) {
        const users = JSON.parse(localStorage.getItem('users'));
        users[userIndex] = formDataObj;
        localStorage.setItem('users', JSON.stringify(users));
        if (localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        }
        setCurrentUser(users[userIndex]);
        operationStatus.classList.add('success');
        operationStatus.classList.remove('error');
        operationStatus.innerHTML = 'User data successfully changed';
    } else {
        operationStatus.classList.add('error');
        operationStatus.classList.remove('success');
        operationStatus.innerHTML = 'Error changing user data: User already exists';
    }
});

confLogoutButton.addEventListener('click', handleUserLogout);

const formDataToObject = (formData) => {
    const obj = {};

    for (const [key, value] of formData.entries()) {
        obj[key] = value;
    }
    return obj;
};
