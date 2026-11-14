

import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import Sidebar from "../components/Sidebar";

import { auth } from "../lib/firebase";

import {

  ambilSimulasi,

  hapusSimulasi,

} from "../lib/firestore";

import "./Riwayat.css";

function rupiah(angka) {

  const nilai = Number(angka) || 0;

  const hasil = `Rp${Math.abs(nilai).toLocaleString("id-ID")}`;

  return nilai < 0 ? `−${hasil}` : hasil;

}

function tanggalIndonesia(tanggal) {

  if (!tanggal) return "-";

  const [tahun, bulan, hari] = String(tanggal)

    .split("-")

    .map(Number);

  const date = new Date(tahun, bulan - 1, hari);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {

    day: "numeric",

    month: "short",

    year: "numeric",

  }).format(date);

}

function pesanErrorFirestore(error) {

  if (

    error?.code === "permission-denied" ||

    error?.code === "firestore/permission-denied"

  ) {

    return "Akses ditolak. Periksa Security Rules Firestore.";

  }

  if (

    error?.code === "unavailable" ||

    error?.code === "firestore/unavailable"

  ) {

    return "Firebase tidak tersedia. Periksa koneksi internet.";

  }

  return error?.message || "Terjadi kesalahan saat mengakses Firestore.";

}

export default function Riwayat() {

  const [pencarian, setPencarian] = useState("");

  const [detail, setDetail] = useState(null);

  const [riwayatTersimpan, setRiwayatTersimpan] = useState([]);

  const [loading, setLoading] = useState(true);

  const [menghapus, setMenghapus] = useState(false);

  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);

  const [error, setError] = useState("");

  const [pesan, setPesan] = useState("");
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  useEffect(() => {

    let aktif = true;

    let versi = 0;

    const unsubscribe = onAuthStateChanged(

      auth,

      async (user) => {

        const versiSekarang = ++versi;

        setLoading(true);

        setError("");

        if (!user) {

          setRiwayatTersimpan([]);

          setLoading(false);

          return;

        }

        try {

          const data = await ambilSimulasi();

          if (!aktif || versiSekarang !== versi) return;

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

          setRiwayatTersimpan(urut);

        } catch (err) {

          if (!aktif || versiSekarang !== versi) return;

          console.error("Gagal mengambil riwayat:", err);

          setError(pesanErrorFirestore(err));

        } finally {

          if (aktif && versiSekarang === versi) {

            setLoading(false);

          }

        }

      },

      (err) => {

        console.error("Gagal memeriksa sesi Firebase:", err);

        if (aktif) {

          setError("Gagal memeriksa sesi pengguna.");

          setLoading(false);

        }

      }

    );

    return () => {

      aktif = false;

      versi++;

      unsubscribe();

    };

  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuTerbuka(false);
        if (!menghapus) {
          setDetail(null);
          setKonfirmasiHapus(false);
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menghapus]);

  const hasilPencarian = useMemo(() => {

    const kata = pencarian.toLowerCase().trim();

    return riwayatTersimpan.filter((item) => {

      const nama = String(item.nama || "").toLowerCase();

      const tanggal = tanggalIndonesia(

        item.tanggal

      ).toLowerCase();

      return nama.includes(kata) || tanggal.includes(kata);

    });

  }, [pencarian, riwayatTersimpan]);

  const handleHapus = async () => {

    if (!detail || menghapus) return;

    const id = detail.id;

    setMenghapus(true);

    setError("");

    setPesan("");

    try {

      await hapusSimulasi(id);

      setRiwayatTersimpan((sebelumnya) =>

        sebelumnya.filter((item) => item.id !== id)

      );

      setDetail(null);

      setKonfirmasiHapus(false);

      setPesan("Simulasi berhasil dihapus dari Firebase.");

    } catch (err) {

      console.error("Gagal menghapus simulasi:", err);

      setError(pesanErrorFirestore(err));

      setKonfirmasiHapus(false);

      setDetail(null);

    } finally {

      setMenghapus(false);

    }

  };

  const bukaDetail = (item) => {

    setDetail(item);

    setKonfirmasiHapus(false);

    setPesan("");

  };

  const tutupDetail = () => {

    if (menghapus) return;

    setDetail(null);

    setKonfirmasiHapus(false);

  };

  return (

    <div className="dashboard-layout riwayat-layout">

      <div className="dashboard-mobile-header">
      <button
        type="button"
        className="dashboard-menu-toggle"
        onClick={() => setMenuTerbuka((prev) => !prev)}
        aria-label={menuTerbuka ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={menuTerbuka}
        aria-controls="riwayat-sidebar"
      >
        {menuTerbuka ? "✕" : "☰"}
      </button>
      <span className="dashboard-mobile-brand">Dompetku</span>
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
      id="riwayat-sidebar"
      className={`dashboard-sidebar-wrapper ${menuTerbuka ? "is-open" : ""}`}
    >
      <Sidebar onNavigate={() => setMenuTerbuka(false)} />
    </div>

      <main className="riwayat-content">

        <header className="riwayat-header">

          <div>

            <h1>Riwayat Simulasi</h1>

            <p>

              Tinjau percobaan sebelumnya dan bandingkan

              keputusan keuangan.

            </p>

          </div>

          <span className="riwayat-badge">

            <span className="riwayat-badge-dot" />

            Simulasi

          </span>

        </header>

        <section className="riwayat-search-card">

          <div className="riwayat-search-field">

            <label htmlFor="cari-simulasi">

              Cari simulasi

            </label>

            <input

id="cari-simulasi"

type="search"

placeholder="Cari nama atau tanggal simulasi..."

value={pencarian}

onChange={(event) =>

                setPencarian(event.target.value)

              }

            />

          </div>

          <Link

to="/simulator"

className="riwayat-new-button"

          >

            + Simulasi Baru

          </Link>

        </section>

        <section className="riwayat-table-card">

          <div className="riwayat-table-heading">

            <h2>Daftar Simulasi</h2>

            <p>

              Hasil simulasi yang tersimpan di Firebase.

            </p>

          </div>

          {error && (

            <p

role="alert"

style={{

                padding: "12px 16px",

                margin: "12px 0",

                borderRadius: "9px",

                background: "#fff1f0",

                color: "#c0392b",

                fontSize: "13px",

              }}

            >

              {error}

            </p>

          )}

          {pesan && (

            <p

role="status"

style={{

                padding: "12px 16px",

                margin: "12px 0",

                borderRadius: "9px",

                background: "#e6f3ee",

                color: "#147d66",

                fontSize: "13px",

              }}

            >

              {pesan}

            </p>

          )}

          <div className="riwayat-table-scroll">

            <table className="riwayat-table">

              <thead>

                <tr>

                  <th>Nama</th>

                  <th>Tanggal</th>

                  <th>Pengeluaran</th>

                  <th>Sisa Uang</th>

                  <th>Aksi</th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td

colSpan={5}

className="riwayat-empty"

                    >

                      Memuat riwayat dari Firebase...

                    </td>

                  </tr>

                ) : (

                  <>

                    {hasilPencarian.map((item) => (

                      <tr key={item.id}>

                        <td className="riwayat-nama">

                          {item.nama}

                        </td>

                        <td>

                          {tanggalIndonesia(item.tanggal)}

                        </td>

                        <td>

                          {rupiah(item.pengeluaran)}

                        </td>

                        <td

className={

                            item.sisa < 0

                              ? "riwayat-negative"

                              : "riwayat-positive"

                          }

                        >

                          {rupiah(item.sisa)}

                        </td>

                        <td>

                          <button

type="button"

className="riwayat-detail-button"

onClick={() => bukaDetail(item)}

                          >

                            Detail →

                          </button>

                        </td>

                      </tr>

                    ))}

                    {hasilPencarian.length === 0 && (

                      <tr>

                        <td

colSpan={5}

className="riwayat-empty"

                        >

                          {error

                            ? "Riwayat belum bisa ditampilkan."

                            : riwayatTersimpan.length === 0

                              ? "Belum ada simulasi tersimpan di Firebase."

                              : "Tidak ada simulasi yang cocok dengan pencarian."}

                        </td>

                      </tr>

                    )}

                  </>

                )}

              </tbody>

            </table>

          </div>

        </section>

        <div className="riwayat-tip">

          Tip: simpan beberapa skenario supaya kamu bisa

          membandingkan mana yang paling hemat.

        </div>

      </main>

      {detail && (

        <div

className="riwayat-modal-overlay"

onClick={tutupDetail}

        >

          <section

className="riwayat-modal"

role="dialog"

aria-modal="true"

aria-labelledby="riwayat-modal-title"

onClick={(event) => event.stopPropagation()}

          >

            <div className="riwayat-modal-heading">

              <h2 id="riwayat-modal-title">

                Detail Simulasi

              </h2>

              <button

type="button"

onClick={tutupDetail}

aria-label="Tutup detail"

disabled={menghapus}

              >

                ×

              </button>

            </div>

            <h3>{detail.nama}</h3>

            <p className="riwayat-modal-date">

              {tanggalIndonesia(detail.tanggal)}

            </p>

            <div className="riwayat-modal-row">

              <span>Uang bulanan</span>

              <strong>

                {rupiah(detail.uangBulanan)}

              </strong>

            </div>

            <div className="riwayat-modal-row">

              <span>Total pengeluaran</span>

              <strong>

                {rupiah(detail.pengeluaran)}

              </strong>

            </div>

            <div className="riwayat-modal-row">

              <span>Sisa uang</span>

              <strong

className={

                  detail.sisa < 0

                    ? "riwayat-negative"

                    : "riwayat-positive"

                }

              >

                {rupiah(detail.sisa)}

              </strong>

            </div>

            {detail.rincian && (

              <>

                <div className="riwayat-modal-row">

                  <span>Biaya kos</span>

                  <strong>

                    {rupiah(detail.rincian.kos)}

                  </strong>

                </div>

                <div className="riwayat-modal-row">

                  <span>Makan per hari</span>

                  <strong>

                    {rupiah(detail.rincian.makanPerHari)}

                  </strong>

                </div>

                <div className="riwayat-modal-row">

                  <span>Transportasi</span>

                  <strong>

                    {rupiah(detail.rincian.transportasi)}

                  </strong>

                </div>

                <div className="riwayat-modal-row">

                  <span>Lain-lain</span>

                  <strong>

                    {rupiah(detail.rincian.lainnya)}

                  </strong>

                </div>

                <div className="riwayat-modal-row">

                  <span>Periode simulasi</span>

                  <strong>

                    {detail.rincian.periode} hari

                  </strong>

                </div>

              </>

            )}

            <div className="riwayat-modal-note">

              {detail.keterangan ||

                "Hasil simulasi keuangan bulanan."}

            </div>

            <button

type="button"

className="riwayat-modal-close"

onClick={tutupDetail}

disabled={menghapus}

            >

              Tutup

            </button>

            {konfirmasiHapus ? (

              <div

style={{

                  marginTop: "12px",

                  padding: "14px",

                  background: "#fff5f5",

                  borderRadius: "10px",

                }}

              >

                <p

style={{

                    fontSize: "13px",

                    color: "#c0392b",

                    margin: "0 0 12px",

                  }}

                >

                  Yakin ingin menghapus simulasi ini

                  dari Firebase?

                </p>

                <div

style={{

                    display: "flex",

                    gap: "8px",

                  }}

                >

                  <button

type="button"

onClick={handleHapus}

disabled={menghapus}

style={{

                      flex: 1,

                      padding: "11px",

                      background: "#c0392b",

                      border: "none",

                      borderRadius: "9px",

                      color: "#fff",

                      fontWeight: 700,

                      cursor: menghapus

                        ? "wait"

                        : "pointer",

                    }}

                  >

                    {menghapus

                      ? "Menghapus..."

                      : "Ya, Hapus"}

                  </button>

                  <button

type="button"

onClick={() =>

                      setKonfirmasiHapus(false)

                    }

disabled={menghapus}

style={{

                      flex: 1,

                      padding: "11px",

                      background: "#fff",

                      border: "1px solid #dce9e2",

                      borderRadius: "9px",

                      color: "#193b32",

                      fontWeight: 700,

                      cursor: "pointer",

                    }}

                  >

                    Batal

                  </button>

                </div>

              </div>

            ) : (

              <button

type="button"

onClick={() =>

                  setKonfirmasiHapus(true)

                }

style={{

                  width: "100%",

                  height: "44px",

                  marginTop: "10px",

                  background: "#fff1f0",

                  color: "#c0392b",

                  border: "1px solid #f3c9c4",

                  borderRadius: "9px",

                  fontWeight: 700,

                  cursor: "pointer",

                }}

              >

                Hapus Simulasi

              </button>

            )}

          </section>

        </div>

      )}

    </div>

  );

}