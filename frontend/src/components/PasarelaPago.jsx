import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { QRCodeSVG } from "qrcode.react";
import styles from "../css/pasarelaPago.module.css";
import { createPaymentIntent, confirmarPagoStripe, procesarPago } from "../services/pagoService";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#212529",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#adb5bd" },
    },
    invalid: {
      color: "#dc3545",
      iconColor: "#dc3545",
    },
  },
};

function PasarelaPago({ metodoPago, monto, onExito, onCancelar }) {
  const stripe = useStripe();
  const elements = useElements();

  const [estado, setEstado] = useState("form");
  const [procesando, setProcesando] = useState(false);
  const [celular, setCelular] = useState("");
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");

  const esTarjeta = metodoPago === "Tarjeta de credito" || metodoPago === "Tarjeta de debito";
  const esYapePlin = metodoPago === "Yape / Plin";

  const validarCelular = (valor) => {
    const limpio = valor.replace(/\s/g, "");
    if (limpio.length > 0 && !/^9\d{8}$/.test(limpio)) {
      setErrores({ celular: "Debe ser 9 digitos y empezar con 9" });
      return false;
    }
    setErrores({});
    return true;
  };

  const camposValidos = () => {
    if (esTarjeta) {
      return stripe && elements;
    }
    if (esYapePlin) {
      const celLimpio = celular.replace(/\s/g, "");
      return celLimpio.length === 9 && Object.keys(errores).length === 0;
    }
    return false;
  };

  const handlePagar = async () => {
    setErrorGeneral("");

    if (!stripe || !elements) {
      setErrorGeneral("El sistema de pago aún se está cargando. Espere un momento e intente de nuevo.");
      return;
    }

    setProcesando(true);

    try {
      if (esTarjeta) {
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
          setErrorGeneral("No se pudo obtener los datos de la tarjeta. Intente de nuevo.");
          setProcesando(false);
          return;
        }

        const intentResponse = await createPaymentIntent({
          monto,
          moneda: "pen",
          email: "",
        });

        if (!intentResponse.aprobado) {
          setErrorGeneral(intentResponse.mensaje || "Error al crear el pago");
          setProcesando(false);
          return;
        }

        const { error: confirmError, paymentIntent: confirmedIntent } =
          await stripe.confirmCardPayment(intentResponse.codigoTransaccion, {
            payment_method: {
              card: cardElement,
            },
          });

        if (confirmError) {
          setErrorGeneral(confirmError.message || "Pago rechazado por el banco");
          setProcesando(false);
          return;
        }

        if (confirmedIntent.status === "succeeded") {
          const confirmResponse = await confirmarPagoStripe({
            paymentIntentId: confirmedIntent.id,
            monto,
            metodoPago,
          });

          setProcesando(false);

          if (confirmResponse.aprobado) {
            setEstado("aprobado");
            setTimeout(() => onExito(confirmedIntent.id), 1500);
          } else {
            setErrorGeneral(confirmResponse.mensaje || "Error al registrar el pago");
          }
        } else {
          setErrorGeneral("El pago no pudo ser completado");
          setProcesando(false);
        }
      }

      if (esYapePlin) {
        const payload = {
          metodoPago,
          monto,
          numeroTarjeta: null,
          vencimiento: null,
          cvv: null,
          celular: celular.replace(/\s/g, ""),
        };

        const response = await procesarPago(payload);

        setProcesando(false);

        if (response.aprobado) {
          setEstado("aprobado");
          setTimeout(() => onExito(response.codigoTransaccion), 1500);
        } else {
          setErrorGeneral(response.mensaje || "Pago rechazado");
        }
      }
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje ||
        error.message ||
        "Error al procesar el pago. Intente con otro metodo.";
      setErrorGeneral(mensaje);
      setProcesando(false);
    }
  };

  if (estado === "aprobado") {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.contenido} style={{ textAlign: "center", padding: "48px 24px" }}>
            <div className={styles.exito}>&#10003;</div>
            <h4 style={{ color: "#28a745" }}>Pago aprobado</h4>
            <p style={{ color: "#212529" }}>Tu compra se ha realizado correctamente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h5>Pasarela de Pago</h5>
          <button className={styles.cerrar} onClick={onCancelar} disabled={procesando}>
            &times;
          </button>
        </div>

        <div className={styles.contenido}>
          <div className={styles.resumen}>
            <p className="fw-bold">{metodoPago}</p>
            <h3 className="text-danger">S/. {monto.toFixed(2)}</h3>
          </div>

          {errorGeneral && (
            <div className="alert alert-danger py-2 text-center fw-bold">{errorGeneral}</div>
          )}

          {esTarjeta && (
            <div className={styles.formulario}>
              <div className="mb-3">
                <label
                  className="form-label fw-semibold"
                  style={{ color: "#495057", fontSize: "0.85rem" }}
                >
                  Datos de la tarjeta
                </label>
                <div className={styles.cardElement}>
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
                <small style={{ color: "#6c757d", fontSize: "0.78rem" }}>
                  Tarjetas de prueba: 4242 4242 4242 4242, cualquier fecha futura, cualquier CVV
                </small>
              </div>
            </div>
          )}

          {esYapePlin && (
            <div className={styles.formulario}>
              <div className="text-center mb-3">
                <div className={styles.qrSimulado}>
                  <QRCodeSVG
                    value={`yape://pay?amount=${monto}&phone=999999999`}
                    size={100}
                    bgColor="#ffffff"
                    fgColor="#1a1a2e"
                    includeMargin={false}
                  />
                  <small className="mt-2" style={{ color: "#6c757d" }}>
                    Escanear codigo
                  </small>
                </div>
              </div>
              <div className="mb-3">
                <label
                  className="form-label fw-semibold"
                  style={{ color: "#495057", fontSize: "0.85rem" }}
                >
                  Numero de celular
                </label>
                <input
                  type="text"
                  className={`form-control ${styles.inputField} ${
                    errores.celular ? "is-invalid" : ""
                  }`}
                  placeholder="999 999 999"
                  maxLength="9"
                  value={celular}
                  disabled={procesando}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setCelular(val);
                    validarCelular(val);
                  }}
                />
                {errores.celular && (
                  <div className="invalid-feedback" style={{ color: "#dc3545" }}>
                    {errores.celular}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            className="btn btn-danger w-100 fw-bold mt-3"
            onClick={handlePagar}
            disabled={procesando || !stripe || !elements || !camposValidos()}
          >
            {procesando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Procesando...
              </>
            ) : (
              `Pagar S/. ${monto.toFixed(2)}`
            )}
          </button>
        </div>
      </div>

      {procesando && (
        <div className={styles.overlay} style={{ zIndex: 2001 }}>
          <div className={styles.modal}>
            <div className={styles.contenido} style={{ textAlign: "center", padding: "48px 24px" }}>
              <div className={styles.spinner}></div>
              <h4 style={{ color: "#212529" }}>Procesando pago...</h4>
              <p style={{ color: "#6c757d" }}>Por favor espere</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PasarelaPago;
