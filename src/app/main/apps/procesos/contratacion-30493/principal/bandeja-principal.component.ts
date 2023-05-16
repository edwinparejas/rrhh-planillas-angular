import { mineduAnimations } from "../../../../../../@minedu/animations/animations";
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DataSource } from "@angular/cdk/table";
import { BehaviorSubject, Observable, of } from "rxjs";
import { DataService } from "app/core/data/data.service";
import { catchError, finalize } from "rxjs/operators";
import { CollectionViewer, SelectionModel } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { saveAs } from "file-saver";
import { EstadoEtapaEnum, EtapaFaseEnum, EstadoEtapaProcesoEnum, TablaRolPassport } from '../_utils/constants';
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

@Component({
  selector: 'minedu-bandeja-contratacion',
  templateUrl: './bandeja-principal.component.html',
  styleUrls: ['./bandeja-principal.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPrincipalComponent
implements OnInit, OnDestroy, AfterViewInit
{

  // **************
  tienePermisoAcceso: boolean;
  // **************
  form: FormGroup;
  loading: false;
  export = false;
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
      this.buildForm();
      this.buildPassport();
      this.handleResponsive();
      this.buildSeguridad();
      this.loadCombos();

      this.dataSource = new ContratacionDataSource(this.dataService);
      this.paginator.showFirstLastButtons = true;
      this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
      this.paginator._intl.nextPageLabel = "Siguiente página";
      this.paginator._intl.previousPageLabel = "Página anterior";
      this.paginator._intl.firstPageLabel = "Primera página";
      this.paginator._intl.lastPageLabel = "Última página";

      this.resetForm();
      this.buscarProcesosContratacion(true);
    
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
  }

  handleLimpiar(): void {
      // this.resetForm();

      this.form.reset();
      this.form.get("anio").setValue(new Date().getFullYear());
      // this.form.get("idRegimenLaboral").setValue(RegimenLaboralContratacionCodigoEnum.LEY_30328);
      this.form.get("idRegimenLaboral").setValue("--TODOS--");
      // this.form.get("idTipoProceso").setValue(TipoProcesoContratacionCodigoEnum.Contratacion);
      this.form.get("idTipoProceso").setValue(0);
      this.form.get("idEstadoProceso").setValue(this.opcionFiltro.item.value);

  }

  handleBuscar(): void {
      this.buscarProcesosContratacion(false);
  }

  handleGoPrePublicaciones = (row) => {
      console.log("Principal row send: ", row)
      if (row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE) {
          this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
              panelClass: "modal-iniciar-etapa-dialog",
              width: "400px",
              disableClose: true,
              data: {
                  mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas publicadas?'
              },
          });
  
          this.dialogRef.afterClosed().subscribe((response: any) => {
              if (response == 'I') {
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
                      this.router.navigate(["./prepublicacion/" + row.id_etapa_proceso], {
                          relativeTo: this.route,
                      });
                  });
              } else if (response == 'V') {
                  this.router.navigate(['./ver-prepublicacion/' + row.id_etapa_proceso], {
                      relativeTo: this.route,
                  })
              } else {
                  return;
              }
          });
      } else {
          this.router.navigate(["./prepublicacion/" + row.id_etapa_proceso], {
              relativeTo: this.route,
          });
      }
  };

  handleGoPublicaciones = (row) => {
      this.router.navigate(["./publicacion/" + row.idEtapa], {
          relativeTo: this.route,
      });
  };

  handleGoPostulantes = (row) => {
      this.router.navigate(["./postulante/" + row.idEtapa], {
          relativeTo: this.route,
      });
  };

  handleGoValidarPublicar = (row) => {
      if (row.codigo_estado_desarrollo == EstadoEtapaProcesoEnum.PENDIENTE) {

          this.currentSession = this.dataService.Storage().getInformacionUsuario();
          this.dataService.Contrataciones().VerificarEtapaProcesoAnteriorFinalizado({"idEtapaProceso":row.id_etapa_proceso, "codigoCentroTrabajoMaestro":this.currentSession.codigoSede})
          .subscribe((response:any) =>{
              if(response){
                  // *************************************
                  this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
                      panelClass: "modal-iniciar-etapa-dialog",
                      width: "400px",
                      disableClose: true,
                      data: {
                          mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas publicadas?'
                      },
                  });
          
                  this.dialogRef.afterClosed().subscribe((response: any) => {
                      if (response == 'I') {
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
                      } else if (response == 'V') {
                          this.router.navigate(['./ver-validacion-plazas/' + row.id_etapa_proceso], {
                              relativeTo: this.route,
                          })
                      } else {
                          return;
                      }
                  });
                  // *************************************
              }
              else{
                  this.dataService.Message().msgWarning('"La etapa anterior todavía no ha sido finalizada."', () => {});
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
                  this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
                      panelClass: "modal-iniciar-etapa-dialog",
                      width: "400px",
                      disableClose: true,
                      data: {
                          mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas publicadas?'
                      },
                  });
          
                  this.dialogRef.afterClosed().subscribe((response: any) => {
                      if (response == 'I') {
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
                              this.router.navigate(['./contratacion-directa/bandeja-plazas/' + row.id_etapa_proceso], {
                                  relativeTo: this.route,
                              })
                          });
                      } else if (response == 'V') {
                          this.router.navigate(['./ver-contratacion-directa/bandeja-plazas/' + row.id_etapa_proceso], {
                              relativeTo: this.route,
                          })
                      } else {
                          return;
                      }
                  });
                  // *************************************
              }
              else{
                  this.dataService.Message().msgWarning('"La etapa anterior todavía no ha sido finalizada."', () => {});
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

          this.currentSession = this.dataService.Storage().getInformacionUsuario();
          this.dataService.Contrataciones().VerificarEtapaProcesoAnteriorFinalizado({"idEtapaProceso":row.id_etapa_proceso, "codigoCentroTrabajoMaestro":this.currentSession.codigoSede})
          .subscribe((response:any) =>{
              if(response){
                  // *************************************
                  this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
                      panelClass: "modal-iniciar-etapa-dialog",
                      width: "400px",
                      disableClose: true,
                      data: {
                          mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas publicadas?'
                      },
                  });
          
                  this.dialogRef.afterClosed().subscribe((response: any) => {
                      if (response == 'I') {
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
                              this.router.navigate(['./contratacion-resultados-pun/bandeja-plazas/' + row.id_etapa_proceso], {
                                  relativeTo: this.route,
                              })
                          });
                      } else if (response == 'V') {
                          this.router.navigate(['./ver-contratacion-resultados-pun/bandeja-plazas/' + row.id_etapa_proceso], {
                              relativeTo: this.route,
                          })
                      } else {
                          return;
                      }
                  });
                  // *************************************
              }
              else{
                  this.dataService.Message().msgWarning('"La etapa anterior todavía no ha sido finalizada."', () => {});
              }
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
      this.form.get("anio").setValue(new Date().getFullYear());
      this.form.get("idRegimenLaboral").setValue(RegimenLaboralContratacionCodigoEnum.LEY_30328);
      this.form.get("idTipoProceso").setValue(TipoProcesoContratacionCodigoEnum.Contratacion);
      this.form.get("idEstadoProceso").setValue(this.opcionFiltro.item.value);
  };

  loadCombos = () => {
      this.loadAnio();
      this.loadRegimenLaboral();
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

  loadTipoProceso = () => {
      this.dataService.Contrataciones().getComboTipoProceso().pipe(
          catchError(() => of([])),
          finalize(() => {})
      )
      .subscribe((result: any) => {
          if (result) {
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
          }
      });
  };

  loadEstadoproceso = () => {
      this.dataService.Contrataciones().getComboEstadoDesarrolloEtapaProceso().pipe(
          catchError(() => of([])),
              finalize(() => {})
      )
      .subscribe((result: any) => {
          if (result) {
              console.log("LEP_Result Load Etapa:", result);
              const data = result.map((x) => ({
                  ...x,
                  value: x.id_estado_etapa_proceso,
                  label: `${x.nombre_estado_etapa_proceso}`,
              }));
              console.log("LEP_Data convertido : ",data);
              this.comboLists.listEstadoProceso = data;
              console.log("LEP_ COmobolist:", this.comboLists.listEstadoProceso);
              this.comboLists.listEstadoProceso.unshift({
                  value: this.opcionFiltro.item.value,
                  label: this.opcionFiltro.item.label,
              });
              console.log("LEP_ COmobolist UNSHIFT:", this.comboLists.listEstadoProceso);

          }
      });
  };

  setRequest = () => {
      const anio = this.form.get("anio").value;
      const idRegimenLaboral = this.form.get("idRegimenLaboral").value;
      const idTipoProceso = this.form.get("idTipoProceso").value;
      const idEstadoProceso = this.form.get("idEstadoProceso").value;

      this.request = {
          anio: anio > -1 ? anio : null,
          idRegimenLaboral: idRegimenLaboral > -1 ? idRegimenLaboral : null,
          idTipoProceso: TipoProcesoContratacionCodigoEnum.Contratacion, //idTipoProceso > -1 ? idTipoProceso : null,
          idEstadoEtapa: idEstadoProceso > -1 ? idEstadoProceso : null,
          codigoRolPassport: this.currentSession.codigoRol,
          codigoCentroTrabajo: this.currentSession.codigoSede,
          codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
      };
  };

  handleExportar = () => {
      if (this.dataSource.data.length === 0) {
          this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',
              () => {}
          );
          return;
      }
      
      try{
          var nombreExportar:string = "Desarrollo-Procesos-Contrataciones-"+this.form.get('anio').value+"-"+this.currentSession.nombreSede;
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
                  this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
                      panelClass: "modal-iniciar-etapa-dialog",
                      width: "400px",
                      disableClose: true,
                      data: {
                          mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas?'
                      },
                  });
          
                  this.dialogRef.afterClosed().subscribe((response: any) => {
                      if (response == 'I') {
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
                      } else if (response == 'V') {
                          this.router.navigate(['./ver-contratacion-evaluacion-expediente/bandeja-plazas/' + row.id_etapa_proceso], {
                              relativeTo: this.route,
                          })
                      } else {
                          return;
                      }
                  });
                  // *************************************
              }
              else{
                  this.dataService.Message().msgWarning('"La etapa anterior todavía no ha sido finalizada."', () => {});
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
      this.sharedService.setSharedBreadcrumb("Contratación / Procesos de Contratación Ley 30493");
      this.sharedService.setSharedTitle("Desarrollo de procesos de contratación Ley 30493");
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
      
  };

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
}

export class ContratacionDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex, pageSize, firsTime = false): void {
      this._loadingChange.next(false);
      if (!firsTime) this.dataService.Spinner().show("sp6");
      if (data.anio === null) {
          this._loadingChange.next(false);
          this._dataChange.next([]);
      } else {
          this.dataService.Contrataciones().buscarDesarrolloEtapaProcesoPaginado(data, pageIndex, pageSize).pipe(
              catchError(() => of([])),
              finalize(() => {
                  this._loadingChange.next(false);
                  if (!firsTime) this.dataService.Spinner().hide("sp6");
              })
          )
          .subscribe((result: any) => {
              this._dataChange.next(result || []);
              this.totalregistro = (result || []).length === 0 ? 0 : result[0].total_registros;
              if ((result || []).length === 0) {
                  this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA."', () => {});
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