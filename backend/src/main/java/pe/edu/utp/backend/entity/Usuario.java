package pe.edu.utp.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_usuario;

    @Column(length = 100, nullable = false)
    @NotBlank
    @Size(max = 100)
    private String nombre;

    @Column(length = 100, nullable = false)
    @NotBlank
    @Size(max = 100)
    private String apellido;

    @Column(length = 150, unique = true)
    @NotBlank
    @Email
    @Size(max = 150)
    private String correo;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(length = 100, nullable = true)
    @Size(min = 6, max = 100)
    private String contrasena;

    @Column(length = 10 )
    @Size(max = 10)
    private String telefono;

    @Column(length = 20 )
    @Size(max = 20)
    private String estado;

    @PastOrPresent
    private LocalDate fecha_registro;

    @ManyToOne
    @JoinColumn(name = "id_rol")
    @NotNull
    private Rol rol;
    @OneToMany(mappedBy = "usuario")
    @JsonIgnore
    private List<Entrada> entradas;
}
