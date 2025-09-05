var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { c as createLucideIcon, r as reactExports, u as useAppStore, a as useUserStore, b as useSettingsStore, d as useProgressStore, j as jsxRuntimeExports, e as useTranslation } from "./index-BPkXPkPG.js";
import { u as useLearningCleanup } from "./useLearningCleanup-Dh1B-QF4.js";
import { s as shuffleArray } from "./randomUtils-D0e6mIw3.js";
import { R as RotateCcw } from "./rotate-ccw-AGgNRYBn.js";
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronLeft = createLucideIcon("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronRight = createLucideIcon("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
const FlashcardComponent = /* @__PURE__ */ __name(({ module }) => {
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  const [isFlipped, setIsFlipped] = reactExports.useState(false);
  const [startTime] = reactExports.useState(Date.now());
  const { setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { language } = useSettingsStore();
  const { addProgressEntry } = useProgressStore();
  const { t } = useTranslation(language);
  useLearningCleanup();
  const randomizedFlashcards = reactExports.useMemo(() => {
    if (!(module == null ? void 0 : module.data)) return [];
    const allFlashcards = module.data;
    return shuffleArray(allFlashcards);
  }, [module == null ? void 0 : module.data, module == null ? void 0 : module.id, startTime]);
  const currentCard = randomizedFlashcards[currentIndex];
  const handleNext = /* @__PURE__ */ __name(() => {
    if (currentIndex < randomizedFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1e3);
      addProgressEntry({
        score: 100,
        // Flashcards are completion-based, so 100% for finishing
        totalQuestions: randomizedFlashcards.length,
        correctAnswers: randomizedFlashcards.length,
        moduleId: module.id,
        learningMode: "flashcard",
        timeSpent
      });
      updateUserScore(module.id, randomizedFlashcards.length, timeSpent);
      setCurrentView("menu");
    }
  }, "handleNext");
  const handlePrev = /* @__PURE__ */ __name(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, "handlePrev");
  const handleFlip = /* @__PURE__ */ __name(() => {
    setIsFlipped(!isFlipped);
  }, "handleFlip");
  reactExports.useEffect(() => {
    if (randomizedFlashcards.length === 0) return;
    const handleKeyPress = /* @__PURE__ */ __name((e) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          handleFlip();
          break;
        case "Escape":
          setCurrentView("menu");
          break;
      }
    }, "handleKeyPress");
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, randomizedFlashcards.length]);
  if (!randomizedFlashcards.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-3 sm:p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: t("noDataAvailable") || "No flashcards available" }),
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-3 sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg sm:text-xl font-bold text-gray-900", children: module.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full", children: [
          currentIndex + 1,
          "/",
          randomizedFlashcards.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-blue-600 h-1.5 rounded-full transition-all duration-300",
          style: { width: `${(currentIndex + 1) / randomizedFlashcards.length * 100}%` }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2 text-center", children: isFlipped ? "Press Enter/Space for next card" : "Click card or press Space to flip" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `flashcard relative h-56 sm:h-64 w-full cursor-pointer ${isFlipped ? "flipped" : ""}`,
        onClick: handleFlip,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flashcard-inner", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flashcard-front bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white text-center mb-2", children: (currentCard == null ? void 0 : currentCard.en) || "Loading..." }),
            (currentCard == null ? void 0 : currentCard.ipa) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base sm:text-lg text-gray-500 dark:text-gray-300 text-center mb-3", children: currentCard.ipa }),
            (currentCard == null ? void 0 : currentCard.example) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic text-center px-2", children: [
              '"',
              currentCard.example,
              '"'
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flashcard-back bg-blue-50 dark:bg-blue-900 shadow-lg border border-blue-200 dark:border-blue-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center mb-1", children: (currentCard == null ? void 0 : currentCard.en) || "Loading..." }),
            (currentCard == null ? void 0 : currentCard.ipa) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base text-gray-500 dark:text-gray-300 text-center mb-2", children: currentCard.ipa }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100 text-center mb-3", children: (currentCard == null ? void 0 : currentCard.es) || "Loading..." }),
            (currentCard == null ? void 0 : currentCard.example) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic mb-1 px-2", children: [
                '"',
                currentCard.example,
                '"'
              ] }),
              currentCard.example_es && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic px-2", children: [
                '"',
                currentCard.example_es,
                '"'
              ] })
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center items-center gap-3 flex-wrap mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handlePrev,
          disabled: currentIndex === 0,
          className: "p-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg transition-colors shadow-sm",
          title: "Previous Card (←)",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleFlip,
          className: "flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm w-[140px] justify-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isFlipped ? "Flip Back" : "Flip" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleNext,
          className: "p-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors shadow-sm",
          title: currentIndex === randomizedFlashcards.length - 1 ? "Finish" : "Next Card (→)",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
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
}, "FlashcardComponent");
export {
  FlashcardComponent as default
};
