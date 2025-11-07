import { useState, useEffect, useCallback } from "react";
import { getUsers, createUser, deleteUser } from "../../api/usersApi";
import { getCurrentUser } from "../../api/authApi";
import "./Artists.css";

const INITIAL_FORM_STATE = {
  login: "",
  password: "",
  name: "",
  surname: "",
  lastName: "",
  experience: "",
  photo: null,
};

const PLACEHOLDER_IMAGE = "https://placehold.co/400x300?text=Profile";

export default function UserSection({
  title,
  role,
  roleLabel = "пользователей",
  isAdmin = false,
}) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUsers(role);
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || "Не удалось загрузить пользователей");
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        return;
      }
      const data = await getCurrentUser();
      setCurrentUser(data);
    } catch (err) {
      console.warn("Не удалось получить текущего пользователя", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, [fetchUsers, fetchCurrentUser]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      photo: file ?? null,
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setActionError("");
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setActionError("");

    const preparedExperience = Number(formData.experience);
    if (Number.isNaN(preparedExperience) || preparedExperience < 0) {
      setActionError("Введите корректный стаж в годах");
      return;
    }

    const requiredFields = ["login", "password", "name", "surname", "lastName"];
    const hasEmptyRequired = requiredFields.some(
      (field) => !formData[field]?.trim()
    );

    if (hasEmptyRequired) {
      setActionError("Все поля обязательны");
      return;
    }

    const payload = new FormData();
    payload.append("login", formData.login.trim());
    payload.append("password", formData.password.trim());
    payload.append("name", formData.name.trim());
    payload.append("surname", formData.surname.trim());
    payload.append("lastName", formData.lastName.trim());
    payload.append("experience", String(preparedExperience));
    payload.append("role", role);
    if (formData.photo) {
      payload.append("photo", formData.photo);
    }

    setIsSubmitting(true);
    try {
      await createUser(payload);
      resetForm();
      await fetchUsers();
    } catch (err) {
      setActionError(err.message || "Не удалось создать пользователя");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (login) => {
    if (
      !window.confirm(
        `Удалить ${roleLabel ?? "пользователя"} с логином «${login}»?`
      )
    ) {
      return;
    }

    try {
      await deleteUser(login);
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Не удалось удалить пользователя");
    }
  };

  return (
    <div className="artists-page">
      <h2>{title}</h2>

      {isAdmin && (
        <section className="artists-admin-panel">
          <h3>Администрирование</h3>
          <form className="artists-admin-form" onSubmit={handleAddUser}>
            <div className="form-row">
              <input
                type="text"
                name="login"
                placeholder="Логин"
                value={formData.login}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="experience"
                placeholder="Стаж (годы)"
                value={formData.experience}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                name="surname"
                placeholder="Фамилия"
                value={formData.surname}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Имя"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Отчество"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row file-row">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {actionError && <p className="form-error">{actionError}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохраняем..." : "Добавить пользователя"}
            </button>
          </form>
        </section>
      )}

      {isLoading && (
        <p className="info-message">Загружаем список {roleLabel}...</p>
      )}
      {error && !isLoading && <p className="error-message">{error}</p>}

      {!isLoading && !users.length && (
        <p className="info-message">
          Пока нет ни одного пользователя с ролью {roleLabel}.
        </p>
      )}

      <div className="artists-grid">
        {users.map((user) => {
          const isCurrent = currentUser?.login === user.login;
          const displayName =
            [user.surname, user.name, user.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() || user.login;
          const experienceLabel =
            typeof user.experience === "number"
              ? `${user.experience} лет`
              : "—";
          const avatar = user.photoUrl || PLACEHOLDER_IMAGE;

          return (
            <div
              className={`artist-card ${isCurrent ? "current-user" : ""}`}
              key={user.login}
            >
              <img src={avatar} alt={displayName} />
              <div className="artist-info">
                <h3>{displayName}</h3>
                <p className="role">{user.role}</p>
                <p className="exp">Стаж: {experienceLabel}</p>
                {isAdmin && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDeleteUser(user.login)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
