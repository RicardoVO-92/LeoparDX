import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addDoc, collection, collectionData, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { CatalogoEjercicio } from '../../../models/catalogo-ejercicio.model';

@Component({
  selector: 'Ejercicios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './Ejercicio.html',
  styleUrls: ['./Ejercicio.css']
})
export class EjercicioComponent implements OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private ejerciciosSubscription?: Subscription;

  ejercicios: CatalogoEjercicio[] = [];
  nuevoEjercicio: CatalogoEjercicio = new CatalogoEjercicio();
  ejercicioEditando: CatalogoEjercicio = new CatalogoEjercicio();
  cargando: boolean = false;
  guardando: boolean = false;
  editandoEjercicio: boolean = false;
  modalEjercicio: boolean = false;
  pasoEjercicio: number = 1;

  gruposMusculares: CatalogoEjercicio['grupoMuscular'][] = ['pecho', 'espalda', 'pierna', 'hombro', 'brazo', 'abdomen', 'cardio'];
  equipamientos: CatalogoEjercicio['equipamiento'][] = ['barra', 'mancuernas', 'maquina', 'sin equipo', 'banda', 'polea'];
  dificultades: CatalogoEjercicio['dificultad'][] = ['baja', 'media', 'alta'];

  constructor() {
    this.obtenerEjercicios();
  }

  obtenerEjercicios() {
    this.cargando = true;

    const ejerciciosCollection = collection(this.firestore, 'Catalogo_ejercicios');

    this.ejerciciosSubscription = collectionData(ejerciciosCollection, { idField: 'id' }).subscribe((data: any[]) => {
      this.ejercicios = data
        .filter((item) => item.activo !== false)
        .map((item) => {
          const ejercicio = new CatalogoEjercicio();
          ejercicio.id = item.id || '';
          ejercicio.nombre = item.nombre || '';
          ejercicio.descripcion = item.descripcion || '';
          ejercicio.grupoMuscular = item.grupoMuscular || 'pecho';
          ejercicio.equipamiento = item.equipamiento || 'sin equipo';
          ejercicio.dificultad = item.dificultad || 'baja';
          ejercicio.videoUrl = item.videoUrl || '';
          ejercicio.imagenUrl = item.imagenUrl || '';
          ejercicio.activo = item.activo !== false;
          return ejercicio;
        });

      this.cargando = false;
    }, (error: any) => {
      console.log('Error al obtener ejercicios', error);
      this.cargando = false;
    });
  }

  async agregarEjercicio() {
    if (!this.nuevoEjercicio.nombre || !this.nuevoEjercicio.descripcion) {
      alert('El nombre y la descripcion son obligatorios');
      return;
    }

    this.guardando = true;

    try {
      const ejerciciosCollection = collection(this.firestore, 'Catalogo_ejercicios');

      await addDoc(ejerciciosCollection, {
        nombre: this.nuevoEjercicio.nombre,
        descripcion: this.nuevoEjercicio.descripcion,
        grupoMuscular: this.nuevoEjercicio.grupoMuscular,
        equipamiento: this.nuevoEjercicio.equipamiento,
        dificultad: this.nuevoEjercicio.dificultad,
        videoUrl: this.nuevoEjercicio.videoUrl,
        imagenUrl: this.nuevoEjercicio.imagenUrl,
        activo: true
      });

      alert('Ejercicio registrado con exito');
      this.limpiarFormulario();
      this.cerrarModalEjercicio();
    } catch (error) {
      console.log('Error al registrar ejercicio', error);
      alert('Hubo un error al registrar el ejercicio');
    }

    this.guardando = false;
  }

  async eliminarEjercicio(ejercicio: CatalogoEjercicio) {
    if (!ejercicio.id) {
      return;
    }

    const confirmar = confirm('Quieres eliminar este ejercicio de la tabla?');

    if (!confirmar) {
      return;
    }

    try {
      const ejercicioDoc = doc(this.firestore, 'Catalogo_ejercicios', ejercicio.id);
      await updateDoc(ejercicioDoc, {
        activo: false
      });
    } catch (error) {
      console.log('Error al eliminar ejercicio', error);
      alert('Hubo un error al eliminar el ejercicio');
    }
  }

  editarEjercicio(ejercicio: CatalogoEjercicio) {
    this.editandoEjercicio = true;
    this.ejercicioEditando = Object.assign(new CatalogoEjercicio(), ejercicio);
  }

  async actualizarEjercicio() {
    if (!this.ejercicioEditando.id) {
      return;
    }

    if (!this.ejercicioEditando.nombre || !this.ejercicioEditando.descripcion) {
      alert('El nombre y la descripcion son obligatorios');
      return;
    }

    try {
      const ejercicioDoc = doc(this.firestore, 'Catalogo_ejercicios', this.ejercicioEditando.id);

      await updateDoc(ejercicioDoc, {
        nombre: this.ejercicioEditando.nombre,
        descripcion: this.ejercicioEditando.descripcion,
        grupoMuscular: this.ejercicioEditando.grupoMuscular,
        equipamiento: this.ejercicioEditando.equipamiento,
        dificultad: this.ejercicioEditando.dificultad,
        videoUrl: this.ejercicioEditando.videoUrl,
        imagenUrl: this.ejercicioEditando.imagenUrl
      });

      alert('Ejercicio actualizado con exito');
      this.cancelarEdicion();
    } catch (error) {
      console.log('Error al actualizar ejercicio', error);
      alert('Hubo un error al actualizar el ejercicio');
    }
  }

  cancelarEdicion() {
    this.editandoEjercicio = false;
    this.ejercicioEditando = new CatalogoEjercicio();
  }

  limpiarFormulario() {
    this.nuevoEjercicio = new CatalogoEjercicio();
    this.pasoEjercicio = 1;
  }

  abrirModalEjercicio() {
    this.modalEjercicio = true;
    this.pasoEjercicio = 1;
  }

  cerrarModalEjercicio() {
    this.modalEjercicio = false;
    this.pasoEjercicio = 1;
  }

  siguientePasoEjercicio() {
    if (this.pasoEjercicio < 3) {
      this.pasoEjercicio = this.pasoEjercicio + 1;
    }
  }

  anteriorPasoEjercicio() {
    if (this.pasoEjercicio > 1) {
      this.pasoEjercicio = this.pasoEjercicio - 1;
    }
  }

  ngOnDestroy() {
    this.ejerciciosSubscription?.unsubscribe();
  }
}
