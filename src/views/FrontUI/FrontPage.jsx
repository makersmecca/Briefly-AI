import React, { useState, useEffect, useRef } from "react";
import { summarizeText } from "../../LLM/summarizer";

const FrontPage = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    chrome.storage.local.get(["selectedText", "darkMode"], (data) => {
      if (typeof data.darkMode !== "undefined") {
        setIsDarkMode(Boolean(data.darkMode));
      }
      if (data.selectedText) {
        const text = data.selectedText;
        setInputQuery(text);
        chrome.storage.local.remove("selectedText");
        sendMessage(text); //auto send query for summarizing when send from the webpage popup menu
      }
    });
  }, []);

  const handleThemeChange = (e) => {
    const next =
      typeof e?.target?.checked === "boolean" ? e.target.checked : !isDarkMode;
    setIsDarkMode(next);
    chrome.storage.local.set({ darkMode: next });
  };

  const sendMessage = async (queryinput) => {
    const text = queryinput.trim();
    if (!text) return;
    if (text.length <= 30) {
      setMessages((prev) => [...prev, { from: "user", text }]);
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "I need some more context for summarization. Can you please provide a longer text (at least 30 characters)?",
        },
      ]);
      setInputQuery("");
      return;
    }
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInputQuery("");
    setLoading(true);

    try {
      const summary = await summarizeText(text);
      setMessages((prev) => [...prev, { from: "ai", text: summary }]);
    } catch (err) {
      console.error("Summarization error:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "Uh oh! An error occurred while summarizing. Please try in some time",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => sendMessage(inputQuery);

  const handleCopySummary = async (i) => {
    if (typeof i !== "number") return;
    const msg = messages[i];
    const text = msg?.text ?? "";
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(i);
        return;
      } catch (err) {
        console.warn("clipboard.writeText failed, falling back:", err);
      }
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedIndex(i);
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
  };

  return (
    <div
      className={`w-96 min-h-[200px] max-h-[480px] flex flex-col p-4 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center text-xl font-semibold">
          Briefly{" "}
          <span
            className={`${isDarkMode ? "" : "text-[#B77466] font-bold"} mx-0.5`}
          >
            AI
          </span>
          <img
            src={`/briefly-logo-alt${isDarkMode ? "-dark" : ""}.png`}
            className={`${isDarkMode ? "mt-0.5" : ""}`}
            width={30}
            height={30}
          />
        </div>

        <label className="flex cursor-pointer select-none items-center">
          <div className="relative">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={handleThemeChange}
              className="sr-only"
            />
            <div
              className={`block h-6 w-12 rounded-full transition-colors ${
                isDarkMode
                  ? "bg-gray-500"
                  : "bg-[#FFE08F] border border-gray-300"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 h-4 w-4 rounded-full transition-transform ${
                isDarkMode
                  ? "translate-x-6 bg-white"
                  : "translate-x-0 bg-[#B77466]"
              }`}
            ></div>
          </div>
        </label>
      </div>

      <div
        className={`flex-1 overflow-y-auto space-y-3 pr-1 ${
          isDarkMode ? "scrollbar-dark" : "scrollbar-light"
        }`}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`relative max-w-[85%] rounded-xl text-lg whitespace-pre-wrap wrap-break-word ${
              m.from === "user"
                ? isDarkMode
                  ? "p-4 ml-auto bg-[#607B8F] text-white"
                  : "p-4 ml-auto bg-[#F5E7C6] text-gray-700"
                : isDarkMode
                ? "pt-10 px-4 pb-4 mr-auto bg-[#434E78] text-gray-100"
                : "pt-10 px-4 pb-4 mr-auto bg-gray-200 text-gray-800"
            }`}
          >
            {m.from === "ai" && (
              <>
                <button
                  className={`${
                    copiedIndex === i ? "w-[120px]" : "w-[100px]"
                  } h-[30px] rounded-3xl absolute text-md flex items-center justify-center gap-2 right-2.5 top-1.5 cursor-pointer bg-gray-300 hover:bg-gray-400 ${
                    isDarkMode
                      ? "text-gray-800 hover:text-gray-900 font-semibold"
                      : "text-gray-500 hover:text-gray-600 font-semibold"
                  }`}
                  onClick={() => handleCopySummary(i)}
                >
                  <img
                    src={`./copy-icon-${isDarkMode ? "light" : "dark"}.svg`}
                    alt="copy summary"
                    width="20px"
                    height="20px"
                  />
                  {copiedIndex === i ? "Copied!" : "Copy"}
                </button>
              </>
            )}
            {m.text}
          </div>
        ))}

        {loading && (
          <div
            className={`mr-auto p-2 rounded-xl max-w-[85%] ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 text-lg">
              <div
                className={`w-4 h-4 border-2 rounded-full animate-spin ${
                  isDarkMode
                    ? "border-gray-500 border-t-gray-400"
                    : "border-gray-400 border-t-gray-500"
                }`}
              ></div>
              <span>Summmarizing...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      <div className="flex items-center mt-2 gap-2">
        <textarea
          className={`flex-1 text-lg resize-none rounded-xl p-2 border 
            ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-300 placeholder:text-lg focus:outline-gray-200 focus:ring-1 scrollbar-dark"
                : "bg-white border-[#B77466] text-gray-900 placeholder-gray-500 placeholder:text-lg focus:outline-[#D58F80] focus:ring-1 focus:border-[#D58F80] scrollbar-light"
            } 
          `}
          placeholder="Enter text to summarize..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={loading}
          rows={inputQuery?.length > 100 ? "4" : "1"}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 rounded-full flex items-center justify-center text-white font-medium w-[50px] h-[50px] ${
            loading
              ? `${
                  isDarkMode ? "bg-gray-400" : "bg-[f2c75c]"
                } cursor-not-allowed`
              : `${
                  isDarkMode ? "bg-gray-300" : "bg-[#FFE08F]"
                } hover:bg-[#f2c75c] cursor-pointer`
          }`}
        >
          <img src="/send-icon.svg" height={35} width={35} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default FrontPage;
