import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from "@/components/ui/input";
import { io } from 'socket.io-client';

const VideoCall = () => {
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState(null);
  const [callId, setCallId] = useState('');
  const [isPreview, setIsPreview] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [userName, setUserName] = useState('');
  const [remoteName, setRemoteName] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);
  const socket = useRef(null);

  // Queue for pending remote streams
  const pendingRemoteStreams = useRef([]);

  // Debug video elements
  useEffect(() => {
    const debugVideo = (videoRef, streamType) => {
      if (videoRef.current) {
        console.log(`${streamType} video element properties:`, {
          readyState: videoRef.current.readyState,
          videoWidth: videoRef.current.videoWidth,
          videoHeight: videoRef.current.videoHeight,
          paused: videoRef.current.paused,
          currentSrc: videoRef.current.currentSrc,
          srcObject: videoRef.current.srcObject ? 'Set' : 'Not set'
        });

        videoRef.current.onloadedmetadata = () => {
          console.log(`${streamType} video metadata loaded`);
          videoRef.current.play()
            .then(() => console.log(`${streamType} video playback started`))
            .catch(err => console.error(`${streamType} video playback failed:`, err));
        };

        videoRef.current.onplay = () => {
          console.log(`${streamType} video started playing`);
        };

        videoRef.current.onpause = () => {
          console.log(`${streamType} video paused`);
        };

        videoRef.current.onerror = (e) => {
          console.error(`${streamType} video element error:`, e);
        };
      }
    };

    debugVideo(localVideoRef, 'Local');
    debugVideo(remoteVideoRef, 'Remote');
  }, [localVideoRef.current, remoteVideoRef.current, localStream, remoteStream]);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log('Setting local stream to video element');
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play()
        .then(() => console.log('Local video playback started'))
        .catch(err => console.error('Local video playback failed:', err));
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log('Setting remote stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;
      remoteStream.getTracks().forEach(track => {
        track.onended = () => {
          console.log(`Remote ${track.kind} track ended`);
          if (track.kind === 'video') {
            setIsVideoOff(true);
          } else if (track.kind === 'audio') {
            setIsMuted(true);
          }
        };
        
        track.onmute = () => {
          console.log(`Remote ${track.kind} track muted`);
          if (track.kind === 'video') {
            setIsVideoOff(true);
          } else if (track.kind === 'audio') {
            setIsMuted(true);
          }
        };
        
        track.onunmute = () => {
          console.log(`Remote ${track.kind} track unmuted`);
          if (track.kind === 'video') {
            setIsVideoOff(false);
          } else if (track.kind === 'audio') {
            setIsMuted(false);
          }
        };
      });
    }
  }, [remoteStream]);

  // Handle remote video element ready
  useEffect(() => {
    if (remoteVideoRef.current && pendingRemoteStreams.current.length > 0) {
      console.log('Remote video element ready, processing pending streams');
      pendingRemoteStreams.current.forEach(stream => {
        handleRemoteStream(stream);
      });
      pendingRemoteStreams.current = [];
    }
  }, [remoteVideoRef.current]);

  const handleRemoteStream = (stream) => {
    console.log('Handling remote stream:', {
      id: stream.id,
      active: stream.active,
      tracks: stream.getTracks().map(t => ({
        kind: t.kind,
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState
      }))
    });

    setRemoteStream(stream);
    
    if (remoteVideoRef.current) {
      console.log('Setting remote stream to video element');
      remoteVideoRef.current.srcObject = stream;
      
      const playVideo = async () => {
        try {
          await remoteVideoRef.current.play();
          console.log('Remote video playback started successfully');
        } catch (err) {
          console.warn('Failed to play remote video:', err);
          if (remoteVideoRef.current) {
            // Retry play with user interaction
            const playPromise = remoteVideoRef.current.play();
            if (playPromise) {
              playPromise.catch(() => {
                console.log('Waiting for user interaction to play video');
              });
            }
          }
        }
      };

      playVideo();

      // Monitor remote track states
      stream.getTracks().forEach(track => {
        track.onended = () => {
          console.log(`Remote ${track.kind} track ended`);
          if (track.kind === 'video') {
            setIsVideoOff(true);
          } else if (track.kind === 'audio') {
            setIsMuted(true);
          }
        };
        
        track.onmute = () => {
          console.log(`Remote ${track.kind} track muted`);
          if (track.kind === 'video') {
            setIsVideoOff(true);
          } else if (track.kind === 'audio') {
            setIsMuted(true);
          }
        };
        
        track.onunmute = () => {
          console.log(`Remote ${track.kind} track unmuted`);
          if (track.kind === 'video') {
            setIsVideoOff(false);
          } else if (track.kind === 'audio') {
            setIsMuted(false);
          }
        };
      });
    } else {
      console.log('Remote video ref not ready, queueing stream');
      pendingRemoteStreams.current.push(stream);
    }
  };

  const handleTrack = (event) => {
    console.log('Track received:', {
      kind: event.track.kind,
      id: event.track.id,
      label: event.track.label,
      readyState: event.track.readyState
    });

    const [remoteStream] = event.streams;
    if (!remoteStream) {
      console.error('No remote stream in track event');
      return;
    }

    handleRemoteStream(remoteStream);
  };

  // Initialize WebRTC
  const initializePeerConnection = () => {
    console.log('Initializing peer connection...');
    const configuration = {
      iceServers: [
        { 
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302'
          ]
        }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };

    try {
      const pc = new RTCPeerConnection(configuration);
      console.log('RTCPeerConnection created');

      // Add local stream tracks to peer connection
      if (localStream) {
        console.log('Adding local tracks to peer connection');
        localStream.getTracks().forEach(track => {
          console.log('Adding track to peer connection:', {
            kind: track.kind,
            id: track.id,
            enabled: track.enabled,
            readyState: track.readyState
          });
          const sender = pc.addTrack(track, localStream);
          console.log('Track added with sender:', sender.track.id);
        });
      } else {
        console.warn('No local stream available when initializing peer connection');
      }

      // Handle remote stream
      pc.ontrack = handleTrack;

      // Handle negotiation needed
      pc.onnegotiationneeded = async () => {
        console.log('Negotiation needed');
        try {
          if (pc.signalingState !== "stable") {
            console.log('Skipping negotiation - not stable');
            return;
          }

          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
            voiceActivityDetection: true
          });

          await pc.setLocalDescription(offer);
          
          if (pc.remoteUserId) {
            socket.current?.emit('offer', {
              roomId: callId,
              offer,
              senderId: socket.current.id,
              targetId: pc.remoteUserId
            });
          }
        } catch (err) {
          console.error('Error during negotiation:', err);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Generated ICE candidate:', {
            type: event.candidate.candidate.split(' ')[7],
            protocol: event.candidate.protocol,
            address: event.candidate.address,
            port: event.candidate.port,
            candidateType: event.candidate.type,
            priority: event.candidate.priority
          });
          
          if (pc.remoteUserId) {
            console.log('Sending ICE candidate to:', pc.remoteUserId);
            socket.current?.emit('ice-candidate', {
              roomId: callId,
              candidate: event.candidate,
              senderId: socket.current.id,
              targetId: pc.remoteUserId
            });
          } else {
            console.warn('No remote user ID available for ICE candidate');
          }
        } else {
          console.log('Finished generating ICE candidates');
        }
      };

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log('ICE connection state changed:', state);
        console.log('Connection info:', {
          iceConnectionState: state,
          iceGatheringState: pc.iceGatheringState,
          signalingState: pc.signalingState,
          connectionState: pc.connectionState
        });

        switch (state) {
          case 'checking':
            console.log('Checking ICE connection...');
            break;
          case 'connected':
            console.log('ICE connection established!');
            setIsConnected(true);
            // Verify tracks are flowing
            const senders = pc.getSenders();
            const receivers = pc.getReceivers();
            console.log('Active senders:', senders.map(s => ({
              kind: s.track?.kind,
              enabled: s.track?.enabled,
              readyState: s.track?.readyState
            })));
            console.log('Active receivers:', receivers.map(r => ({
              kind: r.track?.kind,
              enabled: r.track?.enabled,
              readyState: r.track?.readyState
            })));
            break;
          case 'failed':
            console.error('ICE connection failed - restarting');
            pc.restartIce();
            break;
          case 'disconnected':
            console.log('ICE connection disconnected - attempting recovery');
            setIsConnected(false);
            setTimeout(() => {
              if (pc.iceConnectionState === 'disconnected') {
                pc.restartIce();
              }
            }, 1000);
            break;
        }
      };

      peerConnection.current = pc;
    } catch (err) {
      console.error('Error creating peer connection:', err);
      setError('Failed to create peer connection');
    }
  };

  // Initialize Socket.IO connection
  const initializeSocketConnection = () => {
    console.log('Initializing socket connection...');
    try {
      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log('Connecting to socket URL:', socketUrl);

      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        navigate('/login');
        return;
      }

      socket.current = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
        auth: {
          token: token
        },
        withCredentials: true,
        forceNew: true,
        timeout: 10000
      });

      // Debug connection process
      socket.current.on('connect_error', (error) => {
        console.error('Socket connection error details:', {
          message: error.message,
          description: error.description,
          type: error.type,
          context: error.context
        });
        setSocketStatus('error');
        
        if (error.message === 'Authentication error') {
          localStorage.removeItem('token');
          setError('Authentication failed. Please login again.');
          navigate('/login');
        } else {
          setError(`Failed to connect to server: ${error.message}`);
        }
      });

      socket.current.on('connect', () => {
        console.log('Socket connected successfully with ID:', socket.current.id);
        setSocketStatus('connected');
      });

      socket.current.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
        setSocketStatus('disconnected');
      });

      socket.current.on('room-joined', async ({ isCreator, participants }) => {
        console.log('Room joined:', { isCreator, participants });
        
        if (!isCreator && participants.length > 1) {
          try {
            console.log('Creating offer as joining participant');
            const pc = peerConnection.current;
            if (!pc) {
              console.error('No peer connection available');
              return;
            }
            
            const remoteUserId = participants.find(id => id !== socket.current.id);
            if (!remoteUserId) {
              console.error('No remote user found in participants');
              return;
            }
            pc.remoteUserId = remoteUserId;

            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
              iceRestart: true
            });
            
            console.log('Setting local description (offer)');
            await pc.setLocalDescription(offer);
            
            socket.current.emit('offer', { 
              roomId: callId,
              offer,
              senderId: socket.current.id,
              targetId: remoteUserId
            });
            console.log('Offer sent to:', remoteUserId);
          } catch (err) {
            console.error('Error creating offer:', err);
            setError('Failed to create connection offer');
          }
        }
      });

      socket.current.on('user-joined', ({ userId, name }) => {
        console.log('User joined:', userId, name);
        if (peerConnection.current) {
          peerConnection.current.remoteUserId = userId;
        }
        setRemoteName(name);
      });

      socket.current.on('offer', async ({ offer, userId }) => {
        console.log('Received offer from:', userId);
        try {
          const pc = peerConnection.current;
          if (!pc) {
            console.error('No peer connection available');
            return;
          }
          
          pc.remoteUserId = userId;
          
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          console.log('Remote description set');
          
          const answer = await pc.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          console.log('Created answer');
          
          await pc.setLocalDescription(answer);
          console.log('Local description set');
          
          socket.current.emit('answer', { 
            roomId: callId,
            answer,
            senderId: socket.current.id,
            targetId: userId
          });
          console.log('Answer sent');
        } catch (err) {
          console.error('Error handling offer:', err);
          setError('Failed to handle connection offer');
        }
      });

      socket.current.on('answer', async ({ answer, senderId }) => {
        console.log('Received answer from:', senderId);
        try {
          const pc = peerConnection.current;
          if (!pc) {
            console.error('No peer connection available');
            return;
          }

          if (pc.signalingState === "stable") {
            console.log('Skipping answer - connection already stable');
            return;
          }
          
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('Remote description set from answer');
        } catch (err) {
          console.error('Error handling answer:', err);
          setError('Failed to handle connection answer');
        }
      });

      socket.current.on('ice-candidate', async ({ candidate, senderId }) => {
        console.log('Received ICE candidate from:', senderId, candidate);
        try {
          const pc = peerConnection.current;
          if (!pc) {
            console.error('No peer connection available');
            return;
          }
          
          if (!pc.remoteUserId) {
            pc.remoteUserId = senderId;
          }

          if (!pc.remoteDescription) {
            console.log('Queueing ICE candidate - remote description not set');
            if (!pc.queuedCandidates) {
              pc.queuedCandidates = [];
            }
            pc.queuedCandidates.push(candidate);
            return;
          }

          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Added ICE candidate successfully');
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      });

      socket.current.on('user-left', ({ userId }) => {
        console.log('User left:', userId);
        setRemoteStream(null);
        setIsConnected(false);
      });
    } catch (err) {
      console.error('Error initializing socket:', err);
      setError('Failed to initialize socket connection');
    }
  };

  // Initialize local video stream
  const initializeLocalStream = async () => {
    setIsLoading(true);
    console.log('Initializing local stream...');
    try {
      console.log('Requesting media permissions...');
      const constraints = {
        video: {
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 },
          facingMode: 'user',
          frameRate: { min: 20, ideal: 30 },
          aspectRatio: { ideal: 1.7777777778 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      console.log('Media constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Verify stream is active and has tracks
      if (!stream.active || stream.getVideoTracks().length === 0) {
        throw new Error('Stream is not active or has no video tracks');
      }

      const videoTrack = stream.getVideoTracks()[0];
      console.log('Video track obtained:', {
        id: videoTrack.id,
        label: videoTrack.label,
        enabled: videoTrack.enabled,
        muted: videoTrack.muted,
        readyState: videoTrack.readyState,
        settings: videoTrack.getSettings()
      });

      // Wait for the track to be really ready
      await new Promise((resolve) => {
        if (videoTrack.readyState === 'live') {
          resolve();
        } else {
          videoTrack.onended = resolve;
        }
      });

      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      let errorMessage = 'Failed to access camera: ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera access denied. Please grant camera permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found. Please check your camera connection.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is in use by another application.';
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize local video on component mount
  useEffect(() => {
    if (isPreview) {
      initializeLocalStream().then(stream => {
        if (stream && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play()
            .then(() => console.log('Preview video started'))
            .catch(err => console.error('Preview video failed:', err));
        }
      });
    }
  }, [isPreview]);

  // Add useEffect to get user name from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.name) {
      setUserName(user.name);
    }
  }, []);

  const startNewCall = async () => {
    try {
      if (!localStream) {
        console.error('No local stream available');
        return;
      }

      // Generate a new call ID
      const newCallId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setCallId(newCallId);
      
      // Initialize WebRTC with the existing stream
      initializePeerConnection();
      
      // Initialize socket connection
      initializeSocketConnection();
      
      // Ensure local video continues displaying
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        try {
          await localVideoRef.current.play();
          console.log('Local video continued playing after starting call');
        } catch (err) {
          console.error('Error playing local video after starting call:', err);
        }
      }
      
      // Join the room
      setTimeout(() => {
        if (socket.current?.connected) {
          console.log('Joining room:', newCallId);
          socket.current.emit('join-room', { roomId: newCallId });
          setIsPreview(false);
          toast.success('Call ID copied to clipboard!');
          navigator.clipboard.writeText(newCallId);
        } else {
          console.error('Socket not connected when trying to join room');
          setError('Failed to connect to server. Please try again.');
        }
      }, 1000);
    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start video call. Please check your camera and microphone permissions.');
    }
  };

  const joinExistingCall = async () => {
    if (!callId) {
      toast.error('Please enter a call ID');
      return;
    }
    if (!localStream) {
      console.error('No local stream available');
      return;
    }
    try {
      // Initialize WebRTC with the existing stream
      initializePeerConnection();
      
      // Initialize socket connection
      initializeSocketConnection();
      
      // Ensure local video continues displaying
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        try {
          await localVideoRef.current.play();
          console.log('Local video continued playing after joining call');
        } catch (err) {
          console.error('Error playing local video after joining call:', err);
        }
      }
      
      // Join the room
      setTimeout(() => {
        if (socket.current?.connected) {
          console.log('Joining room:', callId);
          socket.current.emit('join-room', { roomId: callId });
          setIsPreview(false);
        } else {
          console.error('Socket not connected when trying to join room');
          setError('Failed to connect to server. Please try again.');
        }
      }, 1000);
    } catch (err) {
      console.error('Error joining call:', err);
      setError('Failed to join video call. Please check the call ID and try again.');
    }
  };

  // Add an effect to handle video element changes
  useEffect(() => {
    const handleVideoRefChange = () => {
      if (localVideoRef.current && localStream) {
        console.log('Updating local video element with stream');
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play()
          .then(() => console.log('Local video playback started/resumed'))
          .catch(err => console.error('Local video playback failed:', err));
      }
    };

    // Call immediately
    handleVideoRefChange();

    // Set up a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(handleVideoRefChange);
    if (localVideoRef.current) {
      observer.observe(localVideoRef.current.parentElement, { 
        childList: true,
        subtree: true 
      });
    }

    return () => observer.disconnect();
  }, [localVideoRef.current, localStream, isPreview]);

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (socket.current) {
      socket.current.emit('leave-room', { roomId: callId });
      socket.current.disconnect();
    }
    navigate('/mentor-messages');
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const copyCallId = () => {
    navigator.clipboard.writeText(callId);
    toast.success('Call ID copied to clipboard!');
  };

  // Add screen sharing function
  const toggleScreenSharing = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always"
          },
          audio: false
        });

        // Replace video track in peer connection
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }

        // Update local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setScreenStream(screenStream);
        setIsScreenSharing(true);

        // Handle screen sharing stop
        videoTrack.onended = () => {
          stopScreenSharing();
        };
      } else {
        stopScreenSharing();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast.error('Failed to share screen');
    }
  };

  // Add function to stop screen sharing
  const stopScreenSharing = async () => {
    try {
      if (screenStream) {
        // Stop all tracks in the screen stream
        screenStream.getTracks().forEach(track => track.stop());
        
        // Get the original video stream
        const originalStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        // Replace video track in peer connection
        const videoTrack = originalStream.getVideoTracks()[0];
        const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }

        // Update local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = originalStream;
        }

        setScreenStream(null);
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error stopping screen share:', error);
      toast.error('Failed to stop screen sharing');
    }
  };

  // Add cleanup for screen sharing
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/mentor-messages')}>
            Return to Messages
          </Button>
        </div>
      </div>
    );
  }

  if (isPreview) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Video Call
          </h2>
          
          {/* Preview Video */}
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-6">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Loading camera...
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Enter call ID to join an existing call:
              </p>
              <div className="flex gap-2">
                <Input
                  value={callId}
                  onChange={(e) => setCallId(e.target.value)}
                  placeholder="Enter call ID"
                  className="flex-1"
                />
                <Button 
                  onClick={joinExistingCall}
                  disabled={isLoading || !localStream}
                >
                  Join Call
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Start a new call:
              </p>
              <Button 
                onClick={startNewCall}
                className="w-full"
                disabled={isLoading || !localStream}
              >
                Start New Call
              </Button>
            </div>

            {/* Video Controls */}
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                variant={isMuted ? "destructive" : "default"}
                size="icon"
                onClick={toggleMute}
                disabled={!localStream}
                className="h-10 w-10 rounded-full"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "default"}
                size="icon"
                onClick={toggleVideo}
                disabled={!localStream}
                className="h-10 w-10 rounded-full"
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-transparent">
      {/* Socket Status Indicator */}
      <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm ${
        socketStatus === 'connected' ? 'bg-green-500 text-white' : 
        socketStatus === 'error' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
      }`}>
        {socketStatus === 'connected' ? 'Connected' : 
         socketStatus === 'error' ? 'Connection Error' : 'Connecting...'}
      </div>

      {/* Main Content Area with Padding Bottom for Controls */}
      <div className="flex-1 flex items-center justify-center p-4 pb-28">
        <div className="max-w-6xl w-full mx-auto">
          <div className="grid grid-cols-2 gap-8 aspect-video max-h-[70vh]">
            {/* Local Video - Left Side */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-800">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover bg-black mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-4 px-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-white font-medium text-lg">
                    {userName || 'You'} {isVideoOff ? '(Video Off)' : ''}
                  </span>
                </div>
              </div>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="text-white text-lg">Loading camera...</div>
                </div>
              )}
            </div>

            {/* Remote Video - Right Side */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-800">
              {remoteStream ? (
                <>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover bg-black"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-white font-medium text-lg">
                        {remoteName || 'Remote User'} {!isConnected ? '(Connecting...)' : ''}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-xl font-medium mb-2">Waiting for participant...</div>
                    <div className="text-sm text-gray-400">Share the call ID to invite someone</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Header for Call ID */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-6 py-3 rounded-full flex items-center gap-3 z-10">
        <span className="text-sm font-medium">Call ID: {callId}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyCallId}
          className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {/* Fixed Footer for Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-black/50 backdrop-blur-sm px-8 py-4 rounded-full z-10">
        <Button
          variant={isMuted ? "destructive" : "default"}
          size="icon"
          onClick={toggleMute}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Button
          variant={isVideoOff ? "destructive" : "default"}
          size="icon"
          onClick={toggleVideo}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </Button>
        <Button
          variant={isScreenSharing ? "destructive" : "default"}
          size="icon"
          onClick={toggleScreenSharing}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          {isScreenSharing ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          )}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={endCall}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Phone className="h-6 w-6 transform rotate-135" />
        </Button>
      </div>
    </div>
  );
};

export default VideoCall; 