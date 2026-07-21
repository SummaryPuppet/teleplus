package pe.edu.utp.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.edu.utp.backend.entity.EventoZonaPrecio;

import java.util.List;
import java.util.Optional;

public interface EventoZonaPrecioRepository
        extends JpaRepository<EventoZonaPrecio, Long> {

    @Query("SELECT ezp FROM EventoZonaPrecio ezp WHERE ezp.evento.id_evento = :eventoId")
    List<EventoZonaPrecio> findByEventoId(@Param("eventoId") Long eventoId);

    @Query("SELECT ezp FROM EventoZonaPrecio ezp " +
           "JOIN ezp.evento e " +
           "JOIN ezp.zona z " +
           "WHERE LOWER(e.titulo) LIKE LOWER(CONCAT('%', :tituloEvento, '%')) " +
           "AND LOWER(z.nombre_zona) LIKE LOWER(CONCAT('%', :nombreZona, '%')) " +
           "AND LOWER(ezp.tipoPrecio) = LOWER(:tipoPrecio) " +
           "AND ezp.activo = true " +
           "AND ezp.stockDisponible > 0")
    Optional<EventoZonaPrecio> buscarPorEventoZonaTipo(
            @Param("tituloEvento") String tituloEvento,
            @Param("nombreZona") String nombreZona,
            @Param("tipoPrecio") String tipoPrecio);
}