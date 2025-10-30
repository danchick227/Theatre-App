import { useState } from "react";
import "./Schedule.css"; // можешь вынести общие стили

export default function AdminSchedule() {
  const monthNames = [
    "ЯНВАРЬ",
    "ФЕВРАЛЬ",
    "МАРТ",
    "АПРЕЛЬ",
    "МАЙ",
    "ИЮНЬ",
    "ИЮЛЬ",
    "АВГУСТ",
    "СЕНТЯБРЬ",
    "ОКТЯБРЬ",
    "НОЯБРЬ",
    "ДЕКАБРЬ",
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [scenes, setScenes] = useState({
    "Большая сцена": [
      {
        title: "Персонаж месяца. Сова + Часовщик",
        time: "11:30–11:50",
        color: "#f4b6b6",
      },
      { title: "Гадкий утенок", time: "12:00–12:55", color: "#cfd6f6" },
    ],
    "Малая сцена": [
      {
        title: "Творческая встреча с артистами",
        time: "13:00–13:30",
        color: "#d9c5f7",
      },
    ],
    "Арт-клуб": [
      { title: "Реп. Муха - Цокотуха", time: "15:00–18:00", color: "#b9ebe0" },
      {
        title: "Спящая царевна. Тех. репетиция",
        time: "15:30–18:00",
        color: "#9fe2b8",
      },
    ],
    "Третья сцена": [
      {
        title: "Урок: Театральная студия 'Тяпа'",
        time: "16:30–18:00",
        color: "#f7c6e0",
      },
      {
        title: "Реп. Божественная комедия",
        time: "12:00–14:00",
        color: "#b9ebe0",
      },
    ],
  });

  const [newEvent, setNewEvent] = useState({
    scene: "",
    title: "",
    time: "",
    color: "#ffffff",
  });

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleAddEvent = () => {
    if (!newEvent.scene || !newEvent.title || !newEvent.time) return;

    setScenes((prev) => ({
      ...prev,
      [newEvent.scene]: [
        ...(prev[newEvent.scene] || []),
        { title: newEvent.title, time: newEvent.time, color: newEvent.color },
      ],
    }));

    setNewEvent({ scene: "", title: "", time: "", color: "#ffffff" });
  };

  const handleDelete = (scene, index) => {
    setScenes((prev) => ({
      ...prev,
      [scene]: prev[scene].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="shedule admin">
      {/* === Переключатель месяца === */}
      <div className="month-switcher">
        <button className="nav-btn" onClick={() => changeMonth(-1)}>
          ‹
        </button>
        <div className="month-label">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button className="nav-btn" onClick={() => changeMonth(1)}>
          ›
        </button>
      </div>

      {/* === Форма добавления событий === */}
      <div className="admin-panel">
        <select
          value={newEvent.scene}
          onChange={(e) => setNewEvent({ ...newEvent, scene: e.target.value })}
        >
          <option value="">Выбери сцену</option>
          {Object.keys(scenes).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Название события"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Время (напр. 12:00–13:00)"
          value={newEvent.time}
          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
        />
        <input
          type="color"
          value={newEvent.color}
          onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
        />
        <button onClick={handleAddEvent}>Добавить</button>
      </div>

      {/* === Таблица === */}
      <table className="scene-table">
        <thead>
          <tr>
            {Object.keys(scenes).map((scene) => (
              <th key={scene}>{scene}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.keys(scenes).map((scene) => (
              <td key={scene}>
                <div className="scene-column">
                  {scenes[scene].map((event, i) => (
                    <div
                      key={i}
                      className="event"
                      style={{ backgroundColor: event.color }}
                    >
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">{event.time}</div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(scene, i)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
