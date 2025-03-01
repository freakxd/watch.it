document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '5b10ee05a53140a03e252ca409834183';
    const apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=hu-HU`;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const categoryUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=hu-HU`;

    const moviesContainer = document.getElementById('movies-container');
    const categoryList = document.getElementById('category-list');
    const categoryColumn = document.querySelector('.col-md-3');
    const searchBar = document.getElementById('search-bar');
    const commentsContainer = document.getElementById('comments-container');
    const commentForm = document.getElementById('comment-form');
    const commentText = document.getElementById('comment-text');
    const ratingSelect = document.getElementById('rating');
    const recommendedSelect = document.getElementById('recommended');

    // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
    let status = 'not_logged_in';
    fetch('../backend/check_login.php')
        .then(response => response.json())
        .then(data => {
            status = data.status;
            if (status == "not_logged_in") {
                commentText.disabled = true;
                commentText.placeholder = 'Jelentkezz be, hogy véleményt írhass!';
                ratingSelect.disabled = true;
                recommendedSelect.disabled = true;
            }
        })
        .catch(error => console.error('Error checking login status:', error));

    // Kategóriák magyar nevei
    const categoryNames = {
        "Action": "Akció ",
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
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category2';
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
                        movieElement.className = 'col-md-3 movie'; // Módosítva, hogy 4 film legyen egy sorban
                        movieElement.innerHTML = `
                            <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster">
                            <h3 class="movie-title">${movie.title}</h3>
                            <p class="movie-overview">${movie.overview}</p>
                        `;
                        movieElement.addEventListener('click', () => {
                            window.location.href = `filmek?id=${movie.id}`;
                        });
                        moviesContainer.appendChild(movieElement);
                    });
                } else {
                    console.error('No movies found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    // Egy adott film betöltése
    function loadMovieById(movieId) {
        const movieApiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=hu-HU`;
        const videoApiUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`;

        fetch(movieApiUrl)
            .then(response => response.json())
            .then(movie => {
                moviesContainer.innerHTML = ''; // Töröljük a korábbi filmeket
                const movieElement = document.createElement('div');
                movieElement.className = 'col-md-4 movie';
                movieElement.innerHTML = `
                    <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster movie-poster-small">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-overview">${movie.overview}</p>
                    <p class="movie-original-title"><strong>Eredeti cím:</strong> ${movie.original_title}</p>
                    <p class="movie-release-date"><strong>Megjelenési dátum:</strong> ${movie.release_date}</p>
                    <p class="movie-original-language"><strong>Nyelv:</strong> ${movie.original_language}</p>
                    <p class="movie-runtime"><strong>Hossz:</strong> ${movie.runtime} perc</p>
                    <p class="movie-production-companies"><strong>Gyártó cégek:</strong> ${movie.production_companies.map(company => company.name).join(', ')}</p>
                    <p class="movie-production-countries"><strong>Gyártó országok:</strong> ${movie.production_countries.map(country => country.name).join(', ')}</p>
                    <p class="movie-revenue"><strong>Bevétel:</strong> $${movie.revenue.toLocaleString()}</p>
                    <p class="movie-budget"><strong>Költségvetés:</strong> $${movie.budget.toLocaleString()}</p>
                `;
                moviesContainer.appendChild(movieElement);

                // Fetch and display the trailer
                fetch(videoApiUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results && data.results.length > 0) {
                            const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
                            if (trailer) {
                                const trailerElement = document.createElement('div');
                                trailerElement.className = 'col-md-8 trailer';
                                trailerElement.innerHTML = `
                                    <h4>Előzetes</h4>
                                    <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
                                `;
                                moviesContainer.appendChild(trailerElement);
                            }
                        }
                        else{
                            const trailerElement = document.createElement('div');
                            trailerElement.className = 'col-md-8 trailer';
                            trailerElement.innerHTML = `
                                <h4>Előzetes</h4>
                                <p>Nincs elérhető előzetes.</p>
                            `;
                            moviesContainer.appendChild(trailerElement);
                        }
                    })
                    .catch(error => console.error('Error fetching trailer:', error));

                loadComments(movieId);
            })
            .catch(error => console.error('Error fetching movie:', error));
    }

    // Kommentek betöltése
    function loadComments(movieId) {
        fetch(`../backend/get_comments.php?movie_id=${movieId}`)
            .then(response => response.json())
            .then(data => {
                commentsContainer.innerHTML = ''; // Töröljük a korábbi kommenteket
                if (data.comments && data.comments.length > 0) {
                    data.comments.forEach((comment, index) => {
                        const commentElement = document.createElement('div');
                        commentElement.className = 'custom-comment-card bg-light text-dark mb-3';
                        commentElement.id = `comment-${index + 1}`;
                        commentElement.innerHTML = `
                            <div class="custom-comment-card-body">
                                <h5 class="custom-comment-card-title">${comment.username}</h5>
                                <p class="custom-comment-card-text">${comment.comment}</p>
                                <p class="custom-comment-card-text"><strong>Értékelés:</strong> ${comment.rating} / 5</p>
                                <p class="custom-comment-card-text"><strong>Ajánlás:</strong> ${comment.recommended ? 'Igen' : 'Nem'}</p>
                                <p class="custom-comment-card-text"><small class="text-muted">${comment.created_at}</small></p>
                            </div>
                        `;
                        commentsContainer.appendChild(commentElement);
                    });

                    // Ha több mint 10 komment van, engedélyezzük a Scrollspy-t
                    if (data.comments.length > 10) {
                        const scrollSpy = new bootstrap.ScrollSpy(document.body, {
                            target: '#comments-section'
                        });
                    }
                } else {
                    commentsContainer.innerHTML = '<p>Ezen a filmen nincs még vélemény.</p>';
                }
            })
            .catch(error => console.error('Error fetching comments:', error));
    }

    // Komment mentése
    if (commentForm) {
        commentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const comment = commentText.value.trim();
            const rating = ratingSelect.value;
            const recommended = recommendedSelect.value;
            const movieId = new URLSearchParams(window.location.search).get('id');

            if (comment && rating && recommended) {
                fetch('../backend/save_comment.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ movie_id: movieId, comment: comment, rating: rating, recommended: recommended })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        commentText.value = '';
                        ratingSelect.value = '1';
                        recommendedSelect.value = '1';
                        loadComments(movieId);
                    } else {
                        console.error(data.message);
                    }
                })
                .catch(error => console.error('Error saving comment:', error));
            } else {
                console.error('Minden mezőt ki kell tölteni.');
            }
        });
    }

    // Filmek keresése cím alapján
    function searchMoviesByTitle(title) {
        const searchApiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${title}&language=hu-HU`;
        fetch(searchApiUrl)
            .then(response => response.json())
            .then(data => {
                moviesContainer.innerHTML = ''; // Töröljük a korábbi filmeket
                if (data.results) {
                    data.results.forEach(movie => {
                        const movieElement = document.createElement('div');
                        movieElement.className = 'col-md-3 movie'; // Módosítva, hogy 4 film legyen egy sorban
                        movieElement.innerHTML = `
                            <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster">
                            <h3 class="movie-title">${movie.title}</h3>
                            <p class="movie-overview">${movie.overview}</p>
                        `;
                        movieElement.addEventListener('click', () => {
                            window.location.href = `filmek?id=${movie.id}`;
                        });
                        moviesContainer.appendChild(movieElement);
                    });
                } else {
                    console.error('No movies found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    // Keresősáv eseménykezelője
    searchBar.addEventListener('input', function() {
        const query = searchBar.value.trim();
        if (query) {
            searchMoviesByTitle(query);
        } else {
            // Alapértelmezett filmek betöltése, ha a keresősáv üres
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    moviesContainer.innerHTML = ''; // Töröljük a korábbi filmeket
                    if (data.results) {
                        data.results.forEach(movie => {
                            if (movie.overview && movie.overview !== "") { // Kizárjuk azokat a filmeket, amelyeknek nincs leírásuk
                                const movieElement = document.createElement('div');
                                movieElement.className = 'col-md-3 movie'; // Módosítva, hogy 4 film legyen egy sorban
                                movieElement.innerHTML = `
                                    <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster">
                                    <h3 class="movie-title">${movie.title}</h3>
                                    <p class="movie-overview">${movie.overview}</p>
                                `;
                                movieElement.addEventListener('click', () => {
                                    window.location.href = `filmek?id=${movie.id}`;
                                });
                                moviesContainer.appendChild(movieElement);
                            }
                        });
                    } else {
                        console.error('No movies found in the response:', data);
                    }
                })
                .catch(error => console.error('Error fetching movies:', error));
        }
    });

    // URL paraméterek ellenőrzése
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (movieId) {
        // Ha van 'id' paraméter az URL-ben, akkor az adott filmet töltjük be
        loadMovieById(movieId);
        // Elrejtjük a kategóriák oszlopot
        categoryColumn.style.display = 'none';
    } else {
        // Alapértelmezett filmek betöltése
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    data.results.forEach(movie => {
                        if (movie.overview && movie.overview !== "") { // Kizárjuk azokat a filmeket, amelyeknek nincs leírásuk
                            const movieElement = document.createElement('div');
                            movieElement.className = 'col-md-3 movie'; // Módosítva, hogy 4 film legyen egy sorban
                            movieElement.innerHTML = `
                                <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster">
                                <h3 class="movie-title">${movie.title}</h3>
                                <p class="movie-overview">${movie.overview}</p>
                            `;
                            movieElement.addEventListener('click', () => {
                                window.location.href = `filmek?id=${movie.id}`;
                            });
                            moviesContainer.appendChild(movieElement);
                        }
                    });
                } else {
                    console.error('No movies found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    const commentSection = document.getElementById('comments');
    if (!movieId) {
        commentSection.style.display = 'none';
    }
});