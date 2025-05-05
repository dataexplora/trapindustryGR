-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  imageUrl TEXT,
  followers INTEGER DEFAULT 0,
  streams INTEGER DEFAULT 0,
  genres TEXT[] DEFAULT '{}',
  rank INTEGER
);

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  artistId TEXT REFERENCES artists(id) ON DELETE CASCADE,
  imageUrl TEXT,
  streams INTEGER DEFAULT 0,
  releaseDate TEXT,
  rank INTEGER
);

-- Insert sample data into artists table
INSERT INTO artists (id, name, imageUrl, followers, streams, genres, rank)
VALUES
  ('1', 'Snik', 'https://i.scdn.co/image/ab6761610000e5eb80f77ccb274384f26c35f943', 347000, 15000000, ARRAY['Greek Hip Hop', 'Trap'], 1),
  ('2', 'Eleni Foureira', 'https://i.scdn.co/image/ab6761610000e5ebd4ef05f38302d0a6f0c01162', 320000, 12500000, ARRAY['Greek Pop', 'Dance'], 2),
  ('3', 'Light', 'https://i.scdn.co/image/ab6761610000e5eb2e63ec35d0cee9388e74c84c', 300000, 11000000, ARRAY['Greek Hip Hop', 'Trap'], 3),
  ('4', 'Tamta', 'https://i.scdn.co/image/ab6761610000e5eb026105d6d9e15c9a5ff240be', 280000, 10500000, ARRAY['Greek Pop', 'Dance'], 4),
  ('5', 'Konstantinos Argiros', 'https://i.scdn.co/image/ab6761610000e5eb82714df28d762628fbc2308e', 270000, 10000000, ARRAY['Laïko', 'Greek Pop'], 5)
ON CONFLICT (id) DO NOTHING;

-- Insert sample data into songs table
INSERT INTO songs (id, title, artist, artistId, imageUrl, streams, releaseDate, rank)
VALUES
  ('1', 'Diamonds', 'Snik & Tamta', '1', 'https://i.scdn.co/image/ab67616d0000b273ba741c0468022f8c5e7eea1d', 15000000, '2021-05-28', 1),
  ('2', 'Fuego', 'Eleni Foureira', '2', 'https://i.scdn.co/image/ab67616d0000b2731d9af5e2e6a6e4ae0d641ade', 12000000, '2018-03-02', 2),
  ('3', 'Gucci Shoes', 'Light & FY', '3', 'https://i.scdn.co/image/ab67616d0000b273f6ba14cf75f64cc4dfb287ad', 10000000, '2020-01-17', 3),
  ('4', 'Replays', 'Tamta', '4', 'https://i.scdn.co/image/ab67616d0000b273a6a4bced303c9048982b8f1b', 9000000, '2019-01-18', 4),
  ('5', 'Athina Mou', 'Konstantinos Argiros', '5', 'https://i.scdn.co/image/ab67616d0000b2736bb4c3a10d9c2fac36b01bbd', 8500000, '2020-12-04', 5)
ON CONFLICT (id) DO NOTHING; 