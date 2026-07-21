import { useState } from "react";
import { FaCheckCircle, FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import styles from "../css/registro.module.css";
import LayoutPrincipal from "../layouts/LayoutPrincipal";
import { registrarUsuario } from "../services/UsuarioService";
import { Link } from "react-router-dom";
import PasswordStrengthBar from "../components/PasswordStrengthBar";

function Registro() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("es");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    contrasena: "",
    confirmar: "",
  });
  const [error, setError] = useState("");

  const texts = {
    es: {
      welcome: "¡Bienvenido a TicketPlus+!",
      modalTitle: "¡Registro Exitoso!",
      modalBody: "Felicitaciones, su cuenta ha sido creada con éxito. Gracias por registrarse en TicketPlus+",
      modalBtn: "Continuar",
      subtitle: "Crea tu cuenta para vivir la mejor experiencia en eventos.",
      badge: "Registro de Usuario",
      name: "Nombre",
      lastname: "Apellido",
      phone: "Teléfono",
      email: "Correo Electrónico",
      pass: "Contraseña",
      confirm: "Confirmar contraseña",
      btn: "Registrarse",
      link: "¿Ya tienes cuenta? Inicia sesión",
      errorMatch: "Las contraseñas no coinciden",
      errorBackend: "Error al registrar. Revisa los datos o el correo.",
      footer: "Vive la música. Siente la experiencia 🎶",
    },
    en: {
      welcome: "Welcome to TicketPlus+!",
      modalTitle: "Successful Registration!",
      modalBody: "Congratulations, your account has been successfully created. Thank you for registering with TicketPlus+",
      modalBtn: "Continue",
      subtitle: "Create your account for the best event experience.",
      badge: "User Registration",
      name: "First Name",
      lastname: "Last Name",
      phone: "Phone",
      email: "Email Address",
      pass: "Password",
      confirm: "Confirm Password",
      btn: "Sign Up",
      link: "Already have an account? Sign In",
      errorMatch: "Passwords do not match",
      errorBackend: "Registration error. Check your data or email.",
      footer: "Live the music. Feel the experience 🎶",
    },
  };

  const t = texts[language];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.contrasena !== formData.confirmar) {
      setError(t.errorMatch);
      return;
    }

    try {
      await registrarUsuario({
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        correo: formData.correo,
        contrasena: formData.contrasena,
      });
      setShowSuccessModal(true);
    } catch {
      setError(t.errorBackend);
    }
  };

  return (
    <LayoutPrincipal>
      <div className={`container-fluid p-0 ${styles.page}`}>
        {/* MODAL DE ÉXITO ESTILIZADO AL DETALLE */}
        {showSuccessModal && (
          <div className={styles.modalOverlay} style={{ backdropFilter: "blur(5px)", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className={`${styles.modalBox} text-center p-4 shadow`} style={{ borderRadius: "12px", maxWidth: "440px" }}>
              <FaCheckCircle
                className="text-success mb-3 animate__animated animate__zoomIn"
                style={{ fontSize: "3.2rem", filter: "drop-shadow(0px 4px 8px rgba(25, 135, 84, 0.25))" }}
              />
              
              <h2 className="fw-bold mb-2" style={{ color: "#222", fontSize: "1.5rem" }}>
                {t.modalTitle}
              </h2>

              <div className="mx-auto my-2" style={{ width: "35px", height: "3px", backgroundColor: "#198754", borderRadius: "2px" }}></div>

              <p className="text-muted mb-4 small px-3" style={{ lineHeight: "1.5" }}>
                {t.modalBody}
              </p>

              <button
                className="btn btn-success w-100 py-2 fw-bold text-uppercase"
                style={{
                  backgroundColor: "#198754",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  letterSpacing: "0.5px"
                }}
                onClick={() => navigate("/login")}
              >
                {t.modalBtn}
              </button>
            </div>
          </div>
        )}

        <div className="row g-0 vh-100">
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-white p-4 shadow">
            <div className="mb-4">
              <span
                className="px-2"
                onClick={() => setLanguage("es")}
                style={{
                  cursor: "pointer",
                  fontWeight: language === "es" ? "bold" : "normal",
                  color: language === "es" ? "#dc3545" : "black",
                }}
              >
                ES
              </span>
              <span className="text-muted">|</span>
              <span
                className="px-2"
                onClick={() => setLanguage("en")}
                style={{
                  cursor: "pointer",
                  fontWeight: language === "en" ? "bold" : "normal",
                  color: language === "en" ? "#dc3545" : "black",
                }}
              >
                EN
              </span>
            </div>

            <form className={styles.formWrapper} onSubmit={handleSubmit}>
              <div className="text-center mb-4">
                <div className="badge bg-danger mb-2 px-3 py-2 text-uppercase">
                  {t.badge}
                </div>
                <h2 className="fw-bold text-dark m-0">{t.welcome}</h2>
                <p className="text-muted small">{t.subtitle}</p>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="fw-semibold text-muted small mb-1">
                    {t.name}
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control form-control-lg shadow-sm"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="fw-semibold text-muted small mb-1">
                    {t.lastname}
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    className="form-control form-control-lg shadow-sm"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="fw-semibold text-muted small mb-1">
                  {t.phone}
                </label>
                <input
                  type="text"
                  name="telefono"
                  className="form-control form-control-lg shadow-sm"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="fw-semibold text-muted small mb-1">
                  {t.email}
                </label>
                <input
                  type="email"
                  name="correo"
                  className="form-control form-control-lg shadow-sm"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="fw-semibold text-muted small mb-1">
                    {t.pass}
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="contrasena"
                      className="form-control form-control-lg shadow-sm border-end-0"
                      onChange={handleChange}
                      required
                    />
                    <span
                      className="input-group-text bg-white border-start-0 shadow-sm"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  <PasswordStrengthBar password={formData.contrasena} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="fw-semibold text-muted small mb-1">
                    {t.confirm}
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmar"
                      className="form-control form-control-lg shadow-sm border-end-0"
                      onChange={handleChange}
                      required
                    />
                    <span
                      className="input-group-text bg-white border-start-0 shadow-sm"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ cursor: "pointer" }}
                    >
                      {showConfirm ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small text-center border-0 shadow-sm">
                  {error}
                </div>
              )}

              <div className="form-check mb-4 mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="aceptaPoliticas"
                  checked={aceptaPoliticas}
                  onChange={(e) => setAceptaPoliticas(e.target.checked)}
                />
                <label className="form-check-label text-dark" htmlFor="aceptaPoliticas">
                  Acepto los{" "}
                  <Link
                    to="/terminos-uso"
                    target="_blank"
                    className="text-danger fw-bold text-decoration-none"
                  >
                    Términos de Uso
                  </Link>{" "}
                  y la{" "}
                  <Link
                    to="/politica-compra"
                    target="_blank"
                    className="text-danger fw-bold text-decoration-none"
                  >
                    Política de Compra
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-danger btn-lg w-100 mb-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={!aceptaPoliticas}
                onClick={() => {
                  if (!aceptaPoliticas) {
                    alert("Debes aceptar los términos");
                    return;
                  }
                }}
              >
                <FaUserPlus /> {t.btn}
              </button>

              <div className="text-center mt-3 pt-3 border-top">
                <a
                  href="/login"
                  className="text-decoration-none small text-danger fw-bold"
                >
                  {t.link}
                </a>
              </div>
            </form>
          </div>

          <div className={`col-md-6 d-none d-md-block position-relative ${styles.rightColumn}`}>
            <div className={styles.heroTextWrapper}>
              <h1 className="display-4 fw-bold m-0">TicketPlus+</h1>
              <p className="lead opacity-75">
                Tu entrada a los mejores eventos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutPrincipal>
  );
}

export default Registro;
