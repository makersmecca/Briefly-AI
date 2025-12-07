import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = true;
env.allowRemoteModels = false;

const getModelPath = () => {
  if (chrome?.runtime?.getURL) {
    return chrome.runtime.getURL("models/");
  }
  return "/models/";
};

env.localModelPath = getModelPath();

let summarizer;

function preprocessText(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/\n+/g, " ");
  cleaned = cleaned.replace(/\[\d+\]/g, "");
  cleaned = cleaned.replace(/\s+/g, " ");
  return cleaned;
}

function buildPrompt(text) {
  const cleanedText = preprocessText(text);
  return `Summarize the text. 
  Keep the meaning accurate. 
  If it is over 200 characters, use 2–3 sentences or more.
  If it is under 200 characters, explain the meaning in at least 2 sentences without copying the text. 
  If short, do not copy it; summarize the idea in 1 sentence. 
  If poetic, explain the overall message. 
  Text: ${cleanedText}`;
}

export async function summarizeText(text) {
  try {
    if (!summarizer) {
      summarizer = await pipeline("text2text-generation", "flan-t5-small", {
        progress_callback: console.log,
      });
    }
    const prompt = buildPrompt(text);
    const result = await summarizer(prompt, {
      max_new_tokens: 150,
      min_new_tokens: 50,
      num_beams: 5,
      early_stopping: true,
      repetition_penalty: 1.5,
    });

    return result[0].generated_text;
  } catch (err) {
    console.error("Error in summarization:", err);
    return "Failed to summarize text.";
  }
}
