package pe.edu.utp.backend.service.impl;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import pe.edu.utp.backend.entity.Evento;
import pe.edu.utp.backend.entity.EventoZonaPrecio;
import pe.edu.utp.backend.entity.Zona;

import pe.edu.utp.backend.repository.EventoRepository;
import pe.edu.utp.backend.repository.EventoZonaPrecioRepository;
import pe.edu.utp.backend.repository.ZonaRepository;

import pe.edu.utp.backend.service.EventoZonaPrecioService;

import java.util.List;

@Service
@RequiredArgsConstructor

public class EventoZonaPrecioServiceImpl
        implements EventoZonaPrecioService {

    private final EventoZonaPrecioRepository repository;

    private final EventoRepository eventoRepository;

    private final ZonaRepository zonaRepository;

    @Override
    public List<EventoZonaPrecio> listar() {

        return repository.findAll();
    }

    @Override
    public List<EventoZonaPrecio> listarPorEvento(Long eventoId) {

        return repository.findByEventoId(eventoId);
    }

    @Override
    public EventoZonaPrecio buscarPorId(Long id) {

        return repository.findById(id).orElse(null);
    }

    @Override
    public EventoZonaPrecio buscarPorEventoZonaTipo(
            String tituloEvento, String nombreZona, String tipoPrecio) {

        return repository.buscarPorEventoZonaTipo(tituloEvento, nombreZona, tipoPrecio).orElse(null);
    }

    @Override
    public EventoZonaPrecio guardar(
            EventoZonaPrecio eventoZonaPrecio) {

        Evento evento = eventoRepository.findById(
                eventoZonaPrecio.getEvento().getId_evento()).orElseThrow();

        Zona zona = zonaRepository.findById(
                eventoZonaPrecio.getZona().getId_zona()).orElseThrow();

        eventoZonaPrecio.setEvento(evento);

        eventoZonaPrecio.setZona(zona);

        return repository.save(eventoZonaPrecio);
    }

    @Override
    public EventoZonaPrecio actualizar(
            Long id,
            EventoZonaPrecio nuevo) {

        EventoZonaPrecio actual = repository.findById(id).orElseThrow();

        actual.setTipoPrecio(nuevo.getTipoPrecio());

        actual.setPrecio(nuevo.getPrecio());

        actual.setStock(nuevo.getStock());

        actual.setStockDisponible(
                nuevo.getStockDisponible());

        actual.setActivo(nuevo.getActivo());

        actual.setFechaInicio(
                nuevo.getFechaInicio());

        actual.setFechaFin(
                nuevo.getFechaFin());

        return repository.save(actual);
    }

    @Override
    public void eliminar(Long id) {

        repository.deleteById(id);
    }
}