
import React from "react";
import { Card, CardContent } from "../../../app/shared";
import { listLiveSessions } from "../Api/liveClasses.api";
import type { LiveSession } from "../Types/liveClasses.types";
import CalendarView from "./components/CalendarView";
import { SectionTabs, liveClassesTabs } from "../../../app/shared";
export default function LiveClassesCalendarPage() {
  const [rows, setRows] = React.useState<LiveSession[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // load a decent amount for calendar (later: query by month range)
        const res = await listLiveSessions({ page: 1, pageSize: 200, status: "all" });
        setRows(res.rows);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
          <SectionTabs tabs={liveClassesTabs} />
        </div>
        <CalendarView sessions={rows} isLoading={loading} />
      </CardContent>
    </Card>
  );
}
