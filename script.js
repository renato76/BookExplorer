const API_BASE_URL = 'https://api.freeapi.app/api/v1/public/books';
const RESULTS_PER_PAGE = 12;

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    fetchBooks(searchInput.value.trim());
});

async function fetchBooks(query) {
    const url = new URL(API_BASE_URL);
    url.searchParams.set('limit', RESULTS_PER_PAGE);
    if (query) {
        url.searchParams.set('query', query);
    }

    const response = await fetch(url);
    const payload = await response.json();
    const books = payload?.data?.data ?? [];

    renderBooks(books);
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

fetchBooks();

