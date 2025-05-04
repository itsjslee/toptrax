const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export const spotifyConfig = {
  clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  redirectUri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
  scopes: [
    'user-top-read',
    'user-read-private',
    'user-read-email'
  ].join(' '),
  authEndpoint: SPOTIFY_AUTH_URL
};

export const getAuthUrl = () => {
  return `${SPOTIFY_AUTH_URL}?client_id=${spotifyConfig.clientId}&redirect_uri=${encodeURIComponent(spotifyConfig.redirectUri)}&scope=${encodeURIComponent(spotifyConfig.scopes)}&response_type=token&show_dialog=true`;
};

export const fetchWithToken = async (endpoint, options = {}) => {
  const accessToken = localStorage.getItem('spotify_access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getTopArtists = async (timeRange = 'medium_term', limit = 20) => {
  return fetchWithToken(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
};

export const getTopTracks = async (timeRange = 'medium_term', limit = 20) => {
  return fetchWithToken(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
};
