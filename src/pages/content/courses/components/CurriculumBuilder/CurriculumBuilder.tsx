import React from "react";
import type { CourseCurriculum, Chapter } from "../../../Types/content.types";
import { Button, Card, CardContent, Drawer, Input } from "../../../../../app/shared";
import ChapterCard from "./ChapterCard";

/**
 * CurriculumBuilder responsibilities:
 * - Add/edit chapters + topics
 * - Reorder chapters & topics (drag-drop)
 * - Attach lecture/exercise is handled in Lectures/Exercises tabs
 */
type Props = {
  value: CourseCurriculum;
  onChange: (next: CourseCurriculum) => void;
  isLoading?: boolean;
};

export default function CurriculumBuilder({ value, onChange, isLoading }: Props) {
  const [chapterDrawer, setChapterDrawer] = React.useState(false);
  const [newChapterTitle, setNewChapterTitle] = React.useState("");

  const addChapter = () => {
    const title = newChapterTitle.trim();
    if (!title) return;

    const nextCh: Chapter = {
      id: `ch_${Math.random().toString(16).slice(2)}`,
      title,
      order: value.chapters.length + 1,
      topics: [],
    };

    onChange({ ...value, chapters: [...value.chapters, nextCh] });
    setNewChapterTitle("");
    setChapterDrawer(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-900">Chapters</p>
        <Button variant="outline" onClick={() => setChapterDrawer(true)}>
          Add Chapter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      ) : value.chapters.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
          No chapters yet. Click <b>Add Chapter</b> to start.
        </div>
      ) : (
        <div className="space-y-3">
          {value.chapters
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((ch) => (
              <ChapterCard
                key={ch.id}
                chapter={ch}
                onChangeChapter={(updated) => {
                  onChange({
                    ...value,
                    chapters: value.chapters.map((c) => (c.id === updated.id ? updated : c)),
                  });
                }}
                onDeleteChapter={() => {
                  const next = value.chapters.filter((c) => c.id !== ch.id).map((c, idx) => ({ ...c, order: idx + 1 }));
                  onChange({ ...value, chapters: next });
                }}
              />
            ))}
        </div>
      )}

      {/* Add chapter drawer */}
      <Drawer open={chapterDrawer} onClose={() => setChapterDrawer(false)} title="Add Chapter" description="Chapters contain topics.">
        <Card>
          <CardContent className="p-4 space-y-3">
            <Input label="Chapter title" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} placeholder="Introduction" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setChapterDrawer(false)}>Cancel</Button>
              <Button onClick={addChapter} disabled={!newChapterTitle.trim()}>Add</Button>
            </div>
          </CardContent>
        </Card>
      </Drawer>
    </div>
  );
}

