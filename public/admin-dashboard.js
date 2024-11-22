document.addEventListener('DOMContentLoaded', function() {
    const movieTableBody = document.getElementById('movieTableBody');
    const addMovieForm = document.getElementById('addMovieForm');
    const logoutButton = document.getElementById('logoutButton');

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
        showLoading();
        fetch(`${API_URL}/movies`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(movies => {
                displayMovies(movies);
            })
            .catch(error => {
                console.error('Error loading movies:', error);
                alert('Error loading movies. Please try again.');
            })
            .finally(() => {
                hideLoading();
            });
    }

    function displayMovies(movies) {
        movieTableBody.innerHTML = '';
        movies.forEach(movie => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${movie.title}</td>
                <td>${movie.genre}</td>
                <td>${movie.duration}</td>
                <td>${movie.releaseYear}</td>
                <td>
                    <button onclick="deleteMovie('${movie._id}')" class="delete-btn">Delete</button>
                </td>
            `;
            movieTableBody.appendChild(row);
        });
    }

    window.deleteMovie = function(id) {
        if (confirm('Are you sure you want to delete this movie?')) {
            showLoading();
            fetch(`${API_URL}/movies/${id}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    loadMovies();
                })
                .catch(error => {
                    console.error('Error deleting movie:', error);
                    alert('Error deleting movie. Please try again.');
                })
                .finally(() => {
                    hideLoading();
                });
        }
    }

    if (addMovieForm) {
        addMovieForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(addMovieForm);
            const movieData = Object.fromEntries(formData.entries());

            showLoading();
            fetch(`${API_URL}/movies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movieData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(() => {
                addMovieForm.reset();
                loadMovies();
            })
            .catch(error => {
                console.error('Error adding movie:', error);
                alert('Error adding movie. Please try again.');
            })
            .finally(() => {
                hideLoading();
            });
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Ajoutez ici la logique de déconnexion
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }

    loadMovies();
});
