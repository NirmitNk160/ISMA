import { useNavigate } from "react-router-dom";

/**
 * This component stores the navigate function
 * so it can be used outside React components.
 */
let navigateFn = null;

export function NavigationHandler() {
  navigateFn = useNavigate();
  return null;
}

/**
 * Navigate from anywhere (cards, utils, handlers)
 * Example: navigateTo("/dashboard")
 */
export function navigateTo(path, options = {}) {
  if (!navigateFn) {
    console.warn("Navigation not ready yet");
    return;
  }
  navigateFn(path, options);
}
