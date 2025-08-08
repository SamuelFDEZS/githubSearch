import { GITHUB_TOKEN } from './token.js';

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        window.scrollTo(0, 0);
    });
    searchInput.value = '';
});

const placeholder = document.querySelector('.search-container__placeholder');
const searchInput = document.querySelector('.search-container__input');
const searchButton = document.querySelector('.search-container__button');
const errorMessage = document.querySelector('.input-error');
const userPopup = document.querySelector('.popup-container');
const greyFilter = document.querySelector('.grey-filter');
const movePageContainer = document.querySelector('.move-page');
const movePageLeft = document.querySelector('.move-page__button--left');
const movePageRight = document.querySelector('.move-page__button--right');
const userRegex = /^[a-zA-Z0-9](?:-?[a-zA-Z0-9]){0,38}$/;
const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3.json'
};
const searchResultContainer = document.querySelector('.search-results');
let isCorrectInput = null;
let resultPage = 1;
let linkHeader = null;

const handleSearchEvents = (event) => {
    if (!searchInput.value) {
        placeholder.classList.toggle('up');
    }
};

const handleInputValidation = () => {
    const value = searchInput.value;

    if (userRegex.test(value) || !value) {
        errorMessage.classList.remove('error-visible');
        isCorrectInput = true;
    } else {
        errorMessage.classList.add('error-visible');
        errorMessage.textContent = 'Invalid username: must be alphanumeric and meet GitHub rules.';
        isCorrectInput = false;
    }
};

const getData = async (value, isSingleUser) => {
    try {
        const url = isSingleUser
            ? `http://localhost:3000/api/user?username=${value}`
            : `http://localhost:3000/api/search-users?q=${value}&per_page=40&page=${resultPage}`;

        let response = null;
        let data = null;

        response = await fetch(url);
        linkHeader = response.headers.get('Link');
        data = await response.json();
        console.log(data);
        if (!data && !data.items) {
            searchResultContainer.innerHTML = 'User not found';
        }
        if (isSingleUser) return data || null;
        return data.items.length ? data : null;
    } catch (error) {
        console.error('Error in search user', error);
    }
};

const searchUser = async () => {
    const value = searchInput.value;
    if (value && isCorrectInput) {
        let data = null;

        data = await getData(value);
        if (data) {
            createUserCards(data.items);
        }
    }
};

const triggerSearchByEnter = (event) => {
    searchInput.blur();
    if (event.key === 'Enter') searchUser();
};

const getTotalPages = (response) => {
    const linkHeader = response.headers.get('Link');
    const lastPageMatch = linkHeader ? linkHeader.match(/&page=(\d+)>; rel="last"/) : null;

    if (lastPageMatch) {
        return parseInt(lastPageMatch[1], 10);
    }

    return 1;
};

const getUserCount = async (url) => {
    try {
        let response = await fetch(url + '?per_page=30', { headers });
        const pageCount = await getTotalPages(response);
        let data = null;
        let dataLength = null;

        response = await fetch(url + `?page=${pageCount}`, { headers });
        data = await response.json();
        dataLength = data.length;

        if (pageCount !== 1) {
            const count = (30 * (pageCount - 1)) + dataLength;
            return count;
        }

        return dataLength;
    } catch (error) {
        console.error('Error on count:', error);
        return 0;
    }
};

const createUserCards = async (data) => {
    movePageContainer.classList.remove('visible');
    searchResultContainer.innerHTML = '<span class="loader"></span>';
    const userPromises = data.map(async (item) => {
        const [followersCount, reposCount, eventsCount] = await Promise.all([
            getUserCount(item.followers_url),
            getUserCount(item.repos_url),
            getUserCount(item.received_events_url)
        ]);
        const userContent = [
            { text: 'Followers', info: followersCount },
            { text: 'Repos', info: reposCount },
            { text: 'Events', info: eventsCount }
        ];

        const card = document.createElement('article');
        const img = document.createElement('img');
        const name = document.createElement('span');
        const infoContainer = document.createElement('div');

        infoContainer.classList.add('search-results__card__info-container');
        name.classList.add('search-results__card__username');
        img.classList.add('search-results__card__image');
        card.classList.add('search-results__card');

        img.src = item.avatar_url + '&s=400';
        img.alt = 'User image';

        name.textContent = item.login;

        userContent.forEach((element) => {
            const article = document.createElement('article');
            const countTitle = document.createElement('h5');
            const count = document.createElement('span');

            article.classList.add('search-results__card__info-container__item');
            count.classList.add('search-results__card__info-container__item__info');
            countTitle.classList.add('search-results__card__info-container__item__title');

            countTitle.textContent = element.text;
            count.textContent = element.info;

            article.append(countTitle, count);
            infoContainer.appendChild(article);
        });
        card.append(img, name, infoContainer);

        return card;
    });

    const userCards = await Promise.all(userPromises);

    searchResultContainer.innerHTML = '';
    searchResultContainer.append(...userCards);
    movePageContainer.classList.add('visible');
};

const createUserPopup = async (username) => {
    const data = await getData(username, true);

    if (!data) return;

    userPopup.innerHTML = `
        <span class="fa-solid fa-xmark popup-container__exit-popup"></span>
        <h2 class="popup-container__title">${username}</h2>
        <img src="${data.avatar_url + '&s=400'}"
            alt="User Avatar" class="popup-container__image">
        <div class="popup-container__info-container">
            <article class="popup-container__info-container__item-group">
                <p class="popup-container__info-container__item-group__item" id="followersCount">
                    <span class="fa-solid fa-user" style="color: #B197FC;"></span>
                    <span class="item-title">Follower Count: </span>
                    <span class="item-info">Loading...</span>
                </p>

                <p class="popup-container__info-container__item-group__item" id="reposCount">
                    <span class="fa-solid fa-database" style="color: #89ca6e;"></span>
                    <span class="item-title">Repo Count: </span>
                    <span class="item-info">Loading...</span>
                </p>
            </article>
            <article class="popup-container__info-container__item-group">
                <p class="popup-container__info-container__item-group__item" id="eventsCount">
                    <span class="fa-solid fa-calendar" style="color: #d58070;"></span>
                    <span class="item-title">Event Count: </span>
                    <span class="item-info">Loading...</span>
                </p>

                <p class="popup-container__info-container__item-group__item" id="subscriptionsCount">
                    <span class="fa-solid fa-circle-plus" style="color: #FFD43B;"></span>
                    <span class="item-title">Subscriptions Count: </span>
                    <span class="item-info">Loading...</span>
                </p>
            </article>
        </div>
        <div class="popup-container__button-group">
        <a href="${data.html_url}"class="popup-container__button-group__link"><button class="popup-container__button-group__link__button">Go to user profile</button></a>
        <a href="userRepos.html?username=${username}" class="popup-container__button-group__link"><button class="popup-container__button-group__link__button">Check user repos</button></a>
        </div>
    `;

    userPopup.classList.add('show-popup');
    greyFilter.classList.add('show-filter');

    const [followersCount, reposCount, eventsCount, subscriptionsCount] = await Promise.all([
        getUserCount(data.followers_url),
        getUserCount(data.repos_url),
        getUserCount(data.received_events_url),
        getUserCount(data.subscriptions_url)
    ]);

    document.querySelector('#followersCount span.item-info').textContent = followersCount;
    document.querySelector('#reposCount span.item-info').textContent = reposCount;
    document.querySelector('#eventsCount span.item-info').textContent = eventsCount;
    document.querySelector('#subscriptionsCount span.item-info').textContent = subscriptionsCount;

    const exitIcon = document.querySelector('.popup-container__exit-popup');
    if (!exitIcon.dataset.listener) {
        exitIcon.addEventListener('mouseover', () => exitIcon.classList.add('fa-beat-fade'));

        exitIcon.addEventListener('mouseout', () => exitIcon.classList.remove('fa-beat-fade'));

        exitIcon.addEventListener('click', () => {
            userPopup.classList.remove('show-popup');
            greyFilter.classList.remove('show-filter');
        });

        exitIcon.dataset.listener = 'true';
    }
};

const previousPage = () => {
    if (resultPage > 1) resultPage -= 1;
    if (resultPage === 1) movePageLeft.classList.remove('visible');
    if (!movePageRight.classList.contains('visible')) movePageRight.classList.add('visible');
    requestAnimationFrame(() => {
        window.scrollTo(0, 0);
    });
    searchUser();
};

const nextPage = () => {
    try {
        const isLastPage = !linkHeader || !linkHeader.includes('rel="next"');
        if (!isLastPage) {
            resultPage += 1;
            if (resultPage > 1) movePageLeft.classList.add('visible');
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
            });
            searchUser();
        } else {
            movePageRight.classList.remove('visible');
        }
    } catch (error) {
        console.error('Error in nextPage', error);
    }
};

const init = () => {
    searchInput.value = '';
    searchInput.addEventListener('focus', handleSearchEvents);
    searchInput.addEventListener('blur', handleSearchEvents);
    searchInput.addEventListener('input', handleInputValidation);
    searchInput.addEventListener('keydown', triggerSearchByEnter);
    searchButton.addEventListener('click', searchUser);
    searchResultContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.search-results__card');
        if (card) {
            const username = card.querySelector('.search-results__card__username').textContent;

            if (username) {
                createUserPopup(username);
            }
        }
    });
    movePageLeft.addEventListener('click', previousPage);
    movePageRight.addEventListener('click', nextPage);
};
init();
