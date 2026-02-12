import { useNavigate, useLocation } from "react-router-dom";
import "./backButton.css";

export default function BackButton({ fallback = "/dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 🚫 Hide on landing pages
  if (location.pathname === "/" || location.pathname === "/dashboard") {
    return null;
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <button className="back-btn" onClick={handleBack}>
      ← Back
    </button>
  );
}
