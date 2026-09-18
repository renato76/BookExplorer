const API_BASE_URL = 'https://api.freeapi.app/api/v1/public/books';
const RESULTS_PER_PAGE = 12;

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resetButton = document.getElementById('reset-search');
const searchStatus = document.getElementById('search-status');
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

    const trimmedValue = searchInput.value.trim();

    // reject whitespace-only input, which HTML's "required" attribute alone won't catch
    if (!trimmedValue) {
        searchInput.classList.add('is-invalid');
        return;
    }

    searchInput.classList.remove('is-invalid');
    currentQuery = trimmedValue;
    currentPage = 1;
    fetchBooks();
});

searchInput.addEventListener('input', () => {
    searchInput.classList.remove('is-invalid');
});

resetButton.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.classList.remove('is-invalid');
    currentQuery = '';
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
    setStatus('Loading books…');
    renderSkeletons();

    const url = new URL(API_BASE_URL);
    url.searchParams.set('page', currentPage);
    url.searchParams.set('limit', RESULTS_PER_PAGE);
    if (currentQuery) {
        url.searchParams.set('query', currentQuery);
    }

    try {
        const response = await fetch(url);
        const payload = await response.json();
        const books = payload?.data?.data ?? [];

        renderBooks(books);
        updatePagination(payload?.data);

        setStatus(books.length === 0 ? 'No books found. Try a different search.' : '');
    } catch (error) {
        console.error('Failed to fetch books:', error);
        setStatus('Something went wrong while fetching books. Please try again.');
    }
}

function renderBooks(books) {
    resultsContainer.innerHTML = '';

    for (const book of books) {
        resultsContainer.appendChild(createBookCard(book));
    }
}

function renderSkeletons() {
    resultsContainer.innerHTML = '';

    for (let i = 0; i < RESULTS_PER_PAGE; i += 1) {
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';
        col.innerHTML = `
            <div class="card h-100 shadow-sm" aria-hidden="true">
                <div class="card-img-top book-thumbnail skeleton"></div>
                <div class="card-body d-flex flex-column">
                    <div class="skeleton skeleton-text w-75 mb-2"></div>
                    <div class="skeleton skeleton-text w-50 mb-2"></div>
                    <div class="flex-grow-1 mb-3">
                        <div class="skeleton skeleton-text w-100 mb-1"></div>
                        <div class="skeleton skeleton-text w-100 mb-1"></div>
                        <div class="skeleton skeleton-text w-75"></div>
                    </div>
                    <div class="skeleton skeleton-text w-50 mb-1"></div>
                    <div class="skeleton skeleton-text w-50 mb-3"></div>
                    <div class="skeleton skeleton-btn mt-auto"></div>
                </div>
            </div>
        `;
        resultsContainer.appendChild(col);
    }
}

function createBookCard(book) {
    const info = book.volumeInfo ?? {};
    const title = info.title ?? 'Untitled';
    const authors = info.authors?.join(', ') ?? 'Unknown author';
    const description = info.description ?? 'No description available.';
    const thumbnail = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
    const publishedDate = info.publishedDate ?? 'Unknown';
    const rating = info.averageRating;
    const previewLink = info.previewLink;

    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';

    col.innerHTML = `
        <div class="card h-100 shadow-sm${previewLink ? ' card-clickable' : ''}"${previewLink ? ' role="link" tabindex="0"' : ''}>
            ${thumbnail
                ? `<img src="${thumbnail}" class="card-img-top book-thumbnail" alt="Cover of ${escapeHtml(title)}">`
                : `<div class="card-img-top book-thumbnail book-thumbnail-placeholder">No Cover</div>`
            }
            <div class="card-body d-flex flex-column">
                <h3 class="h6 card-title">${escapeHtml(title)}</h3>
                <p class="card-subtitle text-muted small mb-2">${escapeHtml(authors)}</p>
                <p class="card-text small flex-grow-1">${escapeHtml(truncate(description, 150))}</p>
                <ul class="list-unstyled small text-muted mb-3">
                    <li>Published: ${escapeHtml(publishedDate)}</li>
                    ${rating ? `<li>Rating: ${rating} / 5</li>` : ''}
                </ul>
                ${previewLink
                    ? `<a href="${previewLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary mt-auto">Preview</a>`
                    : ''
                }
            </div>
        </div>
    `;

    if (previewLink) {
        const card = col.querySelector('.card');

        card.addEventListener('click', (event) => {
            // the Preview link already navigates itself; avoid opening a second tab
            if (!event.target.closest('a')) {
                window.open(previewLink, '_blank', 'noopener,noreferrer');
            }
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                window.open(previewLink, '_blank', 'noopener,noreferrer');
            }
        });
    }

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

function setStatus(message) {
    searchStatus.textContent = message;
}

function truncate(text, maxLength) {
    return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

function escapeHtml(value) {
    // leverage the DOM to HTML-encode text, preventing XSS from API data injected via innerHTML
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

fetchBooks();

