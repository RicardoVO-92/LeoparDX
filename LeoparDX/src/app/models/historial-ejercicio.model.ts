import { Timestamp } from '@angular/fire/firestore';

// Subcolección: usuarios/{usuarioId}/historial/{id}
export class HistorialEjercicio {
  id: string = '';
  fecha: Timestamp = Timestamp.now();
  rutinaId: string = '';
  rutinaNombre: string = '';
  ejercicioId: string = '';
  ejercicioNombre: string = '';
  series: { peso: number; repeticiones: number }[] = [];
  volumen: number = 0; // Se calculará como sum(peso * repeticiones) de cada serie
}
