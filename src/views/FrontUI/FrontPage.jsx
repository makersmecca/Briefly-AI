import React, { useState, useEffect } from "react";
import { summarizeText } from "../../LLM/summarizer";

const FrontPage = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const query = inputQuery.trim();
    if (!query) return;
    setLoading(true);
    setSummaryText("");
    try {
      const summary = await summarizeText(query);
      setSummaryText(summary);
    } catch (error) {
      console.error("Error during summarization:", error);
      setSummaryText("An error occurred while generating the summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chrome.storage.local.get("selectedText", (data) => {
      if (data.selectedText) {
        setInputQuery(data.selectedText);
        chrome.storage.local.remove("selectedText");
        handleSubmit();
      }
    });
  }, []);

  return (
    <div className="w-96 p-4 flex flex-col gap-3 bg-white border rounded-2xl">
      <h2 className="text-lg font-semibold text-gray-800">AI Summarizer</h2>

      <textarea
        className="w-full h-24 p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        placeholder="Enter your query..."
        value={inputQuery}
        onChange={(e) => setInputQuery(e.target.value)}
        disabled={loading}
      />

      <button
        className={`w-full py-2 rounded-md text-white font-medium ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Generating..." : "Summarize"}
      </button>

      <div className="h-36 p-2 border rounded-md border-gray-300 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{summaryText}</p>
        )}
      </div>
    </div>
  );
};

export default FrontPage;
