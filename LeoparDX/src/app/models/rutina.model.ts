import { Timestamp } from '@angular/fire/firestore';
import { EjercicioRutina } from './ejercicio-rutina.model';

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
  creadoPor: string = '';       
  asignadoA: string = '';     
  diasSemana: string[] = [];   
  creadoEn: Timestamp = Timestamp.now();
  ejercicios: EjercicioRutina[] = [];
}
