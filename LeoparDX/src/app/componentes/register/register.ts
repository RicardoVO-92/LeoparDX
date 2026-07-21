import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { addDoc, collection, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})

export class registerComponent {
  confirmarContrasena = '';
  coincidirContrasena = false;
  nuevoUsuario: Usuarios = new Usuarios();

  private firestore: Firestore = inject(Firestore);

  constructor(public router: Router){}

  regresarMain(){
    this.router.navigate(['/Login']);
  }

  verificarcontrasena() {
    if (this.nuevoUsuario.password && this.confirmarContrasena) {
      this.coincidirContrasena = this.nuevoUsuario.password === this.confirmarContrasena;
    } else {
      this.coincidirContrasena = false;
    }
  }

  async registrarUsuario() {
    if (!this.coincidirContrasena) {
      alert('Las contrasenas no coinciden');
      return;
    }

    try {
      const claseColeccion = collection(this.firestore, 'Usuarios');

      const res = await addDoc(claseColeccion, {
        nombre: this.nuevoUsuario.nombre,
        apellido: this.nuevoUsuario.apellido,
        nombreUsuario: this.nuevoUsuario.nombreUsuario,
        email: this.nuevoUsuario.email,
        password: this.nuevoUsuario.password,
        Activo: false,
        actualizadoEn: new Date(),
        creadoEn: new Date(),
        fechaNacimiento: new Date(),
        fotoUrl: '',
        rol: 'alumno',
        telefono: ''
      });

      const usuarioDoc = doc(this.firestore, 'Usuarios', res.id);

      await updateDoc(usuarioDoc, {
        uid: res.id
      });

      console.log('Usuario registrado con ID: ', res.id);
      alert('Usuario registrado con exito');

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
