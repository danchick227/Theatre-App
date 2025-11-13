import { useMemo, useState } from "react";
import "./Schedule.css";
import {
  MONTH_NAMES,
  formatDisplayDate,
  formatDateKey,
  formatWeekdayLong,
  getDateInputValue,
  isSameDay,
  parseDateInputValue,
} from "./scheduleData";
import useScheduleData from "../hooks/useScheduleData";
import ScheduleTabs from "./ScheduleTabs.jsx";
import ScheduleAdminPanel from "./ScheduleAdminPanel.jsx";
import { deleteScheduleEvent } from "../api/scheduleApi";

export default function ScheduleDay({
  isAdmin = false,
  currentUser = null,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const today = useMemo(() => new Date(), []);

  const changeDay = (offset) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + offset);
      return next;
    });
  };

  const dayLabel = `${currentDate.getDate()} ${
    MONTH_NAMES[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  const dateKey = formatDateKey(currentDate);

  const { stages, eventsByDate, isLoading, error } = useScheduleData({
    startDate: dateKey,
    endDate: dateKey,
    refreshKey,
  });

  const eventsByScene = eventsByDate[dateKey] ?? {};
  const isToday = isSameDay(currentDate, today);

  const handleDayInputChange = (event) => {
    const selectedDate = parseDateInputValue(event.target.value);
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  };

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Удалить это событие?")) {
      return;
    }
    try {
      await deleteScheduleEvent(eventId);
      triggerRefresh();
    } catch (err) {
      alert(err.message || "Не удалось удалить событие");
    }
  };

  return (
    <div className="shedule">
      <ScheduleTabs />
      <div className="month-switcher">
        <button className="nav-btn" onClick={() => changeDay(-1)}>
          ‹
        </button>
        <div className="month-label day-label">
          <div className="day-heading">
            <span className="day-weekday">{formatWeekdayLong(currentDate)}</span>
            <span className="day-date">{dayLabel}</span>
          </div>
          {isToday && <span className="today-badge">Сегодня</span>}
          <input
            type="date"
            className="date-input"
            value={getDateInputValue(currentDate)}
            onChange={handleDayInputChange}
          />
        </div>
        <button className="nav-btn" onClick={() => changeDay(1)}>
          ›
        </button>
      </div>

      {error && <div className="schedule-alert error">{error}</div>}
      {isLoading && !error && (
        <div className="schedule-alert">Загружаем расписание…</div>
      )}
      {!error && !isLoading && stages.length === 0 && (
        <div className="schedule-alert">Нет данных о сценах</div>
      )}

      {isAdmin && !error && stages.length > 0 && (
        <ScheduleAdminPanel
          stages={stages}
          defaultDate={dateKey}
          currentUser={currentUser}
          onCreated={triggerRefresh}
          title={`События ${formatDisplayDate(dateKey)}`}
        />
      )}

      {!error && (
        <div className="day-grid">
          {stages.map((stage) => {
            const events = eventsByScene[stage.stageKey] ?? [];

            return (
              <div key={stage.stageKey} className="day-scene-card">
                <div className="scene-name">{stage.label}</div>
                {events.length === 0 ? (
                  <div className="empty-slot">Нет событий</div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="event"
                      style={{ backgroundColor: event.color }}
                    >
                      {isAdmin && (
                        <button
                          type="button"
                          className="event-delete-btn"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Удалить событие"
                        >
                          ×
                        </button>
                      )}
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">
                        {event.timeStart && event.timeEnd
                          ? `${event.timeStart}–${event.timeEnd}`
                          : event.timeStart || event.timeEnd || ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
