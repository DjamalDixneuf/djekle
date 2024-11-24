document.addEventListener('DOMContentLoaded', function() {
    const movieTableBody = document.getElementById('movieTableBody');
    const requestTableBody = document.getElementById('requestTableBody');
    const addMovieForm = document.getElementById('addMovieForm');
    const logoutButton = document.getElementById('logoutButton');
    const typeSelect = document.getElementById('type');
    const episodesContainer = document.getElementById('episodesContainer');
    const episodeCountInput = document.getElementById('episodeCount');
    const filmFields = document.getElementById('filmFields');
    const serieFields = document.getElementById('serieFields');

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

    function loadMovieRequests() {
        showLoading();
        fetch(`${API_URL}/movie-requests`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(requests => {
                displayMovieRequests(requests);
            })
            .catch(error => {
                console.error('Error loading movie requests:', error);
                alert('Error loading movie requests. Please try again.');
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
                <td>${movie.type}</td>
                <td>${movie.genre}</td>
                <td>${movie.duration}</td>
                <td>${movie.releaseYear}</td>
                <td>${movie.type === 'série' ? (movie.episodes ? movie.episodes.length : 'N/A') : 'N/A'}</td>
                <td>
                    <button onclick="deleteMovie('${movie._id}')" class="delete-btn">Delete</button>
                </td>
            `;
            movieTableBody.appendChild(row);
        });
    }

    function displayMovieRequests(requests) {
        requestTableBody.innerHTML = '';
        requests.forEach(request => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${request.title}</td>
                <td><a href="${request.imdbLink}" target="_blank">${request.imdbLink}</a></td>
                <td>${request.comment || 'N/A'}</td>
                <td>
                    <button onclick="approveRequest('${request._id}')" class="approve-btn">Approve</button>
                    <button onclick="rejectRequest('${request._id}')" class="reject-btn">Reject</button>
                </td>
            `;
            requestTableBody.appendChild(row);
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

    window.approveRequest = function(id) {
        showLoading();
        fetch(`${API_URL}/movie-requests/${id}/approve`, { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                loadMovieRequests();
                loadMovies();
            })
            .catch(error => {
                console.error('Error approving request:', error);
                alert('Error approving request. Please try again.');
            })
            .finally(() => {
                hideLoading();
            });
    }

    window.rejectRequest = function(id) {
        showLoading();
        fetch(`${API_URL}/movie-requests/${id}/reject`, { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                loadMovieRequests();
            })
            .catch(error => {
                console.error('Error rejecting request:', error);
                alert('Error rejecting request. Please try again.');
            })
            .finally(() => {
                hideLoading();
            });
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', function() {
            if (this.value === 'série') {
                filmFields.style.display = 'none';
                serieFields.style.display = 'block';
            } else {
                filmFields.style.display = 'block';
                serieFields.style.display = 'none';
                episodesContainer.innerHTML = '';
            }
        });
    }

    if (episodeCountInput) {
        episodeCountInput.addEventListener('input', function() {
            const count = parseInt(this.value) || 0;
            episodesContainer.innerHTML = '';
            for (let i = 1; i <= count; i++) {
                episodesContainer.innerHTML += `
                    <div class="episode-fields">
                        <h4>Épisode ${i}</h4>
                        <label for="episodeUrl${i}">URL de l'épisode ${i}</label>
                        <input type="url" id="episodeUrl${i}" name="episodeUrl${i}" required>
                        <label for="episodeDescription${i}">Description de l'épisode ${i}</label>
                        <textarea id="episodeDescription${i}" name="episodeDescription${i}" required></textarea>
                    </div>
                `;
            }
        });
    }

    if (addMovieForm) {
        addMovieForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(addMovieForm);
            const movieData = Object.fromEntries(formData.entries());

            if (movieData.type === 'série') {
                movieData.episodes = [];
                const episodeCount = parseInt(movieData.episodeCount) || 0;
                for (let i = 1; i <= episodeCount; i++) {
                    movieData.episodes.push({
                        url: movieData[`episodeUrl${i}`],
                        description: movieData[`episodeDescription${i}`]
                    });
                    delete movieData[`episodeUrl${i}`];
                    delete movieData[`episodeDescription${i}`];
                }
                delete movieData.singleVideoUrl;
            } else {
                movieData.videoUrl = movieData.singleVideoUrl;
                delete movieData.singleVideoUrl;
                delete movieData.episodeCount;
            }

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
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }

    // Initial load
    loadMovies();
    loadMovieRequests();
});
