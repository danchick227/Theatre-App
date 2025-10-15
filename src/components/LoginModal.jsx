import "./LoginModal.css";

export default function LoginModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Регистрация / Вход</h2>

        <form>
          <input type="text" placeholder="Логин" required />
          <input type="password" placeholder="Пароль" required />
          <button type="submit">Продолжить</button>
        </form>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
