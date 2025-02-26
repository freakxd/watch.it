document.addEventListener('DOMContentLoaded', function() {
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
                    categoryItem.addEventListener('click', () => loadTvByCategory(genre.id));
                    categoryList.appendChild(categoryItem);
                });
            } else {
                console.error('No genres found in the response:', data);
            }
        })
        .catch(error => console.error('Error fetching genres:', error));

    // Sorozatok betöltése kategória alapján
    function loadTvByCategory(genreId) {
        const categoryApiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${genreId}&language=hu-HU`;
        fetch(categoryApiUrl)
            .then(response => response.json())
            .then(data => {
                tvContainer.innerHTML = ''; // Töröljük a korábbi sorozatokat
                if (data.results) {
                    data.results.forEach(tv => {
                        if (!/[^\u0000-\u007F]+/.test(tv.name)) { // Kizárjuk azokat a sorozatokat, amelyek címében kínai vagy japán karakterek találhatók, illetve amelyeknek nincs leírásuk
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

    // Egy adott sorozat betöltése
    function loadTvById(tvId) {
        const tvApiUrl = `https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}&language=hu-HU`;
        const videoApiUrl = `https://api.themoviedb.org/3/tv/${tvId}/videos?api_key=${apiKey}&language=hu-HU`;

        fetch(tvApiUrl)
            .then(response => response.json())
            .then(tv => {
                if (!/[^\u0000-\u007F]+/.test(tv.name)) { // Kizárjuk azokat a sorozatokat, amelyek címében kínai vagy japán karakterek találhatók, illetve amelyeknek nincs leírásuk
                    tvContainer.innerHTML = ''; // Töröljük a korábbi sorozatokat
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
                                        <h4>Trailer</h4>
                                        <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
                                    `;
                                    tvContainer.appendChild(trailerElement);
                                }
                            }
                            else{
                                const trailerElement = document.createElement('div');
                                trailerElement.className = 'col-md-8 trailer';
                                trailerElement.innerHTML = `
                                    <h4>Trailer</h4>
                                    <p>Nincs elérhető előzetes.</p>
                                `;
                                tvContainer.appendChild(trailerElement);
                            }

                            // Kommentek betöltése
                            loadComments(tvId);
                        })
                        .catch(error => console.error('Error fetching trailer:', error));
                } else {
                    console.error('No detailed information found for tv:', tvId);
                }
            })
            .catch(error => console.error('Error fetching tv:', error));
    }

    // Kommentek betöltése
    function loadComments(tvId) {
        fetch(`../backend/get_comments.php?series_id=${tvId}`)
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
                    commentsContainer.innerHTML = '<p>Nincs még vélemény.</p>';
                }
            })
            .catch(error => console.error('Error fetching comments:', error));
    }

    // Komment mentése
    if (commentForm) {
        commentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const comment = commentText.value.trim();
            const seriesId = new URLSearchParams(window.location.search).get('id');

            if (comment) {
                fetch('../backend/save_comment.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ series_id: seriesId, comment: comment })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        commentText.value = '';
                        loadComments(seriesId);
                    } else {
                        console.error(data.message);
                    }
                })
                .catch(error => console.error('Error saving comment:', error));
            }
        });
    }

    // Sorozatok keresése cím alapján
    function searchTvByTitle(title) {
        const searchApiUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${title}&language=hu-HU`;
        fetch(searchApiUrl)
            .then(response => response.json())
            .then(data => {
                tvContainer.innerHTML = ''; // Töröljük a korábbi sorozatokat
                if (data.results) {
                    data.results.forEach(tv => {
                        if (!/[^\u0000-\u007F]+/.test(tv.name)) { // Kizárjuk azokat a sorozatokat, amelyek címében kínai vagy japán karakterek találhatók, illetve amelyeknek nincs leírásuk
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

    // Keresősáv eseménykezelője
    searchBar.addEventListener('input', function() {
        const query = searchBar.value.trim();
        if (query) {
            searchTvByTitle(query);
        } else {
            // Alapértelmezett sorozatok betöltése, ha a keresősáv üres
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    tvContainer.innerHTML = ''; // Töröljük a korábbi sorozatokat
                    if (data.results) {
                        data.results.forEach(tv => {
                            if (!/[^\u0000-\u007F]+/.test(tv.name)) { // Kizárjuk azokat a sorozatokat, amelyek címében kínai vagy japán karakterek találhatók
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

    // URL paraméterek ellenőrzése
    const urlParams = new URLSearchParams(window.location.search);
    const tvId = urlParams.get('id');

    if (tvId) {
        // Ha van 'id' paraméter az URL-ben, akkor az adott sorozatot töltjük be
        loadTvById(tvId);
        // Elrejtjük a kategóriák oszlopot
        categoryColumn.style.display = 'none';
    } else {
        // Alapértelmezett sorozatok betöltése
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    data.results.forEach(tv => {
                        if (!/[^\u0000-\u007F]+/.test(tv.name)) { // Kizárjuk azokat a sorozatokat, amelyek címében kínai vagy japán karakterek találhatók, illetve amelyeknek nincs leírásuk
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