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

function buildPrompt(text) {
  const cleaned = text.trim();

  if (cleaned.split(" ").length < 3) {
    return `Rewrite this text in correct English:\n\n${cleaned}`;
  }

  if (!/[a-zA-Z]/.test(cleaned)) {
    return `Explain what this means:\n\n${cleaned}`;
  }

  if (cleaned.length < 60) {
    return `Rewrite the following text in clear, correct English. If it's incomplete, rewrite it meaningfully:\n\n${cleaned}`;
  }

  return `Summarize the following text clearly, concisely, and meaningfully:\n\n${cleaned}`;
}

export async function summarizeText(text) {
  try {
    if (!summarizer) {
      summarizer = await pipeline("summarization", "flan-t5-small", {
        progress_callback: console.log,
      });
    }

    const prompt = buildPrompt(text);

    const result = await summarizer(prompt, {
      max_length: 300,
      min_length: 20,
    });

    return result[0].summary_text;
  } catch (err) {
    console.error("Error in summarization:", err);
    return "Failed to summarize text.";
  }
}
