const API_BASE_URL = 'https://api.freeapi.app/api/v1/public/books';
const RESULTS_PER_PAGE = 12;

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
const firstPageBtn = document.getElementById('first-page');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const lastPageBtn = document.getElementById('last-page');
const pageInfo = document.getElementById('page-info');

let currentQuery = '';
let currentPage = 1;
let totalPages = 1;

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    fetchBooks();
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage -= 1;
        fetchBooks();
    }
});

nextPageBtn.addEventListener('click', () => {
    currentPage += 1;
    fetchBooks();
});

firstPageBtn.addEventListener('click', () => {
    if (currentPage !== 1) {
        currentPage = 1;
        fetchBooks();
    }
});

lastPageBtn.addEventListener('click', () => {
    if (currentPage !== totalPages) {
        currentPage = totalPages;
        fetchBooks();
    }
});

async function fetchBooks() {
    const url = new URL(API_BASE_URL);
    url.searchParams.set('page', currentPage);
    url.searchParams.set('limit', RESULTS_PER_PAGE);
    if (currentQuery) {
        url.searchParams.set('query', currentQuery);
    }

    const response = await fetch(url);
    const payload = await response.json();
    const books = payload?.data?.data ?? [];

    renderBooks(books);
    updatePagination(payload?.data);
}

function renderBooks(books) {
    resultsContainer.innerHTML = '';

    for (const book of books) {
        resultsContainer.appendChild(createBookCard(book));
    }
}

function createBookCard(book) {
    const info = book.volumeInfo ?? {};
    const title = info.title ?? 'Untitled';
    const authors = info.authors?.join(', ') ?? 'Unknown author';
    const thumbnail = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;

    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';

    col.innerHTML = `
        <div class="card h-100">
            ${thumbnail ? `<img src="${thumbnail}" class="card-img-top" alt="Cover of ${title}">` : ''}
            <div class="card-body">
                <h3 class="h6 card-title">${title}</h3>
                <p class="card-subtitle text-muted small">${authors}</p>
            </div>
        </div>
    `;

    return col;
}

function updatePagination(data) {
    if (!data) {
        pageInfo.textContent = '';
        firstPageBtn.disabled = true;
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        lastPageBtn.disabled = true;
        return;
    }

    totalPages = data.totalPages;
    pageInfo.textContent = `Page ${data.page} of ${data.totalPages}`;
    firstPageBtn.disabled = !data.previousPage;
    prevPageBtn.disabled = !data.previousPage;
    nextPageBtn.disabled = !data.nextPage;
    lastPageBtn.disabled = !data.nextPage;
}

fetchBooks();

