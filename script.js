// Basic OMDb setup — replace with your own free key if available
const apiKey = typeof window.apiKey !== 'undefined' ? window.apiKey : 'thewdb';

// DOM refs
const results = document.getElementById('results');
const input = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const sortSelect = document.getElementById('sort-order');

// App state
let state = {
  movies: [],
  lastQuery: ''
};

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

function displayMovies(list) {
  if (!list || list.length === 0) {
    results.innerHTML = '<p>No results found.</p>';
    return;
  }

  // still only show first 6
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

  // add click handler so each card opens the details page
  document.querySelectorAll('.movie').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      window.location.href = `details.html?id=${encodeURIComponent(id)}`;
    });
  });
}

async function fetchMovies(searchTerm) {
  state.lastQuery = searchTerm;
  results.innerHTML = `
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
  `;

  try {
    const res  = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&apikey=${apiKey}`);
    const data = await res.json();

    if (data.Response === 'True' && Array.isArray(data.Search)) {
      // Deduplicate
      const ids = new Set();
      const unique = [];
      for (const m of data.Search) {
        if (!ids.has(m.imdbID)) { ids.add(m.imdbID); unique.push(m); }
      }
      state.movies = unique;
      const sorted = sortMovies(state.movies, sortSelect.value);
      displayMovies(sorted.slice(0,6));
    } else {
      state.movies = [];
      results.innerHTML = '<p>No results found.</p>';
    }
  } catch (err) {
    console.error('Fetch error:', err);
    results.innerHTML = '<p>Something went wrong. Try again.</p>';
  }
}

// Events
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
  displayMovies(sorted.slice(0, 6)); 
});

