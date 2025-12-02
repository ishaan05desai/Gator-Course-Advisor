import { useState, useRef, useEffect } from "react";
import "./App.css";
import { CourseCard, Course } from "./CourseCard";
import { Sidebar } from "./Sidebar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  courses?: Course[];
  timestamp: string;
}

interface ChatSession {
  id: string;
  label: string;
  preview: string;
  messages: Message[];
}

// Note: Course data is now fetched from the API, so the mock database is no longer needed

// API endpoint - uses Vite proxy in development, or can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? "" : "http://localhost:5000");

// Fetch course recommendations from the semantic search API
const fetchCourseRecommendations = async (
  userInput: string,
  topK: number = 3
): Promise<{ content: string; courses: Course[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: userInput,
        top_k: topK,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convert API response to Course format
    const courses: Course[] = data.courses.map((course: any) => ({
      code: course.code,
      title: course.title,
      description: course.description,
    }));

    const interests =
      userInput.length > 50 ? userInput.substring(0, 50) + "..." : userInput;
    
    return {
      content: `Based on your interests in "${interests}", here are the top ${courses.length} matching courses:`,
      courses,
    };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return {
      content: `Sorry, I encountered an error while searching for courses. Please make sure the API server is running on ${API_BASE_URL}. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      courses: [],
    };
  }
};

function App() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatCounterRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load active chat messages when activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      const activeChat = chatSessions.find((chat) => chat.id === activeChatId);
      if (activeChat) {
        setMessages(activeChat.messages);
      }
    } else {
      setMessages([]);
    }
  }, [activeChatId, chatSessions]);

  // Update chat session when messages change
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId ? { ...chat, messages } : chat
        )
      );
    }
  }, [messages, activeChatId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isThinking) return;

    // Create new chat if no active chat
    let currentChatId = activeChatId;
    if (!currentChatId) {
      chatCounterRef.current += 1;
      currentChatId = `chat-${Date.now()}`;
      const newChat: ChatSession = {
        id: currentChatId,
        label: `Chat ${chatCounterRef.current}`,
        preview:
          trimmedInput.length > 50
            ? trimmedInput.substring(0, 50) + "..."
            : trimmedInput,
        messages: [],
      };
      setChatSessions((prev) => [newChat, ...prev]);
      setActiveChatId(currentChatId);
    } else {
      // Update preview if this is the first message
      const currentChat = chatSessions.find(
        (chat) => chat.id === currentChatId
      );
      if (currentChat && currentChat.messages.length === 0) {
        setChatSessions((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  preview:
                    trimmedInput.length > 50
                      ? trimmedInput.substring(0, 50) + "..."
                      : trimmedInput,
                }
              : chat
          )
        );
      }
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsThinking(true);

    // Add thinking message
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Thinking...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, thinkingMessage]);

    // Fetch recommendations from API
    fetchCourseRecommendations(trimmedInput, 3)
      .then(({ content, courses }) => {
        const response: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content,
          courses,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) =>
          prev.map((msg) => (msg.id === thinkingMessage.id ? response : msg))
        );
        setIsThinking(false);
      })
      .catch((error) => {
        console.error("Error in fetchCourseRecommendations:", error);
        const errorResponse: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message}. Please make sure the API server is running.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) =>
          prev.map((msg) => (msg.id === thinkingMessage.id ? errorResponse : msg))
        );
        setIsThinking(false);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    chatCounterRef.current += 1;
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      label: `Chat ${chatCounterRef.current}`,
      preview: "",
      messages: [],
    };
    setChatSessions((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setMessages([]);
    setInputValue("");
    setIsSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setIsSidebarOpen(false);
  };

  const handleAddToClasses = (course: Course) => {
    setSavedCourses((prev) => {
      // Prevent duplicates
      if (prev.some((c) => c.code === course.code)) {
        return prev;
      }
      return [...prev, course];
    });
  };

  const handleRemoveCourse = (courseCode: string) => {
    setSavedCourses((prev) => prev.filter((c) => c.code !== courseCode));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        savedCourses={savedCourses}
        onRemoveCourse={handleRemoveCourse}
      />
      <div className={`chat-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="app-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className="app-title">Gator Course Advisor</h1>
        </div>

        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>
                Welcome to Gator Course Advisor! Share your interests and I'll
                suggest relevant courses.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.role === "user" ? "message-user" : "message-assistant"
              }`}
            >
              <div className="message-bubble">
                <div className="message-content">
                  {message.content.split("\n").map((line, idx) => (
                    <span key={idx}>
                      {line}
                      {idx < message.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                  {message.courses && message.courses.length > 0 && (
                    <div className="courses-container">
                      {message.courses.map((course, idx) => (
                        <CourseCard
                          key={idx}
                          course={course}
                          onAddToClasses={handleAddToClasses}
                          isSaved={savedCourses.some(
                            (c) => c.code === course.code
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="message-timestamp">{message.timestamp}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your interests here..."
              rows={1}
              disabled={isThinking}
              className="message-input"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isThinking}
              className="send-button"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
