import React from "react";
import { cn } from "../utils/cn";

type Props = {
  title?: string;
  description?: string;
  right?: React.ReactNode;
  showHeader?: boolean;
  children: React.ReactNode;
  className?: string;
};

const PageContainer: React.FC<Props> = ({
  title,
  description,
  right,
  showHeader = false,
  children,
  className,
}) => {
  return (
    <div className={cn("px-4 py-4 sm:px-6 sm:py-6", className)}>
      {showHeader && (title || right) ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <div>
              <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h1>
              {description ? (
                <p className="text-sm text-slate-500">{description}</p>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          {right}
        </div>
      ) : right ? (
        <div className="mb-4 flex items-center justify-end gap-3">{right}</div>
      ) : null}

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
