import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../api/usersApi";
import { createScheduleEvent } from "../api/scheduleApi";
import "./Schedule.css";

const EVENT_TYPES = [
  { value: "performance", label: "Спектакль" },
  { value: "rehearsal", label: "Репетиция" },
  { value: "meeting", label: "Встреча" },
  { value: "workshop", label: "Мастерская" },
];

const EVENT_STATUSES = [
  { value: "planned", label: "Запланировано" },
  { value: "confirmed", label: "Подтверждено" },
  { value: "canceled", label: "Отменено" },
];

const generateRandomPastel = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 80;
  const lightness = 75;
  const alpha = 0.82;

  // hsl -> hex (for input) and rgba (for display)
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  const toHex = (value) => value.toString(16).padStart(2, "0");
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;

  return { hex, rgba };
};

const buildInitialState = (stageId, date) => ({
  stageId: stageId ?? "",
  title: "",
  eventType: "performance",
  status: "planned",
  date: date ?? "",
  timeStart: "10:00",
  timeEnd: "12:00",
  colorHex: generateRandomPastel().hex,
  artistLogin: "",
  notes: "",
});

export default function ScheduleAdminPanel({
  stages = [],
  defaultDate,
  currentUser,
  isAdmin = false,
  onCreated,
  title = "Управление расписанием",
}) {
  const [form, setForm] = useState(() =>
    buildInitialState(
      stages.find((stage) => stage.id != null || stage.stageKey)?.id ??
        stages.find((stage) => stage.stageKey)?.stageKey,
      defaultDate
    )
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artists, setArtists] = useState([]);

  const stageOptions = useMemo(
    () =>
      stages.map((stage) => {
        const value = stage.id ?? stage.stageKey ?? "";
        return {
          value,
          label:
            stage.label ??
            stage.name ??
            stage.slug ??
            `Сцена ${value || "?"}`,
        };
      }),
    [stages]
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      stageId: prev.stageId || stageOptions[0]?.value || "",
      date: defaultDate ?? prev.date,
    }));
  }, [stageOptions, defaultDate]);

  const userLogin =
    currentUser?.login ||
    currentUser?.userName ||
    currentUser?.username ||
    currentUser?.email ||
    null;

  const canManage = (isAdmin || Boolean(userLogin)) && stageOptions.length > 0;

  useEffect(() => {
    let ignore = false;
    if (!isAdmin) {
      setArtists([]);
      return undefined;
    }
    getUsers("artist")
      .then((list) => {
        if (!ignore) setArtists(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!ignore) setArtists([]);
      });
    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManage) {
      setError("Войдите как администратор, чтобы управлять расписанием");
      return;
    }
    if (!form.stageId || !form.date || !form.timeStart || !form.timeEnd) {
      setError("Заполните обязательные поля");
      return;
    }
    if (isAdmin && !form.artistLogin) {
      setError("Выберите артиста для назначения");
      return;
    }
    if (form.timeEnd <= form.timeStart) {
      setError("Время окончания должно быть позже времени начала");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createScheduleEvent({
        stageId:
          Number.isNaN(Number(form.stageId)) || form.stageId === ""
            ? form.stageId
            : Number(form.stageId),
        productionId: null,
        title: form.title.trim() || "Без названия",
        eventType: form.eventType,
        date: form.date,
        timeStart: form.timeStart,
        timeEnd: form.timeEnd,
        colorHex: form.colorHex || null,
        status: form.status,
        artistLogin: form.artistLogin || null,
        notes: form.notes?.trim() || null,
        createdByLogin: userLogin || undefined,
      });
      setSuccess("Событие добавлено");
      setForm((prev) => ({
        ...prev,
        title: "",
        notes: "",
        colorHex: generateRandomPastel().hex,
        artistLogin: "",
      }));
      onCreated?.();
    } catch (err) {
      setError(err.message || "Не удалось создать событие");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="admin-panel schedule-admin-panel">
      <div className="admin-panel-header">
        <h3>{title}</h3>
      </div>

      <form className="schedule-admin-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <select
            name="stageId"
            value={form.stageId}
            onChange={handleChange}
            disabled={!canManage || stageOptions.length === 0}
          >
            {stageOptions.length === 0 && <option value="">Нет сцен</option>}
            {stageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={form.date || ""}
            onChange={handleChange}
            disabled={!canManage}
            required
          />

          <input
            type="time"
            name="timeStart"
            value={form.timeStart}
            onChange={handleChange}
            disabled={!canManage}
            required
          />

          <input
            type="time"
            name="timeEnd"
            value={form.timeEnd}
            onChange={handleChange}
            disabled={!canManage}
            required
          />
        </div>

        <div className="form-row">
          <input
            type="text"
            name="title"
            placeholder="Название события"
            value={form.title}
            onChange={handleChange}
            disabled={!canManage}
            required
          />

          <select
            name="eventType"
            value={form.eventType}
            onChange={handleChange}
            disabled={!canManage}
          >
            {EVENT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={!canManage}
          >
            {EVENT_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="artistLogin"
            value={form.artistLogin}
            onChange={handleChange}
            disabled={!canManage || !isAdmin}
            required={isAdmin}
          >
            <option value="">{artists.length ? "Выберите артиста" : "Нет артистов"}</option>
            {artists.map((artist) => {
              const label = [artist.name, artist.surname, artist.lastName]
                .filter(Boolean)
                .join(" ") || artist.login;
              return (
                <option key={artist.login} value={artist.login}>
                  {label} ({artist.login})
                </option>
              );
            })}
          </select>

          <input
            type="color"
            name="colorHex"
            value={form.colorHex || "#ffffff"}
            onChange={handleChange}
            disabled={!canManage}
            title="Цвет карточки"
          />
        </div>

        <textarea
          name="notes"
          rows={2}
          placeholder="Комментарий (опционально)"
          value={form.notes}
          onChange={handleChange}
          disabled={!canManage}
        />

        {error && <p className="admin-panel-error">{error}</p>}
        {success && <p className="admin-panel-success">{success}</p>}

        <button type="submit" disabled={!canManage || isSubmitting}>
          {isSubmitting ? "Сохраняем..." : "Добавить событие"}
        </button>
      </form>
    </section>
  );
}
