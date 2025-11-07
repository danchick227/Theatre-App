import UserSection from "./UserSection";
import { USER_ROLES } from "../../api/usersApi";

export default function Artists({ isAdmin = false }) {
  return (
    <UserSection
      title="Артисты театра"
      role={USER_ROLES.ARTIST}
      roleLabel="артистов"
      isAdmin={isAdmin}
    />
  );
}
