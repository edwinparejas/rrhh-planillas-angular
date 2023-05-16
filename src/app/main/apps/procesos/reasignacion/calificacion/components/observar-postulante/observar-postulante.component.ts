import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { MENSAJES } from '../../../_utils/constants';
import { isArray } from 'lodash';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-observar-postulante',
  templateUrl: './observar-postulante.component.html',
  styleUrls: ['./observar-postulante.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ObservarPostulanteComponent implements OnInit {

  form: FormGroup;
  working = false;

  combo = {
    motivosObservacion: []
  }

  constructor(
    public matDialogRef: MatDialogRef<ObservarPostulanteComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService

  ) { }

  ngOnInit(): void {
    this.buildForm();
    setTimeout(() => {
      this.dataService.Spinner().show("sp6");
      this.buildData();
    }, 0);
  }

  private buildForm = () => {
    this.form = this.formBuilder.group({
      idMotivoObservacion: [null, Validators.compose([Validators.required])],
      anotaciones: [null, Validators.compose([Validators.required])]
    });
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };


  private buildData = () => {
    this.dataService
    .Reasignaciones()
    .getMotivosObservacion()
      .pipe(
        catchError((e) => { return  this.configCatch(e);  }),
        finalize(() => {
          this.dataService.Spinner().hide("sp6");
        })
      ).subscribe((response: any) => {
        if (response) {
          this.combo.motivosObservacion = response;
        }
      });
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
      idMotivoObservacion: form.idMotivoObservacion,
      anotacionesObservacion: form.anotaciones,
      usuarioCreacion: passport.numeroDocumento
    }

    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA OBSERVAR EL POSTULANTE?', () => {

      this.working = true;
      this.dataService.Spinner().show('sp6');
      this.dataService
        .Reasignaciones()
        .registrarObservacionPostulante(model)
        .pipe(
          catchError((e) => { return  this.configCatch(e);        }),
          finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
        ).subscribe((response: any) => {
          if (response) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO,MENSAJES.DURACION, () => {});
            this.matDialogRef.close({ registrado: true });
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

