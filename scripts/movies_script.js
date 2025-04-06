document.addEventListener('DOMContentLoaded', function () {
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
    const recommendedCheckbox = document.getElementById('cb5');
    const reviewSummary = document.getElementById('review-summary');
    const paginationContainer = document.getElementById('pagination');
    let selectedGenreId = null;

    let status = 'not_logged_in';
    let current_user_role = 0;
    let current_user_id = null;
    let currentPage = 1;
    const moviesPerPage = 20;

    fetch('../backend/check_login.php')
        .then(response => response.json())
        .then(data => {
            status = data.status;
            current_user_role = data.role;
            current_user_id = data.user_id;

            if (status === "not_logged_in") {
                commentText.disabled = true;
                commentText.placeholder = 'Jelentkezz be, hogy véleményt írhass!';
                document.querySelectorAll('.rating input').forEach(input => input.disabled = true);
                recommendedCheckbox.disabled = true;
            }
        })
        .catch(error => console.error('Error checking login status:', error));

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

    fetch(categoryUrl)
        .then(response => response.json())
        .then(data => {
            if (data.genres) {
                data.genres.forEach(genre => {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category2';

                    const categoryApiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre.id}&language=hu-HU`;
                    fetch(categoryApiUrl)
                        .then(response => response.json())
                        .then(movieData => {
                            const movieCount = movieData.total_results;
                            categoryItem.textContent = `${categoryNames[genre.name] || genre.name} (${movieCount})`;
                        })
                        .catch(error => console.error(`Error fetching movie count for genre ${genre.name}:`, error));

                    categoryItem.dataset.genreId = genre.id;
                    categoryItem.addEventListener('click', () => {
                        loadMoviesByCategory(genre.id);
                    });
                    categoryList.appendChild(categoryItem);
                });
            } else {
                console.error('No genres found in the response:', data);
            }
        })
        .catch(error => console.error('Error fetching genres:', error));

    function loadMoviesByCategory(genreId) {
        selectedGenreId = genreId;
        currentPage = 1;
        loadMovies(currentPage);
    }

    function loadMovieById(movieId) {
        const movieApiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=hu-HU`;
        const videoApiUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`;

        fetch(movieApiUrl)
            .then(response => response.json())
            .then(movie => {
                moviesContainer.innerHTML = '';
                const movieElement = document.createElement('div');
                movieElement.className = 'col-md-4 movie';
                movieElement.innerHTML = `
                    <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster movie-poster-small">
                    
                `;
                moviesContainer.appendChild(movieElement);

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
                                    <iframe width="100%" height="355" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
                                `;
                                moviesContainer.appendChild(trailerElement);
                            }
                        }
                        else {
                            const trailerElement = document.createElement('div');
                            trailerElement.className = 'col-md-8 trailer';
                            trailerElement.innerHTML = `
                                <h4>Előzetes</h4>
                                <p>Nincs elérhető előzetes.</p>
                            `;
                            moviesContainer.appendChild(trailerElement);
                        }

                        const movieElement2 = document.createElement('div');
                        movieElement2.className = 'col-md-12';
                        movieElement2.innerHTML += `<h3 class="movie-title">${movie.title}</h3>
                            <p class="movie-overview">${movie.overview}</p>
                            <p class="movie-original-title"><strong>Eredeti cím:</strong> ${movie.original_title}</p>
                            <p class="movie-release-date"><strong>Megjelenési dátum:</strong> ${movie.release_date}</p>
                            <p class="movie-original-language"><strong>Nyelv:</strong> ${movie.original_language}</p>
                            <p class="movie-runtime"><strong>Hossz:</strong> ${movie.runtime} perc</p>
                            <p class="movie-production-companies"><strong>Gyártó cégek:</strong> ${movie.production_companies.map(company => company.name).join(', ')}</p>
                            <p class="movie-production-countries"><strong>Gyártó országok:</strong> ${movie.production_countries.map(country => country.name).join(', ')}</p>
                            <p class="movie-revenue"><strong>Bevétel:</strong> $${movie.revenue.toLocaleString()}</p>
                            <p class="movie-budget"><strong>Költségvetés:</strong> $${movie.budget.toLocaleString()}</p>`;

                        moviesContainer.appendChild(movieElement2);

                    })
                    .catch(error => console.error('Error fetching trailer:', error));

                

                loadComments(movieId);

                


            })
            .catch(error => console.error('Error fetching movie:', error));
    }

    function loadComments(movieId) {
        fetch(`../backend/get_comments.php?movie_id=${movieId}`)
            .then(response => response.json())
            .then(data => {
                commentsContainer.innerHTML = '';
                if (data.comments && data.comments.length > 0) {
                    let totalRating = 0;
                    let recommendedCount = 0;
                    let notRecommendedCount = 0;


                    data.comments.forEach((comment, index) => {

                        totalRating += parseInt(comment.rating, 10);
                        if (comment.recommended) {
                            recommendedCount++;
                        } else {
                            notRecommendedCount++;
                        }

                        const commentElement = document.createElement('div');
                        commentElement.className = 'custom-comment-card';
                        commentElement.id = `comment-${index + 1}`;
                        commentElement.innerHTML = `
                            <div class="custom-comment-card-body">
                                <div class="comment-header">
                                    <h5 class="custom-comment-card-title">${comment.username}</h5>
                                    <div class="checkbox-wrapper-10" style="pointer-events: none;">
                                        <input type="checkbox" id="cb-${index}" class="tgl tgl-flip" ${comment.recommended ? 'checked' : ''} disabled>
                                        <label for="cb-${index}" data-tg-on="Ajánlom a filmet" data-tg-off="Nem ajánlom a filmet" class="tgl-btn"></label>
                                    </div>
                                    <div class="rating" style="pointer-events: none;">
                                        ${[5, 4, 3, 2, 1].map(value => `
                                            <input value="${value}" name="rate-${index}" id="star${value}-${index}" type="radio" ${comment.rating == value ? 'checked' : ''} disabled>
                                            <label title="text" for="star${value}-${index}"></label>
                                        `).join('')}
                                    </div>
                                    ${current_user_role === 1 || parseInt(comment.user_id, 10) === parseInt(current_user_id, 10) ? `
                                        <div class="delete-comment-container">
                                            <button class="delete-comment-btn btn btn-danger btn-sm" data-comment-id="${comment.id}">🗑️</button>
                                            <div class="confirm-buttons" style="display: none;">
                                                <button class="confirm-delete-btn btn btn-sm btn-success" data-comment-id="${comment.id}">✓</button>
                                                <button class="cancel-delete-btn btn btn-sm btn-secondary" style="background-color: red;">✗</button>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                                <p class="custom-comment-card-text">${comment.comment}</p>
                                <p class="custom-comment-card-text"><small>${comment.created_at}</small></p>
                                ${status === 'logged_in' ? `
                                    <div class="like-dislike-container">
                                        <button class="like-btn btn btn-success" data-comment-id="${comment.id}">
                                            👍 ${comment.like_count}
                                        </button>
                                        <button class="dislike-btn btn btn-danger" data-comment-id="${comment.id}">
                                            👎 ${comment.dislike_count}
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                        commentsContainer.appendChild(commentElement);
                    });

                    const averageRating = Math.round(totalRating / data.comments.length);
                    reviewSummary.innerHTML = `
                        <div class="checkbox-wrapper-10">
                            <input type="checkbox" class="tgl tgl-flip" checked disabled>
                            <label data-tg-on="Ajánlott: ${recommendedCount}" data-tg-off="Ajánlott: ${recommendedCount}" class="tgl-btn"></label>
                        </div>
                        <div class="checkbox-wrapper-10" style="margin-left: 10px;">
                            <input type="checkbox" class="tgl tgl-flip" disabled>
                            <label data-tg-off="Nem ajánlott: ${notRecommendedCount}" class="tgl-btn" style="color: red;"></label>
                        </div>
                        <div class="rating">
                            ${[5, 4, 3, 2, 1].map(value => `
                                <input value="${value}" name="average-rate" id="average-star${value}" type="radio" ${averageRating == value ? 'checked' : ''} disabled>
                                <label title="text" for="average-star${value}"></label>
                            `).join('')}
                        </div>
                    `;
                } else {
                    commentsContainer.innerHTML = '<p>Ezen a filmen nincs még vélemény.</p>';
                    reviewSummary.innerHTML = '';
                }
            })
            .catch(error => console.error('Error fetching comments:', error));
    }

    if (commentForm) {
        commentForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const comment = commentText.value.trim();
            const rating = document.querySelector('.rating input[name="rate"]:checked').value;
            const recommended = recommendedCheckbox.checked ? 1 : 0;
            const movieId = new URLSearchParams(window.location.search).get('id');

            if (comment && rating && recommended !== null) {
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
                            document.querySelector('.rating input[name="rate"]:checked').checked = false;
                            recommendedCheckbox.checked = false;
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

    commentsContainer.addEventListener('click', function (event) {
        const target = event.target;

        if (target.classList.contains('delete-comment-btn')) {
            const deleteContainer = target.closest('.delete-comment-container');
            const confirmButtons = deleteContainer.querySelector('.confirm-buttons');
            confirmButtons.style.display = 'block';
            target.style.display = 'none';
        }

        if (target.classList.contains('confirm-delete-btn')) {
            const commentId = target.dataset.commentId;


            fetch('../backend/delete_comment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment_id: commentId })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const movieId = new URLSearchParams(window.location.search).get('id');
                        loadComments(movieId);
                    }
                })
                .catch(error => console.error('Error deleting comment:', error));
        }

        if (target.classList.contains('cancel-delete-btn')) {
            const deleteContainer = target.closest('.delete-comment-container');
            const confirmButtons = deleteContainer.querySelector('.confirm-buttons');
            const deleteButton = deleteContainer.querySelector('.delete-comment-btn');
            confirmButtons.style.display = 'none';
            deleteButton.style.display = 'inline-block';
        }
    });

    commentsContainer.addEventListener('click', function (event) {
        const target = event.target;
    
        if (target.classList.contains('like-btn') || target.classList.contains('dislike-btn')) {
            const commentId = target.dataset.commentId;
            const likeType = target.classList.contains('like-btn') ? 1 : 0;
    
            fetch('../backend/like_comment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment_id: commentId, like_type: likeType })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const movieId = new URLSearchParams(window.location.search).get('id');
                        loadComments(movieId);
                    } else {
                        alert(data.message || 'Hiba történt a like/dislike mentése során.');
                    }
                })
                .catch(error => console.error('Error liking/disliking comment:', error));
        }
    });

    function searchMoviesByTitle(title) {
        const searchApiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${title}&language=hu-HU`;
        fetch(searchApiUrl)
            .then(response => response.json())
            .then(data => {
                moviesContainer.innerHTML = '';
                if (data.results) {
                    data.results.forEach(movie => {
                        const movieElement = document.createElement('div');
                        movieElement.className = 'col-md-3 movie';
                        movieElement.innerHTML = `
                            <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster">
                            <h3 class="movie-title">${movie.title}</h3>
                            <p class="movie-overview limited-overview">${movie.overview}</p>
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

    searchBar.addEventListener('input', function () {
        const query = searchBar.value.trim();
        if (query) {
            searchMoviesByTitle(query);
        } else {
            loadMovies(currentPage);
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (movieId) {
        loadMovieById(movieId);
        categoryColumn.style.display = 'none';
    } else {
        loadMovies(currentPage);
    }

    const commentSection = document.getElementById('comments');
    if (!movieId) {
        commentSection.style.display = 'none';
    }


    
    const urlParams2 = new URLSearchParams(window.location.search);
    const movieId2 = urlParams2.get("id");

    const tmlrElement = document.querySelector(".tmlr");
    const sidebarElement = document.querySelector(".sidebar");

    if (!movieId2 && tmlrElement && sidebarElement) {
        tmlrElement.classList.remove("col-md-3");
        tmlrElement.classList.add("col-md-12");
        sidebarElement.appendChild(tmlrElement);
    }

    const urlParams_ = new URLSearchParams(window.location.search);
    const backButton = document.getElementById("backButton");

    if (movieId !== null && movieId.trim() !== "") {
        backButton.style.display = "block";
    }

    function loadMovies(page = 1) {
        if (page < 1) page = 1;
        if (page > 500) page = 500;

        let apiUrlWithGenre = apiUrl;
        if (selectedGenreId) {
            apiUrlWithGenre = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${selectedGenreId}&language=hu-HU&page=${page}`;
        } else {
            apiUrlWithGenre = `${apiUrl}&page=${page}`;
        }

        fetch(apiUrlWithGenre)
            .then(response => response.json())
            .then(data => {
                moviesContainer.innerHTML = '';
                if (data.results) {
                    data.results.forEach(movie => {
                        const movieElement = document.createElement('div');
                        movieElement.className = 'col-md-3 movie';
                        movieElement.innerHTML = `
                            <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title} poster" class="movie-poster">
                            <h3 class="movie-title">${movie.title}</h3>
                            <p class="movie-overview limited-overview">${movie.overview}</p>
                        `;
                        movieElement.addEventListener('click', () => {
                            window.location.href = `filmek?id=${movie.id}`;
                        });
                        moviesContainer.appendChild(movieElement);
                    });
                    setupPagination(data.page, data.total_pages);
                } else {
                    console.error('No movies found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    function setupPagination(current, total) {
        paginationContainer.innerHTML = '';

        total = Math.min(total, 500);

        const prevButton = document.createElement('li');
        prevButton.className = `page-item ${current === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = `<a class="page-link" href="#" aria-label="Previous">&laquo;</a>`;
        prevButton.addEventListener('click', (event) => {
            if (current > 1) {
                loadMovies(current - 1);
            }
        });
        paginationContainer.appendChild(prevButton);

        const firstPageButton = document.createElement('li');
        firstPageButton.className = `page-item ${current === 1 ? 'active' : ''}`;
        firstPageButton.innerHTML = `<a class="page-link" href="#">1</a>`;
        firstPageButton.addEventListener('click', (event) => {
            loadMovies(1);
        });
        paginationContainer.appendChild(firstPageButton);

        if (current > 3) {
            const ellipsisStart = document.createElement('li');
            ellipsisStart.className = 'page-item disabled';
            ellipsisStart.innerHTML = `<a class="page-link" href="#">...</a>`;
            paginationContainer.appendChild(ellipsisStart);
        }

        const maxVisiblePages = 3;
        let startPage = Math.max(2, current - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(total - 1, current + Math.floor(maxVisiblePages / 2));

        if (current > total - 2) {
            startPage = Math.max(2, total - maxVisiblePages);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('li');
            pageButton.className = `page-item ${i === current ? 'active' : ''}`;
            pageButton.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageButton.addEventListener('click', (event) => {
                loadMovies(i);
            });
            paginationContainer.appendChild(pageButton);
        }

        if (current < total - 2) {
            const ellipsisEnd = document.createElement('li');
            ellipsisEnd.className = 'page-item disabled';
            ellipsisEnd.innerHTML = `<a class="page-link" href="#">...</a>`;
            paginationContainer.appendChild(ellipsisEnd);
        }

        const lastPageButton = document.createElement('li');
        lastPageButton.className = `page-item ${current === total ? 'active' : ''}`;
        lastPageButton.innerHTML = `<a class="page-link" href="#">${total}</a>`;
        lastPageButton.addEventListener('click', (event) => {
            loadMovies(total);
        });
        paginationContainer.appendChild(lastPageButton);

        const nextButton = document.createElement('li');
        nextButton.className = `page-item ${current === total ? 'disabled' : ''}`;
        nextButton.innerHTML = `<a class="page-link" href="#" aria-label="Next">&raquo;</a>`;
        nextButton.addEventListener('click', (event) => {
            if (current < total) {
                loadMovies(current + 1);
            }
        });
        paginationContainer.appendChild(nextButton);
    }

});
