import { createAPIFileRoute } from "@tanstack/react-start/api";
import { speak } from "../../lib/tts.server";

export const APIRoute = createAPIFileRoute("/api/speak")({
  POST: async ({ request }) => {
    const body = await request.json();
    const { text, voice } = body as { text?: string; voice?: string };
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    try {
      const audio = await speak(text, voice);
      return new Response(audio, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
        },
      });
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: "TTS failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
