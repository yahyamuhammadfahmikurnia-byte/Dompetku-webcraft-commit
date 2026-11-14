
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import logoDompetku from "./Logodompet.png";

const menus = [
  { label: "Dashboard", path: "/dashboard", icon: "▦" },
  { label: "Simulator", path: "/simulator", icon: "◫" },
  { label: "Strategi Hemat", path: "/strategi", icon: "◉" },
  { label: "Target Tabungan", path: "/target", icon: "◎" },
  { label: "Riwayat Simulasi", path: "/riwayat", icon: "▤" },
  { label: "Profil", path: "/profil", icon: "◯" }
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img
          src={logoDompetku}
          alt="Logo Dompetku"
          className="sidebar-wallet-logo"
        />
        <span>Dompetku</span>
      </div>

      <nav className="sidebar-navigation">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span
              style={{
                width: 20,
                fontSize: 19,
                textAlign: "center",
                flexShrink: 0
              }}
              aria-hidden="true"
            >
              {menu.icon}
            </span>

            <span>{menu.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-tip">
        <h4>TIPS HEMAT</h4>
        <p>
          Cek anggaran sebelum melakukan pengeluaran
        </p>
      </div>
    </aside>
  );
}
