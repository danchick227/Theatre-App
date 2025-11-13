import { useMemo, useState } from "react";
import "./Schedule.css";
import {
  MONTH_NAMES,
  formatDateKey,
  formatDisplayDate,
  formatWeekdayShort,
  getDateInputValue,
  isSameDay,
  parseDateInputValue,
} from "./scheduleData";
import useScheduleData from "../hooks/useScheduleData";
import ScheduleTabs from "./ScheduleTabs.jsx";
import ScheduleAdminPanel from "./ScheduleAdminPanel.jsx";
import { deleteScheduleEvent } from "../api/scheduleApi";

const getStartOfWeek = (date) => {
  const mondayBasedIndex = (date.getDay() + 6) % 7; // 0 = Monday
  const start = new Date(date);
  start.setDate(date.getDate() - mondayBasedIndex);
  start.setHours(0, 0, 0, 0);
  return start;
};

export default function ScheduleWeek({
  isAdmin = false,
  currentUser = null,
}) {
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [refreshKey, setRefreshKey] = useState(0);
  const today = useMemo(() => new Date(), []);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        return date;
      }),
    [weekStart]
  );

  const changeWeek = (offset) => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + offset * 7);
      return getStartOfWeek(next);
    });
  };

  const getWeekLabel = () => {
    const start = weekDays[0];
    const end = weekDays[weekDays.length - 1];
    const sameMonth = start.getMonth() === end.getMonth();

    if (sameMonth) {
      return `${start.getDate()}–${end.getDate()} ${MONTH_NAMES[start.getMonth()]}`;
    }

    return `${start.getDate()} ${MONTH_NAMES[start.getMonth()]} – ${end.getDate()} ${
      MONTH_NAMES[end.getMonth()]
    }`;
  };

  const isCurrentWeek = weekDays.some((day) => isSameDay(day, today));

  const handleWeekDateChange = (event) => {
    const selectedDate = parseDateInputValue(event.target.value);
    if (selectedDate) {
      setWeekStart(getStartOfWeek(selectedDate));
    }
  };

  const rangeStart = formatDateKey(weekDays[0]);
  const rangeEnd = formatDateKey(weekDays[weekDays.length - 1]);

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

  const rangeLabel = `${formatDisplayDate(rangeStart)} – ${formatDisplayDate(
    rangeEnd
  )}`;

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
        <button className="nav-btn" onClick={() => changeWeek(-1)}>
          ‹
        </button>
        <div className="month-label day-label">
          <div className="day-heading">
            <span className="day-weekday">Неделя</span>
            <span className="day-date">
              {getWeekLabel()} {weekStart.getFullYear()}
            </span>
            <span className="day-range">{rangeLabel}</span>
          </div>
          {isCurrentWeek && <span className="today-badge">Сегодня</span>}
          <input
            type="date"
            className="date-input"
            value={getDateInputValue(weekStart)}
            onChange={handleWeekDateChange}
          />
        </div>
        <button className="nav-btn" onClick={() => changeWeek(1)}>
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
          title="Управление неделей"
        />
      )}

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
            {weekDays.map((date) => {
              const dayKey = formatDateKey(date);
              const isToday = isSameDay(date, today);

              return (
                <tr key={dayKey} className={isToday ? "today-row" : ""}>
                  <td className="date-cell">
                    <span className="date-weekday">{formatWeekdayShort(date)}</span>
                    <span className="date-number">{date.getDate()}</span>
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
