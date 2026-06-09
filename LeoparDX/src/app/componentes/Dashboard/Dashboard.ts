import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { collection, collectionData, Firestore, query, where, limit } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './Dashboard.html',
  styleUrls: ['./Dashboard.css']
})
 
export class DashboardComponent {

    private firestore: Firestore = inject(Firestore);
    private platformId = inject(PLATFORM_ID);
    usuario: any = {};

    constructor(public ruta: Router) {

      const usuarioData = localStorage.getItem('usuario');
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('usuario');
      if (data) {
        this.usuario = JSON.parse(data);
        console.log(this.usuario)
      }
    }
    }

}