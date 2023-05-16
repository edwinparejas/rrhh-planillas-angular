import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { DocumentosSustentoComponent } from 'app/main/apps/licencias/components/documentos-sustento/documentos-sustento.component';
import { DocumentoSustentoModel } from 'app/main/apps/licencias/models/licencia.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { SancionResponseModel } from '../../models/sanciones.model';
import { ResultadoOperacionEnum } from '../../_utils/constants';
@Component({
    selector: 'minedu-informacion-sancion',
    templateUrl: './informacion-sancion.component.html',
    styleUrls: ['./informacion-sancion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionSancionComponent implements OnInit {

    sancion: SancionResponseModel = null;
    dialogTitle = 'Información de sanción';
    working = false;
    documentosSustento: DocumentoSustentoModel[] = [];
    idFalta: 0;
    @ViewChild(DocumentosSustentoComponent)
    private documentosSustentoComponent: DocumentosSustentoComponent;
    eliminado: boolean;
    constructor(
        public matDialogRef: MatDialogRef<InformacionSancionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog) {
        if (data.eliminado === true) {
            this.dialogTitle = 'Eliminar Sanción';
        }
    }

    ngOnInit(): void {
        this.working = true;
        this.idFalta = this.data.idFalta;
        this.eliminado = this.data.eliminado;
        this.obtenerDatosSancion(this.idFalta);
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }


    obtenerDatosSancion = (idFalta: number) => {
        this.dataService
            .Sanciones()
            .getSancionById(idFalta)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.working = false;
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.sancion = response.data;
                    }else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else {
                        this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => {  });
                    }   
            });
    }

    

}