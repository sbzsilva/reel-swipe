// Global variables
let watchList = [];
const API_KEY = '3d550f13bf38922d1c02e08010c00197'; // TMDb API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM elements
const $searchBtn = $('#searchBtn');
const $searchInput = $('#searchInput');
const $movieResults = $('#movieResults');

// Initialize the app
function init() {
    // Event listeners
    $searchBtn.on('click', searchMovies);
    $searchInput.on('keypress', function(e) {
        if (e.which === 13) {
            searchMovies();
        }
    });
}

// Search movies by title
function searchMovies() {
    // Get search term
    const searchTerm = $searchInput.val().trim();

    if (!searchTerm) {
        alert('Please enter a movie title to search');
        return;
    }

    // Clear previous results
    $movieResults.empty();
    
    // Display loading message
    $movieResults.append(`<div class="col-12 text-center">
                        <div class="spinner-border text-danger" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>`);

    // Build API URL
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}`;

    // Fetch data from API
    $.ajax({
        url: url,
        method: 'GET'
    })
    .done(function(response) {
        // Clear loading message
        $movieResults.empty();
        
        // Check if movies were found
        if (response.results && response.results.length > 0) {
            // Display search results
            displayMovies(response.results);
        } else {
            // Display no results message
            $movieResults.append(`<div class="col-12 text-center">
                                <h4 class="text-white">No movies found. Please try another search.</h4>
                            </div>`);
        }
    })
    .fail(function(error) {
        // Handle error
        console.error('Error fetching movie data:', error);
        $movieResults.empty();
        $movieResults.append(`<div class="col-12 text-center">
                            <h4 class="text-white">Error fetching movie data. Please try again later.</h4>
                        </div>`);
    });
}

// Display movies in the UI
function displayMovies(movies) {
    // Create HTML for each movie card
    movies.forEach(movie => {
        // Skip movies without posters
        if (!movie.poster_path) return;
        
        // Create card element
        const $card = $(`
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card bg-dark text-white">
                    <img src="${IMAGE_BASE_URL}${movie.poster_path}" class="card-img-top" alt="${movie.title} poster">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <p class="card-text">Release: ${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                        <p class="card-text">Rating: ${movie.vote_average.toFixed(1)} / 10</p>
                    </div>
                </div>
            </div>
        `);
        
        // Append card to results container
        $movieResults.append($card);
    });
}

// Document ready
$(document).ready(function() {
    init();
});