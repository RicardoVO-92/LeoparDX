import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDocs, query, where, Timestamp } from '@angular/fire/firestore';
import { DashboardComponent } from '../Dashboard';
import { Usuario } from '../../../models/usuario.model';
import { Cita } from '../../../models/cita.model';
import { AlertaService } from '../../Servicios/alertaservicios';

@Component({
  selector: 'agendar-citas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './AgendarCitas.html',
  styleUrls: ['./AgendarCitas.css']
})
export class AgendarCitasComponent {
  private firestore: Firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  private dashboard = inject(DashboardComponent);
  private alerta: AlertaService = inject(AlertaService);

  usuario: any = new Usuario();
  nuevaCita: any = {
    fecha: '',
    hora: ''
  };
  citas: any[] = [];
  cargandoCitas: boolean = false;
  guardandoCita: boolean = false;

  diasSemana: Date[] = [];
  horarios: string[] = ['13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00'];
  limitePorHorario = 45;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const state = history.state as Usuario;

      if (state && state.uid) {
        this.usuario.uid = state.uid;
      } else if (this.dashboard.usuario.uid) {
        this.usuario.uid = this.dashboard.usuario.uid;
      }

      if (this.usuario.uid) {
        this.obtenerCitas();
      }

      this.generarDiasSemana();
    }
  }

  generarDiasSemana() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1));

    for (let i = 0; i < 5; i++) {
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      this.diasSemana.push(dia);
    }
  }

  obtenerCitas() {
    this.cargandoCitas = true;
    const citasCollection = collection(this.firestore, 'Cita');
    const q = query(citasCollection, where('alumnoId', '==', this.usuario.uid));

    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      this.citas = data.map(cita => ({
        ...cita,
        fechaHora: (cita.fechaHora as Timestamp).toDate()
      })).sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
      this.cargandoCitas = false;
    }, (error: any) => {
      console.error('Error al obtener citas:', error);
      this.cargandoCitas = false;
    });
  }

  paso: number = 1;
  modalAbierto: boolean = false;

  abrirModal() {
    this.modalAbierto = true;
    this.paso = 1;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  siguientePaso() {
    if (this.paso < 2) {
      this.paso++;
    }
  }

  pasoAnterior() {
    if (this.paso > 1) {
      this.paso--;
    }
  }

  async agendarCita() {
    if (!this.nuevaCita.fecha || !this.nuevaCita.hora) {
      this.alerta.error('Debes seleccionar un dia y una hora');
      return;
    }

    this.guardandoCita = true;

    try {
      const [horaInicio] = this.nuevaCita.hora.split('-');
      const [horas, minutos] = horaInicio.split(':');
      const fecha = new Date(this.nuevaCita.fecha);
      fecha.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);

      const esValida = await this.validarCita(fecha);
      if (!esValida) {
        this.guardandoCita = false;
        return;
      }

      const citasCollection = collection(this.firestore, 'Cita');
      await addDoc(citasCollection, {
        alumnoId: this.usuario.uid,
        fechaHora: Timestamp.fromDate(fecha),
        estado: 'confirmada',
        creadoEn: Timestamp.now()
      });

      this.alerta.exito('Cita agendada exitosamente');
      this.nuevaCita = { fecha: '', hora: '' };

    } catch (error) {
      console.error('Error al agendar la cita:', error);
      this.alerta.error('Hubo un error al agendar la cita');
    }

    this.guardandoCita = false;
  }

  async validarCita(fecha: Date): Promise<boolean> {
    const yaAgendadaEnDia = this.citas.some(cita => {
      const citaFecha = cita.fechaHora;
      return citaFecha.getFullYear() === fecha.getFullYear() &&
             citaFecha.getMonth() === fecha.getMonth() &&
             citaFecha.getDate() === fecha.getDate();
    });

    if (yaAgendadaEnDia) {
      this.alerta.info('Ya tienes una cita agendada para este dia');
      return false;
    }

    const citasEnHorarioCollection = collection(this.firestore, 'Cita');
    const [horaInicio] = this.nuevaCita.hora.split('-');
    const [horas, minutos] = horaInicio.split(':');
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setHours(fechaInicio.getHours() + 2);

    const q = query(citasEnHorarioCollection,
      where('fechaHora', '>=', Timestamp.fromDate(fechaInicio)),
      where('fechaHora', '<', Timestamp.fromDate(fechaFin))
    );

    const snapshot = await getDocs(q);
    if (snapshot.size >= this.limitePorHorario) {
      this.alerta.info('El horario seleccionado ya esta lleno');
      return false;
    }

    return true;
  }

  async cancelarCita(id: string) {
    const confirmado = await this.alerta.confirmar('Estas seguro de que quieres cancelar esta cita?');
    if (!confirmado) {
      return;
    }

    try {
      const citaDoc = doc(this.firestore, 'Cita', id);
      await deleteDoc(citaDoc);
      this.alerta.exito('Cita cancelada exitosamente');
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
      this.alerta.error('Hubo un error al cancelar la cita');
    }
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}