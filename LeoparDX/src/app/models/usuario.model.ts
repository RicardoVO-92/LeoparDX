import { Timestamp } from '@angular/fire/firestore';
import { PerfilFisico } from './perfil-fisico.model';

// Colección: usuarios/{uid}
export class Usuario {
  uid: string = '';
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  telefono: string = '';
  rol: 'entrenador' | 'alumno' = 'alumno';
  fotoUrl: string = '';
  fechaNacimiento: Timestamp | null = null;
  activo: boolean = true;
  creadoEn: Timestamp = Timestamp.now();
  actualizadoEn: Timestamp = Timestamp.now();
}