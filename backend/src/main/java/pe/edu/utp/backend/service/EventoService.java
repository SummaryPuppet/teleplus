package pe.edu.utp.backend.service;

import pe.edu.utp.backend.entity.Evento;

import java.util.List;

public interface EventoService {

    List<Evento> listar();

    Evento buscarPorId(Long id);

    Evento buscarPorTitulo(String titulo);

    Evento guardar(Evento evento);

    Evento actualizar(Long id, Evento evento);

    boolean eliminar(Long id);
}