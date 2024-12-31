//filmek
document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '5b10ee05a53140a03e252ca409834183';
    const apiUrl = 'https://api.themoviedb.org/3/movie/popular?api_key=' + apiKey;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    fetch(apiUrl, {
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YjEwZWUwNWE1MzE0MGEwM2UyNTJjYTQwOTgzNDE4MyIsIm5iZiI6MTczNTA4OTYwNC4yMDYsInN1YiI6IjY3NmI1ZGM0ODU5NDYzMzk2M2E5ZWU5MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iaWAQj5ocu-frdCmloEz7_raQ-KvE_uiOMrdhVHUC20'
        }
    })
    .then(response => response.json())
    .then(data => {
        const moviesContainer = document.getElementById('movies-container');
        if (data.results) {
            data.results.forEach(movie => {
                const movieElement = document.createElement('div');
                movieElement.className = 'movie';
                movieElement.innerHTML = `
                    <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-overview">${movie.overview}</p>
                `;
                moviesContainer.appendChild(movieElement);
            });
        } else {
            console.error('No movies found in the response:', data);
        }
    })
    .catch(error => console.error('Error fetching movies:', error));
});
