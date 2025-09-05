var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, t as toast, u as useAppStore, a as useUserStore, b as useSettingsStore, d as useProgressStore, j as jsxRuntimeExports, C as CircleCheckBig, f as CircleX } from "./index-BPkXPkPG.js";
import { u as useLearningCleanup } from "./useLearningCleanup-Dh1B-QF4.js";
import { s as shuffleArray } from "./randomUtils-D0e6mIw3.js";
import { A as ArrowRight } from "./arrow-right-Og0V9IyO.js";
const useToast = /* @__PURE__ */ __name(() => {
  const showCorrectAnswer = reactExports.useCallback(() => {
    const messages = [
      "¡Correcto! 🎉",
      "¡Excelente! ✨",
      "¡Perfecto! 🌟",
      "¡Bien! 👏",
      "¡Genial! 🚀"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    toast.single.success(randomMessage, void 0, { duration: 2e3 });
  }, []);
  const showIncorrectAnswer = reactExports.useCallback(() => {
    toast.single.error("Incorrecto", void 0, { duration: 2e3 });
  }, []);
  const showModuleCompleted = reactExports.useCallback((moduleName, score, accuracy) => {
    if (accuracy >= 90) {
      toast.single.success("🎉 ¡Excelente trabajo!", `${moduleName} completado con ${accuracy.toFixed(0)}% de precisión (+${score} puntos)`);
    } else if (accuracy >= 70) {
      toast.single.success("✨ ¡Bien hecho!", `${moduleName} completado con ${accuracy.toFixed(0)}% de precisión (+${score} puntos)`);
    } else if (accuracy >= 50) {
      toast.single.info("Módulo completado", `${moduleName} - ${accuracy.toFixed(0)}% de precisión. ¡Sigue practicando!`);
    } else {
      toast.single.warning("Módulo completado", `${moduleName} - ${accuracy.toFixed(0)}% de precisión. Te recomendamos repasar el contenido.`);
    }
  }, []);
  const showLevelUp = reactExports.useCallback((newLevel, totalPoints) => {
    toast.achievement("¡Nivel alcanzado!", `Has llegado al nivel ${newLevel}`, totalPoints);
  }, []);
  const showStreak = reactExports.useCallback((days) => {
    toast.success("¡Racha activa!", `${days} días consecutivos aprendiendo 🔥`);
  }, []);
  const showConnectionError = reactExports.useCallback(() => {
    toast.error("Error de conexión", "Verifica tu conexión a internet", {
      action: {
        label: "Reintentar",
        onClick: /* @__PURE__ */ __name(() => window.location.reload(), "onClick")
      }
    });
  }, []);
  const showSaveSuccess = reactExports.useCallback((item = "Configuración") => {
    toast.success("Guardado", `${item} guardada correctamente`);
  }, []);
  const showLoadingError = reactExports.useCallback((item = "contenido") => {
    toast.error("Error de carga", `No se pudo cargar ${item}. Intenta de nuevo.`);
  }, []);
  const showFeatureComingSoon = reactExports.useCallback((feature) => {
    toast.info("Próximamente", `${feature} estará disponible pronto`);
  }, []);
  const showTip = reactExports.useCallback((tip) => {
    toast.info("💡 Consejo", tip, { duration: 6e3 });
  }, []);
  const showWelcome = reactExports.useCallback((userName) => {
    const message = userName ? `¡Bienvenido de vuelta, ${userName}!` : "¡Bienvenido!";
    toast.success(message, "Listo para seguir aprendiendo");
  }, []);
  const showSuccess = reactExports.useCallback((title, message) => {
    toast.success(title, message);
  }, []);
  const showError = reactExports.useCallback((title, message) => {
    toast.error(title, message);
  }, []);
  const showInfo = reactExports.useCallback((title, message) => {
    toast.info(title, message);
  }, []);
  const showWarning = reactExports.useCallback((title, message) => {
    toast.warning(title, message);
  }, []);
  return {
    // Learning-specific
    showCorrectAnswer,
    showIncorrectAnswer,
    showModuleCompleted,
    showLevelUp,
    showStreak,
    showTip,
    showWelcome,
    // System-specific
    showConnectionError,
    showSaveSuccess,
    showLoadingError,
    showFeatureComingSoon,
    // Generic
    showSuccess,
    showError,
    showInfo,
    showWarning,
    // Direct access to toast store
    toast
  };
}, "useToast");
const ALLOWED_TAGS = ["span", "strong", "em", "b", "i"];
const ALLOWED_ATTRIBUTES = ["class"];
const sanitizeHTML = /* @__PURE__ */ __name((html) => {
  if (typeof html !== "string") {
    return "";
  }
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:(?!image\/(?:png|jpg|jpeg|gif|svg\+xml))[^;]*/gi, "");
  const dangerousTags = ["script", "object", "embed", "link", "style", "meta", "iframe", "form", "input"];
  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
    sanitized = sanitized.replace(regex, "");
  });
  sanitized = sanitized.replace(/<(\w+)([^>]*)>/gi, (_match, tagName, attributes) => {
    if (!ALLOWED_TAGS.includes(tagName.toLowerCase())) {
      return "";
    }
    const cleanAttributes = attributes.replace(/(\w+)\s*=\s*["']([^"']*)["']/gi, (_attrMatch, attrName, attrValue) => {
      if (!ALLOWED_ATTRIBUTES.includes(attrName.toLowerCase())) {
        return "";
      }
      if (attrName.toLowerCase() === "class") {
        const safeValue = attrValue.replace(/[^a-zA-Z0-9\s\-_]/g, "");
        return `${attrName}="${safeValue}"`;
      }
      return `${attrName}="${attrValue}"`;
    });
    return `<${tagName}${cleanAttributes}>`;
  });
  return sanitized;
}, "sanitizeHTML");
const createSanitizedHTML = /* @__PURE__ */ __name((html) => {
  return {
    __html: sanitizeHTML(html)
  };
}, "createSanitizedHTML");
const QuizComponent = /* @__PURE__ */ __name(({ module }) => {
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  const [selectedAnswer, setSelectedAnswer] = reactExports.useState(null);
  const [showResult, setShowResult] = reactExports.useState(false);
  const [startTime] = reactExports.useState(Date.now());
  const randomizedQuestions = reactExports.useMemo(() => {
    if (!(module == null ? void 0 : module.data)) return [];
    const questions = module.data;
    const shuffledQuestions = shuffleArray(questions);
    return shuffledQuestions.map((question) => {
      if (!question.options || !question.correct) return question;
      const shuffledOptions = shuffleArray([...question.options]);
      return {
        ...question,
        options: shuffledOptions
      };
    });
  }, [module == null ? void 0 : module.data, module == null ? void 0 : module.id]);
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { theme } = useSettingsStore();
  const { addProgressEntry } = useProgressStore();
  const { showCorrectAnswer, showIncorrectAnswer, showModuleCompleted } = useToast();
  useLearningCleanup();
  const isDark = theme === "dark";
  const textColor = isDark ? "white" : "#111827";
  const currentQuestion = randomizedQuestions[currentIndex];
  const handleAnswerSelect = /* @__PURE__ */ __name((optionIndex) => {
    var _a;
    if (showResult || !currentQuestion) return;
    const selectedAnswer2 = (_a = currentQuestion.options) == null ? void 0 : _a[optionIndex];
    const isCorrect = selectedAnswer2 === currentQuestion.correct;
    setSelectedAnswer(optionIndex);
    setShowResult(true);
    updateSessionScore(isCorrect ? { correct: 1 } : { incorrect: 1 });
    if (isCorrect) {
      showCorrectAnswer();
    } else {
      showIncorrectAnswer();
    }
  }, "handleAnswerSelect");
  const handleNext = /* @__PURE__ */ __name(() => {
    if (currentIndex < randomizedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1e3);
      const { sessionScore } = useAppStore.getState();
      const finalScore = Math.round(sessionScore.correct / sessionScore.total * 100);
      const accuracy = sessionScore.accuracy;
      addProgressEntry({
        score: finalScore,
        totalQuestions: sessionScore.total,
        correctAnswers: sessionScore.correct,
        moduleId: module.id,
        learningMode: "quiz",
        timeSpent
      });
      showModuleCompleted(module.name, finalScore, accuracy);
      updateUserScore(module.id, finalScore, timeSpent);
      setCurrentView("menu");
    }
  }, "handleNext");
  reactExports.useEffect(() => {
    if (randomizedQuestions.length === 0) return;
    const handleKeyPress = /* @__PURE__ */ __name((e) => {
      var _a;
      if (e.key >= "1" && e.key <= "4" && !showResult && currentQuestion) {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < (((_a = currentQuestion.options) == null ? void 0 : _a.length) || 0)) {
          handleAnswerSelect(optionIndex);
        }
      } else if (e.key === "Enter" && showResult) {
        handleNext();
      } else if (e.key === "Escape") {
        setCurrentView("menu");
      }
    }, "handleKeyPress");
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showResult, currentQuestion, randomizedQuestions.length]);
  if (!randomizedQuestions.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-3 sm:p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "No quiz questions available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setCurrentView("menu"), "onClick"),
          className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
          children: "Back to Menu"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-3 sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg sm:text-xl font-bold text-gray-900", children: module.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full", style: { minWidth: "60px", textAlign: "center" }, children: randomizedQuestions.length > 0 ? `${currentIndex + 1}/${randomizedQuestions.length}` : "..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-green-600 h-1.5 rounded-full transition-all duration-300",
          style: { width: `${(currentIndex + 1) / randomizedQuestions.length * 100}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2 text-center", children: showResult ? "Press Enter for next question" : "Press 1-4 to select or click an option" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quiz-question bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg sm:text-xl font-semibold mb-4 sm:mb-6", style: { color: textColor }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { dangerouslySetInnerHTML: createSanitizedHTML((currentQuestion == null ? void 0 : currentQuestion.sentence) || "Loading question...") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: ((currentQuestion == null ? void 0 : currentQuestion.options) || []).map((option, index) => {
        let buttonClass = "quiz-option w-full p-3 text-left border-2 rounded-lg transition-all duration-200 ";
        if (!showResult) {
          buttonClass += "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:!text-white";
        } else {
          if ((currentQuestion == null ? void 0 : currentQuestion.options[index]) === (currentQuestion == null ? void 0 : currentQuestion.correct)) {
            buttonClass += "quiz-option--correct border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900 text-green-800 dark:!text-white";
          } else if (index === selectedAnswer && (currentQuestion == null ? void 0 : currentQuestion.options[index]) !== (currentQuestion == null ? void 0 : currentQuestion.correct)) {
            buttonClass += "quiz-option--incorrect border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900 text-red-800 dark:!text-white";
          } else {
            buttonClass += "quiz-option--disabled border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:!text-white";
          }
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => handleAnswerSelect(index), "onClick"),
            disabled: showResult,
            className: buttonClass,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-3", children: index + 1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-sm",
                    style: { color: textColor },
                    children: option
                  }
                )
              ] }),
              showResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                (currentQuestion == null ? void 0 : currentQuestion.options[index]) === (currentQuestion == null ? void 0 : currentQuestion.correct) && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-6 w-6 text-green-600" }),
                index === selectedAnswer && (currentQuestion == null ? void 0 : currentQuestion.options[index]) !== (currentQuestion == null ? void 0 : currentQuestion.correct) && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-6 w-6 text-red-600" })
              ] })
            ] })
          },
          index
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-6 overflow-hidden transition-all duration-300 ease-in-out ${showResult && (currentQuestion == null ? void 0 : currentQuestion.explanation) ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "quiz-explanation p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium mb-2", style: { color: textColor }, children: "Explanation:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: textColor }, children: (currentQuestion == null ? void 0 : currentQuestion.explanation) || "" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center items-center gap-3 flex-wrap mt-6", children: [
      showResult && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleNext,
            className: "flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: currentIndex === randomizedQuestions.length - 1 ? "Finish Quiz" : "Next Question" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-gray-300 mx-1" })
      ] }),
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
}, "QuizComponent");
export {
  QuizComponent as default
};
