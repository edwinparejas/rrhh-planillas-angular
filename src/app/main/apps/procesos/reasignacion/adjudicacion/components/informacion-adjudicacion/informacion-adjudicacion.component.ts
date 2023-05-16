import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { isArray } from 'lodash';
import { MENSAJES, TipoFormatoPlazaEnum } from '../../../_utils/constants';
import { catchError, finalize } from 'rxjs/operators';
import { CustomAdjudicacionResponse } from '../../../models/reasignacion.model';

@Component({
    selector: 'minedu-informacion-adjudicacion',
    templateUrl: './informacion-adjudicacion.component.html',
    styleUrls: ['./informacion-adjudicacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionAdjudicacionComponent implements OnInit {
    spublico = null;
    postulacion = null;
    plaza = null;
    dialogTitle = 'Información de adjudicación';
    working = false;
    adjudicaciones: CustomAdjudicacionResponse;
    idAdjudicacion: number;
    idCalificacion: number;
    idPostulacion: number  ; 
    idEtapaProceso: number;
    calificacion = null;


    constructor(
        public matDialogRef: MatDialogRef<InformacionAdjudicacionComponent>,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ) { }

    ngOnInit(): void {
        this.idAdjudicacion = this.data.idAdjudicacion;
        this.idCalificacion = this.data.AdjuncacionRow.idCalificacion;
        // this.loadAdjudicacion()
        this.loadCalificacion();
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    loadAdjudicacion = () => {
        this.dataService.Reasignaciones()
            .getAdjudicacionCustom(this.idAdjudicacion)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.adjudicaciones = response.data;
                }
            });
    }

    loadCalificacion = () => {
        const data = {
            idCalificacion: this.idCalificacion
        }
        this.dataService
            .Reasignaciones()
            .getCalificacion(data)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.calificacion = response;
                    this.GetPostulacion();
                }
            });
    };

    private GetPostulacion = () => {
        let idPostulacion = this.calificacion.idPostulacion
        let idEtapaProceso = this.calificacion.idEtapaProceso;

        var data = {
            idPostulacion: this.calificacion.idPostulacion,
            idAdjudicacion: this.idAdjudicacion
        }
    
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .getInformacionPostulanteAdjudicado(data)
            // .getPostulacion(idPostulacion, idEtapaProceso)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); })
            ).subscribe((response: any) => {
                if (response) {
                    const { postulacion, servidorPublico, plaza } = response;
                    this.postulacion = postulacion;
                    this.spublico = servidorPublico;
                    this.plaza = plaza;
                } else {
                    this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
                }
            });
      }

      configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD)!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError(MENSAJES.MENSAJE_ERROR_SERVIDOR, () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }

}
