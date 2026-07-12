import { useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useUIMessages, useSmoothText, type UIMessage } from "@convex-dev/agent/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function Conversation({
  threadId,
  projectId,
}: {
  threadId: string;
  projectId: Id<"projects">;
}) {
  const { results: messages } = useUIMessages(
    api.coach.listThreadMessages,
    { threadId },
    { initialNumItems: 50, stream: true },
  );
  const send = useMutation(api.coach.sendMessage);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const lastIsStreaming =
    messages.length > 0 &&
    messages[messages.length - 1].status === "streaming";
  const waitingForCoach =
    messages.length > 0 &&
    messages[messages.length - 1].role === "user" &&
    !lastIsStreaming;

  const submit = async () => {
    const prompt = draft.trim();
    if (!prompt) return;
    setDraft("");
    setNotice(null);
    try {
      await send({ projectId, prompt });
    } catch (e) {
      setDraft(prompt); // give their words back
      if (e instanceof ConvexError && (e.data as { kind?: string })?.kind === "RateLimited") {
        const retry = Math.ceil(((e.data as { retryAfter?: number }).retryAfter ?? 5000) / 1000);
        setNotice(`Catch your breath — try again in about ${retry}s.`);
      } else {
        setNotice(e instanceof Error ? e.message : "That didn't send. Try again?");
      }
    }
  };

  return (
    <div>
      <div className="convo">
        {messages.map((m) => (
          <Message key={m.key} message={m} />
        ))}
        {waitingForCoach && <div className="thinking">coach is thinking…</div>}
      </div>
      {notice && <p className="note" style={{ color: "var(--accent)" }}>{notice}</p>}
      <div className="composer">
        <textarea
          className="field"
          value={draft}
          placeholder="Say it how you'd say it"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
        />
        <button className="btn btn-primary" onClick={() => void submit()} disabled={!draft.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isCoach = message.role === "assistant";
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });
  if (!message.text && message.role !== "user") return null;
  return (
    <div className={`msg ${isCoach ? "msg-coach" : "msg-student"} fade-in`}>
      <div className="msg-tag">{isCoach ? "coach" : "you"}</div>
      <div className="msg-body">{isCoach ? visibleText : message.text}</div>
    </div>
  );
}
