import { Timestamp } from '@angular/fire/firestore';

// Colección: citas/{id}
export class Cita {
  id: string = '';
  alumnoId: string = '';
  entrenadorId: string = '';
  fechaHora: Timestamp = Timestamp.now();
  duracionMin: number = 60;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' = 'pendiente';
  notas: string = '';
  creadoEn: Timestamp = Timestamp.now();
}
