const apiKey = "b99960a"; // your key

const searchInput   = document.getElementById("search-input");
const searchBtn     = document.getElementById("search-btn");
const results       = document.getElementById("results");
const suggestionsBox= document.getElementById("suggestions");

/* --------------------------------
   Fetch movies from OMDb
-------------------------------- */
async function fetchMovies(searchTerm) {
  // show skeletons while loading
  results.innerHTML = `
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
  `;

  const res  = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response === "True") {
    // default alphabetical sort
    data.Search.sort((a, b) => a.Title.localeCompare(b.Title));
    // show only first six
    displayMovies(data.Search.slice(0, 6));
  } else {
    results.innerHTML = `<p>No results found.</p>`;
  }
}

/* --------------------------------
   Display movie cards
-------------------------------- */
function displayMovies(movies) {
  results.innerHTML = movies
    .map(movie => `
      <div class="movie" onclick="showMovieDetails('${movie.imdbID}')">
        <img src="${
          movie.Poster !== "N/A"
            ? movie.Poster
            : "https://via.placeholder.com/300x450"
        }" alt="${movie.Title}" />
        <div class="movie-info">
          <h3>${movie.Title}</h3>
          <p>${movie.Year}</p>
        </div>
      </div>
    `)
    .join("");
}

/* --------------------------------
   Movie details (modal)
-------------------------------- */
async function showMovieDetails(id) {
  const res  = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
  const data = await res.json();

  document.getElementById("modal-poster").src =
    data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/300x450";
  document.getElementById("modal-title").innerText = data.Title;
  document.getElementById("modal-year").innerText  = data.Year;
  document.getElementById("modal-plot").innerText  = data.Plot;

  document.getElementById("movie-modal").classList.remove("hidden");
}

/* Close modal when clicking outside content or on X */
document.getElementById("movie-modal").addEventListener("click", (e) => {
  if (e.target.id === "movie-modal") {
    document.getElementById("movie-modal").classList.add("hidden");
  }
});
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("movie-modal").classList.add("hidden");
});

/* --------------------------------
   Autocomplete suggestions
-------------------------------- */
async function showSuggestions(term) {
  const res  = await fetch(`https://www.omdbapi.com/?s=${term}&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response !== "True") {
    suggestionsBox.style.display = "none";
    return;
  }

  suggestionsBox.innerHTML = data.Search.slice(0, 5)
    .map(movie => `
      <div class="suggestion-item" data-title="${movie.Title}">
        ${movie.Title} (${movie.Year})
      </div>
    `)
    .join("");

  suggestionsBox.style.display = "block";
}

suggestionsBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("suggestion-item")) {
    const title = e.target.getAttribute("data-title");
    searchInput.value = title;
    suggestionsBox.style.display = "none";
    fetchMovies(title);
  }
});

/* --------------------------------
   Input typing listener
-------------------------------- */
let typingTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(typingTimer);
  const term = searchInput.value.trim();
  if (term.length >= 3) {
    typingTimer = setTimeout(() => {
      fetchMovies(term);
      showSuggestions(term);
    }, 300);
  } else {
    suggestionsBox.style.display = "none";
  }
});

/* --------------------------------
   Search button and Enter key
-------------------------------- */
searchBtn.addEventListener("click", () => {
  const term = searchInput.value.trim();
  if (term) {
    fetchMovies(term);
    suggestionsBox.style.display = "none";
  }
});
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const term = searchInput.value.trim();
    if (term) fetchMovies(term);
    suggestionsBox.style.display = "none";
  }
});

/* --------------------------------
   Extra UI injection and sort feature
-------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // --- Inject navigation bar ---
  const header = document.querySelector('header');
  const nav = document.createElement('nav');
  nav.className = 'main-nav';
  nav.innerHTML = `
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  `;
  header.insertBefore(nav, header.querySelector('.search-bar'));

  // --- Inject sort dropdown ---
  const sortSelect = document.createElement('select');
  sortSelect.id = 'sort-order';
  sortSelect.innerHTML = `
    <option value="new">Newest → Oldest</option>
    <option value="old">Oldest → Newest</option>
  `;
  document.querySelector('.search-bar').appendChild(sortSelect);

  // When the sort order changes, re-run the search if there is a term
  sortSelect.addEventListener('change', () => {
    const term = searchInput.value.trim();
    if (term) fetchMovies(term);
  });

  // --- Inject footer ---
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = '<p>&copy; 2025 Movie Search App. All rights reserved.</p>';
  const scriptEl = document.querySelector('script[src="script.js"]');
  document.body.insertBefore(footer, scriptEl);

  // --- Override displayMovies for sorting by year based on dropdown ---
  const originalDisplayMovies = displayMovies;
  window.displayMovies = function(movies) {
    const select = document.getElementById('sort-order');
    if (select) {
      const order = select.value;
      movies = [...movies];
      if (order === 'new') {
        movies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
      } else {
        movies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
      }
    }
    originalDisplayMovies(movies);
  };
});
