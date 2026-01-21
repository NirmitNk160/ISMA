import "./../styles/home.css";

export default function Navbar({ setPage, user, onLogout }) {
  return (
    <nav className="navbar">
      <h1 className="logo">ISMA</h1>

      <div className="nav-links">
        {!user ? (
          <>
            <button onClick={() => setPage("login")}>Login</button>
            <button className="nav-btn" onClick={() => setPage("register")}>
              Get Started
            </button>
          </>
        ) : (
          <div className="welcome-box">
            <span className="welcome-text">
              👋 Welcome {user.role === "admin" ? "Admin" : user.name}
            </span>

            <button className="nav-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
