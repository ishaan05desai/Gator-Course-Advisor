import React from "react";
import "./Sidebar.css";
import { Course } from "./CourseCard";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  courses?: Course[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  label: string;
  preview: string;
  messages: Message[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatSessions: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  savedCourses: Course[];
  onRemoveCourse?: (courseCode: string) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  chatSessions,
  activeChatId,
  onNewChat,
  onSelectChat,
  savedCourses,
  onRemoveCourse,
}: SidebarProps) {
  const [isMyClassesOpen, setIsMyClassesOpen] = React.useState(false);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-content">
          <button className="new-chat-button" onClick={onNewChat}>
            <span>+</span> New Chat
          </button>

          <div className="chat-history">
            <div className="chat-history-label">Chat History</div>
            {chatSessions.length === 0 ? (
              <div className="empty-state">No chat history yet</div>
            ) : (
              <div className="chat-list">
                {chatSessions.map((chat) => (
                  <button
                    key={chat.id}
                    className={`chat-item ${
                      activeChatId === chat.id ? "chat-item-active" : ""
                    }`}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <span className="chat-label">{chat.label}</span>
                    <span className="chat-preview">{chat.preview}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="my-classes-section">
            <button
              className="my-classes-button"
              onClick={() => setIsMyClassesOpen(!isMyClassesOpen)}
            >
              <span
                className={`dropdown-arrow ${isMyClassesOpen ? "open" : ""}`}
              >
                ▼
              </span>
              My Classes
            </button>
            {isMyClassesOpen && (
              <div className="my-classes-dropdown">
                {savedCourses.length === 0 ? (
                  <div className="empty-classes">No saved classes yet</div>
                ) : (
                  <div className="saved-courses-list">
                    {savedCourses.map((course) => (
                      <div key={course.code} className="saved-course-item">
                        <div className="saved-course-content">
                          <div className="saved-course-code">{course.code}</div>
                          <div className="saved-course-title">
                            {course.title}
                          </div>
                        </div>
                        {onRemoveCourse && (
                          <button
                            className="saved-course-remove"
                            onClick={() => onRemoveCourse(course.code)}
                            title="Remove from My Classes"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
