package pe.edu.utp.backend.service;

import pe.edu.utp.backend.dto.PagoRequestDTO;
import pe.edu.utp.backend.dto.PagoResponseDTO;
import pe.edu.utp.backend.dto.StripePaymentIntentDTO;
import pe.edu.utp.backend.dto.StripeConfirmDTO;
import pe.edu.utp.backend.entity.Pago;
import java.util.List;
import java.util.Optional;

public interface PagoService {
    Pago guardarpago(Pago Pago);
    Optional<Pago> getId(Long id);
    List<Pago> getall();
    PagoResponseDTO procesarPago(PagoRequestDTO request);
    PagoResponseDTO crearPaymentIntent(StripePaymentIntentDTO request);
    PagoResponseDTO confirmarPago(StripeConfirmDTO request);
}