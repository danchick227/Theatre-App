import { useState } from "react";
import LoginModal from "./LoginModal.jsx";
import "./Header.css";
import whiteLogo from "../assets/whiteLogo.png";

export default function Header() {
  // 💡 Добавляем состояние для открытия/закрытия окна
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={whiteLogo} alt="Logo" />
          <span>тут могло быть ваше название</span>
        </div>

        {/* Кнопка открытия */}
        <button className="login-btn" onClick={() => setOpen(true)}>
          Войти
        </button>

        {/* Само окно (модалка) */}
        {open && <LoginModal onClose={() => setOpen(false)} />}
      </div>
    </header>
  );
}
