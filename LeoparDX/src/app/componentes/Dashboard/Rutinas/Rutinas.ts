import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { Usuario } from '../../../models/usuario.model';
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router';

@Component({
  selector: 'Rutinas',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './Rutinas.html',
  styleUrls: ['./Rutinas.css']
})

export class RutinasComponent{

}