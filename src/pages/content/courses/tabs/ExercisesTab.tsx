import React from "react";
import { Card, CardContent, Button } from "../../../../app/shared";
import type { Course } from "../../Types/content.types";
import AttachExerciseModal from "../components/exercises/AttachExerciseModal";
import ExerciseBuilderDrawer from "../components/exercises/ExerciseBuilderDrawer";

export default function ExercisesTab({ course }: { course: Course }) {
  const [attachOpen, setAttachOpen] = React.useState(false);
  const [builderOpen, setBuilderOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Exercises</p>
              <p className="text-sm text-slate-500">Create exercises and attach them to topics (optional).</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAttachOpen(true)}>Attach to Topic</Button>
              <Button onClick={() => setBuilderOpen(true)}>Create Exercise</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
            Exercise builder + attachment scaffold is ready.
            We’ll connect topic.exerciseId with curriculum in the next step.
          </div>
        </CardContent>
      </Card>

      <AttachExerciseModal open={attachOpen} onClose={() => setAttachOpen(false)} courseId={course.id} />
      <ExerciseBuilderDrawer open={builderOpen} onClose={() => setBuilderOpen(false)} onSaved={() => setBuilderOpen(false)} />
    </>
  );
}

