import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../../../app/shared";
import { getCourse } from "../Api/content.api";
import type { Course } from "../Types/content.types";
import CourseHeader from "./components/CourseHeader";
import CurriculumTab from "./tabs/CurriculumTab";
import LecturesTab from "./tabs/LecturesTab";
import ExercisesTab from "./tabs/ExercisesTab";
import PublishingTab from "./tabs/PublishingTab";

type TabKey = "curriculum" | "lectures" | "exercises" | "publishing";

export default function CourseDetailsPage() {
  const { courseId = "" } = useParams();
  const [course, setCourse] = React.useState<Course | null>(null);
  const [active, setActive] = React.useState<TabKey>("curriculum");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setCourse(await getCourse(courseId));
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);


  if (loading) {
    return <div className="px-4 py-6 sm:px-6"><div className="h-28 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  if (!course) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <Card><CardContent className="p-6 text-sm text-slate-600">Course not found.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <CourseHeader course={course} />

      {/* Internal tabs (not routes) for simplicity */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(["curriculum", "lectures", "exercises", "publishing"] as TabKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={
              active === k
                ? "rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                : "rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            }
          >
            {k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {active === "curriculum" ? <CurriculumTab course={course} /> : null}
        {active === "lectures" ? <LecturesTab course={course} /> : null}
        {active === "exercises" ? <ExercisesTab course={course} /> : null}
        {active === "publishing" ? <PublishingTab course={course} onCourseUpdated={setCourse} /> : null}
      </div>
    </div>
  );
}
