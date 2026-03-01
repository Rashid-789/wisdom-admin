// import React from "react";
// import { useParams } from "react-router-dom";
// import { Card, CardContent } from "../../../app/shared";
// import { getCourse } from "../Api/content.api";
// import type { Course } from "../Types/content.types";
// import CourseHeader from "./components/CourseHeader";
// import CurriculumTab from "./tabs/CurriculumTab";
// import LecturesTab from "./tabs/LecturesTab";
// import PublishingTab from "./tabs/PublishingTab";

// type TabKey = "curriculum" | "lectures" | "publishing";

// export default function CourseDetailsPage() {
//   const { courseId = "" } = useParams();
//   const [course, setCourse] = React.useState<Course | null>(null);
//   const [loading, setLoading] = React.useState(true);

//   const [active, setActive] = React.useState<TabKey>("curriculum");

//   React.useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const c = await getCourse(courseId);
//         setCourse(c);
//         setActive(c.category === "basic" ? "curriculum" : "lectures");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [courseId]);

//   if (loading) {
//     return (
//       <div className="px-4 py-6 sm:px-6">
//         <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
//       </div>
//     );
//   }

//   if (!course) {
//     return (
//       <div className="px-4 py-6 sm:px-6">
//         <Card>
//           <CardContent className="p-6 text-sm text-slate-600">Course not found.</CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const tabs: TabKey[] =
//     course.category === "basic"
//       ? ["curriculum", "publishing"]
//       : ["lectures", "publishing"];

//   return (
//     <div className="px-4 py-6 sm:px-6">
//       <CourseHeader course={course} />

//       <div className="mt-4 flex flex-wrap gap-2">
//         {tabs.map((k) => (
//           <button
//             key={k}
//             onClick={() => setActive(k)}
//             className={
//               active === k
//                 ? "rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
//                 : "rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
//             }
//           >
//             {k === "curriculum" ? "Curriculum" : k === "lectures" ? "Lectures" : "Publishing"}
//           </button>
//         ))}
//       </div>

//       <div className="mt-4">
//         {active === "curriculum" && course.category === "basic" ? <CurriculumTab course={course} /> : null}
//         {active === "lectures" && course.category === "skill" ? <LecturesTab course={course} /> : null}
//         {active === "publishing" ? <PublishingTab course={course} onCourseUpdated={setCourse} /> : null}
//       </div>
//     </div>
//   );
// }

import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../../../app/shared";
import { getCourse } from "../Api/content.api";
import type { Course } from "../Types/content.types";
import CourseHeader from "./components/CourseHeader";
import CurriculumTab from "./tabs/CurriculumTab";
import PublishingTab from "./tabs/PublishingTab";

type TabKey = "curriculum" | "publishing";

export default function CourseDetailsPage() {
  const { courseId = "" } = useParams();
  const [course, setCourse] = React.useState<Course | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [active, setActive] = React.useState<TabKey>("curriculum");

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const c = await getCourse(courseId);
        setCourse(c);
        setActive("curriculum");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">Course not found.</CardContent>
        </Card>
      </div>
    );
  }

  const tabs: TabKey[] = ["curriculum", "publishing"];

  return (
    <div className="px-4 py-6 sm:px-6">
      <CourseHeader course={course} />

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={
              active === k
                ? "rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                : "rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            }
          >
            {k === "curriculum" ? "Curriculum" : "Publishing"}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {active === "curriculum" ? <CurriculumTab course={course} /> : null}
        {active === "publishing" ? <PublishingTab course={course} onCourseUpdated={setCourse} /> : null}
      </div>
    </div>
  );
}