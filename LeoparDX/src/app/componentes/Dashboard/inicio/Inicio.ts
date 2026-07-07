import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../Dashboard';

@Component({
  selector: 'inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class InicioComponent {
  private dashboard = inject(DashboardComponent);

  get usuario() {
    return this.dashboard.usuario;
  }
}