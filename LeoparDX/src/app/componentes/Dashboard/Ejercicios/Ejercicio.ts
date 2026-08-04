import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addDoc, collection, collectionData, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { CatalogoEjercicio } from '../../../models/catalogo-ejercicio.model';
import { AlertaService } from '../../Servicios/alertaservicios';

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
  private alerta: AlertaService = inject(AlertaService);

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
        .filter((ejercicio) => ejercicio.activo !== false)
        .map((campo) => {
          const ejercicio = new CatalogoEjercicio();
          ejercicio.id = campo.id || '';
          ejercicio.nombre = campo.nombre || '';
          ejercicio.descripcion = campo.descripcion || '';
          ejercicio.grupoMuscular = campo.grupoMuscular || 'pecho';
          ejercicio.equipamiento = campo.equipamiento || 'sin equipo';
          ejercicio.dificultad = campo.dificultad || 'baja';
          ejercicio.videoUrl = campo.videoUrl || '';
          ejercicio.imagenUrl = campo.imagenUrl || '';
          ejercicio.activo = campo.activo !== false;
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
      this.alerta.error('El nombre y la descripcion son obligatorios');
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

      this.alerta.exito('Ejercicio creado exitosamente');
      this.limpiarFormulario();
      this.cerrarModalEjercicio();
    } catch (error) {
      console.log('Error al registrar ejercicio', error);
      this.alerta.error('Hubo un error al registrar el ejercicio');
    }

    this.guardando = false;
  }

  async eliminarEjercicio(ejercicio: CatalogoEjercicio) {
    if (!ejercicio.id) {
      return;
    }

    const confirmar = await this.alerta.confirmar('Quieres eliminar este ejercicio de la tabla?');

    if (!confirmar) {
      return;
    }

    try {
      const ejercicioDoc = doc(this.firestore, 'Catalogo_ejercicios', ejercicio.id);
      await updateDoc(ejercicioDoc, {
        activo: false
      });
      this.alerta.exito('Ejercicio eliminado exitosamente');
    } catch (error) {
      console.log('Error al eliminar ejercicio', error);
      this.alerta.error('Hubo un error al eliminar el ejercicio');
    }
  }

  editarEjercicio(ejercicio: CatalogoEjercicio) {
    const copiaEjercicio = new CatalogoEjercicio();
    copiaEjercicio.setData(ejercicio);

    this.editandoEjercicio = true;
    this.ejercicioEditando = copiaEjercicio;
  }

  async actualizarEjercicio() {
    if (!this.ejercicioEditando.id) {
      return;
    }

    if (!this.ejercicioEditando.nombre || !this.ejercicioEditando.descripcion) {
      this.alerta.error('El nombre y la descripcion son obligatorios');
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

      this.alerta.exito('Ejercicio actualizado exitosamente');
      this.cancelarEdicion();
    } catch (error) {
      console.log('Error al actualizar ejercicio', error);
      this.alerta.error('Hubo un error al actualizar el ejercicio');
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