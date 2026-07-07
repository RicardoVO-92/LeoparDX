import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { collection, collectionData, Firestore, query, where, limit, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})

export class registerComponent {
  contrasena = '';
  confirmarContrasena = '';
  coincidirContrasena = false;
  nuevoUsuario: Usuarios = new Usuarios();

  private firestore: Firestore = inject(Firestore);

  constructor(public router: Router){}

  regresarMain(){
    this.router.navigate(['/Home']);
  }

  verificarcontrasena() {
    if (this.contrasena && this.confirmarContrasena) {
      this.coincidirContrasena = this.contrasena === this.confirmarContrasena;
    } else {
      this.coincidirContrasena = false;
    }
  }

  async registrarUsuario() {
    // Primero validamos si las contraseñas coinciden
    if (!this.coincidirContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const claseColeccion = collection(this.firestore, 'Usuarios');
      
      // Enviamos el objeto plano a Firestore
      const res = await addDoc(claseColeccion, {
        nombre: this.nuevoUsuario.nombre,
        apellido: this.nuevoUsuario.apellido,
        nombreUsuario: this.nuevoUsuario.nombreUsuario,
        email: this.nuevoUsuario.email,
        password: this.nuevoUsuario.password // Nota: En producción recuerda encriptarla
      });

      console.log('Usuario registrado con ID: ', res.id);
      alert('¡Usuario registrado con éxito!');
      
      // Una vez registrado, lo mandamos al Home o Login
      this.regresarMain();

    } catch (error) {
      console.error('Error al registrar en Firebase:', error);
      alert('Hubo un error al intentar registrar al usuario.');
    }
  }
}

export class Usuarios {
  nombre: string = '';
  apellido: string = '';
  nombreUsuario: string = '';
  email: string = '';
  password: string = '';
}

