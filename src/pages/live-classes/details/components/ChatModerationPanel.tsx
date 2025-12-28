
import React from "react";
import { Card, CardContent, Input, Button } from "../../../../app/shared";
import type { ChatMessage } from "../../Types/liveClasses.types";
import { deleteMessage, flagMessage } from "../../Api/liveClasses.api";

/**
 * Chat moderation:
 * - flag/unflag message
 * - delete message (soft delete)
 * Later: mute user / ban user with Firebase rules
 */
export default function ChatModerationPanel({
  rows,
  onChanged,
}: {
  rows: ChatMessage[];
  onChanged: () => void;
}) {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((m) => `${m.userName} ${m.message}`.toLowerCase().includes(s));
  }, [rows, search]);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">Chat Moderation</p>
            <p className="text-sm text-slate-500">Review and moderate messages</p>
          </div>

          <div className="w-full sm:w-[260px]">
            <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." />
          </div>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
              No messages.
            </div>
          ) : (
            filtered.map((m) => (
              <div key={m.id} className="rounded-2xl border border-slate-100 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{m.userName}</p>
                    <p className={`mt-1 text-sm ${m.deleted ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {m.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await flagMessage(m.id, !m.flagged);
                        onChanged();
                      }}
                    >
                      {m.flagged ? "Unflag" : "Flag"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={async () => {
                        await deleteMessage(m.id);
                        onChanged();
                      }}
                      disabled={!!m.deleted}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
