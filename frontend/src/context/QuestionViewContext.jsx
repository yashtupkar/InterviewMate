import React, { createContext, useState, useEffect, useContext } from 'react';

const FREE_VIEW_LIMIT = 3;
const STORAGE_KEY = 'viewedQuestions';

const QuestionViewContext = createContext();

export const useQuestionView = () => useContext(QuestionViewContext);

export const QuestionViewProvider = ({ children }) => {
  const [viewedQuestions, setViewedQuestions] = useState([]);

  useEffect(() => {
    try {
      const storedViews = localStorage.getItem(STORAGE_KEY);
      if (storedViews) {
        setViewedQuestions(JSON.parse(storedViews));
      }
    } catch (error) {
      console.error('Failed to parse viewed questions from localStorage', error);
      setViewedQuestions([]);
    }
  }, []);

  const addQuestionView = (questionId) => {
    if (!viewedQuestions.includes(questionId)) {
      const newViews = [...viewedQuestions, questionId];
      setViewedQuestions(newViews);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newViews));
      } catch (error) {
        console.error('Failed to save viewed questions to localStorage', error);
      }
    }
  };

  const canViewQuestion = (questionId) => {
    if (viewedQuestions.includes(questionId)) {
      return true; 
    }
    return viewedQuestions.length < FREE_VIEW_LIMIT;
  };

  const value = {
    viewedQuestions,
    addQuestionView,
    canViewQuestion,
    freeViewsLeft: Math.max(0, FREE_VIEW_LIMIT - viewedQuestions.length),
    freeViewLimit: FREE_VIEW_LIMIT,
  };

  return (
    <QuestionViewContext.Provider value={value}>
      {children}
    </QuestionViewContext.Provider>
  );
};