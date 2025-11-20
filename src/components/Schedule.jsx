import { useEffect, useMemo, useState } from "react";
import "./Schedule.css";
import {
  MONTH_NAMES,
  formatDateKey,
  formatDisplayDate,
  formatWeekdayShort,
  getMonthInputValue,
  isSameDay,
  parseMonthInputValue,
  resolveUserLogin,
  toEventBackground,
} from "../utils/scheduleUtils.js";
import useScheduleData from "../hooks/useScheduleData";
import ScheduleAdminPanel from "./ScheduleAdminPanel.jsx";
import ScheduleDateSwitcher from "./ScheduleDateSwitcher.jsx";
import { addEventParticipant, deleteScheduleEvent } from "../api/scheduleApi";
import { getUsers } from "../api/usersApi";
import EventAssignControls from "./EventAssignControls.jsx";

// Clamp any incoming date to the first day of its month so navigation doesn't skip months
const normalizeToMonthStart = (dateLike) => {
  const candidate = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const baseDate =
    candidate instanceof Date && !Number.isNaN(candidate.getTime())
      ? candidate
      : new Date();
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
};

export default function Schedule({ isAdmin = false, currentUser = null }) {
  const [currentDate, setCurrentDate] = useState(() =>
    normalizeToMonthStart(new Date())
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPersonal, setShowPersonal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState({});
  const today = useMemo(() => new Date(), []);
  const userLogin = useMemo(() => resolveUserLogin(currentUser), [currentUser]);

  useEffect(() => {
    let ignore = false;
    if (!isAdmin) {
      setAllUsers([]);
      return undefined;
    }
    getUsers()
      .then((list) => {
        if (!ignore) setAllUsers(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!ignore) setAllUsers([]);
      });
    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && showPersonal) {
      setShowPersonal(false);
    }
  }, [isAdmin, showPersonal]);

  const changeMonth = (offset) => {
    setCurrentDate((prev) => {
      return normalizeToMonthStart(
        new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
      );
    });
  };

  const daysInMonth = useMemo(() => {
    const monthDate = normalizeToMonthStart(currentDate);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
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
    participantLogin: showPersonal && userLogin ? userLogin : undefined,
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
      setCurrentDate(normalizeToMonthStart(nextDate));
    }
  };

  const rangeLabel = `${formatDisplayDate(rangeStart)} – ${formatDisplayDate(
    rangeEnd
  )}`;
  const monthLabel = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

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

  const handleSelectAssignee = (eventId, login) => {
    setSelectedAssignees((prev) => ({ ...prev, [eventId]: login }));
  };

  const handleAssignParticipant = async (eventId) => {
    if (!userLogin || !isAdmin) {
      alert("Авторизуйтесь как администратор, чтобы назначать участников");
      return;
    }
    const login = selectedAssignees[eventId];
    if (!login) {
      alert("Выберите пользователя");
      return;
    }
    try {
      await addEventParticipant({
        eventId,
        userLogin: login,
        responsibility: "participant",
      });
      triggerRefresh();
    } catch (err) {
      alert(err.message || "Не удалось назначить участника");
    }
  };

  return (
    <div className={`shedule ${isAdmin ? "admin-view" : "user-view"}`}>
      <ScheduleDateSwitcher
        title="Месяц"
        subtitle={monthLabel}
        rangeLabel={rangeLabel}
        isToday={isCurrentMonth}
        inputType="month"
        inputValue={getMonthInputValue(currentDate)}
        onInputChange={handleMonthInputChange}
        onPrev={() => changeMonth(-1)}
        onNext={() => changeMonth(1)}
      />

      {userLogin && !isAdmin && (
        <div className="schedule-actions">
          <button
            type="button"
            className="personal-toggle-btn"
            onClick={() => setShowPersonal((prev) => !prev)}
          >
            {showPersonal ? "Показать все события" : "Показать личное расписание"}
          </button>
        </div>
      )}

      {error && <div className="schedule-alert error">{error}</div>}
      {isLoading && !error && (
        <div className="schedule-alert">Загружаем расписание…</div>
      )}
      {!error && !isLoading && stages.length === 0 && (
        <div className="schedule-alert">Нет данных о сценах</div>
      )}

      {isAdmin && (
        <ScheduleAdminPanel
          stages={stages}
          defaultDate={rangeStart}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onCreated={triggerRefresh}
        />
      )}

      <div className="schedule-day-list">
        {daysInMonth.map(({ date, number }) => {
          const dayKey = formatDateKey(date);
          const isToday = isSameDay(date, today);

          return (
            <section
              key={dayKey}
              className={`schedule-day-section${isToday ? " is-today" : ""}`}
            >
              <div className="schedule-day-header">
                <span className="date-chip">{formatWeekdayShort(date)}</span>
                <span className="date-chip date-chip-number">{number}</span>
                <span className="date-chip date-chip-month">
                  {MONTH_NAMES[date.getMonth()].slice(0, 3)}
                </span>
              </div>

              <div className="day-grid">
                {stages.map((stage) => {
                  const events = getEvents(dayKey, stage.stageKey);
                  return (
                    <div key={`${stage.stageKey}-${dayKey}`} className="day-scene-card">
                      <div className="scene-name">{stage.label}</div>
                      {events.length === 0 ? (
                        <div className="empty-slot">Нет событий</div>
                      ) : (
                        events.map((event) => (
                          <div
                            key={event.id}
                            className="event"
                            style={{ backgroundColor: toEventBackground(event.color) }}
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
                            {event.participants?.length > 0 && (
                              <div className="event-participants">
                                {event.participants.map((p) => (
                                  <span key={`${event.id}-${p.userLogin}-${p.responsibility}`}>
                                    {p.fullName || p.userLogin} {p.responsibility && `(${p.responsibility})`}
                                  </span>
                                ))}
                              </div>
                            )}
                            {isAdmin && (
                              <EventAssignControls
                                eventId={event.id}
                                users={allUsers}
                                selectedLogin={selectedAssignees[event.id] || ""}
                                onSelectChange={handleSelectAssignee}
                                onAssign={handleAssignParticipant}
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
