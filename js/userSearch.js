import { GITHUB_TOKEN } from "./token.js";

const placeholder = document.querySelector('.search-container__placeholder'),
    searchInput = document.querySelector('.search-container__input'),
    searchButton = document.querySelector('.search-container__button'),
    errorMessage = document.querySelector('.input-error'),
    userRegex = /^[a-zA-Z0-9](?:-?[a-zA-Z0-9]){0,38}$/,
    headers = {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Accept": 'application/vnd.github.v3.json'
    },
    searchResultContainer = document.querySelector('.search-results');
let isCorrectInput = null;


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

const getData = async (value) => {
    let url = `https://api.github.com/search/users?q=${value}&per_page=40`, response = null, data = null;

    response = await fetch(url, { headers: headers });
    data = await response.json();
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


const init = () => {
    searchInput.addEventListener('focus', handleSearchEvents);
    searchInput.addEventListener('blur', handleSearchEvents);
    searchInput.addEventListener('input', handleInputValidation);
    searchInput.addEventListener('keydown', triggerSearchByEnter);
    searchButton.addEventListener('click', searchUser);
    nickContainer.classList.remove('login__element__hidden');
    nickContainer.innerHTML = currentUser.nickname;
}
init()