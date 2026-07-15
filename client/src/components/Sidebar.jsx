import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/tracker", label: "Zaika Tracker", icon: "🍽️" },
  { to: "/taste-match", label: "Taste Match AI", icon: "😋" },
  { to: "/street-food", label: "Street Food", icon: "🥟" },
  { to: "/family-food", label: "Family Food", icon: "👨‍👩‍👧" },
  { to: "/recipe-transformer", label: "Zaika Remix", icon: "🔄" },
  { to: "/regional", label: "Regional Foods", icon: "🗺️" },
  { to: "/plate-builder", label: "Plate Builder", icon: "🍛" },
  { to: "/grocery", label: "Smart Basket", icon: "🛒" },
  { to: "/journey", label: "Zaikora Journey", icon: "🏆" },
  { to: "/health-connect", label: "Lifestyle Sync", icon: "⌚" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">🍲</span>
        <div>
          <div className="brand-name">Zaikora</div>
          <div className="brand-tag">Your smart Indian food companion</div>
        </div>
      </div>
      <ul className="nav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <span className="sidebar-footer-label">Appearance</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
