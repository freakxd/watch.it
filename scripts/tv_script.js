document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '5b10ee05a53140a03e252ca409834183';
    const apiUrl = 'https://api.themoviedb.org/3/tv/popular?api_key=' + apiKey;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    fetch(apiUrl, {
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YjEwZWUwNWE1MzE0MGEwM2UyNTJjYTQwOTgzNDE4MyIsIm5iZiI6MTczNTA4OTYwNC4yMDYsInN1YiI6IjY3NmI1ZGM0ODU5NDYzMzk2M2E5ZWU5MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.iaWAQj5ocu-frdCmloEz7_raQ-KvE_uiOMrdhVHUC20'
        }
    })
    .then(response => response.json())
    .then(data => {
        const tvContainer = document.getElementById('tv-container');
        if (data.results) {
            data.results.forEach(tv => {
                const tvElement = document.createElement('div');
                tvElement.className = 'tv';
                tvElement.innerHTML = `
                    <img src="${imageBaseUrl + tv.poster_path}" alt="${tv.name} poster" class="tv-poster">
                    <h3 class="tv-title">${tv.name}</h3>
                    <p class="tv-overview">${tv.overview}</p>
                `;
                tvContainer.appendChild(tvElement);
            });
        } else {
            console.error('No tv found in the response:', data);
        }
    })
    .catch(error => console.error('Error fetching tv:', error));
});