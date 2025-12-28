import React from "react";
import { cn } from "../../utils/cn";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

const EmptyState: React.FC<Props> = ({ title, description, action, className }) => {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-white p-6 text-center", className)}>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
};

export default EmptyState;

