import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { collection, collectionData, Firestore, query, where, limit } from '@angular/fire/firestore';

@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})

export class LoginComponent {

  private firestore: Firestore = inject(Firestore);

  user: Login = new Login();
  // Estado simple para mostrar/ocultar el formulario
  isLoggedIn: boolean = false;
  

  loginGYM() {
    console.log('loginGYM clicked', this.user);
    const usersCollection = collection(this.firestore, 'Usuarios');
    const q = query(usersCollection, where('userEmail', '==', this.user.userEmail), limit(1));

    collectionData(q).subscribe((data: any[]) => {
      if (data && data.length > 0) {
        const item = data[0];
        //Checar que sea login
        if (item.password === this.user.password) {
          //Si se hizo login se quita esto:
          this.isLoggedIn = true;
          console.log('Login successful!');
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

export class Login {
  userID: string = "";
  password: string = "";
  userEmail: string = "";
  admin: boolean = false;
}
