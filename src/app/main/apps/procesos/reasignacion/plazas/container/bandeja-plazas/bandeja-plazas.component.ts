import { SelectionModel} from "@angular/cdk/collections";
import { AfterViewInit, Component, OnInit, ViewChild,ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/core/data/data.service";
import { mineduAnimations } from '@minedu/animations/animations';
import { SecurityModel } from "app/core/model/security/security.model";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { catchError, finalize, filter } from "rxjs/operators";
import { MotivoRechazoComponent } from "../../../consolidado-plaza/components/motivo-rechazo/motivo-rechazo.component";
import { EtapaResponseModel, ConsolidadoPlazaModel, OpcionFiltro, PlazasPrepublicadasResponseModel,} from "../../../models/reasignacion.model";
import { TipoFormatoPlazaEnum, RegimenLaboralEnum, GrupoDocumentoReasignacionEnum, MENSAJES, CodigoCentroTrabajoMaestroEnum } from "../../../_utils/constants";
import { TablaPermisos, TipoOperacionEnum } from "app/core/model/types";
import { InformacionPlazaComponent } from "../../components/informacion-plaza/informacion-plaza.component";
import { ReasignacionesModel } from "../../../models/reasignaciones.model";
import { descargarExcel, s2ab } from "app/core/utility/functions";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { EstadoValidacionPlazaEnum, EtapaFaseEnum } from "app/main/apps/procesos/reasignacion/_utils/constants";
import { BuscarCentroTrabajoComponent } from "app/main/apps/procesos/reasignacion/components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BuscarPlazaComponent } from "app/main/apps/procesos/reasignacion/components/buscar-plaza/buscar-plaza.component";
import { DocumentosPublicadosComponent } from "app/main/apps/procesos/reasignacion/components/documentos-publicados/documentos-publicados.component";
import { codigoEstadoValidacionPlaza } from 'app/core/model/types-reasignacion';

@Component({

    selector: 'minedu-bandeja-plazas',
    templateUrl: './bandeja-plazas.component.html',
    styleUrls: ['./bandeja-plazas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPlazasComponent
    implements OnInit, AfterViewInit
{

    proceso: ReasignacionesModel; 
    codSedeCabecera:string; 
    dialogRef: any;
    btnBuscar: Subject<void> = new Subject<void>();
    working = false;
    detalleMotivoRechazo: any;
    selectedTabIndex = 0;
    detalleReasignacion: any = null;
    descripcionEstadoValidacionPLaza: any;
    codigoEstadoValidacionPLaza: any;
    etapaResponse: EtapaResponseModel;
    etapaFase = EtapaFaseEnum;
    consolidadoPlaza: ConsolidadoPlazaModel;
    regimenLaboral = RegimenLaboralEnum;
    CodigoEstadoValidacionPlaza = codigoEstadoValidacionPlaza;
    form: FormGroup;
    comboLists = {
        listTipoDocumento: [],
        listorigenesRegistro: [],
        listEstadoPostulacion: [],
    };


    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    isMobile = false;
    idEtapa: number;
    idEtapaProceso: number;
    idAlcanceProceso: number;
    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
    };
    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    currentSession: SecurityModel = new SecurityModel();
    selection = new SelectionModel<any>(true, []);

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) {}

    ngOnInit(): void {
        this.idEtapaProceso = parseInt(this.route.snapshot.params.paramIdEtapaProceso);
        this.idAlcanceProceso = parseInt(this.route.snapshot.params.paramIdAlcanceProceso);
        this.codSedeCabecera = CodigoCentroTrabajoMaestroEnum.MINEDU; 
        this.buildSeguridad(); 
        this.obtenerCabeceraProcesoEtapa();
        this.obtenerPlazaReasignacion();
        setTimeout((_) => this.buildShared());       
        this.buildForm();
        this.handleResponsive();
        this.resetForm();
    }

    claseSegunEstado = (codigoEstado: number) => {
        let clase = '';

        switch (codigoEstado) {
            case codigoEstadoValidacionPlaza.Pendiente:
                clase = 'badge-warning';
                break;

            case codigoEstadoValidacionPlaza.Publicado:
                clase = 'badge-info';
                break;

            case codigoEstadoValidacionPlaza.Validado:
                clase = 'badge-success';
                break;

            case codigoEstadoValidacionPlaza.Aprobado:
                clase = 'badge-success';
                break;

            case codigoEstadoValidacionPlaza.Rechazado:
                clase = 'badge-danger';
                break;

            default:
                clase = 'badge-default';
                break;
        }

        return clase;
    }

    handlePublicarPlazas = () => {

        if (this.proceso.estadoValidacionPlaza != "APROBADO") {
            this.dataService.Message().msgWarning('"LAS PLAZAS AÚN NO HAN SIDO APROBADAS POR LA INSTANCIA SUPERIOR."', () => { });
            return;
        }
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA PUBLICAR LAS PLAZAS? </b><br/>  Al publicar las plazas, se generara el listado de las plazas en formato .PDF", () => {
            const data = {
                idEtapaProceso: +this.proceso.idEtapaProceso,
                idAlcanceProceso: +this.idAlcanceProceso,
                idDesarrolloProceso: this.proceso.idDesarrolloProceso,
                codigoCentroTrabajo:  this.currentSession.codigoSede,
                usuarioCreacion: this.currentSession.numeroDocumento
            };
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .publicarPlazasReasignacion(data)
                .pipe(
                    catchError((e) => of(null)),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        if(response > 0){
                            this.handleBuscar();
                            this.obtenerCabeceraProcesoEtapa();
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {});
                        }
                    } else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION)
                    }
                });
        }, () => { });
    };

    handlePublicarPlazasNew() {
       // console.log("validacion plaza", this.validacionPlaza, "data: ", this.dataSourceConvocadas.data[0].codigo_estado_validacion, " estado: ",  this.estadoPlaza.APROBADO)
        //if (this.dataSourceConvocadas.data[0].codigo_estado_validacion !== this.estadoPlaza.APROBADO || this.validacionPlaza != "APROBADO") {
        
        if (this.proceso.estadoValidacionPlaza != "APROBADO") {
            this.dataService.Message().msgWarning('"LAS PLAZAS AÚN NO HAN SIDO APROBADAS POR LA INSTANCIA SUPERIOR."', () => { });
            return;
        }

        const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA REALIZAR LA PUBLICACIÓN DE LAS PLAZAS?</strong><br>Al publicar las plazas, se generará el listado de las plazas en formato PDF.";
        this.dataService.Message().msgConfirm(confirmationMessage,
            () => {
                const data = {
                    idEtapaProceso: +this.proceso.idEtapaProceso,
                    idAlcanceProceso: +this.idAlcanceProceso,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso,
                    codigoCentroTrabajo:  this.currentSession.codigoSede,
                    usuarioModificacion: this.currentSession.numeroDocumento,
                    tipoOperacion: "publicarplazas"
                };
                this.dataService.Spinner().show("sp6");
                    this.dataService
                    .Reasignaciones()
                    .validarPrepublicarPlazasReasignacion(data).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        if(result > 0){
                            this.handleBuscar();
                            this.obtenerCabeceraProcesoEtapa();
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {});
                        }
                    } else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION)
                    }                        
                });
            }
        );
    }

    handlePrePublicarPlazas = () => {
        const data = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            codigoCentroTrabajo:  this.currentSession.codigoSede,
        };
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA FINALIZAR LA VALIDACION DE PLAZAS? </b><br/>  Al finalizar, se esperará a que las mismas sean aprobadas", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .prepublicarPlazasReasignacion(data)
                .pipe(
                    catchError((e) => of(null)),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.handleBuscar();
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                    } else {
                        this.dataService.Message()
                        .msgWarning('HEMOS EXPERIMENTADO ALGUNOS PROBLEMAS AL EJECUTAR LA OPERACION, POR FAVOR VERIFIQUE QUE NO EXISTAN REGISTROS EN LA PESTAÑA "PLAZAS PREPUBLICADAS" ', () => { });
                    }
                });
        }, () => { });
    };

    handleValidarPublicarPlazas = () => {
        const data = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            codigoCentroTrabajo:  this.currentSession.codigoSede,
            idAlcanceProceso: this.idAlcanceProceso,
            tipoOperacion: "validarpublicacion"
        };
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA FINALIZAR LA VALIDACION DE PLAZAS? </b><br/>  Al finalizar, se esperará a que las mismas sean aprobadas", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .validarPrepublicarPlazasReasignacion(data)
                .pipe(
                    catchError((e) => of(null)),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.handleBuscar();
                        this.obtenerCabeceraProcesoEtapa();
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION,() => { });
                    } else {
                        this.dataService.Message().msgWarning('HEMOS EXPERIMENTADO ALGUNOS PROBLEMAS AL EJECUTAR LA OPERACION, POR FAVOR VERIFIQUE QUE NO EXISTAN REGISTROS EN LA PESTAÑA "PLAZAS PREPUBLICADAS" O NO TIENE CONFIGURADO UN PROCESO DE APROBACIÓN PARA LA FUNCIONALIDAD REASIGNACIÓN LEY 29944', () => { });
                    }
                });
        }, () => { });
    };

    handleRefrescar = (event) => {
        this.setRequest();
        this.dataService.Spinner().show("sp6");
        this.working = true;
        this.btnBuscar.next();
        this.obtenerEstadoDesarrolloEtapa();
        this.obtenerEstadovalidacionPlaza();  
    }

    handleListadoPlazasPrepublicadas = () => {
        const request = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value,
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .pdfPlazaReasignacionPrePublicadas(request)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.handlePreview(response, "PLAZAS PRE-PUBLICADAS.pdf");
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA, 
                            () => {}
                        );
                }
            });
    };

    handleListadoPlazasPublicadas = () => {
        const request = {
            idEtapaProceso: this.proceso.idEtapaProceso
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .pdfPlazaReasignacionPrePublicadas(request)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.handlePreview(response, "PLAZAS PRE-PUBLICADAS.pdf");
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,
                            () => {}
                        );
                }
            });
    };

    private handlePreview(document: any, nombreAdjuntoSustento: string) {
        debugger;
        let file = new Blob([s2ab(atob(document))], { type: 'application/pdf' });
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Reporte de plazas',
                    file: file,
                    fileName: nombreAdjuntoSustento
                }
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                descargarExcel(document, "PLAZAS PUBLICADAS.pdf");
            });
    }

    handleGenerarVerPlazasPublicadas() {
        this.dialogRef = this.materialDialog.open(DocumentosPublicadosComponent, {
            panelClass: 'modal-documentos-publicados-dialog',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idAlcanceProceso: this.idAlcanceProceso,
                idGrupoDocumento: GrupoDocumentoReasignacionEnum.PUBLICACION_PLAZAS
            }
        });
    
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    }

    // Subtitulo y ruta
    buildShared() {
        this.sharedService.setSharedBreadcrumb(
            "Reasignación / Plazas Pre publicadas"
        );
        this.sharedService.setSharedTitle("Desarrollo de Reasignación");
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoModular: [null],
            idTipoDocumentoIdentidad: [null],
            codigoPlaza: [null],
            idOrigenRegistro: [null],
            idEstadoPostulacion: [null],
        });
    }

    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Exportar);
        this.permisos.autorizadoEnviar = true;
        this.currentSession = this.dataService
            .Storage()
            .getInformacionUsuario();
    };

    resetForm = () => {
        this.form.reset();
        this.form
            .get("idOrigenRegistro")
            .setValue(this.opcionFiltro.item.value);
        this.form
            .get("idEstadoPostulacion")
            .setValue(this.opcionFiltro.item.value);
    };

    onTabChanged= (event) => {
        this.selectedTabIndex = event.index;
    }

    obtenerCabeceraProcesoEtapa = () => {
        this.dataService
            .Reasignaciones()
            .getDatosProcesoEtapaById(this.idEtapaProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                this.proceso = response;    
                this.proceso.idAlcanceProceso = this.idAlcanceProceso;
                this.obtenerEstadoDesarrolloEtapa();
                this.obtenerEstadovalidacionPlaza();            
            });
    };

    obtenerEstadoDesarrolloEtapa = () => {

        this.dataService
            .Reasignaciones()
            .obtenerEstadoDesarrolloEtapaProceso(this.idEtapaProceso, this.idAlcanceProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.proceso.estadoProceso = response.estadoDesarrollo;
                    this.proceso.idDesarrolloProceso = response.idDesarrolloProceso;
                }
            });
    };
    
    obtenerEstadovalidacionPlaza(): void {
        const data = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idAlcanceProceso:  this.idAlcanceProceso
        };
        this.dataService.Reasignaciones()
          .getValidarPlaza(data)
          .pipe(
            catchError(() => of([])),
            finalize(() => {
            })
          )
          .subscribe((response: any) => {
            if (response) {
              if ((response || []).length === 0) {
                this.proceso.estadoValidacionPlaza =  'PENDIENTE';
                this.proceso.codigoEstadoValidacionPlaza = EstadoValidacionPlazaEnum.PENDIENTE;
              } else {
                 let responseEstadoValidacionPlaza = response[0];
                 this.proceso.estadoValidacionPlaza =  responseEstadoValidacionPlaza.descripcionEstadoValidacionPlaza;
                 this.proceso.codigoEstadoValidacionPlaza = responseEstadoValidacionPlaza.codigoEstadoValidacionPlaza;                 
                 this.detalleMotivoRechazo = responseEstadoValidacionPlaza.detalleMotivoRechazo
              }
            }
          });
    }

    handleVerMotivoRechazo(){
        this.dialogRef = this.materialDialog.open(MotivoRechazoComponent, {
            panelClass: "motivo-rechazo-dialog",
            width: "700px",
            disableClose: true,
            data: {
                action: "motivoDetalle",
                detalle: this.detalleMotivoRechazo
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
            }
        });
    }

    obtenerPlazaReasignacion = () => {
        // var codigoSede = this.codSedeCabecera;
        // var codigoTipoSede= this.currentSession.codigoTipoSede;
        // if(codigoTipoSede !== "TS005"){
        //     codigoSede = this.currentSession.codigoSede;
        // }
        this.dataService
            .Reasignaciones()
             //.obtenerPlazaReasignacion(this.idEtapaProceso, codigoSede)
            .obtenerPlazaReasignacionPorAlcanceProceso(this.idEtapaProceso, this.idAlcanceProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log(response[0]);
                    this.detalleReasignacion = response[0];
                }
            });
    };

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1200px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                    tipoSede: this.currentSession.codigoTipoSede,
                    codigoSede: this.currentSession.codigoSede
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoModular").setValue(result.centroTrabajo.codigo_centro_trabajo);
            }
        });
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
            panelClass: 'buscar-plaza-form',
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
                //tipoFormato: 1, // TipoFormatoPlazaEnum.GENERAL,
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.codigoPlaza.trim());               
            }
        });
    }

    filtrosBusqueda = {
        codigoModular: "",
        codigoPlaza: "",
    };

    handleBuscar() {
        this.setRequest();
        this.dataService.Spinner().show("sp6");
        this.working = true;
        this.btnBuscar.next();
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    handleLimpiar() {
        this.form.reset();
        this.handleBuscar();
    }

    handleRetornar(): void {
        this.router.navigate(['../../../'], { relativeTo: this.route });
    }

    checkedDataConvocar = [];
    uncheckedData = []; //this.data;

    handleMoverPrepublicadasToConvocar() {
    }
    checkedDataObservados = [];
    handleMoverPrepublicadasToObservadas() {
    }

    handleInformacion(row: any, i) {
        this.dialogRef = this.materialDialog.open(
            InformacionPlazaComponent,
            {
                panelClass: "minedu-ver-informacion-ascenso-dialog",
                width: "980px",
                disableClose: true,
                data: {
                    action: "busqueda",
                    dataKey: row,
                },
            }
        );
    }

    ngAfterViewInit(): void {
        // this.idEtapaProceso = this.route.snapshot.params.id;
    }


    ngOnDestroy(): void {}


    setRequest = () => {
        this.request = {
            idEtapaProceso: +this.idEtapaProceso,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value
        };
    };

  

    datasourceObs: any[];

    request = {
        idEtapaProceso: null,
        codigoPlaza: null,
        codigoCentroTrabajo: null,
        // codigoRolPassport: null,
    };
}


