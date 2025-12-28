import { Outlet } from "react-router-dom";


export default function LiveClassesLayoutPage() {
  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      </div>

      <Outlet />
    </div>
  );
}
