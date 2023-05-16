import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { isArray } from 'lodash';

@Component({
    selector: 'minedu-informacion-plaza-rotacion',
    templateUrl: './informacion-plaza-rotacion.component.html',
    styleUrls: ['./informacion-plaza-rotacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionPlazaRotacionComponent implements OnInit {

    plaza: any = null;

    constructor(
        public matDialogRef: MatDialogRef<InformacionPlazaRotacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService

    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            this.dataService.Spinner().show("sp6");
            this.getDetallePlaza();
        }, 0);
    }



    handleCancel = () => {
        this.matDialogRef.close();
    };


    private getDetallePlaza = () => {
        const { idPlazaRotacion, idPlazaRotacionDetalle } = this.data;
        console.log("plaza informacion cpmpelta", this.data)
        this.dataService
            .Rotacion()
            .getInformacionPlazaRotacion(idPlazaRotacion, idPlazaRotacionDetalle)
            .pipe(
               catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            ).subscribe((response: any) => {
                if (response) {
                    this.plaza = response;
                }
            });
    };
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

