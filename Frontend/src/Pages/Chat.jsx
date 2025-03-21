import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SendIcon, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Main Chat component
const Chat = () => {
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 Welcome! I'm your AI mentorship assistant, here to provide expert guidance, career advice, and technical support. Ask me anything! 🚀`,
      timestamp: new Date(),
    },
  ]);

  // Function to send message to the API
  const sendMessage = async (messageText) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: messageText }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Sorry, there was an error processing your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Add user message to chat
    const newMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    sendMessage(message);
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Auto-resize textarea as user types
  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  // Format timestamp to readable format
  const formatTime = (date) => {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus on textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-neutral-800">
          AI Chat Assistant
        </h1>
        <Link
          to="/"
          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </header>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="chat-container flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "user" ? (
                // User Message
                <div className="flex flex-col items-end">
                  <div className="inline-block bg-blue-600 text-white rounded-lg p-3 max-w-[85%]">
                    <p>{msg.content}</p>
                  </div>
                  <span className="text-xs text-neutral-500 mr-1 mt-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ) : (
                // AI Message with Markdown rendering
                <div className="flex flex-col">
                  <div className="inline-flex items-start max-w-[85%]">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mr-2">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-3 text-neutral-800">
                      <div className="prose prose-neutral max-w-none">
                        <ReactMarkdown
                          components={{
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={dracula} // Use any theme
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500 ml-10 mt-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col">
              <div className="inline-flex items-start max-w-[85%]">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 mr-2">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="bg-secondary/10 rounded-lg p-4 text-neutral-800">
                  <div className="flex items-center min-w-[60px]">
                    <div className="flex space-x-1">
                      <span className="inline-block w-2 h-2 bg-neutral-500 rounded-full animate-[pulse_1.5s_infinite]"></span>
                      <span className="inline-block w-2 h-2 bg-neutral-500 rounded-full animate-[pulse_1.5s_0.2s_infinite]"></span>
                      <span className="inline-block w-2 h-2 bg-neutral-500 rounded-full animate-[pulse_1.5s_0.4s_infinite]"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="border-t border-neutral-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                className="w-full border border-neutral-300 rounded-lg py-3 px-4 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-gray-300"
                placeholder="Type your message..."
                rows={1}
                disabled={isLoading}
              />

              <button
                type="submit"
                className="absolute right-2 bottom-3  bg-blue-600 text-white rounded-md p-2 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
                disabled={isLoading || !message.trim()}
              >
                <SendIcon className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="flex justify-between items-center mt-1 text-xs text-neutral-500">
            <div></div>
            <div>Press Enter to send, Shift+Enter for new line</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
