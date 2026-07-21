package pe.edu.utp.backend.controller;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.utp.backend.dto.PagoRequestDTO;
import pe.edu.utp.backend.dto.PagoResponseDTO;
import pe.edu.utp.backend.dto.StripePaymentIntentDTO;
import pe.edu.utp.backend.dto.StripeConfirmDTO;
import pe.edu.utp.backend.entity.Pago;
import pe.edu.utp.backend.service.PagoService;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @PostMapping
    public ResponseEntity<Pago> crearpago(@Valid @RequestBody Pago pago) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.guardarpago(pago));
    }

    @PostMapping("/procesar")
    public ResponseEntity<PagoResponseDTO> procesarPago(@RequestBody PagoRequestDTO request) {
        PagoResponseDTO response = pagoService.procesarPago(request);
        if (response.aprobado()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/stripe/create-payment-intent")
    public ResponseEntity<PagoResponseDTO> createPaymentIntent(@RequestBody StripePaymentIntentDTO request) {
        PagoResponseDTO response = pagoService.crearPaymentIntent(request);
        if (response.aprobado()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/stripe/confirm-pago")
    public ResponseEntity<PagoResponseDTO> confirmarPago(@RequestBody StripeConfirmDTO request) {
        PagoResponseDTO response = pagoService.confirmarPago(request);
        if (response.aprobado()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pago> getId(@PathVariable Long id) {
        return ResponseEntity.of(pagoService.getId(id));
    }

    @GetMapping
    public ResponseEntity<List<Pago>> getall() {
        return ResponseEntity.ok(pagoService.getall());
    }
}