export default function Topbar() {
  return (
    <header className="topbar">
      <input type="text" placeholder="Search..." />

      <div className="topbar-right">
        🔔
        ✉️
        <span className="profile">Admin</span>
      </div>
    </header>
  );
}
