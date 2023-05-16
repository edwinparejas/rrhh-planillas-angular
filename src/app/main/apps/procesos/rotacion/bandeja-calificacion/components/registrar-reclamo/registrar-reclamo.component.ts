import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { isArray } from 'lodash';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MENSAJES } from '../../../_utils/constants';

@Component({
  selector: 'minedu-registrar-reclamo',
  templateUrl: './registrar-reclamo.component.html',
  styleUrls: ['./registrar-reclamo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class RegistrarReclamoComponent implements OnInit {

  form: FormGroup;
  working = false;

  constructor(
    public matDialogRef: MatDialogRef<RegistrarReclamoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService

  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm = () => {
    this.form = this.formBuilder.group({
      detalleReclamo: [null, Validators.compose([Validators.required])]
    });
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };

  
  handleRegistrar = () => {
    const form = this.form.value;

    const { idEtapaProceso,
      idPostulacion,
      idCalificacion,
      idCalificacionDetalle } = this.data;
    const passport = this.dataService.Storage().getInformacionUsuario();

    const model = {
      idEtapaProceso: idEtapaProceso,
      idPostulacion: idPostulacion,
      idCalificacion: idCalificacion,
      idCalificacionDetalle: idCalificacionDetalle,
      detalleReclamo: form.detalleReclamo,
      usuarioCreacion: passport.numeroDocumento
    }

    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA REGISTRAR EL RECLAMO?', () => {

      this.working = true;
      this.dataService.Spinner().show('sp6');
      this.dataService
        .Rotacion()
        .registrarReclamoPostulante(model)
        .pipe(
          catchError((e) => { return  this.configCatch(e);        }),
          finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
        ).subscribe((response: any) => {
          if (response) {      
           
            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { 
              this.matDialogRef.close({ registrado: true });
          });
          }
        });
    }, () => { });
  }
  configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}
