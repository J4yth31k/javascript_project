const apiKey = "b99960a";
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const results = document.getElementById("results");

// Fetch movies
async function fetchMovies(searchTerm) {
  results.innerHTML = `
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
  `;

  const res = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response === "True") {
    displayMovies(data.Search.slice(0, 8));
  } else {
    results.innerHTML = `<p>No results found.</p>`;
  }
}

// Create movie cards
function displayMovies(movies) {
  results.innerHTML = movies
    .map(
      movie => `
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
    </div>`
    )
    .join("");
}

/* ------------------------------
   MODAL (Movie details)
------------------------------ */
async function showMovieDetails(id) {
  const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
  const data = await res.json();

  document.getElementById("modal-poster").src =
    data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/300x450";
  document.getElementById("modal-title").innerText = data.Title;
  document.getElementById("modal-year").innerText = data.Year;
  document.getElementById("modal-plot").innerText = data.Plot;

  document.getElementById("movie-modal").classList.remove("hidden");
}

// ------------------------------
// MODAL CLOSE FIXES ADDED HERE
// ------------------------------

// tap / click outside modal closes it
document.getElementById("movie-modal").addEventListener("click", (e) => {
  if (e.target.id === "movie-modal") {
    document.getElementById("movie-modal").classList.add("hidden");
  }
});

// universal close function
const closeModal = () => {
  document.getElementById("movie-modal").classList.add("hidden");
};

// close button (desktop click)
document.getElementById("close-modal").addEventListener("click", closeModal);

// close button (mobile tap)
document.getElementById("close-modal").addEventListener("touchstart", closeModal);

/* ------------------------------
   Auto-search while typing
------------------------------ */
let typingTimer;

searchInput.addEventListener("input", () => {
  clearTimeout(typingTimer);
  const term = searchInput.value.trim();

  if (term.length >= 3) {
    typingTimer = setTimeout(() => fetchMovies(term), 300);
  }
});

/* Search button */
searchBtn.addEventListener("click", () => {
  const term = searchInput.value.trim();
  if (term) fetchMovies(term);
});

/* Enter key */
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const term = searchInput.value.trim();
    if (term) fetchMovies(term);
  }
});
