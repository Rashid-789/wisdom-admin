
import React from "react";
import { cn } from "../../utils/cn";

type Props = {
  className?: string;
};

const Skeleton: React.FC<Props> = ({ className }) => {
  return <div className={cn("animate-pulse rounded-xl bg-slate-100", className)} />;
};

export default Skeleton;
