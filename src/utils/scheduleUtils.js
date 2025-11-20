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

export const resolveUserLogin = (user) =>
  user?.login ||
  user?.userName ||
  user?.username ||
  user?.email ||
  null;

const clampAlpha = (value) => Math.min(1, Math.max(0, value));

const hexToRgb = (hex) => {
  if (!hex || typeof hex !== "string") return null;
  const normalized = hex.trim().replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  if (full.length !== 6) return null;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

export const toEventBackground = (color, alpha = 0.82) => {
  if (!color) {
    return "rgba(255, 215, 170, 0.82)";
  }

  // Already rgba/hsla/etc.
  if (color.startsWith("rgb") || color.startsWith("hsl")) {
    return color;
  }

  const rgb = hexToRgb(color);
  if (!rgb) {
    return "rgba(255, 215, 170, 0.82)";
  }
  const safeAlpha = clampAlpha(alpha);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${safeAlpha})`;
};
