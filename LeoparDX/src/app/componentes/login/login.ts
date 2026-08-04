import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { collection, collectionData, doc, Firestore, query, where, limit, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { AlertaService } from '../Servicios/alertaservicios';

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

  constructor(public ruta: Router, private alerta: AlertaService) {

  }

  irRegistrar(){
    this.ruta.navigate(['/Register']);
  }

  inicio() {
    this.ruta.navigate(['/Home'])
  }

  loginGYM() {
    if (!this.user.email || !this.user.password) {
      this.alerta.error('Ingresa tu usuario y contrasena', 'Datos incompletos');
      return;
    }

    const usersCollection = collection(this.firestore, 'Usuarios');

    const q = query(usersCollection, where('email', '==', this.user.email), limit(1));

    collectionData(q, { idField: 'id' }).subscribe(async (data: any[]) => {

      if (data && data.length > 0) {

        const datosUsuario = data[0];

        if (datosUsuario.password === this.user.password) {
          this.user.uid = datosUsuario.uid || datosUsuario.id;

          if (!datosUsuario.uid && datosUsuario.id) {
            const usuarioDoc = doc(this.firestore, 'Usuarios', datosUsuario.id);

            await updateDoc(usuarioDoc, {
              uid: datosUsuario.id
            });
          }

          this.alerta.exito('Inicio de sesión correcto', 'Bienvenido');

          if (datosUsuario.admin === true) {
            this.ruta.navigate(['/AdminPanel'], { state: { uid: this.user.uid } });
          } else {
            this.ruta.navigate(['/Dashboard'], { state: { uid: this.user.uid } });
          }
        } else {
          this.alerta.error('Usuario o contrasena invalido');
        }
      } else {
        this.alerta.error('Usuario o contrasena invalido');
      }
    }, (err:any) => {
      console.log('Login query error', err);
      this.alerta.error('Ocurrio un error al iniciar sesion, intenta de nuevo');
    });
  }

}