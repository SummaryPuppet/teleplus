package pe.edu.utp.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import pe.edu.utp.backend.dto.PagoRequestDTO;
import pe.edu.utp.backend.dto.PagoResponseDTO;
import pe.edu.utp.backend.dto.StripePaymentIntentDTO;
import pe.edu.utp.backend.dto.StripeConfirmDTO;
import pe.edu.utp.backend.entity.Compra;
import pe.edu.utp.backend.entity.Pago;
import pe.edu.utp.backend.repository.CompraRepository;
import pe.edu.utp.backend.repository.PagoRepository;
import pe.edu.utp.backend.service.PagoService;

@Service
public class PagoServiceimpl implements PagoService {

    @Autowired
    private PagoRepository repository;

    @Autowired
    private CompraRepository compraRepository;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Override
    public List<Pago> getall() {
        return repository.findAll();
    }

    @Override
    public Pago guardarpago(Pago pago) {
        return repository.save(pago);
    }

    @Override
    public Optional<Pago> getId(Long id) {
        return repository.findById(id);
    }

    @Override
    public PagoResponseDTO procesarPago(PagoRequestDTO request) {
        if (request.monto() == null || request.monto() <= 0) {
            return new PagoResponseDTO(false, "El monto debe ser mayor a 0", null);
        }
        if (request.monto() > 50000) {
            return new PagoResponseDTO(false, "El monto no puede exceder S/. 50,000", null);
        }

        String metodo = request.metodoPago();
        if (metodo == null || metodo.isBlank()) {
            return new PagoResponseDTO(false, "Metodo de pago no especificado", null);
        }

        boolean esTarjeta = "Tarjeta de credito".equals(metodo) || "Tarjeta de debito".equals(metodo);
        boolean esYapePlin = "Yape / Plin".equals(metodo);

        if (esTarjeta) {
            String errores = validarTarjeta(request);
            if (errores != null) {
                return new PagoResponseDTO(false, errores, null);
            }
        } else if (esYapePlin) {
            String errores = validarYapePlin(request);
            if (errores != null) {
                return new PagoResponseDTO(false, errores, null);
            }
        } else {
            return new PagoResponseDTO(false, "Metodo de pago no valido", null);
        }

        String codigoTransaccion = "TXN_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        return new PagoResponseDTO(true, "Pago procesado correctamente", codigoTransaccion);
    }

    private String validarTarjeta(PagoRequestDTO request) {
        String numero = request.numeroTarjeta() != null ? request.numeroTarjeta().replaceAll("\\s", "") : "";
        if (!Pattern.matches("\\d{13,19}", numero)) {
            return "Numero de tarjeta invalido (debe tener 13 a 19 digitos)";
        }
        if (!validarLuhn(numero)) {
            return "Numero de tarjeta invalido (fallo verificacion Luhn)";
        }

        String vencimiento = request.vencimiento();
        if (vencimiento == null || !Pattern.matches("\\d{2}/\\d{2}", vencimiento)) {
            return "Formato de vencimiento invalido (use MM/AA)";
        }
        try {
            String[] partes = vencimiento.split("/");
            int mes = Integer.parseInt(partes[0]);
            int anio = Integer.parseInt("20" + partes[1]);
            if (mes < 1 || mes > 12) {
                return "Mes de vencimiento invalido";
            }
            LocalDateTime fechaVenc = LocalDateTime.of(anio, mes, 28, 23, 59);
            if (fechaVenc.isBefore(LocalDateTime.now())) {
                return "La tarjeta esta vencida";
            }
        } catch (NumberFormatException e) {
            return "Formato de vencimiento invalido";
        }

        String cvv = request.cvv();
        if (cvv == null || !Pattern.matches("\\d{3,4}", cvv)) {
            return "CVV invalido (debe tener 3 o 4 digitos)";
        }

        return null;
    }

    private String validarYapePlin(PagoRequestDTO request) {
        String celular = request.celular() != null ? request.celular().replaceAll("\\s", "") : "";
        if (!Pattern.matches("^9\\d{8}$", celular)) {
            return "Numero de celular invalido (debe ser 9 digitos y empezar con 9)";
        }
        return null;
    }

    private boolean validarLuhn(String numero) {
        int suma = 0;
        boolean alternar = false;
        for (int i = numero.length() - 1; i >= 0; i--) {
            int digito = Character.getNumericValue(numero.charAt(i));
            if (alternar) {
                digito *= 2;
                if (digito > 9) {
                    digito -= 9;
                }
            }
            suma += digito;
            alternar = !alternar;
        }
        return suma % 10 == 0;
    }

    @Override
    public PagoResponseDTO crearPaymentIntent(StripePaymentIntentDTO request) {
        if (request.monto() == null || request.monto() <= 0) {
            return new PagoResponseDTO(false, "El monto debe ser mayor a 0", null);
        }

        try {
            Stripe.apiKey = stripeSecretKey;

            long amountInCents = (long) (request.monto() * 100);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(request.moneda() != null ? request.moneda() : "pen")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build())
                    .putMetadata("email", request.email() != null ? request.email() : "")
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return new PagoResponseDTO(true, "PaymentIntent creado", intent.getClientSecret());

        } catch (StripeException e) {
            return new PagoResponseDTO(false, "Error de Stripe: " + e.getMessage(), null);
        }
    }

    @Override
    public PagoResponseDTO confirmarPago(StripeConfirmDTO request) {
        if (request.paymentIntentId() == null || request.paymentIntentId().isBlank()) {
            return new PagoResponseDTO(false, "paymentIntentId es requerido", null);
        }

        try {
            Stripe.apiKey = stripeSecretKey;

            PaymentIntent intent = PaymentIntent.retrieve(request.paymentIntentId());

            if (!"succeeded".equals(intent.getStatus())) {
                return new PagoResponseDTO(false, "El pago no fue aprobado. Estado: " + intent.getStatus(), null);
            }

            Pago pago = new Pago();
            pago.setMetodo_pago(request.metodoPago() != null ? request.metodoPago() : "Tarjeta de credito");
            pago.setMonto(request.monto());
            pago.setFecha_pago(LocalDateTime.now());
            pago.setEstado("Aprobado");
            pago.setCodigo_transaccion(intent.getId());

            if (request.compraId() != null) {
                Optional<Compra> compra = compraRepository.findById(request.compraId());
                compra.ifPresent(pago::setCompra);
            }

            repository.save(pago);

            return new PagoResponseDTO(true, "Pago aprobado y registrado", intent.getId());

        } catch (StripeException e) {
            return new PagoResponseDTO(false, "Error de Stripe: " + e.getMessage(), null);
        }
    }
}