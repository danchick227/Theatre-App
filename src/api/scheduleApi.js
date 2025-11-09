import { buildApiUrl } from "./httpClient";

const JSON_HEADERS = {
  Accept: "application/json",
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Ошибка при запросе расписания");
  }
  return response.json();
};

export const getStages = async () => {
  const response = await fetch(buildApiUrl("/stages"), {
    headers: JSON_HEADERS,
    credentials: "include",
  });
  return handleResponse(response);
};

export const getScheduleEvents = async ({ startDate, endDate } = {}) => {
  const url = new URL(buildApiUrl("/scheduleevents"));
  if (startDate) url.searchParams.append("from", startDate);
  if (endDate) url.searchParams.append("to", endDate);

  const response = await fetch(url, {
    headers: JSON_HEADERS,
    credentials: "include",
  });
  return handleResponse(response);
};

export const createScheduleEvent = async (payload) => {
  const response = await fetch(buildApiUrl("/scheduleevents"), {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteScheduleEvent = async (eventId) => {
  const response = await fetch(buildApiUrl(`/scheduleevents/${eventId}`), {
    method: "DELETE",
    headers: JSON_HEADERS,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Не удалось удалить событие");
  }
};
