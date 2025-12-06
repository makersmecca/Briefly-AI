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
  // Replace newlines with spaces
  cleaned = cleaned.replace(/\n+/g, " ");
  // Remove reference-like brackets [1], [88], etc.
  cleaned = cleaned.replace(/\[\d+\]/g, "");
  // Remove multiple spaces
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

  // Long text → explicit summarization instruction
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
      max_new_tokens: 150, // give it more room
      min_new_tokens: 50, // prevent super-short hallucinations
      num_beams: 5, // slightly stronger beam search
      early_stopping: true,
      repetition_penalty: 1.5, // not too high; 2.0 can distort output
    });

    return result[0].generated_text;
  } catch (err) {
    console.error("Error in summarization:", err);
    return "Failed to summarize text.";
  }
}
