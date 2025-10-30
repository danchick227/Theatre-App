import "./Artists.css";
import { directors } from "../../Data/directors.js";

export default function Directors() {
  return (
    <div className="artists-page">
      <h2>Режиссёры театра</h2> 
      <div className="artists-grid">
        {directors.map((director) => (
          <div className="artist-card" key={director.id}>
            <img src={director.image} alt={director.name} />
            <div className="artist-info">
              <h3>{director.name}</h3>
              <p className="role">{director.role}</p>
              <p className="exp">стаж: {director.experience}</p>
            </div> 
          </div>
        ))}
      </div>
    </div>
  );
}

