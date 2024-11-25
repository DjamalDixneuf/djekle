document.addEventListener('DOMContentLoaded', function() {
    const newReleasesContainer = document.querySelector('#newReleases .grid');
    const popularMoviesContainer = document.querySelector('#popularMovies .grid');
    const moviesContainer = document.getElementById('moviesContainer');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const videoPlayer = document.getElementById('videoPlayer');
    const movieDetails = document.getElementById('movieDetails');
    const episodeSelector = document.getElementById('episodeSelector');
    const logoutButton = document.getElementById('logoutButton');
    const userButton = document.getElementById('userButton');
    const toggleDesktopModeButton = document.getElementById('toggleDesktopMode');

    let movies = [];
    
    const API_URL = '/.netlify/functions/api';

    function showLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.id = 'loading';
        loadingElement.textContent = 'Chargement...';
        loadingElement.style.position = 'fixed';
        loadingElement.style.top = '50%';
        loadingElement.style.left = '50%';
        loadingElement.style.transform = 'translate(-50%, -50%)';
        loadingElement.style.padding = '10px';
        loadingElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingElement.style.color = 'white';
        loadingElement.style.borderRadius = '5px';
        loadingElement.style.zIndex = '1000';
        document.body.appendChild(loadingElement);
    }

    function hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    function loadMovies() {
        console.log('Chargement des films...');
        showLoading();
        fetch(`${API_URL}/movies`)
        .then(response => {
            console.log('Réponse reçue:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Films reçus:', data);
            movies = Array.isArray(data) ? data : [];
            displayMovies(movies);
            displayNewReleases(movies);
            displayPopularMovies(movies);
        })
        .catch((error) => {
            console.error('Error:', error);
            moviesContainer.innerHTML = '<p class="error-message">Erreur lors du chargement des films. Veuillez réessayer plus tard.</p>';
        })
        .finally(() => {
            hideLoading();
        });
    }

    function getEmbedUrl(url) {
        const driveMatch = url.match(/(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/([^/]+)/);
        if (driveMatch) {
            const fileId = driveMatch[1];
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
        return url;
    }

    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.className = 'card';
        movieCard.innerHTML = `
            <img src="${movie.thumbnailUrl}" alt="${movie.title}" onclick="watchMovie('${movie._id}')">
            <div class="card-content">
                <h3>${movie.title}</h3>
                <p>${movie.duration}</p>
                <p>${movie.type === 'série' ? (movie.episodes ? movie.episodes.length : '0') + ' épisodes' : 'Film'}</p>
            </div>
        `;
        return movieCard;
    }

    function displayMovies(moviesToShow) {
        moviesContainer.innerHTML = '';
        if (moviesToShow.length === 0) {
            moviesContainer.innerHTML = '<p class="no-movies">Aucun film disponible</p>';
            return;
        }
        moviesToShow.forEach(movie => {
            moviesContainer.appendChild(createMovieCard(movie));
        });
    }

    function displayNewReleases(allMovies) {
        const newReleases = allMovies.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)).slice(0, 4);
        newReleasesContainer.innerHTML = '';
        newReleases.forEach(movie => {
            newReleasesContainer.appendChild(createMovieCard(movie));
        });
    }

    function displayPopularMovies(allMovies) {
        const popularMovies = allMovies.sort((a, b) => b.popularity - a.popularity).slice(0, 4);
        popularMoviesContainer.innerHTML = '';
        popularMovies.forEach(movie => {
            popularMoviesContainer.appendChild(createMovieCard(movie));
        });
    }

    function filterMovies() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredMovies = movies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm)
        );
        displayMovies(filteredMovies);
    }

    window.watchMovie = function(id) {
        const movie = movies.find(m => m._id === id);
        if (movie) {
            if (movie.type === 'série') {
                episodeSelector.innerHTML = '<option value="">Sélectionnez un épisode</option>';
                movie.episodes.forEach((episode, index) => {
                    episodeSelector.innerHTML += `<option value="${index}">Épisode ${index + 1}</option>`;
                });
                episodeSelector.style.display = 'block';
                episodeSelector.onchange = function() {
                    const selectedEpisode = movie.episodes[this.value];
                    if (selectedEpisode) {
                        const embedUrl = getEmbedUrl(selectedEpisode.url);
                        videoPlayer.src = embedUrl;
                        movieDetails.innerHTML = `
                            <h2>${movie.title} - Épisode ${parseInt(this.value) + 1}</h2>
                            <p>${selectedEpisode.description}</p>
                        `;
                    }
                };
                // Afficher le premier épisode par défaut
                episodeSelector.value = "0";
                episodeSelector.onchange();
            } else {
                episodeSelector.style.display = 'none';
                const embedUrl = getEmbedUrl(movie.videoUrl);
                videoPlayer.src = embedUrl;
                movieDetails.innerHTML = `
                    <h2>${movie.title}</h2>
                    <p>${movie.duration}</p>
                    <p>${movie.description}</p>
                `;
            }
            modal.style.display = 'block';
        }
    }

    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            videoPlayer.src = '';
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            videoPlayer.src = '';
        }
    }

    function toggleDesktopMode() {
        document.body.classList.toggle('desktop-mode');
        if (document.body.classList.contains('desktop-mode')) {
            toggleDesktopModeButton.textContent = 'Mode Mobile';
        } else {
            toggleDesktopModeButton.textContent = 'Mode Ordinateur';
        }
    }

    function updateToggleButtonVisibility() {
        if (window.innerWidth <= 768) {
            toggleDesktopModeButton.style.display = 'block';
        } else {
            toggleDesktopModeButton.style.display = 'none';
            document.body.classList.remove('desktop-mode');
        }
    }

    searchInput.addEventListener('input', filterMovies);

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }

    if (userButton) {
        userButton.addEventListener('click', function() {
            window.location.href = 'requeste movie.html';
        });
    }

    if (toggleDesktopModeButton) {
        toggleDesktopModeButton.addEventListener('click', toggleDesktopMode);
    }

    window.addEventListener('resize', updateToggleButtonVisibility);
    updateToggleButtonVisibility();

    loadMovies();
});
