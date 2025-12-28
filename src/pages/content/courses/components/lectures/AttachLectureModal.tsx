// import React from "react";
import { Drawer, Card, CardContent } from "../../../../../app/shared";

/**
 * Attachment is curriculum-based:
 * Topic.lectureId = selectedLectureId
 *
 * In this scaffold: we only show UI.
 * Next step: connect it to curriculum save (Course Curriculum API).
 */
export default function AttachLectureModal({
  open,
  onClose,
//   courseId,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Attach Lecture to Topic"
      description="Pick a topic and attach a lecture (Topic.lectureId)."
    >
      <Card>
        <CardContent className="p-4 text-sm text-slate-600">
          UI scaffold ready.
          <br />
          Next we will:
          <ul className="mt-2 list-disc pl-5">
            <li>Load curriculum topics</li>
            <li>Load course lectures</li>
            <li>Save Topic.lectureId and persist via saveCurriculum()</li>
          </ul>
        </CardContent>
      </Card>
    </Drawer>
  );
}

