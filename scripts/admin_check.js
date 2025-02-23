document.addEventListener('DOMContentLoaded', function() {
    // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve és jogosult-e az admin oldal megtekintésére
    $.ajax({
        url: '../backend/check_login.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status !== 'logged_in' || response.role < 1) {
                // Ha a felhasználó nincs bejelentkezve vagy nem jogosult, átirányítjuk a főoldalra
                window.location.href = '../pages/index';
            }
        },
        error: function() {
            // Ha hiba történt az ellenőrzés során, átirányítjuk a főoldalra
            window.location.href = '../pages/index';
        }
    });
});