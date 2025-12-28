// import React from "react";
import { Drawer, Card, CardContent } from "../../../../../app/shared";

export default function AttachExerciseModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Attach Exercise to Topic"
      description="Pick a topic and attach an exercise (Topic.exerciseId)."
    >
      <Card>
        <CardContent className="p-4 text-sm text-slate-600">
          UI scaffold ready.
          <br />
          Next we will:
          <ul className="mt-2 list-disc pl-5">
            <li>Load curriculum topics</li>
            <li>Load exercises bank</li>
            <li>Save Topic.exerciseId and persist via saveCurriculum()</li>
          </ul>
        </CardContent>
      </Card>
    </Drawer>
  );
}

