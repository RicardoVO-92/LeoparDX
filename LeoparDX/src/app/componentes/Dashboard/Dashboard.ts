import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
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

    constructor(public ruta: Router) {
    
    }

}