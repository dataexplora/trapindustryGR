const supabase = require('./supabase-setup');

class ArtistDataService {
  /**
   * Upsert artist data from Spotify API response
   * @param {Object} artistData - The artist data from Spotify API
   * @returns {Promise<Object>} - The result of the operation
   */
  async upsertArtistData(artistData) {
    try {
      if (!artistData || !artistData.id) {
        throw new Error('Invalid artist data');
      }

      // Start a transaction
      // Note: Supabase doesn't support true transactions through the API yet,
      // so we just handle each part separately with appropriate error handling

      // 1. Insert/update the artist
      const artistResult = await this.upsertArtist(artistData);
      
      // 2. Process related artist data
      await this.processArtistRelatedData(artistData);

      return { success: true, artistId: artistData.id };
    } catch (error) {
      console.error('Error upserting artist data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Insert or update artist basic information
   * @param {Object} artistData 
   * @returns {Promise<Object>}
   */
  async upsertArtist(artistData) {
    const artist = {
      id: artistData.id,
      name: artistData.name,
      share_url: artistData.shareUrl,
      verified: artistData.verified,
      biography: artistData.biography,
      followers: artistData.stats?.followers || 0,
      monthly_listeners: artistData.stats?.monthlyListeners || 0,
      world_rank: artistData.stats?.worldRank || 0,
      last_updated: new Date()
    };

    return await supabase
      .from('artists')
      .upsert(artist, { onConflict: 'id' })
      .select();
  }

  /**
   * Process all related artist data (links, images, top cities, etc.)
   * @param {Object} artistData 
   */
  async processArtistRelatedData(artistData) {
    const artistId = artistData.id;

    // Handle external links
    if (artistData.externalLinks && artistData.externalLinks.length > 0) {
      await this.processExternalLinks(artistId, artistData.externalLinks);
    }

    // Handle artist images
    if (artistData.visuals) {
      await this.processArtistImages(artistId, artistData.visuals);
    }

    // Handle top cities
    if (artistData.stats?.topCities && artistData.stats.topCities.length > 0) {
      await this.processTopCities(artistId, artistData.stats.topCities);
    }

    // Handle discography
    if (artistData.discography) {
      await this.processDiscography(artistId, artistData.discography);
    }

    // Handle top tracks
    if (artistData.discography?.topTracks && artistData.discography.topTracks.length > 0) {
      await this.processTopTracks(artistId, artistData.discography.topTracks);
    }

    // Handle related artists
    if (artistData.relatedContent?.relatedArtists?.items) {
      await this.processRelatedArtists(artistId, artistData.relatedContent.relatedArtists.items);
    }

    // Handle playlists
    if (artistData.relatedContent?.discoveredOn?.items) {
      await this.processPlaylists(artistId, artistData.relatedContent.discoveredOn.items, 'discovered_on');
    }
  }

  /**
   * Process external links
   * @param {string} artistId 
   * @param {Array} links 
   */
  async processExternalLinks(artistId, links) {
    // First delete existing links to avoid duplicates
    await supabase
      .from('artist_external_links')
      .delete()
      .eq('artist_id', artistId);

    // Insert new links
    const linksToInsert = links.map(link => ({
      artist_id: artistId,
      name: link.name,
      url: link.url
    }));

    if (linksToInsert.length > 0) {
      return await supabase
        .from('artist_external_links')
        .insert(linksToInsert);
    }
  }

  /**
   * Process artist images (avatar, header, gallery)
   * @param {string} artistId 
   * @param {Object} visuals 
   */
  async processArtistImages(artistId, visuals) {
    // Delete existing images first
    await supabase
      .from('artist_images')
      .delete()
      .eq('artist_id', artistId);
    
    const imagesToInsert = [];
    
    // Process avatar images
    if (visuals.avatar && visuals.avatar.length > 0) {
      visuals.avatar.forEach(image => {
        imagesToInsert.push({
          artist_id: artistId,
          image_type: 'avatar',
          url: image.url,
          width: image.width || null,
          height: image.height || null,
          image_index: 0
        });
      });
    }
    
    // Process header images
    if (visuals.header && visuals.header.length > 0) {
      visuals.header.forEach(image => {
        imagesToInsert.push({
          artist_id: artistId,
          image_type: 'header',
          url: image.url,
          width: image.width || null,
          height: image.height || null,
          image_index: 0
        });
      });
    }
    
    // Process gallery images
    if (visuals.gallery && visuals.gallery.length > 0) {
      visuals.gallery.forEach((imageGroup, index) => {
        if (imageGroup && imageGroup.length > 0) {
          imageGroup.forEach(image => {
            imagesToInsert.push({
              artist_id: artistId,
              image_type: 'gallery',
              url: image.url,
              width: image.width || null,
              height: image.height || null,
              image_index: index
            });
          });
        }
      });
    }
    
    // Insert all images
    if (imagesToInsert.length > 0) {
      return await supabase
        .from('artist_images')
        .insert(imagesToInsert);
    }
  }

  /**
   * Process top cities
   * @param {string} artistId 
   * @param {Array} topCities 
   */
  async processTopCities(artistId, topCities) {
    // Delete existing top cities
    await supabase
      .from('artist_top_cities')
      .delete()
      .eq('artist_id', artistId);
    
    // Insert new top cities
    const citiesToInsert = topCities.map((city, index) => ({
      artist_id: artistId,
      city: city.city,
      country: city.country,
      region: city.region || null,
      listener_count: city.listenerCount || 0,
      rank: index + 1
    }));
    
    if (citiesToInsert.length > 0) {
      return await supabase
        .from('artist_top_cities')
        .insert(citiesToInsert);
    }
  }

  /**
   * Process artist's discography
   * @param {string} artistId 
   * @param {Object} discography 
   */
  async processDiscography(artistId, discography) {
    try {
      // Process latest release
      if (discography.latest) {
        await this.processAlbum(artistId, discography.latest, 'latest');
      }
      
      // Process singles
      if (discography.singles && discography.singles.items) {
        await Promise.all(discography.singles.items.map(album => 
          this.processAlbum(artistId, album, 'singles')
        ));
      }
      
      // Process albums
      if (discography.albums && discography.albums.items) {
        await Promise.all(discography.albums.items.map(album => 
          this.processAlbum(artistId, album, 'albums')
        ));
      }
      
      // Process compilations
      if (discography.compilations && discography.compilations.items) {
        await Promise.all(discography.compilations.items.map(album => 
          this.processAlbum(artistId, album, 'compilations')
        ));
      }
      
      // Process popular releases
      if (discography.popularReleasesAlbums) {
        await Promise.all(discography.popularReleasesAlbums.map(album => 
          this.processAlbum(artistId, album, 'popular_releases')
        ));
      }
    } catch (error) {
      console.error(`Error processing discography for artist ${artistId}:`, error);
      throw error;
    }
  }

  /**
   * Process a single album
   * @param {string} artistId 
   * @param {Object} album 
   * @param {string} albumGroup 
   */
  async processAlbum(artistId, album, albumGroup) {
    try {
      // 1. Insert/update the album
      const albumData = {
        id: album.id,
        name: album.name,
        share_url: album.shareUrl,
        album_type: album.type || albumGroup,
        label: album.label,
        track_count: album.trackCount || 0,
        release_date: null, // Spotify API response doesn't include release date
        last_updated: new Date()
      };
      
      await supabase
        .from('albums')
        .upsert(albumData, { onConflict: 'id' });
      
      // 2. Insert album cover images
      if (album.cover && album.cover.length > 0) {
        // First delete existing album images
        await supabase
          .from('album_images')
          .delete()
          .eq('album_id', album.id);
        
        // Insert new album images
        const albumImages = album.cover.map(image => ({
          album_id: album.id,
          url: image.url,
          width: image.width,
          height: image.height
        }));
        
        await supabase
          .from('album_images')
          .insert(albumImages);
      }
      
      // 3. Insert copyright information
      if (album.copyright && album.copyright.length > 0) {
        // First delete existing copyright info
        await supabase
          .from('album_copyright')
          .delete()
          .eq('album_id', album.id);
        
        // Insert new copyright info
        const copyrightData = album.copyright.map(copyright => ({
          album_id: album.id,
          copyright_type: copyright.type,
          text: copyright.text
        }));
        
        await supabase
          .from('album_copyright')
          .insert(copyrightData);
      }
      
      // 4. Create the artist-album relationship
      const artistAlbumData = {
        artist_id: artistId,
        album_id: album.id,
        album_group: albumGroup
      };
      
      await supabase
        .from('artist_albums')
        .upsert(artistAlbumData, { 
          onConflict: ['artist_id', 'album_id', 'album_group']
        });
      
    } catch (error) {
      console.error(`Error processing album ${album.id} for artist ${artistId}:`, error);
      throw error;
    }
  }

  /**
   * Process top tracks
   * @param {string} artistId 
   * @param {Array} tracks 
   */
  async processTopTracks(artistId, tracks) {
    try {
      for (const track of tracks) {
        // 1. First insert/update the track
        const trackData = {
          id: track.id,
          name: track.name,
          share_url: track.shareUrl,
          explicit: track.explicit || false,
          duration_ms: track.durationMs || 0,
          disc_number: track.discNumber || 1,
          play_count: track.playCount || 0,
          album_id: track.album?.id,
          last_updated: new Date()
        };
        
        await supabase
          .from('tracks')
          .upsert(trackData, { onConflict: 'id' });
        
        // 2. Create artist-track relationship marking it as a top track
        const artistTrackData = {
          artist_id: artistId,
          track_id: track.id,
          is_primary: true,
          is_top_track: true
        };
        
        await supabase
          .from('artist_tracks')
          .upsert(artistTrackData, { 
            onConflict: ['artist_id', 'track_id'] 
          });
        
        // 3. Process other artists on the track
        if (track.artists && track.artists.length > 0) {
          for (const artist of track.artists) {
            // Skip if it's the primary artist we're already processing
            if (artist.id === artistId) continue;
            
            // Add relationship for featured artist
            const featuredArtistData = {
              artist_id: artist.id,
              track_id: track.id,
              is_primary: false,
              is_top_track: false
            };
            
            await supabase
              .from('artist_tracks')
              .upsert(featuredArtistData, { 
                onConflict: ['artist_id', 'track_id'] 
              });
          }
        }
      }
    } catch (error) {
      console.error(`Error processing top tracks for artist ${artistId}:`, error);
      throw error;
    }
  }

  /**
   * Process related artists
   * @param {string} artistId 
   * @param {Array} relatedArtists 
   */
  async processRelatedArtists(artistId, relatedArtists) {
    try {
      // We don't delete existing relationships here because
      // we want to keep relationships with artists not in this current batch
      
      // Create relationship records
      for (const artist of relatedArtists) {
        const relationData = {
          artist_id: artistId,
          related_artist_id: artist.id
        };
        
        await supabase
          .from('related_artists')
          .upsert(relationData, { 
            onConflict: ['artist_id', 'related_artist_id'] 
          });
        
        // Store minimal artist info for the related artist
        // This ensures we have at least basic info for all related artists
        const minimalArtistData = {
          id: artist.id,
          name: artist.name,
          share_url: artist.shareUrl,
          last_updated: new Date()
        };
        
        await supabase
          .from('artists')
          .upsert(minimalArtistData, { onConflict: 'id' });
      }
    } catch (error) {
      console.error(`Error processing related artists for artist ${artistId}:`, error);
      throw error;
    }
  }

  /**
   * Process playlists
   * @param {string} artistId 
   * @param {Array} playlists 
   * @param {string} relationshipType - e.g., 'featuring', 'discovered_on'
   */
  async processPlaylists(artistId, playlists, relationshipType) {
    try {
      // First remove existing playlist relationships of this type
      await supabase
        .from('artist_playlists')
        .delete()
        .eq('artist_id', artistId)
        .eq('relationship_type', relationshipType);
      
      // Process each playlist
      for (const playlist of playlists) {
        // 1. Insert/update the playlist
        const playlistData = {
          id: playlist.id,
          name: playlist.name,
          share_url: playlist.shareUrl,
          description: playlist.description || '',
          owner_name: playlist.owner?.name || '',
          last_updated: new Date()
        };
        
        await supabase
          .from('playlists')
          .upsert(playlistData, { onConflict: 'id' });
        
        // 2. Insert playlist images
        if (playlist.images && playlist.images.length > 0) {
          // Delete existing images first
          await supabase
            .from('playlist_images')
            .delete()
            .eq('playlist_id', playlist.id);
          
          // Insert playlist images
          const playlistImages = [];
          playlist.images.forEach(imageGroup => {
            if (imageGroup && imageGroup.length > 0) {
              imageGroup.forEach(image => {
                if (image && image.url) {
                  playlistImages.push({
                    playlist_id: playlist.id,
                    url: image.url,
                    width: image.width || null,
                    height: image.height || null
                  });
                }
              });
            }
          });
          
          if (playlistImages.length > 0) {
            await supabase
              .from('playlist_images')
              .insert(playlistImages);
          }
        }
        
        // 3. Create artist-playlist relationship
        const artistPlaylistData = {
          artist_id: artistId,
          playlist_id: playlist.id,
          relationship_type: relationshipType
        };
        
        await supabase
          .from('artist_playlists')
          .insert(artistPlaylistData);
      }
    } catch (error) {
      console.error(`Error processing playlists for artist ${artistId}:`, error);
      throw error;
    }
  }
}

module.exports = new ArtistDataService(); 