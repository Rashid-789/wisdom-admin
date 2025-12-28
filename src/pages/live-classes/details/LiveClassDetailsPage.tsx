import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../../../app/shared";

import { getLiveSession, listAttendance, listChatMessages } from "../Api/liveClasses.api";
import type { LiveSession, AttendanceRow, ChatMessage } from "../Types/liveClasses.types";

import LiveClassDetailsHeader from "./components/LiveClassDetailsHeader";
import AttendanceTable from "./components/AttendanceTable";
import ChatModerationPanel from "./components/ChatModerationPanel";
import RecordingLinkCard from "./components/RecordingLinkCard";

export default function LiveClassDetailsPage() {
  const { id = "" } = useParams();

  const [session, setSession] = React.useState<LiveSession | null>(null);
  const [attendance, setAttendance] = React.useState<AttendanceRow[]>([]);
  const [chat, setChat] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, c] = await Promise.all([
        getLiveSession(id),
        listAttendance(id),
        listChatMessages(id),
      ]);
      setSession(s);
      setAttendance(a);
      setChat(c);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => { load(); }, [load]);

  if (loading) return <div className="px-4 py-6 sm:px-6"><div className="h-40 animate-pulse rounded-2xl bg-slate-100" /></div>;

  if (!session) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <Card><CardContent className="p-6 text-sm text-slate-600">Session not found.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 space-y-4">
      <LiveClassDetailsHeader session={session} onChanged={load} />
      <RecordingLinkCard session={session} onChanged={load} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AttendanceTable rows={attendance} />
        <ChatModerationPanel rows={chat} onChanged={load} />
      </div>
    </div>
  );
}
