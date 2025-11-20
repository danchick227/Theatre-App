import { buildApiUrl } from "./httpClient";

const JSON_HEADERS = {
  Accept: "application/json",
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

const isUrlString = (value) => typeof value === "string";

const asUrlInstance = (target) => {
  if (target instanceof URL) {
    return new URL(target.toString());
  }
  if (isUrlString(target)) {
    return new URL(target);
  }
  return new URL(String(target));
};

const shouldRetryWithHttp = (targetUrl, error) => {
  if (!error || error.name !== "TypeError") {
    return false;
  }
  try {
    const url = asUrlInstance(targetUrl);
    return url.protocol === "https:" && LOCAL_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

const fetchWithLocalhostFallback = async (targetUrl, options) => {
  try {
    return await fetch(targetUrl, options);
  } catch (error) {
    if (!shouldRetryWithHttp(targetUrl, error)) {
      throw error;
    }

    const fallbackUrl = asUrlInstance(targetUrl);
    fallbackUrl.protocol = "http:";
    console.warn(
      `[scheduleApi] HTTPS ${fallbackUrl.hostname} недоступен, пробуем HTTP`
    );
    return fetch(fallbackUrl, options);
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Ошибка при запросе расписания");
  }
  return response.json();
};

export const getStages = async () => {
  const response = await fetchWithLocalhostFallback(buildApiUrl("/stages"), {
    headers: JSON_HEADERS,
    credentials: "include",
  });
  return handleResponse(response);
};

export const getScheduleEvents = async ({ startDate, endDate, participantLogin } = {}) => {
  const url = new URL(buildApiUrl("/scheduleevents"));
  if (startDate) url.searchParams.append("from", startDate);
  if (endDate) url.searchParams.append("to", endDate);
  if (participantLogin) url.searchParams.append("participantLogin", participantLogin);

  const response = await fetchWithLocalhostFallback(url, {
    headers: JSON_HEADERS,
    credentials: "include",
  });
  return handleResponse(response);
};

export const createScheduleEvent = async (payload) => {
  const response = await fetchWithLocalhostFallback(
    buildApiUrl("/scheduleevents"),
    {
      method: "POST",
      headers: {
        ...JSON_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  return handleResponse(response);
};

export const deleteScheduleEvent = async (eventId) => {
  const response = await fetchWithLocalhostFallback(
    buildApiUrl(`/scheduleevents/${eventId}`),
    {
      method: "DELETE",
      headers: JSON_HEADERS,
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Не удалось удалить событие");
  }
};

export const addEventParticipant = async ({ eventId, userLogin, responsibility, notes }) => {
  const response = await fetchWithLocalhostFallback(
    buildApiUrl(`/scheduleevents/${eventId}/participants`),
    {
      method: "POST",
      headers: {
        ...JSON_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userLogin,
        responsibility: responsibility || "participant",
        notes: notes || null,
      }),
    }
  );
  return handleResponse(response);
};
