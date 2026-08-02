import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { addDoc, collection, collectionData, doc, Firestore, limit, query, updateDoc, where } from '@angular/fire/firestore';
import { Usuario } from '../../../models/usuario.model';
import { PerfilFisico } from '../../../models/perfil-fisico.model';
import { DashboardComponent } from '../Dashboard';
import { AlertaService } from '../../Servicios/alertaservicios';

@Component({
  selector: 'Perfil',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './Perfil.html',
  styleUrls: ['./Perfil.css']
})

export class PerfilComponent {
  private firestore: Firestore = inject(Firestore);
  private plataformId = inject(PLATFORM_ID);
  private dashboard = inject(DashboardComponent);
  private alerta: AlertaService = inject(AlertaService);

  usuario: any = new Usuario();
  perfilFisico: any = new PerfilFisico();

  usuarioDocId: string = '';
  perfilFisicoDocId: string = '';

  cargandoUsuario: boolean = false;
  cargandoPerfilFisico: boolean = false;
  editandoUsuario: boolean = false;
  editandoPerfilFisico: boolean = false;
  registrandoPerfilFisico: boolean = false;
  tienePerfilFisico: boolean = false;

  constructor() {
    if (isPlatformBrowser(this.plataformId)) {
      const state = history.state as Usuario;

      if (state && state.uid) {
        this.usuario.uid = state.uid;
      } else if (this.dashboard.usuario.uid) {
        this.usuario.uid = this.dashboard.usuario.uid;
      }

      if (this.usuario.uid) {
        this.obtenerUsuario();
      }
    }
  }

  obtenerUsuario() {
    this.cargandoUsuario = true;

    const userCollection = collection(this.firestore, 'Usuarios');
    const q = query(userCollection, where('uid', '==', this.usuario.uid), limit(1));

    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      if (data.length > 0) {
        const item = data[0];

        this.usuarioDocId = item.id || '';
        this.usuario.uid = item.uid || this.usuario.uid;
        this.usuario.nombre = item.nombre || '';
        this.usuario.apellido = item.apellido || '';
        this.usuario.nombreUsuario = item.nombreUsuario || '';
        this.usuario.email = item.email || '';

        this.obtenerPerfilFisico();
      }

      this.cargandoUsuario = false;
    }, (error: any) => {
      console.log('Error al obtener usuario', error);
      this.cargandoUsuario = false;
    });
  }

  obtenerPerfilFisico() {
    if (!this.usuarioDocId) {
      return;
    }

    this.cargandoPerfilFisico = true;

    const perfilCollection = collection(this.firestore, 'Usuarios', this.usuarioDocId, 'perfil-fisico');
    const q = query(perfilCollection, limit(1));

    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      if (data.length > 0) {
        const item = data[0];

        this.perfilFisicoDocId = item.id || '';
        this.perfilFisico.id = item.id || '';
        this.perfilFisico.peso = item.peso ?? 0;
        this.perfilFisico.altura = item.altura ?? 0;
        this.perfilFisico.objetivo = item.objetivo || '';
        this.perfilFisico.nivelActividad = item.nivelActividad || '';
        this.perfilFisico.registradoEn = item.registradoEn || '';
        this.tienePerfilFisico = true;
      } else {
        this.perfilFisico = new PerfilFisico();
        this.perfilFisicoDocId = '';
        this.tienePerfilFisico = false;
      }

      this.cargandoPerfilFisico = false;
    }, (error: any) => {
      console.log('Error al obtener perfil fisico', error);
      this.cargandoPerfilFisico = false;
    });
  }

  async guardarUsuario() {
    if (!this.usuarioDocId) {
      return;
    }

    try {
      const usuarioDoc = doc(this.firestore, 'Usuarios', this.usuarioDocId);

      await updateDoc(usuarioDoc, {
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        nombreUsuario: this.usuario.nombreUsuario,
        email: this.usuario.email
      });

      this.alerta.exito('Perfil actualizado exitosamente');
      this.editandoUsuario = false;
    } catch (error) {
      console.log('Error al actualizar usuario', error);
      this.alerta.error('Hubo un error al actualizar el perfil');
    }
  }

  async guardarPerfilFisico() {
    if (!this.usuarioDocId) {
      return;
    }

    if (this.perfilFisico.peso === '' || this.perfilFisico.altura === '') {
      this.alerta.error('Peso y altura son obligatorios');
      return;
    }

    try {
      const perfilCollection = collection(this.firestore, 'Usuarios', this.usuarioDocId, 'perfil-fisico');

      const perfil = {
        peso: this.perfilFisico.peso,
        altura: this.perfilFisico.altura,
        objetivo: this.perfilFisico.objetivo,
        nivelActividad: this.perfilFisico.nivelActividad
      };

      if (this.tienePerfilFisico && this.perfilFisicoDocId) {
        const perfilDoc = doc(this.firestore, 'Usuarios', this.usuarioDocId, 'perfil-fisico', this.perfilFisicoDocId);
        await updateDoc(perfilDoc, perfil);
      } else {
        const res = await addDoc(perfilCollection, {
          ...perfil,
          registradoEn: new Date()
        });

        const perfilDoc = doc(this.firestore, 'Usuarios', this.usuarioDocId, 'perfil-fisico', res.id);
        await updateDoc(perfilDoc, {
          id: res.id
        });
      }

      this.alerta.exito('Perfil fisico guardado exitosamente');
      this.editandoPerfilFisico = false;
      this.registrandoPerfilFisico = false;
    } catch (error) {
      console.log('Error al guardar perfil fisico', error);
      this.alerta.error('Hubo un error al guardar el perfil fisico');
    }
  }

  mostrarFormularioPerfilFisico() {
    this.registrandoPerfilFisico = true;
    this.editandoPerfilFisico = true;
    this.perfilFisico = new PerfilFisico();
  }

  cancelarEdicionUsuario() {
    this.editandoUsuario = false;
    this.obtenerUsuario();
  }

  cancelarEdicionPerfilFisico() {
    this.editandoPerfilFisico = false;
    this.registrandoPerfilFisico = false;
    this.obtenerPerfilFisico();
  }
}