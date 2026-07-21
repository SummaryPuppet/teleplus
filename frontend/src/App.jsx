import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "./App.css";
import SessionExpiredModal from "./components/SessionExpiredModal";
import useIdleTimer from "./hooks/useIdleTimer";
import Cargando from "./pages/Cargando";
import Compras from "./pages/compras";
import DashboardGuard from "./pages/dashboard/DashboardGuard";
import DashboardLogin from "./pages/dashboard/DashboardLogin";
import EventosDashboard from "./pages/dashboard/EventosDashboard";
import LugaresDashboard from "./pages/dashboard/LugaresDashboard";
import ZonasDashboard from "./pages/dashboard/ZonasDashboard";
import IndexDashboard from "./pages/dashboard/IndexDashboard";
import UsuariosDashboard from "./pages/dashboard/UsuariosDashboard";
import Evento1 from "./pages/eventos/Evento1";
import Evento3 from "./pages/eventos/Evento3";
import Evento4 from "./pages/eventos/evento4";
import Evento5 from "./pages/eventos/Evento5";
import Evento6 from "./pages/eventos/Evento6";
import Informacion from "./pages/Informacion";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import PaginaNoEncontrada from "./pages/PaginaNoEncontrada";
import Perfil from "./pages/Perfil";
import Registro from "./pages/Registro";
import VerBoletos from "./pages/VerBoletos";
import CambiarContrasena from "./pages/CambiarContrasena";
import PoliticaCompra from "./pages/PoliticaCompra";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import TerminosUso from "./pages/TerminosUso";
import AvisoLegal from "./pages/AvisoLegal";
import EventoDetalle from "./pages/eventos/EventoDetalle";
import PromocionesDashboard from "./pages/dashboard/PromocionesDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const stripePromise = loadStripe("pk_test_51TvN2zIQRmT1jibwgWhII0NMRErrIMNsDaBCDJBfXpT14vvJaVMQeZ1olnPCUc9Zu1BZKOvUxYLMsevy6RMewCJn00giK3G3pV");

function SessionManager() {
  const navigate = useNavigate();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");

  const handleSessionExpired = useCallback((message) => {
    setSessionMessage(message || "Tu sesión ha expirado por seguridad. Inicia sesión nuevamente.");
    setSessionExpired(true);
  }, []);

  const handleCloseSession = useCallback(() => {
    setSessionExpired(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handler = () => handleSessionExpired();
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, [handleSessionExpired]);

  useIdleTimer(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("dashboardUser");
    handleSessionExpired("Tu sesión ha caducado por inactividad. Inicia sesión nuevamente.");
  }, 300000);

  return (
    <SessionExpiredModal
      visible={sessionExpired}
      mensaje={sessionMessage}
      onClose={handleCloseSession}
    />
  );
}

function RouteTransition() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const loading = location.pathname !== displayLocation.pathname;

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDisplayLocation(location);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [location, displayLocation.pathname]);

  return (
    <>
      <Routes location={displayLocation}>
        <Route path="/" element={<Inicio />} />
        <Route path="/nosotros" element={<Informacion />} />
        <Route path="/compras" element={<ProtectedRoute><Compras /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/ver-boletos" element={<ProtectedRoute><VerBoletos /></ProtectedRoute>} />
        <Route path="/cambiar-contrasena" element={<ProtectedRoute><CambiarContrasena /></ProtectedRoute>} />
        <Route path="/evento-1" element={<Evento1 />} />
        <Route path="/evento-3" element={<Evento3 />} />
        <Route path="/evento-4" element={<Evento4 />} />
        <Route path="/evento-5" element={<Evento5 />} />
        <Route path="/evento-6" element={<Evento6 />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/dashboard/login" element={<DashboardLogin />} />
        <Route path="/politica-compra" element={<PoliticaCompra />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/terminos-uso" element={<TerminosUso />} />
        <Route path="/evento/:id" element={<EventoDetalle />} />
        

        <Route element={<DashboardGuard />}>
          <Route path="/dashboard" element={<IndexDashboard />} />
          <Route path="/dashboard/eventos" element={<EventosDashboard />} />
          <Route path="/dashboard/lugares" element={<LugaresDashboard />} />
          <Route path="/dashboard/zonas" element={<ZonasDashboard />} />
          <Route path="/dashboard/usuarios" element={<UsuariosDashboard />} />
          <Route path="/dashboard/promociones" element={<PromocionesDashboard />} />
        </Route>

        <Route path="*" element={<PaginaNoEncontrada />} />
      </Routes>

      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 2000 }}
        >
          <Cargando />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <SessionManager />
        <RouteTransition />
      </BrowserRouter>
    </Elements>
  );
}

export default App;
