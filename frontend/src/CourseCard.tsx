import React from "react";
import "./CourseCard.css";

export interface Course {
  code: string;
  title: string;
  description: string;
}

interface CourseCardProps {
  course: Course;
  onAddToClasses?: (course: Course) => void;
  isSaved?: boolean;
}

export function CourseCard({
  course,
  onAddToClasses,
  isSaved = false,
}: CourseCardProps) {
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAdd = () => {
    if (onAddToClasses && !isSaved) {
      setIsAdding(true);
      onAddToClasses(course);
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  return (
    <div className={`course-card ${isAdding ? "course-card-adding" : ""}`}>
      {onAddToClasses && !isSaved && (
        <button className="course-add-button" onClick={handleAdd}>
          +
        </button>
      )}
      {isSaved && <div className="course-saved-indicator">✓</div>}
      <div className="course-code">{course.code}</div>
      <div className="course-title">{course.title}</div>
      <div className="course-description">{course.description}</div>
    </div>
  );
}
