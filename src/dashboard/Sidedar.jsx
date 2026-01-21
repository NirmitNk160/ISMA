export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="brand">ISMA</h2>

      <nav>
        <a className="active">Dashboard</a>
        <a>Products</a>
        <a>Orders</a>
        <a>Reports</a>
        <a>Settings</a>
      </nav>
    </aside>
  );
}
