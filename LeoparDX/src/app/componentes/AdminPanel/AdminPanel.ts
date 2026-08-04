import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './AdminPanel.html',
  styleUrls: ['./AdminPanel.css']
})
export class AdminPanelComponent {
  private firestore = inject(Firestore);

  usuariosRegistrados: any[] = [];
  citasDelDia: any[] = [];
  resumenPorHorario: any[] = [];

  constructor(private ruta: Router) {
    const usersCollection = collection(this.firestore, 'Usuarios');

    collectionData(usersCollection, { idField: 'id' }).subscribe((data: any[]) => {
      this.usuariosRegistrados = data;
    });

    const citasCollection = collection(this.firestore, 'Cita');

    collectionData(citasCollection, { idField: 'id' }).subscribe((data: any[]) => {
      const fechaActual = new Date();
      const citasConvertidas = data.map((cita: any) => ({
        ...cita,
        fechaHora: cita.fechaHora.toDate ? cita.fechaHora.toDate() : new Date(cita.fechaHora)
      }));

      this.citasDelDia = citasConvertidas.filter((cita: any) => {
        const fechaCita = cita.fechaHora;
        return fechaCita.getFullYear() === fechaActual.getFullYear() && fechaCita.getMonth() === fechaActual.getMonth() && fechaCita.getDate() === fechaActual.getDate();
      }).sort((citaUno: any, citaDos: any) => citaUno.fechaHora.getTime() - citaDos.fechaHora.getTime());

      this.resumenPorHorario = [
        { horario: '13:00-15:00', cantidad: 0, limite: 45 },
        { horario: '15:00-17:00', cantidad: 0, limite: 45 },
        { horario: '17:00-19:00', cantidad: 0, limite: 45 },
        { horario: '19:00-21:00', cantidad: 0, limite: 45 }
      ];

      this.resumenPorHorario.forEach((item: any) => {
        const [horaInicio] = item.horario.split('-');
        const [horas, minutos] = horaInicio.split(':').map((valor: string) => parseInt(valor, 10));
        const inicioMinutos = horas * 60 + minutos;

        item.cantidad = this.citasDelDia.filter((cita: any) => {
          const hora = cita.fechaHora.getHours();
          const minuto = cita.fechaHora.getMinutes();
          const totalMinutos = hora * 60 + minuto;
          return totalMinutos >= inicioMinutos && totalMinutos < inicioMinutos + 120;
        }).length;
      });
    });
  }

  volverLogin() {
    this.ruta.navigate(['/Login']);
  }

  formatFecha(fecha: any): string {
    if (!fecha) {
      return 'Sin fecha';
    }

    if (fecha.toDate) {
      return fecha.toDate().toLocaleDateString('es-ES');
    }

    return fecha;
  }

  formatHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
