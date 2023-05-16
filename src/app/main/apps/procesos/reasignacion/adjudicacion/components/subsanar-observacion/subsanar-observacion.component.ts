import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { MatDialog } from '@angular/material/dialog';
import { validacionServidorPublicoComponent } from '../validacion-servidor-publico/validacion-servidor-publico.component';
import { validacionPlazaComponent } from '../validacion-plaza/validacion-plaza.component';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EstadoSubsanacionEnum, EstadoAdjudicacionEnum, MENSAJES } from '../../../_utils/constants';


@Component({
  selector: 'minedu-subsanar-observacion',
  templateUrl: './subsanar-observacion.component.html',
  styleUrls: ['./subsanar-observacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class SubsanarObservacionComponent implements OnInit {

  
  form: FormGroup;
  working = false;
  dialogRef: any;

  combo = {
    estadosSubsanacion: []
  }

  constructor(
    public matDialogRef: MatDialogRef<SubsanarObservacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private materialDialog: MatDialog,
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
      idEstadoSubsanacion: [null, Validators.compose([Validators.required])],
      detalleSubsanacion: [null, Validators.compose([Validators.required])]
    });
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };


  private buildData = () => {
    this.dataService
      .Reasignaciones()
      .getEstadosSubsanacion()
      .pipe(
        catchError(() => of(null)),
        finalize(() => {
          this.dataService.Spinner().hide("sp6");
        })
      ).subscribe((response: any) => {
        if (response) {
          this.combo.estadosSubsanacion = response;
        }
      });
  };

  handleRegistrarConfirm = (model:any) => {
    
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA SUBSANAR LA OBSERVACIÓN?', () => {

        this.working = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
          .Reasignaciones()
          .subsanarObservar(model)
          .pipe(
            catchError((e) => {
              const { developerMessage } = e;
              this.dataService.Message().msgWarning(developerMessage, () => { });
              return of(null);
            }),
            finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
          ).subscribe((response: any) => {
            if (response) {
              this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
              this.matDialogRef.close({ registrado: true });
            }
          });
      }, () => { });
  }
  
  //1.1
  handleRegistrarValidarServidorPublicoModal = (model, response) => {
        this.dialogRef = this.materialDialog.open(
            validacionServidorPublicoComponent,
            {
                panelClass: 'minedu-validacion-servidor-publico',
                width: '1100px',
                disableClose: true,
                data: {
                    idAdjudicacion: model.idAdjudicacion,
                    idEtapaProceso: model.idEtapaProceso,
                    //idCalificacion: model.idCalificacion,
                    idPostulacion: model.idPostulacion,
                    response: response
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response) => {
            if (!response) {
                return;
            }
            //Validar Plaza
            this.handleRegistrarValidarPlazaAjax(model);
            
        });
    }
   
    //2.0
  handleRegistrarValidarPlazaModal = (model, response) => {
    this.dialogRef = this.materialDialog.open(
        validacionPlazaComponent,
        {
            panelClass: 'minedu-validacion-plaza',
            width: '1100px',
            disableClose: true,
            data: {
                idAdjudicacion: model.idAdjudicacion,
                idEtapaProceso: model.idEtapaProceso,
                idCalificacion: model.idCalificacion,
                idPlaza: model.idPlaza,
                response: response
            },
        }
    );

    this.dialogRef.afterClosed().subscribe((response) => {
        if (!response) {
            return;
        }
        //RegistarConfirm
        this.handleRegistrarConfirm(model);
    });
}

//1.0
  handleRegistrarValidarServidorPublicoAjax = (model:any) => {
    
    this.dataService
    .Reasignaciones()
    .getValidarActualizacionServidorPublico({ idPostulacion: model.idPostulacion, idEtapaProceso: model.idEtapaProceso })
    .pipe(
        catchError((e) => { 
            const { developerMessage } = e;
            this.dataService.Message().msgWarning(developerMessage, () => { });
            return of(null);
        }),
        finalize(() => { this.dataService.Spinner().hide('sp6'); })
    ).subscribe((response: any) => {
        var tieneDiferencias = (response.listaDiferencia.filter(f=>f.esDiferente==true).length > 0);
        if(tieneDiferencias === true){
            this.handleRegistrarValidarServidorPublicoModal(model, response);
        }
        else {
            //Validar Plaza
            this.handleRegistrarValidarPlazaAjax(model);

        }
    });
  }

  //1.2
  handleRegistrarValidarPlazaAjax = (model:any) => {

  this.dataService
      .Reasignaciones()
      .getValidarActualizacionPlaza({ idPlaza: model.idPlaza, idEtapaProceso: model.idEtapaProceso })
      .pipe(
          catchError((e) => { 
              const { developerMessage } = e;
              this.dataService.Message().msgWarning(developerMessage, () => { });
              return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide('sp6'); })
      ).subscribe((response: any) => {
          var tieneDiferencias = (response.listaDiferencia.filter(f=>f.esDiferente==true).length > 0);
          if(tieneDiferencias === true){
             this.handleRegistrarValidarPlazaModal(model, response);
          }
          else {
            //RegistarConfirm
            this.handleRegistrarConfirm(model);
          }
      });

}

  handleRegistrar = () => {
    const form = this.form.value;

    const { idAdjudicacion, idEtapaProceso, idPostulacion, idPlaza } = this.data;

    const model = {
      idAdjudicacion: idAdjudicacion,
      idEtapaProceso: idEtapaProceso,
      idEstadoSubsanacion: form.idEstadoSubsanacion,
      detalleSubsanacion: form.detalleSubsanacion,
      idPostulacion: idPostulacion,
      idPlaza: idPlaza
    }
    var codigoAdjudicado = 0
    var array = this.combo.estadosSubsanacion.filter(f=>f.idCatalogoItem==form.idEstadoSubsanacion);
    if( array.length>0){
        codigoAdjudicado = array[0].codigoCatalogoItem;
    }
    
    if(codigoAdjudicado==EstadoSubsanacionEnum.ADJUDICADO)//ADJUDICADO
    {
        //Validar Servidor Publico
        this.handleRegistrarValidarServidorPublicoAjax(model);
    }else{
        //Registar cuando es NO ADJUDICADO
        this.handleRegistrarConfirm(model);
    }
  }

}