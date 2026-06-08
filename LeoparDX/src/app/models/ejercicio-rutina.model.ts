import { CatalogoEjercicio } from './catalogo-ejercicio.model';

// Subcolección: rutinas/{rutinaId}/ejercicios/{id}
export class EjercicioRutina {
  id: string = '';
  ejercicioId: string = '';
  orden: number = 0;
  series: number = 3;
  repeticiones: number = 10;
  tiempoDescansoSeg: number = 60;
  notas: string = '';

  // No se guarda en Firestore — se llena al hacer join con el catálogo
  ejercicioDetalle: CatalogoEjercicio = new CatalogoEjercicio();
}
