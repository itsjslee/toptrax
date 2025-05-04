const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Get Spotify config from environment variables
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

// Handle Spotify authentication flow
export const handleSpotifyAuth = async (hash) => {
  const params = new URLSearchParams(hash.replace('#', '?'));
  const code = params.get('code');
  
  if (code) {
    try {
      const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
      if (!codeVerifier) {
        throw new Error('No code verifier found');
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: spotifyConfig.redirectUri,
          client_id: spotifyConfig.clientId,
          code_verifier: codeVerifier
        })
      });

      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      const data = await response.json();
      
      // Store the access token with expiration time
      localStorage.setItem('spotify_access_token', data.access_token);
      const expiresAt = Date.now() + (data.expires_in * 1000);
      localStorage.setItem('spotify_token_expires_at', expiresAt);
      
      // Remove the hash from URL
      window.history.pushState("", document.title, window.location.pathname);
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }
  return false;
};

// Check if token is expired
export const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('spotify_token_expires_at');
  return Date.now() >= parseInt(expiresAt);
};

// Generate a random code verifier
const generateCodeVerifier = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 128);
};

// Generate code challenge from code verifier
const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Get auth URL
export const getAuthUrl = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store code verifier in session storage
  sessionStorage.setItem('spotify_code_verifier', codeVerifier);
  
  return `${SPOTIFY_AUTH_URL}?client_id=${spotifyConfig.clientId}&
    redirect_uri=${encodeURIComponent(spotifyConfig.redirectUri)}&
    scope=${encodeURIComponent(spotifyConfig.scopes)}&
    response_type=code&
    code_challenge_method=S256&
    code_challenge=${codeChallenge}&
    show_dialog=true`;
};

// Fetch with token handling
export const fetchWithToken = async (endpoint, options = {}) => {
  const accessToken = localStorage.getItem('spotify_access_token');
  
  if (!accessToken) {
    throw new Error('No access token found');
  }
  
  if (isTokenExpired()) {
    throw new Error('Token has expired');
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
    const errorData = await response.json().catch(() => {});
    throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API endpoints
export const getTopArtists = async (timeRange = 'medium_term', limit = 20) => {
  return fetchWithToken(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
};

export const getTopTracks = async (timeRange = 'medium_term', limit = 20) => {
  return fetchWithToken(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
};
