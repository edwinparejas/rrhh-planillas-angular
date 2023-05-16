import { PersonalDashboardComponent } from './personal-dashboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/core/guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    //canActivate: [AuthGuard],
    component: PersonalDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalDashboardRoutingModule { }
