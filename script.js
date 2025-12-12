// Use window.apiKey if defined in HTML, otherwise fallback to your OMDb key
const apiKey = typeof window.apiKey !== 'undefined' ? window.apiKey : 'b99960a'; 

// DOM refs
const results = document.getElementById('results');
const input = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const sortSelect = document.getElementById('sort-order');
const categoriesContainer = document.getElementById('category-rows');

// App state
let state = {
  movies: [],
  lastQuery: ''
};

// Categories for the home page
const CATEGORIES = [
  { title: "Comedy", query: "comedy" },
  { title: "Action", query: "action" },
  { title: "Horror", query: "horror" },
  { title: "Romance", query: "romance" },
  { title: "Sci-Fi", query: "science fiction" },
  { title: "Drama", query: "drama" },
  { title: "Family Movies", query: "family" },
  { title: "Thrillers", query: "thriller" },
  { title: "Animation", query: "animated" }
];

// ---------- Sorting ----------
function sortMovies(list, order) {
  const copy = [...list];

  copy.sort((a, b) => {
    const yearA = parseInt(a.Year) || 0;
    const yearB = parseInt(b.Year) || 0;

    switch (order) {
      case 'title-asc':
        return a.Title.localeCompare(b.Title);
      case 'title-desc':
        return b.Title.localeCompare(a.Title);
      case 'year-asc':
        return yearA !== yearB ? yearA - yearB : a.Title.localeCompare(b.Title);
      case 'year-desc':
      default:
        return yearA !== yearB ? yearB - yearA : a.Title.localeCompare(b.Title);
    }
  });

  return copy;
}

// ---------- Movie click ----------
function attachMovieClickHandlers(scope = document) {
  scope.querySelectorAll('.movie').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      if (!id) return;
      window.location.href = `details.html?id=${encodeURIComponent(id)}`;
    });
  });
}

// ---------- Display search results ----------
function displayMovies(list) {
  if (!list || list.length === 0) {
    results.innerHTML = '<p>No results found.</p>';
    return;
  }

  const trimmed = list.slice(0, 6);

  results.innerHTML = trimmed.map(m => {
    const poster =
      m.Poster && m.Poster !== 'N/A'
        ? m.Poster
        : 'https://via.placeholder.com/180x260?text=No+Poster';

    return `
      <div class="movie" data-id="${m.imdbID}">
        <img src="${poster}" alt="${m.Title}" />
        <div class="movie-info">
          <strong>${m.Title}</strong>
          <div>${m.Year}</div>
        </div>
      </div>
    `;
  }).join('');

  attachMovieClickHandlers(results);
}

// ---------- Fetch search ----------
async function fetchMovies(searchTerm) {
  state.lastQuery = searchTerm;
  results.innerHTML = `<p>Loading...</p>`;

  try {
    const res = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&type=movie&apikey=${apiKey}`
    );
    const data = await res.json();

    if (data.Response === 'True') {
      state.movies = data.Search;
      displayMovies(sortMovies(state.movies, sortSelect.value));
    } else {
      state.movies = [];
      results.innerHTML = '<p>No results found.</p>';
    }
  } catch (err) {
    console.error(err);
    results.innerHTML = '<p>Error loading movies.</p>';
  }
}

// ---------- Categories ----------
async function fetchCategoryMovies(query) {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${apiKey}`
    );
    const data = await res.json();
    return data.Response === 'True' ? data.Search.slice(0, 10) : [];
  } catch {
    return [];
  }
}

async function loadCategories() {
  if (!categoriesContainer) return;
  categoriesContainer.innerHTML = '';

  for (const cat of CATEGORIES) {
    const movies = await fetchCategoryMovies(cat.query);
    if (!movies.length) continue;

    const section = document.createElement('section');
    section.className = 'category-row';

    section.innerHTML = `
      <h2 class="category-title">${cat.title}</h2>
      <div class="category-scroller">
        ${movies.map(m => `
          <div class="movie" data-id="${m.imdbID}">
            <img src="${m.Poster !== 'N/A' ? m.Poster : 'https://via.placeholder.com/150x220'}">
            <div class="movie-info">
              <strong>${m.Title}</strong>
              <div>${m.Year}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    categoriesContainer.appendChild(section);
    attachMovieClickHandlers(section);
  }
}

// ---------- Events ----------
searchBtn.addEventListener('click', () => {
  const q = input.value.trim();
  if (q) fetchMovies(q);
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const q = input.value.trim();
    if (q) fetchMovies(q);
  }
});

sortSelect.addEventListener('change', () => {
  if (!state.movies.length) return;
  displayMovies(sortMovies(state.movies, sortSelect.value));
});

// ---------- Auto-search add-on (FIXED) ----------
let debounceTimer;

input.addEventListener('input', () => {
  clearTimeout(debounceTimer);

  const q = input.value.trim();
  if (q.length < 2) return;

  debounceTimer = setTimeout(() => {
    searchBtn.click();
  }, 450);
});

// Load categories
window.addEventListener('DOMContentLoaded', loadCategories);
