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
  const cleaned = preprocessText(text);
  if (cleaned.split(" ").length < 3) {
    return `Rewrite this text in correct English: ${cleaned}`;
  }
  if (cleaned.length < 100) {
    return `Summarize this text in one clear sentence: ${cleaned}`;
  }
  return `Summarize the following text in 2–3 sentences, keeping all factual information accurate: ${cleaned}`;
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
