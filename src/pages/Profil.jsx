
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import Sidebar from "../components/Sidebar";
import { auth } from "../lib/firebase";
import { ambilProfil, simpanProfil } from "../lib/firestore";
import "./Profil.css";

const defaultProfile = {
  nama: "",
  email: "",
  kampus: "",
  status: "Mahasiswa",
};

export default function Profil() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    ...defaultProfile,
  });

  const [profileTersimpan, setProfileTersimpan] = useState({
    ...defaultProfile,
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [pesan, setPesan] = useState("");
  const [pesanError, setPesanError] = useState(false);

  // State sidebar mobile
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  // Mengambil profil dari Firebase
  useEffect(() => {
    let aktif = true;
    let requestId = 0;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        const currentRequest = ++requestId;

        if (!user) {
          if (aktif) {
            setLoading(false);
            navigate("/login", { replace: true });
          }
          return;
        }

        setLoading(true);

        const profilFirebase = {
          nama: user.displayName || "",
          email: user.email || "",
          kampus: "",
          status: "Mahasiswa",
        };

        try {
          const data = await ambilProfil();

          if (!aktif || currentRequest !== requestId) {
            return;
          }

          const profilLengkap = {
            nama: data?.nama || profilFirebase.nama,
            email: user.email || "",
            kampus: data?.kampus || "",
            status: data?.status || "Mahasiswa",
          };

          setProfile(profilLengkap);
          setProfileTersimpan(profilLengkap);
          setPesan("");
          setPesanError(false);
        } catch (error) {
          if (!aktif || currentRequest !== requestId) {
            return;
          }

          console.error("Gagal memuat profil:", error);

          setProfile(profilFirebase);
          setProfileTersimpan(profilFirebase);

          setPesan(
            "Profil tambahan belum bisa dimuat dari Firestore. Periksa koneksi dan Security Rules."
          );
          setPesanError(true);
        } finally {
          if (aktif && currentRequest === requestId) {
            setLoading(false);
          }
        }
      },
      (error) => {
        console.error("Gagal memeriksa sesi:", error);

        if (aktif) {
          setLoading(false);
          setPesan("Gagal memeriksa sesi Firebase.");
          setPesanError(true);
        }
      }
    );

    return () => {
      aktif = false;
      requestId++;
      unsubscribe();
    };
  }, [navigate]);

  // Menutup sidebar dengan tombol Escape
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

  // Mengubah field profil
  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPesan("");
    setPesanError(false);
  };

  // Mengaktifkan edit profil
  const handleEdit = () => {
    setEditMode(true);
    setPesan("");
    setPesanError(false);
  };

  // Menyimpan profil ke Firebase
  const handleSave = async (event) => {
    event.preventDefault();

    if (saving) return;

    const user = auth.currentUser;

    if (!user) {
      setPesan(
        "Sesi login berakhir. Silakan login kembali."
      );
      setPesanError(true);
      return;
    }

    const dataBaru = {
      nama: profile.nama.trim(),
      email: user.email || "",
      kampus: profile.kampus.trim(),
      status: profile.status,
    };

    if (!dataBaru.nama) {
      setPesan("Nama lengkap wajib diisi.");
      setPesanError(true);
      return;
    }

    setSaving(true);
    setPesan("");
    setPesanError(false);

    try {
      await simpanProfil(dataBaru);

      setProfile(dataBaru);
      setProfileTersimpan(dataBaru);
      setEditMode(false);

      try {
        await updateProfile(user, {
          displayName: dataBaru.nama,
        });

        setPesan(
          "Profil berhasil disimpan ke Firebase."
        );
        setPesanError(false);
      } catch (error) {
        console.error(
          "Gagal memperbarui nama Firebase Auth:",
          error
        );

        setPesan(
          "Profil berhasil disimpan di Firestore, tetapi nama di Firebase Authentication belum diperbarui."
        );
        setPesanError(true);
      }
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);

      const detailError =
        error.code === "permission-denied"
          ? "Izin ditolak. Periksa Security Rules Firestore."
          : error.code === "unavailable"
            ? "Firestore tidak tersedia. Periksa koneksi internet."
            : error.message || "Terjadi kesalahan.";

      setPesan(
        `Gagal menyimpan profil: ${detailError}`
      );
      setPesanError(true);
    } finally {
      setSaving(false);
    }
  };

  // Membatalkan perubahan
  const handleCancel = () => {
    setProfile({ ...profileTersimpan });
    setEditMode(false);
    setPesan("");
    setPesanError(false);
  };

  // Logout Firebase
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setPesan("");

    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Gagal logout:", error);

      setPesan(
        "Gagal keluar dari akun. Silakan coba lagi."
      );
      setPesanError(true);
      setLoggingOut(false);
    }
  };

  const initial = profile.nama.trim()
    ? profile.nama.trim().charAt(0).toUpperCase()
    : "D";

  return (
    <div className="dashboard-layout profil-layout">

      {/* HEADER KHUSUS HP */}
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
          aria-controls="profil-sidebar"
        >
          {menuTerbuka ? "✕" : "☰"}
        </button>

        <span className="dashboard-mobile-brand">
          Dompetku
        </span>
      </div>

      {/* OVERLAY SAAT SIDEBAR TERBUKA */}
      {menuTerbuka && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          onClick={() => setMenuTerbuka(false)}
          aria-label="Tutup menu"
        />
      )}

      {/* SIDEBAR DESKTOP DAN MOBILE */}
      <div
        id="profil-sidebar"
        className={`dashboard-sidebar-wrapper ${
          menuTerbuka ? "is-open" : ""
        }`}
      >
        <Sidebar
          onNavigate={() => setMenuTerbuka(false)}
        />
      </div>

      <main className="profil-content">
        {loading ? (
          <p
            role="status"
            style={{
              padding: "24px",
              color: "#147d66",
              fontWeight: 600,
            }}
          >
            Memuat profil Dompetku...
          </p>
        ) : (
          <>
            {/* HEADER PROFIL */}
            <header className="profil-header">
              <div>
                <h1>Profil</h1>

                <p>
                  Kelola informasi akun dan identitasmu
                  di Dompetku.
                </p>
              </div>

              <span className="profil-badge">
                <span className="profil-badge-dot" />
                Akun Saya
              </span>
            </header>

            {/* BANNER IDENTITAS */}
            <section className="profil-banner">
              <div className="profil-avatar">
                {initial}
              </div>

              <div className="profil-banner-info">
                <h2>
                  {profile.nama || "Pengguna Dompetku"}
                </h2>

                <p>{profile.email}</p>
                <span>{profile.status}</span>
              </div>
            </section>

            <div className="profil-grid">

              {/* INFORMASI PRIBADI */}
              <section className="profil-card">
                <div className="profil-card-header">
                  <div>
                    <h2>Informasi Pribadi</h2>

                    <p>
                      Informasi yang digunakan
                      pada profilmu.
                    </p>
                  </div>

                  {!editMode && (
                    <button
                      type="button"
                      className="profil-edit-button"
                      onClick={handleEdit}
                    >
                      Edit Profil
                    </button>
                  )}
                </div>

                <form onSubmit={handleSave}>

                  {/* NAMA */}
                  <div className="profil-field">
                    <label htmlFor="profil-nama">
                      Nama lengkap
                    </label>

                    <input
                      id="profil-nama"
                      type="text"
                      value={profile.nama}
                      disabled={!editMode || saving}
                      onChange={(event) =>
                        updateField(
                          "nama",
                          event.target.value
                        )
                      }
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="profil-field">
                    <label htmlFor="profil-email">
                      Email akun
                    </label>

                    <input
                      id="profil-email"
                      type="email"
                      value={profile.email}
                      disabled
                      readOnly
                    />

                    <p
                      style={{
                        marginTop: "6px",
                        fontSize: "12px",
                        color: "#81918a",
                      }}
                    >
                      Email mengikuti akun Firebase
                      yang digunakan untuk login.
                    </p>
                  </div>

                  {/* KAMPUS */}
                  <div className="profil-field">
                    <label htmlFor="profil-kampus">
                      Kampus
                    </label>

                    <input
                      id="profil-kampus"
                      type="text"
                      value={profile.kampus}
                      disabled={!editMode || saving}
                      onChange={(event) =>
                        updateField(
                          "kampus",
                          event.target.value
                        )
                      }
                      placeholder="Masukkan nama kampus"
                    />
                  </div>

                  {/* STATUS */}
                  <div className="profil-field">
                    <label htmlFor="profil-status">
                      Status
                    </label>

                    <select
                      id="profil-status"
                      value={profile.status}
                      disabled={!editMode || saving}
                      onChange={(event) =>
                        updateField(
                          "status",
                          event.target.value
                        )
                      }
                    >
                      <option value="Mahasiswa">
                        Mahasiswa
                      </option>

                      <option value="Pelajar">
                        Pelajar
                      </option>

                      <option value="Pekerja">
                        Pekerja
                      </option>

                      <option value="Lainnya">
                        Lainnya
                      </option>
                    </select>
                  </div>

                  {/* PESAN FIREBASE */}
                  {pesan && (
                    <p
                      className="profil-message"
                      role="status"
                      style={{
                        color: pesanError
                          ? "#c0392b"
                          : "#147d66",
                      }}
                    >
                      {pesan}
                    </p>
                  )}

                  {/* TOMBOL EDIT */}
                  {editMode && (
                    <div className="profil-actions">
                      <button
                        type="submit"
                        className="profil-save-button"
                        disabled={saving}
                      >
                        {saving
                          ? "Menyimpan..."
                          : "Simpan Perubahan"}
                      </button>

                      <button
                        type="button"
                        className="profil-cancel-button"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </form>
              </section>

              {/* KOLOM KANAN */}
              <aside className="profil-side">

                {/* TENTANG DOMPETKU */}
                <section className="profil-card profil-info-card">
                  <h2>Tentang Dompetku</h2>

                  <p>
                    Dompetku membantu kamu membuat
                    simulasi keuangan, membandingkan
                    pengeluaran, dan merencanakan tabungan.
                  </p>

                  <div className="profil-info-highlight">
                    <strong>
                      Kelola uang dengan lebih bijak
                    </strong>

                    <span>
                      Mulai dari kebiasaan kecil setiap hari.
                    </span>
                  </div>
                </section>

                {/* PENGATURAN AKUN */}
                <section className="profil-card profil-account-card">
                  <h2>Pengaturan Akun</h2>

                  <p>
                    Selesai menggunakan Dompetku?
                  </p>

                  <button
                    type="button"
                    className="profil-logout-button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut
                      ? "Sedang keluar..."
                      : "Keluar dari Akun →"}
                  </button>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
