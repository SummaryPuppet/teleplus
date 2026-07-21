import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutPrincipal from "../layouts/LayoutPrincipal";
import apiClient from "../services/apiClient";
import PasswordStrengthBar from "../components/PasswordStrengthBar";

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
};

function CambiarContrasena() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [formData, setFormData] = useState({
    contrasenaActual: "",
    nuevaContrasena: "",
    confirmarContrasena: "",
  });
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("al menos 8 caracteres");
    if (!/[A-Z]/.test(password)) errors.push("una mayuscula");
    if (!/[a-z]/.test(password)) errors.push("una minuscula");
    if (!/[0-9]/.test(password)) errors.push("un numero");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) errors.push("un caracter especial");
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
    setMensajeError("");
    setMensajeExito("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    const newErrors = {};

    if (!formData.contrasenaActual) {
      newErrors.contrasenaActual = "La contrasena actual es requerida";
    }

    const passwordErrors = validatePassword(formData.nuevaContrasena);
    if (passwordErrors.length > 0) {
      newErrors.nuevaContrasena = `La contrasena debe tener: ${passwordErrors.join(", ")}`;
    }

    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Las contrasenas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrores(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      const userId = user?.id_usuario || user?.id;
      await apiClient.put(`/api/usuarios/${userId}/cambiar-contrasena`, {
        contrasenaActual: formData.contrasenaActual,
        nuevaContrasena: formData.nuevaContrasena,
        confirmarContrasena: formData.confirmarContrasena,
      });
      setMensajeExito("Contrasena actualizada correctamente. Seras redirigido al perfil.");
      setFormData({ contrasenaActual: "", nuevaContrasena: "", confirmarContrasena: "" });
      setTimeout(() => navigate("/perfil"), 2500);
    } catch (error) {
      const msg = error.response?.data || "Error al cambiar la contrasena";
      setMensajeError(typeof msg === "string" ? msg : "Error al cambiar la contrasena");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <LayoutPrincipal>
        <div className="container d-flex align-items-center justify-content-center py-5" style={{ minHeight: "70vh" }}>
          <div className="card shadow border-0 text-center p-4" style={{ maxWidth: "520px" }}>
            <div className="card-body">
              <h3 className="fw-bold mb-2">No has iniciado sesion</h3>
              <p className="text-muted mb-4">Inicia sesion para cambiar tu contrasena.</p>
              <button className="btn btn-danger px-4" onClick={() => navigate("/login")}>
                Ir al Login
              </button>
            </div>
          </div>
        </div>
      </LayoutPrincipal>
    );
  }

  return (
    <LayoutPrincipal>
      <section className="py-5" style={{
        background: "linear-gradient(180deg, rgba(220,53,69,0.08) 0%, rgba(255,255,255,1) 32%, rgba(248,249,250,1) 100%)",
        minHeight: "calc(100vh - 140px)",
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg">
                <div className="p-4 text-white" style={{
                  background: "linear-gradient(135deg, #dc3545 0%, #a61c2d 100%)",
                }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white text-danger d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: "60px", height: "60px", fontSize: "1.5rem", fontWeight: 800 }}>
                      &#128274;
                    </div>
                    <div>
                      <h2 className="h4 fw-bold mb-0">Cambiar contrasena</h2>
                      <small className="opacity-75">Mantene tu cuenta segura</small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  {mensajeExito && (
                    <div className="alert alert-success border-0 shadow-sm fw-bold">{mensajeExito}</div>
                  )}
                  {mensajeError && (
                    <div className="alert alert-danger border-0 shadow-sm fw-bold">{mensajeError}</div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Contrasena actual</label>
                      <input
                        type="password"
                        name="contrasenaActual"
                        className={`form-control form-control-lg ${errores.contrasenaActual ? "is-invalid" : ""}`}
                        value={formData.contrasenaActual}
                        onChange={handleChange}
                        placeholder="Ingresa tu contrasena actual"
                        required
                      />
                      {errores.contrasenaActual && <div className="invalid-feedback">{errores.contrasenaActual}</div>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nueva contrasena</label>
                      <input
                        type="password"
                        name="nuevaContrasena"
                        className={`form-control form-control-lg ${errores.nuevaContrasena ? "is-invalid" : ""}`}
                        value={formData.nuevaContrasena}
                        onChange={handleChange}
                        placeholder="Minimo 8 caracteres"
                        required
                      />
                      <PasswordStrengthBar password={formData.nuevaContrasena} />
                      {errores.nuevaContrasena && <div className="invalid-feedback">{errores.nuevaContrasena}</div>}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Confirmar nueva contrasena</label>
                      <input
                        type="password"
                        name="confirmarContrasena"
                        className={`form-control form-control-lg ${errores.confirmarContrasena ? "is-invalid" : ""}`}
                        value={formData.confirmarContrasena}
                        onChange={handleChange}
                        placeholder="Repite la nueva contrasena"
                        required
                      />
                      {errores.confirmarContrasena && <div className="invalid-feedback">{errores.confirmarContrasena}</div>}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary flex-grow-1"
                        onClick={() => navigate("/perfil")}
                        disabled={isSaving}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-danger flex-grow-1 fw-bold"
                        disabled={isSaving}
                      >
                        {isSaving ? "Guardando..." : "Actualizar contrasena"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LayoutPrincipal>
  );
}

export default CambiarContrasena;
