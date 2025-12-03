async function fetchMovies(searchTerm) {
  results.innerHTML = `
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
    <div class="movie skeleton"></div>
  `;

  const res  = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response === "True") {

    // ----- REMOVE DUPLICATES -----
    const uniqueMovies = [];
    const ids = new Set();

    for (const movie of data.Search) {
      if (!ids.has(movie.imdbID)) {
        ids.add(movie.imdbID);
        uniqueMovies.push(movie);
      }
    }

    // ----- SMART SORT (no dropdown) -----
    uniqueMovies.sort((a, b) => {
      const yearA = parseInt(a.Year) || 0;
      const yearB = parseInt(b.Year) || 0;

      if (yearA !== yearB) return yearB - yearA; // newest → oldest  
      return a.Title.localeCompare(b.Title);     // if tie → A–Z
    });

    // Show only the first six results
    displayMovies(uniqueMovies.slice(0, 6));

  } else {
    results.innerHTML = `<p>No results found.</p>`;
  }
}
