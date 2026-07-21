package pe.edu.utp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_pago;
    @Column(length = 150)
    @NotBlank
    @Size(max = 150)
    private String metodo_pago;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private Double monto ;

    @NotNull
    private LocalDateTime fecha_pago ;

    @Column(length = 150)
    @Size(max = 150)
    private String estado ;

    @Column(length = 150)
    @Size(max = 150)
    private String codigo_transaccion;

    @ManyToOne
    @JoinColumn(name = "id_compra", nullable = true)
    private Compra compra;
}
