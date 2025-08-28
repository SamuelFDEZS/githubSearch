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

const placeholder = document.querySelector('.reposearch-container__placeholder');
const searchInput = document.querySelector('.reposearch-container__input');
const searchButton = document.querySelector('.reposearch-container__button');
const errorMessage = document.querySelector('.input-error');
const searchModeContainer = document.querySelector('.reposearch-container__mode-container');
const repoPopupContainer = document.querySelector('.repo-popup');
const searchModeContainerTitle = searchModeContainer.querySelector('.reposearch-container__mode-container__title');
const individualModes = Array.from(searchModeContainer.querySelectorAll('.reposearch-container__mode-container__modes__mode'));
const movePageContainer = document.querySelector('.move-page');
const movePageLeft = document.querySelector('.move-page__button--left');
const movePageRight = document.querySelector('.move-page__button--right');
const searchModes = document.querySelector('.reposearch-container__mode-container__modes');
const greyFilter = document.querySelector('.grey-filter');
const repoSearchResults = document.querySelector('.reposearch-results');
const repoRegex = /^[a-zA-Z0-9](?:[-/]?[a-zA-Z0-9]){0,38}$/;
let isCorrectInput = null;
let searchMode = 'approxsearch';
let resultPage = 1;
let linkHeader = null;
let url = null;

const handleInputValidation = () => {
    const value = searchInput.value;

    if (repoRegex.test(value) || !value) {
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
    if (event.key === 'Enter') {
        searchInput.blur();
        searchRepo();
    }
};

const handleSearchModeClick = () => {
    searchModes.classList.toggle('open');
};

const selectSearchMode = (event) => {
    searchMode = event.target.innerHTML.split(' ').join('').toLowerCase();
    searchModeContainerTitle.textContent = event.target.textContent;
};

const formatDate = (days, hours) => {
    if (days > 365) {
        return Math.floor(days / 365) + ' Yrs';
    } else if (days > 1) {
        return Math.floor(days) + ' Days';
    } else {
        return Math.floor(hours) + ' Hrs';
    }
};

const calcTimeDifference = (item) => {
    const creationTime = new Date(item.created_at);
    const currentTime = new Date();
    const timeInMiliseconds = currentTime - creationTime;
    const differenceInDays = timeInMiliseconds / (1000 * 60 * 60 * 24);
    const differenceInHours = timeInMiliseconds / (1000 * 60 * 60);
    return formatDate(differenceInDays, differenceInHours);
};

const fieldToCapital = (field) => {
    return field.toString()[0].toUpperCase() +
        field.toString().slice(1);
};

const getData = async (searchValue, repoName, isSingleRepo) => {
    if (isSingleRepo) {
    // repoName = 'owner/repo'
        const [owner, repo] = repoName.split('/');
        url = `http://localhost:3000/api/repo?owner=${owner}&repo=${repo}`;
    } else if (searchMode === 'precisesearch') {
        if (searchValue.length !== 2) {
            repoSearchResults.innerHTML = '<span class="reposearch-results__incorrect-format">Incorrect format</span>';
            return;
        }
        url = `http://localhost:3000/api/repo?owner=${searchValue[0]}&repo=${searchValue[1]}`;
    } else {
        url = `http://localhost:3000/api/search-repos?q=${searchValue[0]}&per_page=30&page=${resultPage}`;
    }

    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        linkHeader = response.headers.get('Link');
        if (isSingleRepo) return data;
        return (data && data.items) || [data];
    } catch (error) {
        console.error('Error fetching: ', error);
        repoSearchResults.innerHTML = '<span class="reposearch-results__incorrect-format">Error loading the results</span>';
    }
};

const createRepoCards = (data) => {
    movePageContainer.classList.remove('visible');
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

        card.addEventListener('click', () => {
            createRepoPopUp(item.full_name);
        });
        card.append(img, h2, infoContainer);
        repoSearchResults.appendChild(card);
        movePageContainer.classList.add('visible');
    });
};

const searchRepo = async () => {
    const searchValue = searchInput.value.split('/');
    if (searchInput.value && isCorrectInput) {
        repoSearchResults.innerHTML = '<span class="loader"></span>';
        const data = await getData(searchValue);
        if (data) {
            createRepoCards(data);
        }
    }
};

const createRepoPopUp = async (repoName) => {
    const singleRepoData = await getData(null, repoName, true);
    const updatedDate = new Date(singleRepoData.updated_at);
    const now = new Date();

    const diffMs = now - updatedDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const diffHours = diffMs / (1000 * 60 * 60);

    const lastUpdated = formatDate(diffDays, diffHours);

    repoPopupContainer.innerHTML = `
    <span class="fa-solid fa-xmark popup-container__exit-popup"></span>
    <h3 class="repo-popup__title">${singleRepoData.full_name}</h3>
    <p class="repo-popup__description">${singleRepoData.description || 'No description'}</p>
    <h4 class="repo-popup__info-title">Detailed info</h4>
    <div class="repo-popup__repoinfo-container">
        <article class="repo-popup__repoinfo-container__data repo-popup__repoinfo-container__data--left">
            <div class="repo-popup__repoinfo-container__data__field">
                <span class="fa-solid fa-star repo-popup__repoinfo-container__data__field__icon" style="color: #FFD43B;"></span>
                <p class="repo-popup__repoinfo-container__data__field__text">
                    <span>Stars:</span> ${singleRepoData.stargazers_count}
                </p>
            </div>
            <div class="repo-popup__repoinfo-container__data__field">
                <span class="fa-solid fa-utensils repo-popup__repoinfo-container__data__field__icon" style="color: #bababa;"></span>
                <p class="repo-popup__repoinfo-container__data__field__text">
                    <span>Forks:</span> ${singleRepoData.forks_count}
                </p>
            </div>
            <div class="repo-popup__repoinfo-container__data__field">
                <span class="fa-solid fa-screwdriver-wrench repo-popup__repoinfo-container__data__field__icon" style="color: #7d6612;"></span>
                <p class="repo-popup__repoinfo-container__data__field__text">
                    <span>Language:</span> ${fieldToCapital(singleRepoData.language || 'not specified')}
                </p>
            </div>
            <div class="repo-popup__repoinfo-container__data__field">
                <span class="fa-solid fa-user-plus repo-popup__repoinfo-container__data__field__icon" style="color: #74C0FC;"></span>
                <p class="repo-popup__repoinfo-container__data__field__text">
                    <span>Subscribers count:</span> ${singleRepoData.subscribers_count}
                </p>
            </div>
            </article>
            <article class="repo-popup__repoinfo-container__data repo-popup__repoinfo-container__data--right">
            <div class="repo-popup__repoinfo-container__data__field">

                <span class="fa-solid fa-calendar-days repo-popup__repoinfo-container__data__field__icon" style="color: #fec64d;"></span>
                <p class="repo-popup__repoinfo-container__data__field__text">
                    <span>Last Updated:</span> ${lastUpdated}
                </p>
            </div>
            <div class="repo-popup__repoinfo-container__data__field">
                <span class="fa-solid fa-bug repo-popup__repoinfo-container__data__field__icon" style="color: #d50116;"></span>
                <p class="repo-popup__repoinfo-container__data__field__text">
                    <span>Open issues:</span> ${singleRepoData.open_issues_count}
                </p>
            </div>
            <div class="repo-popup__repoinfo-container__data__field">
                <span class="fa-solid fa-clipboard-list repo-popup__repoinfo-container__data__field__icon" style="color: #f6f4fa;"></span>
                <p class="repo-popup__repoinfo-container__data__field__text">
                    <span>License:</span> ${singleRepoData.license?.name || 'No license'}
                </p>
            </div>
            <div class="repo-popup__repoinfo-container__data__field">
                <span class="fa-solid fa-code-branch repo-popup__repoinfo-container__data__field__icon" style="color: #000000;"></span>
                <p class="repo-popup__repoinfo-container__data__field__text">
                    <span>Main branch:</span> ${singleRepoData.default_branch}
                </p>
            </div>
        </article>
    </div>

    <div class="repo-popup__buttons-container">
        <a href=${singleRepoData.html_url} target="_blank" class="repo-popup__buttons-container__button">Open Repo</a>
        ${singleRepoData.homepage ? `<a href="${singleRepoData.homepage}" target="_blank" class="repo-popup__buttons-container__button">Open Homepage</a>` : ''}
    </div>
    `;

    repoPopupContainer.classList.add('show-popup');
    greyFilter.classList.add('show-filter');

    const exitIcon = document.querySelector('.popup-container__exit-popup');

    exitIcon.addEventListener('mouseover', () => exitIcon.classList.add('fa-beat-fade'));

    exitIcon.addEventListener('mouseout', () => exitIcon.classList.remove('fa-beat-fade'));

    exitIcon.addEventListener('click', () => {
        repoPopupContainer.classList.remove('show-popup');
        greyFilter.classList.remove('show-filter');
    });
};

const previousPage = () => {
    if (resultPage > 1) resultPage -= 1;
    if (resultPage === 1) movePageLeft.classList.remove('visible');
    if (!movePageRight.classList.contains('visible')) movePageRight.classList.add('visible');
    requestAnimationFrame(() => {
        window.scrollTo(0, 0);
    });
    searchRepo();
};

const nextPage = () => {
    const isLastPage = !linkHeader || !linkHeader.includes('rel="next"');
    if (!isLastPage) {
        resultPage += 1;
        if (resultPage > 1) movePageLeft.classList.add('visible');
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
        });
        searchRepo();
    } else {
        movePageRight.classList.remove('visible');
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
    movePageLeft.addEventListener('click', previousPage);
    movePageRight.addEventListener('click', nextPage);
};
init();
