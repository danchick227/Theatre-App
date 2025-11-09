import { useEffect, useMemo, useState } from "react";
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

const buildInitialState = (stageId, date) => ({
  stageId: stageId ?? "",
  title: "",
  eventType: "performance",
  status: "planned",
  date: date ?? "",
  timeStart: "10:00",
  timeEnd: "12:00",
  colorHex: "#cfd6f6",
  notes: "",
});

export default function ScheduleAdminPanel({
  stages = [],
  defaultDate,
  currentUser,
  onCreated,
  title = "Управление расписанием",
}) {
  const [form, setForm] = useState(() =>
    buildInitialState(
      stages.find((stage) => stage.id != null)?.id,
      defaultDate
    )
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stageOptions = useMemo(
    () =>
      stages
        .filter((stage) => stage.id != null)
        .map((stage) => ({
          value: stage.id,
          label: stage.label ?? stage.name ?? stage.slug ?? `Сцена ${stage.id}`,
        })),
    [stages]
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      stageId: prev.stageId || stageOptions[0]?.value || "",
      date: defaultDate ?? prev.date,
    }));
  }, [stageOptions, defaultDate]);

  const canManage = Boolean(currentUser?.login) && stageOptions.length > 0;

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
    if (form.timeEnd <= form.timeStart) {
      setError("Время окончания должно быть позже времени начала");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createScheduleEvent({
        stageId: Number(form.stageId),
        productionId: null,
        title: form.title.trim() || "Без названия",
        eventType: form.eventType,
        date: form.date,
        timeStart: form.timeStart,
        timeEnd: form.timeEnd,
        colorHex: form.colorHex || null,
        status: form.status,
        notes: form.notes?.trim() || null,
        createdByLogin: currentUser.login,
      });
      setSuccess("Событие добавлено");
      setForm((prev) => ({
        ...prev,
        title: "",
        notes: "",
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
        {!canManage && (
          <span className="admin-panel-hint">
            Войдите как администратор для управления
          </span>
        )}
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
