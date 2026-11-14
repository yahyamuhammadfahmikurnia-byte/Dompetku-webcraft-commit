
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { auth } from "../lib/firebase";
import { ambilSimulasi } from "../lib/firestore";
import "./StrategiHemat.css";

const skenarios = [
  {
    id: "super",
    nama: "Super Hemat",
    biaya: 10000,
  },
  {
    id: "seimbang",
    nama: "Hemat Seimbang",
    biaya: 15000,
  },
  {
    id: "standar",
    nama: "Standar",
    biaya: 25000,
  },
];

const formatRupiah = (angka) => {
  return `Rp${Number(angka || 0).toLocaleString("id-ID")}`;
};

const angkaAman = (nilai, fallback = 0) => {
  const angka = Number(nilai);
  return Number.isFinite(angka) ? angka : fallback;
};

const ambilPeriode = (nilai) => {
  const angka = Number(nilai);

  if (Number.isFinite(angka) && angka > 0) {
    return angka;
  }

  if (typeof nilai === "string") {
    const cocok = nilai.match(/\d+/);

    if (cocok) {
      return Number(cocok[0]);
    }
  }

  return 30;
};

export default function StrategiHemat() {
  const [pilihan, setPilihan] = useState("seimbang");
  const [simulasi, setSimulasi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Navigasi mobile
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  useEffect(() => {
    let aktif = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!aktif) return;

        if (!user) {
          setSimulasi(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");
        setSimulasi(null);

        try {
          const data = await ambilSimulasi();

          if (!aktif || auth.currentUser?.uid !== user.uid) {
            return;
          }

          const dataTerurut = [...data].sort(
            (a, b) =>
              angkaAman(b.dibuatPada) -
              angkaAman(a.dibuatPada)
          );

          setSimulasi(dataTerurut[0] || null);
        } catch (err) {
          if (!aktif || auth.currentUser?.uid !== user.uid) {
            return;
          }

          console.error(
            "Gagal mengambil simulasi:",
            err
          );

          setError(
            "Data simulasi gagal dimuat. Silakan coba refresh halaman."
          );
        } finally {
          if (aktif && auth.currentUser?.uid === user.uid) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      aktif = false;
      unsubscribe();
    };
  }, []);

  // Tutup sidebar saat tombol Escape ditekan
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuTerbuka(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const uangBulanan = angkaAman(
    simulasi?.uangBulanan
  );

  const pengeluaranAwal = angkaAman(
    simulasi?.pengeluaran
  );

  const makanAwal = angkaAman(
    simulasi?.rincian?.makanPerHari
  );

  const periode = ambilPeriode(
    simulasi?.rincian?.periode
  );

  const skenarioAktif =
    skenarios.find((item) => item.id === pilihan) ||
    skenarios[1];

  const hematPerHari =
    makanAwal - skenarioAktif.biaya;

  const totalHemat =
    hematPerHari * periode;

  const sisaAwal =
    uangBulanan - pengeluaranAwal;

  const sisaSetelahHemat =
    sisaAwal + totalHemat;

  const adaDataMakan =
    Number.isFinite(
      Number(simulasi?.rincian?.makanPerHari)
    ) &&
    Number(simulasi?.rincian?.makanPerHari) > 0 &&
    simulasi?.rincian?.hitungMakan !== false;

  const siap = Boolean(simulasi) && adaDataMakan;

  return (
    <div className="dashboard-layout strategi-layout">

      {/* HEADER MOBILE */}
      <div className="dashboard-mobile-header">
        <button
          type="button"
          className="dashboard-menu-toggle"
          onClick={() =>
            setMenuTerbuka((prev) => !prev)
          }
          aria-label={
            menuTerbuka
              ? "Tutup menu navigasi"
              : "Buka menu navigasi"
          }
          aria-expanded={menuTerbuka}
          aria-controls="strategi-sidebar"
        >
          {menuTerbuka ? "✕" : "☰"}
        </button>

        <span className="dashboard-mobile-brand">
          Dompetku
        </span>
      </div>

      {/* OVERLAY MOBILE */}
      {menuTerbuka && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          onClick={() => setMenuTerbuka(false)}
          aria-label="Tutup menu"
        />
      )}

      {/* SIDEBAR */}
      <div
        id="strategi-sidebar"
        className={`dashboard-sidebar-wrapper ${
          menuTerbuka ? "is-open" : ""
        }`}
      >
        <Sidebar
          onNavigate={() => setMenuTerbuka(false)}
        />
      </div>

      {/* KONTEN STRATEGI HEMAT */}
      <main className="strategi-content">

        <header className="strategi-header">
          <div>
            <h1>Strategi Hemat</h1>

            <p>
              Bandingkan skenario satu sama lain untuk efesiensi
            </p>
          </div>

          <span className="strategi-badge">
            <span className="strategi-badge-dot" />
            Simulasi
          </span>
        </header>

        {loading ? (
          <section className="strategi-perbandingan">
            <div className="strategi-section-heading">
              <h2>Memuat simulasi...</h2>

              <p>
                Mengambil data keuanganmu dari Firebase.
              </p>
            </div>
          </section>
        ) : error ? (
          <section className="strategi-perbandingan">
            <div className="strategi-section-heading">
              <h2>Gagal memuat data</h2>
              <p>{error}</p>
            </div>
          </section>
        ) : !siap ? (
          <section className="strategi-perbandingan">
            <div className="strategi-section-heading">
              <h2>Belum ada simulasi makan</h2>

              <p>
                Buat simulasi keuangan terlebih dahulu
                dan aktifkan perhitungan biaya makan
                agar strategi hemat dapat dihitung.
              </p>

              <Link
                to="/simulator"
                style={{
                  display: "inline-block",
                  marginTop: "16px",
                  padding: "12px 20px",
                  background: "#147D66",
                  color: "#FFFFFF",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Buat Simulasi →
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* BANNER */}
            <section className="strategi-banner">
              <div className="strategi-banner-total">
                <span>
                  {totalHemat >= 0
                    ? "Potensi hemat bulan ini"
                    : "Tambahan biaya bulan ini"}
                </span>

                <strong>
                  {formatRupiah(Math.abs(totalHemat))}
                </strong>
              </div>

              <div className="strategi-banner-description">
                <h2>
                  {totalHemat > 0
                    ? "Cukup dengan mengurangi biaya makan"
                    : totalHemat < 0
                      ? "Biaya makan skenario ini lebih tinggi"
                      : "Biaya makan tetap sama"}
                </h2>

                <p>
                  {totalHemat > 0
                    ? "Hemat "
                    : totalHemat < 0
                      ? "Tambahan "
                      : "Selisih "}
                  {formatRupiah(Math.abs(hematPerHari))}
                  /hari selama {periode} hari
                </p>
              </div>
            </section>

            {/* PILIH SKENARIO */}
            <section className="strategi-skenario-section">
              <div className="strategi-section-heading">
                <h2>Pilih skenario makan</h2>

                <p>
                  Setiap kartu dibandingkan dengan
                  pola makan awal{" "}
                  {formatRupiah(makanAwal)} per hari
                  dari simulasi terakhirmu.
                </p>
              </div>

              <div className="strategi-skenario-grid">
                {skenarios.map((skenario) => {
                  const terpilih =
                    pilihan === skenario.id;

                  const hemat =
                    (makanAwal - skenario.biaya) *
                    periode;

                  return (
                    <article
                      key={skenario.id}
                      className={`strategi-skenario-card ${
                        terpilih ? "selected" : ""
                      }`}
                    >
                      <h3>{skenario.nama}</h3>

                      <strong className="strategi-biaya">
                        {formatRupiah(skenario.biaya)}
                      </strong>

                      <span className="strategi-periode">
                        per hari
                      </span>

                      <div className="strategi-hemat-label">
                        {hemat > 0
                          ? `Hemat ${formatRupiah(hemat)}`
                          : hemat < 0
                            ? `Tambahan ${formatRupiah(
                                Math.abs(hemat)
                              )}`
                            : "Tanpa penghematan"}
                      </div>

                      <button
                        type="button"
                        className={`strategi-pilih-button ${
                          terpilih ? "selected" : ""
                        }`}
                        onClick={() =>
                          setPilihan(skenario.id)
                        }
                        aria-pressed={terpilih}
                      >
                        {terpilih
                          ? "✓ Skenario Terpilih"
                          : "Pilih Skenario"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* PERBANDINGAN HASIL */}
            <section className="strategi-perbandingan">
              <div className="strategi-section-heading">
                <h2>Perbandingan hasil</h2>

                <p>
                  Skenario terpilih dibandingkan
                  dengan kondisi awal dari
                  simulasi terakhirmu.
                </p>
              </div>

              <div className="strategi-perbandingan-content">
                <div className="strategi-sisa-awal">
                  Sisa awal:{" "}
                  {formatRupiah(sisaAwal)}
                </div>

                <span
                  className="strategi-arrow"
                  aria-hidden="true"
                >
                  →
                </span>

                <div className="strategi-sisa-akhir">
                  Sisa setelah hemat:{" "}
                  {formatRupiah(sisaSetelahHemat)}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
