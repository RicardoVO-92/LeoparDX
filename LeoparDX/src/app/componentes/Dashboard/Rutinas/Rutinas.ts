import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { addDoc, collection, collectionData, doc, Firestore, query, updateDoc, where } from '@angular/fire/firestore';
import { DashboardComponent } from '../Dashboard';
import { Usuario } from '../../../models/usuario.model';
import { Rutina } from '../../../models/rutina.model';
import { EjercicioRutina } from '../../../models/ejercicio-rutina.model';

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

  usuario: any = new Usuario();
  nuevaRutina: any = new Rutina();
  nuevoEjercicioRutina: any = new EjercicioRutina();

  rutinas: any[] = [];
  ejerciciosCatalogo: any[] = [];
  ejerciciosRutina: any[] = [];
  diasSeleccionados: string[] = [];
  rutinaSeleccionada: any = null;

  cargandoRutinas: boolean = false;
  cargandoEjercicios: boolean = false;
  guardandoRutina: boolean = false;
  guardandoEjercicio: boolean = false;

  diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  niveles = ['principiante', 'intermedio', 'avanzado'];
  objetivos = ['ganar musculo', 'perder peso', 'mantener peso', 'resistencia'];
  tipos = ['predefinida', 'personalizada'];

  constructor() {
    this.nuevaRutina.nivel = 'intermedio';
    this.nuevaRutina.objetivo = 'perder peso';
    this.nuevaRutina.tipo = 'predefinida';
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
      this.diasSeleccionados = this.diasSeleccionados.filter((item) => item !== dia);
    }
  }

  async crearRutina() {
    if (!this.usuario.uid) {
      alert('No se encontro el usuario');
      return;
    }

    if (!this.nuevaRutina.nombre || !this.nuevaRutina.descripcion) {
      alert('Nombre y descripcion son obligatorios');
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
        pesoMinKg: Number(this.nuevaRutina.pesoMinKg || 0),
        pesoMaxKg: Number(this.nuevaRutina.pesoMaxKg || 0),
        asignadoA: this.usuario.uid,
        creadoPor: this.usuario.uid,
        creado: new Date()
      });

      const rutinaDoc = doc(this.firestore, 'Rutina', res.id);
      await updateDoc(rutinaDoc, {
        id: res.id
      });

      alert('Rutina creada con exito');
      this.limpiarRutina();
    } catch (error) {
      console.log('Error al crear rutina', error);
      alert('Hubo un error al crear la rutina');
    }

    this.guardandoRutina = false;
  }

  seleccionarRutina(rutina: any) {
    this.rutinaSeleccionada = rutina;
    this.nuevoEjercicioRutina = new EjercicioRutina();
    this.nuevoEjercicioRutina.series = 3;
    this.nuevoEjercicioRutina.repeticiones = 10;
    this.nuevoEjercicioRutina.tiempoDescansoSeg = 60;
    this.nuevoEjercicioRutina.orden = this.ejerciciosRutina.length + 1;
    this.nuevoEjercicioRutina.notas = 'ninguna';
    this.obtenerEjerciciosRutina();
  }

  obtenerEjerciciosRutina() {
    if (!this.rutinaSeleccionada || !this.rutinaSeleccionada.id) {
      return;
    }

    this.cargandoEjercicios = true;

    const ejerciciosRutinaCollection = collection(this.firestore, 'Rutina', this.rutinaSeleccionada.id, 'Ejercicio-Rutina');

    collectionData(ejerciciosRutinaCollection, { idField: 'id' }).subscribe((data: any[]) => {
      this.ejerciciosRutina = data.sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));
      this.nuevoEjercicioRutina.orden = this.ejerciciosRutina.length + 1;
      this.cargandoEjercicios = false;
    }, (error: any) => {
      console.log('Error al obtener ejercicios de rutina', error);
      this.cargandoEjercicios = false;
    });
  }

  async agregarEjercicioRutina() {
    if (!this.rutinaSeleccionada || !this.rutinaSeleccionada.id) {
      alert('Selecciona una rutina');
      return;
    }

    if (!this.nuevoEjercicioRutina.ejercicioId) {
      alert('Selecciona un ejercicio');
      return;
    }

    this.guardandoEjercicio = true;

    try {
      const ejerciciosRutinaCollection = collection(this.firestore, 'Rutina', this.rutinaSeleccionada.id, 'Ejercicio-Rutina');

      const res = await addDoc(ejerciciosRutinaCollection, {
        ejercicioId: this.nuevoEjercicioRutina.ejercicioId,
        notas: this.nuevoEjercicioRutina.notas || 'ninguna',
        orden: Number(this.nuevoEjercicioRutina.orden || 1),
        repeticiones: Number(this.nuevoEjercicioRutina.repeticiones || 0),
        series: Number(this.nuevoEjercicioRutina.series || 0),
        tiempoDescansoSeg: Number(this.nuevoEjercicioRutina.tiempoDescansoSeg || 0)
      });

      const ejercicioRutinaDoc = doc(this.firestore, 'Rutina', this.rutinaSeleccionada.id, 'Ejercicio-Rutina', res.id);
      await updateDoc(ejercicioRutinaDoc, {
        id: res.id
      });

      alert('Ejercicio agregado a la rutina');
      this.limpiarEjercicioRutina();
    } catch (error) {
      console.log('Error al agregar ejercicio a la rutina', error);
      alert('Hubo un error al agregar el ejercicio');
    }

    this.guardandoEjercicio = false;
  }

  obtenerNombreEjercicio(ejercicioId: string) {
    const ejercicio = this.ejerciciosCatalogo.find((item) => item.id === ejercicioId);
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
