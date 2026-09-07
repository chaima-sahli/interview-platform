import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { ArrowLeft } from "lucide-react";
import { useSocket } from "../hooks/useSocket";

const VideoCall = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const localVideoRef = useRef(null);
  const peerRef = useRef(null);
  const [myPeerId, setMyPeerId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let localStream;

    const setup = async () => {
      try {
        // 1. Ask for camera/mic access and show our own video immediately
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // 2. Create a PeerJS peer — using PeerJS's free public cloud broker,
        // no server config needed on our end for this.
        const peer = new Peer();
        peerRef.current = peer;

        peer.on("open", (id) => {
          setMyPeerId(id);
          // 3. Let the other participant know we're ready to be called,
          // via our own socket signaling from the last step.
          if (socket) {
            socket.emit("joinCallRoom", interviewId);
            socket.emit("peerReady", { interviewId, peerId: id });
          }
        });

        peer.on("error", (err) => {
          console.error("PeerJS error:", err);
          setError("Something went wrong setting up the call connection.");
        });
      } catch (err) {
        console.error("Media access error:", err);
        setError("Camera/microphone access is required for video interviews.");
      }
    };

    if (socket) setup();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      peerRef.current?.destroy();
      socket?.emit("leaveCallRoom", interviewId);
    };
  }, [socket, interviewId]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 pb-4 border-b border-charcoal/10">
        <button onClick={() => navigate("/interviews")} className="text-charcoal/50 hover:text-charcoal">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-display font-bold text-lg">Interview call</h2>
          <p className="text-xs text-charcoal/40">
            {myPeerId ? "Ready — waiting for the other person" : "Setting up your camera…"}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-coral bg-coral/10 rounded-lg px-3 py-2 mt-4">{error}</p>
      )}

      <div className="flex-1 flex items-center justify-center mt-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-md rounded-2xl bg-charcoal aspect-video object-cover"
        />
      </div>
    </div>
  );
};

export default VideoCall;