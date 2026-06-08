import { Timestamp } from '@angular/fire/firestore';
import { EjercicioRutina } from './ejercicio-rutina.model';

// Colección: rutinas/{id}
export class Rutina {
  id: string = '';
  nombre: string = '';
  descripcion: string = '';
  tipo: 'predefinida' | 'personalizada' = 'personalizada';
  nivel: 'principiante' | 'intermedio' | 'avanzado' = 'principiante';
  objetivo: 'perder peso' | 'fuerza' | 'resistencia' | 'flexibilidad' = 'fuerza';
  publica: boolean = false;
  pesoMinKg: number = 0;
  pesoMaxKg: number = 0;
  creadoPor: string = '';       // uid del usuario que la creó
  asignadoA: string = '';       // uid del alumno (si es personalizada)
  diasSemana: string[] = [];    // ['lunes', 'miércoles', 'viernes']
  creadoEn: Timestamp = Timestamp.now();

  // No se guarda en Firestore — se llena al consultar la subcolección
  ejercicios: EjercicioRutina[] = [];
}
