import { Component, OnInit, ViewEncapsulation, Inject, QueryList, ViewChild } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { catchError, finalize, tap } from "rxjs/operators";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { ActivoFlagEnum, SituacionPlazasEnum, TipoFormatoPlazaEnum, EstadoValidacionPlazaEnum } from "../../../_utils/constants";
import { BusquedaPlazaComponent } from "../../../components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { descargarExcel } from "app/core/utility/functions";
import { ModalInformacionPlazaPUNComponent } from '../modal-informacion-plaza-pun/modal-informacion-plaza-pun.component';
import { MatTableDataSource } from '@angular/material/table';
import { criterioBusqueda } from "../../../models/criterioBusqueda.model";

@Component({
    selector: 'minedu-modal-incorporacion-plazas-pun',
    templateUrl: './modal-incorporacion-plazas-pun.component.html',
    styleUrls: ['./modal-incorporacion-plazas-pun.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalIncorporacionPlazasPUNComponent implements OnInit {
    form: FormGroup;
    dialogRef: any;
    estadoPlaza = 0;
    becario: string;
    working = false;
    isMobile = false;
    totalregistro = 0;
    selectedTabIndex = 0;
    dataPlazas: any[] = []; 
    idEtapaProceso;
    plazasIncorporadas: string;
    plazaFiltroSeleccionado: any;
    paginatorPlazasGeneradasPageIndex = 0;
    paginatorPlazasGeneradasPageSize = 10;
    @ViewChild("paginatorPlazasGeneradas", { static: true }) paginatorPlazasGeneradas: MatPaginator;
    centroTrabajoFiltroSeleccionado: any;
    selectionPlazasGeneradas = new SelectionModel<any>(true, []);
    dataSourcePlazasGeneradas: PlazasContratacionPlazasGeneradasDataSource | null;

    displayedColumnsPlazasGeneradas: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "acciones",
    ];

    request = {
        idPlaza: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idEtapaProceso: null
    };

    constructor(
        public matDialogRef: MatDialogRef<ModalIncorporacionPlazasPUNComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.plazasIncorporadas = this.data.plazasIncorporadas;
        this.buildForm();
        this.buildGrids();
        this.handleResponsive();
    }

    ngAfterViewInit() {
        this.paginatorPlazasGeneradas.page.pipe(tap(() => this.handleBuscar())).subscribe();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoCentroTrabajo: [null],
            codigoPlaza: [null]
        });
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
                this.dataService.Message().msgWarning('"CÓDIGO NO VÁLIDO, DEBE INGRESAR UN CÓDIGO DE DOCE (12) DÍGITOS."', () => {});
                return;
            }
        }

        if (this.request.codigoCentroTrabajo != null) {
            const codigoCentroTrabajo: string =
                this.request.codigoCentroTrabajo;
            if (codigoCentroTrabajo.length < 7) {
                this.dataService.Message().msgWarning('"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN CÓDIGO DE SIETE (7) DÍGITOS."', () => {});
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
            codigoCentroTrabajo: codigoCentroTrabajo
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

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA INCORPORAR LAS PLAZAS PARA CONTRACIÓN DE RESULTADOS pun?',
            () => {
                const request = {
                    idEtapaProceso: this.idEtapaProceso,
                    plazas: seleccionados.map((p) => {
                        return {
                            idPlaza: p.idPlaza,
                            idCentroTrabajo: p.idCentroTrabajo
                        }
                    }),
                    usuarioModificacion: "ADMIN"
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().registrarPlazasIncorporarContratacionResultdoPUN(request).pipe(catchError((e) => of(null)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response > 0) {
                        this.handleCancelar(this.dataPlazas);
                    } else {
                        this.dataService.Message().msgWarning('"NO SE INCORPORÓ CORRECTAMENTE LAS PLAZAS SELECCIONADAS."', () => {});
                    }
                });
            }
        );
    };

    informacionPlazaView = (row) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPlazaPUNComponent, {
            panelClass: "modal-informacion-plaza-pun-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idPlaza: row.idPlaza,
                idEtapaProceso: row.idEtapaProceso
            },
        });
    }

    handleExportarPlazasGeneradas() {
        this.handleExportarPlazasContratacionResultadosPUN(SituacionPlazasEnum.PRE_PUBLICADA, ActivoFlagEnum.INACTIVO, "Contratacion_Resultados_PUN_Plazas_Generadas.xlsx");
    }

    handleExportarPlazasContratacionResultadosPUN = (codigoValidacion: number, flagPlaza: number, nombreExcel: string) => {
        if (this.dataSourcePlazasGeneradas.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }

        let requestExport = { 
            plazasPublicar: null, 
            idEtapaProceso: this.idEtapaProceso, 
            flag: flagPlaza 
        };

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelContratacionResultadosPUN(requestExport).pipe(catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, nombreExcel);
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
            data.idEstadoValidacionPlaza = EstadoValidacionPlazaEnum.PENDIENTE;
            data.idResultadoFinal = null;
            this.dataService.Contrataciones().postBuscarPlazasPublicadasPaginadoPUN(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
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
