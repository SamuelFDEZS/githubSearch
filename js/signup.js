import API_URL from './config/api.js';

const errorElement = document.querySelector('.signup-container__signup-status');

const form = document.querySelector('.signup-container');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorElement.classList.remove(
        'status-error',
        'status-successfull'
    );


    const formData = new FormData(form);

    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
    };

    try {

        const response = await fetch(`${API_URL}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (!response.ok) {
            errorElement.textContent = result.message;
            errorElement.classList.remove('status-successfull');
            errorElement.classList.add('status-error');
            errorElement.classList.remove('status-hidden');
            return;
        }
        
        errorElement.textContent = result.message;
        errorElement.classList.add('status-successfull');
        errorElement.classList.remove('status-hidden');
        
        setTimeout(() => {
            window.location.href = '../pages/login.html';
        }, 3000);
    } catch (error) {
        console.error(error);

        errorElement.innerHTML = 'Could not connect to the server';
        errorElement.classList.remove('status-hidden');
        errorElement.classList.add('status-error');
    }
});
