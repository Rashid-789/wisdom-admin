import { Outlet } from "react-router-dom";
import { SectionTabs, type SectionTab } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";

const tabs: SectionTab[] = [
  { label: "Transactions", to: paths.admin.payments.transactions },
  { label: "Plans", to: paths.admin.payments.plans },
  { label: "Refunds", to: paths.admin.payments.refunds },
];

export default function PaymentsLayoutPage() {
  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900"></h1>
        </div>
        <SectionTabs tabs={tabs} />
      </div>

      <Outlet />
    </div>
  );
}

