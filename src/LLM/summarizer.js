import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = true;
env.allowRemoteModels = false;

const getModelPath = () => {
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.getURL
  ) {
    return chrome.runtime.getURL("models/");
  } else {
    return "/models/"; // dev server path
  }
};

env.localModelPath = getModelPath();

let summarizer;

export async function summarizeText(text) {
  try {
    if (!summarizer) {
      summarizer = await pipeline("summarization", "t5-small", {
        progress_callback: console.log,
      });
    }

    const result = await summarizer(text, {
      max_length: 200,
      min_length: 10,
    });

    return result[0].summary_text;
  } catch (err) {
    console.error("Error in summarization:", err);
    return "Failed to summarize text.";
  }
}
