import "./Artists.css";
import { workers } from "../../Data/workers.js";

export default function Workers() {
  return (
    <div className="artists-page">
      <h2>Монтировочный цех</h2>
      <div className="artists-grid">
        {workers.map((worker) => (
          <div className="artist-card" key={worker.id}>
            <img src={worker.image} alt={worker.name} />
            <div className="artist-info">
              <h3>{worker.name}</h3>
              <p className="role">{worker.role}</p>
              <p className="exp">Стаж: {worker.experience}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
