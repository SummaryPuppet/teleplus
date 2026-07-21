package pe.edu.utp.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.utp.backend.entity.Evento;
import pe.edu.utp.backend.service.EventoService;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class EventoController {

	private final EventoService eventoService;

	@GetMapping
	public List<Evento> listar() {
		return eventoService.listar();
	}

	@GetMapping("/{id}")
	public Evento buscarPorId(@PathVariable Long id) {
		return eventoService.buscarPorId(id);
	}

	@GetMapping("/buscar")
	public ResponseEntity<Evento> buscarPorTitulo(@RequestParam String titulo) {
		Evento evento = eventoService.buscarPorTitulo(titulo);
		if (evento == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(evento);
	}

	@PostMapping
	public Evento guardar(@Valid @RequestBody Evento evento) {
		return eventoService.guardar(evento);
	}

	@PutMapping("/{id}")
	public Evento actualizar(
			@PathVariable Long id,
			@RequestBody Evento evento) {
		return eventoService.actualizar(id, evento);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		boolean eliminado = eventoService.eliminar(id);
		if (!eliminado) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.noContent().build();
	}
}