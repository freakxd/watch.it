document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'af4dd2043e5bb18501bb32fdc7daf585';
    const apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=hu-HU`;
    const onTheAirApiUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=hu-HU`;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    const topMovies = document.getElementById('custom-top-movies');
    const upcomingMoviesDIV = document.getElementById('custom-latest-releases');
    const topMoviesLimit = 5;
    const upcomingMoviesLimit = 5;
    var topMoviesNr = 1;
    var upcomingMoviesNr = 1;

    //top filmek és legújabb filmek
   
    fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    
                    data.results.forEach(movie => {
                        if (!/[^\u0000-\u007F]+/.test(movie.title)) {

                            

                            if (topMovies.childElementCount >= topMoviesLimit) {
                                return;
                            }

                            const movieElement = document.createElement('div');
                            movieElement.className = 'custom-list-group-item-withcard';

                            const movieImage = document.createElement('img');
                            movieImage.src = `${imageBaseUrl}${movie.poster_path}`;
                            movieImage.alt = movie.title;
                            movieImage.className = 'custom-movie-image';


                            movieElement.innerHTML = `
                            <div class="custom-list-group-item-card">
                                <img src="${imageBaseUrl}${movie.poster_path}" alt="${movie.title}" class="custom-movie-image">
                                <div class="title">` + topMoviesNr + `. ${movie.title}</div>
                            </div>`;

                            movieElement.addEventListener('click', () => {
                                window.location.href = `filmek?id=${movie.id}`;
                            });
                            

                            topMovies.appendChild(movieElement);

                            topMoviesNr++;

                           
                        }
                    });
                }
            })

    fetch(onTheAirApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    data.results.forEach(upcomingMovies => {
                        if (!/[^\u0000-\u007F]+/.test(upcomingMovies.title)) {

                            if (upcomingMoviesDIV.childElementCount >= upcomingMoviesLimit) {
                                return;
                            }

                            const upcomingElement = document.createElement('div');
                            upcomingElement.className = 'custom-list-group-item-withcard';

                            const upcomingimg = document.createElement('img');
                            upcomingimg.src = `${imageBaseUrl}${upcomingMovies.poster_path}`;
                            upcomingimg.alt = upcomingMovies.title;
                            upcomingimg.className = 'custom-series-image';


                            upcomingElement.innerHTML = `
                            <div class="custom-list-group-item-card">
                                <img src="${imageBaseUrl}${upcomingMovies.poster_path}" alt="${upcomingMovies.title}" class="custom-series-image">
                                <div class="title">` + upcomingMoviesNr + `. ${upcomingMovies.title}</div>
                            </div>`;

                           


                            
                            upcomingElement.addEventListener('click', () => {
                                window.location.href = `filmek?id=${upcomingMovies.id}`;
                            });
                            upcomingMoviesDIV.appendChild(upcomingElement);

                            upcomingMoviesNr++;
                        }
                    });
                }
            })
});
