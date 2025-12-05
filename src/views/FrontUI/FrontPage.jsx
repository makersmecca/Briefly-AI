import React, { useState, useEffect } from "react";
import { summarizeText } from "../../LLM/summarizer";

const FrontPage = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    chrome.storage.local.get(["selectedText", "darkMode"], (data) => {
      if (typeof data.darkMode !== "undefined") {
        return Boolean(data.darkMode);
      } else {
        return false;
      }
    })
  );

  const handleThemeChange = (e) => {
    const next =
      typeof e?.target?.checked === "boolean" ? e.target.checked : !isDarkMode;
    setIsDarkMode(next);
    try {
      chrome.storage.local.set({ darkMode: next });
    } catch (err) {
      console.error("chrome.storage set failed", err);
    }
  };

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
    chrome.storage.local.get(["selectedText", "darkMode"], (data) => {
      if (typeof data.darkMode !== "undefined") {
        setIsDarkMode(Boolean(data.darkMode));
      }

      if (data.selectedText) {
        setInputQuery(data.selectedText);
        chrome.storage.local.remove("selectedText");
        handleSubmit();
      }
    });
  }, []);

  return (
    <div
      className={`w-96 p-4 flex flex-col gap-3 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="top-heading flex justify-between items-center">
        <div className="text-2xl">Briefly AI</div>
        <div className="theme-toggle">
          <label className="flex cursor-pointer select-none items-center">
            <div className="relative">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={handleThemeChange}
                className="sr-only"
                aria-checked={isDarkMode}
              />
              <div
                className={`block h-6 w-12 rounded-full transition-colors ${
                  isDarkMode ? "bg-blue-600" : "bg-[#E5E7EB]"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform transform ${
                  isDarkMode ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </div>
          </label>
        </div>
      </div>

      <textarea
        className={`w-full h-24 p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-colors ${
          isDarkMode
            ? "text-white placeholder-gray-300"
            : "text-gray-900 placeholder-gray-500"
        }`}
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

      <div
        className={`h-36 p-2 border rounded-md overflow-y-auto transition-colors ${
          isDarkMode
            ? "border-gray-600 bg-gray-700"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div
              className={`w-6 h-6 border-4 rounded-full animate-spin ${
                isDarkMode
                  ? "border-gray-600 border-t-blue-400"
                  : "border-gray-300 border-t-blue-500"
              }`}
            ></div>
          </div>
        ) : (
          <p
            className={`whitespace-pre-wrap transition-colors ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {summaryText}
          </p>
        )}
      </div>
    </div>
  );
};

export default FrontPage;
