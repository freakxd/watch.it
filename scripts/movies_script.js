document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '5b10ee05a53140a03e252ca409834183';
    const apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=hu-HU`;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const categoryUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=hu-HU`;

    const moviesContainer = document.getElementById('movies-container');
    const categoryList = document.getElementById('category-list');

    // Kategóriák magyar nevei
    const categoryNames = {
        "Action": "Akció",
        "Adventure": "Kaland",
        "Animation": "Animáció",
        "Comedy": "Vígjáték",
        "Crime": "Bűnügyi",
        "Documentary": "Dokumentumfilm",
        "Drama": "Dráma",
        "Family": "Családi",
        "Fantasy": "Fantasy",
        "History": "Történelmi",
        "Horror": "Horror",
        "Music": "Zenei",
        "Mystery": "Misztikus",
        "Romance": "Romantikus",
        "Science Fiction": "Sci-fi",
        "TV Movie": "TV film",
        "Thriller": "Thriller",
        "War": "Háborús",
        "Western": "Western"
    };

    // Kategóriák betöltése
    fetch(categoryUrl)
        .then(response => response.json())
        .then(data => {
            if (data.genres) {
                data.genres.forEach(genre => {
                    const categoryItem = document.createElement('li');
                    categoryItem.className = 'list-group-item category-item';
                    categoryItem.textContent = categoryNames[genre.name] || genre.name; // Magyar név vagy angol név, ha nincs fordítás
                    categoryItem.dataset.genreId = genre.id;
                    categoryItem.addEventListener('click', () => loadMoviesByCategory(genre.id));
                    categoryList.appendChild(categoryItem);
                });
            } else {
                console.error('No genres found in the response:', data);
            }
        })
        .catch(error => console.error('Error fetching genres:', error));

    // Filmek betöltése kategória alapján
    function loadMoviesByCategory(genreId) {
        const categoryApiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=hu-HU`;
        fetch(categoryApiUrl)
            .then(response => response.json())
            .then(data => {
                moviesContainer.innerHTML = ''; // Töröljük a korábbi filmeket
                if (data.results) {
                    data.results.forEach(movie => {
                        const movieElement = document.createElement('div');
                        movieElement.className = 'col-md-4 movie';
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
    }

    // Alapértelmezett filmek betöltése
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results) {
                data.results.forEach(movie => {
                    const movieElement = document.createElement('div');
                    movieElement.className = 'col-md-4 movie';
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