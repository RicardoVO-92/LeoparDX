import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { collection, collectionData, Firestore, query, where, limit } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';



@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class LoginComponent {

  private firestore: Firestore = inject(Firestore);

  user: Usuario = new Usuario();
  // Estado simple para mostrar/ocultar el formulario
  

  constructor(public ruta: Router) {
    
  }
  

  loginGYM() {

    console.log('loginGYM clicked', this.user);

    const usersCollection = collection(this.firestore, 'Usuarios');

    const q = query(usersCollection, where('email', '==', this.user.email), limit(1));

    collectionData(q).subscribe((data: any[]) => {

      if (data && data.length > 0) {

        const item = data[0];
    
        //Checar que sea login
        if (item.password === this.user.password) {  
          // Guarda el usuario en localStorage
          localStorage.setItem('usuario', JSON.stringify(item));
        
          this.ruta.navigate(['/Dashboard']);
        } else {
          //console.warn('Invalid email or password.');
        }
      } else {
        //console.warn('Invalid email or password.');
      }
    }, (err:any) => {
      console.log('Login query error', err);
      //console.log('Error checking credentials.');
    });
  }

}


