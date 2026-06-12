import API_URL from './config/api.js';


const form = document.querySelector('.login-container');
const loginBtn = document.querySelector('.login-container__login-btn');
const checkbox = document.querySelector('.login-container__checkbox-container__checkbox');
const loginStatus = document.querySelector('.login-container__login-status');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    const userData = {
        email: formData.get('email'),
        password: formData.get('password'),
    };

    try {
        const response = await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                password: userData.password
            }),
        })

        const result = await response.json();

        if(!response.ok) {
            loginStatus.textContent = result.message;
            loginStatus.classList.add('login-error-status');
            return;
        }

        const storage = checkbox.checked ? localStorage : sessionStorage;

        storage.setItem('token', result.data.token);
        storage.setItem('currentUser', JSON.stringify(result.data.user));
        
        window.location.href = '../index.html';
    } catch (error) {
        console.error(error);

        loginStatus.textContent = 'Could not connect to the server';
        loginStatus.classList.add('login-error-status');
    }

    const userIndex = userList.findIndex(user => user.email === formData.get('email'));

    if (userIndex === -1 || userList[userIndex].password !== loginData.password) {
        loginStatus.classList.add('login-error-status');
    } else {
        checkbox.checked ? localStorage.setItem('currentUser', JSON.stringify(userList[userIndex])) : sessionStorage.setItem('currentUser', JSON.stringify(userList[userIndex]));

        window.location.href = '../index.html';
    }
});
