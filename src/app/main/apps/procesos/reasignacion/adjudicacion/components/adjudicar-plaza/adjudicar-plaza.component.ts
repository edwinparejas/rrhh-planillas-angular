import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { MENSAJES, TipoFormatoPlazaEnum, CodigoCentroTrabajoMaestroEnum, TablaTipoSedeEnum, EtapaFaseEnum } from '../../../_utils/constants';
import { MatPaginator } from "@angular/material/paginator";
import { isArray } from 'lodash';
import { SharedService } from 'app/core/shared/shared.service';
import { ActivatedRoute, Router } from "@angular/router";
import { of, Subject, Observable, BehaviorSubject } from 'rxjs';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { BuscarCentroTrabajoComponent } from "../../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BuscarPlazaComponent } from "../../../components/buscar-plaza/buscar-plaza.component";
import { EtapaResponseModel, CalificacionResponse} from "../../../models/reasignacion.model";
import { SecurityModel } from 'app/core/model/security/security.model';
import { validacionPlazaComponent } from '../validacion-plaza/validacion-plaza.component';

const dutchRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length == 0 || pageSize == 0) { return `0 de ${length}`; }   
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
  
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
  
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }

@Component({
  selector: 'minedu-adjudicar-plaza',
  templateUrl: './adjudicar-plaza.component.html',
  styleUrls: ['./adjudicar-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AdjudicarPlazaComponent implements OnInit, OnDestroy, AfterViewInit {
    spublico = null;
    postulacion = null;
    plaza = null;
    dialogRef: any;
    idCalificacion: number;
    idAdjudicacion: number;
    calificacion = null;
    proceso: any = null;
    etapaProceso: any = null;
    form: FormGroup;
    working = false;
    workingAgregar = false;
    formFecha: FormGroup;
    maxDate = new Date();
    minDate = new Date();
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    currentSession: SecurityModel = new SecurityModel();
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    dataSource: AdjudicarPlazaDataSource | null;
  
    request = {
      anexoCentroTrabajo: null,
      codigoModular: null,
      codigoPlaza: null,
      idPostulacion: null,
      idDesarrolloProceso: null
    };
    private curr = new Date();
    firstNextYearDay = null;
  
    displayedColumns: string[] = [
      'select',
      'codigoModular',
      'centroTrabajo',
      'modalidad',
      'nivelEducativo',
      'areaCurricular',
      'tipoGestion',
      'codigoPlaza',
      'cargo',
      'jornadaLaboral',
      'tipoPlaza',
      'motivoVacancia',
      'fechaVigenciaInicio'
    ];
    selectedRow;
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
    selection = new SelectionModel<any>(false, []);  
    private _unsubscribeAll: Subject<any>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService,
        private sharedService: SharedService,
    ) { this._unsubscribeAll = new Subject(); }
  
    ngOnInit(): void {
        this.idCalificacion = +this.route.snapshot.params.id;
        this.idAdjudicacion = +this.route.snapshot.params.id1;
        this.loadCalificacion();
        this.handleResponsive();
      this.buildForm();
      this.buildGrid();
      this.buildSeguridad();
      setTimeout((_) => {
        // this.firstNextYearDay = new Date(this.curr.getTime() + 60 * 60 * 24 * 6 * 1000);
        this.firstNextYearDay = new Date(this.curr.getFullYear()+1, 0, 1);
        
      });
      this.sharedService.onWorking
        .pipe(
          filter(value => {
            return value !== null;
          }),
          takeUntil(this._unsubscribeAll)
        ).subscribe(working => this.working = working); 
    }

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    obtenerEstadoDesarrolloEtapa = () => {
        var codigoSede = CodigoCentroTrabajoMaestroEnum.MINEDU.toString();
        let codigoTipoSede= this.currentSession.codigoTipoSede;
        if(codigoTipoSede !== TablaTipoSedeEnum.MINEDU){
            codigoSede = this.currentSession.codigoSede;
        }
        this.dataService
            .Reasignaciones()
            .obtenerEstadoDesarrolloEtapaProcesoPorCodigoSede(this.calificacion.idEtapaProceso, codigoSede)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.proceso = response;
                }
            });
    };

    private buildGrid() {
        this.dataSource = new AdjudicarPlazaDataSource(this.dataService, this.sharedService);
        this.buildPaginators(this.paginator);
    }
  
    private buildPaginators(paginator: MatPaginator): void {    
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = 'Registros por página';
        paginator._intl.nextPageLabel = 'Siguiente página';
        paginator._intl.previousPageLabel = 'Página anterior';
        paginator._intl.firstPageLabel = 'Primera página';
        paginator._intl.lastPageLabel = 'Última página';
        paginator._intl.getRangeLabel = dutchRangeLabel;
    }
  
    buildForm() {
      this.form = this.formBuilder.group({
        codigoModular: [null],
        anexoCentroTrabajo: [null],
        codigoPlaza: [null],
        plazas: this.formBuilder.array([], Validators.compose([])),
      });

      this.formFecha = this.formBuilder.group({
        // fechaDesde: [null, Validators.required],
        // fechaHasta: [null, Validators.required],
        fechaInicio: [null, Validators.required]
      });
    }
    
    // configurarFechaFin = () => {
    //     this.formFecha.get("fechaHasta").setValue(null);
    //     this.maxDate = this.formFecha.get("fechaDesde").value;
    //     this.minDate = this.formFecha.get("fechaDesde").value;
    // };

    radioSelected() {
        // this.formFecha.get("fechaDesde").setValue(null);
        // this.formFecha.get("fechaHasta").setValue(null);
        this.formFecha.get("fechaInicio").setValue(null);
        this.dataSource.data.forEach((element) => {
            element.selected = false;
            if (element.idPlaza == this.selectedRow.idPlaza) {
                element.selected = true;
            }
        });
    }
  
    get plazas(): FormArray {
      return this.form.get('plazas') as FormArray;
    }
  
    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    default() {
      this.form.controls['anexoCentroTrabajo'].reset();
      this.form.controls['codigoModular'].reset();
      this.form.controls['codigoPlaza'].reset();
    }
  
    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );
    }

    loadData(pageIndex, pageSize): void {
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }
  
    ngOnDestroy(): void {
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
    }
  
    // private GetPostulacion = () => {
    //   const { idPostulacion, idEtapaProceso } = this.data;
    //   this.dataService.Spinner().show('sp6');
    //   this.dataService
    //     .Reasignaciones()
    //     .getInformacionPostulante({ idPostulacion: idPostulacion, idEtapaProceso: idEtapaProceso })
    //     .pipe(
    //       catchError((e) => of(null)),
    //       finalize(() => { this.dataService.Spinner().hide('sp6'); })
    //     ).subscribe((response: any) => {
    //       if (response) {
    //         const { postulacion, servidorPublico } = response;
    //         this.postulacion = postulacion;
    //         this.spublico = servidorPublico;
    //       } else {
    //         this.dataService.Message().msgWarning('Error al procesar la operación ', () => { });
    //       }
    //     });
    // }

    obtenerCabeceraProcesoEtapa = () => {
        this.dataService
            .Reasignaciones()
            .getDatosProcesoEtapaById(this.calificacion.idEtapaProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                this.etapaProceso = response;   
                this.obtenerEstadoDesarrolloEtapa();            
            });
    };
    
    loadCalificacion = () => {
        const data = {
            idCalificacion: this.idCalificacion
        }
        this.dataService
            .Reasignaciones()
            .getCalificacion(data)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.calificacion = response;
                    this.GetPostulacion();
                    this.obtenerEstadoDesarrolloEtapa();
                    this.obtenerCabeceraProcesoEtapa();
                }
            });
    };

  private GetPostulacion = () => {
    let idPostulacion = this.calificacion.idPostulacion
    let idEtapaProceso = this.calificacion.idEtapaProceso;

    this.dataService.Spinner().show('sp6');
    this.dataService
        .Reasignaciones()
        .getPostulacion(idPostulacion, idEtapaProceso)
        .pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => { this.dataService.Spinner().hide('sp6'); })
        ).subscribe((response: any) => {
            if (response) {
                const { postulacion, servidorPublico, plaza } = response;
                this.postulacion = postulacion;
                this.spublico = servidorPublico;
                this.plaza = plaza;
                this.buscarPlaza();
            } else {
                this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
            }
        });
  }

  configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD)!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError(MENSAJES.MENSAJE_ERROR_SERVIDOR, () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
  
    handleBuscar(): void {
        this.buscarPlaza();
    }

    buscarPlaza = () => {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    };
    handleLimpiar() {
      this.default();
    }

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
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.codigoPlaza.trim());               
            }
        });
    }

    busquedaPlazas = () => {
  
    };


    
  
    // busquedaPlazasDialog = ($event) => {
    //   this.dialogRef = this.materialDialog.open(
    //     BusquedaPlazaComponent,
    //     {
    //       panelClass: 'buscar-plaza-form',
    //       disableClose: true,
    //       data: {
    //         action: 'busqueda',
    //       },
    //     }
    //   );
  
    //   this.dialogRef.afterClosed().subscribe((resp) => {
    //     if (resp != null) {
    //       this.form.get('codigoPlaza').setValue(resp.codigoPlaza);
    //     }
    //   });
    // };
  
    buscarCentroTrabajoDialog(event) {
    //   const codigoCentroTrabajo = this.form.get('codigoModular').value;
    //   if (codigoCentroTrabajo) {
    //     this.busquedaCentroTrabajo(event);
    //     return;
    //   }
    //   this.handleCentroTrabajoDialog([]);
    }
  
    busquedaCentroTrabajo(event) {
    //   event.preventDefault();
    //   const codigoCentroTrabajo = this.form.get('codigoModular').value;
  
    //   if (!codigoCentroTrabajo) {
    //     this.dataService.Message().msgWarning('DEBE INGRESAR UN CÓDIGO MODULAR PARA REALIZAR LA BÚSQUEDA.', () => {
    //     });
    //     return;
    //   }
    //   if (codigoCentroTrabajo.length < 6 || codigoCentroTrabajo.length > 7) {
    //     this.dataService.Message().msgWarning('CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON (6 a 7) DÍGITOS.', () => {
    //     });
    //     return;
    //   }
  
    //   const data = {
    //     codigoCentroTrabajo: codigoCentroTrabajo.trim(),
    //     codigoNivelInstancia: parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia)
    //   };
  
    //   this.dataService.Spinner().show('sp6');
    //   this.dataService.Rotacion().getListCentroTrabajo(data, 1, 10).pipe(
    //     catchError((e) => of(null)),
    //     finalize(() => {
    //       this.dataService.Spinner().hide('sp6');
    //     })
    //   ).subscribe((response: any) => {
    //     if (response) {
    //       const data: any[] = response;
    //       if (data.length === 1) {
    //         this.setCentroTrabajo(data[0]);
    //       } else if (data.length > 1) {
    //         this.handleCentroTrabajoDialog(data);
    //         this.dataService.Message().msgAutoInfo('SE ENCONTRÓ MÁS DE UN REGISTRO PARA EL CÓDIGO MODULAR INGRESADO, SELECCIONE UN REGISTRO', 3000, () => {
    //         });
    //       } else {
    //         this.dataService.Message().msgWarning('NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS', () => {
    //         });
    //       }
    //     } else {
    //       this.dataService.Message().msgError('OCURRIERON ALGUNOS PROBLEMAS AL BUSCAR EL CENTRO DE TRABAJO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS.', () => {
    //       });
    //     }
    //   });
    }
  
    // private handleCentroTrabajoDialog(registros: any[]) {
    //   this.dialogRef = this.materialDialog.open(
    //     BusquedaCentroTrabajoComponent,
    //     {
    //       panelClass: 'buscar-centro-trabajo-form',
    //       width: '1300px',
    //       disableClose: true,
    //       data: {
    //         registrado: false,
    //         centrosTrabajo: registros,
    //         permiteBuscar: registros.length === 0
    //       },
    //     }
    //   );
  
    //   this.dialogRef.afterClosed().subscribe((response) => {
    //     if (!response) {
    //       return;
    //     }
    //     this.setCentroTrabajo(response);
    //   });
    // }
  
    private setCentroTrabajo = (data) => {
      this.form.patchValue({ codigoModular: data.codigoCentroTrabajo, anexoCentroTrabajo: data.anexoCentroTrabajo });
    };
  
    private setRequest = () => {
      this.request = {
        anexoCentroTrabajo: this.form.get('anexoCentroTrabajo').value,
        codigoPlaza: this.form.get('codigoPlaza').value,
        codigoModular: this.form.get('codigoModular').value,
        idPostulacion: this.postulacion.idPostulacion,         
        idDesarrolloProceso:  this.etapaProceso.codigoEtapaFase == EtapaFaseEnum.ETAPA_REGIONAL_FASE_1 ? this.proceso.idDesarrolloProceso-1 : this.proceso.idDesarrolloProceso
      };
    };
  
    // handleCancelar(event: boolean = false) {
    //   this.matDialogRef.close(event);
    // }

    handleRetornar = () => {
        this.router.navigate(
            ["../../../adjudicacion/" + this.calificacion?.idEtapaProceso+'/'+ this.calificacion?.idAlcanceProceso],{ relativeTo: this.route }
        );

    };
  
    handleAdjudicar = () => {
        if (!this.formFecha.valid) {
            this.dataService
                .Message()
                .msgWarning(MENSAJES.MENSAJE_SELECCIONAR_MINIMO_UN_REGISTRO, () => {});
            return;
        }

      const form = this.formFecha.value;
  
      if (!form.fechaInicio) {
        this.dataService.Message().msgWarning('INGRESE LA FECHA INICIO DE VIGENCIA DE LA PLAZA A ADJUDICAR', () => {
        });
        return;
      }
  
      this.dataService.Spinner().show('sp6');
      this.dataService
          .Reasignaciones()
          .getValidarActualizacionPlaza({idPlaza: this.selectedRow.idPlaza, idEtapaProceso: this.calificacion.idEtapaProceso })
          .pipe(
              catchError((e) => { 
                  const { developerMessage } = e;
                  this.dataService.Message().msgWarning(developerMessage, () => { });
                  return of(null);
              }),
              finalize(() => { this.dataService.Spinner().hide('sp6'); })
          ).subscribe((response: any) => {
              var tieneDiferencias = (response.listaDiferencia.filter(f=>f.esDiferente==true).length > 0);
              if(tieneDiferencias === true){
                 this.handleValidarPlaza(this.selectedRow, response);
              }
              else {
                  
                const data = {
                    idAdjudicacion: this.idAdjudicacion,
                    idEtapaProceso: this.calificacion.idEtapaProceso,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso,
                    idPostulacion: this.calificacion.idPostulacion,
                    idPlaza: this.selectedRow.idPlaza,
                    idPlazaLiberada: this.plaza.idPlaza, 
                    idPlazaReasignacionDetalle: this.selectedRow.idPlazaReasignacionDetalle,
                    vigenciaInicioContrato: form.fechaInicio,
                    usuarioCreacion: this.currentSession.numeroDocumento
                }
                this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA ADJUDICAR LA PLAZA?", () => {
                    this.workingAgregar = true;
                    this.dataService.Spinner().show('sp6');
                    this.dataService
                    .Reasignaciones()
                    .adjudicar(data)
                    .pipe(
                        catchError((e) => of(null)),
                        finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingAgregar = false; })
                    ).subscribe((response: any) => {
                        if (response) {
                            if(response > 0){
                                this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { 
                                    this.handleRetornar();
                                });
                            }
                        } else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
                        }
                    });
                }, () => { });
              }
          });
  
    }
    
    handleValidarPlaza  = (row, response) => {
        this.dialogRef = this.materialDialog.open(
            validacionPlazaComponent,
            {
                panelClass: 'minedu-validacion-plaza',
                width: '1100px',
                disableClose: true,
                data: {
                    idAdjudicacion: row.idAdjudicacion,
                    idEtapaProceso: this.calificacion.idEtapaProceso,
                    idCalificacion: row.idCalificacion,
                    idPlaza: row.idPlaza,
                    response: response
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response) => {
            if (!response) {
                return;
            }
        });
    }
  
  }


  export class RegistroPlaza {

    totalRegistros: number;
    idPlaza: number;
    idCentroTrabajo: number;
    numeroRegistro: number;
    codigoModular: string;
    centroTrabajo: string;
    modalidad: string;
    nivelEducativo: string;
    tipoGestion: string;
    codigoPlaza: string;
    cargo: string;
    grupoOcupacional: string;
    categoriaRemunerativa: string;
    tipoPlaza: string;
    jornadaLaboral: string;
    motivoVacancia: string;
    fechaInicioVigencia?: Date;

    static asFormGroup(registro: RegistroPlaza): FormGroup {
        const fg = new FormGroup({
            totalRegistros: new FormControl(registro.totalRegistros),
            idPlaza: new FormControl(registro.idPlaza),
            idCentroTrabajo: new FormControl(registro.idCentroTrabajo),
            numeroRegistro: new FormControl(registro.numeroRegistro),
            codigoModular: new FormControl(registro.codigoModular),
            centroTrabajo: new FormControl(registro.centroTrabajo),
            modalidad: new FormControl(registro.modalidad),
            nivelEducativo: new FormControl(registro.nivelEducativo),
            tipoGestion: new FormControl(registro.tipoGestion),
            codigoPlaza: new FormControl(registro.codigoPlaza),
            cargo: new FormControl(registro.cargo),
            grupoOcupacional: new FormControl(registro.grupoOcupacional),
            categoriaRemunerativa: new FormControl(registro.categoriaRemunerativa),
            tipoPlaza: new FormControl(registro.tipoPlaza),
            jornadaLaboral: new FormControl(registro.jornadaLaboral),
            motivoVacancia: new FormControl(registro.motivoVacancia),
            fechaInicioVigencia: new FormControl(registro.fechaInicioVigencia),
        });
        return fg;
    }
}

export class AdjudicarPlazaDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        // this._loadingChange.next(false);
        this.dataService.Spinner().show('sp6');
        // if (data.anio === null && data.idServidorPublico === null) {
        //     this._loadingChange.next(false);
        //     this._dataChange.next([]);
        // } else {
            this.dataService
                .Reasignaciones()
                .getAdjudicacionPlazaGrid(data, pageIndex, pageSize)
                .pipe(
                    catchError((e) => {
                        const { developerMessage } = e;
                        this.dataService.Message().msgWarning(developerMessage, () => { });
                        return of(null);
                    }),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide('sp6');
                        this.sharedService.sendWorking(false);
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        if (response.length == 0) {
                            this.gridResultMessage();
                        } else {
                            this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistros;
                            this._dataChange.next(response || []);
                        }
                    } else {
                        this.gridResultMessage(false);
                    }
                });
        }

    private gridResultMessage = (emptyResult: boolean = true) => {
        this.totalregistro = 0;
        this._dataChange.next([]);
        if (emptyResult) {
            this.dataService.Message().msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA, () => {
            });
        } else {
            this.dataService.Message().msgWarning(MENSAJES.MENSAJE_PROBLEMAS_INFORMACION_CRITERIOS_BUSQUEDA, () => { });
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