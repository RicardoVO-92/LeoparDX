// Coleccion: Catalogo_ejercicios/{id}
export class CatalogoEjercicio {
  id: string = '';
  nombre: string = '';
  descripcion: string = '';
  grupoMuscular: 'pecho' | 'espalda' | 'pierna' | 'hombro' | 'brazo' | 'abdomen' | 'cardio' = 'pecho';
  equipamiento: 'barra' | 'mancuernas' | 'maquina' | 'sin equipo' | 'banda' | 'polea' = 'sin equipo';
  dificultad: 'baja' | 'media' | 'alta' = 'baja';
  videoUrl: string = '';
  imagenUrl: string = '';
  activo: boolean = true;
}
