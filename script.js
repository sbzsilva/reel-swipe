// Global variables
let watchList = [];
const API_KEY = '<api-key-goes-here>'; // TMDb API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
let currentMovieDetails = null; // To store details of the currently selected movie

// Get DOM elements
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const movieResults = document.getElementById('movieResults');
const watchListResults = document.getElementById('watchListResults');
const filterButtons = document.querySelectorAll('.filter-btn');
const typeFilter = document.getElementById('typeFilter');
// Modal elements
const movieDetailsModal = document.getElementById('movieDetailsModal');
const modalTitle = document.getElementById('modalTitle');
const modalYear = document.getElementById('modalYear');
const modalGenre = document.getElementById('modalGenre');
const modalDirector = document.getElementById('modalDirector');
const modalCast = document.getElementById('modalCast');
const modalRating = document.getElementById('modalRating');
const modalOverview = document.getElementById('modalOverview');
const modalPoster = document.getElementById('modalPoster');

// Carousel state
let currentSlide = 0;
let currentTypeFilter = 'all'; // 'all', 'movie', or 'tv'

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedMovies();
    loadWatchList();
    
    // Event listeners
    searchBtn.addEventListener('click', searchMovies);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMovies();
        }
    });
    
    // Add click event to all filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', filterByGenre);
    });
    
    // Carousel navigation
    document.querySelector('#nextBtn').addEventListener('click', () => moveCarousel(1));
    document.querySelector('#prevBtn').addEventListener('click', () => moveCarousel(-1));
    document.querySelector('.watchlist-next').addEventListener('click', () => changeWatchlistCarousel(1));
    document.querySelector('.watchlist-prev').addEventListener('click', () => changeWatchlistCarousel(-1));
    
    // Type filter change
    typeFilter.addEventListener('change', function() {
        currentTypeFilter = this.value;
        
        // Reload movies based on current view
        if (!searchInput.value.trim() && !document.querySelector('.filter-btn.active')) {
            loadFeaturedMovies();
        } else if (document.querySelector('.filter-btn.active')) {
            const genre = document.querySelector('.filter-btn.active').dataset.genre;
            fetchMoviesByGenre(genre);
        } else {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                searchMoviesByQuery(searchTerm);
            }
        }
    });
    
    // Modal close handler
    document.querySelector('.btn-close').addEventListener('click', () => {
        if (movieDetailsModal) {
            movieDetailsModal.style.display = 'none';
            movieDetailsModal.classList.remove('show');
        }
    });
});

// Function to show movie details in modal
function showMovieDetails(movieId, type = 'movie') {
    // Build the API URL based on type
    const url = `${BASE_URL}/${type}/${movieId}?api_key=${API_KEY}&append_to_response=credits`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Store current movie details
            currentMovieDetails = data;
            
            // Update modal content
            modalTitle.textContent = data.title || data.name;
            modalYear.textContent = (data.release_date || data.first_air_date)?.split('-')[0] || 'N/A';
            
            // Format genres
            modalGenre.textContent = data.genres.map(genre => genre.name).join(', ') || 'N/A';
            
            // Find director(s)
            const directors = data.credits.crew.filter(member => member.job === 'Director');
            modalDirector.textContent = directors.length > 0 
                ? directors.map(d => d.name).join(', ') 
                : 'N/A';
            
            // Get main cast
            modalCast.textContent = data.credits.cast.slice(0, 5).map(actor => actor.name).join(', ') || 'N/A';
            
            // Rating
            modalRating.textContent = data.vote_average.toFixed(1);
            
            // Overview
            modalOverview.textContent = data.overview || 'No overview available.';
            
            // Poster
            modalPoster.src = data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
            
            // Show the modal
            if (movieDetailsModal) {
                movieDetailsModal.style.display = 'block';
                movieDetailsModal.classList.add('show');
            }
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            alert('Failed to load movie details. Please try again later.');
        });
}

// Move main carousel
function moveCarousel(direction) {
    const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    
    if (!track || items.length === 0) return;
    
    const itemWidth = items[0].offsetWidth + 16; // Include margin
    currentSlide += direction;
    
    // Wrap around when reaching the end
    if (currentSlide >= items.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = items.length - 1;
    }
    
    track.style.transform = `translateX(-${currentSlide * itemWidth}px)`;
}

// Move watchlist carousel
function changeWatchlistCarousel(direction) {
    const track = document.getElementById('watchListResults');
    const items = document.querySelectorAll('#watchListResults .carousel-item');
    
    if (items.length === 0) return;
    
    const itemWidth = items[0].offsetWidth + 16; // Include margin
    let currentPosition = parseInt(track.dataset.position || '0');
    
    // Calculate new position
    currentPosition += direction;
    
    // Prevent going out of bounds
    if (currentPosition < 0) {
        currentPosition = 0;
    } else if (currentPosition >= items.length) {
        currentPosition = items.length - 1;
    }
    
    // Update position and save it
    track.dataset.position = currentPosition;
    
    // Apply transformation
    track.style.transform = `translateX(-${currentPosition * itemWidth}px)`;
}

// Update carousel navigation visibility
function updateCarouselNavigation() {
    const items = document.querySelectorAll('.carousel-item');
    const isMobile = window.innerWidth < 768;
    const itemsPerView = isMobile ? 1 : (window.innerWidth < 992 ? 2 : 4);
    
    // Only show navigation if there are more items than can be displayed at once
    const hasNavigation = items.length > itemsPerView;
    const navButtons = document.querySelectorAll('.carousel-navigation');
    
    // Show/hide navigation buttons for each carousel
    navButtons.forEach(button => {
        button.style.display = hasNavigation ? 'block' : 'none';
    });
}

// Load featured movies
function loadFeaturedMovies() {
    // Clear previous results
    movieResults.innerHTML = '';
    
    // Reset carousel position
    currentSlide = 0;
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.style.transform = 'translateX(0px)';
    }
    
    // Get random genre
    const genres = ['comedy', 'action', 'drama', 'sci-fi', 'horror', 'romance'];
    const randomIndex = Math.floor(Math.random() * genres.length);
    const randomGenre = genres[randomIndex];
    
    // Display loading message
    movieResults.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    // Fetch popular movies
    if (currentTypeFilter === 'all') {
        fetchPopularMovies();
    } else {
        fetchPopularMoviesByType(currentTypeFilter);
    }
}

// Search movies by title
function searchMovies() {
    const searchTerm = searchInput.value.trim();
    
    // Validate input
    if (!searchTerm) {
        alert('Please enter a movie title to search');
        return;
    }
    
    // Reset carousel position
    resetCarousel();
    
    // Clear previous results
    clearSearchResults();
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Search for movies
    searchMoviesByQuery(searchTerm);
}

// Reset carousel position
function resetCarousel() {
    currentSlide = 0;
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.style.transform = 'translateX(0px)';
    }
}

// Clear search results containers
function clearSearchResults() {
    movieResults.innerHTML = '';
    watchListResults.innerHTML = '';
}

// Show loading indicator
function showLoadingIndicator() {
    movieResults.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

// Filter movies by genre
function filterByGenre(event) {
    // Remove active class from all buttons
    filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.currentTarget.classList.add('active');
    
    // Reset carousel position
    currentSlide = 0;
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.style.transform = 'translateX(0px)';
    }
    
    // Get selected genre
    const genre = event.currentTarget.dataset.genre;
    
    // Clear previous results
    movieResults.innerHTML = '';
    watchListResults.innerHTML = '';
    
    // Display loading message
    movieResults.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    // Fetch movies by genre
    fetchMoviesByGenre(genre);
}

// Fetch popular movies from TMDb
function fetchPopularMovies(page = 1) {
    // Build API URL based on type filter
    let url = '';
    if (currentTypeFilter === 'movie' || currentTypeFilter === 'tv') {
        url = `${BASE_URL}/${currentTypeFilter}/popular?api_key=${API_KEY}&page=${page}`;
    } else {
        url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;
    }
    
    // Fetch data from API
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Clear loading message
            movieResults.innerHTML = '';
            
            // Display movies
            displayMovies(data.results);
            
            // If more pages available, fetch additional results
            if (page < data.total_pages && page < 3) {  // Get up to 3 pages of results
                fetchPopularMovies(page + 1);
            }
            
            // Update carousel navigation after a short delay
            setTimeout(updateCarouselNavigation, 100);
        })
        .catch(error => {
            console.error('Error fetching movie data:', error);
            movieResults.innerHTML = `
                <div class="col-12 text-center">
                    <h4 class="text-white">Error fetching movie data. Please try again later.</h4>
                </div>
            `;
        });
}

// Fetch popular movies by type (movie or tv)
function fetchPopularMoviesByType(type, page = 1) {
    const url = `${BASE_URL}/${type}/popular?api_key=${API_KEY}&page=${page}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Clear loading message
            movieResults.innerHTML = '';
            
            // Display movies
            displayMovies(data.results);
            
            // If more pages available, fetch additional results
            if (page < data.total_pages && page < 3) {
                fetchPopularMoviesByType(type, page + 1);
            }
            
            // Update carousel navigation after a short delay
            setTimeout(updateCarouselNavigation, 100);
        })
        .catch(error => {
            console.error('Error fetching movie data:', error);
            movieResults.innerHTML = `
                <div class="col-12 text-center">
                    <h4 class="text-white">Error fetching movie data. Please try again later.</h4>
                </div>
            `;
        });
}

// Search movies by query with type filter
function searchMoviesByQuery(query, page = 1) {
    // Build API URL with type filter
    let url = '';
    if (currentTypeFilter === 'all') {
        // Search both movies and TV shows
        url = `${BASE_URL}/discover/${typeFilter.value === 'tv' ? 'tv' : 'movie'}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    } else {
        // Search specific type (movie or tv)
        url = `${BASE_URL}/${currentTypeFilter}/search?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Clear loading message
            movieResults.innerHTML = '';
            
            // Check if movies were found
            if (data.results && data.results.length > 0) {
                // Display search results
                displayMovies(data.results);
                
                // If more pages available, fetch additional results
                if (page < data.total_pages && page < 3) {
                    searchMoviesByQuery(query, page + 1);
                }
            } else {
                // Display no results message
                movieResults.innerHTML = `
                    <div class="col-12 text-center">
                        <h4 class="text-white">No ${currentTypeFilter === 'movie' ? 'movies' : (currentTypeFilter === 'tv' ? 'TV shows' : 'content')} found. Please try another search.</h4>
                    </div>
                `;
            }
            
            // Update carousel navigation after a short delay
            setTimeout(updateCarouselNavigation, 100);
        })
        .catch(error => {
            console.error('Error fetching movie data:', error);
            movieResults.innerHTML = `
                <div class="col-12 text-center">
                    <h4 class="text-white">Error fetching movie data. Please try again later.</h4>
                </div>
            `;
        });
}

// Fetch movies by genre with type filter
function fetchMoviesByGenre(genre) {
    // Map our simple genre names to TMDb genre IDs
    const genreMapping = {
        'comedy': 35,
        'action': 28,
        'drama': 18,
        'sci-fi': 878,
        'horror': 27,
        'romance': 10749
    };
    
    const genreId = genreMapping[genre.toLowerCase()] || 0;
    
    if (genreId === 0) {
        movieResults.innerHTML = `
            <div class="col-12 text-center">
                <h4 class="text-white">Genre not supported. Please try another genre.</h4>
            </div>
        `;
        return;
    }
    
    // Build API URL based on type filter
    let url = '';
    if (currentTypeFilter === 'all') {
        // By default, show movies if no specific type is selected
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
    } else {
        // Fetch specific type (movie or tv)
        url = `${BASE_URL}/discover/${currentTypeFilter}?api_key=${API_KEY}&with_genres=${genreId}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Clear loading message
            movieResults.innerHTML = '';
            
            // Check if movies were found
            if (data.results && data.results.length > 0) {
                // Display search results
                displayMovies(data.results);
            } else {
                // Display no results message
                movieResults.innerHTML = `
                    <div class="col-12 text-center">
                        <h4 class="text-white">No ${currentTypeFilter === 'movie' ? 'movies' : (currentTypeFilter === 'tv' ? 'TV shows' : 'content')} found for ${genre}. Please try another genre.</h4>
                    </div>
                `;
            }
            
            // Update carousel navigation after a short delay
            setTimeout(updateCarouselNavigation, 100);
        })
        .catch(error => {
            console.error('Error fetching movie data:', error);
            movieResults.innerHTML = `
                <div class="col-12 text-center">
                    <h4 class="text-white">Error fetching movie data. Please try again later.</h4>
                </div>
            `;
        });
}

// Display movies in the UI
function displayMovies(movies) {
    // Clear previous content
    movieResults.innerHTML = '';
    
    // Filter out movies without posters and map to simpler objects
    const validMovies = movies.filter(movie => movie.poster_path).map(movie => ({
        id: movie.id,
        title: movie.title || movie.name,
        year: (movie.release_date || movie.first_air_date)?.split('-')[0] || 'N/A',
        rating: movie.vote_average.toFixed(1),
        poster: movie.poster_path,
        overview: movie.overview || 'No overview available.',
        type: movie.title ? 'movie' : 'tv'
    }));
    
    // Display filtered movies
    validMovies.forEach(movie => {
        // Create card element
        const card = createMovieCard(movie);
        
        // Add click event to handle movie selection
        card.addEventListener('click', () => {
            console.log(`Fetching details for ${movie.id}`);
        });
        
        // Append card to results container
        movieResults.appendChild(card);
    });
    
    // Update carousel navigation after a short delay
    setTimeout(updateCarouselNavigation, 100);
}

// Create a single movie card element
function createMovieCard(movie) {
    // Create card element
    const card = document.createElement('div');
    card.className = 'carousel-item fade-in-up';
    
    // Create heart icon state based on watchlist status
    const isInWatchlist = watchList.some(item => item.id === movie.id && item.type === movie.type);
    
    card.innerHTML = `
        <div class="movie-card">
            <img src="${IMAGE_BASE_URL}${movie.poster}" class="movie-poster" alt="${movie.title} poster">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-year">${movie.year}</div>
                <div class="rating">Rating: ${movie.rating}/10</div>
            </div>
            <i class="fas fa-heart watchlist-icon ${isInWatchlist ? 'active' : ''}"></i>
        </div>
    `;
    
    // Add click event to handle movie selection
    card.addEventListener('click', () => {
        showMovieDetails(movie.id, movie.type);
    });
    
    // Add heart icon click event to add/remove from watchlist
    card.querySelector('.watchlist-icon').addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering the card click
        
        // Toggle watchlist status
        toggleWatchList(movie);
        this.classList.toggle('active');
    });
    
    return card;
}

// Load watch list from localStorage
function loadWatchList() {
    // Get watch list from localStorage or initialize empty array
    watchList = JSON.parse(localStorage.getItem('movieMatchWatchList')) || [];
    
    // Update the watchlist display
    updateWatchListDisplay();
}

// Toggle watch list
function toggleWatchList(movie) {
    // Check if movie is already in watch list
    const index = watchList.findIndex(item => item.id === movie.id && item.type === movie.type);
    
    if (index === -1) {
        // Add to watch list
        watchList.push(movie);
    } else {
        // Remove from watch list
        watchList.splice(index, 1);
    }
    
    // Save updated watch list to localStorage
    localStorage.setItem('movieMatchWatchList', JSON.stringify(watchList));
    
    // Update the watchlist display
    updateWatchListDisplay();
}

// Update watch list display
function updateWatchListDisplay() {
    // Clear previous content
    watchListResults.innerHTML = '';
    
    // If no movies in watch list, show message
    if (watchList.length === 0) {
        watchListResults.innerHTML = `
            <div class="col-12 text-center">
                <h4 class="text-white">Your watch list is empty. Add some movies!</h4>
            </div>
        `;
        return;
    }
    
    // Reset watchlist carousel position
    const watchlistTrack = document.getElementById('watchListResults');
    if (watchlistTrack) {
        watchlistTrack.style.transform = 'translateX(0px)';
        watchlistTrack.dataset.position = '0';
    }
    
    // Create HTML for each movie in watch list
    watchList.forEach(movie => {
        // Create card element
        const card = document.createElement('div');
        card.className = 'carousel-item fade-in-up';
        card.innerHTML = `
            <div class="movie-card">
                <img src="${IMAGE_BASE_URL}${movie.poster}" class="movie-poster" alt="${movie.title} poster">
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-year">${movie.release_year}</div>
                    <div class="rating">Rating: ${movie.rating} / 10</div>
                </div>
                <i class="fas fa-heart watchlist-icon active"></i>
            </div>
        `;
        
        // Add click event to remove from watch list
        card.addEventListener('click', () => {
            // Remove from watch list
            const index = watchList.findIndex(item => item.id === movie.id && item.type === movie.type);
            if (index !== -1) {
                watchList.splice(index, 1);
                // Update localStorage and display
                localStorage.setItem('movieMatchWatchList', JSON.stringify(watchList));
                updateWatchListDisplay();
                // Update carousel navigation after a short delay
                setTimeout(updateCarouselNavigation, 100);
            }
        });
        
        // Append card to watch list container
        watchListResults.appendChild(card);
    });
    
    // Update carousel navigation after a short delay
    setTimeout(updateCarouselNavigation, 100);
}

// Utility function to shuffle array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Handle window resize
window.addEventListener('resize', function() {
    // Debounce resize events
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(function() {
        updateCarouselNavigation();
    }, 250);
});