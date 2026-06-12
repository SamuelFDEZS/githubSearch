import API_URL from './config/api.js';

const profileUsernameContainer = document.querySelector('.configurations__menu__username-container__username');
const emailInput = document.querySelector('#configurations-email');
const usernameInput = document.querySelector('#configurations-username');
const changePassButton = document.querySelector('#configurations-pass-button')
const passwordInput = document.querySelector('#configurations-password');
const phoneInput = document.querySelector('#configurations-phone');
const seePasswordIcons = [...document.querySelectorAll('.configurations-password__icon')];
const confLogoutButton = document.querySelector('.configurations__menu__option');
const form = document.querySelector('.configurations__info__fields-container');
const discardButton = document.querySelectorAll('.configurations__info__fields-container__button-container__button')[0];
const operationStatus = document.querySelector('.operation-status__text');


profileUsernameContainer.innerHTML = currentUser.username;
emailInput.value = currentUser.email;
usernameInput.value = currentUser.username;
phoneInput.value = currentUser.phone;

discardButton.addEventListener('click', (event) => {
    event.preventDefault();
    emailInput.value = currentUser.email;
    usernameInput.value = currentUser.username;
    phoneInput.value = currentUser.phone;
});

const createPassPopup = (event) => {
    event.preventDefault();
    // Prevent duplicated popups
    if (document.querySelector('.pass-popup')) {
        return;
    }

    const passPopup = document.createElement('div');
    passPopup.classList.add('pass-popup');

    const passPopupContainer = document.createElement('div');
    passPopupContainer.classList.add('pass-popup__container');

    const passPopupForm = document.createElement('form');
    passPopupForm.classList.add('pass-popup__container__form');

    // ----------------------------------------------------------------------
    // Old password

    const passPopupGroupContainer = document.createElement('div');
    passPopupGroupContainer.classList.add(
        'pass-popup__container__form__group-container'
    );

    const passPopupFormLabel = document.createElement('label');
    passPopupFormLabel.classList.add(
        'pass-popup__container__form__group-container__label'
    );
    passPopupFormLabel.textContent = 'Old password';
    passPopupFormLabel.htmlFor = 'old-password';

    const passPopupFormInput = document.createElement('input');
    passPopupFormInput.classList.add('pass-popup__container__form__input');
    passPopupFormInput.id = 'old-password';
    passPopupFormInput.name = 'oldPassword';
    passPopupFormInput.type = 'password';
    passPopupFormInput.autocomplete = 'current-password';
    passPopupFormInput.required = true;

    // ----------------------------------------------------------------------
    // New password

    const passPopupGroupContainer2 = document.createElement('div');
    passPopupGroupContainer2.classList.add(
        'pass-popup__container__form__group-container'
    );

    const passPopupFormLabel2 = document.createElement('label');
    passPopupFormLabel2.classList.add(
        'pass-popup__container__form__group-container__label'
    );
    passPopupFormLabel2.textContent = 'New password';
    passPopupFormLabel2.htmlFor = 'new-password';

    const passPopupFormInput2 = document.createElement('input');
    passPopupFormInput2.classList.add('pass-popup__container__form__input');
    passPopupFormInput2.id = 'new-password';
    passPopupFormInput2.name = 'newPassword';
    passPopupFormInput2.type = 'password';
    passPopupFormInput2.autocomplete = 'new-password';
    passPopupFormInput2.required = true;

    // ----------------------------------------------------------------------
    // Confirm password

    const passPopupGroupContainer3 = document.createElement('div');
    passPopupGroupContainer3.classList.add(
        'pass-popup__container__form__group-container'
    );

    const passPopupFormLabel3 = document.createElement('label');
    passPopupFormLabel3.classList.add(
        'pass-popup__container__form__group-container__label'
    );
    passPopupFormLabel3.textContent = 'Confirm password';
    passPopupFormLabel3.htmlFor = 'confirm-password';

    const passPopupFormInput3 = document.createElement('input');
    passPopupFormInput3.classList.add('pass-popup__container__form__input');
    passPopupFormInput3.id = 'confirm-password';
    passPopupFormInput3.name = 'confirmPassword';
    passPopupFormInput3.type = 'password';
    passPopupFormInput3.autocomplete = 'new-password';
    passPopupFormInput3.required = true;

    // ----------------------------------------------------------------------
    // Buttons

    const passPopupFormButtonContainer = document.createElement('div');
    passPopupFormButtonContainer.classList.add(
        'pass-popup__container__form__button-container'
    );

    const cancelButton = document.createElement('button');
    cancelButton.classList.add(
        'pass-popup__container__form__button-container__button'
    );
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancel';

    const confirmButton = document.createElement('button');
    confirmButton.classList.add(
        'pass-popup__container__form__button-container__button'
    );
    confirmButton.type = 'submit';
    confirmButton.textContent = 'Confirm';

    // ----------------------------------------------------------------------
    // Exit icon

    const exitIcon = document.createElement('span');
    exitIcon.classList.add('fa-solid', 'fa-xmark');

    exitIcon.addEventListener('click', () => {
        passPopup.remove();
    });

    cancelButton.addEventListener('click', () => {
        passPopup.remove();
    });

    // ----------------------------------------------------------------------
    // Submit

    passPopupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(passPopupForm);

        const oldPassword = formData.get('oldPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            operationStatus.classList.add('error');
            operationStatus.classList.remove('success');
            operationStatus.textContent = 'Passwords do not match';
            return;
        }

        const passwordData = {
            oldPassword,
            newPassword,
            confirmPassword
        };

        try {
            const token =
                localStorage.getItem('token') ||
                sessionStorage.getItem('token');

            if (!token) {
                operationStatus.classList.add('error');
                operationStatus.classList.remove('success');
                operationStatus.textContent = 'You must log in again';
                return;
            }

            const response = await fetch(`${API_URL}/user/me/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(passwordData)
            });

            const result = await response.json();

            if (!response.ok) {
                operationStatus.classList.add('error');
                operationStatus.classList.remove('success');
                operationStatus.textContent = result.message;
                return;
            }

            operationStatus.classList.add('success');
            operationStatus.classList.remove('error');
            operationStatus.textContent = result.message;

            passPopup.remove();
        } catch (error) {
            console.error(error);

            operationStatus.classList.add('error');
            operationStatus.classList.remove('success');
            operationStatus.textContent = 'Could not connect to the server';
        }
    });

    // ----------------------------------------------------------------------
    // Operation status

    const operationStatus = document.createElement('p');
    operationStatus.classList.add(
        'pass-popup__container__form__operation-status'
    );

    // ----------------------------------------------------------------------
    // Append elements

    passPopupGroupContainer.append(
        passPopupFormLabel,
        passPopupFormInput
    );

    passPopupGroupContainer2.append(
        passPopupFormLabel2,
        passPopupFormInput2
    );

    passPopupGroupContainer3.append(
        passPopupFormLabel3,
        passPopupFormInput3
    );

    passPopupFormButtonContainer.append(
        cancelButton,
        confirmButton
    );

    passPopupForm.append(
        passPopupGroupContainer,
        passPopupGroupContainer2,
        passPopupGroupContainer3,
        operationStatus,
        passPopupFormButtonContainer
    );

    passPopupContainer.append(
        exitIcon,
        passPopupForm
    );

    passPopup.append(passPopupContainer);

    document.body.append(passPopup);
};

const handleSeePassword = () => {
    seePasswordIcons.forEach((icon) => {
        icon.classList.toggle('visible')
    })

    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };

    try {
        const response = fetch(`${API_URL}/user/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
                phone: userData.phone
            })
        })

        const result = await response.json();

        if (!response.ok) {
            operationStatus.classList.add('error');
            operationStatus.classList.remove('success');
            operationStatus.innerHTML = result.message;
            return;
        }

        setCurrentUser(userData);
        operationStatus.classList.add('success');
        operationStatus.classList.remove('error');
        operationStatus.innerHTML = 'Changes successfully saved';

    } catch (error) {
        console.error(error);

        operationStatus.classList.add('error');
        operationStatus.classList.remove('success');
        operationStatus.innerHTML = 'Could not connect to the server';
    }
});

confLogoutButton.addEventListener('click', handleUserLogout);
changePassButton.addEventListener('click', createPassPopup);
seePasswordIcons.forEach((icon) => {
    icon.addEventListener('click', handleSeePassword)
});
