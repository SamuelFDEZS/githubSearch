import { GITHUB_TOKEN } from "./token.js";

window.onload = () => {
    searchInput.value = '';
}

const placeholder = document.querySelector('.reposearch-container__placeholder'),
    searchInput = document.querySelector('.reposearch-container__input'),
    searchButton = document.querySelector('.reposearch-container__button'),
    errorMessage = document.querySelector('.input-error'),
    searchModeContainer = document.querySelector('.reposearch-container__mode-container'),
    individualModes = Array.from(searchModeContainer.querySelectorAll('.reposearch-container__mode-container__modes__mode')),
    searchModes = document.querySelector('.reposearch-container__mode-container__modes'),
    repoSearchResults = document.querySelector('.reposearch-results'),
    headers = {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Accept": 'application/vnd.github.v3.json'
    },
    userRegex = /^[a-zA-Z0-9](?:[-:]?[a-zA-Z0-9]){0,38}$/
let isCorrectInput = null, searchMode = 'aproxsearch', url = null;

const handleInputValidation = () => {
    const value = searchInput.value;

    if (userRegex.test(value) || !value) {
        errorMessage.classList.remove('error-visible');
        isCorrectInput = true;
    } else {
        errorMessage.classList.add('error-visible');
        errorMessage.textContent = 'Invalid repository name: must be alphanumeric and meet GitHub rules.';
        isCorrectInput = false;
    }
}

const handleSearchEvents = (event) => {
    if (!searchInput.value) {
        placeholder.classList.toggle('up');
    }
}

const triggerSearchByEnter = (event) => {
    event.key === 'Enter' ? searchRepo() : null;
}

const handleSearchModeClick = () => {
    searchModes.classList.toggle('open');
}

const selectSearchMode = (event) => {
    searchMode = event.target.innerHTML.split(' ').join('').toLowerCase();
}

const calcTimeDifference = (item) => {
    const creationTime = new Date(item.created_at),
        currentTime = new Date(),
        timeOnMiliseconds = currentTime - creationTime,
        differenceInDays = timeOnMiliseconds / (1000 * 60 * 60 * 24),
        differenceInHours = timeOnMiliseconds / (1000 / 60 * 60);

    if (differenceInDays > 365) {
        return Math.floor(differenceInDays / 365);
    } else if (differenceInDays > 1) {
        return Math.floor(differenceInDays / 24);
    } else {
        return Math.floor(differenceInHours);
    }
}

const createRepoCards = (data) => {
    let fieldCount = 1;
    repoSearchResults.innerHTML = '';
    data.map((item) => {
        const time = calcTimeDifference(item);
        const repoInfo = [
            { title: 'Created', value: time },
            { title: 'Language', value: item.language },
            { title: 'Has Downloads', value: item.has_downloads },
            { title: 'Visibility', value: item.visibility },
            { title: 'Homepage', value: item.homepage ? 'Yes' : 'No' }
        ]
        const card = document.createElement('article'),
            img = document.createElement('img'),
            h2 = document.createElement('h2'),
            infoContainer = document.createElement('div');

        card.classList.add('reposearch-results__card');
        img.classList.add('reposearch-results__card__image');
        h2.classList.add('reposearch-results__card__title');
        infoContainer.classList.add('reposearch-results__card__info-container');

        repoInfo.map((field, index) => {
            const div = document.createElement('div');
            const h5 = document.createElement('h5');
            const span = document.createElement('span');

            div.classList.add('reposearch-results__card__info-container__pair-container');
            div.classList.add(`field${index}`);
            h5.classList.add('reposearch-results__card__info-container__pair-container__title');
            span.classList.add('reposearch-results__card__info-container__pair-container__value');

            h5.textContent = field.title;
            span.textContent = field.value;

            div.append(h5, span);
            infoContainer.appendChild(div);
        })

        img.src = item.owner.avatar_url + '&s=200';
        h2.textContent = item.full_name;

        card.append(img, h2, infoContainer);
        repoSearchResults.appendChild(card);
        fieldCount++;
    })
}

const searchRepo = async () => {
    repoSearchResults.innerHTML = '<span class="loader"></span>';
    const valueSearch = searchInput.value.split(':');
    url = searchMode === 'precisesearch'
        ? `https://api.github.com/repos/${valueSearch[0]}/${valueSearch[1]}`
        : `https://api.github.com/search/repositories?q=${valueSearch[0]}&per_page=30`;
    const response = await fetch(url, { headers: headers });
    const data = await response.json();
    createRepoCards(data.items);
}



const init = () => {
    searchInput.addEventListener('focus', handleSearchEvents);
    searchInput.addEventListener('blur', handleSearchEvents);
    searchInput.addEventListener('input', handleInputValidation);
    searchInput.addEventListener('keydown', triggerSearchByEnter);
    searchButton.addEventListener('click', searchRepo);
    searchModeContainer.addEventListener('click', handleSearchModeClick);
    individualModes.map((note) => {
        note.addEventListener('click', selectSearchMode)
    })
}
init();