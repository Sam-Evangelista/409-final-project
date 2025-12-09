// Fake Spotify data for development/demo purposes
// Toggle USE_FAKE_DATA to switch between real and fake data

export const USE_FAKE_DATA = false;

export const fakeUser = {
  id: "fake_user_123",
  display_name: "Demo User",
  images: [
    { url: "https://i.pravatar.cc/300?img=12" }
  ],
  followers: { total: 42 },
  country: "US",
  product: "premium"
};

export const fakeDbUser = {
  _id: "fake_db_id_456",
  spotify_id: "fake_user_123",
  username: "Demo User",
  icon: "https://i.pravatar.cc/300?img=12",
  bio: "Music lover | Vinyl collector",
  followers: ["user1", "user2", "user3"],
  following: ["user4", "user5"],
  top_albums: [
    "https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268",
    "https://i.scdn.co/image/ab67616d0000b273876fdb35297efb35c2f4de42",
    "https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163",
    "https://i.scdn.co/image/ab67616d0000b273f46b9d202509a8f7384b90de"
  ],
  most_listened_albums: [
    "https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526",
    "https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647",
    "https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699",
    "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96"
  ],
  ratings: []
};

export const fakeTopArtists = [
  {
    id: "artist1",
    name: "Tame Impala",
    images: [{ url: "https://i.scdn.co/image/ab6761610000e5eb016a5ea92593bc487a3a298c" }],
    external_urls: { spotify: "https://open.spotify.com/artist/5INjqkS1o8h1imAzPqGZBb" }
  },
  {
    id: "artist2",
    name: "Tyler, The Creator",
    images: [{ url: "https://i.scdn.co/image/ab6761610000e5eb8278b782cbb5a3963db88ada" }],
    external_urls: { spotify: "https://open.spotify.com/artist/4V8LLVI7PbaPR0K2TGSxFF" }
  },
  {
    id: "artist3",
    name: "Frank Ocean",
    images: [{ url: "https://i.scdn.co/image/ab6761610000e5ebee3123e593174208f9754fab" }],
    external_urls: { spotify: "https://open.spotify.com/artist/2h93pZq0e7k5yf4dywlkpM" }
  },
  {
    id: "artist4",
    name: "Kendrick Lamar",
    images: [{ url: "https://i.scdn.co/image/ab6761610000e5eb52696c3eb11be24672c8dff4" }],
    external_urls: { spotify: "https://open.spotify.com/artist/2YZyLoL8N0Wb9xBt1NhZWg" }
  },
  {
    id: "artist5",
    name: "SZA",
    images: [{ url: "https://i.scdn.co/image/ab6761610000e5eb0895066d172e1f51f520bc65" }],
    external_urls: { spotify: "https://open.spotify.com/artist/7tYKF4w9nC0nq9CsPZTHyP" }
  }
];

export const fakeTopTracks = [
  {
    id: "track1",
    name: "Let It Happen",
    album: {
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268" }]
    },
    external_urls: { spotify: "https://open.spotify.com/track/2X485T9Z5Ly0xyaghN73ed" }
  },
  {
    id: "track2",
    name: "EARFQUAKE",
    album: {
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273876fdb35297efb35c2f4de42" }]
    },
    external_urls: { spotify: "https://open.spotify.com/track/5hVghJ4KaYES3BFUATCYn0" }
  },
  {
    id: "track3",
    name: "Nights",
    album: {
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163" }]
    },
    external_urls: { spotify: "https://open.spotify.com/track/7eqoqGkKwgOaWNNHx90uEZ" }
  },
  {
    id: "track4",
    name: "HUMBLE.",
    album: {
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273f46b9d202509a8f7384b90de" }]
    },
    external_urls: { spotify: "https://open.spotify.com/track/7KXjTSCq5nL1LoYtL7XAwS" }
  },
  {
    id: "track5",
    name: "Kill Bill",
    album: {
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1" }]
    },
    external_urls: { spotify: "https://open.spotify.com/track/1Qrg8KqiBpW07V7PNxwwwL" }
  }
];

export const fakeFollowers = [
  {
    _id: "follower1",
    spotify_id: "john_doe_123",
    username: "John Doe",
    icon: "https://i.pravatar.cc/150?img=1"
  },
  {
    _id: "follower2",
    spotify_id: "jane_smith_456",
    username: "Jane Smith",
    icon: "https://i.pravatar.cc/150?img=2"
  },
  {
    _id: "follower3",
    spotify_id: "mike_wilson_789",
    username: "Mike Wilson",
    icon: "https://i.pravatar.cc/150?img=3"
  }
];

export const fakeFollowing = [
  {
    _id: "following1",
    spotify_id: "sarah_jones_111",
    username: "Sarah Jones",
    icon: "https://i.pravatar.cc/150?img=4"
  },
  {
    _id: "following2",
    spotify_id: "alex_brown_222",
    username: "Alex Brown",
    icon: "https://i.pravatar.cc/150?img=5"
  }
];

export const fakeAlbumSearchResults = [
  {
    id: "album1",
    name: "Currents",
    artists: [{ name: "Tame Impala" }],
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268" },
      { url: "https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268" }
    ],
    release_date: "2015-07-17"
  },
  {
    id: "album2",
    name: "IGOR",
    artists: [{ name: "Tyler, The Creator" }],
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b273876fdb35297efb35c2f4de42" },
      { url: "https://i.scdn.co/image/ab67616d00001e02876fdb35297efb35c2f4de42" }
    ],
    release_date: "2019-05-17"
  },
  {
    id: "album3",
    name: "Blonde",
    artists: [{ name: "Frank Ocean" }],
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163" },
      { url: "https://i.scdn.co/image/ab67616d00001e024ae1c4c5c45aabe565499163" }
    ],
    release_date: "2016-08-20"
  },
  {
    id: "album4",
    name: "DAMN.",
    artists: [{ name: "Kendrick Lamar" }],
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b273f46b9d202509a8f7384b90de" },
      { url: "https://i.scdn.co/image/ab67616d00001e02f46b9d202509a8f7384b90de" }
    ],
    release_date: "2017-04-14"
  },
  {
    id: "album5",
    name: "SOS",
    artists: [{ name: "SZA" }],
    images: [
      { url: "https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1" },
      { url: "https://i.scdn.co/image/ab67616d00001e0270dbc9f47669d120ad874ec1" }
    ],
    release_date: "2022-12-09"
  }
];
