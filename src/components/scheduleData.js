export const MONTH_NAMES = [
  "ЯНВАРЬ",
  "ФЕВРАЛЬ",
  "МАРТ",
  "АПРЕЛЬ",
  "МАЙ",
  "ИЮНЬ",
  "ИЮЛЬ",
  "АВГУСТ",
  "СЕНТЯБРЬ",
  "ОКТЯБРЬ",
  "НОЯБРЬ",
  "ДЕКАБРЬ",
];

const WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
});

const WEEKDAY_LONG_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
});

export const formatWeekdayShort = (date) =>
  WEEKDAY_SHORT_FORMATTER.format(date).replace(".", "").toUpperCase();

export const formatWeekdayLong = (date) => {
  const weekday = WEEKDAY_LONG_FORMATTER.format(date);
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
};

export const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const getMonthInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const parseMonthInputValue = (value) => {
  if (!value) return null;
  const [year, month] = value.split("-");
  if (!year || !month) return null;
  return new Date(Number(year), Number(month) - 1, 1);
};

export const getDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateInputValue = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return null;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

export const formatDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

export const formatDisplayDate = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
};
