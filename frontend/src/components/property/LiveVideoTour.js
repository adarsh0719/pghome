import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const LiveVideoTour = ({ propertyId }) => {
  const [socket, setSocket] = useState(null);
  const [joined, setJoined] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef(null);

  const roomId = `property_${propertyId}`;

  // Initialize socket
  useEffect(() => {
    const s = io(process.env.REACT_APP_SOCKET_URL); // backend URL
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('user-joined', async (userId) => {
      console.log('User joined:', userId);
      if (peerRef.current) await createOffer();
    });

    socket.on('offer', async (data) => {
      if (peerRef.current) await handleOffer(data);
    });

    socket.on('answer', async (data) => {
      if (peerRef.current) await handleAnswer(data);
    });

    socket.on('ice-candidate', async (data) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(data.candidate);
        } catch (err) {
          console.error('Error adding ice candidate:', err);
        }
      }
    });

    return () => {
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket]);

  const joinRoom = async () => {
    await startLocalStream(); // first get camera & mic
    socket.emit('join-room', roomId);
    setJoined(true);
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteConnected(true);
      };

      peer.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', { candidate: event.candidate, roomId });
        }
      };

      peerRef.current = peer;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Cannot access camera/microphone. Please check permissions.');
    }
  };

  const createOffer = async () => {
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socket.emit('offer', { offer, roomId });
  };

  const handleOffer = async (data) => {
    if (!peerRef.current) await startLocalStream();

    await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);
    socket.emit('answer', { answer, roomId });
  };

  const handleAnswer = async (data) => {
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
  };

  return (
   <div className="flex flex-col items-center gap-4 px-2 sm:px-4">
  {!joined ? (
    <button
      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 w-full sm:w-auto"
      onClick={joinRoom}
    >
      Join Live Video Tour
    </button>
  ) : (
    <p className="text-gray-500 text-center">Waiting for another participant...</p>
  )}

  <div className="flex flex-col sm:flex-row gap-4 mt-4 items-center">
    <video
      ref={localVideoRef}
      autoPlay
      muted
      className="w-full sm:w-64 rounded-lg border"
    />
    <video
      ref={remoteVideoRef}
      autoPlay
      className="w-full sm:w-64 rounded-lg border"
    />
  </div>

  {remoteConnected && (
    <p className="text-green-600 font-semibold text-center">
      Connected to other user 🎥
    </p>
  )}
</div>
  );
};

export default LiveVideoTour;
