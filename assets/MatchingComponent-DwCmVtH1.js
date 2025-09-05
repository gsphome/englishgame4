var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, u as useAppStore, a as useUserStore, j as jsxRuntimeExports, I as Info, X } from "./index-BPkXPkPG.js";
import { u as useLearningCleanup } from "./useLearningCleanup-Dh1B-QF4.js";
import { R as RotateCcw } from "./rotate-ccw-AGgNRYBn.js";
import { C as Check } from "./check-wnbxzSig.js";
const MatchingComponent = /* @__PURE__ */ __name(({ module }) => {
  const [leftItems, setLeftItems] = reactExports.useState([]);
  const [rightItems, setRightItems] = reactExports.useState([]);
  const [selectedLeft, setSelectedLeft] = reactExports.useState(null);
  const [selectedRight, setSelectedRight] = reactExports.useState(null);
  const [matches, setMatches] = reactExports.useState({});
  const [showResult, setShowResult] = reactExports.useState(false);
  const [startTime] = reactExports.useState(Date.now());
  const [showExplanation, setShowExplanation] = reactExports.useState(false);
  const [selectedTerm, setSelectedTerm] = reactExports.useState(null);
  const currentModuleIdRef = reactExports.useRef(null);
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  useLearningCleanup();
  reactExports.useEffect(() => {
    const handleKeyPress = /* @__PURE__ */ __name((e) => {
      if (showExplanation) {
        if (e.key === "Enter" || e.key === "Escape") {
          setShowExplanation(false);
        }
      } else if (e.key === "Escape") {
        setCurrentView("menu");
      }
    }, "handleKeyPress");
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showExplanation]);
  reactExports.useEffect(() => {
    if (!(module == null ? void 0 : module.data) || !(module == null ? void 0 : module.id)) return;
    if (currentModuleIdRef.current === module.id) return;
    currentModuleIdRef.current = module.id;
    let pairs2 = [];
    const firstItem = module.data[0];
    if (firstItem == null ? void 0 : firstItem.pairs) {
      pairs2 = firstItem.pairs;
    } else if (Array.isArray(module.data)) {
      pairs2 = module.data.map((item) => ({
        left: item.en || item.term || item.left || "",
        right: item.es || item.definition || item.right || ""
      }));
    }
    if (pairs2.length > 0) {
      const terms = pairs2.map((pair) => pair.left).sort(() => Math.random() - 0.5);
      const definitions = pairs2.map((pair) => pair.right).sort(() => Math.random() - 0.5);
      setLeftItems(terms);
      setRightItems(definitions);
      setMatches({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setShowResult(false);
    }
  }, [module == null ? void 0 : module.data, module == null ? void 0 : module.id]);
  if (!(module == null ? void 0 : module.data) || leftItems.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-6xl mx-auto p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Loading matching exercise..." }) });
  }
  const getPairs = /* @__PURE__ */ __name(() => {
    if (!module.data) return [];
    const firstItem = module.data[0];
    if (firstItem == null ? void 0 : firstItem.pairs) {
      return firstItem.pairs;
    }
    return module.data.map((item) => ({
      left: item.term || "",
      right: item.definition || ""
    }));
  }, "getPairs");
  const pairs = getPairs();
  const handleLeftClick = /* @__PURE__ */ __name((item) => {
    if (showResult || matches[item]) return;
    if (selectedLeft === item) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(item);
      if (selectedRight) {
        createMatch(item, selectedRight);
      }
    }
  }, "handleLeftClick");
  const handleRightClick = /* @__PURE__ */ __name((item) => {
    if (showResult || Object.values(matches).includes(item)) return;
    if (selectedRight === item) {
      setSelectedRight(null);
    } else {
      setSelectedRight(item);
      if (selectedLeft) {
        createMatch(selectedLeft, item);
      }
    }
  }, "handleRightClick");
  const createMatch = /* @__PURE__ */ __name((left, right) => {
    setMatches((prev) => ({ ...prev, [left]: right }));
    setSelectedLeft(null);
    setSelectedRight(null);
  }, "createMatch");
  const removeMatch = /* @__PURE__ */ __name((leftItem) => {
    if (showResult) return;
    setMatches((prev) => {
      const newMatches = { ...prev };
      delete newMatches[leftItem];
      return newMatches;
    });
  }, "removeMatch");
  const checkAnswers = /* @__PURE__ */ __name(() => {
    let correctMatches = 0;
    pairs.forEach((pair) => {
      if (matches[pair.left] === pair.right) {
        correctMatches++;
      }
    });
    const isAllCorrect = correctMatches === pairs.length;
    updateSessionScore(isAllCorrect ? { correct: 1 } : { incorrect: 1 });
    setShowResult(true);
  }, "checkAnswers");
  const resetExercise = /* @__PURE__ */ __name(() => {
    const terms = pairs.map((pair) => pair.left).sort(() => Math.random() - 0.5);
    const definitions = pairs.map((pair) => pair.right).sort(() => Math.random() - 0.5);
    setLeftItems(terms);
    setRightItems(definitions);
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setShowResult(false);
  }, "resetExercise");
  const finishExercise = /* @__PURE__ */ __name(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1e3);
    const correctCount = pairs.filter((pair) => matches[pair.left] === pair.right).length;
    const finalScore = Math.round(correctCount / pairs.length * 100);
    updateUserScore(module.id, finalScore, timeSpent);
    setCurrentView("menu");
  }, "finishExercise");
  const allMatched = Object.keys(matches).length === pairs.length;
  const getItemStatus = /* @__PURE__ */ __name((item, isLeft) => {
    var _a;
    if (showResult) {
      if (isLeft) {
        const correctMatch = (_a = pairs.find((pair) => pair.left === item)) == null ? void 0 : _a.right;
        const userMatch = matches[item];
        return userMatch === correctMatch ? "correct" : "incorrect";
      } else {
        const correctPair = pairs.find((pair) => pair.right === item);
        const userMatch = Object.entries(matches).find(([_, right]) => right === item);
        if (correctPair && userMatch) {
          return userMatch[0] === correctPair.left ? "correct" : "incorrect";
        }
        return Object.values(matches).includes(item) ? "incorrect" : "unmatched";
      }
    }
    return "normal";
  }, "getItemStatus");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-3 sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg sm:text-xl font-bold text-gray-900", children: module.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full", children: [
          Object.keys(matches).length,
          "/",
          pairs.length,
          " matched"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-pink-600 h-1.5 rounded-full transition-all duration-300",
          style: { width: `${Object.keys(matches).length / pairs.length * 100}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2 text-center", children: allMatched ? "All matched! Check your answers" : "Click items from both columns to match them" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center", children: "Terms" }),
          leftItems.map((item, index) => {
            const isMatched = matches[item];
            const isSelected = selectedLeft === item;
            const status = getItemStatus(item, true);
            let className = "w-full p-3 text-sm text-left border-2 rounded-xl transition-all duration-200 font-medium ";
            if (showResult) {
              className += status === "correct" ? "border-green-400 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : "border-red-400 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
            } else if (isMatched) {
              className += "border-pink-400 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 cursor-pointer";
            } else if (isSelected) {
              className += "border-pink-500 bg-pink-200 dark:bg-pink-800 text-pink-900 dark:text-pink-100 shadow-md scale-105";
            } else {
              className += "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900 cursor-pointer hover:shadow-md hover:scale-102";
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => isMatched ? removeMatch(item) : handleLeftClick(item), "onClick"),
                className,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center", children: String.fromCharCode(65 + index) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate flex-1", children: item }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                    showResult && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        onClick: /* @__PURE__ */ __name((e) => {
                          var _a;
                          e.stopPropagation();
                          const termData = (_a = module.data) == null ? void 0 : _a.find((d) => d.term === item);
                          setSelectedTerm(termData);
                          setShowExplanation(true);
                        }, "onClick"),
                        className: "flex-shrink-0 w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer",
                        title: "Show explanation",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3 w-3" })
                      }
                    ),
                    isMatched && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 w-6 h-6 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center", children: rightItems.findIndex((def) => matches[item] === def) + 1 })
                  ] })
                ] })
              },
              `left-${index}`
            );
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center", children: "Definitions" }),
          rightItems.map((item, index) => {
            const isMatched = Object.values(matches).includes(item);
            const isSelected = selectedRight === item;
            const status = getItemStatus(item, false);
            let className = "w-full p-3 text-sm text-left border-2 rounded-xl transition-all duration-200 ";
            if (showResult) {
              className += status === "correct" ? "border-green-400 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : status === "incorrect" ? "border-red-400 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
            } else if (isMatched) {
              className += "border-pink-400 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 opacity-60";
            } else if (isSelected) {
              className += "border-pink-500 bg-pink-200 dark:bg-pink-800 text-pink-900 dark:text-pink-100 shadow-md scale-105";
            } else {
              className += "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900 cursor-pointer hover:shadow-md hover:scale-102";
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => handleRightClick(item), "onClick"),
                disabled: isMatched,
                className,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center", children: index + 1 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate flex-1", children: item }),
                  isMatched && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center", children: String.fromCharCode(65 + leftItems.findIndex((term) => matches[term] === item)) })
                ] })
              },
              `right-${index}`
            );
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-1", children: Array.from({ length: pairs.length }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `w-2 h-2 rounded-full transition-colors ${i < Object.keys(matches).length ? "bg-pink-500" : "bg-gray-300 dark:bg-gray-600"}`
          },
          i
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400 ml-2", children: showResult ? `${pairs.filter((pair) => matches[pair.left] === pair.right).length}/${pairs.length} correct` : `${Object.keys(matches).length}/${pairs.length}` })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center items-center gap-3 flex-wrap mt-6", children: [
      !showResult ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: resetExercise,
            className: "p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-sm",
            title: "Reset Exercise",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: checkAnswers,
            disabled: !allMatched,
            className: "flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium shadow-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Check Matches" })
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: finishExercise,
          className: "flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Finish Exercise" })
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
    ] }),
    showExplanation && selectedTerm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-80 flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:!bg-slate-800 border-0 dark:border dark:!border-slate-600 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h3",
          {
            className: "text-lg font-semibold text-gray-900",
            style: { color: document.documentElement.classList.contains("dark") ? "#ffffff" : void 0 },
            children: selectedTerm.term
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setShowExplanation(false), "onClick"),
            className: "text-gray-400 hover:text-gray-600 transition-colors",
            style: { color: document.documentElement.classList.contains("dark") ? "#d1d5db" : void 0 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h4",
            {
              className: "text-sm font-medium text-gray-700 mb-1",
              style: { color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : void 0 },
              children: "Definition:"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-gray-900",
              style: { color: document.documentElement.classList.contains("dark") ? "#ffffff" : void 0 },
              children: selectedTerm.definition
            }
          )
        ] }),
        selectedTerm.explanation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h4",
            {
              className: "text-sm font-medium text-gray-700 mb-1",
              style: { color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : void 0 },
              children: "Explanation:"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-gray-600 text-sm",
              style: { color: document.documentElement.classList.contains("dark") ? "#ffffff" : void 0 },
              children: selectedTerm.explanation
            }
          )
        ] }),
        selectedTerm.term_es && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h4",
            {
              className: "text-sm font-medium text-gray-700 mb-1",
              style: { color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : void 0 },
              children: "Spanish:"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-gray-900 font-medium",
              style: { color: document.documentElement.classList.contains("dark") ? "#ffffff" : void 0 },
              children: selectedTerm.term_es
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setShowExplanation(false), "onClick"),
          className: "w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:!bg-blue-600 dark:hover:!bg-blue-500 text-white rounded-lg transition-colors",
          children: "Close"
        }
      )
    ] }) }) })
  ] });
}, "MatchingComponent");
export {
  MatchingComponent as default
};
