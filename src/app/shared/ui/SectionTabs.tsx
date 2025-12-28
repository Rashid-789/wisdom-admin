import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

export type SectionTab = { label: string; to: string };

type Props = {
  tabs: SectionTab[];
};

const SectionTabs: React.FC<Props> = ({ tabs }) => {
  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain">
      <div className="inline-flex min-w-max rounded-2xl border border-slate-200 bg-white p-1">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-medium transition",
                isActive ? "bg-[#13334c] text-white" : "text-slate-700 hover:bg-slate-50"
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SectionTabs;
