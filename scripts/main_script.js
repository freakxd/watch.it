window.addEventListener('load', function () { //töltőképernyő
    setTimeout(function () {
        var loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(function () {
            loadingScreen.style.display = 'none';
        }, 1000);
    }, 750);
});

$(document).ready(function () {

    // fekete-fehér mód

    let darkmode = localStorage.getItem('darkmode');
    const feketeFeher = document.getElementById("fekete-feher");

    const enableDarkmode = () => {
        document.body.classList.add('darkmode');
        localStorage.setItem('darkmode', 'active');
        feketeFeher.checked = true; 
    };

    const disableDarkmode = () => {
        document.body.classList.remove('darkmode');
        localStorage.setItem('darkmode', 'null');
        feketeFeher.checked = false; 
    };

    if (darkmode === "active") {
        enableDarkmode();
    } else {
        disableDarkmode();
    }

    if (feketeFeher) {
        feketeFeher.addEventListener("change", () => {
            if (feketeFeher.checked) {
                enableDarkmode();
            } else {
                disableDarkmode();
            }
        });
    }

    // Profil beállítások megjelenítése

    document.getElementById('settings_profile').addEventListener('click', function () {
        document.getElementById('profile_form').style.display = 'block';
        document.getElementById('security_password_form').style.display = 'none';
        document.getElementById('security_email_form').style.display = 'none';
    });

    document.getElementById('settings_security').addEventListener('click', function () {
        document.getElementById('profile_form').style.display = 'none';
        document.getElementById('security_password_form').style.display = 'block';
        document.getElementById('security_email_form').style.display = 'block';
    });

    $('#profile_form').on('submit', function(event) {
        event.preventDefault();
        var newUsername = $('#profile_username').val();

        $.ajax({
            url: '../backend/update_profile.php',
            type: 'POST',
            data: { username: newUsername },
            success: function(response) {
                if (response.status === 'success') {
                    $('#div_profileAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                    if (response.redirect) {
                        setTimeout(function() {
                            window.location.href = response.redirect;
                        }, 3000);
                    }
                } else {
                    $('#div_profileAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            }
        });
    });

    $('#security_password_form').on('submit', function (event) {
        event.preventDefault();
        var oldPassword = $('#security_password_old').val();
        var newPassword = $('#security_password_new').val();
        var verificationCode = $('#password_verification_code').val();

        if (verificationCode) {
            $.ajax({
                url: '../backend/security_verification_code.php',
                type: 'POST',
                data: { oldPassword: oldPassword, code: verificationCode },
                success: function (response) {
                    if (response.status === 'success') {
                        $.ajax({
                            url: '../backend/update_password.php',
                            type: 'POST',
                            data: {
                                oldPassword: oldPassword,
                                newPassword: newPassword
                            },
                            success: function (response) {
                                if (response.status === 'success') {
                                    $('#div_passwordAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                                } else {
                                    $('#div_passwordAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                                }
                            }
                        });
                    } else {
                        $('#div_passwordAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                    }
                }
            });
        } else {
            $.ajax({
                url: '../backend/security_verification_code.php',
                type: 'POST',
                data: { oldPassword: oldPassword },
                success: function (response) {
                    if (response.status === 'success') {
                        $('#password_verification_code_div').show();
                        $('#div_passwordAlert').html('<div class="alert alert-success">Megerősítő kódot küldtünk az e-mail címére.</div>');
                    } else {
                        $('#div_passwordAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                    }
                }
            });
        }
    });

    $('#security_email_form').on('submit', function (event) {
        event.preventDefault();
        var oldEmail = $('#security_email_old').val();
        var newEmail = $('#security_email_new').val();
        var verificationCode = $('#email_verification_code').val();

        if (verificationCode) {
            $.ajax({
                url: '../backend/security_verification_code.php',
                type: 'POST',
                data: { oldEmail: oldEmail, new_email: newEmail, code: verificationCode },
                success: function (response) {
                    if (response.status === 'success') {
                        $.ajax({
                            url: '../backend/update_email.php',
                            type: 'POST',
                            data: {
                                oldEmail: oldEmail,
                                newEmail: newEmail
                            },
                            success: function (response) {
                                if (response.status === 'success') {
                                    $('#div_emailAlert').html('<div class="alert alert-success">Az e-mail cím sikeresen megváltozott.</div>');
                                } else {
                                    $('#div_emailAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                                }
                            }
                        });
                    } else {
                        $('#div_emailAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                    }
                }
            });
        } else {
            $.ajax({
                url: '../backend/security_verification_code.php',
                type: 'POST',
                data: { oldEmail: oldEmail, new_email: newEmail },
                success: function (response) {
                    if (response.status === 'success') {
                        $('#email_verification_code_div').show();
                        $('#div_emailAlert').html('<div class="alert alert-success">Megerősítő kódot küldtünk az új e-mail címére.</div>');
                    } else {
                        $('#div_emailAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                    }
                }
            });
        }
    });

    $('#forgotpassword_form').on('submit', function(event) {
        event.preventDefault();
        var email = $('#forgotpassword_email').val();

        $.ajax({
            url: '../backend/forgot_password.php',
            type: 'POST',
            data: { forgotpassword_email: email },
            success: function(response) {
                if (response.status === 'success') {
                    $('#div_forgotpasswordAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                    $('#forgotpassword_form').hide();
                    $('#verify_form_forgotpassword').show();
                } else {
                    $('#div_forgotpasswordAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            }
        });
    });

    $('#verify_form_forgotpassword').on('submit', function(event) {
        event.preventDefault();
        var verificationCode = $('#verification_code_forgotpassword').val();

        $.ajax({
            url: '../backend/verify_forgotpassword_code.php',
            type: 'POST',
            data: { verification_code: verificationCode },
            success: function(response) {
                if (response.status === 'success') {
                    $('#div_verifyAlert_forgotpassword').html('<div class="alert alert-success">' + response.message + '</div>');
                    $('#modal_forgotpassword').modal('hide');
                    $('#modal_newpassword').modal('show');
                } else {
                    $('#div_verifyAlert_forgotpassword').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            }
        });
    });

    $('#newpassword_form').on('submit', function(event) {
        event.preventDefault();
        var newPassword = $('#new_password').val();
        var verificationCode = $('#verification_code_forgotpassword').val();

        $.ajax({
            url: '../backend/new_password.php',
            type: 'POST',
            data: { new_password: newPassword, verification_code: verificationCode },
            success: function(response) {
                if (response.status === 'success') {
                    $('#div_newpasswordAlert').html('<div class="alert alert-success">' + response.message + '</div>');
                } else {
                    $('#div_newpasswordAlert').html('<div class="alert alert-danger">' + response.message + '</div>');
                }
            }
        });
    });

    const apiKey = '5b10ee05a53140a03e252ca409834183';
    const latestMoviesUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=hu-HU`;
    const topRatedMoviesUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=hu-HU`;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    fetch(latestMoviesUrl)
        .then(response => response.json())
        .then(data => {
            const latestMoviesSeriesContainer = $('#latestMoviesCarousel .carousel-inner');
            
            let itemsPerSlide = 5;
            let carouselItem = $('<div class="carousel-item"></div>');
            data.results.forEach((movie, index) => {
                if (index % itemsPerSlide === 0) {
                    carouselItem = $('<div class="carousel-item"></div>');
                    if (index === 0) {
                        carouselItem.addClass('active');
                    }
                    latestMoviesSeriesContainer.append(carouselItem);
                }
                carouselItem.append(`
                    <div class="col-md-2 d-inline-block">
                        <a href="../pages/filmek?id=${movie.id}">
                            <img class="poszterkep" style="margin-left:90px; width: 200px; height: 300px;" src="${imageBaseUrl + movie.poster_path}" alt="${movie.title}" class="img-fluid">
                        </a>
                    </div>
                `);
            });
        })

    fetch(topRatedMoviesUrl)
        .then(response => response.json())
        .then(data => {
            const topRatedMoviesSeriesContainer = $('#topRatedMoviesCarousel .carousel-inner');
            let itemsPerSlide = 5;
            let carouselItem = $('<div class="carousel-item"></div>');
            data.results.forEach((movie, index) => {
                if (index % itemsPerSlide === 0) {
                    carouselItem = $('<div class="carousel-item"></div>');
                    if (index === 0) {
                        carouselItem.addClass('active');
                    }
                    topRatedMoviesSeriesContainer.append(carouselItem);
                }
                carouselItem.append(`
                    <div class="col-md-2 d-inline-block">
                        <a href="../pages/filmek?id=${movie.id}">
                            <img class="poszterkep" style="margin-left:90px; width: 200px; height: 300px;" src="${imageBaseUrl + movie.poster_path}" alt="${movie.title}" class="img-fluid">
                        </a>
                    </div>
                `);
            });
        })

        $(".arrows").on("click", function() {
            var targetElement = document.querySelector(".latest-movies-title");
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });

});