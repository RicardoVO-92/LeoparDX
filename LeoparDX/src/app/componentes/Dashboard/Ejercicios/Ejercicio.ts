import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../Dashboard';

@Component({
  selector: 'Ejercicios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Ejercicio.html',
  styleUrls: ['./Ejercicio.css']
})
export class EjercicioComponent {
  private dashboard = inject(DashboardComponent);


}