import { mkdir, readFile, writeFile } from "node:fs/promises";

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID;

if (!apiKey || !voiceId) {
  throw new Error("ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set in .env.local");
}

const script = await readFile("video/narration.txt", "utf8");

const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
  method: "POST",
  headers: {"xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg"},
  body: JSON.stringify({
    text: script,
    model_id: "eleven_multilingual_v2",
    voice_settings: {stability: 0.52, similarity_boost: 0.78, style: 0.28, use_speaker_boost: true},
  }),
});

if (!response.ok) throw new Error(`ElevenLabs request failed: ${response.status} ${await response.text()}`);
await mkdir("public/voiceover", {recursive: true});
await writeFile("public/voiceover/crash-lab-demo.mp3", Buffer.from(await response.arrayBuffer()));
console.log("Generated public/voiceover/crash-lab-demo.mp3");
