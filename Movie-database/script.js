const apiKey = "b99960a"; // Replace with your OMDB key
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const results = document.getElementById("results");

async function fetchMovies(searchTerm) {
  results.innerHTML = `<div class="skeleton"></div>
                       <div class="skeleton"></div>
                       <div class="skeleton"></div>`;

  const res = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response === "True") {
    displayMovies(data.Search.slice(0, 6));
  } else {
    results.innerHTML = `<p>No results found.</p>`;
  }
}

function displayMovies(movies) {
  results.innerHTML = movies.map(movie => `
    <div class="movie">
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200x300"}" alt="${movie.Title}" />
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
    </div>
  `).join("");
}

searchBtn.addEventListener("click", () => {
  const term = searchInput.value.trim();
  if (term) fetchMovies(term);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const term = searchInput.value.trim();
    if (term) fetchMovies(term);
  }
});
