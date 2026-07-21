import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const nombre = searchParams.get("nombre");
    const correo = searchParams.get("correo");
    const rol = searchParams.get("rol");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({
        id_usuario: parseInt(id),
        nombre: nombre,
        correo: correo,
        rol: { nombreRol: rol },
      }));
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-danger mb-3" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted">Iniciando sesión con Google...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
