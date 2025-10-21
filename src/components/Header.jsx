import { useState } from "react";
import LoginModal from "./LoginModal.jsx";
import "./Header.css";
import whiteLogo from "../assets/whiteLogo.png";

export default function Header({ isAdmin, setIsAdmin }) {
  const [open, setOpen] = useState(false);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={whiteLogo} alt="Logo" />
          <span>тут могло быть ваше название</span>
        </div>

        <div className="header-actions">
          {!isAdmin ? (
            <button className="login-btn" onClick={() => setOpen(true)}>
              Войти как админ
            </button>
          ) : (
            <button className="logout-btn" onClick={() => setIsAdmin(false)}>
              Выйти
            </button>
          )}
        </div>
      </div>

      {open && (
        <LoginModal
          onClose={() => setOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </header>
  );
}
