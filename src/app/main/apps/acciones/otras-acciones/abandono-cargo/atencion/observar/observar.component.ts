import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SustentoInfoComponent } from '../sustento-info/sustento-info.component';

@Component({
  selector: 'minedu-observar',
  templateUrl: './observar.component.html',
  styleUrls: ['./observar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ObservarComponent implements OnInit {

  nombreCabecera = 'Rechazar Abandono de Cargo y Otros';
  working = false;
  isMobile = false;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public matDialogRef: MatDialogRef<SustentoInfoComponent>,
    @Inject(MAT_DIALOG_DATA) private dataDialog: any,
    private router: Router,
    private dataService: DataService
    ) { }

  ngOnInit(): void {
    this.handleResponsive();
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      observaciones: [null, Validators.required]
    });

  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
        this.isMobile = this.getIsMobile();
    };
  }

  getIsMobile(): boolean {
    var w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
        return true;
    } else {
        return false;
    }
  }

  handleCancelar(data?: any): void {
    this.matDialogRef.close(data);
  }

  handelObservar(): void{
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA OBSERVAR LA INFORMACIÓN?', () => {
      if (!this.form.valid) {      
        this.dataService.Message().msgWarning('COMPLETAR LOS DATOS REQUERIDOS');
        return;
      }

      this.dataService.Spinner().show('sp6');      
      const usuario = this.dataService.Storage().getPassportUserData();
      
      let formDataReporte = new FormData();
      formDataReporte.append('idAtencionReporte', this.dataDialog.idAtencionReporte);
      formDataReporte.append('observaciones', this.form.get('observaciones').value);
      formDataReporte.append('usuarioModificacion', usuario.NUMERO_DOCUMENTO);

      this.dataService.OtrasFuncionalidades().putObservarAtencionReporte(formDataReporte).pipe(
        catchError(() => of([])),
        finalize(() => {
            this.dataService.Spinner().hide('sp6');
        })
        ).subscribe(
        (response) => {
          if(response || (response || []).length > 0)
          {
            this.dataService.SnackBar().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA.", 'Cerrar'); 
            this.router.navigate(['ayni/personal/acciones/otrasacciones/abandonocargootros']);
            this.handleCancelar();
          }
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );

    }, () => {});
  }

}
