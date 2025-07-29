import { GITHUB_TOKEN } from './token.js';

window.onload = () => {
    searchInput.value = '';
};

const placeholder = document.querySelector('.reposearch-container__placeholder');
const searchInput = document.querySelector('.reposearch-container__input');
const searchButton = document.querySelector('.reposearch-container__button');
const errorMessage = document.querySelector('.input-error');
const searchModeContainer = document.querySelector('.reposearch-container__mode-container');
const searchModeContainerTitle = searchModeContainer.querySelector('.reposearch-container__mode-container__title');
const individualModes = Array.from(searchModeContainer.querySelectorAll('.reposearch-container__mode-container__modes__mode'));
const searchModes = document.querySelector('.reposearch-container__mode-container__modes');
const repoSearchResults = document.querySelector('.reposearch-results');
const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3.json'
};
const userRegex = /^[a-zA-Z0-9](?:[-:]?[a-zA-Z0-9]){0,38}$/;
let isCorrectInput = null; let searchMode = 'aproxsearch'; let url = null;

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
};

const handleSearchEvents = (event) => {
    if (!searchInput.value) {
        placeholder.classList.toggle('up');
    }
};

const triggerSearchByEnter = (event) => {
    event.key === 'Enter' ? searchRepo() : null;
};

const handleSearchModeClick = () => {
    searchModes.classList.toggle('open');
};

const selectSearchMode = (event) => {
    searchMode = event.target.innerHTML.split(' ').join('').toLowerCase();
    searchModeContainerTitle.textContent = event.target.textContent;
};

const calcTimeDifference = (item) => {
    const creationTime = new Date(item.created_at);
    const currentTime = new Date();
    const timeOnMiliseconds = currentTime - creationTime;
    const differenceInDays = timeOnMiliseconds / (1000 * 60 * 60 * 24);
    const differenceInHours = timeOnMiliseconds / (1000 * 60 * 60);

    if (differenceInDays > 365) {
        return Math.floor(differenceInDays / 365) + ' Yrs';
    } else if (differenceInDays > 1) {
        return Math.floor(differenceInDays) + ' Days';
    } else {
        return Math.floor(differenceInHours) + ' Hrs';
    }
};

const fieldToCapital = (field) => {
    return field.toString()[0].toUpperCase() +
        field.toString().slice(1);
};

const createRepoCards = (data) => {
    repoSearchResults.innerHTML = '';
    data.forEach((item) => {
        const time = calcTimeDifference(item);
        const repoInfo = [
            { title: 'Created', value: time },
            { title: 'Language', value: item.language },
            { title: 'Has Downloads', value: fieldToCapital(item.has_downloads) },
            { title: 'Visibility', value: fieldToCapital(item.visibility) },
            { title: 'Homepage', value: item.homepage ? 'Yes' : 'No' }
        ];
        const card = document.createElement('article');
        const img = document.createElement('img');
        const h2 = document.createElement('h2');
        const infoContainer = document.createElement('div');

        card.classList.add('reposearch-results__card');
        img.classList.add('reposearch-results__card__image');
        h2.classList.add('reposearch-results__card__title');
        infoContainer.classList.add('reposearch-results__card__info-container');

        repoInfo.forEach((field, index) => {
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
        });

        img.src = item.owner.avatar_url + '&s=200';
        h2.textContent = item.full_name;

        card.append(img, h2, infoContainer);
        repoSearchResults.appendChild(card);
    });
};

const searchRepo = async () => {
    if (isCorrectInput) {
        repoSearchResults.innerHTML = '<span class="loader"></span>';
        const valueSearch = searchInput.value.split(':');
        url = searchMode === 'precisesearch'
            ? `https://api.github.com/repos/${valueSearch[0]}/${valueSearch[1]}`
            : `https://api.github.com/search/repositories?q=${valueSearch[0]}&per_page=30`;
        try {
            const response = await fetch(url, { headers });

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const data = await response.json();
            searchMode === 'precisesearch' ? createRepoCards([data]) : createRepoCards(data.items);
        } catch (error) {
            console.error('Error fetching: ', error);
            repoSearchResults.innerHTML = '<p>Error loading the results</p>';
        }
    }
};

const init = () => {
    searchInput.addEventListener('focus', handleSearchEvents);
    searchInput.addEventListener('blur', handleSearchEvents);
    searchInput.addEventListener('input', handleInputValidation);
    searchInput.addEventListener('keydown', triggerSearchByEnter);
    searchButton.addEventListener('click', searchRepo);
    searchModeContainer.addEventListener('click', handleSearchModeClick);
    individualModes.forEach((note) => {
        note.addEventListener('click', selectSearchMode);
    });
};
init();
