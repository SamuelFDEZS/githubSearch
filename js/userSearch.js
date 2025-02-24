import { GITHUB_TOKEN } from "./token.js";

const placeholder = document.querySelector('.search-container__placeholder'),
    searchInput = document.querySelector('.search-container__input'),
    searchButton = document.querySelector('.search-container__button'),
    errorMessage = document.querySelector('.input-error'),
    userPopup = document.querySelector('.popup-container'),
    greyFilter = document.querySelector('.grey-filter'),
    userRegex = /^[a-zA-Z0-9](?:-?[a-zA-Z0-9]){0,38}$/,
    headers = {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Accept": 'application/vnd.github.v3.json'
    },
    searchResultContainer = document.querySelector('.search-results');
let isCorrectInput = null, exitIcon = null;


const handleSearchEvents = (event) => {
    if (!searchInput.value) {
        placeholder.classList.toggle('up');
    }
}

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
}

const getData = async (value, isSingleUser) => {
    let url = isSingleUser ? `https://api.github.com/users/${value}` : `https://api.github.com/search/users?q=${value}&per_page=40`, response = null, data = null;

    response = await fetch(url, { headers: headers });
    data = await response.json();
    if (isSingleUser) return data || null;
    return data.items.length ? data : null;
}

const searchUser = async () => {
    if (isCorrectInput) {
        let value = searchInput.value, data = null;
        data = await getData(value);
        if (data) {
            console.log(data);
            createUserCards(data.items);
        }
    }
}

const triggerSearchByEnter = (event) => {
    event.key === 'Enter' ? searchUser() : null;
}

const getTotalPages = (response) => {
    const linkHeader = response.headers.get('Link');
    const lastPageMatch = linkHeader ? linkHeader.match(/&page=(\d+)>; rel="last"/) : null;

    if (lastPageMatch) {
        return parseInt(lastPageMatch[1], 10);
    }

    return 1;
}

const getUserCount = async (url) => {
    try {
        let response = await fetch(url + '?per_page=30', { headers: headers }),
            pageCount = await getTotalPages(response),
            data = null,
            dataLength = null;

        response = await fetch(url + `?page=${pageCount}`, { headers: headers })
        data = await response.json();
        dataLength = data.length;

        if (pageCount !== 1) {

            let count = (30 * (pageCount - 1)) + dataLength;
            return count;
        }

        return dataLength;
    } catch (error) {
        console.error('Error on count:', error);
        return 0;
    }
}

const createUserCards = async (data) => {
    searchResultContainer.innerHTML = '<span class="loader"></span>';
    const userPromises = data.map(async (item) => {
        const [followersCount, reposCount, eventsCount] = await Promise.all([
            getUserCount(item.followers_url),
            getUserCount(item.repos_url),
            getUserCount(item.received_events_url)
        ]);
        const userContent = [
            { text: "Followers", info: followersCount },
            { text: "Repos", info: reposCount },
            { text: "Events", info: eventsCount }
        ];

        const card = document.createElement("article"),
            img = document.createElement("img"),
            name = document.createElement("span"),
            infoContainer = document.createElement("div");

        infoContainer.classList.add("search-results__card__info-container");
        name.classList.add("search-results__card__username");
        img.classList.add("search-results__card__image");
        card.classList.add("search-results__card");

        img.src = item.avatar_url + '&s=400';
        img.alt = 'User image';

        name.textContent = item.login;

        userContent.forEach((element) => {
            const article = document.createElement("article"),
                countTitle = document.createElement("h5"),
                count = document.createElement("span");

            article.classList.add("search-results__card__info-container__item");
            count.classList.add("search-results__card__info-container__item__info");
            countTitle.classList.add("search-results__card__info-container__item__title");

            countTitle.textContent = element.text;
            count.textContent = element.info;

            article.appendChild(countTitle);
            article.appendChild(count);
            infoContainer.appendChild(article);
        });

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(infoContainer);

        return card;
    });

    const userCards = await Promise.all(userPromises);

    searchResultContainer.innerHTML = '';
    searchResultContainer.append(...userCards);
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
                <h5 class="popup-container__info-container__item-group__title">Followers</h5>
                <span class="popup-container__info-container__item-group__item" id="followersCount">Loading...</span>
            </article>
            <article class="popup-container__info-container__item-group">
                <h5 class="popup-container__info-container__item-group__title">Repos</h5>
                <span class="popup-container__info-container__item-group__item" id="reposCount">Loading...</span>
            </article>
            <article class="popup-container__info-container__item-group">
                <h5 class="popup-container__info-container__item-group__title">Events</h5>
                <span class="popup-container__info-container__item-group__item" id="eventsCount">Loading...</span>
            </article>
            <article class="popup-container__info-container__item-group">
                <h5 class="popup-container__info-container__item-group__title">Subscriptions</h5>
                <span class="popup-container__info-container__item-group__item" id="subscriptionsCount">Loading...</span>
            </article>
        </div>
        <div class="popup-container__button-group">
        <a href="${data.html_url}"class="popup-container__button-group__link"><button class="popup-container__button-group__link__button">Go to user profile</button></a>
        <a href="#" class="popup-container__button-group__link"><button class="popup-container__button-group__link__button">Check user repos</button></a>
        </div>
    `;

    userPopup.classList.add('show-popup');
    greyFilter.classList.add('show-filter');

    const [followersCount, reposCount, eventsCount, subscriptionsCount] = await Promise.all([
        getUserCount(data.followers_url),
        getUserCount(data.repos_url),
        getUserCount(data.received_events_url),
        getUserCount(data.subscriptions_url),
    ]);

    document.getElementById('followersCount').textContent = followersCount;
    document.getElementById('reposCount').textContent = reposCount;
    document.getElementById('eventsCount').textContent = eventsCount;
    document.getElementById('subscriptionsCount').textContent = subscriptionsCount;

    const exitIcon = document.querySelector('.popup-container__exit-popup');
    if (!exitIcon.dataset.listener) {
        exitIcon.addEventListener('mouseover', () => exitIcon.classList.add('fa-beat-fade'));

        exitIcon.addEventListener('mouseout', () => exitIcon.classList.remove('fa-beat-fade'));

        exitIcon.addEventListener('click', () => {
            userPopup.classList.remove('show-popup');
            greyFilter.classList.remove('show-filter');
        });

        exitIcon.dataset.listener = "true";
    }
};



const init = () => {
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
            // En caso de funcionar aquí llamamos a la función
        }
    });
    nickContainer.classList.remove('login__element__hidden');
    nickContainer.innerHTML = currentUser.nickname;
}
init()
