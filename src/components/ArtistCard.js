import React from 'react';
import './ArtistCard.css';

const ArtistCard = ({ artist }) => {
  return (
    <div className="artist-card">
      <img 
        src={artist.images[0]?.url || '/default-artist.png'} 
        alt={artist.name}
        className="artist-image"
      />
      <div className="artist-info">
        <h3 className="artist-name">{artist.name}</h3>
        <p className="artist-genres">
          {artist.genres?.slice(0, 3).join(', ')}
        </p>
      </div>
    </div>
  );
};

export default ArtistCard;
