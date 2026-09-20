import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { ArrowLeft } from "lucide-react";
import { useSocket } from "../hooks/useSocket";

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
  const { socket } = useSocket();

  const [language, setLanguage] = useState("javascript");
  const [ready, setReady] = useState(false);

  const ydocRef = useRef(null);
  const ytextRef = useRef(null);
  const bindingRef = useRef(null);

  // Create the shared document once per session
  useEffect(() => {
    ydocRef.current = new Y.Doc();
    ytextRef.current = ydocRef.current.getText("code");

    return () => {
      bindingRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, []);

  // Wire up socket <-> Yjs sync
  useEffect(() => {
    if (!socket) return;

    socket.emit("joinCodeRoom", interviewId);

    const handleSync = ({ update, language: syncedLanguage }) => {
      Y.applyUpdate(ydocRef.current, new Uint8Array(update), "remote");
      setLanguage(syncedLanguage);
      setReady(true);
    };

    const handleUpdate = ({ update }) => {
      Y.applyUpdate(ydocRef.current, new Uint8Array(update), "remote");
    };

    const handleLanguageChange = ({ language: newLang }) => setLanguage(newLang);

    socket.on("codeSync", handleSync);
    socket.on("codeUpdate", handleUpdate);
    socket.on("codeLanguageChange", handleLanguageChange);

    return () => {
      socket.off("codeSync", handleSync);
      socket.off("codeUpdate", handleUpdate);
      socket.off("codeLanguageChange", handleLanguageChange);
    };
  }, [socket, interviewId]);

  // Broadcast our own edits — but never re-broadcast edits we just received
  useEffect(() => {
    if (!socket || !ydocRef.current) return;

    const handleDocUpdate = (update, origin) => {
      if (origin === "remote") return;
      socket.emit("codeUpdate", { interviewId, update });
    };

    ydocRef.current.on("update", handleDocUpdate);
    return () => ydocRef.current.off("update", handleDocUpdate);
  }, [socket, interviewId]);

  const handleEditorMount = (editor) => {
    bindingRef.current = new MonacoBinding(ytextRef.current, editor.getModel(), new Set([editor]));
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket?.emit("codeLanguageChange", { interviewId, language: newLang });

    if (ytextRef.current.length === 0) {
      ytextRef.current.insert(0, DEFAULT_SNIPPETS[newLang]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between pb-4 border-b border-charcoal/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/code")} className="text-charcoal/50 hover:text-charcoal">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-display font-bold text-lg">Coding session</h2>
            <p className="text-xs text-charcoal/40">{ready ? "Synced live" : "Connecting…"}</p>
          </div>
        </div>

        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-white border border-charcoal/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 mt-4 rounded-2xl overflow-hidden border border-charcoal/10">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          onMount={handleEditorMount}
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