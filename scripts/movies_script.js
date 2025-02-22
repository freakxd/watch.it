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

    // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
    let status = 'not_logged_in';
    fetch('../backend/check_login.php')
        .then(response => response.json())
        .then(data => {
            status = data.status;
            if (status == "not_logged_in") {
                commentText.disabled = true;
                commentText.placeholder = 'Jelentkezz be, hogy véleményt írhass!';
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
                        movieElement.addEventListener('click', () => {
                            window.location.href = `filmek.html?id=${movie.id}`;
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
                        commentElement.className = 'comment';
                        commentElement.id = `comment-${index + 1}`;
                        commentElement.innerHTML = `
                            <p><strong>${comment.username}</strong>: ${comment.comment}</p>
                            <small>${comment.created_at}</small>
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

    // URL paraméterek ellenőrzése
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (movieId) {
        // Ha van 'id' paraméter az URL-ben, akkor az adott filmet töltjük be
        loadMovieById(movieId);
        // Elrejtjük a kategóriák oszlopot
        categoryColumn.style.display = 'none';

        // Komment mentése
        if (commentForm) {
            commentForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const comment = commentText.value.trim();
                const movieId = new URLSearchParams(window.location.search).get('id');

                if (comment) {
                    fetch('../backend/save_comment.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ movie_id: movieId, comment: comment })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            commentText.value = '';
                            loadComments(movieId);
                        } else {
                            console.error(data.message);
                        }
                    })
                    .catch(error => console.error('Error saving comment:', error));
                }
            });
        }
    } else {
        // Alapértelmezett filmek betöltése
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    data.results.forEach(movie => {
                        if (movie.overview && movie.overview !== "") { // Kizárjuk azokat a filmeket, amelyeknek nincs leírásuk
                            const movieElement = document.createElement('div');
                            movieElement.className = 'col-md-4 movie';
                            movieElement.innerHTML = `
                                <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster">
                                <h3 class="movie-title">${movie.title}</h3>
                                <p class="movie-overview">${movie.overview}</p>
                            `;
                            movieElement.addEventListener('click', () => {
                                window.location.href = `filmek.html?id=${movie.id}`;
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