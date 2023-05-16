import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'minedu-rechazar-autorizacion',
    templateUrl: './rechazar-autorizacion.component.html',
    styleUrls: ['./rechazar-autorizacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
  })
  export class RechazarAutoizacionComponent implements OnInit {
  
    form: FormGroup;
    working: boolean = false;
    soloVer: boolean = false;
    dialogTitle: string = '';
  
    NuevoRegistro: boolean = true;   
  
    Valorclose = {
      observar: false
    };
  
    constructor(
      public matDialogRef: MatDialogRef<RechazarAutoizacionComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private router: Router,
    ) { }
  
    ngOnInit(): void {
      
      this.dialogTitle = this.data.dialogTitle;    
  
      this.working=true;
        this.buildForm();
        if(this.data){
          console.log(this.data);          
        }
    }
  
    buildForm() {
      this.form = this.formBuilder.group({
        observacion: [null, Validators.required]
      });
    }
    
    handleGuardarPrimero () {

      if(this.form.get('observacion').value) {

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA RECHAZAR LA AUTORIZACIÓN DE LA DESVINCULACIÓN?', () => {
        this.dataService.Spinner().show("sp6");
        this.working = true;
        let viewModel = {
          idDesvinculacion: this.data.id_gestion_desvinculacion,
          detalleObservacion: this.form.get('observacion').value,
          codigoAprobacion: this.data.dataAprobacion.codigoAprobacion,
          usuarioCreacion: this.data.dataAprobacion.usuarioCreacion,
          TipoDocumentoAprobador: this.data.dataAprobacion.TipoDocumentoAprobador,
          numeroDocumentoAprobador: this.data.dataAprobacion.numeroDocumentoAprobador
        }
                
        this.dataService.AccionesDesvinculacion().desaprobarDesvinculacion(viewModel).pipe(
          catchError((e) => of(e)),
          finalize(() => {
            this.dataService.Spinner().hide("sp6")
            this.working = false;
          })
        ).subscribe(response => {
          if (response) {
            this.dataService.Message().msgAutoCloseSuccessNoButton("OPERACIÓN REALIZADA DE FORMA EXITOSA", 3000, () => {
              this.matDialogRef.close();
              this.router.navigate(['ayni/personal/acciones/desvinculacion'])
            });    
          } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
          } else {
            this.dataService.Message().msgWarning('"ERROR, NO SE PUDO RECHAZAR LA DESVINCULACIÓN".', () => { });
          }
        });
          
      }, () => { });

      } else {
        this.dataService.Message().msgWarning('PARA GUARDAR SE NECESITA UNA OBSERVACION.', () => {
        });
        return;
      }
    }
  
    handleCancelar() {
      debugger;
      this.matDialogRef.close(this.Valorclose);
    }
  
  }
  