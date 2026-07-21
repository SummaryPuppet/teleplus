package pe.edu.utp.backend.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          OAuth2SuccessHandler oAuth2SuccessHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exc -> exc
                .authenticationEntryPoint((req, res, ex) -> {
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"error\":\"No autorizado\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Auth — público
                .requestMatchers(
                    "/api/usuarios/login",
                    "/api/usuarios/login-admin",
                    "/api/usuarios/registro"
                ).permitAll()

                // OAuth2 callback
                .requestMatchers("/auth/callback").permitAll()

                // Catálogo público (solo GET)
                .requestMatchers(HttpMethod.GET,
                    "/api/eventos/**",
                    "/api/lugares/**",
                    "/api/zonas/**",
                    "/api/evento-zona-precio/**"
                ).permitAll()

                // Validación de promos durante el checkout — público
                .requestMatchers(HttpMethod.POST,
                    "/api/promociones/validar",
                    "/api/promociones/aplicar"
                ).permitAll()

                // Logout requiere autenticacion
                .requestMatchers(HttpMethod.POST, "/api/usuarios/logout").authenticated()

                // Gestión de eventos y lugares — ADMIN o MANAGER
                .requestMatchers(HttpMethod.POST, "/api/eventos/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/eventos/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/eventos/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(
                    "/api/lugares/**",
                    "/api/zonas/**",
                    "/api/evento-zona-precio/**"
                ).hasAnyRole("ADMIN", "MANAGER")

                // Gestión de promociones — ADMIN o MANAGER
                .requestMatchers("/api/promociones", "/api/promociones/**").hasAnyRole("ADMIN", "MANAGER")

                // Roles — solo ADMIN
                .requestMatchers("/api/roles/**").hasRole("ADMIN")

                // Usuarios: listar todos y eliminar — solo ADMIN
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")

                // Cualquier otra ruta requiere estar autenticado
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
