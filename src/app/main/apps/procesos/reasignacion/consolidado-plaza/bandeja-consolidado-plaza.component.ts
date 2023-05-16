import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { OpcionFiltro } from "../models/reasignacion.model";
import { MENSAJES } from '../_utils/constants';
import { isArray } from 'lodash';
import { EstadoConsolidadoPlazaEnum, RegimenLaboralEnum } from "../_utils/constants";
import { saveAs } from "file-saver";
import { mineduAnimations } from "@minedu/animations/animations";
import { MatDialog } from "@angular/material/dialog";
import { MotivoRechazoComponent } from "./components/motivo-rechazo/motivo-rechazo.component";
import { ResultadoOperacionEnum } from "../../../../../core/model/types";
import { descargarExcel } from "app/core/utility/functions";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { SecurityModel } from "app/core/model/security/security.model";

@Component({
    selector: "minedu-bandeja-consolidado-plaza",
    templateUrl: "./bandeja-consolidado-plaza.component.html",
    styleUrls: ["./bandeja-consolidado-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaConsolidadoPlazaComponent implements OnInit, AfterViewInit {

    etapaResponse: any = {};
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    form: FormGroup;
    regimenLaboral = RegimenLaboralEnum;
    paginatorPageIndex = 0;
    paginatorPageSize = 10;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    dataSource: ConsolidadoDataSource | null;
    dialogRef: any;
    consolidadoPlazasPdf: string;
    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    estadoConsolidado = EstadoConsolidadoPlazaEnum;
    isMobile = false;
    idDre = 1;
    idUgel = 1;
    currentTime = new Date();


    currentSession: SecurityModel = new SecurityModel();
    
    comboLists = {
        listInstancia: [],
        listSubInstancia: [],
        listEstadoConsolidado: [],
    };

    request = {
        idProceso: null,
        idEtapaProceso: null,
        idDre: null,
        idUgel: null,
        idEstado: null,
        anio: null,
        maestroProceso: null,
        usuarioCreacion: null,
        codigoCentroTrabajoMaestro:null,
        idDesarrolloProceso: null
    };

    displayedColumns: string[] = [
        "registro",
        "idInstancia",
        "idSubInstancia",
        "estadoConsolidado",
        "fechaValidacion",
        "fechaAprobacion",
        "fechaRechazo",
        "acciones",
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog
    ) {}

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = this.route.snapshot.params.id;
        this.buildForm();
        this.handleResponsive();
        this.loadInstancia(true);
        this.loadEstadosConsolidado();
        this.dataSource = new ConsolidadoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
        this.obtenerEtapa();
        this.resetForm();

        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        // console.log(this.currentSession);
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

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Reasignación / Plazas Consolidadas");
        this.sharedService.setSharedTitle("Consolidado de Plazas");
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.loadData());
    }

    loadData(): void {
        this.setRequest();
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idInstancia: [null],
            idSubInstancia: [null],
            idEstadoConsolizadoPlaza: [null],
        });

        this.form.get("idInstancia").valueChanges.subscribe((value) => {
            let idNivelInstancia = null;
            let idInstancia = null;

            if (value === -1) {
                return;
            }

            if (this.comboLists.listInstancia.length !== 0 && value !== null && value !== undefined) {
                const data = this.comboLists.listInstancia.find((x) => x.id_instancia === value);
                idNivelInstancia = parseInt(value.toString().split("-")[0]);
                idInstancia = data.id; 
            }

            this.loadSubInstancia(idInstancia, true);
        });
    }

    obtenerEtapa = () => {
        // this.dataService.Contrataciones().obtenerCabeceraEtapaProcesoById(this.idEtapaProceso).pipe(
            this.dataService.Reasignaciones().getDatosProcesoEtapaById(this.idEtapaProceso).pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                this.etapaResponse = response;
                this.buscarConsolidado();
                this.obtenerEstadoDesarrolloEtapa();
            }
        });
    };

    obtenerEstadoDesarrolloEtapa = () => {
        this.dataService
            .Reasignaciones()
            .obtenerEstadoDesarrolloEtapaProcesoPorCodigoSede(this.idEtapaProceso, this.currentSession.codigoSede)          
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.idDesarrolloProceso = response.idDesarrolloProceso;
                }
            });
    };

    loadInstancia = (activo) => {
        // this.dataService.Reasignaciones().getInstancias(activo).pipe(
        this.dataService.Reasignaciones().getInstanciasPorDRE(activo).pipe(           
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                const data = response.map((x) => ({
                    ...x,
                    value: x.id_instancia,
                    label: `${x.descripcion_instancia}`,
                }));
                this.comboLists.listInstancia = data;
                this.comboLists.listInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
            }
        });
    };


    loadSubInstancia = (idInstancia, activo) => {
        if (idInstancia == null || idInstancia == -1) {
            this.comboLists.listSubInstancia = [];
            this.comboLists.listSubInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });

            return;
        } else {
            //this.dataService.Contrataciones().getComboSubinstancia(idInstancia, activo).pipe(
            this.dataService.Reasignaciones().getSubInstancias(activo, idInstancia).pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.id_subinstancia,
                        label: `${x.descripcion_subinstancia}`,
                    }));

                    this.comboLists.listSubInstancia = data;
                    this.comboLists.listSubInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                    this.form.get("idSubInstancia").setValue(this.opcionFiltro.item.value);
                }
            });
        }
    };

    loadEstadosConsolidado = () => {
        //this.dataService.Contrataciones().getComboEstadosConsolidadoPlaza(CatalogoItemEnum.ESTADOS_CONSOLIDADO).pipe(
         this.dataService.Reasignaciones().getComboEstadoConsolidado().pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                const data = response.map((x) => ({
                    ...x,
                    value: x.id,
                    label: `${x.descripcion}`,
                }));

                this.comboLists.listEstadoConsolidado = data;
                this.comboLists.listEstadoConsolidado.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
            }
        });
    };

    handleBuscar = () => {
        this.buscarConsolidado();
    };

    buscarConsolidado(): void {
        this.setRequest();
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    setRequest = () => {
        const dre = this.form.get("idInstancia").value;
        const ugel = this.form.get("idSubInstancia").value;
        const estado = this.form.get("idEstadoConsolizadoPlaza").value;

        this.request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapaProceso: this.etapaResponse.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            idDre: dre == -1 ? null : parseInt(dre.toString().split("-")[1]), //dre
            idUgel: ugel == -1 ? null : parseInt(ugel.toString().split("-")[1]), //ugel
            idEstado: estado == -1 ? null : estado,
            usuarioCreacion: this.currentSession.numeroDocumento,
            maestroProceso: null,
            anio: null,
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
        };
    };

    resetForm = () => {
        this.form.reset();
        this.form.get("idInstancia").setValue(this.opcionFiltro.item.value);
        this.form.get("idSubInstancia").setValue(this.opcionFiltro.item.value);
        this.form.get("idEstadoConsolizadoPlaza").setValue(this.opcionFiltro.item.value);
    };

    handleRetornar = () => {
        this.router.navigate(["../../../../../bandejas/aprobacionespendientes"], { relativeTo: this.route });
    };

    handleExportar = () => {
        this.request.idDre = this.comboLists.listInstancia[1].id;
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {} );
            return;
        }

        this.dataService.Spinner().show("sp6");
            this.dataService.Reasignaciones().exportarConsolidadoPlaza(this.request).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, "Consolidado_Plazas.xlsx");
            } else {
                this.dataService.Message().msgWarning('"NO SE GENERÓ CORRECTAMENTE EL ARCHIVO EXCEL DE CONSOLIDADO DE PLAZAS."', () => {} );
            }
        });
    }

    handleAprobarPlazas = () => {
        const resultMessage = '"SE REALIZÓ CORRECTAMENTE LA APROBACIÓN MASIVA DE PLAZAS."';
        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA APROBAR MASIVAMENTE LAS PLAZAS?",
            () => {
                this.dataService.Spinner().show("sp6");
                const data = {
                    idep : this.request.idEtapaProceso,
                    instancia: this.request.codigoCentroTrabajoMaestro,
                    usuario: this.request.usuarioCreacion
                }
                this.dataService.Reasignaciones().aprobarMasivoConsolidadoPlazas(data).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {});
                        this.handleBuscar();
                    } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => {});
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => {});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON PROBLEMAS AL TRATAR DE APROBAR MASIVAMENTE LAS PLAZAS."', () => {} );
                    }
                });
            }, (error) => {}
        );
    }

    handleGenerarPdf = () => {
        this.request.maestroProceso = "REASIGNACIÓN ";
        this.request.usuarioCreacion = this.currentSession.numeroDocumento;
        this.request.anio = this.etapaResponse.anioProceso;
        this.request.idDesarrolloProceso = this.idDesarrolloProceso;

        const resultMessage = '"SE GENERÓ CORRECTAMENTE EL DOCUMENTO PDF DE LAS PLAZAS."';
        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO DE GENERAR EL DOCUMENTO PDF DE LAS PLAZAS?",
            () => {
                this.dataService.Spinner().show("sp6");
                    this.dataService.Reasignaciones().generarPdfConsolidadoPlazas(this.request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response.file) {
                        this.consolidadoPlazasPdf = response.file;
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO,MENSAJES.DURACION, () => {});
                    } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => {});
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => {});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON PROBLEMAS AL TRATAR DE GENERAR EL DOCUMENTO PDF."', () => {} );
                    }
                });
            }, (error) => {}
        );
    }

    handleVerConsolidadoPlazas() {
        if (!this.consolidadoPlazasPdf) {
            this.dataService.Message().msgWarning('"NO SE PUDO ACCEDER AL DOCUMENTO PDF DEL CONSOLIDADO DE PLAZAS."', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(this.consolidadoPlazasPdf).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('"ERROR, NO SE PUDO ACCEDER AL SERVICIO."', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                this.handlePreview(response, "Consolidado_Plazas");
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO ACCEDER AL DOCUMENTO PDF DEL CONSOLIDADO DE PLAZAS."', () => { });
            }
        });
    }

    // handleVerResultadoPreliminar = () => {
    //     this.dataService.Spinner().show('sp6');
    //     const data = {
    //         idEtapaProceso: Number(this.idEtapaProceso)
    //     }
    //     this.dataService
    //         .Reasignaciones()
    //         .getBuscarDocumentoPublicadoCalificacionPreliminar(data)
    //         .pipe(
    //             catchError((e) => { return  this.configCatch(e);}),
    //             finalize(() => {
    //                 this.dataService.Spinner().hide('sp6');
    //             })
    //         )
    //         .subscribe((response: any) => {
    //             if (response) {
    //                 this.handleDescargarAdjunto(response);
    //             } else {
    //                 this.dataService
    //                 .Message()
    //                 .msgAutoCloseWarningNoButton(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,MENSAJES.DURACION,() => {});
    //             }
    //         });
    // }

    // handleDescargarAdjunto(row) {
    //     if (!row.codigo) {
    //         this.dataService
    //             .Message()
    //             .msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_DOCUMENTO_ADJUNTO,() => {});
    //         return;
    //     }
    //     this.dataService.Spinner().show("sp6");
    //     this.dataService
    //         .Documento()
    //         .descargar(row.codigo)
    //         .pipe(
    //             catchError((e) => {
    //                 return of(e);
    //             }),
    //             finalize(() => this.dataService.Spinner().hide("sp6"))
    //         )
    //         .subscribe((response) => {
    //             if (response) {
    //                  saveAs(response, 'calificaciones preliminares.xlsx');
    //             } else {
    //                 this.dataService
    //                     .Message()
    //                     .msgAutoCloseWarningNoButton(
    //                         MENSAJES.MENSAJE_PROBLEMA_DOCUMENTO_ADJUNTO,MENSAJES.DURACION,
    //                         () => {}
    //                     );
    //             }
    //         });
    // }


    handlePreview(file: any, nameFile: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Consolidado Plazas",
                    file: file
                }
            }
        });
    
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
            if (response.download) {
                saveAs(file, nameFile + ".pdf");
            }
        });
    }

    handleMotivoRechazo = (detalleConsolidado) => {
        this.dialogRef = this.materialDialog.open(MotivoRechazoComponent, {
            panelClass: "motivo-rechazo-dialog",
            width: "700px",
            disableClose: true,
            data: {
                action: "motivoDetalle",
                detalle: detalleConsolidado.detalle_motivo_rechazo
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.buscarConsolidado();
            }
        });
    }

    handleGoConsolidadoPlazaDetalle = (row) => {
        this.router.navigate(["../../consolidadoplazadetalle/" + this.etapaResponse.idEtapaProceso + "/" + row.id_consolidado_plaza],
            { relativeTo: this.route }
        )
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
            this.dataService.Message().msgAutoCloseWarningNoButton(MENSAJES.MENSAJE_ERROR_SERVIDOR,MENSAJES.DURACION, () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }

}

export class ConsolidadoDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        this.dataService.Spinner().show("sp6");
        if (data.idProceso == null && data.idEtapaProceso == null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
                this.dataService.Reasignaciones().getListaConsolidadoPlaza(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                this._dataChange.next(response || []);
                this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_registros;
                if ((response || []).length === 0) {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA SELECCIONADO."',
                        () => {}
                    );
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
