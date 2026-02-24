import React from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button, Card, CardContent, Drawer, Input } from "../../../../../app/shared";
import type { Chapter, Topic } from "../../../Types/content.types";

type Props = {
  chapter: Chapter;
  onChangeChapter: (next: Chapter) => void;
  onDeleteChapter: () => void;
  onEditTopic: (topic: Topic) => void;
};

export default function ChapterCard({ chapter, onChangeChapter, onDeleteChapter, onEditTopic }: Props) {
  const [topicDrawer, setTopicDrawer] = React.useState(false);
  const [topicTitle, setTopicTitle] = React.useState("");

  const addTopic = () => {
    const t = topicTitle.trim();
    if (!t) return;

    const next: Topic = {
      id: `t_${Math.random().toString(16).slice(2)}`,
      title: t,
      order: chapter.topics.length + 1,
      rewardTokens: 0,
    };

    onChangeChapter({ ...chapter, topics: [...chapter.topics, next] });
    setTopicTitle("");
    setTopicDrawer(false);
  };

  const moveTopic = (topicId: string, dir: -1 | 1) => {
    const sorted = chapter.topics.slice().sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((t) => t.id === topicId);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[target];

    const next = sorted.map((x) => {
      if (x.id === a.id) return { ...x, order: b.order };
      if (x.id === b.id) return { ...x, order: a.order };
      return x;
    });

    onChangeChapter({ ...chapter, topics: next });
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{chapter.title}</p>
              <p className="text-xs text-slate-500">{chapter.topics.length} topics</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setTopicDrawer(true)}>
                <Plus size={16} /> <span className="ml-1 hidden sm:inline">Add Topic</span>
              </Button>
              <Button variant="outline" onClick={onDeleteChapter}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {chapter.topics
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => onEditTopic(t)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <GripVertical size={16} className="text-slate-300" />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-800">{t.title}</p>
                      <p className="text-xs text-slate-500">
                        Tokens: {t.rewardTokens ?? 0} • Video: {t.lectureId ? "attached" : "none"}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    <button className="rounded-xl px-2 py-1 text-xs text-slate-600 hover:bg-slate-50" onClick={() => moveTopic(t.id, -1)}>
                      ↑
                    </button>
                    <button className="rounded-xl px-2 py-1 text-xs text-slate-600 hover:bg-slate-50" onClick={() => moveTopic(t.id, 1)}>
                      ↓
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Drawer open={topicDrawer} onClose={() => setTopicDrawer(false)} title="Add Topic" description="Topic holds lecture video + tokens + optional exercise.">
        <Card>
          <CardContent className="p-4 space-y-3">
            <Input label="Topic title" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} placeholder="Basic Ratios" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTopicDrawer(false)}>Cancel</Button>
              <Button onClick={addTopic} disabled={!topicTitle.trim()}>Add</Button>
            </div>
          </CardContent>
        </Card>
      </Drawer>
    </>
  );
}