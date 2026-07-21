import { useState } from "react";
import { FaCheckCircle, FaEye, FaEyeSlash, FaSignInAlt, FaGoogle } from "react-icons/fa";
import styles from "../css/login.module.css";
import LayoutPrincipal from "../layouts/LayoutPrincipal";
import { loginUsuario } from "../services/UsuarioService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [language, setLanguage] = useState("es");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const texts = {
    es: {
      welcome: "¡Bienvenido a Ticket Plus+!",
      successTitle: "Bienvenido a Ticket Plus+", 
      success: "Login exitoso",
      continue: "Continuar",
      subtitle: "Ingresa para vivir la mejor experiencia en eventos.",
      badge: "Inicio de Sesión",
      email: "Correo Electrónico",
      emailPlaceholder: "Ingresa tu correo",
      password: "Contraseña",
      passwordPlaceholder: "Ingresa tu contraseña",
      login: "Ingresar",
      forgot: "¿Olvidaste tu contraseña?",
      register: "¿Aún no tienes cuenta? Regístrate",
      errorEmail: "Debes ingresar el correo",
      errorPass: "Debes ingresar la contraseña",
      errorInvalidEmail: "Correo no válido",
      errorAuth: "Correo o contraseña incorrectos",
      footer: "Vive la música. Siente la experiencia 🎶",
      googleLogin: "Iniciar sesión con Google",
      orDivider: "— o —",
    },

    en: {
      welcome: "Welcome to Ticket Plus+!",
      successTitle: "Welcome to Ticket Plus+", 
      success: "Login successful",
      continue: "Continue",
      subtitle: "Sign in for the best event experience.",
      badge: "Login",
      email: "Email Address",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      login: "Sign In",
      forgot: "Forgot your password?",
      register: "Don't have an account yet? Sign up",
      errorEmail: "You must enter your email",
      errorPass: "You must enter your password",
      errorInvalidEmail: "Invalid email",
      errorAuth: "Invalid email or password",
      footer: "Live the music. Feel the experience 🎶",
      googleLogin: "Sign in with Google",
      orDivider: "— or —",
    },
  };

  const t = texts[language];

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.trim() === "") {
      newErrors.push(t.errorEmail);
    } else if (!emailRegex.test(email)) {
      newErrors.push(t.errorInvalidEmail);
    }

    if (password.trim() === "") {
      newErrors.push(t.errorPass);
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      try {
        const data = await loginUsuario({
          correo: email,
          contrasena: password,
        });

        if (data) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify({
            id_usuario: data.id,
            nombre: data.nombre,
            correo: data.correo,
            rol: { nombreRol: data.rol },
          }));
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error capturado:", error);
        setErrors([t.errorAuth]);
      }
    }
  };

  return (
    <LayoutPrincipal>
      <div className={`container-fluid p-0 ${styles.page}`}>
        {/* MODAL ÉXITO: Única sección mejorada estéticamente */}
        {isLoggedIn && (
          <div className={styles.modalOverlay} style={{ backdropFilter: "blur(5px)", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className={`${styles.modalBox} text-center p-4 shadow`} style={{ borderRadius: "12px", maxWidth: "420px" }}>
              <FaCheckCircle
                className="text-success mb-3 animate__animated animate__zoomIn"
                style={{ fontSize: "3.2rem", filter: "drop-shadow(0px 4px 8px rgba(25, 135, 84, 0.25))" }}
              />

              <h2 className="fw-bold mb-2" style={{ color: "#222", fontSize: "1.5rem" }}>
                {t.successTitle}
              </h2>

              <div className="mx-auto my-2" style={{ width: "35px", height: "3px", backgroundColor: "#198754", borderRadius: "2px" }}></div>

              <p className="text-muted mb-4 small px-2">{t.success}</p>

              <button
                className="btn btn-success w-100 py-2 fw-bold text-uppercase"
                style={{
                  backgroundColor: "#198754",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  letterSpacing: "0.5px"
                }}
                onClick={() => (window.location.href = "/")}
              >
                {t.continue}
              </button>
            </div>
          </div>
        )}

        <div className="row g-0 vh-100">
          {/* FORMULARIO */}
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-white p-4 shadow">
            {/* IDIOMAS */}
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
              {/* TITULOS */}
              <div className="text-center mb-4">
                <div className="badge bg-danger mb-2 px-3 py-2 text-uppercase">
                  {t.badge}
                </div>

                <h2 className="fw-bold text-dark m-0">{t.welcome}</h2>

                <p className="text-muted small">{t.subtitle}</p>
              </div>

              {/* EMAIL */}
              <div className="mb-3">
                <label className="fw-semibold text-muted small mb-1">
                  {t.email}
                </label>

                <input
                  type="email"
                  className="form-control form-control-lg shadow-sm"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="mb-3">
                <label className="fw-semibold text-muted small mb-1">
                  {t.password}
                </label>

                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg shadow-sm border-end-0"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              {/* ERRORES */}
              {errors.length > 0 && (
                <div className="alert alert-danger py-2 small text-center border-0 shadow-sm">
                  {errors.map((err, index) => (
                    <div key={index}>{err}</div>
                  ))}
                </div>
              )}

              {/* BOTON */}
              <button
                type="submit"
                className="btn btn-danger btn-lg w-100 mb-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              >
                <FaSignInAlt /> {t.login}
              </button>

              {/* DIVIDER */}
              <div className="text-center my-3">
                <span className="text-muted small">{t.orDivider}</span>
              </div>

              {/* GOOGLE LOGIN */}
              <a
                href="http://localhost:8080/oauth2/authorization/google"
                className="btn btn-outline-dark btn-lg w-100 mb-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              >
                <FaGoogle style={{ color: "#DB4437" }} /> {t.googleLogin}
              </a>

              {/* LINKS */}
              <div className="text-center mt-3 pt-3 border-top">
                <div className="mb-2">
                  <a href="#" className="text-decoration-none small text-muted">
                    {t.forgot}
                  </a>
                </div>

                <a
                  href="/registro"
                  className="text-decoration-none small text-danger fw-bold"
                >
                  {t.register}
                </a>
              </div>
            </form>
          </div>

          {/* IMAGEN */}
          <div
            className={`col-md-6 d-none d-md-block position-relative ${styles.rightColumn}`}
          >
            <div className={styles.heroTextWrapper}>
              <h1 className="display-4 fw-bold m-0">Ticket Plus+</h1>

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

export default Login;