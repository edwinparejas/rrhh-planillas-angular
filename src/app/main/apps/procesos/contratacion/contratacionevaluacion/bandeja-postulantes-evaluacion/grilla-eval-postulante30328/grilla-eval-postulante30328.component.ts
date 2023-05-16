import { Component, OnInit, ViewChild, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, of } from 'rxjs';
import { DataService } from 'app/core/data/data.service';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { EstadoPostulacionEnum, EstadoPostulante, MensajesSolicitud } from '../../../_utils/constants';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { catchError, finalize, tap } from "rxjs/operators";
import { MatDialog } from '@angular/material/dialog';
import { ModalInformacionPostulanteEvalExpComponent } from '../modal-informacion-postulante-eval-exp/modal-informacion-postulante-eval-exp.component';
import { ModalNuevoPostulanteEvaluacionRl30493Component } from '../modal-nuevo-postulante-evaluacion-rl30493/modal-nuevo-postulante-evaluacion-rl30493.component';
import { ModalEditarPostulanteEvalExpComponent } from '../modal-editar-postulante-eval-exp/modal-editar-postulante-eval-exp.component';

@Component({
  selector: 'minedu-grilla-eval-postulante30328',
  templateUrl: './grilla-eval-postulante30328.component.html',
  styleUrls: ['./grilla-eval-postulante30328.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class GrillaEvalPostulante30328Component implements OnInit {
    dialogRef: any;
    EstadoPostulacionEnum = EstadoPostulacionEnum;
    isMobile = false;
    @Input() idEtapaProceso:any;
    @Input() dataSourcePostulantes: any;
    @Output() eventPaginator = new EventEmitter<any>();
    @Output() eventDelete = new EventEmitter<any>();
    paginatorPostulantesPageIndex = 0;
    paginatorPostulantesPageSize = 10;
    @ViewChild("paginatorPostulantes", { static: true }) paginatorPostulantes: MatPaginator;
    displayedColumnsPostulantes: string[] = [
        "registro",
        "documento",
        "apellidos_nombres",
        "numero_expediente",
        "modalidad_educativa",
        "nivel_educativo",
        "area_curricular",
        "especialidad",
        "estado",
        "tipo_registro",
        "acciones"
    ];
  constructor(
        private dataService: DataService,
        private materialDialog: MatDialog,
  ) { }

  ngOnInit(): void {
      this.handleResponsive();
      this.buildGrids();
	this.eventPaginator.emit({
	    pageIndex:0,
	    pageSize:10,
	});
  }

    ngAfterViewInit() {
       this.paginatorPostulantes
           .page
	   .pipe(tap((paginator) => {
	    this.eventPaginator.emit(paginator);
	    })).subscribe();
    }

    buildGrids(): void {
        this.buildPaginators(this.paginatorPostulantes);
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
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

    eliminarPostulante = (data, index) => {
        let requestEliminar = {
            idPostulacion: data.idPostulacion,
            usuarioModificacion: "ADMIN"
        };

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR AL POSTULANTE?',
            () => {
                this.dataService.Spinner().hide("sp6");
                this.dataService.Contrataciones()
		    .postEliminarContratacionEvalExpPostulante(requestEliminar).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response > 0) {
                        this.dataService.Message().msgSuccess('"EL POSTULANTE HA SIDO ELIMINADO CORRECTAMENTE"');
			this.eventDelete.emit();
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
                    }
                });
            }
        );
    }

    informacionPostulanteView = (dataPostulante:any) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPostulanteEvalExpComponent, {
            panelClass: 'modal-informacion-postulante-eval-exp-dialog',
            disableClose: true,
            data: {
                icon: "eye",
                title: "Información Completa Postulante",
                idEtapaProceso: this.idEtapaProceso,
                datos: dataPostulante
            }
        });
      
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    }

    editarPostulanteView = (dataPostulacion:any) => {
	    this.dialogRef = this.materialDialog.open(ModalEditarPostulanteEvalExpComponent, {
		panelClass: 'modal-editar-postulante-eval-exp-dialog',
		disableClose: true,
		data: {
		    icon: "save",
		    title: "Modificar Postulante",
		    datos: dataPostulacion,
		    idEtapaProceso: this.idEtapaProceso
		}
	    });
	    this.dialogRef
	    .afterClosed()
	    .subscribe((response: any) => {
		if (response == 0) {
		   this.eventDelete.emit();
		}
	    });
    }

}
