
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import logoDompetku from "../components/Logodompet.png";

function pesanErrorFirebase(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email atau kata sandi tidak sesuai.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti.";
    case "auth/network-request-failed":
      return "Koneksi internet bermasalah.";
    case "auth/operation-not-allowed":
      return "Metode autentikasi belum diaktifkan di Firebase.";
    default:
      return "Terjadi kesalahan. Silakan coba lagi.";
  }
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lupaPassword, setLupaPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pesan, setPesan] = useState(
    location.state?.pesan || ""
  );

  function bersihkanPesan() {
    setError("");
    setPesan("");
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (loading) return;

    bersihkanPesan();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login Firebase:", err.code);
      setError(pesanErrorFirebase(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    if (loading) return;

    bersihkanPesan();

    const emailBersih = email.trim();

    if (!emailBersih) {
      setError("Masukkan alamat email terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, emailBersih);

      setPesan(
        "Jika email terdaftar, tautan reset kata sandi akan dikirim. Periksa kotak masuk dan folder spam."
      );
    } catch (err) {
      console.error("Reset Password Firebase:", err.code);
      setError(pesanErrorFirebase(err));
    } finally {
      setLoading(false);
    }
  }

  function kembaliLogin() {
    setLupaPassword(false);
    setPassword("");
    bersihkanPesan();
  }

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
              flexShrink: 0,
            }}
          />

          <span>Dompetku</span>
        </div>

        <div className="hero">
          <h1>
           Atur keuangan
            <br />
           Hemat anggaran.
          </h1>

          <p>
            Simulasikan pengeluaran
            <br />
            bandingkan skenario.
            <br />
            dan rencanakan tabungan.
          </p>

          <div className="quote">
            "Nilai pas-pasan bukan berarti
            <br />
              tabungan pas-pasan juga.”
          </div>
        </div>
      </section>

      <section className="login-right">
        <div className="login-form-container">
          {lupaPassword ? (
            <>
              <h2>Lupa kata sandi? 🔐</h2>

              <p className="description">
                Masukkan email yang terdaftar di Dompetku.
                Kami akan mengirimkan tautan untuk
                mengatur ulang kata sandimu.
              </p>

              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="reset-email">
                    Email akun
                  </label>

                  <input
                    id="reset-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      bersihkanPesan();
                    }}
                    autoComplete="email"
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

                {pesan && (
                  <p
                    role="status"
                    style={{
                      padding: "12px",
                      marginBottom: "14px",
                      background: "#e6f3ee",
                      color: "#147d66",
                      borderRadius: "8px",
                      fontSize: "13px",
                      lineHeight: 1.7,
                    }}
                  >
                    {pesan}
                  </p>
                )}

                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Mengirim email..."
                    : "Kirim Link Reset Password →"}
                </button>
              </form>

              <p className="register">
                Sudah ingat kata sandi?{" "}
                <button
                  type="button"
                  onClick={kembaliLogin}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#147d66",
                    fontWeight: "700",
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                  }}
                >
                  Kembali ke Login
                </button>
              </p>
            </>
          ) : (
            <>
              <h2>Selamat datang di Dompetku</h2>

              <p className="description">
                Masuk untuk melanjutkan simulasi
                keuanganmu.
              </p>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      bersihkanPesan();
                    }}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Kata sandi
                  </label>

                  <div style={{ position: "relative" }}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        bersihkanPesan();
                      }}
                      autoComplete="current-password"
                      required
                      style={{
                        width: "100%",
                        paddingRight: "95px",
                        boxSizing: "border-box",
                      }}
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
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword
                        ? "Sembunyikan"
                        : "Lihat"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    margin: "0 0 18px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setLupaPassword(true);
                      setPassword("");
                      bersihkanPesan();
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#147d66",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Lupa kata sandi?
                  </button>
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

                {pesan && (
                  <p
                    role="status"
                    style={{
                      padding: "12px",
                      marginBottom: "14px",
                      background: "#e6f3ee",
                      color: "#147d66",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  >
                    {pesan}
                  </p>
                )}

                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Sedang masuk..."
                    : "Masuk ke Dompetku →"}
                </button>
              </form>

              <p className="register">
                Belum punya akun?{" "}
                <Link to="/register">
                  Daftar sekarang
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
