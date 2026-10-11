import { EdgeTTS } from "@andresaya/edge-tts";

export async function speak(text: string, voice = "fa-IR-DilaraNeural"): Promise<Buffer> {
  const tts = new EdgeTTS();
  await tts.setVoice(voice);
  await tts.setText(text);
  const result = await tts.synthesize();
  if (!result || !result.audio) {
    throw new Error("TTS synthesis failed");
  }
  return Buffer.from(result.audio);
}
