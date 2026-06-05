import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { collection, collectionData, Firestore, query, where, limit } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'inicio',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './init.html',
  styleUrls: ['./init.css']
})

export class componentInicio{
    
  constructor(public ruta: Router) {
    ruta.navigate(['/Login']);
  }
}