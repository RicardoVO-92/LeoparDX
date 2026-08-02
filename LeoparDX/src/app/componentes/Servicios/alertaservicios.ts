import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  error(mensaje: string, titulo: string = 'Error') {
    Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      confirmButtonColor: '#d33'
    });
  }

  info(mensaje: string, titulo: string = 'Informacion') {
    Swal.fire({
      icon: 'info',
      title: titulo,
      text: mensaje,
      confirmButtonColor: '#3085d6'
    });
  }

  exito(mensaje: string, titulo: string = 'Exito') {
    Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonColor: '#3085d6'
    });
  }

  felicidades(mensaje: string, titulo: string = 'Felicidades') {
    Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonColor: '#3085d6'
    });
  }

  confirmar(mensaje: string, titulo: string = 'Estas seguro?') {
    return Swal.fire({
      icon: 'warning',
      title: titulo,
      text: mensaje,
      showCancelButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => result.isConfirmed);
  }
}