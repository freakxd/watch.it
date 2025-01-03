window.addEventListener('load', function() {
    setTimeout(function() {
        var loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 1000); // Match the duration of the fade-out animation
    }, 750);
});