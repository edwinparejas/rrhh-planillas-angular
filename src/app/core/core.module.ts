
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RestangularBasePath } from './data/base-path/restangular-base-path';
import { DataService } from './data/data.service';
import { AuthGuard } from './guard/auth.guard';
import { ComunesRestangularService } from './data/services/resources/comunes-restangular.service';
import { DocumentosRestangularService } from './data/services/resources/documentos-restangular.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    MatSnackBarModule
  ],
  providers: [
    RestangularBasePath,
    DataService,
    ComunesRestangularService,
    DocumentosRestangularService,
    AuthGuard
  ],
})
export class CoreModule { }
