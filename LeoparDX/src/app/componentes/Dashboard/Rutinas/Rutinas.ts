import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { addDoc, collection, collectionData, doc, Firestore, query, updateDoc, where, writeBatch } from '@angular/fire/firestore';
import { DashboardComponent } from '../Dashboard';
import { Usuario } from '../../../models/usuario.model';
import { Rutina } from '../../../models/rutina.model';
import { EjercicioRutina } from '../../../models/ejercicio-rutina.model';
import { HistorialEjercicio } from '../../../models';
import { Timestamp } from '@angular/fire/firestore';
import { AlertaService } from '../../Servicios/alertaservicios';

@Component({
  selector: 'Rutinas',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './Rutinas.html',
  styleUrls: ['./Rutinas.css']
})

export class RutinasComponent {
  private firestore: Firestore = inject(Firestore);
  private plataformId = inject(PLATFORM_ID);
  private dashboard = inject(DashboardComponent);
  private alerta: AlertaService = inject(AlertaService);

  usuario = new Usuario();
  nuevaRutina = new Rutina();
  nuevoEjercicioRutina= new EjercicioRutina();

  rutinas: any[] = [];
  ejerciciosCatalogo: any[] = [];
  ejerciciosRutina: any[] = [];
  entrenamientoActual: any[] = [];
  diasSeleccionados: string[] = [];
  rutinaSeleccionada: any = null;
  rutinaIniciada: boolean = false;
  descansoActivo: boolean = false;
  descansoSegundos: number = 0;
  descansoEjercicioId: string = '';
  descansoInterval: any = null;
  pasoRutina: number = 1;
  modalRutina: boolean = false;
  modalEjercicio: boolean = false;
  ultimoEjercicioEntrenado: any = null;

  cargandoRutinas: boolean = false;
  cargandoEjercicios: boolean = false;
  guardandoRutina: boolean = false;
  guardandoEjercicio: boolean = false;
  guardandoEntrenamiento: boolean = false;

  diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  niveles = ['principiante', 'intermedio', 'avanzado'];
  objetivos = ['ganar musculo', 'perder peso', 'mantener peso', 'resistencia'];
  tipos = ['predefinida', 'personalizada'];

  constructor() {
    this.nuevaRutina.nivel = 'intermedio';
    this.nuevaRutina.objetivo = 'perder peso';
    this.nuevaRutina.tipo = 'personalizada';
    this.nuevaRutina.publica = false;
    this.nuevaRutina.pesoMinKg = 0;
    this.nuevaRutina.pesoMaxKg = 0;

    this.nuevoEjercicioRutina.series = 3;
    this.nuevoEjercicioRutina.repeticiones = 10;
    this.nuevoEjercicioRutina.tiempoDescansoSeg = 60;
    this.nuevoEjercicioRutina.orden = 1;
    this.nuevoEjercicioRutina.notas = 'ninguna';

    if (isPlatformBrowser(this.plataformId)) {
      const state = history.state as Usuario;

      if (state && state.uid) {
        this.usuario.uid = state.uid;
      } else if (this.dashboard.usuario.uid) {
        this.usuario.uid = this.dashboard.usuario.uid;
      }

      if (this.usuario.uid) {
        this.obtenerRutinas();
        this.obtenerEjerciciosCatalogo();
      }
    }
  }

  obtenerRutinas() {
    this.cargandoRutinas = true;

    const rutinaCollection = collection(this.firestore, 'Rutina');
    const q = query(rutinaCollection, where('asignadoA', '==', this.usuario.uid));

    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      this.rutinas = data;
      this.cargandoRutinas = false;
    }, (error: any) => {
      console.log('Error al obtener rutinas', error);
      this.cargandoRutinas = false;
    });
  }

  obtenerEjerciciosCatalogo() {
    const ejerciciosCollection = collection(this.firestore, 'Catalogo_ejercicios');

    collectionData(ejerciciosCollection, { idField: 'id' }).subscribe((data: any[]) => {
      this.ejerciciosCatalogo = data.filter((item) => item.activo !== false);
    }, (error: any) => {
      console.log('Error al obtener ejercicios del catalogo', error);
    });
  }

  cambiarDia(dia: string, event: Event) {
    const seleccionado = (event.target as HTMLInputElement).checked;

    if (seleccionado) {
      this.diasSeleccionados.push(dia);
    } else {
      this.diasSeleccionados = this.diasSeleccionados.filter((diaDesSeleccionado) => diaDesSeleccionado !== dia);
    }
  }

  siguientePasoRutina() {
    if (this.pasoRutina < 3) {
      this.pasoRutina = this.pasoRutina + 1;
    }
  }

  abrirModalRutina() {
    this.modalRutina = true;
    this.pasoRutina = 1;
  }

  cerrarModalRutina() {
    this.modalRutina = false;
    this.pasoRutina = 1;
  }

  abrirModalEjercicio() {
    this.modalEjercicio = true;
  }

  cerrarModalEjercicio() {
    this.modalEjercicio = false;
  }

  anteriorPasoRutina() {
    if (this.pasoRutina > 1) {
      this.pasoRutina = this.pasoRutina - 1;
    }
  }

  async crearRutina() {
    if (!this.usuario.uid) {
      this.alerta.error('No se encontro el usuario');
      return;
    }

    if (!this.nuevaRutina.nombre || !this.nuevaRutina.descripcion) {
      this.alerta.error('Nombre y descripcion son obligatorios');
      return;
    }

    this.guardandoRutina = true;

    try {
      const rutinaCollection = collection(this.firestore, 'Rutina');

      const res = await addDoc(rutinaCollection, {
        nombre: this.nuevaRutina.nombre,
        descripcion: this.nuevaRutina.descripcion,
        objetivo: this.nuevaRutina.objetivo,
        nivel: this.nuevaRutina.nivel,
        tipo: this.nuevaRutina.tipo,
        publica: this.nuevaRutina.publica,
        diasSemana: this.diasSeleccionados,
        pesoMinKg: this.nuevaRutina.pesoMinKg || 0,
        pesoMaxKg: this.nuevaRutina.pesoMaxKg || 0,
        asignadoA: this.usuario.uid,
        creadoPor: this.usuario.uid,
        creado: new Date()
      });

      const rutinaDoc = doc(this.firestore, 'Rutina', res.id);
      await updateDoc(rutinaDoc, {
        id: res.id
      });

      this.alerta.exito('Rutina creada exitosamente');
      this.limpiarRutina();
      this.cerrarModalRutina();
    } catch (error) {
      console.log('Error al crear rutina', error);
      this.alerta.error('Hubo un error al crear la rutina');
    }

    this.guardandoRutina = false;
  }

  seleccionarRutina(rutina: any) {
    this.rutinaSeleccionada = rutina;
    this.rutinaIniciada = false;
    this.entrenamientoActual = [];
    this.nuevoEjercicioRutina = new EjercicioRutina();
    this.nuevoEjercicioRutina.series = 3;
    this.nuevoEjercicioRutina.repeticiones = 10;
    this.nuevoEjercicioRutina.tiempoDescansoSeg = 60;
    this.nuevoEjercicioRutina.orden = this.ejerciciosRutina.length + 1;
    this.nuevoEjercicioRutina.notas = 'ninguna';
    this.obtenerEjerciciosRutina();
  }

  obtenerEjerciciosRutina() {
    if (!this.rutinaSeleccionada?.id) {
      return;
    }

    this.cargandoEjercicios = true;

    const rutinasSubcoleccion = collection(this.firestore, 'Rutina', this.rutinaSeleccionada.id, 'Ejercicio-Rutina');

    collectionData(rutinasSubcoleccion, { idField: 'id' }).subscribe(
      (ejerciciosObtenidos: any[]) => {
        this.ejerciciosRutina = this.ordenarEjerciciosPorOrden(ejerciciosObtenidos);
        this.nuevoEjercicioRutina.orden = this.ejerciciosRutina.length + 1;
        
        this.validarYPrepararEntrenamiento();
        this.cargandoEjercicios = false;
      },(error: any) => {
        console.error('Error al obtener ejercicios de rutina:', error);
        this.cargandoEjercicios = false;
      }
    );
  }

  ordenarEjerciciosPorOrden(ejercicios: any[]) {
    return ejercicios.sort((ejercicio1, ejercicio2) => 
      Number(ejercicio1.orden || 0) - Number(ejercicio2.orden || 0)
    );
  }

  validarYPrepararEntrenamiento() {
    if (!this.rutinaIniciada) return;

    if (this.ejerciciosRutina.length === 0) {
      this.rutinaIniciada = false;
      this.alerta.info('No ha agregado ejercicios a su rutina');
    } else {
      this.prepararEntrenamiento();
    }
  }

  iniciarRutina(rutina: any) {
    this.rutinaSeleccionada = rutina;
    this.rutinaIniciada = true;
    this.obtenerEjerciciosRutina();
  }

  prepararEntrenamiento() {
    this.entrenamientoActual = this.ejerciciosRutina.map((ejercicio) => {
      return {
        ejercicioRutinaId: ejercicio.id,
        ejercicioId: ejercicio.ejercicioId,
        nombre: this.obtenerNombreEjercicio(ejercicio.ejercicioId),
        orden: ejercicio.orden,
        seriesPlaneadas: ejercicio.series,
        repeticionesPlaneadas: ejercicio.repeticiones,
        descansoPlaneado: ejercicio.tiempoDescansoSeg,
        notas: ejercicio.notas,
        series: Array.from({ length: ejercicio.series }, () => ({ peso: 0, repeticiones: ejercicio.repeticiones, completado: false })),
        completado: false
      };
    });
  }

  iniciarDescanso(ejercicio: any) {
    if (this.descansoInterval) {
      clearInterval(this.descansoInterval);
    }

    this.descansoActivo = true;
    this.descansoEjercicioId = ejercicio.ejercicioRutinaId;
    this.descansoSegundos = ejercicio.descansoPlaneado || 60;

    this.descansoInterval = setInterval(() => {
      this.descansoSegundos = this.descansoSegundos - 1;

      if (this.descansoSegundos <= 0) {
        clearInterval(this.descansoInterval);
        this.descansoInterval = null;
        this.descansoActivo = false;
        this.descansoEjercicioId = '';
      }
    }, 1000);
  }

  marcarSerie(serie: any, ejercicio: any) {
    serie.completado = !serie.completado;
    this.ultimoEjercicioEntrenado = ejercicio;
  }

  async finalizarRutina() {
    if (!this.rutinaSeleccionada?.id) {
      return;
    }

    if (this.entrenamientoActual.length === 0) {
      this.alerta.info('No ha agregado ejercicios a su rutina');
      return;
    }

    this.guardandoEntrenamiento = true;

    try {
      const GuardarDocumentos = writeBatch(this.firestore);
      const historialColeccion = collection(this.firestore, `Usuarios/${this.usuario.uid}/historial`);

      this.entrenamientoActual.forEach(ejercicioEntrenamiento => {
        const registroHistorial = this.crearRegistroHistorial(ejercicioEntrenamiento);
        const referenciaDocumento = doc(historialColeccion);
        
        registroHistorial.id = referenciaDocumento.id;
        GuardarDocumentos.set(referenciaDocumento, registroHistorial);
      });

      await GuardarDocumentos.commit();
      this.manejarRutinaCompletada();

    } catch (error) {
      console.error('Error al finalizar rutina:', error);
      this.alerta.error('Hubo un error al finalizar la rutina');
    }

    this.guardandoEntrenamiento = false;
  }

  crearRegistroHistorial(ejercicioEntrenamiento: any): HistorialEjercicio {
    const volumenTotal = this.calcularVolumenEjercicio(ejercicioEntrenamiento.series);
    const seriesFormato = ejercicioEntrenamiento.series.map((serie: any) => ({ 
      peso: serie.peso, 
      repeticiones: serie.repeticiones 
    }));

    return {
      id: '',
      fecha: Timestamp.now(),
      rutinaId: this.rutinaSeleccionada.id,
      rutinaNombre: this.rutinaSeleccionada.nombre,
      ejercicioId: ejercicioEntrenamiento.ejercicioId,
      ejercicioNombre: ejercicioEntrenamiento.nombre,
      series: seriesFormato,
      volumen: volumenTotal
    };
  }

  calcularVolumenEjercicio(series: any[]): number {
    return series.reduce((volumenTotal, serie) => 
      volumenTotal + (serie.peso * serie.repeticiones), 0
    );
  }

  manejarRutinaCompletada() {
    this.alerta.felicidades('Has completado tu rutina, ¡sigue así!');
    this.rutinaIniciada = false;
    this.entrenamientoActual = [];
  }

  async agregarEjercicioRutina() {
    if (!this.rutinaSeleccionada || !this.rutinaSeleccionada.id) {
      this.alerta.error('Selecciona una rutina');
      return;
    }

    if (!this.nuevoEjercicioRutina.ejercicioId) {
      this.alerta.error('Selecciona un ejercicio');
      return;
    }

    this.guardandoEjercicio = true;

    try {
      const ejerciciosRutinaCollection = collection(this.firestore, 'Rutina', this.rutinaSeleccionada.id, 'Ejercicio-Rutina');

      const rutina = await addDoc(ejerciciosRutinaCollection, {
        ejercicioId: this.nuevoEjercicioRutina.ejercicioId,
        notas: this.nuevoEjercicioRutina.notas || 'ninguna',
        orden: this.nuevoEjercicioRutina.orden || 1,
        repeticiones: this.nuevoEjercicioRutina.repeticiones || 0,
        series: this.nuevoEjercicioRutina.series || 0,
        tiempoDescansoSeg: this.nuevoEjercicioRutina.tiempoDescansoSeg || 0
      });

      const ejercicioRutinaDoc = doc(this.firestore, 'Rutina', this.rutinaSeleccionada.id, 'Ejercicio-Rutina', rutina.id);
      await updateDoc(ejercicioRutinaDoc, {
        id: rutina.id
      });

      this.alerta.exito('Ejercicio agregado a la rutina exitosamente');
      this.limpiarEjercicioRutina();
      this.cerrarModalEjercicio();
    } catch (error) {
      console.log('Error al agregar ejercicio a la rutina', error);
      this.alerta.error('Hubo un error al agregar el ejercicio');
    }

    this.guardandoEjercicio = false;
  }

  obtenerNombreEjercicio(ejercicioId: string) {
    const ejercicio = this.ejerciciosCatalogo.find((Ejercicio) => Ejercicio.id === ejercicioId);
    return ejercicio ? ejercicio.nombre : ejercicioId;
  }

  limpiarRutina() {
    this.nuevaRutina = new Rutina();
    this.nuevaRutina.nivel = 'intermedio';
    this.nuevaRutina.objetivo = 'perder peso';
    this.nuevaRutina.tipo = 'predefinida';
    this.nuevaRutina.publica = false;
    this.nuevaRutina.pesoMinKg = 0;
    this.nuevaRutina.pesoMaxKg = 0;
    this.diasSeleccionados = [];
    this.pasoRutina = 1;
  }

  limpiarEjercicioRutina() {
    this.nuevoEjercicioRutina = new EjercicioRutina();
    this.nuevoEjercicioRutina.series = 3;
    this.nuevoEjercicioRutina.repeticiones = 10;
    this.nuevoEjercicioRutina.tiempoDescansoSeg = 60;
    this.nuevoEjercicioRutina.orden = this.ejerciciosRutina.length + 1;
    this.nuevoEjercicioRutina.notas = 'ninguna';
  }
}