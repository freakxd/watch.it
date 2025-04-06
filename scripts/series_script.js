document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'af4dd2043e5bb18501bb32fdc7daf585';
    const apiUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=hu-HU`;
    const onTheAirApiUrl = `https://api.themoviedb.org/3/tv/on_the_air?api_key=${apiKey}&language=hu-HU`;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    //const categoryUrl = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=hu-HU`;

    const topSeries = document.getElementById('custom-top-series');
    const onAirSeries = document.getElementById('custom-on-air-series');
    const seriesListLimit = 5;
    const onAirListLimit = 5;
    var seriesListNr = 1;
    var onAirListNr = 1;
   
    fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    
                    data.results.forEach(series => {
                        if (!/[^\u0000-\u007F]+/.test(series.name)) {

                            

                            if (topSeries.childElementCount >= seriesListLimit) {
                                return;
                            }

                            const seriesElement = document.createElement('div');
                            seriesElement.className = 'custom-list-group-item-withcard';

                            const seriesImage = document.createElement('img');
                            seriesImage.src = `${imageBaseUrl}${series.poster_path}`;
                            seriesImage.alt = series.name;
                            seriesImage.className = 'custom-series-image';


                            seriesElement.innerHTML = `
                            <div class="custom-list-group-item-card">
                                <img src="${imageBaseUrl}${series.poster_path}" alt="${series.name}" class="custom-series-image">
                                <div class="title">` + seriesListNr + `. ${series.name}</div>
                            </div>`;

                            seriesElement.addEventListener('click', () => {
                                window.location.href = `sorozatok?id=${series.id}`;
                            });
                            

                            topSeries.appendChild(seriesElement);

                            seriesListNr++;

                           
                        }
                    });
                } else {
                    console.error('No series found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching series:', error));

    fetch(onTheAirApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    data.results.forEach(onair => {
                        if (!/[^\u0000-\u007F]+/.test(onair.name)) {

                            if (onAirSeries.childElementCount >= onAirListLimit) {
                                return;
                            }

                            const seriesElement = document.createElement('div');
                            seriesElement.className = 'custom-list-group-item-withcard';

                            const seriesImage = document.createElement('img');
                            seriesImage.src = `${imageBaseUrl}${onair.poster_path}`;
                            seriesImage.alt = onair.name;
                            seriesImage.className = 'custom-series-image';


                            seriesElement.innerHTML = `
                            <div class="custom-list-group-item-card">
                                <img src="${imageBaseUrl}${onair.poster_path}" alt="${onair.name}" class="custom-series-image">
                                <div class="title">` + onAirListNr + `. ${onair.name}</div>
                            </div>`;

                           


                            
                            seriesElement.addEventListener('click', () => {
                                window.location.href = `sorozatok?id=${onair.id}`;
                            });
                            onAirSeries.appendChild(seriesElement);

                            onAirListNr++;
                        }
                    });
                } else {
                    console.error('No series found in the response:', data);
                }
            })
            .catch(error => console.error('Error fetching series:', error));







            const urlParams2 = new URLSearchParams(window.location.search);
            const movieId2 = urlParams2.get("id");
        
            const tmlrElement = document.querySelector(".tmlr");
            const sidebarElement = document.querySelector(".sidebar");
        
            if (!movieId2 && tmlrElement && sidebarElement) {
                tmlrElement.classList.remove("col-md-3");
                tmlrElement.classList.add("col-md-12");
                sidebarElement.appendChild(tmlrElement);
            }


});