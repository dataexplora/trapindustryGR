// spotify-fetch.js
const axios = require('axios');
const artistDataService = require('./artistDataService');
require('dotenv').config();

class SpotifyFetcher {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get Spotify API access token
   * @returns {Promise<string>} The access token
   */
  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    // Otherwise, get a new token
    try {
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
          grant_type: 'client_credentials'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')
        }
      });

      this.accessToken = response.data.access_token;
      // Set expiry time (usually 1 hour) with a small buffer
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error.message);
      throw error;
    }
  }

  /**
   * Fetch artist data by Spotify ID
   * @param {string} artistId - The Spotify artist ID
   * @returns {Promise<Object>} - The artist data
   */
  async fetchArtistById(artistId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/artists/${artistId}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching artist ${artistId}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch and store artist data
   * @param {string} artistId - The Spotify artist ID
   * @returns {Promise<Object>} - The result of the operation
   */
  async fetchAndStoreArtist(artistId) {
    try {
      // Fetch the artist data
      const artistData = await this.fetchArtistById(artistId);
      
      // Store the data in Supabase
      const result = await artistDataService.upsertArtistData(artistData);
      
      return {
        success: true,
        artistId,
        result
      };
    } catch (error) {
      console.error(`Error fetching and storing artist ${artistId}:`, error.message);
      return {
        success: false,
        artistId,
        error: error.message
      };
    }
  }

  /**
   * Update multiple artists
   * @param {string[]} artistIds - Array of artist IDs to update
   * @returns {Promise<Object>} - Results of the operations
   */
  async updateMultipleArtists(artistIds) {
    const results = {
      successful: [],
      failed: []
    };

    for (const artistId of artistIds) {
      try {
        const result = await this.fetchAndStoreArtist(artistId);
        if (result.success) {
          results.successful.push(artistId);
        } else {
          results.failed.push({ id: artistId, error: result.error });
        }
      } catch (error) {
        results.failed.push({ id: artistId, error: error.message });
      }
    }

    return results;
  }
}

module.exports = new SpotifyFetcher(); 