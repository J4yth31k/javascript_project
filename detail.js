// details.js

// get the imdbID from the URL ?id=...
const params = new URLSearchParams(window.location.search);
const imdbID = params.get("id");

// DOM refs
const titleEl = document.getElementById("details-title");
const yearEl = document.getElementById("details-year");
const plotEl = document.getElementById("details-plot");
const posterEl = document.getElementById("details-poster");

// same key pattern as script.js
const apiKey = typeof window.apiKey !== 'undefined' ? window.apiKey : 'thewdb';

async function loadMovie() {
  if (!imdbID) {
    titleEl.textContent = "No movie selected.";
    return;
  }

  try {
    const res = await fetch(
      `https://www.omdbapi.com/?i=${encodeURIComponent(imdbID)}&plot=full&apikey=${apiKey}`
    );
    const data = await res.json();

    if (data.Response === "False") {
      titleEl.textContent = "Movie not found.";
      return;
    }

    titleEl.textContent = data.Title;
    yearEl.textContent = data.Year;
    plotEl.textContent = data.Plot;

    const poster =
      data.Poster && data.Poster !== "N/A"
        ? data.Poster
        : "https://via.placeholder.com/180x260?text=No+Poster";

    posterEl.src = poster;
    posterEl.alt = data.Title;
  } catch (err) {
    console.error(err);
    titleEl.textContent = "Error loading movie details.";
  }
}

loadMovie();
