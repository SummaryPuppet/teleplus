import apiClient from "./apiClient";

export const crearPago = async (pago) => {
  const { data } = await apiClient.post("/api/pagos", pago);
  return data;
};

export const procesarPago = async (pagoData) => {
  const { data } = await apiClient.post("/api/pagos/procesar", pagoData);
  return data;
};

export const createPaymentIntent = async (data) => {
  const { data: response } = await apiClient.post("/api/pagos/stripe/create-payment-intent", data);
  return response;
};

export const confirmarPagoStripe = async (data) => {
  const { data: response } = await apiClient.post("/api/pagos/stripe/confirm-pago", data);
  return response;
};

export const obtenerPago = async (id) => {
  const { data } = await apiClient.get(`/api/pagos/${id}`);
  return data;
};

export const obtenerPagos = async () => {
  const { data } = await apiClient.get("/api/pagos");
  return data;
};
