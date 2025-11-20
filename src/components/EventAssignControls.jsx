import { useMemo } from "react";
import "./Schedule.css";

export default function EventAssignControls({
  eventId,
  users = [],
  selectedLogin = "",
  onSelectChange,
  onAssign,
}) {
  const hasUsers = useMemo(() => Array.isArray(users) && users.length > 0, [users]);

  if (!hasUsers) return null;

  return (
    <div className="assign-row">
      <select
        value={selectedLogin}
        onChange={(e) => onSelectChange?.(eventId, e.target.value)}
      >
        <option value="">Выберите участника</option>
        {users.map((user) => {
          const label = [user.name, user.surname, user.lastName].filter(Boolean).join(" ") || user.login;
          return (
            <option key={user.login} value={user.login}>
              {label} ({user.login})
            </option>
          );
        })}
      </select>
      <button
        type="button"
        className="assign-btn"
        onClick={() => onAssign?.(eventId)}
        disabled={!selectedLogin}
      >
        Назначить участника
      </button>
    </div>
  );
}
