package pe.edu.utp.backend.dto;

public record StripeConfirmDTO(
    String paymentIntentId,
    Double monto,
    String metodoPago
) {}
