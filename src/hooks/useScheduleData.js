import { useEffect, useState } from "react";
import { getScheduleEvents, getStages } from "../api/scheduleApi";
import { formatDateKey } from "../components/scheduleData";

let syntheticStageCounter = 0;

const deriveStageKey = (value) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return (
    value.stageKey ??
    value.id ??
    value.stageId ??
    value.slug ??
    value.code ??
    value.name ??
    value.title ??
    null
  );
};

const deriveStageLabel = (value) => {
  if (!value) return "Сцена";
  if (typeof value === "string") return value;
  return (
    value.label ??
    value.name ??
    value.title ??
    value.displayName ??
    value.slug ??
    "Сцена"
  );
};

const normalizeStage = (stage) => {
  const stageKey =
    deriveStageKey(stage) ?? `stage-${syntheticStageCounter++}`;

  return {
    ...stage,
    stageKey,
    label: deriveStageLabel(stage),
  };
};

const synthesizeStage = (name, key) =>
  normalizeStage({
    stageKey: key ?? `synthetic-${syntheticStageCounter++}`,
    name: name ?? "Сцена",
  });

const extractEventStageKey = (event) =>
  deriveStageKey(event?.stage) ??
  (event?.stageId != null ? String(event.stageId) : null) ??
  event?.stageSlug ??
  event?.stageCode ??
  event?.stageName ??
  null;

const extractEventStageLabel = (event) =>
  event?.stage?.name ??
  event?.stageName ??
  event?.stage_title ??
  event?.stageLabel ??
  "Сцена";

const formatEventTime = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  if (typeof value === "string" && value.length >= 5) {
    return value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
  }
  return String(value);
};

const extractEventDateKey = (event) => {
  const candidates = [
    event?.date,
    event?.eventDate,
    event?.startDate,
    event?.dateStart,
    event?.timeStart,
    event?.time_start,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate instanceof Date) {
      return formatDateKey(candidate);
    }
    if (typeof candidate === "string" && candidate.length >= 10) {
      return candidate.slice(0, 10);
    }
  }

  return null;
};

const buildEventsIndex = (events = []) => {
  const result = {};

  events.forEach((event) => {
    const dateKey = extractEventDateKey(event);
    const stageKey = extractEventStageKey(event);
    if (!dateKey || !stageKey) {
      return;
    }

    if (!result[dateKey]) {
      result[dateKey] = {};
    }

    if (!result[dateKey][stageKey]) {
      result[dateKey][stageKey] = [];
    }

    const timeStart =
      event.timeStart ??
      event.time_start ??
      event.startTime ??
      event.start_time ??
      null;
    const timeEnd =
      event.timeEnd ?? event.time_end ?? event.endTime ?? event.end_time ?? null;

    result[dateKey][stageKey].push({
      id: event.id ?? `${dateKey}-${stageKey}-${result[dateKey][stageKey].length}`,
      title: event.title ?? event.name ?? "Без названия",
      timeStart: formatEventTime(timeStart),
      timeEnd: formatEventTime(timeEnd),
      color: event.colorHex ?? event.color_hex ?? event.color ?? undefined,
      raw: event,
    });
  });

  Object.values(result).forEach((stageMap) => {
    Object.values(stageMap).forEach((list) => {
      list.sort((a, b) => (a.timeStart || "").localeCompare(b.timeStart || ""));
    });
  });

  return result;
};

const mergeStagesWithEvents = (currentStages, events) => {
  const stageMap = new Map(
    currentStages.map((stage) => [stage.stageKey, stage])
  );

  events.forEach((event) => {
    const stageKey = extractEventStageKey(event);
    if (!stageKey || stageMap.has(stageKey)) {
      return;
    }

    stageMap.set(stageKey, synthesizeStage(extractEventStageLabel(event), stageKey));
  });

  return Array.from(stageMap.values());
};

export default function useScheduleData({ startDate, endDate, refreshKey = 0 }) {
  const [stages, setStages] = useState([]);
  const [eventsByDate, setEventsByDate] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [stagesError, setStagesError] = useState(null);
  const [eventsError, setEventsError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchStages = async () => {
      setStagesError(null);
      try {
        const data = await getStages();
        if (ignore) return;
        const normalized = Array.isArray(data)
          ? data.map(normalizeStage)
          : [];
        setStages(normalized);
      } catch (err) {
        if (!ignore) {
          setStagesError(err?.message || "Не удалось загрузить расписание");
        }
      }
    };

    fetchStages();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;
    let ignore = false;

    const fetchEvents = async () => {
      setIsLoading(true);
      setEventsError(null);
      try {
        const data = await getScheduleEvents({ startDate, endDate });
        if (ignore) return;
        const normalized = Array.isArray(data) ? data : [];
        setEventsByDate(buildEventsIndex(normalized));
        setStages((prev) => mergeStagesWithEvents(prev, normalized));
      } catch (err) {
        if (!ignore) {
          setEventsError(err.message || "Не удалось загрузить расписание");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      ignore = true;
    };
  }, [startDate, endDate, refreshKey]);

  return { stages, eventsByDate, isLoading, error: stagesError || eventsError };
}
