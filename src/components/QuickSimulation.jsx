
import { useState } from "react";
import { Link } from "react-router-dom";
import { simpanSimulasi } from "../lib/firestore";
import "./QuickSimulation.css";

function formatRupiah(value) {
  const angka = Number(value) || 0;
  return `Rp${Math.abs(angka).toLocaleString("id-ID")}`;
}

function tanggalLokal() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const hari = String(sekarang.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
}

export default function QuickSimulation({ onSimpan }) {
  const [uangSaku, setUangSaku] = useState("1500000");
  const [biayaMakan, setBiayaMakan] = useState("25000");
  const [hasil, setHasil] = useState(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [sudahDisimpan, setSudahDisimpan] = useState(false);
  const [pesan, setPesan] = useState("");
  const [pesanError, setPesanError] = useState(false);

  const resetHasil = () => {
    setHasil(null);
    setPesan("");
    setPesanError(false);
    setSudahDisimpan(false);
  };

  const handleUangSaku = (event) => {
    setUangSaku(event.target.value.replace(/\D/g, ""));
    resetHasil();
  };

  const handleBiayaMakan = (event) => {
    setBiayaMakan(event.target.value.replace(/\D/g, ""));
    resetHasil();
  };

  const handleSimulasi = () => {
    const uang = Number(uangSaku) || 0;
    const makanPerHari = Number(biayaMakan) || 0;
    const totalMakan = makanPerHari * 30;
    const sisa = uang - totalMakan;

    setHasil({
      uang,
      makanPerHari,
      totalMakan,
      sisa,
    });

    setPesan("");
    setPesanError(false);
    setSudahDisimpan(false);
  };

  const handleSimpan = async () => {
    if (!hasil || menyimpan || sudahDisimpan) return;

    const dataBaru = {
      nama: "Simulasi Cepat",
      tanggal: tanggalLokal(),
      dibuatPada: Date.now(),
      sumber: "simulasi_cepat",
      uangBulanan: hasil.uang,
      pengeluaran: hasil.totalMakan,
      sisa: hasil.sisa,
      keterangan:
        "Simulasi cepat selama 30 hari. Hanya menghitung biaya makan.",
      rincian: {
        kos: 0,
        makanPerHari: hasil.makanPerHari,
        transportasi: 0,
        lainnya: 0,
        periode: 30,
        hitungMakan: true,
      },
    };

    setMenyimpan(true);
    setPesan("");
    setPesanError(false);

    try {
      await simpanSimulasi(dataBaru);

      setSudahDisimpan(true);
      setPesan(
        "Simulasi berhasil disimpan ke Firebase Firestore."
      );

      if (typeof onSimpan === "function") {
        try {
          await onSimpan();
        } catch (error) {
          console.error(
            "Gagal memperbarui tampilan Dashboard:",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "Gagal menyimpan Simulasi Cepat:",
        error
      );

      setPesanError(true);

      if (
        error.code === "permission-denied" ||
        error.code === "firestore/permission-denied"
      ) {
        setPesan(
          "Izin Firestore ditolak. Periksa Security Rules."
        );
      } else if (
        error.code === "unavailable" ||
        error.code === "firestore/unavailable"
      ) {
        setPesan(
          "Firebase tidak tersedia. Periksa koneksi internet."
        );
      } else {
        setPesan(
          error.message ||
            "Gagal menyimpan simulasi. Coba lagi."
        );
      }
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <section className="quick-simulation">
      <h3>Simulasi Cepat</h3>

      <p>
        Coba ubah pemasukan dan anggaran makanmu.
      </p>

      <div className="quick-form">
        <div className="quick-field">
          <label htmlFor="uang-saku">
            Uang saku bulanan
          </label>

          <input
            id="uang-saku"
            type="text"
            inputMode="numeric"
            value={formatRupiah(uangSaku)}
            onChange={handleUangSaku}
            placeholder="Rp0"
            disabled={menyimpan}
          />
        </div>

        <div className="quick-field">
          <label htmlFor="biaya-makan">
            Biaya makan per hari
          </label>

          <input
            id="biaya-makan"
            type="text"
            inputMode="numeric"
            value={formatRupiah(biayaMakan)}
            onChange={handleBiayaMakan}
            placeholder="Rp0"
            disabled={menyimpan}
          />
        </div>

        <button
          type="button"
          className="quick-button"
          onClick={handleSimulasi}
          disabled={menyimpan}
        >
          Mulai Simulasi →
        </button>
      </div>

      {hasil && (
        <div
          role="status"
          style={{
            marginTop: "20px",
            padding: "16px 20px",
            background: "#e6f3ee",
            borderRadius: "10px",
            color: "#193b32",
            fontSize: "14px",
            lineHeight: 1.8,
          }}
        >
          <strong>Hasil Simulasi 30 Hari</strong>

          <div>
            Uang saku: {formatRupiah(hasil.uang)}
          </div>

          <div>
            Total biaya makan: {formatRupiah(hasil.totalMakan)}
          </div>

          <div>
            Sisa uang:{" "}
            <strong>
              {hasil.sisa < 0 ? "-" : ""}
              {formatRupiah(hasil.sisa)}
            </strong>
          </div>

          {hasil.sisa < 0 && (
            <p
              style={{
                color: "#b45309",
                margin: "8px 0 0",
              }}
            >
              Pengeluaran makan melebihi uang saku bulanan.
            </p>
          )}

          <button
            type="button"
            onClick={handleSimpan}
            disabled={menyimpan || sudahDisimpan}
            style={{
              marginTop: "14px",
              padding: "11px 18px",
              border: "none",
              borderRadius: "9px",
              background: sudahDisimpan
                ? "#7aa99b"
                : "#147d66",
              color: "#ffffff",
              fontWeight: "700",
              cursor:
                menyimpan || sudahDisimpan
                  ? "not-allowed"
                  : "pointer",
              opacity: menyimpan ? 0.65 : 1,
            }}
          >
            {menyimpan
              ? "Menyimpan ke Firebase..."
              : sudahDisimpan
                ? "Sudah Disimpan ✓"
                : "Simpan ke Riwayat"}
          </button>

          {pesan && (
            <p
              role="status"
              style={{
                margin: "10px 0 0",
                color: pesanError
                  ? "#c0392b"
                  : "#147d66",
                fontSize: "13px",
              }}
            >
              {pesan}
            </p>
          )}

          {sudahDisimpan && (
            <Link
              to="/riwayat"
              style={{
                display: "inline-block",
                marginTop: "8px",
                color: "#147d66",
                fontWeight: "700",
              }}
            >
              Lihat Riwayat →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
