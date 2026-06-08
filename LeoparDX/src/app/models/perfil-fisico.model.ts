import { Timestamp } from '@angular/fire/firestore';

// Subcolección: usuarios/{uid}/perfil_fisico/{docId}
export class PerfilFisico {
  id: string = '';
  peso: number = 0;
  altura: number = 0;
  objetivo: 'perder peso' | 'ganar músculo' | 'resistencia' | 'mantener' = 'mantener';
  nivelActividad: 'sedentario' | 'activo' | 'muy activo' = 'activo';
  registradoEn: Timestamp = Timestamp.now();
}