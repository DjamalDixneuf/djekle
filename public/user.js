document.addEventListener('DOMContentLoaded', function() {
    const moviesContainer = document.getElementById('moviesContainer');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const videoPlayer = document.getElementById('videoPlayer');
    const movieDetails = document.getElementById('movieDetails');

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

    function displayMovies(moviesToShow) {
        moviesContainer.innerHTML = '';
        if (moviesToShow.length === 0) {
            moviesContainer.innerHTML = '<p class="no-movies">Aucun film disponible</p>';
            return;
        }
        moviesToShow.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'card';
            movieCard.innerHTML = `
                <img src="${movie.thumbnailUrl}" alt="${movie.title}">
                <div class="card-content">
                    <h3>${movie.title}</h3>
                    <p>${movie.duration}</p>
                    <button onclick="watchMovie(${movie.id})">Regarder</button>
                </div>
            `;
            moviesContainer.appendChild(movieCard);
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
        const movie = movies.find(m => m.id === id);
        if (movie) {
            const embedUrl = getEmbedUrl(movie.videoUrl);
            videoPlayer.src = embedUrl;
            movieDetails.innerHTML = `
                <h2>${movie.title}</h2>
                <p>${movie.duration}</p>
                <p>${movie.description}</p>
            `;
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

    searchInput.addEventListener('input', filterMovies);

    loadMovies();
});
// Gestion de la déconnexion
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Ici, vous pouvez ajouter toute logique de nettoyage nécessaire
            // Par exemple, supprimer les tokens d'authentification du localStorage

            // Redirection vers la page de connexion
            window.location.href = 'index.html';
        });
    }
