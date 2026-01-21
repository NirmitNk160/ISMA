import Sidebar from "../dashboard/Sidedar";
import Topbar from "../dashboard/Topbar";
import "./dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <h2>Dashboard</h2>

          {/* STAT CARDS */}
          <div className="stats-grid">
            <div className="stat-card">
              <p>EARNINGS (MONTHLY)</p>
              <h3>$40,000</h3>
              <span className="green">↑ 3.48%</span>
            </div>

            <div className="stat-card">
              <p>SALES</p>
              <h3>650</h3>
              <span className="green">↑ 12%</span>
            </div>

            <div className="stat-card">
              <p>NEW USERS</p>
              <h3>366</h3>
              <span className="green">↑ 20.4%</span>
            </div>

            <div className="stat-card">
              <p>PENDING REQUESTS</p>
              <h3>18</h3>
              <span className="red">↓ 1.10%</span>
            </div>
          </div>

          {/* CHART + PRODUCTS */}
          <div className="dashboard-grid">
            <div className="chart-card">
              <h4>Monthly Recap Report</h4>
              <div className="fake-chart">
                📈 Chart goes here (Chart.js / Recharts)
              </div>
            </div>

            <div className="products-card">
              <h4>Products Sold</h4>

              <Progress label="Oblong T-Shirt" value={75} />
              <Progress label="Gundam 90’s" value={62} />
              <Progress label="Rounded Hat" value={56} />
              <Progress label="Indomie Goreng" value={50} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Progress({ label, value }) {
  return (
    <div className="progress-item">
      <div className="progress-label">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
