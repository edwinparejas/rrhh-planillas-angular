import { Component, OnInit, ViewEncapsulation ,ViewChild, EventEmitter, Output, Input} from '@angular/core';
import { 
    IGenerarPdfPlazasPrePublicadas,
    IActualizarEtapaProcesoViewModel,
    IActualizarPlazaContratacionSiEsBecarioViewModel 
    } from '../../models/contratacion.model';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize,  tap } from "rxjs/operators";
import { BehaviorSubject, of, Observable } from "rxjs";
import { SecurityModel } from 'app/core/model/security/security.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoEtapaProcesoEnum , GrupoDocumentoPublicadoEnum, RegimenLaboralEnum} from '../../_utils/constants';
import { MatDialog } from '@angular/material/dialog';
import { ModalDocumentosPublicadosPrepublicacionComponent } from '../modal-documentos-publicados-prepublicacion/modal-documentos-publicados-prepublicacion.component';
import { InformacionPlaza30328Component } from '../../prepublicacion30328/informacion-plaza/informacion-plaza30328.component';
import { CollectionViewer, SelectionModel } from "@angular/cdk/collections";
import { descargarExcel } from "app/core/utility/functions";
import { DataSource } from "@angular/cdk/table";
import { mineduAnimations } from '@minedu/animations/animations';
import { MatPaginator } from '@angular/material/paginator';
import { idRegimenLaboral } from 'app/main/apps/acciones/desplazamiento/models/desplazamiento.model';
import { ModalDocumentosPrepublicadosFechaOldComponent } from '../modal-documentos-publicados-fecha/modal-documentos-prepublicados-fechaOld.component';
import { regimenLaboral } from 'app/main/apps/acciones/desplazamiento/_utils/constants';
import { numeroFilaGrilla } from '../../_utils/grilla';
import { bandejaPublicacion } from '../../models/bandejaPublicacion';

@Component({
  selector: 'minedu-grilla-prepublicacion30493',
  templateUrl: './grilla-prepublicacion30493.component.html',
  styleUrls: ['./grilla-prepublicacion30493.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class GrillaPrepublicacion30493Component implements OnInit {
    numeroFilaGrilla:any = numeroFilaGrilla;
    nroEtapasIniciadas : number = 0;
    paginatorDocentesPageSize = 10;
    paginatorDocentesPageIndex = 0;
    displayedColumnsDocentes: string[] = [
	"numero_registro",
	"instancia",
	"subinstancia",
	"codigo_modular",
	"centro_trabajo",
	"modalidad",
	"nivel_educativo",
	"tipo_gestion",
	"codigo_plaza",
	"cargo",
	"tipo_plaza",
	"vigencia_inicio",
	"vigencia_fin",
	"acciones",
    ];
    selectionDocentes = new SelectionModel<any>(true, []);
    selectedTabIndex = 0;
    currentSession: SecurityModel = new SecurityModel();
    validacionPlaza: string;
    soloLectura = true;
    @Output() eventPaginator = new EventEmitter<any>();
    @Output() eventDelete = new EventEmitter<any>();
    @Input() dataSourceDocentes: any;

    controlesActivos:ControlesActivos = {
	btnFinalizarEtapa : true,
	btnAperturaEtapa : true,
	btnIncorporarPlazas: true,
	btnPrePublicarPlazas:true,
	btnPlazaBecarios:true,
	btnVerPlazasPDF:true,
	btnExportar:true,    
    };
    estadoDesarrollo:any;
    jobEjecutado = false;
    idEtapaProceso: number;
    idPlazaContratacion: number;
    fecha = new Date();
    fechaCorteVisible = new Date();
    fechaCorte:Date;
    codSedeCabecera:string = '000000'; // added
    dialogRef: any;
    @ViewChild("paginatorDocentes", { static: true })
    paginatorDocentes: MatPaginator;
    fechaFinNacional:Date;
    isMobile = false;
    modelBandejaPublicacion:bandejaPublicacion = new bandejaPublicacion();

    constructor(
	private route: ActivatedRoute,
	private dataService: DataService,
	private router: Router,
	private materialDialog: MatDialog,
    ) { }

    ngOnInit(): void {
	if (this.route.routeConfig.path.search('ver-prepublicacion/') > -1) {
	    this.soloLectura = true;
	} else {
	    this.soloLectura = false;
	}
	this.setUpVariables();
	this.buildGrids();
	this.eventPaginator.emit({
	    pageIndex:0,
	    pageSize:10,
	});
	this.obtenerPlazaContratacion();
        this.obtenerFechaDeCortePrepublicacion();
	this.handleResponsive();
        this.obtenerEstadoJobEjecutado();
    }

    obtenerEstadoJobEjecutado(){
        let idProcesoEtapa = +this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;

        this.dataService
            .Contrataciones()
            .getVerificarEjecucionJobPlazas(idProcesoEtapa)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.jobEjecutado = response.resultadoValidacion;
                }
            });
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
            console.log("Mobile activado? :", this.isMobile);
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        console.log("Redimension ventana cliente:", w);

        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    setUpVariables = () => {
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
    }

    buildGrids(): void {
        this.buildPaginators(this.paginatorDocentes);
    }

    ngAfterViewInit() {
       this.paginatorDocentes
           .page
	   .pipe(tap((paginator) => {
	    this.eventPaginator.emit(paginator);
	    })).subscribe();
    }

    handleAperturarPrePublicar  = () => {
        let fechaActual = new Date();
        console.log("Booleano aperturar plazas fecha:", fechaActual > this.fechaFinNacional);
        if(fechaActual > this.fechaFinNacional){
            return this.dataService.Message().msgAutoCloseWarningNoButton('"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE FINALLIZÓ LA ACTIVIDAD PRE PUBLICACIÓN DE PLAZAS."',3000, () => {}); // M152
        }
        console.log("Booleano nro etapas inciadasl:", this.nroEtapasIniciadas);
        if(this.nroEtapasIniciadas>0){
            return this.dataService.Message().msgAutoCloseWarningNoButton('"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE EL SIGUIENTE PROCESO SE HA INICIADO"',3000, () => {}); // M156
        }

        const request: IActualizarEtapaProcesoViewModel = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: 'ADMIN',
            codigoCentroTrabajoMaestro: '000000', // HARDCODE: REMOVE usar ENUM

        };

        this.dataService.Contrataciones().getVerificarAperturarPlazasPrepublicacion(request).subscribe((response)=>{
            console.log("Respusta ejecucion Job PLazas: ",response);
        });

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA REALIZAR LA APERTURA DE LA PRE PUBLICACIÓN DE PLAZAS?',
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().putAperturarPlazasPrepublicacion(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response > 0) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {});
                        this.obtenerPlazaContratacion();
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA PRE-PUBLICACION."', () => {});
                    }
                });
            }, (error) => {}
        );
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

    masterToggleDocentes = () => {
        this.isAllSelectedDocentes() ? this.selectionDocentes.clear() : this.dataSourceDocentes.data.forEach((row) =>
            this.selectionDocentes.select(row)
        );
    };

    handlePrePublicar = () => {
        var request: any = {
            idEtapaProceso: this.idEtapaProceso,
            maestroProceso: 'CONTRATACIÓN DE AUXILIARES DE EDUCACIÓN',
            anio: this.fecha.getFullYear(),
            instancia: 'MINEDU',
            usuarioCreacion: 'ADMIN',
	    idPlazaContratacion:this.idPlazaContratacion,
	    idRegimenLaboral: RegimenLaboralEnum.LEY_30493
        };

        this.dataService.Message().msgConfirm(this.modelBandejaPublicacion.getconfirmationMessage(),
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones()
		    .prepublicarPlazasEtapaPrePublicacion(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response > 0) {
                        this.obtenerPlazaContratacion();
                        //this.handleFinalizarEtapaDespuesDePrePublicar() // agregado segun obs de ecu
                        // msgSuccess
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {});
                        this.obtenerEstadoDesarrolloEtapa();
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL PRE PUBLICAR LAS PLAZAS."', () => {});
                    }
                });
            }, (error) => {}
        );
    }
    obtenerEstadoDesarrolloEtapa = () => {
        let idProcesoEtapa = this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;

        this.dataService
            .Contrataciones()
            .obtenerCabeceraEstadoDesarrolloEtapaProceso(idProcesoEtapa, codSede)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.estadoDesarrollo = response.estadoDesarrollo;
                }
            console.log("Estado de desarrollo : ", this.estadoDesarrollo);
            });
            
    };

    handleFinalizarEtapaDespuesDePrePublicar = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        const request: IActualizarEtapaProcesoViewModel = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: 'ADMIN', 
            //codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
            codigoCentroTrabajoMaestro: '000000'//this.currentSession.codigoSede, // como estamos en sede MINEDU, colocamos el codigo de minedu

        };
        console.log("Fnializar Etapa: ", request);
        this.dataService.Contrataciones().registrarPlazaContratacionSiguienteEtapaPublicacion(request).pipe(
            catchError((e) => of(e)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response) => {
            if (response > 0) {
                // msgSuccess                        
            } else {
                this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE FINALIZAR LA ETAPA."', () => {});
            }
        });
    }
    obtenerPlazaContratacion(): void {
        let d = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.codSedeCabecera
        }
        
        this.dataService.Contrataciones().getObtenerPlazaContratacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                if (response.length > 0) {
		    this.idPlazaContratacion = response[0].idPlazaContratacion;
                    this.validacionPlaza = response[0].estadoValidacionPlaza;
                }
                else {
                    this.validacionPlaza = '';
                }
            }
        });
    }
    handleIncorporarPlazas() {
        const data = {
            idEtapaProceso : this.idEtapaProceso,
            codigoCentroTrabajoMaestro:'000000',
            fragmentoUrlRetornar:'prepublicacion30493',
        };

        this.router.navigate([
            "ayni",
            "personal",
            "procesospersonal",
            "procesos",
            "contratacion",
            "bandeja-incorporacion-plazas",
            "bandeja-incorporacion",
            this.idEtapaProceso.toString(),
            { 
		codigoCentroTrabajoMaestro: data.codigoCentroTrabajoMaestro,
		fragmentoUrlRetornar:data.fragmentoUrlRetornar,
		idRegimen: RegimenLaboralEnum.LEY_30493 
	    }
        ]);
    }

    handlePlazaBecarios = () => {
        const seleccionados = this.selectionDocentes.selected || [];

        if (!((this.isAllSelectedDocentes() && this.dataSourceDocentes.totalregistro) || seleccionados.length)) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {}); // M91
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA TRASLADAR LAS PLAZAS A LA PESTAÑA “PLAZAS BECARIOS”?', // M106
            () => {
                const request: IActualizarPlazaContratacionSiEsBecarioViewModel =
                {
                    esBecarioOrigen: false,
                    esBecarioDestino: true,
                    marcarTodos: false,
                    idEtapaProceso: this.idEtapaProceso,
                    idPlazaContratacion: seleccionados[0].id_plaza_contratacion,
                    usuarioModificacion: "ADMIN",
                    plazas: seleccionados.map((s) => {
                        return {
                            idPlazaContratacionDetalle: s.id_plaza_contratacion_detalle,
                        };
                    }),
                };

                this.dataService.Contrataciones().actualizarPlazaContratacionSiEsBecario(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        //msgSuccess
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {});
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE CAMBIAR EL TIPO DE PLAZA."',() => {});
                    }
                });
            }
        );
    }
    handleBuscar = () => {
	this.eventDelete.emit();
    };
    isAllSelectedDocentes = () => {
        const numSelected = this.selectionDocentes.selected.length;
        const numRows = this.dataSourceDocentes.data.length;
        return numSelected === numRows;
    };

    handleVerPlazasPdf() {
        this.dialogRef = this.materialDialog.open(ModalDocumentosPrepublicadosFechaOldComponent, {
            panelClass: 'minedu-modal-documentos-prepublicados-fecha',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idGrupoDocumento: GrupoDocumentoPublicadoEnum.PREPUBLICACIONAUXILIARES,
                nombreDocumento: 'Plazas_Contratación_Docente',
                esbecario:false,
		idRegimenLaboral:RegimenLaboralEnum.LEY_30493
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            }
        );
    }

    handleExportar = () => {
        this.selectedTabIndex === 0 ? this.exportarPlazasContratacionDocentes() : this.exportarPlazasBecarios();
    };

    private exportarPlazasBecarios = () => {

        let requestExportar: any = { 
            idEtapaProceso: this.idEtapaProceso,
            esBecario: true 
        };

        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        var nombreExcel = "Plazas_Contratacion_Becarios";
        try{
            var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = nombreExcel+"" + ".xlsx";
        }
        // ***

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelPrePublicacionPlazas(requestExportar).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, nombreExportar);
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."',() => {});
            }
        });
    };
    private exportarPlazasContratacionDocentes = () => {
        if (this.dataSourceDocentes.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }

        let requestExportar: any = { 
            idEtapaProceso: this.idEtapaProceso,
            esBecario: false,
	    idRegimenLaboral:regimenLaboral.LEY_30493
        };

        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        var nombreExcel = "Plazas_Contratacion_Docentes";
        try{
            var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = nombreExcel+ ".xlsx";
        }
        // ************************************************************************************************


        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelPrePublicacionPlazas(requestExportar).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, nombreExportar);
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."',() => {});
            }
        });
    };
    checkboxLabelDocentes(row?: any): string {
        if (!row) { return `${this.isAllSelectedDocentes() ? "deselect" : "select"} all`; }
        return `${this.selectionDocentes.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }
    handleViewInfo = (id) => {
        this.dialogRef = this.materialDialog.open(InformacionPlaza30328Component, {
            panelClass: "informacion-plaza-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idPlaza: id,
		idRegimenLaboral: RegimenLaboralEnum.LEY_30493
            },
        });
    }
    handleEliminarPlazaIncorporada(row, i){
        //  console.log("eliminando plaza incorporada A ", i, " :",row);

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR LA INFORMACIÓN?',
            () => {
                this.dataService.Spinner().show("sp6");
                console.log("eliminando plaza incorporada A ", i, " :",row);
                console.log("eliminando plaza c detalle :", row.id_plaza_contratacion_detalle);
                // ****************************************************************
                let request: any =
                {
                    idPlazaContratacionDetalleIncorporada: row.id_plaza_contratacion_detalle,
                    codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                    codigoRolPassport: this.currentSession.codigoRol,
                    idEtapaProceso: this.idEtapaProceso,
                    ipCreacion: '',
                    usuarioModificacion: "ADMIN",
                    // plazas: seleccionados.map((s) => { // multiples plazas
                    //     return {
                    //         idPlazaContratacionDetalle: s.id_plaza_contratacion_detalle,
                    //     };
                    // }),
                };

                this.dataService.Contrataciones().eliminarPlazaIncorporada(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {                           
                        });
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE ELIMINAR PLAZA."',() => {});
                    }                    
                });
                // ****************************************************************

                this.dataService.Spinner().hide("sp6");                
            }, (error) => {}
        );
        
    }
    //handlePlazaContratacionDocente = () => {
        //const seleccionados = this.selectionBecarios.selected || [];
//
        //if (seleccionados.length) {
            //this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {});
            //return;
        //}
//
        //this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA TRASLADAR LAS PLAZAS A LA PESTAÑA “PLAZAS CONTRATACIÓN DOCENTE”?',
            //() => {
                //const request: IActualizarPlazaContratacionSiEsBecarioViewModel =
                //{
                    //esBecarioOrigen: true,
                    //esBecarioDestino: false,
                    //marcarTodos: false,
                    //idEtapaProceso: this.idEtapaProceso,
                    //idPlazaContratacion: seleccionados[0].id_plaza_contratacion,
                    //usuarioModificacion: "ADMIN",
                    //plazas: seleccionados.map((s) => {
                        //return {
                            //idPlazaContratacionDetalle: s.id_plaza_contratacion_detalle,
                        //};
                    //}),
                //};
//
                //this.dataService.Contrataciones().actualizarPlazaContratacionSiEsBecario(request).pipe(
                    //catchError(() => of([])),
                    //finalize(() => {
                        //this.dataService.Spinner().hide("sp6");
                    //})
                //)
                //.subscribe((result: number) => {
                    //if (result) {
                        //// msgAutoSuccess // (sin boton) - mensaje en la parte superior derecha
                        //this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {                           
                        //});
                        //this.handleBuscar();
                    //} else {
                        //this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE CAMBIAR EL TIPO DE PLAZA."',() => {});
                    //}                    
                //});
            //}
        //);
    //}


    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
    };

    obtenerFechaDeCortePrepublicacion = () => {
        let idProcesoEtapa = this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;

        this.dataService
            .Contrataciones()
            .obtenerFechaDeCortePrepublicacion(idProcesoEtapa, codSede)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.fechaCorte = response.fechaDeCorte;
                    this.fechaFinNacional = response.fechaFinNacional;
                    this.nroEtapasIniciadas = +response.nroEtapasIniciadas;
                    if(this.fechaCorte)
                       this.fechaCorteVisible = this.fechaCorte;
                }
            });
    };

}

interface ControlesActivos{
    btnFinalizarEtapa : boolean,
    btnAperturaEtapa : boolean,
    btnIncorporarPlazas: boolean,
    btnPrePublicarPlazas:boolean,
    btnPlazaBecarios:boolean,
    btnVerPlazasPDF:boolean,
    btnExportar:boolean,
}


