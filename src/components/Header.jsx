import "./Header.css";
import whiteLogo from "../assets/whiteLogo.png";

export default function Header({ isAdmin, currentUser, setIsAdmin, onOpenLogin, onLogout }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={whiteLogo} alt="Logo" />
          <span>тут могло быть ваше название</span>
        </div>

        <div className="header-actions">
          <button
            className="login-btn"
            onClick={() => {
              if (currentUser) {
                localStorage.removeItem("token");
                setIsAdmin(false);
                onLogout?.();
              } else {
                onOpenLogin();
              }
            }}
          >
            {currentUser ? "Выйти" : "Войти"}
          </button>
        </div>
      </div>
    </header>
  );
}
