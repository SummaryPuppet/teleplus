import styles from "../css/compras.module.css";
import LayoutPrincipal from "../layouts/LayoutPrincipal";

import { guardarEntrada } from "../services/entradaService";
import { crearCompra } from "../services/compraService";
import { buscarEZPPorEventoZonaTipo } from "../services/eventoService";

import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { validarPromocion, aplicarPromocion as aplicarPromocionAPI } from "../services/promocionService";

import { useLocation } from "react-router-dom";

import PasarelaPago from "../components/PasarelaPago";

function Compras() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!localStorage.getItem("token")) {
    navigate("/login", { replace: true });
    return null;
  }

  const datosCompra = location.state;

  const precioUnitario = datosCompra?.precio || 0;

  // STATES
  const [cantidad, setCantidad] = useState(1);

  const [metodoPago, setMetodoPago] = useState("Tarjeta de credito");

  const [codigoPromo, setCodigoPromo] = useState("");

  const [mensajePromo, setMensajePromo] = useState("");

  const [promoValida, setPromoValida] = useState(null);

  const [descuento, setDescuento] = useState(0);

  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);

  const [mostrarExito, setMostrarExito] = useState(false);

  const [mostrarPasarela, setMostrarPasarela] = useState(false);

  const [procesandoCompra, setProcesandoCompra] = useState(false);

  // TOTAL
  const subtotal = precioUnitario * cantidad;

  const totalFinal = subtotal - (subtotal * descuento) / 100;

  // VALIDAR PROMO
  const validarCodigoPromocion = async () => {
    try {
      const data = await validarPromocion(codigoPromo);

      setMensajePromo(data.mensaje);

      setPromoValida(data.valido);

      if (data.valido) {
        setDescuento(data.descuento);
      } else {
        setDescuento(0);
      }
    } catch {
      setMensajePromo("Error del servidor");

      setPromoValida(false);
    }
  };

  const handleCompra = async () => {
    if (!datosCompra?.evento) {
      alert("No se encontro informacion del evento");
      return;
    }

    if (!cantidad || cantidad < 1) {
      alert("Debes seleccionar al menos 1 boleto");
      return;
    }

    if (precioUnitario <= 0) {
      alert("El precio del boleto no es valido");
      return;
    }

    if (!metodoPago) {
      alert("Selecciona un metodo de pago");
      return;
    }

    if (!aceptaPoliticas) {
      alert("Debes aceptar las politicas de compra");
      return;
    }

    try {
      if (promoValida && codigoPromo.trim()) {
        const aplicacion = await aplicarPromocionAPI(codigoPromo.trim());
        if (!aplicacion.valido) {
          alert(aplicacion.mensaje || "No se pudo aplicar la promocion.");
          return;
        }
      }

      setMostrarPasarela(true);
    } catch (error) {
      console.error(error);
      alert("Error al validar la promocion");
    }
  };

  const handleExitoPago = async (codigoTransaccion) => {
    setMostrarPasarela(false);
    setProcesandoCompra(true);

    try {
      const compraData = {
        fecha_compra: new Date().toISOString().split("T")[0],
        total: totalFinal,
        estado: "Completada",
      };

      const compraCreada = await crearCompra(compraData);

      const codigoQR = codigoTransaccion || `QR_${Math.random().toString(36).substring(2, 14).toUpperCase()}`;

      let idEventoZonaPrecio = datosCompra.idEventoZonaPrecio;
      if (!idEventoZonaPrecio && datosCompra.evento && datosCompra.zona && datosCompra.tipo) {
        try {
          const ezp = await buscarEZPPorEventoZonaTipo(
            datosCompra.evento,
            datosCompra.zona,
            datosCompra.tipo
          );
          if (ezp) idEventoZonaPrecio = ezp.id;
        } catch (e) {
          console.error("Error buscando eventoZonaPrecio:", e);
        }
      }

      await guardarEntrada({
        codigo_qr: codigoQR,
        estado: "Activo",
        precio_final: totalFinal,
        reservado_hasta: null,
        eventoZonaPrecio: {
        id: idEventoZonaPrecio
        }
      });
      setMostrarExito(true);
    } catch (error) {
      console.error(error);
      alert("Error al registrar la compra. Intente nuevamente.");
    } finally {
      setProcesandoCompra(false);
    }
  };

  const handleCancelarPago = () => {
    setMostrarPasarela(false);
  };

  return (
    <LayoutPrincipal>
      <div className={styles.page}>
        {/* HERO CON IMAGEN */}
        <section className={styles.hero}>
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${datosCompra?.imagen})` }}
          ></div>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <span
              className="badge bg-danger mb-2"
              style={{ fontSize: "11px", letterSpacing: "1.5px" }}
            >
              TICKET PLUS+
            </span>
            <h1 className="text-white fw-bold mb-2">
              {datosCompra?.evento || "Compra tus entradas"}
            </h1>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="text-white-50">
                {datosCompra?.fecha}
              </span>
              <span className="text-white-50">|</span>
              <span className="text-white-50">
                {datosCompra?.lugar}
              </span>
            </div>
          </div>
        </section>

        {/* CONTENIDO */}
        <section className="container my-5">
          <div className="row g-4 justify-content-center">
            {/* COLUMNA IZQUIERDA - RESUMEN EVENTO */}
            <div className="col-lg-5">
              <div className={styles.summaryCard}>
                {datosCompra?.imagen && (
                  <div className={styles.summaryImageWrap}>
                    <img
                      src={datosCompra.imagen}
                      alt={datosCompra?.evento}
                      className={styles.summaryImage}
                    />
                    <div className={styles.summaryImageOverlay}>
                      <span
                        className="badge bg-dark px-3 py-2"
                        style={{ fontSize: "11px" }}
                      >
                        {datosCompra?.tipo}
                      </span>
                    </div>
                  </div>
                )}
                <div className={styles.summaryBody}>
                  <h4 className="fw-bold mb-3" style={{ color: "#1a1a2e" }}>{datosCompra?.evento}</h4>

                  <div className={styles.summaryInfoRow}>
                    <div className={styles.summaryIconBox} style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                      <span>&#9744;</span>
                    </div>
                    <div>
                      <small style={{ color: "#6c757d" }}>Fecha</small>
                      <div className="fw-semibold" style={{ color: "#212529" }}>{datosCompra?.fecha}</div>
                    </div>
                  </div>

                  <div className={styles.summaryInfoRow}>
                    <div className={styles.summaryIconBox} style={{ background: "#fff3cd", color: "#856404" }}>
                      <span>&#9873;</span>
                    </div>
                    <div>
                      <small style={{ color: "#6c757d" }}>Lugar</small>
                      <div className="fw-semibold" style={{ color: "#212529" }}>{datosCompra?.lugar}</div>
                    </div>
                  </div>

                  <div className={styles.summaryInfoRow}>
                    <div className={styles.summaryIconBox} style={{ background: "#e3f2fd", color: "#1565c0" }}>
                      <span>&#9899;</span>
                    </div>
                    <div>
                      <small style={{ color: "#6c757d" }}>Zona</small>
                      <div className="fw-semibold" style={{ color: "#212529" }}>{datosCompra?.zona}</div>
                    </div>
                  </div>

                  <div className={styles.summaryInfoRow}>
                    <div className={styles.summaryIconBox} style={{ background: "#fce4ec", color: "#c62828" }}>
                      <span>&#9670;</span>
                    </div>
                    <div>
                      <small style={{ color: "#6c757d" }}>Tipo</small>
                      <div className="fw-semibold" style={{ color: "#212529" }}>{datosCompra?.tipo}</div>
                    </div>
                  </div>

                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ color: "#6c757d" }}>Precio unitario</span>
                    <span className="fw-bold" style={{ color: "#dc3545", fontSize: "1.15rem" }}>
                      S/. {precioUnitario.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA - FORMULARIO */}
            <div className="col-lg-7">
              <div className={styles.formCard}>
                <h4 className="fw-bold mb-4" style={{ color: "#1a1a2e" }}>
                  Selecciona tus entradas
                </h4>

                {/* CANTIDAD */}
                <div className={styles.formGroup}>
                  <label className="form-label fw-semibold" style={{ color: "#495057" }}>
                    Cantidad de boletos
                  </label>
                  <input
                    type="number"
                    className={`form-control ${styles.formInput}`}
                    value={cantidad}
                    min="1"
                    onChange={(e) => setCantidad(Number(e.target.value))}
                  />
                </div>

                {/* METODO DE PAGO */}
                <div className={styles.formGroup}>
                  <label className="form-label fw-semibold" style={{ color: "#495057" }}>
                    Metodo de pago
                  </label>
                  <select
                    className={`form-select ${styles.formInput}`}
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    <option>Tarjeta de credito</option>
                    <option>Tarjeta de debito</option>
                    <option>Yape / Plin</option>
                  </select>
                </div>

                {/* CODIGO PROMOCIONAL */}
                <div className={styles.formGroup}>
                  <label className="form-label fw-bold" style={{ color: "#495057" }}>
                    Codigo promocional
                  </label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className={`form-control ${styles.formInput} ${
                        promoValida === true
                          ? "border-success"
                          : promoValida === false
                            ? "border-danger"
                            : ""
                      }`}
                      placeholder="Ej: INTERBANK2026"
                      value={codigoPromo}
                      onChange={(e) => setCodigoPromo(e.target.value)}
                    />
                    <button
                      className="btn btn-danger fw-bold px-4"
                      style={{ borderRadius: "10px" }}
                      onClick={validarCodigoPromocion}
                    >
                      Aplicar
                    </button>
                  </div>
                  {mensajePromo && (
                    <div
                      className={`fw-bold mt-2 small ${
                        promoValida ? "text-success" : "text-danger"
                      }`}
                    >
                      {mensajePromo}
                    </div>
                  )}
                </div>

                {/* POLITICAS */}
                <div className="form-check mt-4 mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={aceptaPoliticas}
                    onChange={(e) => setAceptaPoliticas(e.target.checked)}
                    id="aceptaPoliticas"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="aceptaPoliticas"
                    style={{ color: "#212529" }}
                  >
                    He leido y acepto los{" "}
                    <Link
                      to="/politica-compra"
                      target="_blank"
                      className="text-danger fw-bold"
                    >
                      Terminos de Compra
                    </Link>{" "}
                    y{" "}
                    <Link
                      to="/terminos-uso"
                      target="_blank"
                      className="text-danger fw-bold"
                    >
                      Terminos de Uso
                    </Link>
                  </label>
                </div>

                <hr />

                {/* TOTAL */}
                <div className={styles.totalBox}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ color: "#6c757d" }}>
                      Subtotal ({cantidad}{" "}
                      {cantidad === 1 ? "boleto" : "boletos"})
                    </span>
                    <span style={{ color: "#212529" }}>S/. {subtotal.toFixed(2)}</span>
                  </div>
                  {descuento > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold" style={{ color: "#28a745" }}>
                        Descuento ({descuento}%)
                      </span>
                      <span className="fw-bold" style={{ color: "#28a745" }}>
                        -S/. {((subtotal * descuento) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold fs-5" style={{ color: "#212529" }}>Total</span>
                    <span className="fw-bold fs-4" style={{ color: "#dc3545" }}>
                      S/. {totalFinal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-danger w-100 mt-4 py-3 fw-bold"
                  style={{ borderRadius: "12px", fontSize: "1.05rem" }}
                  disabled={!aceptaPoliticas || procesandoCompra || !cantidad || cantidad < 1}
                  onClick={handleCompra}
                >
                  {procesandoCompra ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>{" "}
                      Procesando...
                    </>
                  ) : (
                    <>
                      Confirmar compra — S/. {totalFinal.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* INFO */}
        <section className="container text-center mb-5">
          <small style={{ color: "#6c757d" }}>
            Los boletos seran enviados a tu correo electronico.
          </small>
        </section>
      </div>

      {/* PASARELA DE PAGO */}
      {mostrarPasarela && (
        <PasarelaPago
          metodoPago={metodoPago}
          monto={totalFinal}
          onExito={handleExitoPago}
          onCancelar={handleCancelarPago}
        />
      )}

      {/* MODAL EXITO */}
      {mostrarExito && (
        <>
          <div
            className="modal fade show"
            style={{
              display: "block",
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "20px", overflow: "hidden" }}
              >
                {datosCompra?.imagen && (
                  <div style={{ height: "160px", overflow: "hidden" }}>
                    <img
                      src={datosCompra.imagen}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <div className="modal-body text-center p-4">
                  <div className={styles.successIcon}>&#10003;</div>
                  <h4 className="fw-bold mt-3">
                    Compra realizada correctamente
                  </h4>
                  <p className="text-muted">
                    Tu boleto ha sido registrado exitosamente.
                  </p>
                  <p className="small text-muted mb-0">
                    <strong>Evento:</strong> {datosCompra?.evento}
                  </p>
                </div>
                <div className="modal-footer border-0 justify-content-center pb-4 gap-2">
                  <button
                    className="btn btn-danger fw-bold px-4"
                    style={{ borderRadius: "10px" }}
                    onClick={() => navigate("/ver-boletos")}
                  >
                    Ver mis boletos
                  </button>
                  <button
                    className="btn btn-outline-secondary px-4"
                    style={{ borderRadius: "10px" }}
                    onClick={() => navigate("/")}
                  >
                    Volver al inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </LayoutPrincipal>
  );
}

export default Compras;
