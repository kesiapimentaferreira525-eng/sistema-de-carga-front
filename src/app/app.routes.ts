import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { CargasComponent } from './pages/cargas.component';
import { FaturasComponent } from './pages/faturas.component';
import { InvoiceComponent } from './pages/invoice.component';
export const routes: Routes = [
 {path:'',component:DashboardComponent,title:'Painel | CNC Transporte'},
 {path:'cargas',component:CargasComponent,title:'Diário de cargas | CNC Transporte'},
 {path:'faturas',component:FaturasComponent,title:'Faturas | CNC Transporte'},
 {path:'faturas/:id',component:InvoiceComponent,title:'Detalhes da fatura | CNC Transporte'},
 {path:'**',redirectTo:''}
];
