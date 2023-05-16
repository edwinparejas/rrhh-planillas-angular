import { Component, OnDestroy,AfterViewInit, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { SharedService } from 'app/core/shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { OpcionFiltro } from 'app/main/apps/licencias/models/licencia.model';
import { BuscarCentroTrabajoComponent } from "../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BuscarPlazaComponent } from "../components/buscar-plaza/buscar-plaza.component";
import { DocumentosPublicadosPrepublicacionComponent } from "../components/documentos-publicados-prepublicacion/documentos-publicados-prepublicacion.component";
import { DocumentosPrepublicadosFechaComponent } from "../components/documentos-prepublicados-fecha/documentos-prepublicados-fecha.component";
import { EtapaProcesoResponseModel, TablaPermisos, ValidacionPlazaModel, IGenerarPdfPlazasPrePublicadas, IActualizarEtapaProcesoViewModel } from '../models/reasignacion.model';
import { descargarExcel, s2ab } from 'app/core/utility/functions';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { HttpClient } from '@angular/common/http';
import { SecurityModel } from 'app/core/model/security/security.model';
import { GrupoDocumentoPublicadoEnum, GrupoDocumentoReasignacionEnum, EstadoEtapaProcesoEnum, CodigoCentroTrabajoMaestroEnum, MENSAJES } from "app/main/apps/procesos/reasignacion/_utils/constants";
import { CodigoDescripcionMaestroProceso, CodigoEstadoDesarrollo, TablaRegimenLaboral, codigoEstadoValidacionPlaza } from 'app/core/model/types-reasignacion';
import { ReasignacionesModel } from "../models/reasignaciones.model";

@Component({
  selector: 'minedu-pre-publicacion',
  templateUrl: './pre-publicacion.component.html',
  styleUrls: ['./pre-publicacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class PrePublicacionComponent implements OnInit,AfterViewInit {
  proceso: ReasignacionesModel; 
  idEtapaProceso: number;
  idDesarrolloProceso: number;
  idAlcanceProceso: number;
  detalleReasignacion: any = null;
  btnBuscar: Subject<void> = new Subject<void>();
  working = false;
  fecha = new Date();
  fechaCorteVisible = new Date();
  fechaCorte:Date;
  fechaFinNacional:Date;
  codSedeCabecera:string; 
  nroEtapasIniciadas : number = 0;
  soloLectura = true;
  jobEjecutado = false;
  form: FormGroup;
  opcionFiltro: OpcionFiltro = new OpcionFiltro();
  currentSession: SecurityModel = new SecurityModel();
  etapa: EtapaProcesoResponseModel = new EtapaProcesoResponseModel();
  vali: ValidacionPlazaModel = new ValidacionPlazaModel();
  idep: number;
  validacionPlaza: any;
  codigoValidacionPLaza: any;
  idplr: number;
  objetoBusqueda?: any;
  dialogRef: any;
  ocultarLoader:boolean=false;
  idPlazaReasignacion: number;

  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false
  };

  comboLists = {
    listInstancia: [],
    listSubInstancia: []
  };

  arrayEtapaProceso: [];

  request = {
    anio: '',
    idplr: 0,
    valiPlaza: '',
    fecha_corte: null,
    idInstancia: '',
    idSubInstancia: '-1',
    idCodigoModular: '',
    idCodigoPlaza: '',
    idEtapaProceso: 0,
    idDesarrolloProceso: 0
  };
  paginatorPageSize = 10;
  paginatorPageIndex = 0;
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

  reasignacionBusqueda: any;
  observadaBusqueda: any;
  selectedTabIndex = 0;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private sharedService: SharedService,
    private materialDialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    //setTimeout(_ => this.buildShared());
    this.codSedeCabecera = CodigoCentroTrabajoMaestroEnum.MINEDU; 
    this.route.params.subscribe(
      params => {
        this.idEtapaProceso = params['paramIdEtapaProceso'];
        this.idAlcanceProceso = params['paramIdAlcanceProceso'];
      });
      this.obtenerFechaDeCortePrepublicacion();
      this.obtenerCabeceraProcesoEtapa();
      this.obtenerEstadoJobEjecutado();
      this.buscarEtapaProceso();
      this.obtenerPlazaReasignacion();
      this.buildForm();
      this.handleResponsive();
      this.buildSeguridad();
      this.loadInstancia();
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

            case codigoEstadoValidacionPlaza.PrePublicandoPlazas:
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

    obtenerEstadoJobEjecutado(){
        this.dataService
            .Reasignaciones()
            .getVerificarEjecucionJobPlazas(+this.idEtapaProceso)
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

  obtenerCabeceraProcesoEtapa = () => {
    this.dataService
        .Reasignaciones()
        .getDatosProcesoEtapaById(+this.idEtapaProceso)
        .pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            this.proceso = response;   
            this.proceso.idAlcanceProceso = this.idAlcanceProceso;
            this.obtenerEstadoDesarrolloEtapa();
            this.obtenerEstadoValidacionPlaza();         
            this.obtenerEstadoJobEjecutado();     
        });
 };

 obtenerPlazaReasignacion = () => {
    let d = {
        idEtapaProceso: this.idEtapaProceso,
        codigoCentroTrabajoMaestro: CodigoCentroTrabajoMaestroEnum.MINEDU
    }
    // this.dataService
    // .Reasignaciones()
    // .getObtenerPlazaReasignacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
    this.dataService
        .Reasignaciones()
        // .obtenerPlazaReasignacion(this.idEtapaProceso, this.idAlcanceProceso)
        .getObtenerPlazaReasignacionPorIdEtapaProceso(d)
        .pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                this.detalleReasignacion = response[0];
                if(response.length > 0){
                    this.detalleReasignacion.fechaPublicacion = this.fechaCorteVisible;
                }
            }
        });
};

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }
  buildSeguridad = () => {
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Observadas / Pre Publicacion de Plazas");
    this.sharedService.setSharedTitle("Pre Publicacion Plazas");
  }

  handleFinalizarEtapaDespuesDePrePublicar = () => {
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    const request: IActualizarEtapaProcesoViewModel = {
        idEtapaProceso: Number(this.idEtapaProceso),
        idDesarrolloProceso: this.etapa.idDesarrolloProceso,
        usuarioModificacion: this.currentSession.numeroDocumento       
    };
    this.dataService.Reasignaciones().registrarPlazaReasignacionSiguienteEtapaPublicacion(request).pipe(
        catchError((e) => of(e)),
        finalize(() => {
            this.dataService.Spinner().hide("sp6");
        })
    )
    .subscribe((response) => {
        if (response > 0) {  
            this.obtenerEstadoValidacionPlaza();
            this.obtenerEstadoDesarrolloEtapa();               
        } else {
            this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE FINALIZAR LA ETAPA."', () => {});
        }
    });
  }

    handlePrePublicar = () => {
        var request: IGenerarPdfPlazasPrePublicadas = {
            idEtapaProceso: +this.idEtapaProceso,
            idDesarrolloProceso: this.etapa.idDesarrolloProceso,
            anio: this.fecha.getFullYear(),
            usuarioCreacion: this.currentSession.numeroDocumento,
        };
        this.obtenerPlazaReasignacion();
        if(this.detalleReasignacion == undefined){
            this.dataService.Message().msgWarning('"PARA PREPUBLICAR DEBE TENER PLAZAS."', () => {});
            return;
        }

        const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA REALIZAR LA PRE PUBLICACIÓN DE LAS PLAZAS?</strong><br>Al pre publicar las plazas no se podrá observar, ni reasignar plazas y también se generará el listado de las plazas en formato PDF."; // M108
        this.dataService.Message().msgConfirm(confirmationMessage,
            () => {
                this.dataService.Spinner().show("sp6");
                    this.dataService
                    .Reasignaciones()
                    .prepublicarPlazasReasignacion(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response) {
                        this.handleBuscar();
                        this.obtenerCabeceraProcesoEtapa();
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {});
                        this.handleEvaluarCambioEstadoPrePublicacion();
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL PRE PUBLICAR LAS PLAZAS."', () => {});
                    }
                });
            }, (error) => {}
        );
    }

    handleEvaluarCambioEstadoPrePublicacion =()=>{
        this.ocultarLoader = true; 
        this.validacionPlaza ="PRE PUBLICANDO PLAZAS";
        const interval = setInterval(() => {
                let d = {
                    idEtapaProceso: this.idEtapaProceso,
                    codigoCentroTrabajoMaestro: CodigoCentroTrabajoMaestroEnum.MINEDU
                }
                this.dataService
                .Reasignaciones()
                .getObtenerPlazaReasignacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
                    finalize(() => {})
                )
                .subscribe((response: any) => {
                    if (response) {
                    this.idPlazaReasignacion = response[0].idPlazaReasignacion;
                    this.validacionPlaza = response[0].estadoValidacionPlaza;
                    if(this.validacionPlaza !="PRE PUBLICANDO PLAZAS") {
                    this.ocultarLoader = false; 
                        clearInterval(interval);
                    }
                }
            });
            },10000);
        }

    handleAperturarPrePublicar  = () => {
        let fechaActual = new Date();

        if(fechaActual > this.fechaFinNacional){
            return this.dataService.Message().msgWarning('"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE FINALLIZÓ LA ACTIVIDAD PRE PUBLICACIÓN DE PLAZAS."',() => {}); 
        }

        if(this.nroEtapasIniciadas>0){
            return this.dataService.Message().msgWarning('"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE EL SIGUIENTE PROCESO SE HA INICIADO"', () => {}); // M156
        }

        const request: IActualizarEtapaProcesoViewModel = {
            idEtapaProceso: Number(this.idEtapaProceso),
            idDesarrolloProceso: this.etapa.idDesarrolloProceso,
            usuarioModificacion: this.currentSession.numeroDocumento,
        }

        this.dataService.Reasignaciones().verificarAperturarPlazasPrepublicacion(request)
        .subscribe((response)=>{
            // if(response.resultadoValidacion){
             this.obtenerEstadoValidacionPlaza();
             this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA REALIZAR LA APERTURA DE LA PRE PUBLICACIÓN DE PLAZAS?',
             () => {
                 this.dataService.Spinner().show("sp6");
                     this.dataService.Reasignaciones().aperturarPlazasPrepublicacion(request).pipe(
                     catchError((e) => of(e)),
                     finalize(() => {
                         this.dataService.Spinner().hide("sp6");
                     })
                 )
                 .subscribe((responseApertura) => {
                     if (responseApertura) {
                         this.handleBuscar();
                         this.obtenerCabeceraProcesoEtapa();
                         this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO,MENSAJES.DURACION, () => {});
                     } else {
                         this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA PRE-PUBLICACION."', () => {});
                     }
                 });
             }, (error) => {}
         );
        // }else{
        //     return this.dataService.Message().msgAutoCloseWarningNoButton('"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE FINALLIZÓ LA ACTIVIDAD PRE PUBLICACIÓN DE PLAZAS."',3000, () => {}); 
        // }
        });

    }

  ngAfterViewInit(): void {

  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      idInstancia: [null],
      idSubInstancia: [null],
      codigoModular: [null],
      codigoPlaza: [null]
    });
  }

  resetForm = () => {
    this.form.reset();
    this.form.get('idInstancia').setValue("-1");
    this.form.get('idSubInstancia').setValue("-1");
  }

  handleLimpiar(): void {
    this.resetForm();
    this.handleBuscar();
  }


  loadInstancia() {
    this.dataService.Reasignaciones()
      .getInstancias(true)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        this.comboLists.listInstancia = response;
      });
  }

  loadSubInstancia() {
    this.dataService.Reasignaciones()
      .getSubInstancias(true, this.form.value.idInstancia)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        this.comboLists.listSubInstancia = response;
        setTimeout(() => {
            this.form.get('idSubinstancia')?.patchValue('-1');
        }, 0);
        //   this.comboLists.listSubInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        // }
      });
  }

  buscarEtapaProceso = () => {
    this.dataService.Reasignaciones()
      .getInformacionEtapaProceso(this.idEtapaProceso)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
            this.obtenerEstadoValidacionPlaza();
        })
      )
      .subscribe((response: any) => {
        if (response) {
            this.etapa = response;
            this.obtenerEstadoDesarrolloEtapa();
        }
      });

  }

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
                this.etapa.estadoProceso = response.estadoDesarrollo;
                this.etapa.idDesarrolloProceso = response.idDesarrolloProceso;
            }
        });
   };

    obtenerFechaDeCortePrepublicacion = () => {

        this.dataService
            .Reasignaciones()
            .obtenerFechaDeCortePrepublicacion(this.idEtapaProceso, this.idAlcanceProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.etapa.fechaCorte = response.fechaDeCorte;
                    this.fechaCorte = response.fechaDeCorte;
                    this.fechaFinNacional = response.fechaFinNacional;
                    this.nroEtapasIniciadas = +response.nroEtapasIniciadas;
                    if(this.fechaCorte){
                    this.fechaCorteVisible = this.fechaCorte;
                    }
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
            // panelClass: "buscar-plaza-dialog",
            panelClass: 'buscar-plaza-form',
            width: "1200px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: 1, // TipoFormatoPlazaEnum.GENERAL,
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.codigoPlaza.trim());               
            }
        });
    }

  obtenerEstadoValidacionPlaza(): void {

    const data = {
        idEtapaProceso: Number(this.idEtapaProceso),
        idAlcanceProceso: Number(this.idAlcanceProceso)
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
            this.validacionPlaza =  'PENDIENTE';
            this.codigoValidacionPLaza = codigoEstadoValidacionPlaza.Pendiente;
          } else {
             let responseEstadoValidacionPlaza = response[0];
             this.validacionPlaza =  responseEstadoValidacionPlaza.descripcionEstadoValidacionPlaza;
             this.codigoValidacionPLaza = responseEstadoValidacionPlaza.codigoEstadoValidacionPlaza;
          }
        }
        if(this.detalleReasignacion!=null){
            this.detalleReasignacion.estadoValidacionPlaza = this.validacionPlaza;
          }

        if(this.validacionPlaza == "PRE PUBLICANDO PLAZAS") {
            this.codigoValidacionPLaza = codigoEstadoValidacionPlaza.PrePublicandoPlazas;
            this.handleEvaluarCambioEstadoPrePublicacion();
		}
      });
}


  setRequest(): void {
    this.request = {
      anio: String(this.etapa.anioProceso),
      idplr: Number(this.idplr),
      valiPlaza: this.validacionPlaza,
      fecha_corte: this.fechaCorteVisible,
      idInstancia: this.form.get('idInstancia').value,
      idSubInstancia: this.form.get('idSubInstancia').value,
      idCodigoModular: this.form.get('codigoModular').value,
      idCodigoPlaza: this.form.get('codigoPlaza').value,
      idEtapaProceso: this.idEtapaProceso,
      idDesarrolloProceso: this.etapa.idDesarrolloProceso
    }; 
  }

  redirectToPrePublicacion() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
    this.router.navigate(['/ayni/personal/procesospersonal/procesos/reasignacion/pre-publicacion/',this.idEtapaProceso]));
  }


    onTabChanged= (event) => {
        this.selectedTabIndex = event.index;
    }


    handleRefrescar = (event) => {
        this.setRequest();
        this.dataService.Spinner().show("sp6");
        this.working = true;
        this.btnBuscar.next();
    }

  handleBuscar() {
    this.setRequest();
    this.dataService.Spinner().show("sp6");
    this.working = true;
    this.btnBuscar.next();
    this.obtenerEstadoJobEjecutado();
  }

  handleRetornar(): void {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

  handleVerPlazasPdf() {
    // this.dialogRef = this.materialDialog.open(DocumentosPublicadosPrepublicacionComponent, {
    //     panelClass: 'documentos-publicados-prepublicacion',
    //     disableClose: true,
    //     data: {
    //         idEtapaProceso: this.idEtapaProceso,
    //         idGrupoDocumento: GrupoDocumentoReasignacionEnum.PREPUBLICACION_PLAZAS,
    //         nombreDocumento:  'Plazas_Reasignación'
    //     }
    // });

    // this.dialogRef.afterClosed()
    //     .subscribe((response: any) => {
    //         if (!response) {
    //             return;
    //         }
    //     }
    // );



    this.dialogRef = this.materialDialog.open(DocumentosPrepublicadosFechaComponent, {
        panelClass: 'minedu-documentos-prepublicados-fecha',
        disableClose: true,
        width: "1000px",
        data: {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.etapa.idDesarrolloProceso,
            idGrupoDocumento: GrupoDocumentoReasignacionEnum.PREPUBLICACION_PLAZAS ,
            nombreDocumento: 'Plazas_Reasignación',
            dialogTitle:'Pre Publicación de plazas de reasignación',
            columnTitle:"Pre Publicación",
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

  private handlePreview(document: any, nombre: string) {
    let file = new Blob([s2ab(atob(document))], { type: 'application/pdf' });
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
      panelClass: 'modal-viewer-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: 'remove_red_eye',
          title: 'Plazas Pre-Publicadas',
          file: file,
          fileName: nombre
        }
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        descargarExcel(document, "PLAZAS PRE PUBLICADAS.pdf");
      });
  }

}

