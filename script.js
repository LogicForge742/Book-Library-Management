// Global variables to hold books data and current category filter
let books = [];
let currentCategory = 'All books';

const booksGrid = document.getElementById('bookGrid');
const loading = document.getElementById('loadingSpinner');
const searchInput = document.getElementById('search-input');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchButton = document.querySelector('.search-container button');

// Utility: Normalize category strings for consistent matching
function normalizeCategory(str) {
    return str.toLowerCase().trim();
}

// Fetch books from server and display with optional category filter
async function fetchBooks(category = 'All books') {
    booksGrid.innerHTML = '';
    loading.classList.add('show');

    try {
        const res = await fetch('http://localhost:3000/books');
        if (!res.ok) throw new Error('Failed to fetch books');
        books = await res.json();

        currentCategory = category;
        // Filter books and display
        displayBooks(filterBooksByCategory(books, category));
    } catch (error) {
        console.error('Error fetching books:', error);
        booksGrid.textContent = 'Failed to load the content';
    } finally {
        loading.classList.remove('show');
    }
}

// Filter books by category
function filterBooksByCategory(bookList, category) {
    if (normalizeCategory(category) === 'all books') return bookList;
    return bookList.filter(book => normalizeCategory(book.category) === normalizeCategory(category));
}

// Display given book list in the UI grid
function displayBooks(bookList) {
    booksGrid.innerHTML = '';

    if (bookList.length === 0) {
        booksGrid.textContent = 'No books available';
        return;
    }

    bookList.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('books-card');

        const bookTitle = document.createElement('h3');
        bookTitle.classList.add('titlebook');
        bookTitle.textContent = book.title;
        bookCard.appendChild(bookTitle);

        const bookAuthor = document.createElement('p');
        bookAuthor.classList.add('author');
        bookAuthor.innerHTML = `<i>by ${book.author}</i>`;
        bookCard.appendChild(bookAuthor);

        const bookStatus = document.createElement('span');
        bookStatus.classList.add('status');
        bookStatus.textContent = book.status;
        bookCard.appendChild(bookStatus);

        booksGrid.appendChild(bookCard);
    });
}

// Perform search on title or author within current category
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    // Start filtering from books with current category
    let filteredBooks = filterBooksByCategory(books, currentCategory);

    if (searchTerm !== '') {
        filteredBooks = filteredBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        );
    }

    displayBooks(filteredBooks);
}

// Handle category button clicks to filter books
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove 'active' class from all buttons, add to clicked
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Fetch and display books for the selected category
        const selectedCategory = button.textContent.trim();
        fetchBooks(selectedCategory);

        // Clear search input on category change
        searchInput.value = '';
    });
});

// Handle search button click
if (searchButton) {
    searchButton.addEventListener('click', performSearch);
}

// Handle search on Enter key press in search input
searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Initial fetch on page load for all books
fetchBooks();
