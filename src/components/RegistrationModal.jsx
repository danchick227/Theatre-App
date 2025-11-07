import "./LoginModal.css";

export default function RegistrationModal({ onClose, onSuccess }) {
  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Регистрация / Вход</h2>

        <form>
          <input type="text" placeholder="Логин" required />
          <input type="password" placeholder="Пароль" required />
          <input type="password" placeholder="Пароль" required />
          <button type="submit" onClick={onSuccess}>
            Войти
          </button>
        </form>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
