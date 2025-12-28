
import React from "react";
import { Card, CardContent } from "../../../app/shared";
import { cn } from "../../../app/utils/cn";

type Props = {
  label: string;
  value: string;
  hint?: string;
  right?: React.ReactNode;
};

const KpiCard: React.FC<Props> = ({ label, value, hint, right }) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>

        {right ? (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50")}>
            {right}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
