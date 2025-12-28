import { Outlet } from "react-router-dom";

export default function BooksLayoutPage() {
  return (
    <div className="px-4 py-6 sm:px-6">
      <Outlet />
    </div>
  );
}
