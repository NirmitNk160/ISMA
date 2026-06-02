import Navbar from "../components/Navbar";
import "../styles/about.css";

function About() {
  const features = [
    {
      title: "Inventory Management",
      description:
        "Manage products efficiently with real-time stock tracking, organized inventory records, and simplified product workflows.",
    },
    {
      title: "Billing System",
      description:
        "Generate professional invoices, create PDF bills, and maintain secure billing records for smoother transactions.",
    },
    {
      title: "Sales Management",
      description:
        "Track sales activity, monitor product movement, and maintain organized transaction history.",
    },
    {
      title: "Supplier Management",
      description:
        "Add, edit, and organize supplier details with better supplier tracking and management tools.",
    },
    {
      title: "Dashboard & Analytics",
      description:
        "Access business insights, statistics, and progress tracking through a centralized dashboard.",
    },
    {
      title: "Barcode Integration",
      description:
        "Use barcode scanner support for faster product identification and inventory handling.",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="about-page">
        <div className="about-container">
          {/* Hero Section */}
          <section className="hero-section">
            <h1>
              About <span>ISMA</span>
            </h1>

            <p>
              ISMA (Inventory Store Management and Analysis) is a modern
              web-based platform designed to simplify inventory handling,
              billing, supplier management, sales tracking, and business
              analytics within a single integrated system.
            </p>
          </section>

          {/* Vision Section */}
          <section className="vision-section">
            <h2>Our Vision</h2>

            <p>
              Our vision is to create a reliable and scalable management
              solution that reduces manual workload, improves operational
              efficiency, and helps businesses make smarter decisions through
              organized data and modern tools.
            </p>

            <p>
              ISMA is built to combine simplicity, speed, and functionality into
              a professional system that supports real-world business
              operations.
            </p>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <h2>Core Features</h2>

            <div className="features-grid">
              {features.map((feature, index) => (
                <div className="feature-card" key={index}>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Technology Section */}
          <section className="tech-section">
            <h2>Technology Stack</h2>

            <div className="tech-grid">
              <div className="tech-card">
                <h3>Frontend</h3>
                <ul>
                  <li>React.js</li>
                  <li>Vite</li>
                  <li>Context API</li>
                  <li>Axios</li>
                  <li>Responsive CSS</li>
                </ul>
              </div>

              <div className="tech-card">
                <h3>Backend</h3>
                <ul>
                  <li>Node.js</li>
                  <li>Express.js</li>
                  <li>MongoDB</li>
                  <li>JWT Authentication</li>
                  <li>REST APIs</li>
                </ul>
              </div>

              <div className="tech-card">
                <h3>Services</h3>
                <ul>
                  <li>PDF Invoice Generation</li>
                  <li>Email Services</li>
                  <li>Barcode Utilities</li>
                  <li>Secure Middleware</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="team-section">
            <h2>Development Team</h2>

            <div className="team-grid">
              <div className="team-card">
                <h3>Nirmit</h3>
                <h4>Lead Developer & System Architect</h4>

                <p>
                  Nirmit is the primary developer and core architect behind
                  ISMA. He leads the overall system development, backend
                  structure, platform functionality, and technical architecture
                  of the project.
                </p>
              </div>

              <div className="team-card">
                <h3>Kunal</h3>
                <h4>Co-Developer & Project Contributor</h4>

                <p>
                  Kunal contributes to feature development, interface
                  improvements, testing, optimization, planning, and overall
                  project enhancement to improve the usability and workflow of
                  the platform.
                </p>
              </div>
            </div>
          </section>

          {/* Future Goals */}
          <section className="goals-section">
            <h2>Future Goals</h2>

            <div className="goals-grid">
              <div>Advanced analytics and reporting systems</div>
              <div>AI-based business insights</div>
              <div>Multi-user role management</div>
              <div>Cloud synchronization</div>
              <div>Enhanced dashboard visualization</div>
              <div>Mobile-friendly optimization</div>
              <div>Automation tools</div>
              <div>Smarter inventory workflows</div>
            </div>
          </section>

          {/* Footer */}
          <section className="footer-section">
            <p>
              ISMA is more than just an inventory system — it is a growing
              management platform designed to combine organization, analytics,
              and operational efficiency into one seamless experience.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export default About;
