
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import logoDompetku from "../components/Logodompet.png";


function pesanErrorFirebase(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Email sudah terdaftar. Silakan masuk melalui Login.";

    case "auth/invalid-email":
      return "Format alamat email tidak valid.";

    case "auth/weak-password":
      return "Kata sandi terlalu lemah.";

    case "auth/password-does-not-meet-requirements":
      return "Kata sandi belum memenuhi persyaratan keamanan Firebase.";

    case "auth/network-request-failed":
      return "Koneksi internet bermasalah.";

    case "auth/operation-not-allowed":
      return "Email/Password belum diaktifkan di Firebase Authentication.";

    case "auth/invalid-api-key":
      return "API key Firebase tidak valid. Periksa konfigurasi.";

    case "auth/unauthorized-domain":
      return "Domain aplikasi belum diizinkan di Firebase.";

    case "auth/configuration-not-found":
      return "Konfigurasi Authentication tidak ditemukan di proyek Firebase.";

    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti.";

    default:
      return `Pendaftaran gagal. Kode: ${error.code || "unknown"}`;
  }
}

export default function Register() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    const namaBersih = nama.trim();
    const emailBersih = email.trim();

    if (!namaBersih) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    if (password !== konfirmasiPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        emailBersih,
        password
      );

      await updateProfile(credential.user, {
        displayName: namaBersih,
      });

      await signOut(auth);

      navigate("/login", {
        replace: true,
        state: {
          pesan: "Akun berhasil dibuat. Silakan login.",
        },
      });

    } catch (err) {
      console.error("Firebase Register Error:", err);
      console.error("Error Code:", err.code);

      setError(pesanErrorFirebase(err));
    } finally {
      setLoading(false);
    }
  }


  const passwordStyle = {
    width: "100%",
    boxSizing: "border-box",
    paddingRight: "95px",
  };

  return (
    <main className="login-page">
      <section className="login-left">
        <div className="brand">
          <img
            src={logoDompetku}
            alt="Logo Dompetku"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "contain",
            }}
          />

          <span>Dompetku</span>
        </div>

        <div className="hero">
          <h1>
            Hemat uangmu
            <br />
           Kurangi jajanmu
          </h1>

          <p>
            Catat rencana keuangan,
            <br />
            simulasikan pengeluaran,
            <br />
            bangun kebiasaan menabung.
          </p>

          <div className="quote">
            “Kalau kalkulusmu kecil
            <br />
            setidaknya tabunganmu besar.”
          </div>
        </div>
      </section>

      <section className="login-right">
        <div className="login-form-container">
          <h2>Segera daftar ke dompetku!</h2>

          <p className="description">
            Daftar untuk mulai rencanakan keuanganmu.
          </p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="register-nama">
                Nama lengkap
              </label>

              <input
                id="register-nama"
                type="text"
                placeholder="Nama lengkapmu"
                value={nama}
                onChange={(event) => setNama(event.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">
                Email
              </label>

              <input
                id="register-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">
                Kata sandi
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  style={passwordStyle}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#147d66",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-konfirmasi">
                Konfirmasi kata sandi
              </label>

              <input
                id="register-konfirmasi"
                type={showPassword ? "text" : "password"}
                placeholder="Ulangi kata sandi"
                value={konfirmasiPassword}
                onChange={(event) =>
                  setKonfirmasiPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                style={{
                  padding: "12px",
                  marginBottom: "14px",
                  background: "#fff1f0",
                  color: "#c0392b",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Membuat akun..."
                : "Daftar ke Dompetku →"}
            </button>
          </form>

          <p className="register">
            Sudah punya akun?{" "}
            <Link to="/login">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
