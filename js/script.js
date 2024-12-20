import { GITHUB_TOKEN } from "./token.js";

const searchBox = document.querySelector('#search-box');
const mainContainer = document.querySelector('.main');
const headers = {
    "Authorization": `Bearer ${GITHUB_TOKEN}`,
    "Accept": 'application/vnd.github.v3.json'
}



const getData = async (url) => {
    let response = null, data = null;
    try {
        response = await fetch(url, {
            headers: headers
        })

        if (response.ok) {
            data = await response.json();
            console.log(data);
            return data.items.length ? data : null;
        }

    } catch (error) {
        console.log(error)
    }
}

const search = async (textSearch) => {
    let url = `https://api.github.com/search/users?q=${textSearch}`;
    let dataResponse = await getData(url);
    return dataResponse;
}

const createCard = (data) => {
}

const init = async () => {
    let timer;
    let searchText = "";
    let data = [];
    searchBox.addEventListener('input', () => {
        clearTimeout(timer);
        searchText = searchBox.value;
        if (searchText.length) {

            timer = setTimeout(async () => {
                data = await search(searchText);

                if (data) {
                    createCard(data);
                    // Aquí va la función para crear los elementos para mostrar la respuesta del servidor
                }
            }, 1000);
        }

    });
}
init();