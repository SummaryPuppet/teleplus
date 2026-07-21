package pe.edu.utp.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import pe.edu.utp.backend.entity.Rol;
import pe.edu.utp.backend.entity.Usuario;
import pe.edu.utp.backend.repository.RolRepository;
import pe.edu.utp.backend.repository.UsuarioRepository;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final JwtUtil jwtUtil;

    public OAuth2SuccessHandler(UsuarioRepository usuarioRepository,
                                RolRepository rolRepository,
                                JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OidcUser oidcUser = (OidcUser) oauthToken.getPrincipal();

        String email = oidcUser.getEmail();
        String nombre = oidcUser.getGivenName() != null ? oidcUser.getGivenName() : "";
        String apellido = oidcUser.getFamilyName() != null ? oidcUser.getFamilyName() : "";
        String foto = oidcUser.getPicture() != null ? oidcUser.getPicture() : "";

        Optional<Usuario> existingUser = usuarioRepository.findByCorreo(email);

        Usuario usuario;
        if (existingUser.isPresent()) {
            usuario = existingUser.get();
            if (!nombre.isEmpty()) usuario.setNombre(nombre);
            if (!apellido.isEmpty()) usuario.setApellido(apellido);
            usuarioRepository.save(usuario);
        } else {
            Rol clienteRol = rolRepository.findByNombreRol("CLIENTE")
                    .orElseThrow(() -> new RuntimeException("Rol CLIENTE no encontrado"));

            usuario = new Usuario();
            usuario.setNombre(nombre.isEmpty() ? "Usuario" : nombre);
            usuario.setApellido(apellido.isEmpty() ? "Google" : apellido);
            usuario.setCorreo(email);
            usuario.setContrasena(null);
            usuario.setTelefono("");
            usuario.setEstado("activo");
            usuario.setFecha_registro(LocalDate.now());
            usuario.setRol(clienteRol);
            usuario = usuarioRepository.save(usuario);
        }

        String token = jwtUtil.generateToken(usuario);

        String redirectUrl = "http://localhost:5173/auth/callback"
                + "?token=" + urlEncode(token)
                + "&id=" + usuario.getId_usuario()
                + "&nombre=" + urlEncode(usuario.getNombre())
                + "&correo=" + urlEncode(usuario.getCorreo())
                + "&rol=" + urlEncode(usuario.getRol().getNombreRol());

        response.sendRedirect(redirectUrl);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
