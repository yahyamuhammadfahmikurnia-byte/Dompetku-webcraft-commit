
import { Link } from "react-router-dom";
import "./SavingAssistant.css";

function formatRupiah(value) {
  return `Rp${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
}

export default function SavingAssistant({ simulasi = null }) {
  const rincian = simulasi?.rincian;

  const biayaMakan = rincian
    ? Number(rincian.makanPerHari) || 0
    : 25000;

  const periode = rincian
    ? Number(rincian.periode) || 30
    : 30;

  const hitungMakan = rincian
    ? rincian.hitungMakan
    : true;

  const targetMakan = Math.floor(biayaMakan * 0.8 / 1000) * 1000;

  const penghematanHarian = Math.max(
    0,
    biayaMakan - targetMakan
  );

  const penghematanTotal = penghematanHarian * periode;

  const sisaUang = simulasi
    ? Number(simulasi.sisa) || 0
    : 0;

  let insight;

  if (!simulasi) {
    insight = (
      <>
        Jika biaya makan turun dari
        <strong> Rp25.000 </strong>
        menjadi
        <strong> Rp20.000 </strong>
        per hari, kamu bisa menghemat
        <strong> Rp150.000 </strong>
        dalam 30 hari.
      </>
    );
  } else if (!hitungMakan) {
    insight = (
      <>
        Kebutuhan makan belum dimasukkan dalam perhitungan.
        Aktifkan opsi
        <strong> Hitung kebutuhan makan </strong>
        di Simulator agar rekomendasi lebih akurat.
      </>
    );
  } else if (biayaMakan <= 0) {
    insight = (
      <>
        Tambahkan anggaran makan harian di Simulator
        agar Dompetku bisa menghitung potensi penghematanmu.
      </>
    );
  } else if (sisaUang < 0) {
    insight = (
      <>
        Anggaranmu saat ini mengalami kekurangan sebesar
        <strong> {formatRupiah(Math.abs(sisaUang))}</strong>.
        Jika biaya makan turun dari
        <strong> {formatRupiah(biayaMakan)} </strong>
        menjadi
        <strong> {formatRupiah(targetMakan)}</strong>
        per hari, kamu berpotensi menghemat
        <strong> {formatRupiah(penghematanTotal)}</strong>
        selama {periode} hari.
      </>
    );
  } else {
    insight = (
      <>
        Jika biaya makan turun dari
        <strong> {formatRupiah(biayaMakan)} </strong>
        menjadi
        <strong> {formatRupiah(targetMakan)} </strong>
        per hari, kamu berpotensi menghemat
        <strong> {formatRupiah(penghematanTotal)} </strong>
        selama {periode} hari.
        {sisaUang > 0 && (
          <>
            {" "}Sisa anggaranmu saat ini
            <strong> {formatRupiah(sisaUang)}</strong>.
          </>
        )}
      </>
    );
  }

  return (
    <section className="saving-assistant">
      <div className="saving-header">
        <h3>Asisten Hemat</h3>
        <p className="saving-description">
          Rekomendasi berdasarkan budget.
        </p>
      </div>

      <div className="saving-insight">
        <h4>
          <span
            className="saving-insight-icon"
            aria-hidden="true"
          >
            ✦
          </span>
          Insight hari ini
        </h4>

        <p>{insight}</p>
      </div>

      <Link to="/strategi" className="saving-button">
        Lihat Strategi Hemat
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
