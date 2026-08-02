import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../Dashboard';
import { Firestore, collection, query, where, getDocs, orderBy } from '@angular/fire/firestore';
import { HistorialEjercicio } from '../../../models';
import { Timestamp } from '@angular/fire/firestore';

interface HistorialAgrupado {
  fecha: Date;
  resumen: string;
  ejercicios: { nombre: string; volumen: number }[];
}

@Component({
  selector: 'inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class InicioComponent implements OnInit {
  private dashboard = inject(DashboardComponent);
  private firestore = inject(Firestore);

  historial: HistorialAgrupado[] = [];

  get usuario() {
    return this.dashboard.usuario;
  }

  ngOnInit() {
    this.cargarHistorial();
  }

  async cargarHistorial() {
    if (!this.usuario.uid) return;

    const historialCollection = collection(this.firestore, `Usuarios/${this.usuario.uid}/historial`);
    const q = query(historialCollection, orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);

    const historialTemp: HistorialEjercicio[] = [];
    querySnapshot.forEach(doc => {
      historialTemp.push(doc.data() as HistorialEjercicio);
    });

    this.historial = this.agruparYCalcularVolumen(historialTemp);
  }

  private agruparYCalcularVolumen(historial: HistorialEjercicio[]): HistorialAgrupado[] {
    const agrupado: { [key: string]: { fecha: Timestamp, ejercicios: HistorialEjercicio[] } } = {};

    historial.forEach(h => {
      const fecha = h.fecha.toDate();
      const claveFecha = fecha.toISOString().split('T')[0]; // Agrupar por día

      if (!agrupado[claveFecha]) {
        agrupado[claveFecha] = { fecha: h.fecha, ejercicios: [] };
      }
      agrupado[claveFecha].ejercicios.push(h);
    });

    return Object.values(agrupado).map(grupo => {
      const ejerciciosCalculados = this.calcularVolumenMaximo(grupo.ejercicios);
      const resumen = this.crearResumen(ejerciciosCalculados);

      return {
        fecha: grupo.fecha.toDate(),
        resumen: resumen,
        ejercicios: ejerciciosCalculados,
      };
    });
  }

  private calcularVolumenMaximo(ejercicios: HistorialEjercicio[]): { nombre: string; volumen: number }[] {
    const ejerciciosMap: { [key: string]: number } = {};

    ejercicios.forEach(h => {
      // Si el historial ya tiene el volumen, usarlo. Si no, calcularlo.
      const volumen = h.volumen > 0
        ? h.volumen
        : h.series.reduce((acc, serie) => acc + (serie.peso * serie.repeticiones), 0);

      if (!ejerciciosMap[h.ejercicioNombre] || volumen > ejerciciosMap[h.ejercicioNombre]) {
        ejerciciosMap[h.ejercicioNombre] = volumen;
      }
    });

    return Object.entries(ejerciciosMap).map(([nombre, volumen]) => ({ nombre, volumen }));
  }

  private crearResumen(ejercicios: { nombre: string; volumen: number }[]): string {
    const nombres = ejercicios.map(e => e.nombre);
    if (nombres.length > 3) {
      return `${nombres.slice(0, 3).join(', ')} y ${nombres.length - 3} más.`;
    }
    return nombres.join(', ') || 'Día de descanso.';
  }
}
