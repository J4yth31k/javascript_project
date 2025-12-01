const apiKey = "b99960a"; // your key

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const results = document.getElementById("results");
const suggestionsBox = document.getElementById("suggestions");

async function fetchMovies(searchTerm) {
  results.innerHTML = `
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
  `;

  const res = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response === "True") {

    // ⭐ REQUIRED: sort movies alphabetically
    data.Search.sort((a, b) => a.Title.localeCompare(b.Title));

    // ⭐ REQUIRED: show only first 6
    displayMovies(data.Search.slice(0, 6));
  } else {
    results.innerHTML = `<p>No results found.</p>`;
  }

/* ------------------------------
   Display Movie Cards
------------------------------ */
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
   Movie Details (Modal)
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

/* CLOSE MODAL */
document.getElementById("movie-modal").addEventListener("click", (e) => {
  if (e.target.id === "movie-modal") {
    document.getElementById("movie-modal").classList.add("hidden");
  }
});

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("movie-modal").classList.add("hidden");
});

/* ------------------------------
   Autocomplete Suggestions
------------------------------ */
async function showSuggestions(term) {
  const res = await fetch(`https://www.omdbapi.com/?s=${term}&apikey=${apiKey}`);
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

/* ------------------------------
   Input Typing Listener
------------------------------ */
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

/* SEARCH BUTTON */
searchBtn.addEventListener("click", () => {
  const term = searchInput.value.trim();
  if (term) fetchMovies(term);
});

/* ENTER KEY */
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const term = searchInput.value.trim();
    if (term) fetchMovies(term);
    suggestionsBox.style.display = "none";
  }
});
