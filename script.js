// Global variables
const API_KEY = '3d550f13bf38922d1c02e08010c00197'; // TMDb API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Get DOM elements
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const movieResults = document.getElementById('movieResults');
const filterButtons = document.querySelectorAll('.filter-btn');

// Carousel state
let currentSlide = 0;

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners
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
});

// Move carousel left or right
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


// Update carousel navigation visibility based on screen size
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

// Search movies by title
function searchMovies() {
    const searchTerm = searchInput.value.trim();
    
    // Reset carousel position
    currentSlide = 0;
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.style.transform = 'translateX(0px)';
    }
    
    if (!searchTerm) {
        alert('Please enter a movie title to search');
        return;
    }
    
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
    
    // Build API URL
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}`;
    
    // Fetch data from API
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
                        <h4 class="text-white">No movies found. Please try another search.</h4>
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
    
    // Build API URL
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
    
    // Fetch data from API
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
                        <h4 class="text-white">No movies found for ${genre}. Please try another genre.</h4>
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
    // Shuffle array to get more interesting results
    const shuffledMovies = shuffleArray(movies);
    
    // Create HTML for each movie card
    shuffledMovies.forEach(movie => {
        // Skip movies without posters
        if (!movie.poster_path) return;
        
        // Determine if it's a movie or TV show
        const isMovie = movie.title ? true : false;
        const title = movie.title || movie.name;
        const releaseDate = movie.release_date || movie.first_air_date;
        const voteAverage = movie.vote_average.toFixed(1);
        
        // Create card element
        const card = document.createElement('div');
        card.className = 'carousel-item fade-in-up';
        card.innerHTML = `
            <div class="movie-card">
                <img src="${IMAGE_BASE_URL}${movie.poster_path}" class="movie-poster" alt="${title} poster">
                <div class="movie-info">
                    <div class="movie-title">${title}</div>
                    <div class="movie-year">${releaseDate ? releaseDate.split('-')[0] : 'N/A'}</div>
                    <div class="rating">
                        Rating: ${voteAverage} / 10
                    </div>
                </div>
                <i class="fas fa-heart watchlist-icon"></i>
            </div>
        `;
        
        // Add click event to show movie details
        card.addEventListener('click', function() {
            console.log(`Fetching details for ${movie.id}`);
        });
        
                
        // Append card to results container
        movieResults.appendChild(card);
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