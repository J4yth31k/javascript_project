// Basic OMDb setup — replace with your own free key if available
const apiKey = 'b99960a';

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

// Categories for the home page (you can tweak titles/queries)
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
      case 'title-asc': // A → Z
        return a.Title.localeCompare(b.Title);

      case 'title-desc': // Z → A
        return b.Title.localeCompare(a.Title);

      case 'year-asc': // Oldest → Newest
        if (yearA !== yearB) return yearA - yearB;
        return a.Title.localeCompare(b.Title);

      case 'year-desc': // Newest → Oldest
      default:
        if (yearA !== yearB) return yearB - yearA;
        return a.Title.localeCompare(b.Title);
    }
  });

  return copy;
}

// ---------- Shared click handler for movie cards ----------

function attachMovieClickHandlers(scope = document) {
  scope.querySelectorAll('.movie').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      if (!id) return;
      window.location.href = `details.html?id=${encodeURIComponent(id)}`;
    });
  });
}

// ---------- Display search results (2x3 grid) ----------

function displayMovies(list) {
  if (!list || list.length === 0) {
    results.innerHTML = '<p>No results found.</p>';
    return;
  }

  // Only first 6 movies
  const trimmed = list.slice(0, 6);

  const html = trimmed.map(m => {
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

  results.innerHTML = html;
  attachMovieClickHandlers(results);
}

// ---------- Fetch for search ----------

async function fetchMovies(searchTerm) {
  state.lastQuery = searchTerm;
  results.innerHTML = `
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
  `;

  try {
    const res = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&type=movie&apikey=${apiKey}`
    );
    const data = await res.json();

    if (data.Response === 'True' && Array.isArray(data.Search)) {
      // Deduplicate
      const ids = new Set();
      const unique = [];
      for (const m of data.Search) {
        if (!ids.has(m.imdbID)) {
          ids.add(m.imdbID);
          unique.push(m);
        }
      }
      state.movies = unique;
      const sorted = sortMovies(state.movies, sortSelect.value);
      displayMovies(sorted);
    } else {
      state.movies = [];
      results.innerHTML = '<p>No results found.</p>';
    }
  } catch (err) {
    console.error('Fetch error:', err);
    results.innerHTML = '<p>Something went wrong. Try again.</p>';
  }
}

// ---------- Categories (Netflix-style rows) ----------

async function fetchCategoryMovies(query) {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${apiKey}`
    );
    const data = await res.json();

    if (data.Response === 'True' && Array.isArray(data.Search)) {
      const ids = new Set();
      const unique = [];
      for (const m of data.Search) {
        if (!ids.has(m.imdbID)) {
          ids.add(m.imdbID);
          unique.push(m);
        }
      }
      return unique.slice(0, 10); // up to 10 per row
    }
  } catch (err) {
    console.error('Category fetch error:', err);
  }
  return [];
}

async function loadCategories() {
  if (!categoriesContainer) return;
  categoriesContainer.innerHTML = '';

  for (const cat of CATEGORIES) {
    const movies = await fetchCategoryMovies(cat.query);
    if (!movies.length) continue;

    const section = document.createElement('section');
    section.className = 'category-row';

    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = cat.title;

    const scroller = document.createElement('div');
    scroller.className = 'category-scroller';

    scroller.innerHTML = movies
      .map(m => {
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
      })
      .join('');

    section.appendChild(title);
    section.appendChild(scroller);
    categoriesContainer.appendChild(section);

    attachMovieClickHandlers(scroller);
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
  const sorted = sortMovies(state.movies, sortSelect.value);
  displayMovies(sorted);
});

// Load categories on first visit
window.addEventListener('DOMContentLoaded', () => {
  loadCategories();
});
