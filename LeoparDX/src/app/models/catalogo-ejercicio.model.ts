// Colección: catalogo_ejercicios/{id}
export class CatalogoEjercicio {
  id: string = '';
  nombre: string = '';
  descripcion: string = '';
  grupoMuscular: 'pecho' | 'espalda' | 'pierna' | 'hombro' | 'brazo' | 'abdomen' | 'cardio' = 'pecho';
  equipamiento: 'barra' | 'mancuernas' | 'máquina' | 'sin equipo' | 'banda' | 'polea' = 'sin equipo';
  dificultad: 'baja' | 'media' | 'alta' = 'baja';
  videoUrl: string = '';
  imagenUrl: string = '';
}
