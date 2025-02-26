window.onload = () => {
    init();
}
const leftArrow = document.querySelector('.back-btn'), userTitle = document.querySelector('.username'), reposSection = document.querySelector('.repos');

let username = null;

const getUsername = () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    return username;
}

const changeUserTitle = (username) => {
    userTitle.innerHTML = username;
}

const getUserRepos = async (username) => {
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    const data = await response.json();
    return data;
}

const getRepoName = (event) => {
    const repoCard = event.target.closest('.repos__card'),
        repoName = repoCard.querySelector('.repos__card__info-container__repo-name');

    return repoName.textContent;
}
const getSingleRepo = async (repoName) => {
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);

    const data = await response.json();
    return data;
}
const createReposPopup = async (repoName) => {
    const repoInfo = await getSingleRepo(repoName);
}

const buildRows = (repoList) => {
    repoList.map((repo) => {
        const repoContent = [
            { text: "Visibility", info: repo.visibility == 'public' ? 'Public' : 'Private' },
            { text: "Language", info: repo.language || 'Unknown' },
            { text: "Downloads", info: repo.has_downloads ? 'Yes' : 'No' },
            { text: "Github_Pages", info: repo.has_pages ? 'Yes' : 'No' }
        ];
        const article = document.createElement('article'),
            img = document.createElement('img'),
            h3 = document.createElement('h3'),
            div1 = document.createElement('div'),
            div2 = document.createElement('div'),
            button = document.createElement('button');

        article.classList.add("repos__card");
        img.classList.add("repos__card__image");
        div1.classList.add("repos__card__info-container");
        div2.classList.add("repos__card__info-container__info-group");
        h3.classList.add("repos__card__info-container__repo-name");
        button.classList.add("repos__card__button");

        button.innerHTML = '<span class="fa-solid fa-arrow-up-right-from-square repos__card__button__icon"></span>'
        div1.appendChild(h3);
        repoContent.forEach((item) => {
            const h5 = document.createElement('h5');
            const div3 = document.createElement('div');
            const span = document.createElement('span');

            div3.classList.add("repos__card__info-container__info-group__column");
            h5.classList.add("repos__card__info-container__info-group__column__title");
            span.classList.add("repos__card__info-container__info-group__column__content");

            h5.textContent = item.text;
            span.textContent = item.info;

            div3.append(h5, span);
            div2.appendChild(div3);

        })

        div1.appendChild(div2);
        h3.textContent = repo.name;
        img.src = repo.owner.avatar_url + '&s=150';
        img.alt = 'User image';

        button.addEventListener('click', (event) => {
            const repoName = getRepoName(event);
            location.href = `https://github.com/${username}/${repoName}`;
        })

        article.addEventListener('click', (event) => {
            const repoCard = event.target.closest('.repos__card'),
                repoName = repoCard.querySelector('.repos__card__info-container__repo-name');

            // Aquí llamamos a la función que crea el popup
            createReposPopup(repoName.textContent);
        })

        article.append(img, div1, button);
        reposSection.appendChild(article);
    })
}
const init = async () => {
    leftArrow.addEventListener('mouseover', (event) => {
        event.target.classList.add('fa-beat-fade');
    });

    leftArrow.addEventListener('mouseout', (event) => {
        event.target.classList.remove('fa-beat-fade');
    });

    leftArrow.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        }
    });

    username = getUsername()
    let repoList = null;
    // Check if parameter exists
    if (!username) {
        document.body.innerHTML = "<h2>Error: No user specified</h2>";
        return;
    }
    changeUserTitle(username);
    repoList = await getUserRepos(username);
    buildRows(repoList);
}