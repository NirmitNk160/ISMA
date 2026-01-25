import "./backButton.css";
import { useNavigate, useLocation } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // ❌ Hide back button on Home page
  if (location.pathname === "/") {
    return null;
  }

  const from = location.state?.from;

  const handleBack = () => {
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <button className="back-btn" onClick={handleBack}>
      ← Back
    </button>
  );
}

export default BackButton;

/* onClick={() =>
  navigate("/profile", {
    state: { from: "/dashboard" },
  })
} */
