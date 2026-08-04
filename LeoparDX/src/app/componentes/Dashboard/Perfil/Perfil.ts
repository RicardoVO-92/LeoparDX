import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { addDoc, collection, collectionData, doc, Firestore, limit, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { Usuario } from '../../../models/usuario.model';
import { PerfilFisico } from '../../../models/perfil-fisico.model';
import { DashboardComponent } from '../Dashboard';
import { AlertaService } from '../../Servicios/alertaservicios';

interface MetricasSemana {
  etiqueta: string;
  valor: number;
  meta: number;
  altura: number;
}

interface MejorEjercicio {
  nombre: string;
  detalle: string;
  mejorado: boolean;
  record: boolean;
}

@Component({
  selector: 'Perfil',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './Perfil.html',
  styleUrls: ['./Perfil.css']
})

export class PerfilComponent {
  private firestore: Firestore = inject(Firestore);
  private plataformId = inject(PLATFORM_ID);
  private dashboard = inject(DashboardComponent);
  private alerta: AlertaService = inject(AlertaService);

  usuario: any = new Usuario();
  perfilFisico: any = new PerfilFisico();

  usuarioDocId: string = '';
  perfilFisicoDocId: string = '';

  cargandoUsuario: boolean = false;
  cargandoPerfilFisico: boolean = false;
  cargandoMetricas: boolean = false;
  editandoUsuario: boolean = false;
  editandoPerfilFisico: boolean = false;
  registrandoPerfilFisico: boolean = false;
  tienePerfilFisico: boolean = false;

  semanaMetricas: MetricasSemana[] = [];
  progresoSemanal: number = 0;
  metaSemanal: number = 0;
  volumenSemanal: number = 0;
  pesoMaximoLevantado: number = 0;
  mejorEjercicio: MejorEjercicio | null = null;

  constructor() {
    if (isPlatformBrowser(this.plataformId)) {
      const state = history.state as Usuario;

      if (state && state.uid) {
        this.usuario.uid = state.uid;
      } else if (this.dashboard.usuario.uid) {
        this.usuario.uid = this.dashboard.usuario.uid;
      }

      if (this.usuario.uid) {
        this.obtenerUsuario();
      }
    }
  }

  obtenerUsuario() {
    this.cargandoUsuario = true;

    const userCollection = collection(this.firestore, 'Usuarios');
    const q = query(userCollection, where('uid', '==', this.usuario.uid), limit(1));

    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      if (data.length > 0) {
        const item = data[0];

        this.usuarioDocId = item.id || '';
        this.usuario.uid = item.uid || this.usuario.uid;
        this.usuario.nombre = item.nombre || '';
        this.usuario.apellido = item.apellido || '';
        this.usuario.nombreUsuario = item.nombreUsuario || '';
        this.usuario.email = item.email || '';

        this.obtenerPerfilFisico();
        this.obtenerMetricas();
      }

      this.cargandoUsuario = false;
    }, (error: any) => {
      console.log('Error al obtener usuario', error);
      this.cargandoUsuario = false;
    });
  }

  obtenerPerfilFisico() {
    if (!this.usuarioDocId) {
      return;
    }

    this.cargandoPerfilFisico = true;

    const perfilCollection = collection(this.firestore, 'Usuarios', this.usuarioDocId, 'perfil-fisico');
    const q = query(perfilCollection, limit(1));

    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      if (data.length > 0) {
        const item = data[0];

        this.perfilFisicoDocId = item.id || '';
        this.perfilFisico.id = item.id || '';
        this.perfilFisico.peso = item.peso ?? 0;
        this.perfilFisico.altura = item.altura ?? 0;
        this.perfilFisico.objetivo = item.objetivo || '';
        this.perfilFisico.nivelActividad = item.nivelActividad || '';
        this.perfilFisico.registradoEn = item.registradoEn || '';
        this.tienePerfilFisico = true;
      } else {
        this.perfilFisico = new PerfilFisico();
        this.perfilFisicoDocId = '';
        this.tienePerfilFisico = false;
      }

      this.cargandoPerfilFisico = false;
    }, (error: any) => {
      console.log('Error al obtener perfil fisico', error);
      this.cargandoPerfilFisico = false;
    });
  }

  obtenerMetricas() {
    if (!this.usuario.uid) {
      return;
    }

    this.cargandoMetricas = true;

    const historialCollection = collection(this.firestore, `Usuarios/${this.usuario.uid}/historial`);
    const q = query(historialCollection, orderBy('fecha', 'asc'));

    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      this.procesarMetricas(data);
      this.cargandoMetricas = false;
    }, (error: any) => {
      console.log('Error al obtener metricas', error);
      this.cargandoMetricas = false;
    });
  }

  private procesarMetricas(historial: any[]) {
    const registros = historial
      .map((item: any) => {
        const fecha = item.fecha?.toDate ? item.fecha.toDate() : new Date(item.fecha);
        const volumen = Number(item.volumen ?? this.calcularVolumen(item.series ?? []));
        return { ...item, fecha, volumen };
      })
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    if (registros.length === 0) {
      this.semanaMetricas = [];
      this.progresoSemanal = 0;
      this.metaSemanal = 0;
      this.volumenSemanal = 0;
      this.pesoMaximoLevantado = 0;
      this.mejorEjercicio = null;
      return;
    }

    const hoy = new Date();
    const inicioSemanaActual = new Date(hoy);
    inicioSemanaActual.setDate(hoy.getDate() - 6);
    inicioSemanaActual.setHours(0, 0, 0, 0);

    const inicioSemanaAnterior = new Date(hoy);
    inicioSemanaAnterior.setDate(hoy.getDate() - 13);
    inicioSemanaAnterior.setHours(0, 0, 0, 0);

    const semanaActual = registros.filter((item) => item.fecha >= inicioSemanaActual);
    const semanaAnterior = registros.filter((item) => item.fecha >= inicioSemanaAnterior && item.fecha < inicioSemanaActual);

    this.volumenSemanal = semanaActual.reduce((sum, item) => sum + Number(item.volumen || 0), 0);
    this.metaSemanal = this.calcularMetaSemanal(
      semanaAnterior.reduce((sum, item) => sum + Number(item.volumen || 0), 0)
    );
    this.progresoSemanal = this.metaSemanal > 0
      ? Math.min(100, Math.round((this.volumenSemanal / this.metaSemanal) * 100))
      : 0;

    const metaDiaria = Math.max(80, Math.round(this.metaSemanal / 7));
    this.semanaMetricas = this.generarGraficaSemanal(semanaActual, hoy, metaDiaria);
    this.pesoMaximoLevantado = this.calcularPesoMaximo(registros);
    this.mejorEjercicio = this.calcularMejorEjercicio(registros, semanaActual, semanaAnterior);
  }

  private generarGraficaSemanal(registros: any[], hoy: Date, metaDiaria: number): MetricasSemana[] {
    const etiquetas = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

    return Array.from({ length: 7 }, (_, index) => {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - (6 - index));
      fecha.setHours(0, 0, 0, 0);

      const valor = registros
        .filter((item) => item.fecha.toDateString() === fecha.toDateString())
        .reduce((sum, item) => sum + Number(item.volumen || 0), 0);

      const altura = Math.min(100, Math.round((valor / (metaDiaria || 1)) * 100));

      return {
        etiqueta: etiquetas[fecha.getDay()],
        valor,
        meta: metaDiaria,
        altura
      };
    });
  }

  private calcularMetaSemanal(volumenAnterior: number): number {
    const objetivo = (this.perfilFisico.objetivo || '').toLowerCase();
    const referencia = Math.max(volumenAnterior, 800);

    if (objetivo.includes('ganar') || objetivo.includes('musculo')) {
      return Math.max(1200, Math.round(referencia * 1.2));
    }

    if (objetivo.includes('resistencia')) {
      return Math.max(1000, Math.round(referencia * 1.1));
    }

    if (objetivo.includes('perder')) {
      return Math.max(900, Math.round(referencia * 1.05));
    }

    return Math.max(1000, Math.round(referencia * 1.1));
  }

  private calcularPesoMaximo(registros: any[]): number {
    return registros.reduce((max, item) => {
      const maxSerie = (item.series ?? []).reduce((top: number, serie: any) => {
        return Math.max(top, Number(serie.peso || 0));
      }, 0);

      return Math.max(max, maxSerie);
    }, 0);
  }

  private calcularVolumen(series: any[]): number {
    return (series ?? []).reduce((sum: number, serie: any) => sum + (Number(serie.peso || 0) * Number(serie.repeticiones || 0)), 0);
  }

  private calcularMejorEjercicio(registros: any[], semanaActual: any[], semanaAnterior: any[]): MejorEjercicio {
    const actualPorEjercicio: Record<string, number> = {};
    const anteriorPorEjercicio: Record<string, number> = {};
    const maxPesoPorEjercicio: Record<string, number> = {};

    semanaActual.forEach((item) => {
      const nombre = item.ejercicioNombre || 'Sin nombre';
      actualPorEjercicio[nombre] = (actualPorEjercicio[nombre] || 0) + Number(item.volumen || 0);
      const maxPeso = (item.series ?? []).reduce((top: number, serie: any) => Math.max(top, Number(serie.peso || 0)), 0);
      maxPesoPorEjercicio[nombre] = Math.max(maxPesoPorEjercicio[nombre] || 0, maxPeso);
    });

    semanaAnterior.forEach((item) => {
      const nombre = item.ejercicioNombre || 'Sin nombre';
      anteriorPorEjercicio[nombre] = (anteriorPorEjercicio[nombre] || 0) + Number(item.volumen || 0);
    });

    const nombres = Array.from(new Set([...Object.keys(actualPorEjercicio), ...Object.keys(anteriorPorEjercicio)]));
    const candidatos = nombres.map((nombre) => {
      const actual = actualPorEjercicio[nombre] || 0;
      const anterior = anteriorPorEjercicio[nombre] || 0;
      const delta = anterior > 0 ? Math.round(((actual - anterior) / anterior) * 100) : actual > 0 ? 100 : 0;

      return {
        nombre,
        actual,
        anterior,
        delta,
        maxPeso: maxPesoPorEjercicio[nombre] || 0
      };
    });

    const mejor = candidatos.sort((a, b) => (b.delta || 0) - (a.delta || 0) || (b.actual || 0) - (a.actual || 0))[0];

    if (!mejor) {
      return {
        nombre: 'Sin datos',
        detalle: 'Completa más sesiones para ver mejoras.',
        mejorado: false,
        record: false
      };
    }

    const detalle = mejor.delta > 0
      ? `Mejoró ${mejor.delta}% frente a la semana anterior`
      : mejor.maxPeso > 0
        ? `Marca máxima de ${mejor.maxPeso} kg registrada`
        : 'Sigue entrenando para ver tu siguiente mejor marca';

    return {
      nombre: mejor.nombre,
      detalle,
      mejorado: mejor.delta > 0,
      record: mejor.maxPeso > 0 && mejor.delta >= 0
    };
  }

  async guardarUsuario() {
    if (!this.usuarioDocId) {
      return;
    }

    try {
      const usuarioDoc = doc(this.firestore, 'Usuarios', this.usuarioDocId);

      await updateDoc(usuarioDoc, {
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        nombreUsuario: this.usuario.nombreUsuario,
        email: this.usuario.email
      });

      this.alerta.exito('Perfil actualizado exitosamente');
      this.editandoUsuario = false;
    } catch (error) {
      console.log('Error al actualizar usuario', error);
      this.alerta.error('Hubo un error al actualizar el perfil');
    }
  }

  async guardarPerfilFisico() {
    if (!this.usuarioDocId) {
      return;
    }

    if (this.perfilFisico.peso === '' || this.perfilFisico.altura === '') {
      this.alerta.error('Peso y altura son obligatorios');
      return;
    }

    try {
      const perfilCollection = collection(this.firestore, 'Usuarios', this.usuarioDocId, 'perfil-fisico');

      const perfil = {
        peso: this.perfilFisico.peso,
        altura: this.perfilFisico.altura,
        objetivo: this.perfilFisico.objetivo,
        nivelActividad: this.perfilFisico.nivelActividad
      };

      if (this.tienePerfilFisico && this.perfilFisicoDocId) {
        const perfilDoc = doc(this.firestore, 'Usuarios', this.usuarioDocId, 'perfil-fisico', this.perfilFisicoDocId);
        await updateDoc(perfilDoc, perfil);
      } else {
        const res = await addDoc(perfilCollection, {
          ...perfil,
          registradoEn: new Date()
        });

        const perfilDoc = doc(this.firestore, 'Usuarios', this.usuarioDocId, 'perfil-fisico', res.id);
        await updateDoc(perfilDoc, {
          id: res.id
        });
      }

      this.alerta.exito('Perfil fisico guardado exitosamente');
      this.editandoPerfilFisico = false;
      this.registrandoPerfilFisico = false;
    } catch (error) {
      console.log('Error al guardar perfil fisico', error);
      this.alerta.error('Hubo un error al guardar el perfil fisico');
    }
  }

  mostrarFormularioPerfilFisico() {
    this.registrandoPerfilFisico = true;
    this.editandoPerfilFisico = true;
    this.perfilFisico = new PerfilFisico();
  }

  cancelarEdicionUsuario() {
    this.editandoUsuario = false;
    this.obtenerUsuario();
  }

  cancelarEdicionPerfilFisico() {
    this.editandoPerfilFisico = false;
    this.registrandoPerfilFisico = false;
    this.obtenerPerfilFisico();
  }
}