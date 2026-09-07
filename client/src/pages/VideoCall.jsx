import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useSocket } from "../hooks/useSocket";

const VideoCall = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallRef = useRef(null);

  const [status, setStatus] = useState("Setting up your camera…");
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const setup = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = localStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

        const peer = new Peer();
        peerRef.current = peer;

        // Someone calls US — answer automatically with our own stream
        peer.on("call", (incomingCall) => {
          incomingCall.answer(localStream);
          handleConnectedCall(incomingCall);
        });

        peer.on("open", (id) => {
          setStatus("Waiting for the other participant…");
          socket.emit("joinCallRoom", interviewId);
          socket.emit("peerReady", { interviewId, peerId: id });
        });

        peer.on("error", (err) => {
          console.error("PeerJS error:", err);
          setError("Something went wrong with the call connection.");
        });
      } catch (err) {
        console.error("Media access error:", err);
        setError("Camera/microphone access is required for video interviews.");
      }
    };

    const handleConnectedCall = (call) => {
      activeCallRef.current = call;
      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        setRemoteConnected(true);
        setStatus("Connected");
      });
      call.on("close", () => {
        setRemoteConnected(false);
        setStatus("The other participant left the call.");
      });
    };

    // The other participant announced their peer ID — WE call THEM
    const handlePeerAvailable = ({ peerId }) => {
      if (!localStreamRef.current || !peerRef.current) return;
      const call = peerRef.current.call(peerId, localStreamRef.current);
      handleConnectedCall(call);
    };

    const handlePeerLeft = () => {
      setRemoteConnected(false);
      setStatus("The other participant left the call.");
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

  const endCall = () => {
    navigate("/interviews");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 pb-4 border-b border-charcoal/10">
        <button onClick={() => navigate("/interviews")} className="text-charcoal/50 hover:text-charcoal">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-display font-bold text-lg">Interview call</h2>
          <p className="text-xs text-charcoal/40">{status}</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-coral bg-coral/10 rounded-lg px-3 py-2 mt-4">{error}</p>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="relative rounded-2xl overflow-hidden bg-charcoal">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 text-xs text-white bg-charcoal/60 rounded-full px-2 py-1">
            You
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-charcoal flex items-center justify-center">
          {remoteConnected ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <p className="text-white/40 text-sm">Waiting for the other participant…</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 py-4">
        <button
          onClick={toggleMic}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition ${
            micOn ? "bg-white text-charcoal" : "bg-coral text-white"
          }`}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button
          onClick={toggleCam}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition ${
            camOn ? "bg-white text-charcoal" : "bg-coral text-white"
          }`}
        >
          {camOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
        <button
          onClick={endCall}
          className="w-11 h-11 rounded-full bg-coral text-white flex items-center justify-center hover:opacity-90 transition"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;