import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TipoDocumentoIdentidadEnum } from '../../../_utils/constants';

@Component({
    selector: 'minedu-modal-informacion-completa',
    templateUrl: './modal-informacion-completa.component.html',
    styleUrls: ['./modal-informacion-completa.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalInformacionCompletaComponent implements OnInit {

    adjudicacion: any;
    info: any;
    dialogTitle = 'Información Completa de la Adjudicación';
    working = true;
    isMobile = false;

    constructor(
        public matDialogRef: MatDialogRef<ModalInformacionCompletaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) { 
        this.info = data;
    }

    ngOnInit(): void {
        this.obtenerInformacionAdjudicacion();
    }

    obtenerInformacionAdjudicacion = () => {
        var d = {
            idAdjudicacion: this.info.id_adjudicacion
        };

        this.dataService.Contrataciones().getObtenerInformacionAdjudicacion(d).pipe(catchError(() => of([])),
            finalize(() => {
                this.working = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.adjudicacion = response;
		this.adjudicacion = {
		    ...this.adjudicacion,
		    nacionalidad : this.obtenerNacionalidad(response)
		};
            }
        });
    }
    obtenerNacionalidad = (data) => {
	if(data.tipoDocumento == TipoDocumentoIdentidadEnum.DNI && !data.nacionalidad){
	    data.nacionalidad = 'PERUANA';
	}
	return data.nacionalidad;
    }
    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    handleCancel = () => { 
        this.matDialogRef.close(); 
    }

}
