import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login';
import { DashboardComponent } from './componentes/Dashboard/Dashboard';
import { componentInicio } from './componentes/init/init';
import { ComponentMain } from './componentes/Main/Main';

export const routes: Routes = [
    { path: '', component: componentInicio },
    { path: 'Dashboard', component: DashboardComponent },
    { path: 'Login', component: LoginComponent },
    { path: 'Home', component: ComponentMain }

];
