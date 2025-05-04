
// This is a mock service for demo purposes
// In a real app, you'd integrate with Spotify's API with proper authentication

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  followers: number;
  streams: number;
  genres: string[];
  rank: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  imageUrl: string;
  streams: number;
  releaseDate: string;
  rank: number;
}

// Mock data for Greek artists
const topGreekArtists: Artist[] = [
  {
    id: "1",
    name: "Snik",
    imageUrl: "https://i.scdn.co/image/ab6761610000e5eb80f77ccb274384f26c35f943",
    followers: 347000,
    streams: 15000000,
    genres: ["Greek Hip Hop", "Trap"],
    rank: 1
  },
  {
    id: "2",
    name: "Eleni Foureira",
    imageUrl: "https://i.scdn.co/image/ab6761610000e5ebd4ef05f38302d0a6f0c01162",
    followers: 320000,
    streams: 12500000,
    genres: ["Greek Pop", "Dance"],
    rank: 2
  },
  {
    id: "3",
    name: "Light",
    imageUrl: "https://i.scdn.co/image/ab6761610000e5eb2e63ec35d0cee9388e74c84c",
    followers: 300000,
    streams: 11000000,
    genres: ["Greek Hip Hop", "Trap"],
    rank: 3
  },
  {
    id: "4",
    name: "Tamta",
    imageUrl: "https://i.scdn.co/image/ab6761610000e5eb026105d6d9e15c9a5ff240be",
    followers: 280000,
    streams: 10500000,
    genres: ["Greek Pop", "Dance"],
    rank: 4
  },
  {
    id: "5",
    name: "Konstantinos Argiros",
    imageUrl: "https://i.scdn.co/image/ab6761610000e5eb82714df28d762628fbc2308e",
    followers: 270000,
    streams: 10000000,
    genres: ["Laïko", "Greek Pop"],
    rank: 5
  },
  {
    id: "6",
    name: "Josephine",
    imageUrl: "https://i.scdn.co/image/ab6761610000e5eb6853d28b753343c1c0259275",
    followers: 265000,
    streams: 9500000,
    genres: ["Greek Pop"],
    rank: 6
  },
  {
    id: "7",
    name: "Mad Clip",
    imageUrl: "https://i.scdn.co/image/ab6761610000e5eb6cb2833b74ebb7762ccce3f9",
    followers: 260000,
    streams: 9000000,
    genres: ["Greek Hip Hop", "Trap"],
    rank: 7
  },
  {
    id: "8",
    name: "Antonis Remos",
    imageUrl: "https://i.scdn.co/image/ab6761610000e5ebcdfdde58601ce65da0747006",
    followers: 250000,
    streams: 8500000,
    genres: ["Laïko", "Greek Pop"],
    rank: 8
  },
];

// Mock data for top Greek songs
const topGreekSongs: Song[] = [
  {
    id: "1",
    title: "Diamonds",
    artist: "Snik & Tamta",
    artistId: "1",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273ba741c0468022f8c5e7eea1d",
    streams: 15000000,
    releaseDate: "2021-05-28",
    rank: 1
  },
  {
    id: "2",
    title: "Fuego",
    artist: "Eleni Foureira",
    artistId: "2",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b2731d9af5e2e6a6e4ae0d641ade",
    streams: 12000000,
    releaseDate: "2018-03-02",
    rank: 2
  },
  {
    id: "3",
    title: "Gucci Shoes",
    artist: "Light & FY",
    artistId: "3",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273f6ba14cf75f64cc4dfb287ad",
    streams: 10000000,
    releaseDate: "2020-01-17",
    rank: 3
  },
  {
    id: "4",
    title: "Replays",
    artist: "Tamta",
    artistId: "4",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273a6a4bced303c9048982b8f1b",
    streams: 9000000,
    releaseDate: "2019-01-18",
    rank: 4
  },
  {
    id: "5",
    title: "Athina Mou",
    artist: "Konstantinos Argiros",
    artistId: "5",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b2736bb4c3a10d9c2fac36b01bbd",
    streams: 8500000,
    releaseDate: "2020-12-04",
    rank: 5
  },
  {
    id: "6",
    title: "Paliopaido",
    artist: "Mad Clip",
    artistId: "7",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273813acf9c05b8ea8caf4fb91f",
    streams: 8000000,
    releaseDate: "2020-03-06",
    rank: 6
  },
  {
    id: "7",
    title: "Tora I Pote",
    artist: "Josephine",
    artistId: "6",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273d32a71c7c0a6c0274431d76e",
    streams: 7500000,
    releaseDate: "2021-02-12",
    rank: 7
  },
  {
    id: "8",
    title: "Mia Nihta",
    artist: "Antonis Remos",
    artistId: "8",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273d2a3da52cbfef925080bd139",
    streams: 7000000,
    releaseDate: "2019-11-15",
    rank: 8
  },
  {
    id: "9",
    title: "Poios Se Kavlantise",
    artist: "Snik",
    artistId: "1",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273ef6a0181f0418124dcabd479",
    streams: 6500000,
    releaseDate: "2020-07-10",
    rank: 9
  },
  {
    id: "10",
    title: "San Lathos",
    artist: "Eleni Foureira",
    artistId: "2",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273ef280666fa6786e2b777f631",
    streams: 6000000,
    releaseDate: "2020-05-22",
    rank: 10
  },
];

// More songs to complete top 50
for (let i = 11; i <= 50; i++) {
  topGreekSongs.push({
    id: i.toString(),
    title: `Greek Hit Song ${i}`,
    artist: topGreekArtists[Math.floor(Math.random() * topGreekArtists.length)].name,
    artistId: Math.ceil(Math.random() * 8).toString(),
    imageUrl: `https://i.scdn.co/image/ab67616d0000b273${Math.random().toString(36).substring(2, 15)}`,
    streams: Math.floor(6000000 - (i * 100000)),
    releaseDate: `202${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
    rank: i
  });
}

export const spotifyService = {
  getTopArtists: async (): Promise<Artist[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return topGreekArtists;
  },
  
  getTopSongs: async (): Promise<Song[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return topGreekSongs;
  },
  
  getArtistById: async (id: string): Promise<Artist | undefined> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return topGreekArtists.find(artist => artist.id === id);
  },
  
  getSongById: async (id: string): Promise<Song | undefined> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return topGreekSongs.find(song => song.id === id);
  },
  
  getArtistSongs: async (artistId: string): Promise<Song[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return topGreekSongs.filter(song => song.artistId === artistId);
  }
};
