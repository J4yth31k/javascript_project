const apiKey = "b99960a";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const results = document.getElementById("results");

// ----------------------------------------------------------
// FETCH MOVIES
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// DISPLAY MOVIES
// ----------------------------------------------------------
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
      </div>
    `
    )
    .join("");
}

// ----------------------------------------------------------
// MODAL — MOVIE DETAILS
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// MODAL — CLOSING LOGIC
// ----------------------------------------------------------
const modal = document.getElementById("movie-modal");
const closeBtn = document.getElementById("close-modal");

const closeModal = () => modal.classList.add("hidden");

// Close when clicking the X
closeBtn.addEventListener("click", closeModal);

// Close when tapping the X (mobile)
closeBtn.addEventListener("touchstart", closeModal);

// Close when clicking outside modal content
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// ----------------------------------------------------------
// SEARCH INPUT — AUTO, BUTTON, ENTER
// ----------------------------------------------------------
let typingTimer;

searchInput.addEventListener("input", () => {
  clearTimeout(typingTimer);
  const term = searchInput.value.trim();

  if (term.length >= 3) {
    typingTimer = setTimeout(() => fetchM
