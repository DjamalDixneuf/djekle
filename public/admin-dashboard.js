document.addEventListener('DOMContentLoaded', function() {
    const addMovieForm = document.getElementById('addMovieForm');
    const movieTableBody = document.getElementById('movieTableBody');
    const requestTableBody = document.getElementById('requestTableBody');
    const searchBar = document.getElementById('searchBar');

    let movies = [];
    let requests = [];
    const API_URL = '/api';

    function displayMovies(moviesToShow) {
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

    function displayRequests() {
        requestTableBody.innerHTML = '';
        requests.forEach(request => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${request.title}</td>
                <td><a href="${request.imdbLink}" target="_blank">${request.imdbLink}</a></td>
                <td>${request.comment || 'Aucun commentaire'}</td>
                <td>
                    <button onclick="approveRequest(${request.id})">Approuver</button>
                    <button onclick="rejectRequest(${request.id})">Rejeter</button>
                </td>
            `;
            requestTableBody.appendChild(row);
        });
    }

    function addMovie(event) {
        event.preventDefault();
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

        fetch(`${API_URL}/movies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadMovies();
            form.reset();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    window.deleteMovie = function(id) {
        fetch(`${API_URL}/movies/${id}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadMovies();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    window.approveRequest = function(id) {
        // Ici, vous pouvez implémenter la logique pour approuver une demande
        console.log('Approuver la demande:', id);
        // Après approbation, vous pouvez retirer la demande de la liste
        requests = requests.filter(request => request.id !== id);
        displayRequests();
    }

    window.rejectRequest = function(id) {
        // Ici, vous pouvez implémenter la logique pour rejeter une demande
        console.log('Rejeter la demande:', id);
        // Après rejet, vous pouvez retirer la demande de la liste
        requests = requests.filter(request => request.id !== id);
        displayRequests();
    }

    function filterMovies() {
        const searchTerm = searchBar.value.toLowerCase();
        const filteredMovies = movies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm)
        );
        displayMovies(filteredMovies);
    }

    function loadMovies() {
        fetch(`${API_URL}/movies`)
        .then(response => response.json())
        .then(data => {
            movies = data.data;
            displayMovies(movies);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function loadRequests() {
        // Récupérer les demandes depuis le stockage local
        const storedRequests = JSON.parse(localStorage.getItem('movieRequests')) || [];
        requests = storedRequests.map((request, index) => ({
            id: index + 1,
            ...request
        }));
        displayRequests();
    }

    addMovieForm.addEventListener('submit', addMovie);
    searchBar.addEventListener('input', filterMovies);

    loadMovies();
    loadRequests();

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
});
