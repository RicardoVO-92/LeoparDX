import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login';
import { DashboardComponent } from './componentes/Dashboard/Dashboard';
import { componentInicio } from './componentes/init/init';
import { ComponentMain } from './componentes/Main/Main';
import { registerComponent } from './componentes/register/register';
import {InicioComponent} from './componentes/Dashboard/inicio/Inicio';
import { RutinasComponent } from './componentes/Dashboard/Rutinas/Rutinas';
import { PerfilComponent } from './componentes/Dashboard/Perfil/Perfil';
import { EjercicioComponent } from './componentes/Dashboard/Ejercicios/Ejercicio';
import { AgendarCitasComponent } from './componentes/Dashboard/AgendarCitas/AgendarCitas';
import { AdminPanelComponent } from './componentes/AdminPanel/AdminPanel';

export const routes: Routes = [
    { path: '', component: componentInicio },
    { path: 'Home', component: ComponentMain },
    { path: 'Login', component: LoginComponent },
    { path: 'Home', component: ComponentMain },
    { path: 'Register', component: registerComponent},
    { path: 'Dashboard', component: DashboardComponent, children:[
        { path: '', redirectTo: 'inicio', pathMatch: 'full' },
        { path: 'inicio', component: InicioComponent },
        { path: 'rutinas', component: RutinasComponent },
        { path: 'perfil', component: PerfilComponent },
        { path: 'ejercicios', component: EjercicioComponent},
        { path: 'agendarcitas', component: AgendarCitasComponent }
    ]},
    { path: 'AdminPanel', component: AdminPanelComponent },
];
