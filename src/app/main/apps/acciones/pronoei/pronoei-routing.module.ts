import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PronoeiBandejaComponent } from './components/pronoei-bandeja/pronoei-bandeja.component';
import { PronoeiNewComponent } from './components/pronoei-new/pronoei-new.component';

const routes: Routes = [
  { path: '', component: PronoeiBandejaComponent , resolve: {} },
  { path: 'agregar', component: PronoeiNewComponent, resolve: {} },
  { path: 'modificar/:pronoeiId', component: PronoeiNewComponent, resolve: {} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PronoeiRoutingModule { }
