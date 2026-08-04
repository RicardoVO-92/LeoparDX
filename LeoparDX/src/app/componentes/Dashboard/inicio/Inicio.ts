import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../Dashboard';
import { Firestore, collection, query, getDocs, orderBy, Timestamp } from '@angular/fire/firestore';
import { HistorialEjercicio } from '../../../models';

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
export class InicioComponent { 
  private dashboard = inject(DashboardComponent);
  private firestore = inject(Firestore);

  historial: HistorialAgrupado[] = [];

  get usuario() {
    return this.dashboard.usuario;
  }

  constructor() {
    this.cargarHistorial();
  }

  async cargarHistorial() {
    if (!this.usuario?.uid) return;

    const historialCollection = collection(this.firestore, `Usuarios/${this.usuario.uid}/historial`);
    const q = query(historialCollection, orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);

    const historialTemp: HistorialEjercicio[] = [];
    querySnapshot.forEach(doc => {
      historialTemp.push(doc.data() as HistorialEjercicio);
    });

    this.historial = this.agruparYCalcularVolumen(historialTemp);
  }

  calcularVolumenMaximo(ejercicios: HistorialEjercicio[]) {
  const ejerciciosUnicos: { nombre: string; volumen: number }[] = [];

  ejercicios.forEach(registro => {
    const volumen = this.calcularVolumen(registro);
    const ejercicioEncontrado = ejerciciosUnicos.find(ejercicio => ejercicio.nombre === registro.ejercicioNombre);
    
    if (!ejercicioEncontrado) {
      ejerciciosUnicos.push({ nombre: registro.ejercicioNombre, volumen });
    } else if (volumen > ejercicioEncontrado.volumen) {
      ejercicioEncontrado.volumen = volumen;
    }
  });

   return ejerciciosUnicos;
  }

  calcularVolumen(registro: HistorialEjercicio): number {
    if (registro.volumen > 0) return registro.volumen;
    
    return registro.series.reduce((totalVolumen, serie) => 
      totalVolumen + (serie.peso * serie.repeticiones), 0
    );
  }

  crearResumen(ejercicios: HistorialEjercicio[]): string {
    const nombresEjercicios = ejercicios.map(registro => registro.ejercicioNombre);
    
    if (nombresEjercicios.length === 0) return 'Día de descanso.';
    
    if (nombresEjercicios.length > 3) {
      const primerosTres = nombresEjercicios.slice(0, 3).join(', ');
      const restantes = nombresEjercicios.length - 3;
      return `${primerosTres} y ${restantes} más.`;
    }
    
    return nombresEjercicios.join(', ');
  }

  agruparPorFecha(historial: HistorialEjercicio[]) {
    const agrupado: { [fecha: string]: { fecha: Timestamp; ejercicios: HistorialEjercicio[] } } = {};

    historial.forEach(registro => {
      const fechaFormato = registro.fecha.toDate().toISOString().split('T')[0];
      
      if (!agrupado[fechaFormato]) {
        agrupado[fechaFormato] = { fecha: registro.fecha, ejercicios: [] };
      }
      agrupado[fechaFormato].ejercicios.push(registro);
    });

    return agrupado;
  }

  agruparYCalcularVolumen(historial: HistorialEjercicio[]) {
    const agrupado = this.agruparPorFecha(historial);
    
    return Object.values(agrupado).map(grupo => ({
      fecha: grupo.fecha.toDate(),
      resumen: this.crearResumen(grupo.ejercicios),
      ejercicios: this.calcularVolumenMaximo(grupo.ejercicios),
    }));
  }
}