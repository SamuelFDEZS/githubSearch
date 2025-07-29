const form = document.querySelector('.login-container');
const loginBtn = document.querySelector('.login-container__login-btn');
let formData = null;
const checkbox = document.querySelector('.login-container__checkbox-container__checkbox');
const loginStatus = document.querySelector('.login-container__login-status');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const userList = JSON.parse(localStorage.getItem('users'));
    formData = new FormData(form);
    const loginData = Array.from(formData.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});

    const userIndex = userList.findIndex(user => user.username === formData.get('username'));

    if (userIndex === -1 || userList[userIndex].password !== loginData.password) {
        loginStatus.classList.add('login-error-status');
    } else {
        checkbox.checked ? localStorage.setItem('currentUser', JSON.stringify(userList[userIndex])) : sessionStorage.setItem('currentUser', JSON.stringify(userList[userIndex]));

        window.location.href = 'home.html';
    }
});
