
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { OpcionFiltro } from "../../contratacion/models/contratacion.model";
import { EstadoConsolidadoPlazaEnum, RegimenLaboralEnum } from "../../cuadro-horas/_utils/constants";
import { saveAs } from "file-saver";
import { mineduAnimations } from "@minedu/animations/animations";
import { MatDialog } from "@angular/material/dialog";
import { MotivoRechazoComponent } from "../../contratacion/consolizadoplaza/components/motivo-rechazo/motivo-rechazo.component";
import { ResultadoOperacionEnum } from "../../../../../core/model/types";
import { descargarExcel } from "app/core/utility/functions";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { SecurityModel } from "app/core/model/security/security.model";
import { BuscarCentroTrabajoComponent } from "../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { HttpErrorResponse } from "@angular/common/http";
import { isArray, isNumber } from "lodash";
import { ModalProyectoResolucionComponent } from "../components/modal-proyecto-resolucion/modal-proyecto-resolucion.component";
import { ModalComitesGeneradosComponent } from "../components/modal-comites-generados/modal-comites-generados.component";
import { DomSanitizer } from "@angular/platform-browser";


@Component({

    selector: 'minedu-bandeja-consolidado',
    templateUrl: './consolidado.component.html',
    styleUrls: ['./consolidado.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ConsolidadoComponent implements OnInit, AfterViewInit {
    procesoHeader: any = {};
    //etapaResponse: any = {};
    idEtapaProceso: number;
    idConsolidado: number;
    codigoCentroTrabajo :string;
    idProceso: number;
    idEtapa:number;
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
    idDre = 0;
    idUgel = 0;
    file: any = null;
    idDreSel="";
    idUgelSel="";
    currentSession: SecurityModel = new SecurityModel();
    disabledDre:boolean;
    disabledUgel :boolean;
    
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
        codigoModular:null,
        numeroDocumento:"",
        tipoNumeroDocumento:"",
        solicitante:"",
        primerApellidoAprobador:"",
        segundoApellidoAprobador:"",
        nombresAprobador:"",
        codigoRol:"",
        codigoCentroTrabajo:"",
        usuarioModificacion:"",
    };
    permiso={
        accesoAprobarCuadroHoras:false,
        accesoRechazarCuadroHoras :false,
        accesoVerificarCuadroHoras :false
     }
     permisoTotal={
       accesoParametrizacion:false,
       accesoPlazas:false,
       accesoPreferencias:false,
       accesoDistribucionNombrados:false,
       accesoDistribucionTotal:false,
       accesoConsolidadoPlazas:false,
       accesoRemitirCuadroHoras:false
     }
     securityModel:SecurityModel;
    displayedColumns: string[] = [
        "registro",
        "idInstancia",
        "idSubInstancia",
        "institucionEducativa",
        "codigoModular",
        "descripcionUbigeo",                        
        "estadoConsolidado",
        "fechaValidacion",
        "fechaAprobacion",
        "fechaRechazo",
        "acciones",
    ];
    K_MENSAJE_NO_AUTH:string
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit(): void {
        this.K_MENSAJE_NO_AUTH="NO TIENE PERMISOS CONFIGURADOS PARA ACCEDER A ESTA OPCIÓN."
        this.securityModel=  this.dataService.Storage().getInformacionUsuario();

        this.disabledDre=false;
        this.disabledUgel=false;
        setTimeout((_) => this.buildShared());
        
        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        console.log("this.getCurrentUser ",this.dataService.Storage().getCurrentUser());
        console.log("this.getInstanciaSelected ",this.dataService.Storage().getInstanciaSelected());
        console.log("this.currentSession ",this.currentSession );
        
        this.idConsolidado = this.route.snapshot.params.idConsolidado;
        this.initParam();
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
       
        this.resetForm();

      
       
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
        this.sharedService.setSharedBreadcrumb("Cuadro de Horas / Plazas Consolidadas");
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
            codigoModular: [null],
            idEstadoConsolizadoPlaza: [null],
        });

      
    }
    busquedaCentroTrabajoPersonalizada = () => {
      this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
          panelClass: "buscar-centro-trabajo-dialog",
          width: "1300px",
          disableClose: true,
          data: {
              action: "requerimiento",
          },
      });

      this.dialogRef.afterClosed().subscribe((result) => {
          if (result != null) {
              this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
          }
      });
  };
    initParam = () => {
        this.dataService.CuadroHoras().obtenerParametroInicialConsolidado(this.idConsolidado ).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response) {
                this.idEtapaProceso= response.idEtapaProceso;
                this.codigoCentroTrabajo= response.codigoCentroTrabajo;
                this.idProceso= response.idProceso;
                this.idEtapa= response.idEtapa;
          
                this.loadProcesoHeader();

                this.loadConfiguracionPermisoTotal((responseAccess)=>{
                    this.initAccess(false);
                      if(responseAccess){
                        if(this.permisoTotal.accesoConsolidadoPlazas){
                             this.loadConfiguracionPermiso((response)=>{
                                  console.log("loadConfiguracionPermiso response----",response);
                              });
                          }
                        else{
                          this.permisoTotal.accesoConsolidadoPlazas=false
                          this.dataService.SnackBar().msgInformation("NO TIENE PERMISOS CONFIGURADOS PARA ACCEDER A ESTA OPCIÓN..", 'Cerrar'); 
                        }  
                      }
                  });

            
             }
        });
    };
    loadProcesoHeader() {
        let request = {
          idEtapaProceso:  this.idEtapaProceso
        };
        this.dataService.CuadroHoras().getCabeceraProceso(request).pipe(
          catchError((e) => { return  this.configCatch(e);        }),
          finalize(() => { })
        ).subscribe(
                  (response) => {
                    
                  this.procesoHeader = response
 
                  },
                  (error: HttpErrorResponse) => {
                  console.log(error);
                  }
        )
        }
       
    loadInstancia = (activo) => {
        this.dataService.CuadroHoras().obtenerPorCodigoCentroTrabajoDreUgel({
            CodigoCentroTrabajo:this.currentSession.codigoSede
        }).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            console.log("loadDreUgelUserPassport",response);
            if(response.idDre!=null)            this.disabledDre=true;
            if(response.idUgel!=null)            this.disabledUgel=true;
            this.idDre=response.idDre;
            this.idUgel=response.idUgel;
             


                    this.dataService.CuadroHoras().getComboInstanciaFiltro(activo).pipe(
                        catchError(() => of([])),
                        finalize(() => {})
                    )
                    .subscribe((response: any) => {
                        if (response) {
                            console.log("loadInstancia",response);
                            const data = response.map((x) => ({
                                ...x,
                                value: x.id_instancia,
                                label: `${x.descripcion_instancia}`,
                                selected:this.idDre==x.id
                                
                            }
                            ));
                            
                            this.comboLists.listInstancia = data;
                            this.comboLists.listInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                            const dataSel = this.comboLists.listInstancia.find((x) => x.selected === true);
                            this.form.controls['idInstancia'].setValue(dataSel.value);

                        if (this.comboLists.listInstancia.length !== 0) {
                            const data = this.comboLists.listInstancia.find((x) => x.selected === true);
                            this.loadSubInstancia(data.id, true);
                        }else{
                            this.buscarConsolidado();
                        }
            
                        


                        }
                    });


        });


        
    };

    loadSubInstancia = (idInstancia, activo) => {
        if (idInstancia == null || idInstancia == -1) {
            this.comboLists.listSubInstancia = [];
            this.comboLists.listSubInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });

            return;
        } else {
            this.dataService.CuadroHoras().getComboSubinstanciaFiltro(idInstancia, activo).pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log(this.idUgel,"this.idUgel");
                    const data = response.map((x) => ({
                        ...x,
                        value: x.id_subinstancia,
                        label: `${x.descripcion_subinstancia}`,
                        selected:this.idUgel==x.id
                    }));

                    this.comboLists.listSubInstancia = data;
                    this.comboLists.listSubInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
   

                    const dataSel = this.comboLists.listSubInstancia.find((x) => x.selected === true);
                    if(dataSel!==undefined )this.form.controls['idSubInstancia'].setValue(dataSel.value);
                    this.buscarConsolidado();
 
                }
            });
        }
    };

    loadEstadosConsolidado = () => {
        this.dataService.CuadroHoras().getComboEstadosConsolidadoPlaza().pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            console.log("loadEstadosConsolidado",response);
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
        const dre = this.form.get("idInstancia").value;// this.form.get("idInstancia").value; 
        const ugel = this.form.get("idSubInstancia").value;
        const estado = this.form.get("idEstadoConsolizadoPlaza").value;

        const user = this.dataService.Storage().getPassportUserData();
        const rol = this.dataService.Storage().getPassportRolSelected();

        this.request = {
            idProceso: this.idProceso,
            idEtapaProceso: this.idEtapaProceso,
            idDre:dre == -1 ? null : parseInt(dre.toString().split("-")[1]), //dre
            idUgel:ugel == -1 ? null : parseInt(ugel.toString().split("-")[1]), //ugel
            idEstado: estado == -1 ? null : estado,
             usuarioCreacion: null,
             maestroProceso: null,
             anio: null,
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
            codigoModular: this.form.get("codigoModular").value,
            numeroDocumento:this.securityModel.numeroDocumento,
            tipoNumeroDocumento:this.securityModel.tipoNumeroDocumento,
            solicitante:this.securityModel.nombreCompleto,
            primerApellidoAprobador:user.APELLIDO_PATERNO,
            segundoApellidoAprobador:user.APELLIDO_MATERNO,
            nombresAprobador:user.NOMBRES_USUARIO,
            codigoRol:rol.CODIGO_ROL,
            codigoCentroTrabajo:rol.CODIGO_SEDE,
            usuarioModificacion:user.NUMERO_DOCUMENTO
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
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {} );
            return;
        }

        this.dataService.Spinner().show("sp6");
        this.dataService.CuadroHoras().exportarConsolidadoPlaza(this.request).pipe(
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

    handleAprobarMasivo = () => {

        if(!this.permiso.accesoAprobarCuadroHoras ){
            this.dataService.SnackBar().msgInformation(this.K_MENSAJE_NO_AUTH, 'Cerrar'); 
            return;
          }
        this.setRequest();
        const resultMessage = '"SE REALIZÓ CORRECTAMENTE LA APROBACIÓN MASIVA DE PLAZAS."';
        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA APROBAR MASIVAMENTE LAS PLAZAS?",
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.CuadroHoras().aprobarMasivoConsolidadoPlaza(this.request).pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    console.log(response)
                    if(isNumber(response)){
                        this.dataService.Message().msgSuccess(resultMessage, () => {});
                        this.handleBuscar();
                    }
                    // if (response) {
                    //     this.dataService.Message().msgSuccess(resultMessage, () => {});
                    //     this.handleBuscar();
                    // } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    //     this.dataService.Message().msgWarning(response.messages[0], () => {});
                    // } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    //     this.dataService.Message().msgWarning(response.messages[0], () => {});
                    // } else {
                    //     this.dataService.Message().msgError('"OCURRIERON PROBLEMAS AL TRATAR DE APROBAR MASIVAMENTE LAS PLAZAS."', () => {} );
                    // }
                });
            }, (error) => {}
        );
    }

     

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
                saveAs(file,   "ResolucionGenerada.pdf");
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
                detalle: detalleConsolidado
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.buscarConsolidado();
            }
        });
    }

    handleGoConsolidadoPlzaDetalle = (row) => {
        if(!this.permiso.accesoVerificarCuadroHoras ){
            this.dataService.SnackBar().msgInformation(this.K_MENSAJE_NO_AUTH, 'Cerrar'); 
          //  return;
          }
        console.log("item sell",row)
        this.router.navigate(["../../gestionar-total/"+row.id_proceso+"/"+row.idEtapa+"/"+row.id_etapa_proceso+"/"+row.codigoCentroTrabajo+"/"+row.id_consolidado_plaza+"/" ],
            { relativeTo: this.route }
        )
    };
    private configCatch(e: any) { 

        if (e && (e.status === 400 || e.status === 500) && isArray(e.error.messages)) {
          this.dataService.Util().msgWarning(e.error.messages[0], () => { });
        } else {
          this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
      
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      
        }
        getDocumento(data) {
            this.dataService.Documento().descargar(data.nombreArchivo)
            .pipe(
              catchError((e) => { return  this.configCatch(e);        }),
              finalize(() => { })
            ).subscribe(response => {
                if (response) {
                  const data = window.URL.createObjectURL(response);
                  this.file = this.sanitizer.bypassSecurityTrustResourceUrl(data);
                  this.handlePreview(response, "ResolucionGenerada");
                } else {
                  this.dataService.Util().msgWarning('<b>No tiene generado el reporte anexo 1.</b>', () => { });
                }
              });
          }
        descargarResolucion(documentoProyectoResolucion) {
            const codigoDocumentoReferencia = documentoProyectoResolucion;
       
            this.getDocumento({nombreArchivo:documentoProyectoResolucion});
 
          }
        handleVerResolucion(row){
            this.descargarResolucion(row.documentoProyectoResolucion);
        }
        
        handleGenerarResolucion(row){
            if(!this.permiso.accesoAprobarCuadroHoras ){
                this.dataService.SnackBar().msgInformation(this.K_MENSAJE_NO_AUTH, 'Cerrar'); 
                 return;
              }
            
           
            this.dialogRef = this.materialDialog.open(ModalProyectoResolucionComponent, {
                panelClass: 'modal-generar-proyecto-resolucion-form-dialog',
                disableClose: true,
                width: '1000px',
                data: {
                  modal: {
                    icon: "description",
                    title: "Generar proyecto de resolución",
                    action: "proyecto",
                  },
                      proceso: this.procesoHeader,
                      idConsolidado :row.id_consolidado_plaza,
                      idParametroInicial:row.idParametroInicial
                      // idRegimenLaboral: this.idRegimen,
                      // abreviaturaRegimenLaboral: this.abreviaturaRegimenLaboral,
                      // idGrupoAccion: this.idGrupoAccionCombo,
                      // abreviaturaGrupoAccion: this.abreviaturaGrupoAccion,
                      // idAccion: this.idAccionCombo,
                      // abreviaturaAccion: this.abreviaturaAccion,
                      // idMotivoAccion: this.idMotivoAccion,
                      // abreviaturaMotivoAccion: this.abreviaturaMotivoAccion,
                      // info: dataRequest
                      
                    
                  // permisoComite: this.permisoComite,
          
                }
              });
          
              this.dialogRef.afterClosed()
                .subscribe((response: any) => {
                  // if (!response) {
                  //   return;
                  // }
                  // if (response.reload) {
                  //   this.cargarGrilla();
                  // }
                });
        }
        // btnGenerarProyecto() {
        //     // if (!this.permisoPassport.buttonProyectoComite) {
        //     //   this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        //     //   return;
        //     // }
        //     // var dataRequest: any = null;
        //     // dataRequest = this.buildBodyData();
           
        //     this.dialogRef = this.materialDialog.open(ModalProyectoResolucionComponent, {
        //       panelClass: 'modal-generar-proyecto-resolucion-form-dialog',
        //       disableClose: true,
        //       width: '1000px',
        //       data: {
        //         modal: {
        //           icon: "description",
        //           title: "Generar proyecto de resolución",
        //           action: "proyecto",
        //         },
        //             proceso: this.procesoHeader,
        //             idConsolidado :this.idConsolidado 
        //             // idRegimenLaboral: this.idRegimen,
        //             // abreviaturaRegimenLaboral: this.abreviaturaRegimenLaboral,
        //             // idGrupoAccion: this.idGrupoAccionCombo,
        //             // abreviaturaGrupoAccion: this.abreviaturaGrupoAccion,
        //             // idAccion: this.idAccionCombo,
        //             // abreviaturaAccion: this.abreviaturaAccion,
        //             // idMotivoAccion: this.idMotivoAccion,
        //             // abreviaturaMotivoAccion: this.abreviaturaMotivoAccion,
        //             // info: dataRequest
                    
                  
        //         // permisoComite: this.permisoComite,
        
        //       }
        //     });
        
        //     this.dialogRef.afterClosed()
        //       .subscribe((response: any) => {
        //         // if (!response) {
        //         //   return;
        //         // }
        //         // if (response.reload) {
        //         //   this.cargarGrilla();
        //         // }
        //       });
        
        //   }
        
          btnVerProyectos() {
            this.dialogRef = this.materialDialog.open(ModalComitesGeneradosComponent, {
              panelClass: 'modal-comite-generados-dialog',
              disableClose: true,
              width: '500px',
              data: {
                modal: {
                  icon: "remove_red_eye",
                  title: "Proyecto de Resolución generados",
                  origin: "proyecto",
                },
                // idProceso: this.cabeceraProceso.idProceso,
                // idAlcanceProceso: this.permisoComite.idAlcanceProceso
              }
            });
        
            this.dialogRef.afterClosed()
              .subscribe((response: any) => {
        
              });
          }
          loadConfiguracionPermiso(callback) {
            let request = {
              codigoRolPassport:this.securityModel.codigoRol,
              codigoTipoSede:this.securityModel.codigoTipoSede,
              idEtapa:this.idEtapa
            };
            this.dataService.CuadroHoras().obtenerMaestroPermisoConsolidadoAnexos(request).pipe(
              catchError((e) => { return  this.configCatch(e);        }),
              finalize(() => { })
          ).subscribe(
            (response) => {
          
              if(response!==null){
           
                this.permiso.accesoAprobarCuadroHoras=response.accesoAprobarCuadroHoras;
                this.permiso.accesoRechazarCuadroHoras= response.accesoRechazarCuadroHoras;
                this.permiso.accesoVerificarCuadroHoras= response.accesoVerificarCuadroHoras;
              }else{
                /*NO TIENE ACCESO Y NO ESTA CONFIGURADO EN TABLAS MAESTROS*/
                this.dataService.SnackBar().msgInformation("NO TIENE PERMISOS CONFIGURADOS PARA ACCEDER A ESTA OPCIÓN.", 'Cerrar'); 
                this.permiso.accesoAprobarCuadroHoras=false;
                this.permiso.accesoRechazarCuadroHoras= false;
                this.permiso.accesoVerificarCuadroHoras= false;
              }
              callback(true);
            },
            (error: HttpErrorResponse) => {
            console.log('loadCentroTrabajo', error);
            }
            )
          }
          loadConfiguracionPermisoTotal(callback) {
          let request = {
            codigoRolPassport:this.securityModel.codigoRol,
            codigoTipoSede:this.securityModel.codigoTipoSede,
            idEtapa:this.idEtapa
          };
            this.dataService.CuadroHoras().obtenerMaestroPermisoDesarrollo(request).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => { })
          ).subscribe(
          (response) => {
          
            if(response!==null){
              this.permisoTotal.accesoParametrizacion=response.accesoParametrizacion
              this.permisoTotal.accesoPlazas=response.accesoPlazas
              this.permisoTotal.accesoPreferencias=response.accesoPreferencias
              this.permisoTotal.accesoDistribucionNombrados=response.accesoDistribucionNombrados
              this.permisoTotal.accesoDistribucionTotal=response.accesoDistribucionTotal
              this.permisoTotal.accesoConsolidadoPlazas=response.accesoConsolidadoPlazas
              this.permisoTotal.accesoRemitirCuadroHoras=response.accesoRemitirCuadroHoras
            }else{
              /*NO TIENE ACCESO Y NO ESTA CONFIGURADO EN TABLAS MAESTROS*/
             // this.dataService.SnackBar().msgWarning(MESSAGE_CUADRO_HORA_GENERICO.M02_NO_ACCESS_CONFIG, 'Cerrar..'); 
              this.permisoTotal.accesoParametrizacion=false
              this.permisoTotal.accesoPlazas=false
              this.permisoTotal.accesoPreferencias=false
              this.permisoTotal.accesoDistribucionNombrados=false
              this.permisoTotal.accesoDistribucionTotal=false
              this.permisoTotal.accesoConsolidadoPlazas=false
              this.permisoTotal.accesoRemitirCuadroHoras=false
            }
            callback(true);
          },
          (error: HttpErrorResponse) => {
          console.log('loadCentroTrabajo', error);
          }
          )
          }
          initAccess(acceso:boolean){
            this.permiso.accesoAprobarCuadroHoras=acceso;
            this.permiso.accesoRechazarCuadroHoras= acceso;
            this.permiso.accesoVerificarCuadroHoras= acceso;
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
            console.log("datos load: ", data);
            this.dataService.CuadroHoras().getListaConsolidadoPlaza(data, pageIndex, pageSize).pipe(
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
