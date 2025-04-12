import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Send, ArrowLeft, UserPlus, MessageSquare } from "lucide-react";
import { format } from 'date-fns';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const MentorMessagesExample = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentor');
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the JWT token to get user ID
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const { userId } = JSON.parse(jsonPayload);
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    // Initialize socket connection with better options
    socketRef.current = io('http://localhost:8000', {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    // Socket event handlers
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      // Join the user's personal room
      socketRef.current.emit('join_room', { userId: currentUserId });
      // Re-fetch messages if we have a selected mentor
      if (selectedMentor) {
        fetchMessages(selectedMentor._id);
      }
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect if server disconnects
        socketRef.current.connect();
      }
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Listen for new messages
    socketRef.current.on('new_message', (message) => {
      console.log('New message received:', message);
      
      // Update messages immediately if it's for the current chat
      if (selectedMentor && (message.sender === selectedMentor._id || message.recipient === selectedMentor._id)) {
        setMessages(prev => {
          // Check for duplicate messages using content and timestamp
          const isDuplicate = prev.some(msg => 
            msg.content === message.content && 
            new Date(msg.createdAt).getTime() === new Date(message.createdAt).getTime()
          );
          if (isDuplicate) return prev;
          
          const newMessages = [...prev, message];
          // Sort messages by timestamp
          return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
        scrollToBottom();
      }
      
      // Update chat list to show new message
      fetchChatMentors();
    });

    // Listen for typing events
    socketRef.current.on('typing', ({ senderId, isTyping }) => {
      if (selectedMentor && senderId === selectedMentor._id) {
        setIsTyping(isTyping);
      }
    });

    // Listen for read receipts
    socketRef.current.on('messages_read', ({ senderId }) => {
      if (selectedMentor && senderId === selectedMentor._id) {
        setMessages(prev => prev.map(msg => 
          msg.sender === senderId ? { ...msg, read: true } : msg
        ));
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedMentor, currentUserId]);

  useEffect(() => {
    console.log('Component mounted, mentorId:', mentorId);
    fetchChatMentors();
  }, []);

  useEffect(() => {
    console.log('mentorId changed:', mentorId);
    if (mentorId) {
      const mentor = mentors.find(m => m._id === mentorId);
      console.log('Found mentor:', mentor);
      if (mentor) {
        setSelectedMentor(mentor);
        fetchMessages(mentor._id);
      } else {
        // If mentor is not in the list, fetch their details
        fetchMentorDetails(mentorId);
      }
    }
  }, [mentorId, mentors]);

  const fetchMentorDetails = async (mentorId) => {
    try {
      const token = localStorage.getItem('token');
      const mentorResponse = await axios.get(`http://localhost:8000/api/mentors/${mentorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Fetched mentor details:', mentorResponse.data);
      
      // Add the new mentor to the list
      setMentors(prev => {
        const existingMentor = prev.find(m => m._id === mentorId);
        if (!existingMentor) {
          return [mentorResponse.data, ...prev];
        }
        return prev;
      });
      
      setSelectedMentor(mentorResponse.data);
      fetchMessages(mentorId);
    } catch (error) {
      console.error('Error fetching mentor details:', error);
      if (error.response?.status === 404) {
        navigate('/profile');
      } else {
        toast.error('Failed to load mentor details');
      }
    }
  };

  const fetchChatMentors = async () => {
    try {
      console.log('Fetching chat mentors...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.get('http://localhost:8000/api/messages/chat-mentors', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Chat mentors fetched:', response.data);
      
      // Update mentors list while preserving existing mentors
      setMentors(prev => {
        const newMentors = response.data;
        const existingMentors = prev.filter(m => !newMentors.some(nm => nm._id === m._id));
        return [...newMentors, ...existingMentors];
      });
      
      // If we have a mentorId in the URL but no selected mentor, try to find and select it
      if (mentorId && !selectedMentor) {
        const mentor = response.data.find(m => m._id === mentorId);
        if (mentor) {
          console.log('Selecting mentor from URL:', mentor);
          setSelectedMentor(mentor);
          fetchMessages(mentor._id);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chat mentors:', error);
      toast.error('Failed to load chat list');
      setIsLoading(false);
    }
  };

  // Add a new effect to handle mentor selection from URL
  useEffect(() => {
    if (mentorId && mentors.length > 0 && !selectedMentor) {
      const mentor = mentors.find(m => m._id === mentorId);
      if (mentor) {
        console.log('Selecting mentor from URL:', mentor);
        setSelectedMentor(mentor);
        fetchMessages(mentor._id);
      }
    }
  }, [mentorId, mentors]);

  const fetchMessages = async (mentorId) => {
    try {
      console.log('Fetching messages for mentor:', mentorId);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/messages/${mentorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Messages fetched:', response.data);
      setMessages(response.data);
      scrollToBottom();

      // Mark messages as read
      if (socketRef.current) {
        socketRef.current.emit('mark_read', { senderId: mentorId });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor);
    navigate(`/profile?mentor=${mentor._id}`);
    fetchMessages(mentor._id);
  };

  const handleTyping = () => {
    if (!selectedMentor) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set typing to true and emit event
    setIsTyping(true);
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        recipientId: selectedMentor._id,
        isTyping: true
      });
    }

    // Set timeout to stop typing after 2 seconds
    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (socketRef.current) {
        socketRef.current.emit('typing', {
          recipientId: selectedMentor._id,
          isTyping: false
        });
      }
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMentor) return;

    try {
      const token = localStorage.getItem('token');
      const messageToSend = {
        content: newMessage,
        sender: currentUserId,
        recipient: selectedMentor._id,
        createdAt: new Date().toISOString()
      };

      // Clear the input field immediately
      setNewMessage('');
      scrollToBottom();

      // Emit socket event for the new message
      if (socketRef.current) {
        socketRef.current.emit('new_message', messageToSend);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleVideoCall = () => {
    toast.error('Video call feature coming soon!');
  };

  const handleBack = () => {
    setSelectedMentor(null);
    navigate('/profile');
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-gray-50 mx-10 my-10 rounded-lg shadow-lg overflow-hidden">
      {mentors.length === 0 && !mentorId ? (
        // No Chats UI
        <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
          <div className="text-center max-w-md">
            <div className="mb-6 p-4 rounded-full bg-blue-50 inline-block">
              <MessageSquare className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">No Active Chats</h2>
            <p className="text-gray-600 mb-6">
              You haven't started any conversations with mentors yet. Click the button below to find and connect with mentors.
            </p>
            <Button asChild size="lg">
              <Link to="/mentors" className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Find Mentors
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Mentors List */}
          <div className={`w-1/3 border-r bg-white ${selectedMentor ? 'hidden md:block' : 'block'}`}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Chats</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/mentors">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Mentors
                </Link>
              </Button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-73px)]">
              {mentors.length > 0 ? (
                mentors.map((mentor) => (
                  <div
                    key={mentor._id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedMentor?._id === mentor._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelectMentor(mentor)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{mentor.name}</h3>
                        <p className="text-sm text-gray-500">{mentor.field}</p>
                        {mentor.lastMessage && (
                          <p className="text-xs text-gray-400 truncate">
                            {mentor.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center p-4">
                  <div className="mb-4 p-4 rounded-full bg-blue-50">
                    <MessageSquare className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Active Chats</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't started any conversations with mentors yet. Click the button below to find and connect with mentors.
                  </p>
                  <Button asChild size="lg">
                    <Link to="/mentors" className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Find Mentors
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          {selectedMentor ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={handleBack} className="md:hidden">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{selectedMentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedMentor.name}</h3>
                    <p className="text-sm text-gray-500">{selectedMentor.field}</p>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleVideoCall}>
                  <Video className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#e5ddd5] bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')]">
                {messages.map((message) => (
                  <div
                    key={`${message._id}-${message.createdAt}`}
                    className={`flex ${
                      message.sender === currentUserId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-[65%] p-2 ${
                        message.sender === currentUserId
                          ? "bg-[#d9fdd3] text-black rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-xl"
                          : "bg-white text-black rounded-tl-xl rounded-tr-xl rounded-bl-none rounded-br-xl shadow-sm"
                      }`}
                    >
                      <p className="break-words text-sm">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[10px] ${message.sender === currentUserId ? "text-[#667781]" : "text-[#667781]"}`}>
                          {format(new Date(message.createdAt), "h:mm a")}
                        </span>
                        {message.sender === currentUserId && (
                          <span className="text-[10px] text-[#667781]">
                            {message.read ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-black rounded-tl-xl rounded-tr-xl rounded-bl-none rounded-br-xl shadow-sm px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t bg-[#f0f2f5]">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    className="flex-1 bg-white border-none rounded-full px-4 py-2 focus:ring-0"
                  />
                  <Button type="submit" size="icon" className="bg-[#00a884] hover:bg-[#008069] rounded-full">
                    <Send className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="mb-4 p-4 rounded-full bg-gray-100 inline-block">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a Conversation</h3>
                <p className="text-gray-500">Choose a mentor from the list to view your chat</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MentorMessagesExample;
