// Use window.apiKey if defined in HTML, otherwise fallback
const apiKey = typeof window.apiKey !== 'undefined' ? window.apiKey : 'b99960a';

// DOM references
const results = document.getElementById('results');
const input = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchForm + document.getElementById('search-form');
const sortSelect = document.getElementById('sort-order');
const categoriesContainer = document.getElementById('category-rows');

// App state
let state = {
  movies: [],
  lastQuery: ''
};

// Categories
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
  return [...list].sort((a, b) => {
    const yA = parseInt(a.Year) || 0;
    const yB = parseInt(b.Year) || 0;

    if (order === 'title-asc') return a.Title.localeCompare(b.Title);
    if (order === 'title-desc') return b.Title.localeCompare(a.Title);
    if (order === 'year-asc') return yA - yB;
    return yB - yA;
  });
}

// ---------- Movie card clicks ----------
function attachMovieClickHandlers(scope) {
  scope.querySelectorAll('.movie').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (id) window.location.href = `details.html?id=${id}`;
    });
  });
}

// ---------- Display search results ----------
function displayMovies(list) {
  if (!list.length) {
    results.innerHTML = '<p>No results found.</p>';
    return;
  }

  results.innerHTML = list.slice(0, 6).map(m => `
    <div class="movie" data-id="${m.imdbID}">
      <img src="${m.Poster !== 'N/A' ? m.Poster : 'https://via.placeholder.com/180x260'}" />
      <div class="movie-info">
        <strong>${m.Title}</strong>
        <div>${m.Year}</div>
      </div>
    </div>
  `).join('');

  attachMovieClickHandlers(results);
}

// ---------- Fetch search ----------
async function fetchMovies(query) {
  results.innerHTML = '<p>Loading...</p>';
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${apiKey}`
    );
    const data = await res.json();
    console.log("OMDb data:", data); // 🔍 Debug

    if (data.Response === 'True') {
      state.movies = data.Search;
      displayMovies(sortMovies(state.movies, sortSelect.value));
    } else {
      results.innerHTML = '<p>No results found.</p>';
    }
  } catch (error) {
    console.error("Fetch failed:", error); // 🔍 Debug
    results.innerHTML = '<p>Error fetching data.</p>';
  }
}

// ---------- Categories ----------
async function fetchCategoryMovies(query) {
  const res = await fetch(
    `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${apiKey}`
  );
  const data = await res.json();
  return data.Response === 'True' ? data.Search.slice(0, 10) : [];
}

async function loadCategories() {
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
            <img src="${m.Poster !== 'N/A' ? m.Poster : 'https://via.placeholder.com/150x220'}" />
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

// 1) ADD this helper function (place it right above your event listeners)
function performSearch() {
  const q = input.value.trim();
  console.log('Search query:', q);

  if (q) {
    fetchMovies(q);
  } else {
    results.innerHTML = '<p>Please enter a search term.</p>';
    input.focus();
  }
}

// 2) REPLACE your current event listeners with these

// ===== DOM ELEMENTS =====
const searchForm = document.getElementById("search-form");
const sortOrder = document.getElementById("sort-order");

// ===== EVENT LISTENERS =====
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchMovies();
});

sortOrder.addEventListener("change", () => {
  sortResults();
});

// Button click
searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  performSearch();
});

// Enter key inside the input
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    performSearch();
  }
});

// ---------- Auto-search (285ms debounce) ----------
let debounceTimer;
input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  if (input.value.trim().length < 2) return;

  debounceTimer = setTimeout(() => {
    performSearch();
  }, 285);
});

// Load categories on page load
window.addEventListener('DOMContentLoaded', loadCategories);
