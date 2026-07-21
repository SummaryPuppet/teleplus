package pe.edu.utp.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.backend.entity.Evento;
import pe.edu.utp.backend.entity.EventoZonaPrecio;
import pe.edu.utp.backend.entity.DetalleCompra;
import pe.edu.utp.backend.entity.Lugar;
import pe.edu.utp.backend.repository.EventoRepository;
import pe.edu.utp.backend.repository.EventoZonaPrecioRepository;
import pe.edu.utp.backend.repository.DetalleCompraRepository;
import pe.edu.utp.backend.repository.LugarRepository;
import pe.edu.utp.backend.service.EventoService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventoServiceImpl implements EventoService {

    private final EventoRepository eventoRepository;
    private final EventoZonaPrecioRepository eventoZonaPrecioRepository;
    private final DetalleCompraRepository detalleCompraRepository;
    private final LugarRepository lugarRepository;

    @Override
    public List<Evento> listar() {
        return eventoRepository.findAll();
    }

    @Override
    public Evento buscarPorId(Long id) {
        return eventoRepository.findById(id).orElse(null);
    }

    @Override
    public Evento buscarPorTitulo(String titulo) {
        return eventoRepository.findByTitulo(titulo).orElse(null);
    }

    @Override
    public Evento guardar(Evento evento) {

        Lugar lugar = lugarRepository.findById(
                evento.getLugar().getId()).orElseThrow();

        evento.setLugar(lugar);

        return eventoRepository.save(evento);
    }

    @Override
    public Evento actualizar(Long id, Evento nuevo) {

        Evento actual = eventoRepository.findById(id).orElseThrow();

        actual.setTitulo(nuevo.getTitulo());
        actual.setDescripcion(nuevo.getDescripcion());
        actual.setFecha_evento(nuevo.getFecha_evento());
        actual.setHora_evento(nuevo.getHora_evento());
        actual.setImagenCarrusel(nuevo.getImagenCarrusel());
        actual.setImagenPortada(nuevo.getImagenPortada());
        actual.setImagenDetalle(nuevo.getImagenDetalle());
        actual.setImagenFooter(nuevo.getImagenFooter());
        actual.setEstado(nuevo.getEstado());

        return eventoRepository.save(actual);
    }

    @Override
    @Transactional
    public boolean eliminar(Long id) {
        Evento evento = eventoRepository.findById(id).orElse(null);
        if (evento == null) {
            return false;
        }

        List<EventoZonaPrecio> ezpList = eventoZonaPrecioRepository.findByEventoId(id);

        for (EventoZonaPrecio ezp : ezpList) {
            List<DetalleCompra> detalles = detalleCompraRepository.findByEventoZonaPrecioId(ezp.getId());
            detalleCompraRepository.deleteAll(detalles);
        }

        eventoZonaPrecioRepository.deleteAll(ezpList);

        eventoRepository.deleteById(id);
        return true;
    }
}