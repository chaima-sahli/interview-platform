import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Peer from "peerjs";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
} from "lucide-react";
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

const InterviewSession = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  // --- video state ---
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallRef = useRef(null);
  const [callStatus, setCallStatus] = useState("Setting up your camera…");
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [mediaError, setMediaError] = useState(null);

  // --- code state ---
  const [language, setLanguage] = useState("javascript");
  const [codeReady, setCodeReady] = useState(false);
  const ydocRef = useRef(null);
  const ytextRef = useRef(null);
  const bindingRef = useRef(null);

  // ===== VIDEO: camera + PeerJS setup =====
  useEffect(() => {
    if (!socket) return;
    let localStream;

    const setup = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = localStream;
        if (localVideoRef.current)
          localVideoRef.current.srcObject = localStream;

        const peer = new Peer();
        peerRef.current = peer;

        peer.on("call", (incomingCall) => {
          incomingCall.answer(localStream);
          handleConnectedCall(incomingCall);
        });

        peer.on("open", (id) => {
          setCallStatus("Waiting for the other participant…");
          socket.emit("joinCallRoom", interviewId);
          socket.emit("peerReady", { interviewId, peerId: id });
        });

        peer.on("error", (err) => {
          console.error("PeerJS error:", err);
          setMediaError("Something went wrong with the call connection.");
        });
      } catch (err) {
        console.error("Media access error:", err);
        if (err.name === "NotAllowedError") {
          setMediaError(
            "Camera/microphone blocked. Check your OS privacy settings (Windows Settings / macOS System Settings) and restart your browser after allowing access.",
          );
        } else if (err.name === "NotFoundError") {
          setMediaError(
            "No camera or microphone found. Please connect a device.",
          );
        } else {
          setMediaError(
            "Something went wrong accessing your camera/microphone.",
          );
        }
      }
    };

    const handleConnectedCall = (call) => {
      activeCallRef.current = call;
      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current)
          remoteVideoRef.current.srcObject = remoteStream;
        setRemoteConnected(true);
        setCallStatus("Connected");
      });
      call.on("close", () => {
        setRemoteConnected(false);
        setCallStatus("The other participant left the call.");
      });
    };

    const handlePeerAvailable = ({ peerId }) => {
      if (!localStreamRef.current || !peerRef.current) return;
      const call = peerRef.current.call(peerId, localStreamRef.current);
      handleConnectedCall(call);
    };

    const handlePeerLeft = () => {
      setRemoteConnected(false);
      setCallStatus("The other participant left the call.");
    };

    socket.on("peerAvailable", handlePeerAvailable);
    socket.on("peerLeft", handlePeerLeft);

    setup();

    return () => {
      socket.off("peerAvailable", handlePeerAvailable);
      socket.off("peerLeft", handlePeerLeft);
      socket.emit("leaveCallRoom", interviewId);
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      activeCallRef.current?.close();
      peerRef.current?.destroy();
    };
  }, [socket, interviewId]);

  // ===== CODE: Yjs doc setup =====
  useEffect(() => {
    ydocRef.current = new Y.Doc();
    ytextRef.current = ydocRef.current.getText("code");
    return () => {
      bindingRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinCodeRoom", interviewId);

    const handleSync = ({ update, language: syncedLanguage }) => {
      Y.applyUpdate(ydocRef.current, new Uint8Array(update), "remote");
      setLanguage(syncedLanguage);
      setCodeReady(true);
    };
    const handleUpdate = ({ update }) => {
      Y.applyUpdate(ydocRef.current, new Uint8Array(update), "remote");
    };
    const handleLanguageChange = ({ language: newLang }) =>
      setLanguage(newLang);

    socket.on("codeSync", handleSync);
    socket.on("codeUpdate", handleUpdate);
    socket.on("codeLanguageChange", handleLanguageChange);

    return () => {
      socket.off("codeSync", handleSync);
      socket.off("codeUpdate", handleUpdate);
      socket.off("codeLanguageChange", handleLanguageChange);
    };
  }, [socket, interviewId]);

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
    bindingRef.current = new MonacoBinding(
      ytextRef.current,
      editor.getModel(),
      new Set([editor]),
    );
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket?.emit("codeLanguageChange", { interviewId, language: newLang });
    if (ytextRef.current.length === 0) {
      ytextRef.current.insert(0, DEFAULT_SNIPPETS[newLang]);
    }
  };

  // ===== shared controls =====
  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const toggleCam = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
  };

  const endSession = () => navigate("/schedule");

  return (
    <div className='flex flex-col h-[calc(100vh-4rem)]'>
      <div className='flex items-center gap-3 pb-4 border-b border-charcoal/10'>
        <button
          onClick={endSession}
          className='text-charcoal/50 hover:text-charcoal'
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className='font-display font-bold text-lg'>Interview session</h2>
          <p className='text-xs text-charcoal/40'>
            {callStatus} · {codeReady ? "Code synced live" : "Syncing code…"}
          </p>
        </div>
      </div>

      {mediaError && (
        <p className='text-sm text-coral bg-coral/10 rounded-lg px-3 py-2 mt-4'>
          {mediaError}
        </p>
      )}

      <div className='flex-1 flex gap-4 mt-4 min-h-0'>
        {/* Left: video column */}
        <div className='w-full max-w-xs flex flex-col gap-3'>
          <div className='relative rounded-2xl overflow-hidden bg-charcoal aspect-video'>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className='w-full h-full object-cover'
            />
            <span className='absolute bottom-2 left-2 text-xs text-white bg-charcoal/60 rounded-full px-2 py-1'>
              You
            </span>
          </div>

          <div className='relative rounded-2xl overflow-hidden bg-charcoal aspect-video flex items-center justify-center'>
            {remoteConnected ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className='w-full h-full object-cover'
              />
            ) : (
              <p className='text-white/40 text-xs px-4 text-center'>
                Waiting for the other participant…
              </p>
            )}
          </div>

          <div className='flex items-center justify-center gap-2'>
            <button
              onClick={toggleMic}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                micOn ? "bg-white text-charcoal" : "bg-coral text-white"
              }`}
            >
              {micOn ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button
              onClick={toggleCam}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                camOn ? "bg-white text-charcoal" : "bg-coral text-white"
              }`}
            >
              {camOn ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
            <button
              onClick={endSession}
              className='w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center hover:opacity-90 transition'
            >
              <PhoneOff size={16} />
            </button>
          </div>
        </div>

        {/* Right: code editor */}
        <div className='flex-1 flex flex-col min-w-0'>
          <div className='flex justify-end mb-3'>
            <select
              value={language}
              onChange={handleLanguageChange}
              className='bg-white border border-charcoal/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral'
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className='flex-1 rounded-2xl overflow-hidden border border-charcoal/10 min-h-0'>
            <Editor
              height='100%'
              language={language}
              theme='vs-dark'
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
      </div>
    </div>
  );
};

export default InterviewSession;
