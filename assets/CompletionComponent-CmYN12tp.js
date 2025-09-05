var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, u as useAppStore, a as useUserStore, b as useSettingsStore, d as useProgressStore, j as jsxRuntimeExports, e as useTranslation, X } from "./index-BPkXPkPG.js";
import { u as useLearningCleanup } from "./useLearningCleanup-Dh1B-QF4.js";
import { s as shuffleArray } from "./randomUtils-D0e6mIw3.js";
import { C as Check } from "./check-wnbxzSig.js";
import { A as ArrowRight } from "./arrow-right-Og0V9IyO.js";
const CompletionComponent = /* @__PURE__ */ __name(({ module }) => {
  var _a, _b, _c;
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  const [answer, setAnswer] = reactExports.useState("");
  const [showResult, setShowResult] = reactExports.useState(false);
  const [startTime] = reactExports.useState(Date.now());
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { language } = useSettingsStore();
  const { addProgressEntry } = useProgressStore();
  const { t } = useTranslation(language);
  useLearningCleanup();
  const randomizedExercises = reactExports.useMemo(() => {
    if (!(module == null ? void 0 : module.data)) return [];
    return shuffleArray(module.data);
  }, [module == null ? void 0 : module.data, module == null ? void 0 : module.id]);
  const currentExercise = randomizedExercises[currentIndex];
  reactExports.useEffect(() => {
    if (!showResult && randomizedExercises.length > 0) {
      const inputElement = document.querySelector('input[type="text"]');
      if (inputElement) {
        setTimeout(() => inputElement.focus(), 100);
      }
    }
  }, [currentIndex, showResult, randomizedExercises.length]);
  const checkAnswer = /* @__PURE__ */ __name(() => {
    var _a2;
    if (showResult) return;
    const userAnswer = answer.toLowerCase().trim();
    const correctAnswer = ((_a2 = currentExercise == null ? void 0 : currentExercise.correct) == null ? void 0 : _a2.toLowerCase().trim()) || "";
    const isCorrect = userAnswer === correctAnswer;
    updateSessionScore(isCorrect ? { correct: 1 } : { incorrect: 1 });
    setShowResult(true);
  }, "checkAnswer");
  const handleNext = /* @__PURE__ */ __name(() => {
    if (currentIndex < randomizedExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setShowResult(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1e3);
      const { sessionScore } = useAppStore.getState();
      const finalScore = Math.round(sessionScore.correct / sessionScore.total * 100);
      addProgressEntry({
        score: finalScore,
        totalQuestions: sessionScore.total,
        correctAnswers: sessionScore.correct,
        moduleId: module.id,
        learningMode: "completion",
        timeSpent
      });
      updateUserScore(module.id, finalScore, timeSpent);
      setCurrentView("menu");
    }
  }, "handleNext");
  reactExports.useEffect(() => {
    if (randomizedExercises.length === 0) return;
    const handleKeyPress = /* @__PURE__ */ __name((e) => {
      if (e.key === "Enter" && !showResult) {
        if (answer.trim()) {
          checkAnswer();
        }
      } else if (e.key === "Enter" && showResult) {
        handleNext();
      } else if (e.key === "Escape") {
        setCurrentView("menu");
      }
    }, "handleKeyPress");
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [answer, showResult, randomizedExercises.length]);
  if (!randomizedExercises.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-3 sm:p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: t("noDataAvailable") || "No completion exercises available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setCurrentView("menu"), "onClick"),
          className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
          children: t("navigation.mainMenu")
        }
      )
    ] });
  }
  const renderSentence = /* @__PURE__ */ __name(() => {
    if (!(currentExercise == null ? void 0 : currentExercise.sentence)) return null;
    const parts = currentExercise.sentence.split("______");
    const elements = [];
    parts.forEach((part, index) => {
      var _a2;
      if (part) {
        elements.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-900 dark:text-white", children: part }, `text-${index}`)
        );
      }
      if (index < parts.length - 1) {
        const isCorrect = showResult && answer.toLowerCase().trim() === ((_a2 = currentExercise.correct) == null ? void 0 : _a2.toLowerCase().trim());
        const isIncorrect = showResult && answer && !isCorrect;
        elements.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: answer,
              onChange: /* @__PURE__ */ __name((e) => setAnswer(e.target.value), "onChange"),
              disabled: showResult,
              placeholder: "...",
              autoComplete: "off",
              className: `inline-block mx-2 px-3 py-1.5 min-w-[120px] text-center rounded-lg border-2 focus:outline-none transition-all duration-200 font-medium ${showResult ? isCorrect ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200" : isIncorrect ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200" : "border-gray-300 bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300" : "border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:bg-gray-600"}`,
              style: {
                width: `${Math.max(120, ((answer == null ? void 0 : answer.length) || 3) * 12 + 60)}px`
              }
            },
            `input-${index}`
          )
        );
      }
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: elements });
  }, "renderSentence");
  const hasAnswer = answer.trim().length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-3 sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg sm:text-xl font-bold text-gray-900", children: module.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full", style: { minWidth: "60px", textAlign: "center" }, children: randomizedExercises.length > 0 ? `${currentIndex + 1}/${randomizedExercises.length}` : "..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-purple-600 h-1.5 rounded-full transition-all duration-300",
          style: { width: `${(currentIndex + 1) / randomizedExercises.length * 100}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2 text-center", children: showResult ? "Press Enter for next exercise" : "Fill the blank and press Enter" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Complete the sentence:" }),
      (currentExercise == null ? void 0 : currentExercise.tip) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 rounded-r-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800 dark:text-blue-200", children: [
        "💡 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tip:" }),
        " ",
        currentExercise.tip
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg leading-relaxed mb-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-inner", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-900 dark:text-white font-medium", children: renderSentence() }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-3 overflow-hidden transition-all duration-300 ease-in-out ${showResult ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1.5 flex-wrap", children: [
          answer.toLowerCase().trim() === ((_a = currentExercise == null ? void 0 : currentExercise.correct) == null ? void 0 : _a.toLowerCase().trim()) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5 text-red-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-xs text-gray-900 dark:text-white", children: answer.toLowerCase().trim() === ((_b = currentExercise == null ? void 0 : currentExercise.correct) == null ? void 0 : _b.toLowerCase().trim()) ? "Correct!" : "Incorrect" }),
          answer.toLowerCase().trim() !== ((_c = currentExercise == null ? void 0 : currentExercise.correct) == null ? void 0 : _c.toLowerCase().trim()) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-700 dark:text-gray-300", children: [
            "- Answer: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: currentExercise == null ? void 0 : currentExercise.correct })
          ] })
        ] }),
        (currentExercise == null ? void 0 : currentExercise.explanation) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-blue-200 dark:border-blue-700 pt-2 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 dark:text-gray-300 leading-relaxed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Explanation:" }),
          " ",
          currentExercise.explanation
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center items-center gap-3 flex-wrap mt-6", children: [
      !showResult ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: checkAnswer,
          disabled: !hasAnswer,
          className: "flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium shadow-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Check Answer" })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleNext,
          className: "flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: currentIndex === randomizedExercises.length - 1 ? "Finish" : "Next" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-gray-300 mx-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setCurrentView("menu"), "onClick"),
          className: "flex items-center gap-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium",
          children: "← Menu"
        }
      )
    ] })
  ] });
}, "CompletionComponent");
export {
  CompletionComponent as default
};
