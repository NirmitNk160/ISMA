import { useNavigate } from "react-router-dom";
import "./InventoryTopbar.css";

export default function InventoryTopbar() {
  const navigate = useNavigate();

  return (
    <header className="inventory-topbar">
      <div className="inventory-topbar-inner">
        {/* LEFT */}
        <div className="topbar-left">
          <h1 className="app-title">ISMA Inventory</h1>
        </div>

        {/* RIGHT */}
        <div className="topbar-right">
          <span className="welcome-text">
            Welcome, NirmitNk 👋
          </span>

          <div
            className="avatar"
            title="Profile"
            onClick={() => navigate("/profile")}
          >
            NI
          </div>
        </div>
      </div>
    </header>
  );
}
