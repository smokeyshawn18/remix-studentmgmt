import type { ActionFunction } from "react-router";
import { logout } from "../session.server";

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export default function Logout() {
  return (
    <form method="post">
      <button type="submit">Logout</button>
    </form>
  );
}
