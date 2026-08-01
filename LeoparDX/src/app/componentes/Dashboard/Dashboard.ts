import { Component, inject, PLATFORM_ID, signal} from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { collection, collectionData, Firestore, query, where, limit } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './Dashboard.html',
  styleUrls: ['./Dashboard.css'],
  providers: [DashboardComponent]
})
 
export class DashboardComponent {

  private fireStore = inject(Firestore);
  private plataformId = inject(PLATFORM_ID);

  usuario: Usuario = new Usuario();

  sidebarOpen = signal(false);
  
  constructor(public ruta: Router) {

    if (isPlatformBrowser(this.plataformId)) {
      const state = history.state as Usuario;
      if (state && state.uid) {
        this.usuario.uid = state.uid;
    }

    const userCollection = collection(this.fireStore, 'Usuarios');
    const q = query(userCollection, where('uid', '==', this.usuario.uid));

    collectionData(q).subscribe((data: any[]) => {
      if (data.length > 0) {
        console.log('Usuario:', data[0]);
        this.usuario.nombre = data[0].nombre;
      }
    });
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  cerrarSidebar() {
    this.sidebarOpen.set(false);
  }

  cerrarSesion() {
    this.ruta.navigate(['/Login']);
  }

}
