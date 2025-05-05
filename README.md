# Spotify Artist Data API with Supabase

This project provides a system to fetch artist data from the Spotify API and store it in a Supabase database for easy access in your application.

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to the SQL Editor in your Supabase dashboard
4. Run the SQL from `database_schema.sql` to create all necessary tables

### 2. Configure Environment Variables

1. Copy `env.example` to `.env`
2. Fill in your Supabase and Spotify API credentials:
   - Get Supabase URL and anon key from your Supabase project settings
   - Get Spotify credentials by creating an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)

### 3. Install Dependencies

```bash
npm install
```

### 4. Import Artist Data

Import data from a Spotify API response file:

```bash
# Using the default file (artist_serverapi_response.json)
npm run import

# Or specify a different file
node import-artist-data.js path/to/your/file.json
```

### 5. Start the API Server

```bash
npm start
```

## API Endpoints

The project provides a simple REST API to access the artist data:

- **GET /api/artists** - Get a list of all artists (basic info)
- **GET /api/artists/:id** - Get detailed information about a specific artist
- **POST /api/artists/:id/update** - Fetch fresh data from Spotify API and update the database

## Example API Usage

```javascript
// Get all artists
fetch('http://localhost:3000/api/artists')
  .then(response => response.json())
  .then(data => console.log(data));

// Get a specific artist
fetch('http://localhost:3000/api/artists/5caqmh5ZXnKSx8vmdsCA9v')
  .then(response => response.json())
  .then(data => console.log(data));

// Update artist data from Spotify
fetch('http://localhost:3000/api/artists/5caqmh5ZXnKSx8vmdsCA9v/update', {
  method: 'POST'
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## Project Structure

- `database_schema.sql` - SQL schema for the Supabase database
- `supabase-setup.js` - Supabase client configuration
- `artistDataService.js` - Service for storing artist data in Supabase
- `spotify-fetch.js` - Service for fetching artist data from Spotify API
- `import-artist-data.js` - Script to import data from a JSON file
- `index.js` - Express API server

## Database Schema

The database is designed to efficiently store all aspects of the Spotify artist data:

- Artist basic information
- External links
- Images (avatar, header, gallery)
- Top cities
- Discography (albums, singles, etc.)
- Top tracks
- Related artists
- Playlists
- And more

## Next Steps

1. Complete the implementation of all the data processing methods in `artistDataService.js`
2. Create API endpoints to serve the data to your frontend application
3. Implement a scheduled job to keep artist data up-to-date

## License

MIT

## Environment Setup

This application uses Supabase for data storage. You need to create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace `your-project-id` and `your-supabase-anon-key` with your actual Supabase project details.

## Development

To start the development server:

```bash
npm run dev
```

## Building for Production

To build the app for production:

```bash
npm run build
```

## Database Schema

The application expects two tables in your Supabase database:

### Artists Table
- id (string, primary key)
- name (string)
- imageUrl (string)
- followers (number)
- streams (number)
- genres (array of strings)
- rank (number)

### Songs Table
- id (string, primary key)
- title (string)
- artist (string)
- artistId (string, foreign key to Artists.id)
- imageUrl (string)
- streams (number)
- releaseDate (string in YYYY-MM-DD format)
- rank (number)
