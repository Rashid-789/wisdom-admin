
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../app/shared";

type Props = {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

const ChartCard: React.FC<Props> = ({ title, description, right, children }) => {
  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {right}
      </CardHeader>

      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
};

export default ChartCard;
