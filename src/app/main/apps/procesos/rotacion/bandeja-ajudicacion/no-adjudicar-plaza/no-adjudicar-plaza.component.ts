import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { isArray } from 'lodash';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MENSAJES } from '../../_utils/constants';

@Component({
  selector: 'minedu-no-adjudicar-plaza',
  templateUrl: './no-adjudicar-plaza.component.html',
  styleUrls: ['./no-adjudicar-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class NoAdjudicarPlazaComponent implements OnInit {

  form: FormGroup;
  working = false;

  combo = {
    motivosNoAdjudicacion: []
  }

  constructor(
    public matDialogRef: MatDialogRef<NoAdjudicarPlazaComponent>,
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
      idMotivoNoAdjudicacion: [null, Validators.compose([Validators.required])],
      observacionNoAdjudicacion: [null, Validators.compose([Validators.required])]
    });
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };


  private buildData = () => {
    this.dataService
      .Rotacion()
      .getMotivosNoAdjudicacion()
      .pipe(
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => {
          this.dataService.Spinner().hide("sp6");
        })
      ).subscribe((response: any) => {
        if (response) {
          this.combo.motivosNoAdjudicacion = response;
        }
      });
  };

  handleRegistrar = () => {
    const form = this.form.value;

    const { idAdjudicacion, idEtapaProceso } = this.data;

    const model = {
      idAdjudicacion: idAdjudicacion,
      idEtapaProceso: idEtapaProceso,
      idMotivoNoAdjudicacion: form.idMotivoNoAdjudicacion,
      observacionNoAdjudicacion: form.observacionNoAdjudicacion
    }

    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA NO ADJUDICAR AL POSTULANTE?', () => {

      this.working = true;
      this.dataService.Spinner().show('sp6');
      this.dataService
        .Rotacion()
        .nodAdjudicar(model)
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
  private configCatch(e: any) { 
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