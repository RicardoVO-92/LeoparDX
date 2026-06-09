// services/usuario.service.ts
import { Injectable } from '@angular/core';
import { Usuario } from '../models';

@Injectable({ providedIn: 'root' }) // ← "root" = vive toda la app
export class UsuarioService {
  
  usuarioActual: Usuario = new Usuario();

  setUsuario(u: Usuario) {
    this.usuarioActual = u;
  }

  getUsuario(): Usuario {
    return this.usuarioActual;
  }

  limpiar() {
    this.usuarioActual = new Usuario();
  }
}