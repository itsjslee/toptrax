import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  getAuthUrl, 
  getTopArtists,
  getTopTracks,
  handleSpotifyAuth,
  isTokenExpired
} from './services/spotify';
import ArtistCard from './components/ArtistCard';
import TrackCard from './components/TrackCard';

function App() {
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');

  const TIME_RANGES = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' }
  ];

  // Handle initial authentication
  useEffect(() => {
    // Check if we have a token in the URL hash
    const hash = window.location.hash;
    if (hash) {
      const authSuccess = handleSpotifyAuth(hash);
      if (authSuccess) {
        fetchArtists();
        fetchTracks();
      }
    }

    // Check if token is expired
    if (isTokenExpired()) {
      setError('Your session has expired. Please reconnect with Spotify.');
    }
  }, []); // Empty dependency array means this runs once on mount

  const fetchArtists = async () => {
    try {
      setIsLoading(true);
      const data = await getTopArtists(timeRange);
      setArtists(data.items);
      setError(null);
    } catch (err) {
      setError(err.message);
      // If token expired, remove it from storage
      if (err.message === 'Token has expired') {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expires_at');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      setIsLoading(true);
      const data = await getTopTracks(timeRange);
      setTracks(data.items);
      setError(null);
    } catch (err) {
      setError(err.message);
      // If token expired, remove it from storage
      if (err.message === 'Token has expired') {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expires_at');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    fetchArtists();
    fetchTracks();
  };

  if (!localStorage.getItem('spotify_access_token')) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>TopTrax</h1>
          <p>Visualize your favorite artists and tracks</p>
          <button className="login-button" onClick={handleLogin}>
            Connect with Spotify
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>TopTrax</h1>
        <p>Your favorite music</p>
        <select 
          className="time-range-selector"
          value={timeRange}
          onChange={handleTimeRangeChange}
        >
          {TIME_RANGES.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </header>
      <main>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <div className="content-section">
          <h2>Top Artists</h2>
          <div className="artist-grid">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your top artists...</p>
              </div>
            ) : (
              artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))
            )}
          </div>
        </div>
        <div className="content-section">
          <h2>Top Tracks</h2>
          <div className="track-grid">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your top tracks...</p>
              </div>
            ) : (
              tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
