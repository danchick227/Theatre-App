import "./Artists.css";
import { artists } from "../../Data/artists.js";

export default function Artists() {
  return (
    <div className="artists-page">
      <h2>Артисты театра</h2>
      <div className="artists-grid">
        {artists.map((artist) => (
          <div className="artist-card" key={artist.id}>
            <img src={artist.image} alt={artist.name} />
            <div className="artist-info">
              <h3>{artist.name}</h3>
              <p className="role">{artist.role}</p>
              <p className="exp">Стаж: {artist.experience}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
