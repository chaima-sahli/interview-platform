import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { ArrowLeft } from "lucide-react";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

const DEFAULT_SNIPPETS = {
  javascript: "function solve() {\n  // write your solution here\n}\n",
  python: "def solve():\n    # write your solution here\n    pass\n",
  java: "class Solution {\n    void solve() {\n        // write your solution here\n    }\n}\n",
  cpp: "void solve() {\n    // write your solution here\n}\n",
};

const CodeSession = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_SNIPPETS.javascript);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(DEFAULT_SNIPPETS[newLang]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between pb-4 border-b border-charcoal/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/code")} className="text-charcoal/50 hover:text-charcoal">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-display font-bold text-lg">Coding session</h2>
        </div>

        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-white border border-charcoal/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 mt-4 rounded-2xl overflow-hidden border border-charcoal/10">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            fontFamily: "'JetBrains Mono', monospace",
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
};

export default CodeSession;