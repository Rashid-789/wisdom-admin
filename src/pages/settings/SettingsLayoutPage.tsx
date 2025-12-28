import { Navigate, Outlet } from "react-router-dom";
import { paths } from "../../app/routes/paths";

export default function SettingsLayoutPage() {
  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        
      </div>

      <Outlet />
    </div>
  );
}

/** If you prefer an index redirect:
 * Route index element can be: <Navigate to={paths.admin.settings.account} replace />
 */
export function SettingsIndexRedirect() {
  return <Navigate to={paths.admin.settings.account} replace />;
}
