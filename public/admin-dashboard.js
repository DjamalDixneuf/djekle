document.addEventListener('DOMContentLoaded', function() {
    const addMovieForm = document.getElementById('addMovieForm');
    const movieTableBody = document.getElementById('movieTableBody');
    const searchBar = document.getElementById('searchBar');

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

    function displayMovies(moviesToShow) {
        console.log('Affichage des films:', moviesToShow);
        movieTableBody.innerHTML = '';
        moviesToShow.forEach(movie => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${movie.title}</td>
                <td>${movie.genre}</td>
                <td>${movie.duration}</td>
                <td>${movie.releaseYear}</td>
                <td><button onclick="deleteMovie(${movie.id})">Supprimer</button></td>
            `;
            movieTableBody.appendChild(row);
        });
    }

    function addMovie(event) {
    event.preventDefault();
    console.log('Tentative d\'ajout de film');
    showLoading();
    const form = event.target;
    const movieData = {
        title: form.title.value.trim(),
        duration: form.duration.value.trim(),
        description: form.description.value.trim(),
        genre: form.genre.value.trim(),
        releaseYear: form.releaseYear.value,
        thumbnailUrl: form.thumbnailUrl.value.trim(),
        videoUrl: form.videoUrl.value.trim()
    };
    console.log('Données du film:', movieData);

    fetch(`${API_URL}/movies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
    })
    .then(response => {
        console.log('Statut de la réponse:', response.status);
        console.log('Headers de la réponse:', response.headers);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Succès:', data);
        loadMovies();
        form.reset();
    })
    .catch((error) => {
        console.error('Erreur détaillée:', error);
        alert(`Erreur lors de l'ajout du film: ${error.message}`);
    })
    .finally(() => {
        hideLoading();
    });
}

    window.deleteMovie = function(id) {
    showLoading();
    fetch(`${API_URL}/movies/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            });
        }
        console.log('Film supprimé avec succès');
        return loadMovies();
    })
    .catch((error) => {
        console.error('Erreur:', error);
        alert(`Erreur lors de la suppression du film: ${error.message}`);
    })
    .finally(() => {
        hideLoading();
    });
}

    function filterMovies() {
        const searchTerm = searchBar.value.toLowerCase();
        const filteredMovies = movies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm)
        );
        displayMovies(filteredMovies);
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
            alert('Erreur lors du chargement des films. Veuillez réessayer plus tard.');
        })
        .finally(() => {
            hideLoading();
        });
    }

    addMovieForm.addEventListener('submit', addMovie);
    searchBar.addEventListener('input', filterMovies);

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
