import React, { useState, useEffect } from 'react';
import './App.css';
import { getAuthUrl, getTopArtists } from './services/spotify';
import ArtistCard from './components/ArtistCard';

function App() {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');

  const TIME_RANGES = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' }
  ];

  useEffect(() => {
    // Check for access token in URL after Spotify redirects
    const hash = window.location.hash;
    if (hash) {
      const token = hash.substring(1).split('&')[0].split('=')[1];
      localStorage.setItem('spotify_access_token', token);
      window.history.pushState("", document.title, window.location.pathname);
      fetchArtists();
    }
  }, []);

  const fetchArtists = async () => {
    try {
      setIsLoading(true);
      const data = await getTopArtists(timeRange);
      setArtists(data.items);
      setError(null);
    } catch (err) {
      setError(err.message);
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
        <p>Your favorite artists</p>
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
      </main>
    </div>
  );
}

export default App;
