document.addEventListener('DOMContentLoaded', function () {
    const apiKey = '5b10ee05a53140a03e252ca409834183';
    const apiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=hu-HU&sort_by=popularity.desc`;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const categoryUrl = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=hu-HU`;

    const tvContainer = document.getElementById('tv-container');
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

    //vélemény íráshoz megnézi, be van-e jelentkezve a felhasználó
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

    //kategóriák magyar nevei
        const categoryNames = {
        "Action & Adventure": "Akció és Kaland",
        "Animation": "Animáció",
        "Comedy": "Vígjáték",
        "Crime": "Bűnügyi",
        "Documentary": "Dokumentumfilm",
        "Drama": "Dráma",
        "Family": "Családi",
        "Kids": "Gyerek",
        "Mystery": "Misztikus",
        "News": "Hírek",
        "Reality": "Valóság",
        "Sci-Fi & Fantasy": "Sci-fi és Fantasy",
        "Soap": "Szappanopera",
        "Talk": "Beszélgetős műsor",
        "War & Politics": "Háború és Politika",
        "Western": "Western"
    };

    //kategóriák betöltése
    fetch(categoryUrl)
        .then(response => response.json())
        .then(data => {
            if (data.genres) {
                data.genres.forEach(genre => {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category2';

                    const categoryApiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${genre.id}&language=hu-HU`;
                    fetch(categoryApiUrl)
                        .then(response => response.json())
                        .then(tvData => {
                            const tvCount = tvData.total_results;
                            categoryItem.textContent = `${categoryNames[genre.name] || genre.name} (${tvCount})`;
                        })

                    categoryItem.dataset.genreId = genre.id;
                    categoryItem.addEventListener('click', () => loadTvByCategory(genre.id));
                    categoryList.appendChild(categoryItem);
                });
            }
        })

    //kategória alapján sorozatok betöltése
    function loadTvByCategory(genreId) {
        selectedGenreId = genreId;
        currentPage = 1;
        loadTvShows(currentPage);
    }

    //egy adott sorozat betöltése
    function loadTvById(tvId) {
        const tvApiUrl = `https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}&language=hu-HU`;
        const videoApiUrl = `https://api.themoviedb.org/3/tv/${tvId}/videos?api_key=${apiKey}`;

        fetch(tvApiUrl)
            .then(response => response.json())
            .then(tv => {
                if (!/[^\u0000-\u007F]+/.test(tv.name)) {
                    tvContainer.innerHTML = '';
                    const tvElement = document.createElement('div');
                    tvElement.className = 'col-md-4 tv';
                    tvElement.innerHTML = `
                        <img src="${imageBaseUrl + tv.poster_path}" alt="${tv.name} poster" class="tv-poster"> 
                    `;
                    tvContainer.appendChild(tvElement);

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
                                    tvContainer.appendChild(trailerElement);
                                }
                            }
                            else {
                                const trailerElement = document.createElement('div');
                                trailerElement.className = 'col-md-8 trailer';
                                trailerElement.innerHTML = `
                                    <h4>Trailer</h4>
                                    <p>Nincs elérhető előzetes.</p>
                                `;
                                tvContainer.appendChild(trailerElement);
                            }
                            const tvElement = document.createElement('div');
                    tvElement.className = 'col-md-12';
                    tvElement.innerHTML = `
                        
                        <h3 class="tv-title">${tv.name}</h3>
                       <p class="tv-overview">${tv.overview}</p>
                        <p><strong>Eredeti cím:</strong> ${tv.original_name}</p>
                        <p><strong>Első adás dátuma:</strong> ${tv.first_air_date}</p>
                        <p><strong>Értékelés:</strong> ${tv.vote_average} (${tv.vote_count} szavazat)</p>
                        <p><strong>Nyelv:</strong> ${tv.original_language}</p>
                        <p><strong>Státusz:</strong> ${tv.status}</p>
                        <p><strong>Tagline:</strong> ${tv.tagline}</p>
                        <p><strong>Gyártó cégek:</strong> ${tv.production_companies.map(company => company.name).join(', ')}</p>
                        <p><strong>Gyártó országok:</strong> ${tv.production_countries.map(country => country.name).join(', ')}</p>
                        <p><strong>Epizódok száma:</strong> ${tv.number_of_episodes}</p>
                        <p><strong>Évadok száma:</strong> ${tv.number_of_seasons}</p> 
                        <p><strong>Weboldal:</strong> <a href="${tv.homepage}" target="_blank">${tv.homepage}</a></p>
                    `;
                    tvContainer.appendChild(tvElement);

                            loadComments(tvId);
                        })
                }
            })
    }

    //vélemények betöltése
    function loadComments(tvId) {
        fetch(`../backend/get_comments.php?series_id=${tvId}`)
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
                                        <label for="cb-${index}" data-tg-on="Ajánlom a sorozatot" data-tg-off="Nem ajánlom a sorozatot" class="tgl-btn"></label>
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
                            <label data-tg-on="Ajánlott: ${recommendedCount}" data-tg-off="Ajánlott: ${recommendedCount}" class="tgl-btn" style="margin-left: 7px;"></label>
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

                    if (data.comments.length > 10) {
                        const scrollSpy = new bootstrap.ScrollSpy(document.body, {
                            target: '#comments-section'
                        });
                    }
                } else {
                    commentsContainer.innerHTML = '<p>Nincs még vélemény.</p>';
                    reviewSummary.innerHTML = '';
                }
            })
    }

    //vélemény írása, mentése
    if (commentForm) {
        commentForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const comment = commentText.value.trim();
            const rating = document.querySelector('.rating input[name="rate"]:checked').value;
            const recommended = recommendedCheckbox.checked ? 1 : 0;
            const seriesId = new URLSearchParams(window.location.search).get('id');

            if (comment && rating && recommended !== null) {
                fetch('../backend/save_comment.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ series_id: seriesId, comment: comment, rating: rating, recommended: recommended })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            commentText.value = '';
                            document.querySelector('.rating input[name="rate"]:checked').checked = false;
                            recommendedCheckbox.checked = false;
                            loadComments(seriesId);
                        }
                    })
            }
        });
    }

    //vélemény törlése
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
                        const tvId = new URLSearchParams(window.location.search).get('id');
                        loadComments(tvId);
                    }
                })
        }

        if (target.classList.contains('cancel-delete-btn')) {
            const deleteContainer = target.closest('.delete-comment-container');
            const confirmButtons = deleteContainer.querySelector('.confirm-buttons');
            const deleteButton = deleteContainer.querySelector('.delete-comment-btn');
            confirmButtons.style.display = 'none';
            deleteButton.style.display = 'inline-block';
        }
    });

    //like/dislike gombok eseménykezelője
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
                        const tvId = new URLSearchParams(window.location.search).get('id');
                        loadComments(tvId);
                    }
                })
        }
    });

    //keresés
    function searchTvByTitle(title) {
        const searchApiUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${title}&language=hu-HU`;
        fetch(searchApiUrl)
            .then(response => response.json())
            .then(data => {
                tvContainer.innerHTML = '';
                if (data.results) {
                    data.results.forEach(tv => {
                        if (!/[^\u0000-\u007F]+/.test(tv.name)) {
                            const tvElement = document.createElement('div');
                            tvElement.className = 'col-md-4 tv';
                            tvElement.innerHTML = `
                                <img src="${imageBaseUrl + tv.poster_path}" alt="${tv.name} poster" class="tv-poster">
                                <h3 class="tv-title">${tv.name}</h3>
                                <p class="tv-overview">${tv.overview}</p>
                            `;
                            tvElement.addEventListener('click', () => {
                                window.location.href = `sorozatok?id=${tv.id}`;
                            });
                            tvContainer.appendChild(tvElement);
                        }
                    });
                }
            })
    }

    searchBar.addEventListener('input', function () {
        const query = searchBar.value.trim();
        if (query) {
            searchTvByTitle(query);
        } else {
            loadTvShows(currentPage);
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const tvId = urlParams.get('id');

    if (tvId) {
        loadTvById(tvId);
        categoryColumn.style.display = 'none';
    } else {
        loadTvShows(currentPage);
    }

    const commentSection = document.getElementById('comments');
    if (!tvId) {
        commentSection.style.display = 'none';
    }

    const backButton = document.getElementById("backButton");

    if (tvId !== null && tvId.trim() !== "") {
        backButton.style.display = "block";
    }

    function loadTvShows(page = 1) {
        if (page < 1) page = 1;
        if (page > 500) page = 500;

        let apiUrlWithGenre = apiUrl;
        if (selectedGenreId) {
            apiUrlWithGenre = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${selectedGenreId}&language=hu-HU&page=${page}`;
        } else {
            apiUrlWithGenre = `${apiUrl}&page=${page}`;
        }

        fetch(apiUrlWithGenre)
            .then(response => response.json())
            .then(data => {
                tvContainer.innerHTML = '';
                if (data.results) {
                    data.results.forEach(tv => {
                        if (!/[^\u0000-\u007F]+/.test(tv.name)){
                            const tvElement = document.createElement('div');
                            tvElement.className = 'col-md-3 tv';
                            tvElement.innerHTML = `
                                <img src="${imageBaseUrl + tv.poster_path}" alt="${tv.name} poster" class="tv-poster">
                                <h3 class="tv-title">${tv.name}</h3>
                                <p class="tv-overview limited-overview">${tv.overview}</p>
                            `;
                            tvElement.addEventListener('click', () => {
                                window.location.href = `sorozatok?id=${tv.id}`;
                            });
                            tvContainer.appendChild(tvElement);
                        }
                    });
                    setupPagination(data.page, data.total_pages);
                }
            })
    }

    function setupPagination(current, total) {
        paginationContainer.innerHTML = '';

        total = Math.min(total, 500);

        const prevButton = document.createElement('li');
        prevButton.className = `page-item ${current === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = `<a class="page-link" href="#" aria-label="Previous">&laquo;</a>`;
        prevButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (current > 1) {
                loadTvShows(current - 1);
            }
        });
        paginationContainer.appendChild(prevButton);

        const firstPageButton = document.createElement('li');
        firstPageButton.className = `page-item ${current === 1 ? 'active' : ''}`;
        firstPageButton.innerHTML = `<a class="page-link" href="#">1</a>`;
        firstPageButton.addEventListener('click', (event) => {
            event.preventDefault();
            loadTvShows(1);
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
                event.preventDefault();
                loadTvShows(i);
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
            event.preventDefault();
            loadTvShows(total);
        });
        paginationContainer.appendChild(lastPageButton);

        const nextButton = document.createElement('li');
        nextButton.className = `page-item ${current === total ? 'disabled' : ''}`;
        nextButton.innerHTML = `<a class="page-link" href="#" aria-label="Next">&raquo;</a>`;
        nextButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (current < total) {
                loadTvShows(current + 1);
            }
        });
        paginationContainer.appendChild(nextButton);
    }
});