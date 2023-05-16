import { Component, OnInit, ViewEncapsulation, Inject, QueryList, ViewChild } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { catchError, finalize, tap } from "rxjs/operators";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { TipoFormatoPlazaEnum, RegimenLaboralEnum, TipoProcesoPlazaEnum, EstadoPlazaIncorporarEnum, MensajesSolicitud } from "../../../_utils/constants";
import { BusquedaPlazaComponent } from "../../../components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { ModalInformacionPlazaComponent } from "../modal-informacion-plaza/modal-informacion-plaza.component";
import { descargarExcel } from "app/core/utility/functions";
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from '../../../../../../../core/model/message';
import { criterioBusqueda } from "../../../models/criterioBusqueda.model";


@Component({
    selector: 'minedu-modal-incorporacion-plazas',
    templateUrl: './modal-incorporacion-plazas.component.html',
    styleUrls: ['./modal-incorporacion-plazas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalIncorporacionPlazasComponent implements OnInit {

    form: FormGroup;
    dialogRef: any;
    estadoPlaza = 0;
    becario: string;
    working = false;
    isMobile = false;
    totalregistro = 0;
    selectedTabIndex = 0;
    idEtapaProceso;
    verInstanciaSubinstancia=false;
    codigoCentroTrabajoMaestro;
    plazaFiltroSeleccionado: any;
    paginatorPlazasGeneradasPageIndex = 0;
    paginatorPlazasGeneradasPageSize = 10;
    @ViewChild("paginatorPlazasGeneradas", { static: true }) paginatorPlazasGeneradas: MatPaginator;
    centroTrabajoFiltroSeleccionado: any;
    selectionPlazasGeneradas = new SelectionModel<any>(true, []);
    dataSourcePlazasGeneradas: PlazasContratacionPlazasGeneradasDataSource | null;
    
    displayedColumnsPlazasGeneradas: string[] = [
        "registro",
        "instancia",
        "subinstancia",
        "codigoModular",
        "centroTrabajo",
        "modalidad",
        "nivelEducativo",
        "tipoGestion",
        "codigoPlaza",
        "cargo",
        "areaCurricular",
        "tipoPlaza",
        "vigenciaInicio",
        "vigenciaFin",
        "acciones",
    ];

    request = {
        idPlaza: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idEtapaProceso: null,
        codigoCentroTrabajoMaestro: null,
    };

    constructor(
        public matDialogRef: MatDialogRef<ModalIncorporacionPlazasComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.codigoCentroTrabajoMaestro = this.data.codigoCentroTrabajoMaestro;
        this.verInstanciaSubinstancia = this.data.verInstanciaSubinstancia!=null?this.data.verInstanciaSubinstancia:false;
        console.log("datos modal incorporar: ", this.idEtapaProceso, this.codigoCentroTrabajoMaestro);
        this.buildForm();
        this.buildGrids();
        this.handleResponsive();
        this.initializeTableColumns();
    }

    ngAfterViewInit() {
        this.paginatorPlazasGeneradas.page.pipe(tap(() => this.handleBuscar())).subscribe();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoCentroTrabajo: [null],
            codigoPlaza: [null]
        });

        setTimeout((_) => this.handleBuscar());
    }

    buildGrids(): void {
        this.dataSourcePlazasGeneradas = new PlazasContratacionPlazasGeneradasDataSource(this.dataService);
        this.buildPaginators(this.paginatorPlazasGeneradas);
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

    initializeTableColumns(){
        if (this.verInstanciaSubinstancia)
        {
            this.displayedColumnsPlazasGeneradas = [
                "registro",
                "instancia",
                "subinstancia",
                "codigoModular",
                "centroTrabajo",
                "modalidad",
                "nivelEducativo",
                "tipoGestion",
                "codigoPlaza",
                "cargo",
                "areaCurricular",
                "tipoPlaza",
                "vigenciaInicio",
                "vigenciaFin",
                "acciones",
            ];
        }
        else{
            this.displayedColumnsPlazasGeneradas = [
                "registro",
                "codigoModular",
                "centroTrabajo",
                "modalidad",
                "nivelEducativo",
                "tipoGestion",
                "codigoPlaza",
                "cargo",
                "areaCurricular",
                "tipoPlaza",
                "vigenciaInicio",
                "vigenciaFin",
                "acciones",
            ];
        }
    }

    checkboxLabelPlazasGeneradas(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasGeneradas() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasGeneradas.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    masterTogglePlazasGeneradas = () => {
        this.isAllSelectedPlazasGeneradas() ? this.selectionPlazasGeneradas.clear() : this.dataSourcePlazasGeneradas.data.forEach((row) =>
            this.selectionPlazasGeneradas.select(row)
        );
    };

    isAllSelectedPlazasGeneradas = () => {
        const numSelected = this.selectionPlazasGeneradas.selected.length;
        const numRows = this.dataSourcePlazasGeneradas.data.length;
        return numSelected === numRows;
    };

    handleBuscar = () => {
        this.buscarPlazasContratacionIncorporadas();
    }

    buscarPlazasContratacionIncorporadas = () => {
        this.setRequest();

        if (this.request.codigoPlaza) {
            const codigoPlaza: string = this.request.codigoPlaza;
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (this.request.codigoCentroTrabajo) {
            const codigoCentroTrabajo: string = this.request.codigoCentroTrabajo;
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }
        /*
        if (this.request.codigoPlaza != null) {
            const codigoPlaza: string = this.request.codigoPlaza;
            if (codigoPlaza.length < 12) {
                this.dataService.Message().msgWarning('"CÓDIGO NO VÁLIDO, DEBE INGRESAR UN CÓDIGO DE PLAZA CON DOCE (12) DÍGITOS."', () => {});
                return;
            }
        }

        if (this.request.codigoCentroTrabajo != null) {
            const codigoCentroTrabajo: string =
                this.request.codigoCentroTrabajo;
            if (codigoCentroTrabajo.length < 7) {
                this.dataService.Message().msgWarning('"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON SIETE (7) DÍGITOS"', () => {});
                return;
            }
        }*/
        
        this.buscarPlazasContratacion();
    };

    setRequest(): void {
        const formulario = this.form.getRawValue();

        let idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.idPlaza : null;
        let codigoPlaza = formulario.codigoPlaza;
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo;

        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idPlaza: idPlaza,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo,
            codigoCentroTrabajoMaestro: this.codigoCentroTrabajoMaestro,
        };
    }

    buscarPlazasContratacion = () => {
        this.selectionPlazasGeneradas = new SelectionModel<any>(true, []);
        this.dataSourcePlazasGeneradas.load(this.request, this.paginatorPlazasGeneradas.pageIndex + 1, this.paginatorPlazasGeneradas.pageSize);
    };

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1300px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
                this.centroTrabajoFiltroSeleccionado = { ...result.centroTrabajo };
            }
        });
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigo_plaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }

    handleIncorporarPlazas = () => {
        let seleccionados = this.selectionPlazasGeneradas.selected || [];

        if (!((this.isAllSelectedPlazasGeneradas() && this.dataSourcePlazasGeneradas.data.length) || seleccionados.length)) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR AL MENOS UNA PLAZA."', () => {});
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA INCORPORAR LAS PLAZAS PARA CONTRACIÓN DIRECTA?',
            () => {

                const request = this.data.idSituacionValidacion == undefined ? {
                    idEtapaProceso: this.idEtapaProceso,
                    plazas: seleccionados.map((p) => {
                        return {
                            idPlaza: p.idPlaza,
                            idCentroTrabajo: p.idCentroTrabajo
                        }
                    }),
                    usuarioModificacion: "ADMIN",
                    codigoCentroTrabajoMaestro: this.codigoCentroTrabajoMaestro,
                } : {
                    idEtapaProceso: this.idEtapaProceso,
                    plazas: seleccionados.map((p) => {
                        return {
                            idPlaza: p.idPlaza,
                            idCentroTrabajo: p.idCentroTrabajo
                        }
                    }),
                    usuarioModificacion: "ADMIN",
                    idSituacionValidacion:this.data.idSituacionValidacion,
                    codigoCentroTrabajoMaestro:this.codigoCentroTrabajoMaestro,
                };

                // if (this.data.idSituacionValidacion != undefined){
                //     request = {
                //         idEtapaProceso: this.idEtapaProceso,
                //         plazas: seleccionados.map((p) => {
                //             return {
                //                 idPlaza: p.idPlaza,
                //                 idCentroTrabajo: p.idCentroTrabajo
                //             }
                //         }),
                //         usuarioModificacion: "ADMIN",
                //         idSituacionValidacion:this.data.idSituacionValidacion,
                //     };
                // }
                // else
                // {
                //     const request = {
                //         idEtapaProceso: this.idEtapaProceso,
                //         plazas: seleccionados.map((p) => {
                //             return {
                //                 idPlaza: p.idPlaza,
                //                 idCentroTrabajo: p.idCentroTrabajo
                //             }
                //         }),
                //         usuarioModificacion: "ADMIN"
                //     };
                // }
                

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().registrarPlazasIncorporarContratacionDirecta(request).pipe(catchError((e) => of(null)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: number) => {
                    if (response > 0) {
                        this.handleCancelar(seleccionados);
                    } else {
                        this.dataService.Message().msgWarning('"NO SE INCORPORÓ CORRECTAMENTE LAS PLAZAS SELECCIONADAS."', () => {});
                    }
                });
            }
        );
    };

    informacionPlazaView = (id: number) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPlazaComponent, {
            panelClass: "modal-informacion-plaza-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idPlaza: id
            },
        });
    }

    handleExportarPlazasGeneradas = () => {
        if (this.dataSourcePlazasGeneradas.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }

        let requestExport: any = { 
            codigoRegimen: RegimenLaboralEnum.LEY_30328, 
            tipoProceso: TipoProcesoPlazaEnum.SIN_PROCESO, 
            estadoPlaza: EstadoPlazaIncorporarEnum.APROBADO
        };

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelPlazasIncorporar(requestExport).pipe(catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, "Contratacion_Directa_Plazas_Incorporar.xlsx");
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA SU EXPORTACIÓN."', () => {});
            }
        });
    }

    handleCancelar(data?: any) {
        if (data) {
            this.matDialogRef.close({ plazas: data });
        } else {
            data = "0";
            this.matDialogRef.close();
        }        
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    resetForm = () => {
        this.form.reset();
    };

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

export class PlazasContratacionPlazasGeneradasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Contrataciones().postBuscarPlazasPublicadasPaginadoDirecta(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe(response => {
                console.log("Respuesta busqyeda incorporar:", response);
                if (response) {
                    this._dataChange.next(response || []);
                    this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_registros;
                    if (this.totalregistro > 0) {
                    }
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
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalregistro;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}
