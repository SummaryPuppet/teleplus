package pe.edu.utp.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.utp.backend.entity.Evento;
import java.util.Optional;
@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    Optional<Evento> findByTitulo(String titulo);
}
