import "./Artists.css";
import { directors } from "../../Data/directors.js";

export default function Directors() {
  return (
    <div className="artists-page">
      <h2>Режиссёры театра</h2> 
      <div className="artists-grid">
        {artists.map((directors) => (
          <div className="artist-card" key={directors.id}>
            <img src={directors.image} alt={directors.name} />
            <div className="artist-info">
              <h3>{directors.name}</h3>
              <p className="role">{directors.role}</p>
              <p className="exp">Стаж: {directors.experience}</p>
            </div> 
          </div>
        ))}
      </div>
    </div>
  );
}
