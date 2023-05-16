import { mineduAnimations } from "../../../../../../@minedu/animations/animations";
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DataSource } from "@angular/cdk/table";
import { BehaviorSubject, Observable, of, forkJoin } from "rxjs";
import { DataService } from "app/core/data/data.service";
import { catchError, finalize } from "rxjs/operators";
import { CollectionViewer, SelectionModel } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { saveAs } from "file-saver";
import { EstadoEtapaEnum, EtapaFaseEnum, EstadoEtapaProcesoEnum, TablaRolPassport, PassportTipoSede } from '../_utils/constants';
import { ActivatedRoute, Router } from "@angular/router";
import { SecurityModel } from "app/core/model/security/security.model";
import { TablaPermisos } from "app/core/model/types";
import { CentroTrabajoModel } from "app/core/model/centro-trabajo.model";
import { EstadoDesarrolloProcesoContratacionCodigoEnum, OpcionFiltro, DescripcionMaestroProcesoEnum, RegimenLaboralContratacionCodigoEnum, TipoProcesoContratacionCodigoEnum, EtapaProcesoCodigoEnum } from '../models/contratacion.model';
import { SharedService } from "../../../../../core/shared/shared.service";
import Swal from 'sweetalert2';
import { ModalIniciarEtapaComponent } from '../modal-iniciar-etapa/modal-iniciar-etapa.component';
import { MatDialog } from '@angular/material/dialog';
import { PASSPORT_MESSAGE } from "app/core/model/messages-error";
import { ModalMonitorInstanciasComponent } from "../components/modal-monitor-instancias/modal-monitor-instancias.component";
import { RegimenLaboralEnum, EtapaEnum } from '../../contratacion-30493/_utils/constants';
import { ModalObservacionBandejaComponent } from "../components/modal-observacion-bandeja/modal-observacion-bandeja.component";
import { pageSizeGrilla } from '../_utils/grilla';
import { bandejaPrincipalModel } from '../models/bandejaPrincipal.model';

@Component({
    selector: "minedu-bandeja-contratacion",
    templateUrl: "./bandeja-principal.component.html",
    styleUrls: ["./bandeja-principal.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPrincipalComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    // **************
    setRedirectPlaza: redirect[] = [];
    setRedirectPostulante:redirect[] = [];
    setRedirectCalificacion:redirect[] = [];
    setRedirectAdjudicacion:redirect[] = [];
    desactivarComboProceso:boolean = true;
    tienePermisoAcceso: boolean;
    max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    botonesActivos:BotonesActivosPorRolSede[] = []; 
    // **************
    form: FormGroup;
    loading: false;
    export = false;
    // now = new Date(new Date().setFullYear(new Date().getFullYear() + 1));//
    now = new Date();
    comboLists = {
        listAnio: [],
        listRegimenlaboral: [],
        listTipoProceso: [],
        listEstadoProceso: [],
    };
    displayedColumns: string[] = [
        "numero_registro",
        "codigo",
        "regimen_laboral",
        "proceso",
        "numero_convocatoria",
        "etapa",
        "fecha_creacion",
        "estado",
        "acciones",
    ];

    dataSource: ContratacionDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    eliminando = false;
    dialogRef: any;
    estadoEtapa = EstadoEtapaEnum;
    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    request = {
        anio: null,
        idRegimenLaboral: null,
        idTipoProceso: null,
        idEstadoEtapa: null,
        codigoRolPassport: null,
        codigoTipoSede:null,
        codigoCentroTrabajo:null,
        codigoCentroTrabajoMaestro:null,
    };

    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
        autorizadoConsultar:false,
    };
    currentSession: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;
    isMobile = false;
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    estadoDesarrolloEnum = EstadoDesarrolloProcesoContratacionCodigoEnum;
    descripcionMaestroProcesoEnum = DescripcionMaestroProcesoEnum;
    regimenLaboralEnum = RegimenLaboralContratacionCodigoEnum;
    etapaProcesoCodigoEnum = EtapaProcesoCodigoEnum;

    private passport: SecurityModel = new SecurityModel();
    pageSizeGrilla:any = pageSizeGrilla;
    bandejaPrincipal:bandejaPrincipalModel = new bandejaPrincipalModel();
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.configurarRolColegioMilitar();
        setTimeout((_) => this.buildShared());
        this.buildForm();
        this.buildPassport();
        this.handleResponsive();
        this.buildSeguridad();
        this.loadCombos();

        this.dataSource = new ContratacionDataSource(this.dataService);
        this.dataSource.setRequestAccesos(this.currentSession);
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

        this.resetForm();
        this.buscarProcesosContratacion(true);
        this.ocultarBreadCrumOriginal();
        this.setUpRedirect();
        console.log(this.currentSession.codigoRol, '---', this.currentSession.codigoTipoSede)
        if (this.currentSession.codigoRol=='AYNI_019' && (this.currentSession.codigoTipoSede=='TS001'||this.currentSession.codigoTipoSede=='TS013'))
            this.handleModalInstancia();

    }
    configurarRolColegioMilitar = () => {
        var rolSession = this.dataService.Storage().getPassportRolSelected();
        if (rolSession.CODIGO_TIPO_SEDE == PassportTipoSede.IE) {
            rolSession.CODIGO_TIPO_SEDE = PassportTipoSede.UGEL;
            this.dataService.Storage().setPassportRolSelected(rolSession);
        }
    }
    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );
    }

    ngOnDestroy(): void {}

    buildPassport() {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        console.log("Datos Passport : ",this.passport);
        
        //console.log(TablaRolPassport.)
        // for(var usuarioPermitido in TablaRolPassport)
        // {
        //     if (this.passport.codigoRol == usuarioPermitido)
        //     console.log("Usuario permitido :", usuarioPermitido)
        //     console.log("CodUsuario :", usuarioPermitido)
        // }

        const options: string[] = Object.values(TablaRolPassport);
        if(options.includes(this.passport.codigoRol)){
            console.log("ROL permitido XXX:", this.passport.codigoRol)            
        }
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            anio: [null, Validators.required],
            idRegimenLaboral: [null],
            idTipoProceso: [null],
            idEstadoProceso: [null],
        });

        this.form.patchValue({fechaConfiguracion:new Date()})
    }

    handleLimpiar(): void {
        // this.resetForm();

        this.form.reset();
        this.form.get("anio").setValue(new Date());//.getFullYear()
        //this.form.get("idRegimenLaboral").setValue(RegimenLaboralContratacionCodigoEnum.LEY_30328);
        this.form.get("idRegimenLaboral").setValue(this.opcionFiltro.item.value);
        // this.form.get("idTipoProceso").setValue(TipoProcesoContratacionCodigoEnum.Contratacion);
        this.form.get("idTipoProceso").setValue(this.opcionFiltro.item.value);
        //this.form.get("idTipoProceso").setValue(this.opcionFiltro.item.value);
        this.form.get("idEstadoProceso").setValue(this.opcionFiltro.item.value);
	this.desactivarComboProceso=true;
	this.comboLists.listTipoProceso=null;
	this.handleBuscar();
    }

    handleBuscar(): void {
        this.buscarProcesosContratacion(false);
    }

    handleGoPrePublicaciones = (row: any) => {
	if(row.codigo_regimen_laboral == RegimenLaboralEnum.LEY_30328)
	    this.handleGoPublicaciones_30328(row);
	if(row.codigo_regimen_laboral == RegimenLaboralEnum.LEY_30493)
	    this.handleGoPublicaciones_30493(row);
    };

    handleGoPublicaciones_30493 = (row: any) => {
	if (row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE) {

	    let data = {
		idEtapaProceso: row.id_etapa_proceso,
		usuarioModificacion: this.passport.numeroDocumento,
		idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
		codigoCentroTrabajoMaestro: this.currentSession.codigoSede
	    };
	    console.log("Principal ok, prepublicar Plazas row DATA:", data)
	    this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
		catchError((e) => of([e])),
		    finalize(() => {
		})
	    )
	    .subscribe((d: any) => {
		this.router.navigate(["../prepublicacion30493/" + row.id_etapa_proceso], {
		    relativeTo: this.route,
		});
	    });
	} else {
	    this.router.navigate(["./prepublicacion30493/" + row.id_etapa_proceso], {
		relativeTo: this.route,
	    });
	}

    };

    handleGoPublicaciones_30328 = (row: any) => {
	if (row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE) {

	    let data = {
		idEtapaProceso: row.id_etapa_proceso,
		usuarioModificacion: this.passport.numeroDocumento,
		idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
		codigoCentroTrabajoMaestro: this.currentSession.codigoSede
	    };
	    console.log("Principal ok, prepublicar Plazas row DATA:", data)
	    this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
		catchError((e) => of([e])),
		    finalize(() => {
		})
	    )
	    .subscribe((d: any) => {
		this.router.navigate(["./prepublicacion/" + row.id_etapa_proceso], {
		    relativeTo: this.route,
		});
	    });
	} else {
	    console.log("Principal ok, prepublicar Plazas row ELSE:", row.id_etapa_proceso)
	    this.router.navigate(["./prepublicacion/" + row.id_etapa_proceso], {
		relativeTo: this.route,
	    });
	}

    };
    // handleGoPrePublicaciones = (row) => {
    //     console.log("Principal ok, prepublicar Plazas row:", row)

    //     if (row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE) {
    //         this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
    //             panelClass: "modal-iniciar-etapa-dialog",
    //             width: "400px",
    //             disableClose: true,
    //             data: {
    //                 mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas publicadas?'
    //             },
    //         });
    
    //         this.dialogRef.afterClosed().subscribe((response: any) => {
    //             if (response == 'I') {
    //                 let data = {
    //                     idEtapaProceso: row.id_etapa_proceso,
    //                     usuarioModificacion: this.passport.numeroDocumento,
    //                     idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
    //                     codigoCentroTrabajoMaestro: this.currentSession.codigoSede
    //                 };
    //                 console.log("Principal ok, prepublicar Plazas row DATA:", data)
    //                 this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
    //                     catchError((e) => of([e])),
    //                     finalize(() => {
    //                     })
    //                 )
    //                 .subscribe((d: any) => {
    //                     this.router.navigate(["./prepublicacion/" + row.id_etapa_proceso], {
    //                         relativeTo: this.route,
    //                     });
    //                 });
    //             } else if (response == 'V') {
    //                 this.router.navigate(['./ver-prepublicacion/' + row.id_etapa_proceso], {
    //                     relativeTo: this.route,
    //                 })
    //             } else {
    //                 return;
    //             }
    //         });
    //     } else {
    //         console.log("Principal ok, prepublicar Plazas row ELSE:", row.id_etapa_proceso)
    //         this.router.navigate(["./prepublicacion/" + row.id_etapa_proceso], {
    //             relativeTo: this.route,
    //         });
    //     }
    // };

    handleGoPublicaciones = (row) => {
        let d = row.motivoCancelacion;
        this.dialogRef = this.materialDialog.open(ModalObservacionBandejaComponent, {
                    panelClass: "minedu-modal-observacion-bandeja",
                    width: "600px",
                    disableClose: true,
                    data: d,
                });
        
                this.dialogRef.afterClosed().subscribe((response: any) => {
                    if (response) {
                        this.handleBuscar();
                    } else {
                        return;
                    }
                });
        /*this.router.navigate(["./publicacion/" + row.idEtapa], {
            relativeTo: this.route,
        });*/
    };

    handleGoPostulantes = (row) => {
        this.router.navigate(["./postulante/" + row.idEtapa], {
            relativeTo: this.route,
        });
    };

    handleGoValidarPublicar = (row) => {
        if (false) //(row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE)
         {

            this.currentSession = this.dataService.Storage().getInformacionUsuario();
            this.dataService.Contrataciones().VerificarEtapaProcesoAnteriorFinalizado({"idEtapaProceso":row.id_etapa_proceso, "codigoCentroTrabajoMaestro":this.currentSession.codigoSede})
            .subscribe((response:any) =>{
                if(response){
                    // ****************************************************************
                    let data = {
                        idEtapaProceso: row.id_etapa_proceso,
                        usuarioModificacion: this.passport.numeroDocumento,
                        idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                        codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                    };
                    this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                        catchError((e) => of([e])),
                        finalize(() => {
                        })
                    )
                    .subscribe((d: any) => {
                        this.router.navigate(['./validacion-plazas/' + row.id_etapa_proceso], {
                            relativeTo: this.route,
                        })
                    });
                    // *************************************
                    // this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
                    //     panelClass: "modal-iniciar-etapa-dialog",
                    //     width: "400px",
                    //     disableClose: true,
                    //     data: {
                    //         mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas publicadas?'
                    //     },
                    // });
            
                    // this.dialogRef.afterClosed().subscribe((response: any) => {
                    //     if (response == 'I') {
                    //         let data = {
                    //             idEtapaProceso: row.id_etapa_proceso,
                    //             usuarioModificacion: this.passport.numeroDocumento,
                    //             idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                    //             codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                    //         };
                    //         this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                    //             catchError((e) => of([e])),
                    //             finalize(() => {
                    //             })
                    //         )
                    //         .subscribe((d: any) => {
                    //             this.router.navigate(['./validacion-plazas/' + row.id_etapa_proceso], {
                    //                 relativeTo: this.route,
                    //             })
                    //         });
                    //     } else if (response == 'V') {
                    //         this.router.navigate(['./ver-validacion-plazas/' + row.id_etapa_proceso], {
                    //             relativeTo: this.route,
                    //         })
                    //     } else {
                    //         return;
                    //     }
                    // });
			        // *************************************
                }
                else{
                    this.dataService.Message().msgWarning('"LA ETAPA ANTERIOR TODAVÍA NO HA SIDO FINALIZADA."', () => {});
                }
            });

           
        } else {
            this.router.navigate(['./validacion-plazas/' + row.id_etapa_proceso], {
                relativeTo: this.route,
            })
        }
    }

    handleGoContratacionDirectaPlazas = (row) => { 4
        if (row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE) {

            this.currentSession = this.dataService.Storage().getInformacionUsuario();
            this.dataService.Contrataciones().VerificarEtapaProcesoAnteriorFinalizado({"idEtapaProceso":row.id_etapa_proceso, "codigoCentroTrabajoMaestro":this.currentSession.codigoSede})
            .subscribe((response:any) =>{
                if(response){
                    // *************************************
                    //let data = {
                        //idEtapaProceso: row.id_etapa_proceso,
                        //usuarioModificacion: this.passport.numeroDocumento,
                        //idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                        //codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                    //};
                    //this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                        //catchError((e) => of([e])),
                        //finalize(() => {
                        //})
                    //)
                    //.subscribe((d: any) => {
                        //this.router.navigate(['./contratacion-directa/bandeja-plazas/' + row.id_etapa_proceso], {
                            //relativeTo: this.route,
                        //})
                    //});
                        this.router.navigate(['./contratacion-directa/bandeja-plazas/' + row.id_etapa_proceso], {
                            relativeTo: this.route,
                        })
                    // *************************************

                    // this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
                    //     panelClass: "modal-iniciar-etapa-dialog",
                    //     width: "400px",
                    //     disableClose: true,
                    //     data: {
                    //         mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas publicadas?'
                    //     },
                    // });
            
                    // this.dialogRef.afterClosed().subscribe((response: any) => {
                    //     if (response == 'I') {
                    //         let data = {
                    //             idEtapaProceso: row.id_etapa_proceso,
                    //             usuarioModificacion: this.passport.numeroDocumento,
                    //             idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                    //             codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                    //         };
                    //         this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                    //             catchError((e) => of([e])),
                    //             finalize(() => {
                    //             })
                    //         )
                    //         .subscribe((d: any) => {
                    //             this.router.navigate(['./contratacion-directa/bandeja-plazas/' + row.id_etapa_proceso], {
                    //                 relativeTo: this.route,
                    //             })
                    //         });
                    //     } else if (response == 'V') {
                    //         this.router.navigate(['./ver-contratacion-directa/bandeja-plazas/' + row.id_etapa_proceso], {
                    //             relativeTo: this.route,
                    //         })
                    //     } else {
                    //         return;
                    //     }
                    // });
			        // *************************************
                }
                else{
                    this.dataService.Message().msgWarning('"LA ETAPA ANTERIOR TODAVÍA NO HA SIDO FINALIZADA."', () => {});
                }
            });

            
        } else {
            this.router.navigate(['./contratacion-directa/bandeja-plazas/' + row.id_etapa_proceso], {
                relativeTo: this.route,
            })
        }
    }

    handleGoContratacionDirectaPostulantes = (row) => {
        this.router.navigate(['./contratacion-directa/bandeja-postulantes/' + row.id_etapa_proceso], {
            relativeTo: this.route,
        })
    }

    handleGoContratacionDirectaCalificaciones = (row) => {
        this.router.navigate(['./contratacion-directa/bandeja-calificaciones/' + row.id_etapa_proceso], {
            relativeTo: this.route,
        })
    }

    handleGoContratacionDirectaAdjudicaciones = (row) => {
        this.router.navigate(['./contratacion-directa/bandeja-adjudicaciones/' + row.id_etapa_proceso], {
            relativeTo: this.route,
        })
    }

    handleGoContratacionResultadosPUNPlazas = (row) => {
        if (row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE) {
          let buscarEtapaInicio = {
            'codigoCentroTrabajo':this.currentSession.codigoSede,
            'anio':this.form.get('anio').value.getFullYear(),
            'codigoEtapa':EtapaEnum.PUBLICACIÓN_DE_PLAZAS
          }; 
	    this.dataService
                .Contrataciones()
                .getVerificarEstadoFinalizadoEtapa(buscarEtapaInicio)
                .subscribe((response:any) =>{
                  if(response == true)
                    return this.router.navigate(['./contratacion-resultados-pun/bandeja-plazas/' + row.id_etapa_proceso], {
                      relativeTo: this.route,
                    });
                    return this.dataService.Message().msgWarning('"LA ETAPA ANTERIOR TODAVÍA NO HA SIDO FINALIZADA."', () => {});
                });
        } else {
            this.router.navigate(['./contratacion-resultados-pun/bandeja-plazas/' + row.id_etapa_proceso], {
                relativeTo: this.route,
            })
        }
    }

    handleGoContratacionResultadosPUNCalificaciones = (row) => {
        this.router.navigate(['./contratacion-resultados-pun/bandeja-calificaciones/' + row.id_etapa_proceso], {
            relativeTo: this.route,
        })
    }

    handleGoContratacionResultadosPUNAdjudicaciones = (row) => {
        this.router.navigate(['./contratacion-adjudicacion-pun/bandeja-adjudicacion/' + row.id_etapa_proceso], {
            relativeTo: this.route,
        })
    }

    buscarProcesosContratacion = (fistTime: boolean = false) => {
        
        // **************************************** Verificar permisos de acceso
        // this.buildSeguridad();

        this.setRequest();
        if (fistTime) {
            this.dataSource.load(this.request, 1, 10, true);
        } else {
            this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize, false);
        }
    };

    handleGoCalificacion = (row) => {
        console.log("row", row);
        if (+row.codigoEtapaFase === EtapaFaseEnum.FASE1) {
            this.router.navigate(["./calificacion/" + row.idEtapa], {
                relativeTo: this.route,
            });
        } else {
            this.router.navigate(["./calificacion-otras/" + row.idEtapa], {
                relativeTo: this.route,
            });
        }
    };

    handleGoConsolidado = (row) => {
        this.router.navigate(["./consolidado/" + row.idEtapa], {
            relativeTo: this.route,
        });
    };

    handleGoAdjudicacion = (row) => {
        this.router.navigate(["./adjudicacion/" + row.idEtapa], {
            relativeTo: this.route,
        });
    };

    loadData(pageIndex, pageSize): void {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    resetForm = () => {
        this.form.reset();
        this.form.get("anio").setValue(new Date());//.getFullYear()
        //this.form.get("idRegimenLaboral").setValue(RegimenLaboralContratacionCodigoEnum.LEY_30328);
        this.form.get("idRegimenLaboral").setValue(this.opcionFiltro.item.value);

        //this.form.get("idTipoProceso").setValue(TipoProcesoContratacionCodigoEnum.Contratacion);
        this.form.get("idTipoProceso").setValue(this.opcionFiltro.item.value);
        this.form.get("idEstadoProceso").setValue(this.opcionFiltro.item.value);
    };

    loadCombos = () => {
        //this.loadAnio();
        this.loadRegimenLaboralPorRol();//this.loadRegimenLaboral();
        this.loadTipoProceso();
        this.loadEstadoproceso();
    };

    loadAnio = () => {
        this.dataService.Contrataciones().getComboAnio().pipe(
                catchError(() => of([])),
                finalize(() => {})
        )
        .subscribe((result: any) => {
            if (result) {
                const data = result.map((x) => ({
                    ...x,
                    value: x.id_anio,
                    label: `${x.nombre_anio}`,
                }));

                this.comboLists.listAnio = data;
            }
        });
    };

    loadRegimenLaboral = () => {

        this.dataService.Contrataciones().getComboRegimenLaboral().pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((result: any) => {
            if (result) {
                const data = result.map((x) => ({
                    ...x,
                    value: x.id_regimen_laboral,
                    label: `${x.nombre_regimen_laboral}`,
                }));
                this.comboLists.listRegimenlaboral = data;
                this.comboLists.listRegimenlaboral.unshift({
                    value: this.opcionFiltro.item.value,
                    label: this.opcionFiltro.item.label,
                });
            }
        });
    };

    loadRegimenLaboralPorRol = () => {
        let codigoRol = this.passport.codigoRol;
        console.log("CodigRol enviado a Servicio", codigoRol);

        this.dataService.Contrataciones().getComboRegimenLaboralPorRol(codigoRol).pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((result: any) => {
            if (result) {
                const data = result.map((x) => ({
                    ...x,
                    value: x.id_regimen_laboral,
                    label: `${x.nombre_regimen_laboral}`,
                })).filter(x => { return x.value != RegimenLaboralEnum.LEY_29944});
                this.comboLists.listRegimenlaboral = data;
                this.comboLists.listRegimenlaboral.unshift({
                    value: this.opcionFiltro.item.value,
                    label: this.opcionFiltro.item.label,
                });
            }
        });
    };

    loadTipoProceso = () => {
        // console.log("Valor de regimen_laboral: ", this.comboLists.listRegimenlaboral[0].value);
        let value = this.form.get("idRegimenLaboral").value;
	this.desactivarComboProceso=true;
        console.log(value);
        if (value >= -1)
        {
            let data = {
                codRol:this.currentSession.codigoRol,
                tipoSede:this.currentSession.codigoTipoSede,
                idRegimenLaboral: +value
            };
            console.log("Data lista procesos", data);
            this.dataService.Contrataciones().getComboTipoProcesoPorRolSede(data).pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((result: any) => {
                if (result) {
                    console.log("Resultados de cosulta - lista proceso: ", result);

                    const data = result.map((x) => ({
                        ...x,
                        value: x.id_tipo_proceso,
                        label: `${x.nombre_tipo_proceso}`,
                    }));
                    this.comboLists.listTipoProceso = data;
                    this.comboLists.listTipoProceso.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
		    this.desactivarComboProceso=false;
                }
            });
        }
        else{
            console.log("... Reiniciar combo tipo proceso....")
        }
    //    // original
    //     this.dataService.Contrataciones().getComboTipoProceso().pipe(
    //         catchError(() => of([])),
    //         finalize(() => {})
    //     )
    //     .subscribe((result: any) => {
    //         if (result) {
    //             const data = result.map((x) => ({
    //                 ...x,
    //                 value: x.id_tipo_proceso,
    //                 label: `${x.nombre_tipo_proceso}`,
    //             }));
    //             this.comboLists.listTipoProceso = data;
    //             this.comboLists.listTipoProceso.unshift({
    //                 value: this.opcionFiltro.item.value,
    //                 label: this.opcionFiltro.item.label,
    //             });
    //         }
    //     });
    };

    loadEstadoproceso = () => {
        this.dataService.Contrataciones().getComboEstadoDesarrolloEtapaProceso().pipe(
            catchError(() => of([])),
                finalize(() => {})
        )
        .subscribe((result: any) => {
            if (result) {
                const data = result.map((x) => ({
                    ...x,
                    value: x.id_estado_etapa_proceso,
                    label: `${x.nombre_estado_etapa_proceso}`,
                }));
                this.comboLists.listEstadoProceso = data;
                this.comboLists.listEstadoProceso.unshift({
                    value: this.opcionFiltro.item.value,
                    label: this.opcionFiltro.item.label,
                });
            }
        });
    };

    setRequest = () => {
        const anio = this.form.get('anio').value.getFullYear();//this.form.get("anio").value;
        console.log("Valor de anio: ",anio);
        const idRegimenLaboral = this.form.get("idRegimenLaboral").value;
        const idTipoProceso = this.form.get("idTipoProceso").value;
        const idEstadoProceso = this.form.get("idEstadoProceso").value;

        this.request = {
            anio: anio > -1 ? anio : null,
            idRegimenLaboral: idRegimenLaboral > -1 ? idRegimenLaboral : null,
            idTipoProceso: idTipoProceso > -1 ? idTipoProceso : null,//TipoProcesoContratacionCodigoEnum.Contratacion, //idTipoProceso > -1 ? idTipoProceso : null,
            idEstadoEtapa: idEstadoProceso > -1 ? idEstadoProceso : null,
            codigoRolPassport: this.currentSession.codigoRol,
            codigoTipoSede : this.currentSession.codigoTipoSede,
            codigoCentroTrabajo: this.currentSession.codigoSede,
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,//"U"+this.currentSession.codigoSede,
        };
    };

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',
                () => {}
            );
            return;
        }
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        
        try{
            var nombreExportar:string = "Desarrollo de Procesos de Contratacion - "+dateString; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = "Desarrollo-Procesos-Contrataciones-"+this.form.get('anio');
        }

        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarBuscarEtapaProcesoPaginado(this.request, 1, this.dataSource.dataTotal).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.export = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                
                saveAs(response, nombreExportar+".xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
            }
        });
    };

    handleGoContratacionEvaluacionPlazas = (row) => { 
        console.log(row);
        if (row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE) {
            this.currentSession = this.dataService.Storage().getInformacionUsuario();
            this.dataService.Contrataciones().VerificarEtapaProcesoAnteriorFinalizado({"idEtapaProceso":row.id_etapa_proceso, "codigoCentroTrabajoMaestro":this.currentSession.codigoSede})
            .subscribe((response:any) =>{
                if(response){
                    // *************************************
                    let data = {
                        idEtapaProceso: row.id_etapa_proceso,
                        usuarioModificacion: this.passport.numeroDocumento,
                        idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                        codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                    };
                    this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                        catchError((e) => of([e])),
                        finalize(() => {
                        })
                    )
                    .subscribe((d: any) => {
                        this.router.navigate(['./contratacion-evaluacion-expediente/bandeja-plazas/' + row.id_etapa_proceso], {
                            relativeTo: this.route,
                        })
                    });
                    // ********

                    // this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
                    //     panelClass: "modal-iniciar-etapa-dialog",
                    //     width: "400px",
                    //     disableClose: true,
                    //     data: {
                    //         mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas?'
                    //     },
                    // });
            
                    // this.dialogRef.afterClosed().subscribe((response: any) => {
                    //     if (response == 'I') {
                    //         let data = {
                    //             idEtapaProceso: row.id_etapa_proceso,
                    //             usuarioModificacion: this.passport.numeroDocumento,
                    //             idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                    //             codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                    //         };
                    //         this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                    //             catchError((e) => of([e])),
                    //             finalize(() => {
                    //             })
                    //         )
                    //         .subscribe((d: any) => {
                    //             this.router.navigate(['./contratacion-evaluacion-expediente/bandeja-plazas/' + row.id_etapa_proceso], {
                    //                 relativeTo: this.route,
                    //             })
                    //         });
                    //     } else if (response == 'V') {
                    //         this.router.navigate(['./ver-contratacion-evaluacion-expediente/bandeja-plazas/' + row.id_etapa_proceso], {
                    //             relativeTo: this.route,
                    //         })
                    //     } else {
                    //         return;
                    //     }
                    // });
                    // *************************************
                }
                else{
                    this.dataService.Message().msgWarning('"LA ETAPA ANTERIOR TODAVÍA NO HA SIDO FINALIZADA."', () => {});
                }
            });
        } else {
            this.router.navigate(['./contratacion-evaluacion-expediente/bandeja-plazas/' + row.id_etapa_proceso], {
                relativeTo: this.route,
            })
        }
    }

    handleGoContratacionEvaluacionPostulantes = (row) => { 
        this.router.navigate(['./contratacion-evaluacion-expediente/bandeja-postulantes/' + row.id_etapa_proceso], {
            relativeTo: this.route,
        })
    }

    handleGoContratacionEvaluacionCalificaciones = (row) => {
        this.router.navigate(['./contratacion-evaluacion-expediente/bandeja-calificaciones/' + row.id_etapa_proceso], {
            relativeTo: this.route,
        })
    }

    handleGoContratacionEvaluacionAdjudicaciones = (row) => {
        this.router.navigate(['./contratacion-adjudicacion-evaluacion/bandeja-adjudicacion/' + row.id_etapa_proceso], {
            relativeTo: this.route,
        })
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Procesos de Contratación");
        this.sharedService.setSharedTitle("Desarrollo de procesos de contratación");
    }

    ocultarBreadCrumOriginal(){
        let div = document.getElementsByClassName('bread-original');
        for(let i = 0; i < div.length; i++) {
            const dv = div[i] as HTMLElement;
            dv.style.display = "none";
        }
    }

    buildSeguridad = () => {
        
        this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);

        // this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        console.log("Permisos: ", this.permisos)

        if(!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar &&
            !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar &&
            !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar)
             { 
                 this.tienePermisoAcceso=false;
             }else{
                this.tienePermisoAcceso=true;
             }

        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        console.log("Sesion actual: ", this.currentSession)

        if (!this.permisos.autorizadoConsultar) { // Verificar permisos
            this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { 
                this.router.navigate(["../../"], { relativeTo: this.route });
            });
            console.log("NO AUTORIZADO")
            return;
        }       
        this.buildSeguridadControles(this.currentSession.codigoRol, this.currentSession.codigoTipoSede);        
    };

    tablaBotonesActivos:boolean[][] = [[false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false]];
    
    buildSeguridadControles = (codigoRol:string, codigoSede:string) => {

        // llamar a Servicio
        const data = { 
            codRol : codigoRol, 
            codTipoSede : codigoSede, 
            idEtapaProceso : 0,
        }
        this.dataService.Contrataciones().getPrepublicacionBotonesActivos(data).pipe(
            catchError(() => of([])),
            finalize(() => {
                // this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((result: any) => {
            if (result) {
                // console.log("Resultado antes asignar",result);
                this.botonesActivos = result;
                console.log("Resultado despues asignar, botonesActivos", this.botonesActivos);
                this.mostrarOcultarBotones(this.botonesActivos);
                //this.handleBuscar();
            } else {
                this.dataService.Message().msgError('"ERROR, NO TIENE PERMISOS PARA ACCEDER A ESTE MODULO."',() => {
                    // Redirigir a pagina princioap
                });
            }
        }); 
    }
    mostrarOcultarBotones(botonesActivos:BotonesActivosPorRolSede[]) {
        this.tablaBotonesActivos = [[false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false]];
        this.botonesActivos.forEach((obj:BotonesActivosPorRolSede) =>{
            switch(obj.codEtapa){
                case "5": // Prepublicacion
                          this.tablaBotonesActivos[0][0] = obj.prepublicarPlazas;  
                          break; 
                case "6": // Publicacion/Vlaidacion de PLazas
                          this.tablaBotonesActivos[1][1] = obj.validarPublicarPlazas; 
                          break;
                case "7": // Contratacion Directa
                          this.tablaBotonesActivos[2][1] = obj.plazas; 
                          this.tablaBotonesActivos[2][2] = obj.postulantes;
                          this.tablaBotonesActivos[2][3] = obj.calificaciones;
                          this.tablaBotonesActivos[2][4] = obj.adjudicacion; 
                          break;
                case "8": // Contratacion PUN
                          this.tablaBotonesActivos[3][1] = obj.plazas; 
                          this.tablaBotonesActivos[3][3] = obj.calificaciones;
                          this.tablaBotonesActivos[3][4] = obj.adjudicacion; 
                          break;
                case "9": // Contratacion Evaluacino
                          this.tablaBotonesActivos[4][1] = obj.plazas; 
                          this.tablaBotonesActivos[4][2] = obj.postulantes;
                          this.tablaBotonesActivos[4][3] = obj.calificaciones;
                          this.tablaBotonesActivos[4][4] = obj.adjudicacion; 
                          break;
            }
        });
         console.log("Tabla Botones Finalizada, ", this.tablaBotonesActivos);
    }
    // verificarEtapaConTablaBotonesActivos(codigoEtapa:any):boolean {
    //     let result = false;
    //     let codEtapa = codigoEtapa.toString();
    //     switch(codEtapa){
    //         case "5": // Prepublicacion
    //                   result = this.tablaBotonesActivos[0][0];  
    //                   break; 
    //         case "6": // Publicacion/Vlaidacion de PLazas
    //                   result = this.tablaBotonesActivos[1][1]; 
    //                   break;
    //         case "7": // Contratacion Directa
    //                   result = this.tablaBotonesActivos[2][1] || this.tablaBotonesActivos[2][2] || this.tablaBotonesActivos[2][3] || this.tablaBotonesActivos[2][4]; 
    //                   break;
    //         case "8": // Contratacion PUN
    //                   result = this.tablaBotonesActivos[3][1] || this.tablaBotonesActivos[3][3] || this.tablaBotonesActivos[3][4]; 
    //                   break;
    //         case "9": // Contratacion Evaluacion
    //                   result = this.tablaBotonesActivos[4][1] || this.tablaBotonesActivos[4][2] || this.tablaBotonesActivos[4][3] || this.tablaBotonesActivos[4][4]; 
    //                   break;
    //     }

    //     return result;
    // }

    loadCentroTrabajo = () => {
        const codigoCentroTrabajo = this.currentSession.codigoSede;
        this.dataService.Contrataciones().getCentroTrabajoByCodigo(codigoCentroTrabajo, true).pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response && response.result) {
                this.centroTrabajo = response.data;
            }
        });
    };




    setUpRedirect = () => {
      this.setRedirectPlaza.push({
                                  regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                  etapa:EtapaEnum.CONTRATACIÓN_DIRECTA,
                                  accion:this.handleGoContratacionDirectaPlazas})
      this.setRedirectPlaza.push({
                                  regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                  etapa:EtapaEnum.CONTRATACIÓN_POR_RESULTADOS_DE_LA_PUN,
                                  accion:this.handleGoContratacionResultadosPUNPlazas})
      this.setRedirectPlaza.push({
                                 regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                 etapa:EtapaEnum.CONTRATACIÓN_POR_EVALUACIÓN_DE_EXPEDIENTES,
                                 accion:this.handleGoContratacionEvaluacionPlazas})
      //this.setRedirectPlaza[3][7] = this.handleGoContratacionDirectaPlazas;
      //this.setRedirectPlaza[3][8] = this.handleGoContratacionResultadosPUNPlazas;
      //this.setRedirectPlaza[3][9] = this.handleGoContratacionEvaluacionPlazas;

      this.setRedirectPostulante.push({
                                     regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                     etapa: EtapaEnum.CONTRATACIÓN_DIRECTA,
                                     accion:this.handleGoContratacionDirectaPostulantes})
      this.setRedirectPostulante.push({
                                      regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                      etapa:EtapaEnum.CONTRATACIÓN_POR_EVALUACIÓN_DE_EXPEDIENTES,
                                      accion:this.handleGoContratacionEvaluacionPostulantes})
      //this.setRedirectPostulante[3][7] = this.handleGoContratacionDirectaPostulantes;
      //this.setRedirectPostulante[3][9] = this.handleGoContratacionEvaluacionPostulantes;

      this.setRedirectCalificacion.push({
                                        regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                        etapa:EtapaEnum.CONTRATACIÓN_DIRECTA,
                                        accion:this.handleGoContratacionDirectaCalificaciones})
      this.setRedirectCalificacion.push({
                                        regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                        etapa:EtapaEnum.CONTRATACIÓN_POR_RESULTADOS_DE_LA_PUN,
                                        accion:this.handleGoContratacionResultadosPUNCalificaciones})
      this.setRedirectCalificacion.push({
                                        regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                        etapa:EtapaEnum.CONTRATACIÓN_POR_EVALUACIÓN_DE_EXPEDIENTES,
                                        accion:this.handleGoContratacionEvaluacionCalificaciones})
      //this.setRedirectCalificacion[3][7] = this.handleGoContratacionDirectaCalificaciones;
      //this.setRedirectCalificacion[3][8] = this.handleGoContratacionResultadosPUNCalificaciones;
      //this.setRedirectCalificacion[3][9] = this.handleGoContratacionEvaluacionCalificaciones;

      this.setRedirectAdjudicacion.push({
                                       regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                       etapa:EtapaEnum.CONTRATACIÓN_DIRECTA,
                                       accion:this.handleGoContratacionDirectaAdjudicaciones})
      this.setRedirectAdjudicacion.push({
                                       regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                       etapa:EtapaEnum.CONTRATACIÓN_POR_RESULTADOS_DE_LA_PUN,
                                       accion:this.handleGoContratacionResultadosPUNAdjudicaciones})
      this.setRedirectAdjudicacion.push({
                                      regimenLaboral:RegimenLaboralEnum.LEY_30328,
                                      etapa:EtapaEnum.CONTRATACIÓN_POR_EVALUACIÓN_DE_EXPEDIENTES,
                                      accion:this.handleGoContratacionEvaluacionAdjudicaciones})
      //this.setRedirectAdjudicacion[3][7] = this.handleGoContratacionDirectaAdjudicaciones;
      //this.setRedirectAdjudicacion[3][8] = this.handleGoContratacionResultadosPUNAdjudicaciones;
      //this.setRedirectAdjudicacion[3][9] = this.handleGoContratacionEvaluacionAdjudicaciones;
    }
    handleVerPlaza = (row:any) => 
      this.setRedirectPlaza
          .find(x => x.regimenLaboral == row.codigo_regimen_laboral 
                     && x.etapa == row.codigo_etapa)
          ?.accion(row);
         
    handleVerPostulante = (row:any) =>
        this.setRedirectPostulante
            .find(x => x.regimenLaboral == row.codigo_regimen_laboral 
                       && x.etapa == row.codigo_etapa)
            ?.accion(row);

    handleVerCalificacion = (row:any) => 
        this.setRedirectCalificacion
            .find(x => x.regimenLaboral == row.codigo_regimen_laboral 
                       && x.etapa == row.codigo_etapa)
            ?.accion(row);
    handleVerAdjudicacion = (row:any) =>
        this.setRedirectAdjudicacion
            .find(x => x.regimenLaboral == row.codigo_regimen_laboral 
                       && x.etapa == row.codigo_etapa)
            ?.accion(row);

    handleModalInstancia(){
        console.log("codigoSede Original: ",this.currentSession.codigoSede);

        // console.log("Busqueda personalizada data ",  this.idEtapaProceso, 'busqueda');
        this.dialogRef = this.materialDialog.open(ModalMonitorInstanciasComponent, {
            panelClass: "minedu-modal-monitor-instancias",
            width: "1100px",
            disableClose: true,
            data: {
                codigoRol:this.currentSession.codigoRol,
                codigoSede:this.currentSession.codigoSede,
                codigoTipoSede:this.currentSession.codigoTipoSede,
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                // console.log("Respuesta de Modal ",result);
                //this.form.get("codigoPlaza").setValue(result.plaza.codigo_plaza.trim());
                // this.plazaFiltroSeleccionado = { ...result.plaza };
                if(result.codigoSede != null)
                    this.handleSeleccionarSedeMonitor(result.codigoSede)
            }
        });
    }

    handleSeleccionarSedeMonitor(codigoSede){
            // console.log("Detalles de Sesion 150103",this.dataService.Storage().getPassportRolSelected());
            var rolSession = this.dataService.Storage().getPassportRolSelected();
            rolSession.CODIGO_SEDE = codigoSede;//"150209";
            this.dataService.Storage().setPassportRolSelected(rolSession);
            // console.log("Detalles de Sesion ¿150209??",this.dataService.Storage().getPassportRolSelected());
            this.currentSession = this.dataService.Storage().getInformacionUsuario();
            console.log("codigoSede Alterado: ",this.currentSession.codigoSede);

            this.dataService.Storage().getInformacionUsuario()
    }


    handleGoContratacionPlazas_30943 = (row) => { 
        console.log(row);
        if (row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE) {
            this.currentSession = this.dataService.Storage().getInformacionUsuario();
            this.dataService.Contrataciones().VerificarEtapaProcesoAnteriorFinalizado({"idEtapaProceso":row.id_etapa_proceso, "codigoCentroTrabajoMaestro":this.currentSession.codigoSede})
            .subscribe((response:any) =>{
                if(response){
                    // *************************************
                    let data = {
                        idEtapaProceso: row.id_etapa_proceso,
                        usuarioModificacion: this.passport.numeroDocumento,
                        idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                        codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                    };
                    this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                        catchError((e) => of([e])),
                        finalize(() => {
                        })
                    )
                    .subscribe((d: any) => {
                        this.router.navigate(['./plazasprepublicadas30493/' + row.id_etapa_proceso], {
                            relativeTo: this.route,
                        })
                    });                    
                }
                else{
                    this.dataService.Message().msgWarning('"LA ETAPA ANTERIOR TODAVÍA NO HA SIDO FINALIZADA."', () => {});
                    this.router.navigate(['./plazasprepublicadas30493/' + row.id_etapa_proceso], {
                        relativeTo: this.route,
                    })
                }
            });
        } else {
            this.router.navigate(['./plazasprepublicadas30493/' + row.id_etapa_proceso], {
                relativeTo: this.route,
            })
        }
    }

}

export class ContratacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    private _requestAccesos;
    
    constructor(private dataService: DataService) {
        super();
    }
    setRequestAccesos = (requestAccesos:any) => this._requestAccesos = requestAccesos;
    load(data: any, pageIndex, pageSize, firsTime = false): void {
        this._loadingChange.next(false);
        if (!firsTime) this.dataService.Spinner().show("sp6");
        if (data.anio === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
          let requestAccesos = { 
            codRol : this._requestAccesos.codigoRol, 
            codTipoSede : this._requestAccesos.codigoTipoSede, 
            idEtapaProceso : 0,
          }
          forkJoin(
            this.dataService.Contrataciones().buscarDesarrolloEtapaProcesoPaginado(data, pageIndex, pageSize),
            this.dataService.Contrataciones().getPrepublicacionBotonesActivos(requestAccesos)
          ).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    if (!firsTime) this.dataService.Spinner().hide("sp6");
                })
          ).subscribe((results:any) => {
            let dataBandeja = results[0];
            let dataAccesos = results[1];
            for(let i in dataBandeja) {
              let element = dataBandeja[i];
              let acceso = dataAccesos.find(x => x.codEtapa == element.codigo_etapa 
                                                 && x.codigoRegimenLaboral == element.codigo_regimen_laboral
                                           );
              dataBandeja[i] = {...element,...acceso};
            }
            this._dataChange.next(dataBandeja || []);
            this.totalregistro = (dataBandeja || []).length === 0 ? 0 : dataBandeja[0].total_registros;
            if ((dataBandeja || []).length === 0 && !firsTime) {
              this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA."', () => {});
            }
          });

            //this.dataService.Contrataciones().buscarDesarrolloEtapaProcesoPaginado(data, pageIndex, pageSize).pipe(
                //catchError(() => of([])),
                //finalize(() => {
                    //this._loadingChange.next(false);
                    //if (!firsTime) this.dataService.Spinner().hide("sp6");
                //})
            //)
            //.subscribe((result: any) => {
                //this._dataChange.next(result || []);
                //this.totalregistro = (result || []).length === 0 ? 0 : result[0].total_registros;
                //if ((result || []).length === 0 && !firsTime) {
                    //this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA."', () => {});
                //}
            //});
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


interface BotonesActivosPorRolSede{
    codEtapa:string, 
    prepublicarPlazas:boolean,
    validarPublicarPlazas:boolean,
    plazas:boolean,
    postulantes:boolean,
    calificaciones:boolean,
    adjudicacion:boolean
}
type redirect = { 
  regimenLaboral:number 
  etapa:number 
  accion:Function
};
