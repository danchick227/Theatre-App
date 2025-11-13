import { useMemo, useState } from "react";
import "./Schedule.css";
import {
  MONTH_NAMES,
  formatDateKey,
  formatDisplayDate,
  formatWeekdayShort,
  getMonthInputValue,
  isSameDay,
  parseMonthInputValue,
} from "./scheduleData";
import useScheduleData from "../hooks/useScheduleData";
import ScheduleTabs from "./ScheduleTabs.jsx";
import ScheduleAdminPanel from "./ScheduleAdminPanel.jsx";
import { deleteScheduleEvent } from "../api/scheduleApi";

export default function Schedule({ isAdmin = false, currentUser = null }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const today = useMemo(() => new Date(), []);

  const changeMonth = (offset) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + offset);
      return next;
    });
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, index) => ({
      date: new Date(year, month, index + 1),
      number: index + 1,
    }));
  }, [currentDate]);

  const isCurrentMonth =
    today.getFullYear() === currentDate.getFullYear() &&
    today.getMonth() === currentDate.getMonth();

  const rangeStart = formatDateKey(daysInMonth[0].date);
  const rangeEnd = formatDateKey(daysInMonth[daysInMonth.length - 1].date);

  const { stages, eventsByDate, isLoading, error } = useScheduleData({
    startDate: rangeStart,
    endDate: rangeEnd,
    refreshKey,
  });

  const getEvents = (dateKey, stageKey) =>
    eventsByDate[dateKey]?.[stageKey] ?? [];

  const renderEventTime = (event) => {
    if (event.timeStart && event.timeEnd) {
      return `${event.timeStart}–${event.timeEnd}`;
    }
    return event.timeStart || event.timeEnd || "";
  };

  const handleMonthInputChange = (event) => {
    const nextDate = parseMonthInputValue(event.target.value);
    if (nextDate) {
      setCurrentDate(nextDate);
    }
  };

  const rangeLabel = `${formatDisplayDate(rangeStart)} – ${formatDisplayDate(
    rangeEnd
  )}`;

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleDeleteEvent = async (eventId) => {
    if (
      !window.confirm("Удалить это событие? Действие нельзя отменить.")
    ) {
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
      {/* === Переключатель месяца === */}
      <div className="month-switcher">
        <button className="nav-btn" onClick={() => changeMonth(-1)}>
          ‹
        </button>
        <div className="month-label day-label">
          <div className="day-heading">
            <span className="day-weekday">Месяц</span>
            <span className="day-date">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <span className="day-range">{rangeLabel}</span>
          </div>
          {isCurrentMonth && <span className="today-badge">Сегодня</span>}
          <input
            type="month"
            className="date-input"
            value={getMonthInputValue(currentDate)}
            onChange={handleMonthInputChange}
          />
        </div>
        <button className="nav-btn" onClick={() => changeMonth(1)}>
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
          defaultDate={rangeStart}
          currentUser={currentUser}
          onCreated={triggerRefresh}
        />
      )}

      {/* === Таблица с календарной сеткой === */}
      {!error && (
        <table className="scene-table">
          <thead>
            <tr>
              <th className="date-column">Дата</th>
              {stages.map((stage) => (
                <th key={stage.stageKey}>{stage.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daysInMonth.map(({ date, number }) => {
              const dayKey = formatDateKey(date);
              const isToday = isSameDay(date, today);

              return (
                <tr key={dayKey} className={isToday ? "today-row" : ""}>
                  <td className="date-cell">
                    <span className="date-weekday">{formatWeekdayShort(date)}</span>
                    <span className="date-number">{number}</span>
                  </td>
                  {stages.map((stage) => {
                    const events = getEvents(dayKey, stage.stageKey);
                    return (
                      <td key={`${stage.stageKey}-${dayKey}`}>
                        <div className="scene-column">
                          {events.length === 0 ? (
                            <div className="empty-slot">—</div>
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
                                  {renderEventTime(event)}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
