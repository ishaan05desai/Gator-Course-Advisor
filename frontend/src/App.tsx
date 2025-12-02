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

// Mock course database with descriptions
const courseDatabase: Record<string, Course> = {
  "CAP 4630": {
    code: "CAP 4630",
    title: "Artificial Intelligence",
    description:
      "Covers fundamental AI concepts including search algorithms, knowledge representation, reasoning, machine learning basics, and applications of intelligent systems.",
  },
  "EEL 3872": {
    code: "EEL 3872",
    title: "AI Foundations",
    description:
      "Introduction to artificial intelligence principles, algorithms, and techniques. Explores problem-solving methods, heuristic search, and basic machine learning approaches.",
  },
  "STA 4241": {
    code: "STA 4241",
    title: "Machine Learning for Data Science",
    description:
      "Statistical learning methods for data analysis including regression, classification, clustering, and model evaluation techniques applied to real-world datasets.",
  },
  "COP 4813": {
    code: "COP 4813",
    title: "Web Application Programming",
    description:
      "Development of dynamic web applications using modern frameworks, client-server architecture, RESTful APIs, and database integration for full-stack solutions.",
  },
  "CEN 4010": {
    code: "CEN 4010",
    title: "Software Engineering",
    description:
      "Software development lifecycle, requirements analysis, design patterns, testing strategies, version control, and collaborative development practices in team environments.",
  },
  "COP 3530": {
    code: "COP 3530",
    title: "Data Structures",
    description:
      "Covers fundamental data structures including lists, stacks, queues, trees, graphs, and algorithmic efficiency analysis.",
  },
  "COP 4710": {
    code: "COP 4710",
    title: "Database Systems",
    description:
      "Database design, SQL querying, normalization, transaction management, indexing, and implementation of relational database management systems.",
  },
  "CAP 4770": {
    code: "CAP 4770",
    title: "Data Mining",
    description:
      "Techniques for discovering patterns in large datasets including association rules, classification, clustering, and evaluation of mining algorithms.",
  },
  "CIS 4361": {
    code: "CIS 4361",
    title: "Computer Security",
    description:
      "Principles of information security, threat analysis, access control, cryptography basics, network security, and secure software development practices.",
  },
  "CNT 4403": {
    code: "CNT 4403",
    title: "Network Security",
    description:
      "Security protocols, firewalls, intrusion detection systems, VPN technologies, and defense mechanisms for protecting network infrastructure.",
  },
  "CIS 4362": {
    code: "CIS 4362",
    title: "Applied Cryptography",
    description:
      "Cryptographic algorithms, symmetric and asymmetric encryption, digital signatures, hash functions, and their practical applications in secure systems.",
  },
  "CAP 4720": {
    code: "CAP 4720",
    title: "Computer Graphics",
    description:
      "Rendering techniques, 3D transformations, lighting models, texture mapping, and graphics programming using modern graphics APIs and shaders.",
  },
  "CAP 4053": {
    code: "CAP 4053",
    title: "Game Development",
    description:
      "Game design principles, game engines, physics simulation, collision detection, game AI, and development of interactive entertainment applications.",
  },
};

// Mock course recommendations based on user interests
const generateMockRecommendations = (
  userInput: string
): { content: string; courses: Course[] } => {
  const lowerInput = userInput.toLowerCase();

  // Extract keywords and generate relevant courses
  let courseCodes: string[] = [];

  if (
    lowerInput.includes("ai") ||
    lowerInput.includes("artificial intelligence") ||
    lowerInput.includes("machine learning")
  ) {
    courseCodes.push("CAP 4630");
    courseCodes.push("EEL 3872");
    courseCodes.push("STA 4241");
  }

  if (
    lowerInput.includes("web") ||
    lowerInput.includes("frontend") ||
    lowerInput.includes("react")
  ) {
    courseCodes.push("COP 4813");
    courseCodes.push("CEN 4010");
    courseCodes.push("COP 3530");
  }

  if (
    lowerInput.includes("database") ||
    lowerInput.includes("sql") ||
    lowerInput.includes("data")
  ) {
    courseCodes.push("COP 4710");
    courseCodes.push("STA 4241");
    courseCodes.push("CAP 4770");
  }

  if (
    lowerInput.includes("cyber") ||
    lowerInput.includes("security") ||
    lowerInput.includes("hack")
  ) {
    courseCodes.push("CIS 4361");
    courseCodes.push("CNT 4403");
    courseCodes.push("CIS 4362");
  }

  if (
    lowerInput.includes("game") ||
    lowerInput.includes("gaming") ||
    lowerInput.includes("graphics")
  ) {
    courseCodes.push("CAP 4720");
    courseCodes.push("CAP 4053");
    courseCodes.push("CEN 4010");
  }

  // Default recommendations if no specific match
  if (courseCodes.length === 0) {
    courseCodes = ["COP 3530", "CEN 4010", "CAP 4630"];
  }

  // Get unique courses and convert to Course objects
  const uniqueCodes = Array.from(new Set(courseCodes));
  const courses: Course[] = uniqueCodes
    .map((code) => courseDatabase[code])
    .filter((course): course is Course => course !== undefined);

  const interests =
    userInput.length > 50 ? userInput.substring(0, 50) + "..." : userInput;
  return {
    content: `Based on your interests in ${interests}:`,
    courses,
  };
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

    // Simulate API delay and replace with response
    setTimeout(() => {
      const { content, courses } = generateMockRecommendations(trimmedInput);
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
    }, 1200);
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
