import { useEffect, useMemo, useState } from "react";
import "./Schedule.css";
import {
  MONTH_NAMES,
  formatDisplayDate,
  formatDateKey,
  formatWeekdayLong,
  getDateInputValue,
  isSameDay,
  parseDateInputValue,
  resolveUserLogin,
  toEventBackground,
} from "../utils/scheduleUtils.js";
import useScheduleData from "../hooks/useScheduleData";
import ScheduleTabs from "./ScheduleTabs.jsx";
import ScheduleAdminPanel from "./ScheduleAdminPanel.jsx";
import ScheduleDateSwitcher from "./ScheduleDateSwitcher.jsx";
import { addEventParticipant, deleteScheduleEvent } from "../api/scheduleApi";
import { getUsers } from "../api/usersApi";
import EventAssignControls from "./EventAssignControls.jsx";

export default function ScheduleDay({
  isAdmin = false,
  currentUser = null,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPersonal, setShowPersonal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState({});
  const today = useMemo(() => new Date(), []);
  const userLogin = useMemo(() => resolveUserLogin(currentUser), [currentUser]);

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
    participantLogin: showPersonal && userLogin ? userLogin : undefined,
    refreshKey,
  });

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
      <ScheduleTabs />
      <ScheduleDateSwitcher
        title={formatWeekdayLong(currentDate)}
        subtitle={dayLabel}
        isToday={isToday}
        inputType="date"
        inputValue={getDateInputValue(currentDate)}
        onInputChange={handleDayInputChange}
        onPrev={() => changeDay(-1)}
        onNext={() => changeDay(1)}
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
          defaultDate={dateKey}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onCreated={triggerRefresh}
          title={`События ${formatDisplayDate(dateKey)}`}
        />
      )}

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
                      {event.timeStart && event.timeEnd
                        ? `${event.timeStart}–${event.timeEnd}`
                        : event.timeStart || event.timeEnd || ""}
                    </div>
                    {event.participants?.length > 0 && (
                      <div className="event-participants">
                        {event.participants.map((p) => (
                          <span
                            key={`${event.id}-${p.userLogin}-${p.responsibility}`}
                          >
                            {p.fullName || p.userLogin}{" "}
                            {p.responsibility && `(${p.responsibility})`}
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
    </div>
  );
}
