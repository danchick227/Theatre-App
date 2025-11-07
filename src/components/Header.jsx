import "./Header.css";
import whiteLogo from "../assets/whiteLogo.png";

export default function Header({ isAdmin, setIsAdmin, onOpenLogin }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={whiteLogo} alt="Logo" />
          <span>тут могло быть ваше название</span>
        </div>

        <div className="header-actions">
          {!isAdmin ? (
            <button className="login-btn" onClick={onOpenLogin}>
              Войти как админ
            </button>
          ) : (
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                setIsAdmin(false);
              }}
            >
              Выйти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
