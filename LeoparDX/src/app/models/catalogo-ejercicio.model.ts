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

  setData(data: CatalogoEjercicio | null | undefined): void {
    if (!data) {
      return;
    }

    this.id = data.id ?? '';
    this.nombre = data.nombre ?? '';
    this.descripcion = data.descripcion ?? '';
    this.grupoMuscular = data.grupoMuscular ?? 'pecho';
    this.equipamiento = data.equipamiento ?? 'sin equipo';
    this.dificultad = data.dificultad ?? 'baja';
    this.videoUrl = data.videoUrl ?? '';
    this.imagenUrl = data.imagenUrl ?? '';
    this.activo = data.activo ?? true;
  }
}
