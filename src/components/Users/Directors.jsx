import UserSection from "./UserSection";
import { USER_ROLES } from "../../api/usersApi";

export default function Directors({ isAdmin = false }) {
  return (
    <UserSection
      title="Режиссёры театра"
      role={USER_ROLES.DIRECTOR}
      roleLabel="режиссёров"
      isAdmin={isAdmin}
    />
  );
}
