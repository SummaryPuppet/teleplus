package pe.edu.utp.backend.service;

import pe.edu.utp.backend.entity.EventoZonaPrecio;

import java.util.List;

public interface EventoZonaPrecioService {

    List<EventoZonaPrecio> listar();

    List<EventoZonaPrecio> listarPorEvento(Long eventoId);

    EventoZonaPrecio buscarPorId(Long id);

    EventoZonaPrecio buscarPorEventoZonaTipo(String tituloEvento, String nombreZona, String tipoPrecio);

    EventoZonaPrecio guardar(EventoZonaPrecio eventoZonaPrecio);

    EventoZonaPrecio actualizar(Long id, EventoZonaPrecio eventoZonaPrecio);

    void eliminar(Long id);
}