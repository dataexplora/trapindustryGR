-- Database schema for storing Spotify artist data

-- Artists table - stores basic artist information
CREATE TABLE artists (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    share_url VARCHAR(255),
    verified BOOLEAN,
    biography TEXT,
    followers INT,
    monthly_listeners INT,
    world_rank INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- External links for artists
CREATE TABLE artist_external_links (
    id SERIAL PRIMARY KEY,
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL
);

-- Artist visuals - avatar, header, gallery
CREATE TABLE artist_images (
    id SERIAL PRIMARY KEY,
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    image_type VARCHAR(20) NOT NULL, -- 'avatar', 'header', 'gallery'
    url VARCHAR(255) NOT NULL,
    width INT,
    height INT,
    image_index INT -- For ordering gallery images
);

-- Top cities where the artist is popular
CREATE TABLE artist_top_cities (
    id SERIAL PRIMARY KEY,
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(5) NOT NULL,
    region VARCHAR(50),
    listener_count INT,
    rank INT -- To maintain the order of cities
);

-- Albums table (includes singles, compilations)
CREATE TABLE albums (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    share_url VARCHAR(255),
    album_type VARCHAR(20) NOT NULL, -- 'album', 'single', 'compilation'
    label VARCHAR(255),
    track_count INT,
    release_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Album images
CREATE TABLE album_images (
    id SERIAL PRIMARY KEY,
    album_id VARCHAR(50) REFERENCES albums(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    width INT,
    height INT
);

-- Album copyright information
CREATE TABLE album_copyright (
    id SERIAL PRIMARY KEY,
    album_id VARCHAR(50) REFERENCES albums(id) ON DELETE CASCADE,
    copyright_type VARCHAR(5), -- 'C', 'P'
    text TEXT NOT NULL
);

-- Artist-Album relationship (many-to-many)
CREATE TABLE artist_albums (
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    album_id VARCHAR(50) REFERENCES albums(id) ON DELETE CASCADE,
    album_group VARCHAR(20), -- 'latest', 'singles', 'albums', 'compilations', 'appears_on', 'popular_releases'
    PRIMARY KEY (artist_id, album_id, album_group)
);

-- Tracks table
CREATE TABLE tracks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    share_url VARCHAR(255),
    explicit BOOLEAN,
    duration_ms INT,
    disc_number INT,
    play_count INT,
    album_id VARCHAR(50) REFERENCES albums(id) ON DELETE CASCADE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artist-Track relationship (many-to-many)
CREATE TABLE artist_tracks (
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    track_id VARCHAR(50) REFERENCES tracks(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE, -- Indicates if this is the primary artist
    is_top_track BOOLEAN DEFAULT FALSE, -- Indicates if this is one of the artist's top tracks
    PRIMARY KEY (artist_id, track_id)
);

-- Playlists related to the artist
CREATE TABLE playlists (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    share_url VARCHAR(255),
    description TEXT,
    owner_name VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist images
CREATE TABLE playlist_images (
    id SERIAL PRIMARY KEY,
    playlist_id VARCHAR(50) REFERENCES playlists(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    width INT,
    height INT
);

-- Artist-Playlist relationship (many-to-many)
CREATE TABLE artist_playlists (
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    playlist_id VARCHAR(50) REFERENCES playlists(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50), -- 'featuring', 'discovered_on', etc.
    PRIMARY KEY (artist_id, playlist_id, relationship_type)
);

-- Related artists (many-to-many)
CREATE TABLE related_artists (
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    related_artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    PRIMARY KEY (artist_id, related_artist_id)
);

-- Concerts
CREATE TABLE concerts (
    id SERIAL PRIMARY KEY,
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    venue VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(50),
    event_date TIMESTAMP,
    ticket_url VARCHAR(255)
);

-- Merchandise
CREATE TABLE merchandise (
    id SERIAL PRIMARY KEY,
    artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    currency VARCHAR(5),
    image_url VARCHAR(255),
    purchase_url VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX idx_artist_albums_artist_id ON artist_albums(artist_id);
CREATE INDEX idx_artist_albums_album_id ON artist_albums(album_id);
CREATE INDEX idx_artist_tracks_artist_id ON artist_tracks(artist_id);
CREATE INDEX idx_artist_tracks_track_id ON artist_tracks(track_id);
CREATE INDEX idx_artist_playlists_artist_id ON artist_playlists(artist_id);
CREATE INDEX idx_tracks_album_id ON tracks(album_id); 