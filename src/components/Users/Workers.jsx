import UserSection from "./UserSection";
import { USER_ROLES } from "../../api/usersApi";

export default function Workers({ isAdmin = false }) {
  return (
    <UserSection
      title="Монтировочный цех"
      role={USER_ROLES.WORKER}
      roleLabel="сотрудников цеха"
      isAdmin={isAdmin}
    />
  );
}
