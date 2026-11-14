
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../components/Sidebar";
import SummaryCard from "../components/SummaryCard";
import BudgetChart from "../components/BudgetChart";
import SavingAssistant from "../components/SavingAssistant";
import QuickSimulation from "../components/QuickSimulation";
import { auth } from "../lib/firebase";
import { ambilSimulasi } from "../lib/firestore";
import "./Dashboard.css";

function formatRupiah(value) {
  const angka = Number(value) || 0;
  const hasil = `Rp${Math.abs(angka).toLocaleString("id-ID")}`;

  return angka < 0 ? `-${hasil}` : hasil;
}

function cariSimulasiTerbaru(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const urut = [...data].sort((a, b) => {
    const waktuA = Number(a.dibuatPada) || 0;
    const waktuB = Number(b.dibuatPada) || 0;

    if (waktuA !== waktuB) {
      return waktuB - waktuA;
    }

    return String(b.tanggal || "").localeCompare(
      String(a.tanggal || "")
    );
  });

  return urut[0];
}

export default function Dashboard() {
  const [simulasiTerbaru, setSimulasiTerbaru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  const perbaruiData = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setSimulasiTerbaru(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const uid = user.uid;
      const data = await ambilSimulasi();

      if (auth.currentUser?.uid !== uid) {
        return;
      }

      setSimulasiTerbaru(cariSimulasiTerbaru(data));
    } catch (err) {
      if (auth.currentUser?.uid !== user.uid) return;

      console.error("Gagal mengambil data Dashboard:", err);

      setError(
        "Gagal memuat data dari Firebase. Periksa koneksi dan Security Rules."
      );
    } finally {
      if (auth.currentUser?.uid === user.uid) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          perbaruiData();
        } else {
          setSimulasiTerbaru(null);
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [perbaruiData]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setMenuTerbuka(false);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  const uangBulanan = simulasiTerbaru
    ? Number(simulasiTerbaru.uangBulanan) || 0
    : 0;

  const totalPengeluaran = simulasiTerbaru
    ? Number(simulasiTerbaru.pengeluaran) || 0
    : 0;

  const sisaUang = simulasiTerbaru
    ? Number(simulasiTerbaru.sisa) || 0
    : 0;

  return (
    <div className="dashboard-layout">
      <div className="dashboard-mobile-header">
        <button
          type="button"
          className="dashboard-menu-toggle"
          onClick={() => setMenuTerbuka((prev) => !prev)}
          aria-label={
            menuTerbuka ? "Tutup menu navigasi" : "Buka menu navigasi"
          }
          aria-expanded={menuTerbuka}
          aria-controls="dashboard-sidebar"
        >
          {menuTerbuka ? "✕" : "☰"}
        </button>

        <span className="dashboard-mobile-brand">
          Dompetku
        </span>
      </div>

      {menuTerbuka && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          onClick={() => setMenuTerbuka(false)}
          aria-label="Tutup menu"
        />
      )}

      <div
        id="dashboard-sidebar"
        className={`dashboard-sidebar-wrapper ${
          menuTerbuka ? "is-open" : ""
        }`}
      >
        <Sidebar onNavigate={() => setMenuTerbuka(false)} />
      </div>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Halo sobat hemat</h1>
            <p>
              Perhatikan keuanganmu seperti kamu
              memperhatikan dosen kalkulusmu!
            </p>
          </div>

          <span className="simulation-badge">
            Simulasi
          </span>
        </div>

        {error && (
          <p
            role="alert"
            style={{
              padding: "14px 18px",
              marginBottom: "20px",
              background: "#fff1f0",
              color: "#c0392b",
              borderRadius: "10px",
              fontSize: "13px",
            }}
          >
            {error}
          </p>
        )}

        {loading && (
          <p
            role="status"
            style={{
              marginBottom: "16px",
              color: "#147d66",
              fontSize: "13px",
            }}
          >
            Memuat data keuangan dari Firebase...
          </p>
        )}

        {!loading && !error && !simulasiTerbaru && (
          <p
            style={{
              padding: "14px 18px",
              marginBottom: "20px",
              background: "#e6f3ee",
              color: "#147d66",
              borderRadius: "10px",
              fontSize: "13px",
            }}
          >
            Belum ada simulasi tersimpan di Firebase.
            Buka Simulator untuk membuat simulasi pertamamu.
          </p>
        )}

        <div className="summary-grid">
          <SummaryCard
            title="Uang Bulanan"
            amount={formatRupiah(uangBulanan)}
            description="Uang saku dari simulasi terbaru"
            primary
          />

          <SummaryCard
            title="Total Pengeluaran"
            amount={formatRupiah(totalPengeluaran)}
            description="Pengeluaran dari simulasi terbaru"
          />

          <SummaryCard
            title="Sisa Uang"
            amount={formatRupiah(sisaUang)}
            description="Saldo berdasarkan simulasi"
          />
        </div>

        <div className="dashboard-panels">
          <BudgetChart simulasi={simulasiTerbaru} />
          <SavingAssistant simulasi={simulasiTerbaru} />
        </div>

        <QuickSimulation onSimpan={perbaruiData} />
      </main>
    </div>
  );
}
