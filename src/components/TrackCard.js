import React from 'react';
import './TrackCard.css';

const TrackCard = ({ track }) => {
  return (
    <div className="track-card">
      <div className="track-image">
        <img 
          src={track.album.images[0]?.url || '/default-track.png'} 
          alt={track.name}
          className="track-artwork"
        />
      </div>
      <div className="track-info">
        <h3 className="track-name">{track.name}</h3>
        <p className="track-artist">
          {track.artists.map((artist, index) => (
            <span key={artist.id}>
              {artist.name}
              {index < track.artists.length - 1 && ', '}
            </span>
          ))}
        </p>
        <p className="track-album">{track.album.name}</p>
      </div>
    </div>
  );
};

export default TrackCard;
