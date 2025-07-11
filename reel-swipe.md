# IST107 - Introduction to Internet Programming
## Individual Project Description Form

### Project Title:
**"Reel Swipe"**

---
### Student Name & ID:
| Student Name          | Student No  |
|-----------------------|-------------|
| Sergio Silva          | CT100xxxx      |

---

## 1. Application Poster
**Visual Elements:**
- A movie-themed interface with film reel icons
- Movie poster thumbnails with hover effects
- Title: **"Reel Swipe"** with tagline: **"Find your perfect film every time!"**
- Search bar with movie genre filters

---

## 2. Application Description
**Introduction:**
*Reel Swipe* is a web app designed to help users discover movies based on their preferences and mood.

**Goal:**
To provide personalized movie recommendations through an intuitive interface with advanced filtering options.

**Target Audience:**
- Movie enthusiasts
- Casual viewers looking for entertainment
- Friends or couples choosing what to watch together

**Features:**
- Personalized movie recommendations
- Advanced search by genre, year, and rating
- Movie details including cast, synopsis, and trailers

**Why This Idea?**
We often struggled to choose what to watch, so we wanted to create a tool that makes movie selection easier and more enjoyable.

**Conclusion:**
This app stands out by combining personal preference tracking with comprehensive movie information from multiple sources.

---

## 3. Main Features
| No | Feature Description          |
|----|-------------------------------|
| 1  | **Movie Recommendations**     |
|    | *Purpose*: Suggest films based on user preferences |
|    | *Interaction*: Click "Surprise Me" button |
|    | *Value*: Personalized entertainment |
| 2  | **Advanced Search**           |
|    | *Purpose*: Find specific movies |
|    | *Interaction*: Filter by genre, year, rating |
|    | *Value*: Precise movie discovery |
| 3  | **Movie Details**             |
|    | *Purpose*: View comprehensive information |
|    | *Interaction*: Click movie poster/title |
|    | *Value*: Informed viewing decisions |
| 4  | **Watch List**                |
|    | *Purpose*: Save movies for later |
|    | *Interaction*: Click heart icon to add/remove |
|    | *Value*: Track interesting finds |
| 5  | **Ratings System**            |
|    | *Purpose*: Share opinions with community |
|    | *Interaction*: Rate movies with 1-5 stars |
|    | *Value*: Better future recommendations |

---

## 4. Happy Path
1. User clicks "Surprise Me" to get a random comedy recommendation
2. Views movie details including trailer and cast information
3. Adds favorite movie to watch list
4. Rates recently watched movie with 4 stars
5. Returns later to see improved recommendations based on ratings

---

## 5. Tools & Libraries
| Tool/Library  | Purpose                          | Version  |
|---------------|----------------------------------|----------|
| HTML/CSS      | Structure & styling              | -        |
| JavaScript    | Interactive elements             | ES6      |
| Font Awesome  | Movie-related icons              | 6.4      |
| Google Fonts  | Typography (Oswald)              | -        |
| TMDB API      | Movie database integration       | 3.0      |
| **Deployment**: GitHub Pages                   |

---

## 6. Installation
1. Clone repo: `git clone https://github.com/username/reel-swipe.git`
2. Install dependencies: `npm install`
3. Start local server: `npm start`
4. Open browser to http://localhost:3000/

---

## 7. Source Code
- **GitHub Repo**: [github.com/username/reel-swipe](https://github.com/username/reel-swipe)
- **Files**: 
  - `/index.html`
  - `/css/styles.css`
  - `/js/script.js`
  - `/api/movie-api.js` (TMDB integration)

---

## 8. Future Enhancements
- **Streaming Info**: Show where to watch each movie
- **Group Watch**: Create shared watch lists for friends/family
- **AI Recommendations**: Implement machine learning for better suggestions

---

## 9. GUI Description
### Page: Dashboard
**Screenshot**: ![Movie interface](mockup-movie.png)
**Description**:
- Displays recommended movies and search controls
- **Feature**: Interactive movie cards with hover animations
- **Interactions**: 
  - Click poster for detailed view
  - Click heart icon to save movie
  - Click category buttons to filter results
- **Content**: Featured recommendations, search controls, trending movies section