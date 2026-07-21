package pe.edu.utp.backend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import pe.edu.utp.backend.entity.Entrada;
import pe.edu.utp.backend.entity.EventoZonaPrecio;
import pe.edu.utp.backend.entity.Usuario;
import pe.edu.utp.backend.repository.EntradaRepository;
import pe.edu.utp.backend.repository.EventoZonaPrecioRepository;
import pe.edu.utp.backend.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/entradas")
public class EntradaController {

        @Autowired
        private EntradaRepository repository;
        @Autowired
        private UsuarioRepository usuarioRepository;
        @Autowired
        private EventoZonaPrecioRepository eventoZonaPrecioRepository;

        private Usuario obtenerUsuario(Authentication authentication) {
                String correo = authentication.getName();
                return usuarioRepository.findByCorreo(correo)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        }

        // ===== LISTAR =====
        @GetMapping
        public List<Entrada> listar(Authentication authentication) {
                Usuario usuario = obtenerUsuario(authentication);
                return repository.buscarPorUsuario(usuario.getId_usuario());
        }

        // ===== BUSCAR POR ID =====
        @GetMapping("/{id}")
        public Entrada obtener(@PathVariable Long id) {
                return repository.findById(id).orElse(null);
        }

        // ===== CREAR =====
        @PostMapping
        public Entrada guardar(@RequestBody Entrada entrada, Authentication authentication) {
                entrada.setFecha_generacion(LocalDate.now());
                Usuario usuario = obtenerUsuario(authentication);
                entrada.setUsuario(usuario);

                Long eventoZonaPrecioId = entrada.getEventoZonaPrecio().getId();
                EventoZonaPrecio eventoZonaPrecio = eventoZonaPrecioRepository.findById(eventoZonaPrecioId)
                                .orElseThrow(() -> new RuntimeException("EventoZonaPrecio no encontrado"));
                entrada.setEventoZonaPrecio(eventoZonaPrecio);

                return repository.save(entrada);
        }

        // ===== ACTUALIZAR =====
        @PutMapping("/{id}")
        public Entrada actualizar(
                        @PathVariable Long id,
                        @RequestBody Entrada entrada) {
                Entrada actual = repository.findById(id).orElse(null);

                if (actual != null) {
                        actual.setCodigo_qr(entrada.getCodigo_qr());
                        actual.setEstado(entrada.getEstado());
                        actual.setPrecio_final(entrada.getPrecio_final());
                        actual.setFecha_generacion(entrada.getFecha_generacion());
                        actual.setReservado_hasta(entrada.getReservado_hasta());
                        return repository.save(actual);
                }

                return null;
        }

        // ===== ELIMINAR =====
        @DeleteMapping("/{id}")
        public void eliminar(@PathVariable Long id) {
                repository.deleteById(id);
        }
}
