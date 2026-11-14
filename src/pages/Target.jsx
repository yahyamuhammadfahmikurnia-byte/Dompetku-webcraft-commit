

import { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";

import Sidebar from "../components/Sidebar";

import { auth } from "../lib/firebase";

import {

  ambilTarget,

  simpanTarget,

  perbaruiTarget,

  hapusTarget as hapusTargetFirebase,

} from "../lib/firestore";

import "./Target.css";

const dataAwal = {

  nama: "Beli laptop untuk kuliah",

  jumlah: "5000000",

  bulanan: "250000",

  awal: "500000",

};

const tips = [

  "Sisihkan uang di awal bulan.",

  "Kurangi belanja impulsif.",

  "Pantau progres setiap bulan.",

  "Naikkan target bila memungkinkan.",

];

const inputNominal = [

  { name: "jumlah", label: "Jumlah target" },

  { name: "bulanan", label: "Tabungan setiap bulan" },

  { name: "awal", label: "Tabungan awal" },

];

function formatRupiah(value) {

  const angka = Number(value) || 0;

  return `Rp${angka.toLocaleString("id-ID")}`;

}

function hitungTarget(data) {

  const target = Math.max(0, Number(data.jumlah) || 0);

  const bulanan = Math.max(0, Number(data.bulanan) || 0);

  const awal = Math.max(0, Number(data.awal) || 0);

  const kekurangan = Math.max(0, target - awal);

  const progres =

    target > 0 ? Math.min(100, (awal / target) * 100) : 0;

  const bulan =

    kekurangan === 0

      ? 0

      : bulanan > 0

        ? Math.ceil(kekurangan / bulanan)

        : null;

  return {

    progres,

    bulan,

    kekurangan,

    terkumpul: awal,

    target,
  };

}

function urutkanTarget(data) {

  return [...data].sort(

    (a, b) =>

      (Number(b.dibuatPada) || 0) -

      (Number(a.dibuatPada) || 0)
  );

}

function pesanErrorFirebase(error) {

  console.error("Firebase Target Tabungan:", error);

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

    return "Firestore tidak tersedia. Periksa koneksi internet.";
  }

  return error?.message || "Terjadi kesalahan pada Firebase.";

}

export default function Target() {

  const [form, setForm] = useState({ ...dataAwal });

  const [formTerhitung, setFormTerhitung] = useState({

    ...dataAwal,
  });

  const [hasil, setHasil] = useState(() =>

    hitungTarget(dataAwal)
  );

  const [targetTersimpan, setTargetTersimpan] = useState([]);

  const [targetAktif, setTargetAktif] = useState(null);

  const [tambahan, setTambahan] = useState("");

  const [konfirmasiHapus, setKonfirmasiHapus] = useState(null);

  const [loading, setLoading] = useState(true);

  const [proses, setProses] = useState("");

  const [pesan, setPesan] = useState("");

  const [pesanError, setPesanError] = useState(false);
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  const sedangProses = proses !== "";

  const perluHitungUlang =

    JSON.stringify(form) !== JSON.stringify(formTerhitung);

  useEffect(() => {

    let aktif = true;

    let versi = 0;

    const unsubscribe = onAuthStateChanged(

      auth,

      async (user) => {

        const versiSekarang = ++versi;

        setLoading(true);

        setPesan("");

        if (!user) {

          setTargetTersimpan([]);

          setTargetAktif(null);

          setLoading(false);

          return;
        }

        try {

          const data = await ambilTarget();

          if (!aktif || versiSekarang !== versi) return;

          setTargetTersimpan(urutkanTarget(data));
        } catch (error) {

          if (!aktif || versiSekarang !== versi) return;

          setPesan(pesanErrorFirebase(error));

          setPesanError(true);
        } finally {

          if (aktif && versiSekarang === versi) {

            setLoading(false);
          }
        }
      },

      (error) => {

        if (!aktif) return;

        setPesan(pesanErrorFirebase(error));

        setPesanError(true);

        setLoading(false);
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
      if (event.key === "Escape") setMenuTerbuka(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  function tampilkanPesan(teks, error = false) {

    setPesan(teks);

    setPesanError(error);
  }

  function ubahInput(nama, nilai) {

    if (sedangProses) return;

    setForm((sebelumnya) => ({

      ...sebelumnya,

      [nama]:

        nama === "nama"

          ? nilai

          : nilai.replace(/\D/g, ""),
    }));

    setTargetAktif(null);

    setKonfirmasiHapus(null);

    tampilkanPesan("");
  }

  function handleSubmit(event) {

    event.preventDefault();

    if (!form.nama.trim()) {

      tampilkanPesan("Nama tujuan wajib diisi.", true);

      return;
    }

    if (Number(form.jumlah) <= 0) {

      tampilkanPesan(

        "Jumlah target harus lebih dari Rp0.",

        true
      );

      return;
    }

    const data = {

      ...form,

      nama: form.nama.trim(),
    };

    setForm(data);

    setFormTerhitung(data);

    setHasil(hitungTarget(data));

    setTargetAktif(null);

    tampilkanPesan(

      "Perhitungan selesai. Kamu bisa menyimpan target ini."
    );
  }

  async function handleSimpan() {

    if (proses || loading) return;

    if (targetAktif) {

      setPesan("Target ini sudah tersimpan di Firebase.");

      setPesanError(false);

      return;
    }

    if (!auth.currentUser) {

      setPesan("Silakan login terlebih dahulu.");

      setPesanError(true);

      return;
    }

    const dataBaru = {

      nama: form.nama.trim(),

      jumlah: Number(form.jumlah),

      bulanan: Number(form.bulanan) || 0,

      awal: Number(form.awal) || 0,

      tanggal: new Date().toISOString(),

      dibuatPada: Date.now(),
    };

    if (!dataBaru.nama || dataBaru.jumlah <= 0) {

      setPesan("Isi nama dan jumlah target dengan benar.");

      setPesanError(true);

      return;
    }

    setProses("simpan");

    setPesan("");

    setPesanError(false);

    try {

      const id = await simpanTarget(dataBaru);

      const targetBaru = {

        ...dataBaru,

        id,
      };

      setTargetTersimpan((prev) =>

        urutkanTarget([targetBaru, ...prev])
      );

      const formBaru = {

        nama: dataBaru.nama,

        jumlah: String(dataBaru.jumlah),

        bulanan: String(dataBaru.bulanan),

        awal: String(dataBaru.awal),
      };

      setForm(formBaru);

      setFormTerhitung(formBaru);

      setHasil(hitungTarget(formBaru));

      setTargetAktif(id);

      setTambahan("");

      setPesan(`Target "${dataBaru.nama}" berhasil disimpan.`);

      setPesanError(false);
    } catch (error) {

      console.error("Gagal menyimpan target:", error);

      setPesan(

        `Gagal menyimpan target: ${error.code || error.message}`
      );

      setPesanError(true);
    } finally {

      setProses("");
    }
  }

  function pilihTarget(item) {

    if (sedangProses) return;

    const data = {

      nama: item.nama,

      jumlah: String(item.jumlah),

      bulanan: String(item.bulanan),

      awal: String(item.awal),
    };

    setForm(data);

    setFormTerhitung(data);

    setHasil(hitungTarget(data));

    setTargetAktif(item.id);

    setTambahan("");

    setKonfirmasiHapus(null);

    tampilkanPesan("");
  }

  async function tambahTabungan() {

    if (sedangProses) return;

    if (!targetAktif) {

      tampilkanPesan(

        "Pilih target tersimpan terlebih dahulu.",

        true
      );

      return;
    }

    const nominal = Number(tambahan);

    if (!Number.isFinite(nominal) || nominal <= 0) {

      tampilkanPesan(

        "Masukkan nominal tambahan yang valid.",

        true
      );

      return;
    }

    const targetDipilih = targetTersimpan.find(

      (item) => item.id === targetAktif
    );

    if (!targetDipilih) {

      tampilkanPesan("Target tidak ditemukan.", true);

      return;
    }

    setProses("tambah");

    tampilkanPesan("");

    try {

      const { increment } = await import("firebase/firestore");

      await perbaruiTarget(targetAktif, {

        awal: increment(nominal),
      });

      const dataTerbaru = await ambilTarget();

      const dataUrut = urutkanTarget(dataTerbaru);

      setTargetTersimpan(dataUrut);

      const targetBaru = dataUrut.find(

        (item) => item.id === targetAktif
      );

      if (targetBaru) {

        const formBaru = {

          nama: targetBaru.nama,

          jumlah: String(targetBaru.jumlah),

          bulanan: String(targetBaru.bulanan),

          awal: String(targetBaru.awal),
        };

        setForm(formBaru);

        setFormTerhitung(formBaru);

        setHasil(hitungTarget(formBaru));
      }

      setTambahan("");

      tampilkanPesan(

        `${formatRupiah(nominal)} berhasil ditambahkan ke tabungan.`
      );
    } catch (error) {

      tampilkanPesan(

        `Gagal memperbarui tabungan: ${pesanErrorFirebase(error)}`,

        true
      );
    } finally {

      setProses("");
    }
  }

  async function hapusTarget(id) {

    if (sedangProses) return;

    setProses(`hapus-${id}`);

    tampilkanPesan("");

    try {

      await hapusTargetFirebase(id);

      setTargetTersimpan((sebelumnya) =>

        sebelumnya.filter((item) => item.id !== id)
      );

      if (targetAktif === id) {

        setTargetAktif(null);

        setForm({ ...dataAwal });

        setFormTerhitung({ ...dataAwal });

        setHasil(hitungTarget(dataAwal));
      }

      setTambahan("");

      setKonfirmasiHapus(null);

      tampilkanPesan(

        "Target berhasil dihapus dari Firebase."
      );
    } catch (error) {

      tampilkanPesan(

        `Gagal menghapus target: ${pesanErrorFirebase(error)}`,

        true
      );
    } finally {

      setProses("");
    }
  }

  return (

    <div className="dashboard-layout target-layout">

      {/* Header mobile */}
    <div className="dashboard-mobile-header">
      <button
        type="button"
        className="dashboard-menu-toggle"
        onClick={() => setMenuTerbuka((prev) => !prev)}
        aria-label={menuTerbuka ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={menuTerbuka}
        aria-controls="target-sidebar"
      >
        {menuTerbuka ? "✕" : "☰"}
      </button>
      <span className="dashboard-mobile-brand">Dompetku</span>
    </div>

    {/* Overlay untuk menutup sidebar */}
    {menuTerbuka && (
      <button
        type="button"
        className="dashboard-sidebar-overlay"
        onClick={() => setMenuTerbuka(false)}
        aria-label="Tutup menu"
      />
    )}

    {/* Sidebar desktop dan mobile */}
    <div
      id="target-sidebar"
      className={`dashboard-sidebar-wrapper ${menuTerbuka ? "is-open" : ""}`}
    >
      <Sidebar onNavigate={() => setMenuTerbuka(false)} />
    </div>

      <main className="target-content">

        <header className="target-header">

          <div>

            <h1>Target Tabungan</h1>

            <p>

              Buat rencana menabung untuk tujuan impianmu.

            </p>

          </div>

          <span className="target-badge">

            <span className="target-badge-dot" />

            Simulasi

          </span>

        </header>

        <div className="target-grid">

          <section className="target-card target-form-card">

            <div className="target-card-heading">

              <h2>Buat target baru</h2>

              <p>

                Tentukan berapa uang yang ingin kamu kumpulkan.

              </p>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="target-field">

                <label htmlFor="target-nama">

                  Nama tujuan

                </label>

                <input

id="target-nama"

type="text"

value={form.nama}

disabled={sedangProses}

onChange={(event) =>

                    ubahInput("nama", event.target.value)
                  }

placeholder="Masukkan nama tujuan"

required

                />

              </div>

              {inputNominal.map((item) => (

                <div

className="target-field"

key={item.name}

                >

                  <label htmlFor={`target-${item.name}`}>

                    {item.label}

                  </label>

                  <input

id={`target-${item.name}`}

type="text"

inputMode="numeric"

value={formatRupiah(form[item.name])}

disabled={sedangProses}

onChange={(event) =>

                      ubahInput(

                        item.name,

                        event.target.value
                      )
                    }

autoComplete="off"

                  />

                </div>
              ))}

              <button

type="submit"

className="target-submit"

disabled={sedangProses}

              >

                Hitung Target Tabungan →

              </button>

            </form>

            <button

type="button"

onClick={handleSimpan}

disabled={sedangProses || loading || Boolean(targetAktif)}

className="target-submit"

style={{

                width: "100%",

                marginTop: "12px",

                background: "#e6f3ee",

                color: "#147d66",

                border: "1px solid #147d66",

                opacity:

                  sedangProses || loading || targetAktif ? 0.5 : 1,

                cursor:

                  sedangProses || loading || targetAktif

                    ? "not-allowed"

                    : "pointer",
              }}

            >

              {proses === "simpan"

                ? "Menyimpan..."

                : targetAktif

                  ? "Target Sudah Tersimpan ✓"

                  : "Simpan Target Tabungan"}

            </button>

            {pesan && (

              <p

role="status"

style={{

                  marginTop: "12px",

                  fontSize: "13px",

                  color: pesanError

                    ? "#c0392b"

                    : "#147d66",

                  lineHeight: 1.6,
                }}

              >

                {pesan}

              </p>
            )}

          </section>

          <div className="target-right-column">

            <section className="target-card target-estimate-card">

              <div className="target-card-heading">

                <h2>Estimasi pencapaian</h2>

                <p>Dihitung tanpa bunga</p>

              </div>

              <div

className="target-time-box"

role="status"

              >

                <span>Waktu yang dibutuhkan</span>

                <strong>

                  {hasil.bulan === null

                    ? "Belum dapat dihitung"

                    : `${hasil.bulan} bulan`}

                </strong>

              </div>

              <div className="target-progress-description">

                {Math.round(hasil.progres)}% dari target

                sudah terkumpul

              </div>

              <div

className="target-progress-track"

role="progressbar"

aria-label="Progres tabungan"

aria-valuemin={0}

aria-valuemax={100}

aria-valuenow={Math.round(hasil.progres)}

              >

                <div

className="target-progress-fill"

style={{

                    width: `${hasil.progres}%`,
                  }}

                />

              </div>

              <div

style={{

                  display: "flex",

                  justifyContent: "space-between",

                  gap: "12px",

                  marginTop: "14px",

                  fontSize: "13px",

                  color: "#193b32",
                }}

              >

                <span>

                  Terkumpul:{" "}

                  <strong>

                    {formatRupiah(hasil.terkumpul)}

                  </strong>

                </span>

                <span>

                  Target:{" "}

                  <strong>

                    {formatRupiah(hasil.target)}

                  </strong>

                </span>

              </div>

              <p

style={{

                  marginTop: "12px",

                  fontSize: "13px",

                  color: "#81918a",
                }}

              >

                Sisa yang perlu dikumpulkan:{" "}

                <strong>

                  {formatRupiah(hasil.kekurangan)}

                </strong>

              </p>

            </section>

            <section className="target-card target-tips-card">

              <div className="target-card-heading">

                <h2>Tips menabung</h2>

                <p>Langkah kecil, hasilnya terasa.</p>

              </div>

              <div className="target-tips-list">

                {tips.map((tip) => (

                  <div

className="target-tip-item"

key={tip}

                  >

                    <span

className="target-tip-check"

aria-hidden="true"

                    >

                      ✓

                    </span>

                    <span>{tip}</span>

                  </div>
                ))}

              </div>

            </section>

          </div>

        </div>

        <section

className="target-card"

style={{ marginTop: "24px" }}

        >

          <div className="target-card-heading">

            <h2>Target Tabungan Tersimpan</h2>

            <p>

              Pilih target untuk melihat progres dan

              menambahkan tabungan.

            </p>

          </div>

          {loading ? (

            <p

style={{

                marginTop: "18px",

                color: "#81918a",

                fontSize: "14px",
              }}

            >

              Memuat target dari Firebase...

            </p>
          ) : targetTersimpan.length === 0 ? (

            <p

style={{

                color: "#81918a",

                fontSize: "14px",

                marginTop: "18px",
              }}

            >

              Belum ada target tersimpan di Firebase.

              Buat dan simpan target pertamamu.

            </p>
          ) : (

            <div

style={{

                display: "grid",

                gap: "12px",

                marginTop: "18px",
              }}

            >

              {targetTersimpan.map((item) => {

                const info = hitungTarget(item);

                const aktif = targetAktif === item.id;

                return (

                  <div

key={item.id}

style={{

                      padding: "16px",

                      border: aktif

                        ? "1px solid #147d66"

                        : "1px solid #e1ebe5",

                      borderRadius: "12px",

                      background: aktif

                        ? "#e6f3ee"

                        : "#ffffff",
                    }}

                  >

                    <div

style={{

                        display: "flex",

                        justifyContent: "space-between",

                        alignItems: "center",

                        flexWrap: "wrap",

                        gap: "12px",
                      }}

                    >

                      <div>

                        <strong

style={{

                            color: "#193b32",

                            fontSize: "15px",
                          }}

                        >

                          {item.nama}

                        </strong>

                        <p

style={{

                            margin: "6px 0 0",

                            color: "#81918a",

                            fontSize: "13px",
                          }}

                        >

                          {formatRupiah(item.awal)}

                          {" / "}

                          {formatRupiah(item.jumlah)}

                          {" — "}

                          {Math.round(info.progres)}%

                        </p>

                      </div>

                      <div

style={{

                          display: "flex",

                          gap: "8px",

                          flexWrap: "wrap",
                        }}

                      >

                        <button

type="button"

onClick={() => pilihTarget(item)}

disabled={sedangProses}

style={{

                            padding: "9px 14px",

                            borderRadius: "8px",

                            border: "none",

                            background: "#147d66",

                            color: "#ffffff",

                            fontWeight: "700",

                            cursor: "pointer",
                          }}

                        >

                          Pilih

                        </button>

                        {konfirmasiHapus === item.id ? (

                          <>

                            <button

type="button"

onClick={() =>

                                hapusTarget(item.id)
                              }

disabled={sedangProses}

style={{

                                padding: "9px 12px",

                                borderRadius: "8px",

                                border: "none",

                                background: "#c0392b",

                                color: "#fff",

                                fontWeight: "700",

                                cursor: "pointer",
                              }}

                            >

                              {proses === `hapus-${item.id}`

                                ? "Menghapus..."

                                : "Ya, Hapus"}

                            </button>

                            <button

type="button"

onClick={() =>

                                setKonfirmasiHapus(null)
                              }

disabled={sedangProses}

style={{

                                padding: "9px 12px",

                                borderRadius: "8px",

                                border: "1px solid #dce9e2",

                                background: "#fff",

                                color: "#193b32",

                                cursor: "pointer",
                              }}

                            >

                              Batal

                            </button>

                          </>
                        ) : (

                          <button

type="button"

onClick={() =>

                              setKonfirmasiHapus(item.id)
                            }

disabled={sedangProses}

style={{

                              padding: "9px 14px",

                              borderRadius: "8px",

                              border: "1px solid #f1cccc",

                              background: "#fff5f5",

                              color: "#c0392b",

                              fontWeight: "700",

                              cursor: "pointer",
                            }}

                          >

                            Hapus

                          </button>
                        )}

                      </div>

                    </div>

                    <div

style={{

                        width: "100%",

                        height: "8px",

                        marginTop: "14px",

                        background: "#e0e9e4",

                        borderRadius: "999px",

                        overflow: "hidden",
                      }}

                    >

                      <div

style={{

                          width: `${info.progres}%`,

                          height: "100%",

                          background: "#147d66",

                          borderRadius: "999px",
                        }}

                      />

                    </div>

                    {aktif && (

                      <div

style={{

                          marginTop: "16px",

                          paddingTop: "14px",

                          borderTop: "1px solid #cde2d7",
                        }}

                      >

                        <label

htmlFor="tambahan-tabungan"

style={{

                            display: "block",

                            marginBottom: "8px",

                            fontWeight: "700",

                            fontSize: "13px",

                            color: "#193b32",
                          }}

                        >

                          Tambah uang tabungan

                        </label>

                        <div

style={{

                            display: "flex",

                            gap: "10px",

                            flexWrap: "wrap",
                          }}

                        >

                          <input

id="tambahan-tabungan"

type="text"

inputMode="numeric"

placeholder="Rp0"

value={

                              tambahan

                                ? formatRupiah(tambahan)

                                : ""
                            }

disabled={sedangProses}

onChange={(event) =>

                              setTambahan(

                                event.target.value.replace(

                                  /\D/g,

                                  ""
                                )
                              )
                            }

style={{

                              flex: "1 1 180px",

                              minWidth: 0,

                              padding: "11px 14px",

                              border: "1px solid #cde2d7",

                              borderRadius: "9px",

                              outline: "none",

                              fontSize: "14px",
                            }}

                          />

                          <button

type="button"

onClick={tambahTabungan}

disabled={sedangProses}

style={{

                              padding: "11px 18px",

                              border: "none",

                              borderRadius: "9px",

                              background: "#147d66",

                              color: "#ffffff",

                              fontWeight: "700",

                              cursor: "pointer",
                            }}

                          >

                            {proses === "tambah"

                              ? "Menyimpan..."

                              : "+ Tambah Tabungan"}

                          </button>

                        </div>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

    </div>
  );

}