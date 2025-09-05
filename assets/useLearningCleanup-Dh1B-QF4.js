var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, t as toast } from "./index-BPkXPkPG.js";
const useLearningCleanup = /* @__PURE__ */ __name(() => {
  reactExports.useEffect(() => {
    return () => {
      toast.clearGameToasts();
    };
  }, []);
  const clearGameToasts = /* @__PURE__ */ __name(() => {
    toast.clearGameToasts();
  }, "clearGameToasts");
  return { clearGameToasts };
}, "useLearningCleanup");
export {
  useLearningCleanup as u
};
