var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, u as useAppStore, a as useUserStore, b as useSettingsStore, j as jsxRuntimeExports } from "./index-BPkXPkPG.js";
import { u as useLearningCleanup } from "./useLearningCleanup-Dh1B-QF4.js";
import { R as RotateCcw } from "./rotate-ccw-AGgNRYBn.js";
import { C as Check } from "./check-wnbxzSig.js";
const SortingComponent = /* @__PURE__ */ __name(({ module }) => {
  const [draggedItem, setDraggedItem] = reactExports.useState(null);
  const [sortedItems, setSortedItems] = reactExports.useState({});
  const [availableWords, setAvailableWords] = reactExports.useState([]);
  const [showResult, setShowResult] = reactExports.useState(false);
  const [startTime] = reactExports.useState(Date.now());
  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  useLearningCleanup();
  const [exercise, setExercise] = reactExports.useState({ id: "", words: [], categories: [] });
  reactExports.useEffect(() => {
    const handleKeyPress = /* @__PURE__ */ __name((e) => {
      if (e.key === "Escape") {
        setCurrentView("menu");
      }
    }, "handleKeyPress");
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);
  reactExports.useEffect(() => {
    var _a;
    let newExercise = { id: "", words: [], categories: [] };
    if ((module == null ? void 0 : module.data) && Array.isArray(module.data)) {
      const firstItem = module.data[0];
      if (firstItem && "category" in firstItem && "word" in firstItem) {
        const uniqueCategories = [...new Set(module.data.map((item) => item.category))];
        const shuffledCategories = uniqueCategories.sort(() => Math.random() - 0.5);
        const { gameSettings } = useSettingsStore.getState();
        const totalWords = gameSettings.sortingMode.wordCount;
        const categoryCount = gameSettings.sortingMode.categoryCount || 3;
        const selectedCategories = shuffledCategories.slice(0, categoryCount);
        const wordsPerCategory = Math.ceil(totalWords / categoryCount);
        const wordsForCategories = [];
        const categories = selectedCategories.map((categoryId) => {
          const categoryWords = (module.data || []).filter((item) => item.category === categoryId).map((item) => item.word).slice(0, wordsPerCategory);
          wordsForCategories.push(...categoryWords);
          return {
            name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
            items: categoryWords
          };
        });
        const finalWords = wordsForCategories.slice(0, totalWords);
        const updatedCategories = categories.map((category) => ({
          ...category,
          items: category.items.filter((word) => finalWords.includes(word))
        }));
        newExercise = {
          id: "sorting-exercise",
          words: finalWords,
          categories: updatedCategories
        };
      }
    }
    setExercise(newExercise);
    if (((_a = newExercise.words) == null ? void 0 : _a.length) > 0) {
      const shuffled = [...newExercise.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      const initialSorted = {};
      (newExercise.categories || []).forEach((cat) => {
        initialSorted[cat.name] = [];
      });
      setSortedItems(initialSorted);
    }
  }, [module.id]);
  const handleDragStart = /* @__PURE__ */ __name((e, word) => {
    setDraggedItem(word);
    e.dataTransfer.effectAllowed = "move";
  }, "handleDragStart");
  const handleDragOver = /* @__PURE__ */ __name((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, "handleDragOver");
  const handleDrop = /* @__PURE__ */ __name((e, categoryName) => {
    e.preventDefault();
    if (!draggedItem) return;
    setAvailableWords((prev) => prev.filter((word) => word !== draggedItem));
    setSortedItems((prev) => ({
      ...prev,
      [categoryName]: [...prev[categoryName] || [], draggedItem]
    }));
    setDraggedItem(null);
  }, "handleDrop");
  const handleRemoveFromCategory = /* @__PURE__ */ __name((word, categoryName) => {
    if (showResult) return;
    setSortedItems((prev) => ({
      ...prev,
      [categoryName]: (prev[categoryName] || []).filter((w) => w !== word)
    }));
    setAvailableWords((prev) => [...prev, word]);
  }, "handleRemoveFromCategory");
  const checkAnswers = /* @__PURE__ */ __name(() => {
    var _a;
    let correctCategories = 0;
    (exercise.categories || []).forEach((category) => {
      const userItems = sortedItems[category.name] || [];
      const correctItems = category.items;
      const isCorrect = userItems.length === correctItems.length && userItems.every((item) => correctItems.includes(item));
      if (isCorrect) {
        correctCategories++;
      }
    });
    const isAllCorrect = correctCategories === (((_a = exercise.categories) == null ? void 0 : _a.length) || 0);
    updateSessionScore(isAllCorrect ? { correct: 1 } : { incorrect: 1 });
    setShowResult(true);
  }, "checkAnswers");
  const resetExercise = /* @__PURE__ */ __name(() => {
    const shuffled = [...exercise.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    const initialSorted = {};
    (exercise.categories || []).forEach((cat) => {
      initialSorted[cat.name] = [];
    });
    setSortedItems(initialSorted);
    setShowResult(false);
  }, "resetExercise");
  const finishExercise = /* @__PURE__ */ __name(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1e3);
    const { sessionScore } = useAppStore.getState();
    const finalScore = sessionScore.correct > 0 ? 100 : 0;
    updateUserScore(module.id, finalScore, timeSpent);
    setCurrentView("menu");
  }, "finishExercise");
  const allWordsSorted = availableWords.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-3 sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg sm:text-xl font-bold text-gray-900 dark:text-white", children: module.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full", children: [
          exercise.words.length - availableWords.length,
          "/",
          exercise.words.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-orange-600 h-1.5 rounded-full transition-all duration-300",
          style: { width: `${exercise.words.length > 0 ? (exercise.words.length - availableWords.length) / exercise.words.length * 100 : 0}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2 text-center", children: allWordsSorted ? "All words sorted! Check your answers" : "Drag and drop words into categories" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Available Words" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[80px] p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: availableWords.map((word, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            draggable: true,
            onDragStart: /* @__PURE__ */ __name((e) => handleDragStart(e, word), "onDragStart"),
            className: "px-2 py-1 sm:px-3 sm:py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg cursor-move hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors select-none text-xs sm:text-sm",
            children: word
          },
          `available-${index}-${word}`
        )) }),
        availableWords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400 text-center", children: "All words have been sorted!" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1 sm:gap-4 lg:gap-6 mb-4", children: (exercise.categories || []).map((category) => {
      const userItems = sortedItems[category.name] || [];
      const isCorrect = showResult && userItems.length === category.items.length && userItems.every((item) => category.items.includes(item));
      const hasErrors = showResult && !isCorrect;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onDragOver: handleDragOver,
          onDrop: /* @__PURE__ */ __name((e) => handleDrop(e, category.name), "onDrop"),
          className: `p-1 sm:p-4 border-2 border-dashed rounded-lg min-h-[140px] sm:min-h-[200px] ${showResult ? isCorrect ? "border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900" : hasErrors ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-center text-sm sm:text-base", children: [
              category.name,
              showResult && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-2 ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`, children: isCorrect ? "✓" : "✗" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: userItems.map((word, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                onClick: /* @__PURE__ */ __name(() => handleRemoveFromCategory(word, category.name), "onClick"),
                className: `px-1 py-1 sm:px-3 sm:py-2 rounded text-center cursor-pointer transition-colors text-xs sm:text-sm ${showResult ? category.items.includes(word) ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200" : "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200" : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"}`,
                children: word
              },
              `${category.name}-${index}-${word}`
            )) }),
            showResult && hasErrors && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-yellow-800 dark:text-yellow-200", children: "Correct items:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-yellow-700 dark:text-yellow-300", children: category.items.join(", ") })
            ] })
          ]
        },
        category.name
      );
    }) }),
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
            disabled: !allWordsSorted,
            className: "flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium shadow-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Check Answers" })
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setCurrentView("menu"), "onClick"),
          className: "flex items-center gap-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium",
          children: "← Menu"
        }
      )
    ] })
  ] });
}, "SortingComponent");
export {
  SortingComponent as default
};
