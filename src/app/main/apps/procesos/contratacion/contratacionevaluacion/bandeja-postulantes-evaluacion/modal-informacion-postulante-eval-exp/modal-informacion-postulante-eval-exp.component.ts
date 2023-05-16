import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CONFIGURACION_PROCESO_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { ActivoFlagEnum, CatalogoItemEnum, EdadMaximaEnum, ProcesoEnum, ProcesoEtapaEnum, TipoDocumentoIdentidadEnum, TipoFormatoPlazaEnum } from '../../../_utils/constants';
import { BusquedaPlazaComponent } from '../../../components/busqueda-plaza/busqueda-plaza.component';
import { IPostulanteContratacionDirecta, PlazasPublicacionInformacionResponseModel } from '../../../models/contratacion.model';

@Component({
    selector: 'minedu-modal-informacion-postulante-eval-exp',
    templateUrl: './modal-informacion-postulante-eval-exp.component.html',
    styleUrls: ['./modal-informacion-postulante-eval-exp.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalInformacionPostulanteEvalExpComponent implements OnInit {

    form: FormGroup;
    working = false;
    isMobile = false;
    nowDate = new Date();
    postulante: any = {};
    tipoDocumento: number;
    idEtapaProceso: number;
    plazaFiltroSeleccionado: any;

    modal = {
        title: "",
        action: ""
    }

    permisoPassport = {
        buttonCrearComite: false,
        buttonModificarComite: false,
        buttonEliminarComite: false
    }

    dialogRef: any;
    documento = TipoDocumentoIdentidadEnum;
    maxLengthnumeroDocumentoIdentidad: number;
    plaza: PlazasPublicacionInformacionResponseModel = null;
    dataSourcePlazasVinculadas: any[] = [];

    displayedColumnsPlazas: string[] = [
        "registro",
        "instancia",
        "sub_instancia",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "codigo_plaza",
        "tipo_plaza",
        "regimen_laboral",
        "condicion_laboral",
        "cargo",
        "area_curricular",
        "jornada_laboral",
        "fecha_inicio",
        "fecha_fin",
    ];

    constructor(
        public matDialogRef: MatDialogRef<ModalInformacionPostulanteEvalExpComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.initialize();
        this.handleBuscar();
    }

    defaultPermisoPassport() {
        this.permisoPassport.buttonCrearComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
        this.permisoPassport.buttonModificarComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
        this.permisoPassport.buttonEliminarComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Eliminar);
    }
    
    initialize() {
        this.modal = this.data;
        this.postulante = this.data.datos;
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.getVinculacionPostulante();
    }

    handleBuscar = () => {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            codigoPlaza: this.postulante.codigoPlaza
        };

        this.dataService.Spinner().hide("sp6");
        this.dataService.Contrataciones().getContratacionDirectaPlazaByCodigo(request).pipe(catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response && response.length != 0) {
                this.plaza = response;
            } else {
                this.plaza = null;
            }
        });
    }

    getVinculacionPostulante() {
        const numeroDocumentoIdentidad = this.postulante.numeroDocumentoIdentidad;

        this.dataService.Spinner().hide("sp6");
        this.dataService.Contrataciones().getVinculacionPostulanteByNumeroDocumento(numeroDocumentoIdentidad).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response && response.length != 0) {
                this.dataSourcePlazasVinculadas = response;
            }
        });
    }

    handleCancelar(data?: any) {
        this.matDialogRef.close(data);
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

}
