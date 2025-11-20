import "./Schedule.css";

export default function ScheduleDateSwitcher({
  title,
  subtitle,
  rangeLabel,
  isToday = false,
  inputType = "date",
  inputValue,
  onInputChange,
  onPrev,
  onNext,
}) {
  const badgeClassName = isToday
    ? "today-badge"
    : "today-badge today-badge--placeholder";

  return (
    <div className="month-switcher">
      <button type="button" className="nav-btn" onClick={onPrev}>
        ‹
      </button>
      <div className="month-label day-label">
        <div className="day-badge-row">
          <span className={badgeClassName}>Сегодня</span>
        </div>
        <div className="day-heading">
          <span className="day-weekday">{title}</span>
          <span className="day-date">{subtitle}</span>
          {rangeLabel ? <span className="day-range">{rangeLabel}</span> : null}
        </div>
        <input
          type={inputType}
          className="date-input"
          value={inputValue}
          onChange={onInputChange}
        />
      </div>
      <button type="button" className="nav-btn" onClick={onNext}>
        ›
      </button>
    </div>
  );
}
