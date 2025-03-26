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

    let userId = null;
    let status = 'not_logged_in';
    fetch('../backend/check_login.php')
        .then(response => response.json())
        .then(data => {
            status = data.status;
            userId = data.user_id || null;
            if (status == "not_logged_in") {
                commentText.disabled = true;
                commentText.placeholder = 'Jelentkezz be, hogy véleményt írhass!';
                document.querySelectorAll('.rating input').forEach(input => input.disabled = true);
                recommendedCheckbox.disabled = true;
            }
        })
        .catch(error => console.error('Error checking login status:', error));

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

    fetch(categoryUrl)
        .then(response => response.json())
        .then(data => {
            if (data.genres) {
                data.genres.forEach(genre => {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category2';
                    categoryItem.textContent = categoryNames[genre.name] || genre.name;
                    categoryItem.dataset.genreId = genre.id;
                    categoryItem.addEventListener('click', () => loadTvByCategory(genre.id));
                    categoryList.appendChild(categoryItem);
                });
            } else {
                console.error('No genres found in the response:', data);
            }
        })
        .catch(error => console.error('Error fetching genres:', error));

    function loadTvByCategory(genreId) {
        const categoryApiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${genreId}&language=hu-HU`;
        fetch(categoryApiUrl)
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
                } else {
                    console.error('No tv found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching tv:', error));
    }

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

                    fetch(videoApiUrl)
                        .then(response => response.json())
                        .then(data => {
                            if (data.results && data.results.length > 0) {
                                const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
                                if (trailer) {
                                    const trailerElement = document.createElement('div');
                                    trailerElement.className = 'col-md-8 trailer';
                                    trailerElement.innerHTML = `
                                        <h4>Trailer</h4>
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

                            loadComments(tvId);
                        })
                        .catch(error => console.error('Error fetching trailer:', error));
                } else {
                    console.error('No detailed information found for tv:', tvId);
                }
            })
            .catch(error => console.error('Error fetching tv:', error));
    }

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
                        totalRating += comment.rating;
                        if (comment.recommended) {
                            recommendedCount++;
                        } else {
                            notRecommendedCount++;
                        }

                        const commentElement = document.createElement('div');
                        commentElement.className = 'custom-comment-card bg-light text-dark mb-3';
                        commentElement.id = `comment-${index + 1}`;
                        commentElement.innerHTML = `
                            <div class="custom-comment-card-body">
                                <div class="comment-header">
                                    <h5 class="custom-comment-card-title">${comment.username}</h5>
                                    <div class="checkbox-wrapper-10" onmousedown="return false;" onselectstart="return false;">
                                        <input type="checkbox" id="cb-${index}" class="tgl tgl-flip" ${comment.recommended ? 'checked' : ''} disabled>
                                        <label for="cb-${index}" data-tg-on="Ajánlom a filmet!" data-tg-off="Nem ajánlom a filmet." class="tgl-btn"></label>
                                    </div>
                                    <div class="rating" onmousedown="return false;" onselectstart="return false;">
                                        ${[5, 4, 3, 2, 1].map(value => `
                                            <input value="${value}" name="rate-${index}" id="star${value}-${index}" type="radio" ${comment.rating == value ? 'checked' : ''} disabled>
                                            <label title="text" for="star${value}-${index}"></label>
                                        `).join('')}
                                    </div>
                                </div>
                                <p class="custom-comment-card-text">${comment.comment}</p>
                                <p class="custom-comment-card-text"><small class="text-muted">${comment.created_at}</small></p>
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
            .catch(error => console.error('Error fetching comments:', error));
    }

    if (commentForm) {
        commentForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const comment = commentText.value.trim();
            const rating = document.querySelector('.rating input:checked').value;
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
                            document.querySelector('.rating input:checked').checked = false;
                            recommendedCheckbox.checked = false;
                            loadComments(seriesId);
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
                } else {
                    console.error('No tv found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching tv:', error));
    }

    searchBar.addEventListener('input', function () {
        const query = searchBar.value.trim();
        if (query) {
            searchTvByTitle(query);
        } else {
            fetch(apiUrl)
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
                    } else {
                        console.error('No tv found in the response:', data);
                    }
                })
                .catch(error => console.error('Error fetching tv:', error));
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const tvId = urlParams.get('id');

    if (tvId) {
        loadTvById(tvId);
        categoryColumn.style.display = 'none';
    } else {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
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
                } else {
                    console.error('No tv found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching tv:', error));
    }

    const commentSection = document.getElementById('comments');
    if (!tvId) {
        commentSection.style.display = 'none';
    }
});
