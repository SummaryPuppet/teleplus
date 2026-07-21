package pe.edu.utp.backend.dto;

public record StripePaymentIntentDTO(
    Double monto,
    String moneda,
    String email
) {}
