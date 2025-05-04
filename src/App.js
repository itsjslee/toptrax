import React, { useState, useEffect } from 'react';
import './App.css';
import { getAuthUrl, getTopArtists } from './services/spotify';
import ArtistCard from './components/ArtistCard';

function App() {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const data = await getTopArtists();
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

  if (!localStorage.getItem('spotify_access_token')) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>TopTrax</h1>
          <p>Your top Spotify artists and tracks</p>
          <button className="login-button" onClick={handleLogin}>
            Login with Spotify
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>TopTrax</h1>
        <p>Your top Spotify artists</p>
      </header>
      <main>
        {isLoading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
        <div className="artist-grid">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
