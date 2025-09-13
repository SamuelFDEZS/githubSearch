const errorElement = document.querySelector('.signup-container__signup-status');
const form = document.querySelector('.signup-container');
let userExists = false;
let formData = null;
let users = [];

form.addEventListener('submit', (event) => {
    event.preventDefault();
    formData = new FormData(form);

    if (localStorage.length > 0) {
        users = JSON.parse(localStorage.getItem('users')) || [];

        if (users) {
            userExists = users.some(user => user.username === formData.get('username'));
            if (userExists) errorElement.classList.add('status-error');
        }
    }

    if (!userExists) {
        errorElement.classList.add('status-successfull');
        errorElement.classList.remove('status-error');

        const userData = Array.from(formData.entries()).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

        users.push(userData);

        localStorage.setItem('users', JSON.stringify(users));
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
    }

    errorElement.classList.remove('status-hidden');
});
