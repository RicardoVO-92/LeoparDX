import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { collection, collectionData, Firestore, query, where, limit } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'Main',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './Main.html',
  styleUrls: ['./Main.css']
})

export class ComponentMain {

  constructor(public ruta: Router) {
    
  }

}