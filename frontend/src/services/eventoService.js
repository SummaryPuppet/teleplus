import apiClient from "./apiClient";

const API = "/api";

export async function obtenerEventos() {
  const { data } = await apiClient.get(`${API}/eventos`);
  return data;
}

export async function obtenerEventoPorId(id) {
  const { data } = await apiClient.get(`${API}/eventos/${id}`);
  return data;
}

export async function buscarEventoPorTitulo(titulo) {
  const { data } = await apiClient.get(`${API}/eventos/buscar`, {
    params: { titulo },
  });
  return data;
}

export async function crearEvento(evento) {
  const { data } = await apiClient.post(`${API}/eventos`, evento);
  return data;
}

export async function actualizarEvento(id, evento) {
  const { data } = await apiClient.put(`${API}/eventos/${id}`, evento);
  return data;
}

export async function eliminarEvento(id) {
  await apiClient.delete(`${API}/eventos/${id}`);
}

export async function obtenerLugares() {
  const { data } = await apiClient.get(`${API}/lugares`);
  return data;
}

export async function crearLugar(lugar) {
  const { data } = await apiClient.post(`${API}/lugares`, lugar);
  return data;
}

export async function eliminarLugar(id) {
  await apiClient.delete(`${API}/lugares/${id}`);
}

export async function actualizarLugar(id, lugar) {
  const { data } = await apiClient.put(`${API}/lugares/${id}`, lugar);
  return data;
}

export async function obtenerZonas() {
  const { data } = await apiClient.get(`${API}/zonas`);
  return data;
}

export async function obtenerZonasPorLugar(lugarId) {
  const { data } = await apiClient.get(`${API}/zonas/lugar/${lugarId}`);
  return data;
}

export async function crearZona(zona) {
  const { data } = await apiClient.post(`${API}/zonas`, zona);
  return data;
}

export async function actualizarZona(id, zona) {
  const { data } = await apiClient.put(`${API}/zonas/${id}`, zona);
  return data;
}

export async function eliminarZona(id) {
  await apiClient.delete(`${API}/zonas/${id}`);
}

export async function obtenerEventoZonaPrecio() {
  const { data } = await apiClient.get(`${API}/evento-zona-precio`);
  return data;
}

export async function obtenerZonasPorEvento(eventoId) {
  const { data } = await apiClient.get(`${API}/evento-zona-precio/evento/${eventoId}`);
  return data;
}

export async function crearEventoZonaPrecio(ezp) {
  const { data } = await apiClient.post(`${API}/evento-zona-precio`, ezp);
  return data;
}

export async function actualizarEventoZonaPrecio(id, ezp) {
  const { data } = await apiClient.put(`${API}/evento-zona-precio/${id}`, ezp);
  return data;
}

export async function eliminarEventoZonaPrecio(id) {
  await apiClient.delete(`${API}/evento-zona-precio/${id}`);
}

export async function buscarEZPPorEventoZonaTipo(tituloEvento, nombreZona, tipoPrecio) {
  const { data } = await apiClient.get(`${API}/evento-zona-precio/buscar`, {
    params: { tituloEvento, nombreZona, tipoPrecio },
  });
  return data;
}
