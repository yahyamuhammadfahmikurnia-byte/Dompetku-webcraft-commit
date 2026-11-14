
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { simpanSimulasi } from "../lib/firestore";
import "./Simulator.css";

const initialData = {
  uangSaku: "1500000",
  kos: "500000",
  makan: "25000",
  transportasi: "100000",
  lainnya: "150000",
  periode: "30",
  hitungMakan: true,
};

function tanggalLokal() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const hari = String(sekarang.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
}

function formatRupiah(value) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

function hitungAnggaran(data) {
  const hari = Number(data.periode);
  const uang = Number(data.uangSaku);
  const kos = Number(data.kos);
  const makan = Number(data.makan);
  const transportasi = Number(data.transportasi);
  const lainnya = Number(data.lainnya);

  const kebutuhanMakan = data.hitungMakan
    ? makan * hari
    : 0;

  const pengeluaranTetap = kos + transportasi + lainnya;
  const totalPengeluaran = pengeluaranTetap + kebutuhanMakan;
  const sisa = uang - totalPengeluaran;

  const batasAman =
    hari > 0
      ? Math.max(
          0,
          Math.floor((uang - pengeluaranTetap) / hari)
        )
      : 0;

  return {
    totalPengeluaran,
    sisa,
    makan,
    batasAman,
    potensiTabungan: Math.max(0, sisa),
  };
}

export default function Simulator() {
  const [form, setForm] = useState({ ...initialData });
  const [hasil, setHasil] = useState(() =>
    hitungAnggaran(initialData)
  );
  const [formTerhitung, setFormTerhitung] = useState({
    ...initialData,
  });

  const [namaSimulasi, setNamaSimulasi] = useState("");
  const [pesanSimpan, setPesanSimpan] = useState("");
  const [tipePesan, setTipePesan] = useState("success");
  const [menyimpan, setMenyimpan] = useState(false);

  // Navigasi mobile
  const [menuTerbuka, setMenuTerbuka] = useState(false);

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

  const perluDihitungUlang =
    JSON.stringify(form) !== JSON.stringify(formTerhitung);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value.replace(/\D/g, ""),
    }));

    setPesanSimpan("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setHasil(hitungAnggaran(form));
    setFormTerhitung({ ...form });
    setPesanSimpan("");
  };

  const handleReset = () => {
    setForm({ ...initialData });
    setFormTerhitung({ ...initialData });
    setHasil(hitungAnggaran(initialData));
    setNamaSimulasi("");
    setPesanSimpan("");
  };

  const handleSimpan = async () => {
    if (menyimpan) return;

    if (perluDihitungUlang) {
      setTipePesan("error");
      setPesanSimpan(
        "Hitung ulang sebelum menyimpan simulasi."
      );
      return;
    }

    const nama =
      namaSimulasi.trim() || "Simulasi Keuangan";

    const dataBaru = {
      nama,
      tanggal: tanggalLokal(),
      dibuatPada: Date.now(),
      sumber: "simulator",
      uangBulanan: Number(formTerhitung.uangSaku),
      pengeluaran: hasil.totalPengeluaran,
      sisa: hasil.sisa,
      keterangan:
        `Simulasi selama ${formTerhitung.periode} hari.`,
      rincian: {
        kos: Number(formTerhitung.kos),
        makanPerHari: Number(formTerhitung.makan),
        transportasi: Number(formTerhitung.transportasi),
        lainnya: Number(formTerhitung.lainnya),
        periode: Number(formTerhitung.periode),
        hitungMakan: formTerhitung.hitungMakan,
      },
    };

    setMenyimpan(true);
    setPesanSimpan("");
    setTipePesan("success");

    try {
      await simpanSimulasi(dataBaru);

      setPesanSimpan(
        `"${nama}" berhasil disimpan ke Firebase Firestore.`
      );

      setNamaSimulasi("");
    } catch (error) {
      console.error(
        "Gagal menyimpan simulasi ke Firebase:",
        error
      );

      setTipePesan("error");

      if (
        error.code === "permission-denied" ||
        error.code === "firestore/permission-denied"
      ) {
        setPesanSimpan(
          "Izin Firestore ditolak. Periksa Security Rules."
        );
      } else if (
        error.code === "unavailable" ||
        error.code === "firestore/unavailable"
      ) {
        setPesanSimpan(
          "Firebase tidak tersedia. Periksa koneksi internet."
        );
      } else {
        setPesanSimpan(
          error.message ||
            "Gagal menyimpan simulasi ke Firebase."
        );
      }
    } finally {
      setMenyimpan(false);
    }
  };

  const fields = [
    { name: "uangSaku", label: "Uang saku bulanan" },
    { name: "kos", label: "Biaya kos" },
    { name: "makan", label: "Makan per hari" },
    { name: "transportasi", label: "Transportasi bulanan" },
    { name: "lainnya", label: "Kebutuhan lainnya" },
  ];

  const kondisi =
    hasil.sisa > 0
      ? "Budget aman"
      : hasil.sisa === 0
        ? "Budget pas"
        : "Budget kurang";

  const saran =
    hasil.sisa > 0
      ? "Masih ada sisa uang. Sisihkan sebagian untuk tabungan."
      : hasil.sisa === 0
        ? "Kurangi pengeluaran untuk mulai menabung."
        : "Pengeluaran melebihi anggaran. Coba kurangi biaya yang tidak mendesak.";

  return (
    <div className="dashboard-layout simulator-layout">
      <div className="dashboard-mobile-header">
        <button
          type="button"
          className="dashboard-menu-toggle"
          onClick={() => setMenuTerbuka((prev) => !prev)}
          aria-label={
            menuTerbuka
              ? "Tutup menu navigasi"
              : "Buka menu navigasi"
          }
          aria-expanded={menuTerbuka}
          aria-controls="simulator-sidebar"
        >
          {menuTerbuka ? "✕" : "☰"}
        </button>

        <span className="dashboard-mobile-brand">
          Dompetku
        </span>
      </div>

      {/* Overlay saat menu terbuka */}
      {menuTerbuka && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          onClick={() => setMenuTerbuka(false)}
          aria-label="Tutup menu"
        />
      )}

      {/* Sidebar Desktop dan Mobile */}
      <div
        id="simulator-sidebar"
        className={`dashboard-sidebar-wrapper ${
          menuTerbuka ? "is-open" : ""
        }`}
      >
        <Sidebar
          onNavigate={() => setMenuTerbuka(false)}
        />
      </div>

      <main className="simulator-content">
        <header className="simulator-header">
          <div>
            <h1>Simulator Keuangan</h1>
            <p>
             Isi kebutuhanmu untuk melihat anggaranmu.
            </p>
          </div>

          <span className="simulator-badge">
            <span className="simulator-badge-dot" />
            Simulasi
          </span>
        </header>

        <div className="simulator-grid">
          <section className="simulator-card simulator-form-card">
            <div className="simulator-card-heading">
              <h2>Informasi anggaran</h2>
              <p>
                Semua nilai menggunakan rupiah
                dan hanya untuk simulasi.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="simulator-fields-grid">
                {fields.map((field) => (
                  <div
                    className="simulator-field"
                    key={field.name}
                  >
                    <label htmlFor={`sim-${field.name}`}>
                      {field.label}
                    </label>

                    <input
                      id={`sim-${field.name}`}
                      type="text"
                      inputMode="numeric"
                      value={formatRupiah(form[field.name])}
                      onChange={(event) =>
                        updateField(
                          field.name,
                          event.target.value
                        )
                      }
                      autoComplete="off"
                    />
                  </div>
                ))}

                <div className="simulator-field">
                  <label htmlFor="sim-periode">
                    Periode simulasi
                  </label>

                  <select
                    id="sim-periode"
                    value={form.periode}
                    onChange={(event) => {
                      setForm((prev) => ({
                        ...prev,
                        periode: event.target.value,
                      }));

                      setPesanSimpan("");
                    }}
                  >
                    <option value="7">7 hari</option>
                    <option value="14">14 hari</option>
                    <option value="30">30 hari</option>
                    <option value="31">31 hari</option>
                  </select>
                </div>
              </div>

              <div className="simulator-option-box">
                <label className="simulator-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.hitungMakan}
                    onChange={(event) => {
                      setForm((prev) => ({
                        ...prev,
                        hitungMakan: event.target.checked,
                      }));

                      setPesanSimpan("");
                    }}
                  />

                  <span>
                    Hitung kebutuhan makan selama periode simulasi
                  </span>
                </label>

                <p>
                  Hasil akan dibandingkan dengan uang
                  saku bulanan.
                </p>
              </div>

              <div className="simulator-actions">
                <button
                  type="submit"
                  className="simulator-submit"
                  disabled={menyimpan}
                >
                  Hitung Simulasi →
                </button>

                <button
                  type="button"
                  className="simulator-reset"
                  onClick={handleReset}
                  disabled={menyimpan}
                >
                  Reset
                </button>
              </div>
            </form>
          </section>

          <section className="simulator-card simulator-result-card">
            <div className="simulator-card-heading">
              <h2>Hasil simulasi</h2>
              <p>Pratinjau otomatis</p>
            </div>

            <div className="simulator-balance">
              <span>Sisa uang</span>

              <strong>
                {hasil.sisa < 0 ? "-" : ""}
                {formatRupiah(Math.abs(hasil.sisa))}
              </strong>

              <div className="simulator-balance-status">
                <span className="simulator-status-dot" />
                {kondisi}
              </div>
            </div>

            <div className="simulator-result-details">
              <div className="simulator-result-row">
                <span>Total pengeluaran</span>
                <strong>
                  {formatRupiah(hasil.totalPengeluaran)}
                </strong>
              </div>

              <div className="simulator-result-row">
                <span>Anggaran makan / hari</span>
                <strong>
                  {formatRupiah(hasil.makan)}
                </strong>
              </div>

              <div className="simulator-result-row">
                <span>Batas aman makan / hari</span>
                <strong>
                  {formatRupiah(hasil.batasAman)}
                </strong>
              </div>

              <div className="simulator-result-row">
                <span>Potensi tabungan</span>
                <strong>
                  {formatRupiah(hasil.potensiTabungan)}
                </strong>
              </div>
            </div>

            <div className="simulator-advice">
              <h3>Saran:</h3>
              <p>{saran}</p>
            </div>

            <div className="simulator-save-area">
              <label htmlFor="nama-simulasi">
                Nama simulasi
              </label>

              <input
                id="nama-simulasi"
                type="text"
                placeholder="Contoh: Hemat Makan"
                value={namaSimulasi}
                maxLength={60}
                disabled={menyimpan}
                onChange={(event) => {
                  setNamaSimulasi(event.target.value);
                  setPesanSimpan("");
                }}
              />

              <button
                type="button"
                className="simulator-save-button"
                onClick={handleSimpan}
                disabled={perluDihitungUlang || menyimpan}
              >
                {menyimpan
                  ? "Menyimpan ke Firebase..."
                  : "Simpan Simulasi"}
              </button>

              {perluDihitungUlang && (
                <p className="simulator-save-hint">
                  Anggaran berubah. Klik Hitung Simulasi
                  terlebih dahulu.
                </p>
              )}

              {pesanSimpan && (
                <p
                  className="simulator-save-message"
                  role="status"
                  style={{
                    color:
                      tipePesan === "error"
                        ? "#c0392b"
                        : "#147d66",
                  }}
                >
                  {pesanSimpan}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
