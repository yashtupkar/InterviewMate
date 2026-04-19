import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import CodingSpace from "../../components/CodingSpace";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const capitalize = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1);

const buildTaskFromQuestion = (data, fallbackId) => {
  const starterCode = data?.starterCode || {};
  const starterLangs = Object.keys(starterCode);
  const defaultLanguage = starterLangs[0] || "javascript";

  return {
    id: data?._id || data?.id || fallbackId,
    title: data?.title || "Coding challenge",
    difficulty: capitalize(data?.difficulty || "easy"),
    language: defaultLanguage,
    timeLimit: 1800,
    tags: data?.skills || [],
    question: data?.description || "",
    examples: (data?.testCases || []).map((tc) => ({
      input: tc.input,
      output: tc.expectedOutput,
    })),
    constraints: data?.constraints || [],
    hints: [],
    initialCode: starterCode[defaultLanguage] || "",
    starterCodeMap: starterCode,
  };
};

const LoadingState = () => (
  <div className="min-h-screen bg-black flex items-center justify-center text-white">
    <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-[#bef264] animate-spin" />
  </div>
);

const QuestionCodePage = () => {
  const { questionId } = useParams();
  const location = useLocation();
  const routedTask = location.state?.task;
  const [task, setTask] = useState(routedTask || null);
  const [loading, setLoading] = useState(!routedTask && Boolean(questionId));

  useEffect(() => {
    if (routedTask) {
      setTask(routedTask);
      setLoading(false);
      return;
    }

    if (!questionId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchQuestion = async () => {
      try {
        const res = await axios.get(
          `${backendURL}/api/questions/${questionId}`,
        );
        if (isMounted && res.data.success) {
          setTask(buildTaskFromQuestion(res.data.data, questionId));
        }
      } catch (error) {
        console.error("Failed to load coding question:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuestion();

    return () => {
      isMounted = false;
    };
  }, [questionId, routedTask]);

  if (loading) {
    return <LoadingState />;
  }

  return <CodingSpace task={task || undefined} />;
};

export default QuestionCodePage;
