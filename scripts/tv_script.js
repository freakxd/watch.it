document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '5b10ee05a53140a03e252ca409834183';
    const apiUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=hu-HU`;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const categoryUrl = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=hu-HU`;

    const tvContainer = document.getElementById('tv-container');
    const categoryList = document.getElementById('category-list');

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
                    const categoryItem = document.createElement('li');
                    categoryItem.className = 'list-group-item category-item';
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
                        // Kiszűrjük a kínai karaktereket tartalmazó címeket és azokat, amelyeknek nincs leírásuk
                        if (!/[\u4e00-\u9fa5]/.test(tv.name) && tv.overview) {
                            const tvElement = document.createElement('div');
                            tvElement.className = 'col-md-4 tv';
                            tvElement.innerHTML = `
                                <img src="${imageBaseUrl + tv.poster_path}" alt="${tv.name} poster" class="tv-poster">
                                <h3 class="tv-title">${tv.name}</h3>
                                <p class="tv-overview">${tv.overview}</p>
                            `;
                            tvContainer.appendChild(tvElement);
                        }
                    });
                } else {
                    console.error('No tv found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching tv:', error));
    }

    // Alapértelmezett sorozatok betöltése
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results) {
                data.results.forEach(tv => {
                    // Kiszűrjük a kínai karaktereket tartalmazó címeket és azokat, amelyeknek nincs leírásuk
                    if (!/[\u4e00-\u9fa5]/.test(tv.name) && tv.overview) {
                        const tvElement = document.createElement('div');
                        tvElement.className = 'col-md-4 tv';
                        tvElement.innerHTML = `
                            <img src="${imageBaseUrl + tv.poster_path}" alt="${tv.name} poster" class="tv-poster">
                            <h3 class="tv-title">${tv.name}</h3>
                            <p class="tv-overview">${tv.overview}</p>
                        `;
                        tvContainer.appendChild(tvElement);
                    }
                });
            } else {
                console.error('No tv found in the response:', data);
            }
        })
        .catch(error => console.error('Error fetching tv:', error));
});