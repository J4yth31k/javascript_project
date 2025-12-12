// details.js

// get imdbID from the URL: details.html?id=tt1234567
const params = new URLSearchParams(window.location.search);
const imdbID = params.get("id");

// DOM refs
const titleEl = document.getElementById("details-title");
const yearEl = document.getElementById("details-year");
const plotEl = document.getElementById("details-plot");
const posterEl = document.getElementById("details-poster");
const ratedEl = document.getElementById("details-rated");
const runtimeEl = document.getElementById("details-runtime");
const genreEl = document.getElementById("details-genre");
const actorsEl = document.getElementById("details-actors");
const directorEl = document.getElementById("details-director");
const ratingEl = document.getElementById("details-rating");
const backdropEl = document.getElementById("details-backdrop");

// reuse the same key as your main script
const apiKey =
  typeof window.apiKey !== "undefined" ? window.apiKey : "b99960a";

async function loadMovie() {
  if (!imdbID) {
    titleEl.textContent = "No movie selected.";
    return;
  }

  try {
    const res = await fetch(
      `https://www.omdbapi.com/?i=${encodeURIComponent(
        imdbID
      )}&plot=full&apikey=${apiKey}`
    );
    const data = await res.json();

    if (data.Response === "False") {
      titleEl.textContent = "Movie not found.";
      return;
    }

    // Basic fields
    titleEl.textContent = data.Title || "Unknown title";
    yearEl.textContent = data.Year || "";
    plotEl.textContent = data.Plot || "No plot available.";

    // Extra fields
    ratedEl.textContent = data.Rated || "NR";
    runtimeEl.textContent = data.Runtime || "";
    genreEl.textContent = data.Genre || "";
    actorsEl.textContent = data.Actors || "Unknown";
    directorEl.textContent = data.Director || "Unknown";
    ratingEl.textContent = data.imdbRating || "N/A";

    const poster =
      data.Poster && data.Poster !== "N/A"
        ? data.Poster
        : "https://via.placeholder.com/300x450?text=No+Poster";

    // Poster image
    posterEl.src = poster;
    posterEl.alt = data.Title || "Movie poster";

    // Netflix-style blurred background
    backdropEl.style.backgroundImage = `url("${poster}")`;
  } catch (err) {
    console.error(err);
    titleEl.textContent = "Error loading movie details.";
  }
}

loadMovie();
