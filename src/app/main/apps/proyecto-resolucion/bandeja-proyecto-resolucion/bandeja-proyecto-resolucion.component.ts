import {Component,OnInit,ViewEncapsulation, OnDestroy,ViewChild,AfterViewInit,} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { BehaviorSubject, of, Observable, forkJoin } from "rxjs";
import { SelectionModel,DataSource,CollectionViewer,} from "@angular/cdk/collections";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { catchError, finalize, map } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { DataService } from "app/core/data/data.service";
import { saveAs } from "file-saver";
import * as moment from "moment";
import { PASSPORT_MESSAGE, PROYECTO_RESOLUCION_MESSAGE } from "app/core/model/message";
import { StorageService } from "app/core/data/services/storage.service";
import { MISSING_TOKEN } from "app/core/model/types";
import { MatPaginatorIntlCro } from 'app/core/data/resolvers/mat-paginator-intl-cro';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { descargarExcel } from "app/core/utility/functions";
import { MatGridTileHeaderCssMatStyler } from "@angular/material/grid-list";
import { CentroTrabajoModel, EstadoProyectoResolucionEnum, GenerarProyectoResolucion, GenerarProyectoResolucionRabbit } from "../models/proyectoResolucion.model";
import { fechas } from "../models/fechas.model";
import { ModalMotivoEliminacionComponent } from "../Components/modal-motivo-eliminacion/modal-motivo-eliminacion.component";
import { CODIGO_SISTEMA, ResultadoOperacionEnum, TipoDocumentoIdentidadEnum } from "../_utils/constants";
import { VistaProyectoComponent } from "../Components/editar-proyecto-resolucion/editar-proyecto-resolucion.component";
import { EliminarProyectoResolucionComponent } from "../Components/eliminar-proyecto-resolucion/eliminar-proyecto-resolucion.component";
import { DocumentViewerComponent } from "../../components/document-viewer/document-viewer.component";
import { BuscarCentroTrabajoComponent } from "../Components/buscador-centro-trabajo/buscador-centro-trabajo.component";
import { BuscadorCodigoPlazaComponent } from "../Components/buscador-codigo-plaza/buscador-codigo-plaza.component";
import { BuscadorServidorPublicoComponent } from "../Components/buscador-servidor-publico/buscador-servidor-publico.component";
import { SecurityModel } from "app/core/model/security/security.model";
import { EntidadSedeService } from "../Services/entidad-sede.service";

@Component({
    selector: "minedu-bandeja-proyecto-resolucion",
    templateUrl: "./bandeja-proyecto-resolucion.component.html",
    styleUrls: ["./bandeja-proyecto-resolucion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
    providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }],
})
export class BandejaProyectoResolucionComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    loading: false;
    cargaFormIni = false;
    totalRegistros: number = 0;
    export = false;
    now = new Date();
    textComboDefault = "TODOS";
    
    Acceso:AccesoUsuario={
        ELIMINAR_PROYECTO_RESOLUCION:false
    };
    comboLists = {
        listAnio: [],
        listTipoResolucion: [],
        listRegimenLaboral: [],
        listGrupoAccion: [{ label: this.textComboDefault, value: 0 }],
        listMotivoAccion: [{ label: this.textComboDefault, value: 0 }],
        listAccion: [{ label: this.textComboDefault, value: 0 }],
        listEstado: [],
        listMandatoJudicial: [
            { label: this.textComboDefault, value: 0 },
            { label: "SI", value: 1 },
            { label: "NO", value: 2 },
        ],
        listTipoDocumento: [],
        
    };
    selectedDoc = 0;
    dataSource: ProyectoResolucionDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    dialogRef: any;
    mostrarFuncionalidad: boolean = false;
    mostrarInstancia: boolean = false;
    mostrarSubinstancia: boolean = false;
    
    minLengthnumeroDocumentoIdentidad: number;
    maxLengthnumeroDocumentoIdentidad: number;
    numeroProyectoLen:number=6;
    codigoPlazaLen: number=12;
    codigoModularLenMin: number=6;
    codigoModularLenMax: number=7;

    request = {
        anio: null,
        idTipoResolucion: null,
        numeroProyecto: null,
        idRegimenLaboral: null,
        idGrupoAccion: null,
        idAccion: null,
        idMotivoAccion: null,
        esMotivoJudicial: null,
        idEstado: null,
        idServidorPublico: null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        fechaInicio: null,
        fechaFin: null,
        codigoCentroTrabajo: null,
        codigoSistema: null,
        idNivelInstancia: null,
        idDre: null,
        idUgel: null,
        idOtraInstancia: null,
        idInstancia : null,
        idSubInstancia : null,
        butonAccion:false
    };

    data: any = {
        idNivelInstancia: null,
        idEntidadSede: null,
        idOtraInstancia: null,
        idDre: null,
        idUgel: null,
        idRolPassport: null,
        codigoRolPassport: null,
        descripcionRolPassport: null,
    };

    idServidorPublicoSelected: number = 1;
    displayedColumns: string[] = [];

    hasPermisionEditar: boolean = false;
    estadoProyectoResolucionEnum = EstadoProyectoResolucionEnum;
    datosCentroTrabajo: CentroTrabajoModel = null;
    selectedDocu = 0;
    idDNI: number;

    debeOcultarMandatoJudicial: boolean = false;

    private regimenesLaborales: any[] = [];
    private regimenSeleccionado: any;
    
    dialogRefPreview: any;

    FechaAnioMax=fechas.obtenerFechaMasAnios(this.now,1);
    fechaInicioAnio=fechas.obtenerFechaInicioDelAnioIngresado(this.now);
    fechaInicioAnioHasta=fechas.obtenerFechaInicioDelAnioIngresado(this.now);
    fechaFinAnio=fechas.obtenerFechaFinDelAnioIngresado(this.FechaAnioMax);
    currentSession: SecurityModel = new SecurityModel();

    constructor(
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private storageService: StorageService,
        private materialDialog: MatDialog,
        private router: Router,
        private entidadSedeService: EntidadSedeService
    ) { }

    private componerColumnasGrid = () => {
        const primerasColumnasFijas = [
            "registro",
            "tipoResolucion",
            "numeroProyecto",
            "fechaProyecto",
            "regimenLaboral",
            "grupoAccion",
            "accion",
            "motivoAccion",
        ];

        const ultimasColumnasFijas = ["estado", "acciones"];

        if (!this.debeOcultarMandatoJudicial) {
            primerasColumnasFijas.push("mandatoJudicial");
        }

        this.displayedColumns = [
            ...primerasColumnasFijas,
            ...ultimasColumnasFijas,
        ];
    };

    ngOnInit(): void {
        this.cargarTodo();
  
        setTimeout(() => {
            this.buscarProyectosResolucion();
        }, 2000);

    }

    private async cargarTodo() {

        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.setIdsRolCentroTrabajo();

        this.buildData();

        this.accesousuario(); 
        this.componerColumnasGrid();
        this.dataSource = new ProyectoResolucionDataSource(this.dataService);

        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';

        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
    }
    private async setIdsRolCentroTrabajo() {
        this.currentSession.codigoSede=this.entidadSedeService.entidadSede.codigoSede;
        this.currentSession.codigoTipoSede=this.entidadSedeService.entidadSede.codigoTipoSede;
    }
    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.buscarProyectosResolucion(true)
        );
        this.cargaFormIni = true;
    }

    ngOnDestroy(): void { }

    buildData(): void {
        this.form.get("idGrupoAccion").setValue(0);
        this.form.get("idMotivoAccion").setValue(0);
        this.form.get("idAccion").setValue(0);
        this.form.get("idMandatoJudicial").setValue(0);
        
        const data={
            codigoSede: this.currentSession.codigoSede,
            activo:true
        }

        forkJoin(
            [this.dataService.ProyectosResolucion().getAnios(),
            this.dataService.ProyectosResolucion().getComboTiposResolucion(),
            this.dataService.ProyectosResolucion().getComboEstadosResolucion(),
            this.dataService.ProyectosResolucion().obtenerCentroTrabajoPorCodigoSede(data),            
            this.dataService.ProyectosResolucion().getComboTipodocumento(), 
            // this.dataService.ProyectosResolucion().listarInstancia(true),
            ]
        ).pipe(
            catchError((e) => of(e)),
            finalize(() => { this.dataService.Spinner().hide('sp6'); })
          ).subscribe( async (response: any) => {
                this.dataService.Spinner().show("sp6");
                this.loadRegimenLaboral();
                this.setAnios( await response[0]);
                this.setTiposResolucion(await response[1]);
                this.setEstadosResolucion( await response[2]);
                this.setEntidadPassport(await response[3]);
                this.setTiposDocumentoIdentidad(await response[4]);
                

                // this.instancias = await response[6];     
                
                // switch (parseInt(this.storageService.passport.idNivelInstancia)) {
                //     case TablaCatalogoNivelInstancia.MINEDU: {
                //         const idInstancia = this.storageService.passport.idNivelInstancia + '-' + this.storageService.passport.idOtraInstancia;
                //         this.form.controls['idInstancia'].setValue(idInstancia);
                //         this.form.controls['idInstancia'].enable();
                //         this.mostrarSubinstancia = true;
                //         break;
                //     }
                //     case TablaCatalogoNivelInstancia.DRE: {
                //         const idInstancia = this.storageService.passport.idNivelInstancia + '-' + this.storageService.passport.idDre;
                //         this.form.controls['idInstancia'].setValue(idInstancia);
                //         this.form.controls['idInstancia'].disable();
                //         this.mostrarSubinstancia = true;                     
                //         break;
                //     }
                //     case TablaCatalogoNivelInstancia.UGEL: {
                //         const idInstanciax = TablaCatalogoNivelInstancia.DRE + '-' + this.storageService.passport.idDre;                          
                //         this.form.controls['idInstancia'].setValue(idInstanciax);
                //         this.form.controls['idInstancia'].disable();
                                                    
                //         // const idSubinstanciax = this.storageService.passport.idNivelInstancia + "-" + this.storageService.passport.idUgel;
                        
                //         // setTimeout(() => { this.form.controls["idSubinstancia"].setValue(idSubinstanciax);}, 7000);
                //         this.form.controls["idSubinstancia"].disable();
                //         this.mostrarSubinstancia = true;
                //         break;
                //     }
                // }
            });
           
           
    }

    private validMotivoEliminacion(detalle){
        
        this.dialogRef = this.materialDialog.open(
            ModalMotivoEliminacionComponent,
            {
                panelClass: "modal-motivo-eliminacion-dialog",
                width: '480px',
                disableClose: true,
                data: {
                    detalleMotivo: detalle.motivoEliminacion
                },
            }
        ).afterClosed().subscribe((response: any) => {
            
        });
    }
    
    accesousuario(){
        
        const data={
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }
        
        this.dataService
            .ProyectosResolucion()
            .obtenerAccesoUsuario(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response) => {   
            this.Acceso = {
                ELIMINAR_PROYECTO_RESOLUCION:response.eliminaR_PROYECTO_RESOLUCION
            };
        });
    }

    mostrarOpciones(instancia, subinstancia) {
        this.mostrarInstancia = instancia;
        this.mostrarSubinstancia = subinstancia;
    }

    // listarSubInstancias(idInstancia: any) {
        
    //     var instancia = idInstancia.split("-")[0];
        
    //     if (instancia == TablaCatalogoNivelInstancia.DRE) {
    //         this.dataService
    //         .ProyectosResolucion()
    //         .listarSubinstancia(idInstancia.split("-")[1], true)
    //         .pipe(
    //             catchError((e) => of(e)),
    //             map((response: any) => response)
    //         )
    //         .subscribe((response) => {
    //             if (response) {
    //                 this.subInstancias = response;  
    //                 this.form.patchValue({idSubinstancia: "", });
    //                 const idSubinstanciax = this.storageService.passport.idNivelInstancia + "-" + this.storageService.passport.idUgel;
    //                 if(this.storageService.passport.idUgel) this.form.controls["idSubinstancia"].setValue(idSubinstanciax);
    //                 else this.form.patchValue({idSubinstancia: "", });
    //                 this.data.idInstancia = idInstancia.split("-")[1];
    //             } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
    //                 this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
    //             }
    //         });
    //     }

    //     if (instancia == TablaCatalogoNivelInstancia.MINEDU)
    //         this.mostrarSubinstancia = false;
    // }

    buildForm(): void {
        const anio = new Date();
        this.form = this.formBuilder.group({
            anio: [this.now],
            idTipoResolucion: [null],
            numeroProyecto: [null,[Validators.minLength(this.numeroProyectoLen),Validators.maxLength(this.numeroProyectoLen)]],
            idRegimenLaboral: [null],
            idGrupoAccion: [null],
            idAccion: [null],
            idMotivoAccion: [null],
            idMandatoJudicial: [null],
            idEstado: [null],

            codigoPlaza: [null, [Validators.maxLength(this.codigoPlazaLen),Validators.minLength(this.codigoPlazaLen)]],

            fechaDesde: [null],
            fechaHasta: [null],

            codigoCentroTrabajo: [null, [Validators.maxLength(this.codigoModularLenMax),Validators.minLength(this.codigoModularLenMin)]],
            idServidorPublico: [null],
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            idInstancia: [""],
            idSubinstancia: [""],
        });

        this.form
            .get("idTipoDocumentoIdentidad")
            .valueChanges.subscribe((value) => {
                this.form.get("idServidorPublico").setValue(null);
            });

        this.form
            .get("numeroDocumentoIdentidad")
            .valueChanges.subscribe((value) => {
                this.form.get("idServidorPublico").setValue(null);
            });

        this.form.get("fechaDesde").valueChanges.subscribe((value) => {
            this.form.get("fechaHasta").setValue(null);
            if (value) {
                this.fechaInicioAnioHasta = value;
            } else {
                this.fechaInicioAnioHasta = fechas.obtenerFechaInicioDelAnioIngresado(this.now);
            }
        });

        // this.form.get("fechaHasta").valueChanges.subscribe((value) => {
        //     if (value) {
        //         this.fechaFinAnio = value;
        //     } else {
        //         this.fechaFinAnio = fechas.obtenerFechaFinDelAnioIngresado(this.now);
        //     }
        // });

        this.form.get("idRegimenLaboral").valueChanges.subscribe((value) => {
            if (value) {
                this.loadGruposAccion(value);
                this.form.controls.idGrupoAccion.enable();
            } else {
                this.limpiarRegimenSeleccionado();
                this.comboLists.listGrupoAccion = [
                    { label: this.textComboDefault, value: 0 },
                ];
                this.form.controls.idGrupoAccion.disable();
            }
        });

        this.form.get("idGrupoAccion").valueChanges.subscribe((value) => {
            if (value) {
                this.loadAcciones(value);
                this.form.controls.idAccion.enable();
            } else {
                this.comboLists.listAccion = [
                    { label: this.textComboDefault, value: 0 },
                ];
                this.form.controls.idAccion.disable();
            }
        });

        this.form.get("idAccion").valueChanges.subscribe((value) => {
            if (value) {
                this.loadMotivosAccion(
                    this.form.get("idGrupoAccion").value,
                    value
                );
                this.form.controls.idMotivoAccion.enable();
            } else {
                this.comboLists.listMotivoAccion = [
                    { label: this.textComboDefault, value: 0 },
                ];
                this.form.controls.idMotivoAccion.disable();
            }
        });

        this.form.get("codigoCentroTrabajo").valueChanges.subscribe((value) => {
            this.limpiarFiltroCentroDeTrabajo();
        });

        // this.form.get("idInstancia").valueChanges.subscribe((value) => {
        //     if (value !== null && value !== undefined && value !== "") {
        //         const data = this.instancias.find((x) => x.idInstancia === value);
        //         var idEntidadSedes = parseInt(value.split("-")[0].toString());
        //         var idInstancia = data.idInstancia;
               
        //         if (idEntidadSedes == TablaCatalogoNivelInstancia.MINEDU)
        //             this.mostrarOpciones(true, false);
        //         else
        //             this.mostrarOpciones(true, true);

        //         this.listarSubInstancias(idInstancia);
        //     } else {
        //         this.mostrarOpciones(true, false);
        //     }
        // });

        
        this.form.get("numeroDocumentoIdentidad").disable();
    }

    handleLimpiar(): void {
        this.form.reset();
        this.form.get("anio").setValue(new Date());
        this.form.get("idTipoResolucion").setValue(0);
        this.form.get("idRegimenLaboral").setValue(0);
        this.form.get("idGrupoAccion").setValue(0);
        this.form.get("idAccion").setValue(0);
        this.form.get("idMotivoAccion").setValue(0);
        this.form.get("idMandatoJudicial").setValue(0);
        this.form.get("idEstado").setValue(0);
        this.form.get("codigoCentroTrabajo").setValue(null);
        this.form.get("idTipoDocumentoIdentidad").setValue(0);
        this.form.get("numeroDocumentoIdentidad").setValue(null);
        this.form.get("idServidorPublico").setValue(null);
        this.form.get("codigoPlaza").setValue(null);

        this.form.get("numeroDocumentoIdentidad").disable();
        this.limpiarFiltroCentroDeTrabajo();
        this.buscarProyectosResolucion();        
        
    }

    handleBuscar(): void {
        
        this.buscarProyectosResolucion(true);
    }

    handleExportar = () => {
        
        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService
            .ProyectosResolucion()
            .exportarBandejaProyectoResolucionExcel(this.request).pipe(
                catchError((e) => of()),
                finalize(() => {                    
                    this.dataService.Spinner().hide("sp6");
                    this.export = false;
                })
            )
            .subscribe((response) => {
                // const nombreFile: string =
                //     "Proyecto de Resoluciones_" +
                //     anio +
                //     "_" +
                //     moment(new Date()).format("yyyy-MM-DD") +
                //     ".xlsx";
                // this.dataService
                //     .ProyectosResolucion()
                //     .downloadFile(response, nombreFile);

                const dd = this.now.getDate();
                const mm = this.now.getMonth() + 1;
                const yyyy = this.now.getFullYear();
                let nombreExcel = `Proyecto de Resoluciones_${this.request.anio}_${dd}_${mm}_${yyyy}.xlsx`;

                descargarExcel(response.toString(), nombreExcel);                
            });
    };

    handleGenerarProyecto = () => {
        const generarProyectoResolucion: GenerarProyectoResolucion = {
            idTipoResolucion: 1,
            codigoFormatoResolucion: 1,
            codigoSistema: CODIGO_SISTEMA,
            usuarioCreacion: "ADMIN",
            codigoPlaza: "001",
            acciones: [
                {
                    idRegimenLaboral: 1,
                    idGrupoAccion: 1,
                    idAccion: 1,
                    idMotivoAccion: 1,
                    detalleAccion: JSON.stringify(
                        {
                            CODIGO_PLAZA$2: "15EV02031468",
                            CODIGO_MODULAR$2: "14206345",
                            CENTRO_TRABAJO$2: "I.E. Nº 20503",
                            NIVEL_EDUCATIVO$2: "PRIMARIA",
                            MODALIDAD_EDUCATIVA$2: "EDUCACIÓN BÁSICA REGULAR",
                            GESTION$2: "ESTATAL",
                            TIPO_CARGO$2: "DIRECTOR",
                            CARGO$2: "SUB DIRECTOR",
                            CARGO_CONFIANZA$2: "NO",
                            JORNADA_LABORAL$2: 40,
                            FECHA_VIGENCIA_INICIO$2: new Date(
                                "2020-03-01T00:00:00"
                            ),
                            FECHA_VIGENCIA_FIN$2: new Date(
                                "2020-12-31T00:00:00"
                            ),
                            CODIGO_PLAZA$3: "15EV02031468",
                            CODIGO_MODULAR$3: "493544",
                            CENTRO_TRABAJO$3: "I.E. 20503",
                            NIVEL_EDUCATIVO$3: "SECUNDARIA",
                            MODALIDAD_EDUCATIVA$3: "EDUCACIÓN BÁSICA REGULAR",
                            GESTION$3: "ESTATAL",
                            TIPO_CARGO$3: "DIRECTOR",
                            CARGO$3: "SUB DIRECTOR",
                            CARGO_CONFIANZA$3: "NO",
                            JORNADA_LABORAL$3: "40 HORAS",
                            FECHA_VIGENCIA_INICIO$3: new Date(
                                "2020-06-01T00:00:00"
                            ),
                            FECHA_VIGENCIA_FIN$3: new Date(
                                "2020-12-31T00:00:00"
                            ),
                        },
                        null,
                        "\t"
                    ),
                },
                {
                    idRegimenLaboral: 2,
                    idGrupoAccion: 1,
                    idAccion: 2,
                    idMotivoAccion: 1,
                    detalleAccion: JSON.stringify(
                        {
                            CODIGO_MODULAR$5: "14206345",
                            CENTRO_TRABAJO$5: "I.E. Nº 20503",
                            NIVEL_EDUCATIVO$5: "PRIMARIA",
                            MODALIDAD_EDUCATIVA$5: "EDUCACIÓN BÁSICA REGULAR",
                            GESTION$5: "ESTATAL",
                            TIPO_CARGO$5: "DIRECTOR",
                            CARGO$5: "SUB DIRECTOR",
                            CARGO_CONFIANZA$5: "NO",
                            JORNADA_LABORAL$5: 40,
                            FECHA_VIGENCIA_INICIO$5: new Date(
                                "2020-03-01T00:00:00"
                            ),
                            TIPO_CARGO$6: "DIRECTOR",
                            CARGO$6: "SUB DIRECTOR",
                            FECHA_VIGENCIA_INICIO$6: new Date(
                                "2020-06-01T00:00:00"
                            ),
                        },
                        null,
                        "\t"
                    ),
                },
            ],
        };

        this.dataService.Message().msgConfirm(
            "¿ESTA SEGURO DE QUE DESEA GENERAR EL PROYECTO?",
            () => {
                this.dataService
                    .ProyectosResolucion()
                    .GenerarProyectoResolucion(generarProyectoResolucion)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => { })
                    )
                    .subscribe((response) => {
                        if (response) {
                            this.dataService
                                .Message()
                                .msgInfo(
                                    '"OPERACIÓN REALIZADA DE FORMA EXITOSA."',
                                    () => { }
                                );
                            this.handleLimpiar();
                        } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning('"'+response.messages[0]+'"', () => { });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                            this.dataService.Message().msgWarning('"'+response.messages[0]+'"', () => { });
                        } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService
                                .Message()
                                .msgError(
                                    '"OCURRIERON ALGUNOS PROBLEMAS AL GENERAR EL PROYECTO DE RESOLUCIÓN, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."',
                                    () => { }
                                );
                        }
                    });
            },
            () => { }
        );
    };

    handleGenerarProyectoTransaccionAdecuacion = () => {
        const generarProyectoResolucion: GenerarProyectoResolucionRabbit = {
            codigoTipoResolucion: 1,
            codigoSistema: CODIGO_SISTEMA,
            codigoRegimenLaboral: 1,
            codigoGrupoAccion: 1,
            codigoAccion: 4,
            codigoMotivoAccion: 190,
            codigoDre: null,
            codigoUgel: "150209",
            usuarioCreacion: "ADMIN",
            acciones: [
                {
                    codigoPlaza: "131131812723",
                    codigoRegimenLaboral: 1,
                    codigoGrupoAccion: 1,
                    codigoAccion: 4,
                    codigoMotivoAccion: 190,
                    codigoAccionGrabada: 1,
                    esLista: false,
                    esMandatoJudicial: null,
                    detalleAccion: JSON.stringify(
                        {
                            CODIGO_PLAZA_SEL: "131131812723",
                            CENTRO_TRABAJO_SEL:
                                'IE N°20503 "Maria Reiche Newman"',
                            NIVEL_EDUCATIVO_SEL: "PRIMARIA",
                            MODALIDAD_EDUCATIVA_SEL: "EBR",

                            TIPO_CARGO_ORIG: "DIRECTOR",
                            CARGO_ORIG: "PROFESOR COORDINADOR",
                            JORNADA_LABORAL_ORIG: "30 HORAS",
                            VIGENCIA_ORIG: "A PARTIR DEL 01/03/2014",

                            TIPO_CARGO_DEST: "DIRECTOR",
                            CARGO_DEST: "PROFESOR",
                            JORNADA_LABORAL_DEST: "30 HORAS",
                            VIGENCIA_DEST: "A PARTIR DEL 01/03/2014",
                        },
                        null,
                        "\t"
                    ),
                },
            ],
            documentosSustento: [
                {
                    codigoTipoDocumentoSustento: 2,
                    codigoTipoFormatoSustento: 1,
                    numeroDocumentoSustento: "603-2020-GRA-GRE-D.UGELL.J",
                    entidadEmisora: "",
                    fechaEmision: new Date(),
                    numeroFolios: 1,
                    sumilla: "603-2020-GRA-GRE-D.UGELL.J",
                    codigoDocumentoSustento: "603-2020-GRA-GRE-D.UGELL.J",
                },
            ],
        };

        this.dataService.Message().msgConfirm(
            "¿ESTA SEGURO DE QUE DESEA GENERAR EL PROYECTO?",
            () => {
                this.dataService
                    .ProyectosResolucion()
                    .GenerarProyectoResolucion(generarProyectoResolucion)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => { })
                    )
                    .subscribe((response) => {
                        if (response) {
                            this.dataService
                                .Message()
                                .msgAutoSuccess(
                                    '"OPERACIÓN REALIZADA DE FORMA EXITOSA."',
                                    3000,
                                    () => { }
                                );
                            this.handleLimpiar();
                        } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning('"'+response.messages[0]+'"', () => { });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                            this.dataService.Message().msgWarning('"'+response.messages[0]+'"', () => { });
                        } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService
                                .Message()
                                .msgError(
                                    '"OCURRIERON ALGUNSO PROBLEMAS AL GENERAR EL PROYECTO DE RESOLUCIÓN, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."',
                                    () => { }
                                );
                        }
                    });
            },
            () => { }
        );
    };

    handleVistaProyecto = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(VistaProyectoComponent, {
            panelClass: "vista-proyecto-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                action: "ver",
                row: row,
                idProyectoResolucion: row.idProyectoResolucion,
                currentSession:this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.handleLimpiar();
            }
        });
    };

    handleEliminarProyecto = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(
            EliminarProyectoResolucionComponent,
            {
                panelClass: "editar-alerta-dialog",
                disableClose: true,
                data: {
                    action: "delete",
                    idProyectoResolucion: row.idProyectoResolucion,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                    this.handleLimpiar();
            }
        });
    };

    handleVerProyectoResolucion(row: any, i) {
            
        if (!row.codigoDocumentoProyectoResolucion) {
            this.dataService
                .Message()
                .msgWarning(
                    '"NO SE ENCONTRÓ EL CÓDIGO DEL ARCHIVO DEL PROYECTO RESOLUCIÓN"',
                    () => { }
                );
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(row.codigoDocumentoProyectoResolucion)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                // if (
                //     response &&
                //     response.statusCode !== 422 &&
                //     response.statusCode !== 404
                // ) {
                //     saveAs(
                //         response,
                //         "Proyecto de Resolución N° " +
                //         row.numeroProyecto +
                //         ".pdf"
                //     );
                // } else if (
                //     response &&
                //     (response.statusCode === 422 || response.statusCode === 404)
                // ) {
                //     this.dataService
                //         .Message()
                //         .msgWarning(response.messages[0], () => { });
                // } else {
                //     this.dataService
                //         .Message()
                //         .msgWarning(
                //             '"NO SE PUDO OBTENER EL ARCHIVO DEL PROYECTO DE RESOLUCIÓN"',
                //             () => { }
                //         );
                // }
                if (response) {
                    this.handlePreview(response, row.codigoDocumentoProyectoResolucion);
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL INFORME ESCALAFONARIO."', () => {
                    });
                }
            });
    }



    handleVerResolucion(row: any, i) {
    
        if (!row.codigoDocumentoProyectoResolucion) {
            this.dataService
                .Message()
                .msgWarning(
                    '"NO SE ENCONTRÓ EL CÓDIGO DEL ARCHIVO DE LA RESOLUCIÓN"',
                    () => { }
                );
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(row.codigoDocumentoProyectoResolucion)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                // if (
                //     response &&
                //     response.statusCode !== 422 &&
                //     response.statusCode !== 404
                // ) {
                //     saveAs(
                //         response,
                //         "Resolución N° " + row.codigoDocumentoProyectoResolucion + ".pdf"
                //     );
                // } else if (
                //     response &&
                //     (response.statusCode === 422 || response.statusCode === 404)
                // ) {
                //     this.dataService
                //         .Message()
                //         .msgWarning(response.messages[0], () => { });
                // } else {
                //     this.dataService
                //         .Message()
                //         .msgWarning(
                //             '"NO SE PUDO OBTENER EL ARCHIVO DE LA RESOLUCIÓN"',
                //             () => { }
                //         );
                // }
                if (response) {
                    this.handlePreview(response, row.codigoDocumentoProyectoResolucion);
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL INFORME ESCALAFONARIO."', () => {
                    });
                }
            });
    }
    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Documento de sustento',
                    file: file,
                    fileName: codigoAdjuntoSustento
                }
            }
        });

        this.dialogRefPreview.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    };

    private setTiposDocumentoIdentidad = (response) => {
        if (response) {
            const itemAll = {
                idCatalogoItem: 0,
                descripcionCatalogoItem: this.textComboDefault,
            };
            response.unshift(itemAll);
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));

            this.idDNI = 0;
            data.forEach((x) => {
                if (x.label === "DNI" || x.label === "D.N.I.")
                    this.idDNI = x.value;
            });
            this.form.controls["idTipoDocumentoIdentidad"].setValue(0);
            this.comboLists.listTipoDocumento = data;
        }
    };

    // private loadTipoDocumentoIdentidad = () => {
    //     this.dataService
    //         .ProyectosResolucion()
    //         .getComboTipodocumento()
    //         .pipe(
    //             catchError(() => of([])),
    //             finalize(() => {})
    //         )
    //         .subscribe((response: any) => {
    //             if (response && response.result) {
    //                 const data = response.data.map((x) => ({
    //                     ...x,
    //                     value: x.idCatalogoItem,
    //                     label: `${x.abreviaturaCatalogoItem}`,
    //                 }));

    //                 this.idDNI = 0;
    //                 data.forEach((x) => {
    //                     if (x.label === "DNI" || x.label === "D.N.I.")
    //                         this.idDNI = x.value;
    //                 });
    //                 this.form.controls["idTipoDocumentoIdentidad"].setValue(
    //                     this.idDNI
    //                 );
    //                 this.comboLists.listTipoDocumento = data;
    //             }
    //         });
    // };

    private setAnios = (response) => {
        if (response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idAnio,
                label: `${x.numeroAnio}`,
            }));

            this.comboLists.listAnio = data;
            this.form.get("anio").setValue(new Date());
        }
    };

    // private loadAnios = () => {
    //     this.dataService
    //         .ProyectosResolucion()
    //         .getAnios()
    //         .pipe(
    //             catchError(() => of([])),
    //             finalize(() => {})
    //         )
    //         .subscribe((response: any) => {
    //             if (response && response.result) {
    //                 const data = response.data.map((x) => ({
    //                     ...x,
    //                     value: x.idAnio,
    //                     label: `${x.numeroAnio}`,
    //                 }));

    //                 this.comboLists.listAnio = data;
    //                 this.form.get("anio").setValue(new Date().getFullYear());
    //             }
    //         });
    // };

    // loadRegimenesLaborales = () => {
    //     this.dataService
    //         .ProyectosResolucion()
    //         .getComboRegimenesLaborales()
    //         .pipe(
    //             catchError(() => of([])),
    //             finalize(() => {})
    //         )
    //         .subscribe((response: any) => {
    //             if (response && response.result) {
    //                 const itemAll = {
    //                     idRegimenLaboral: 0,
    //                     descripcionRegimenLaboral: this.textComboDefault,
    //                 };
    //                 response.data.unshift(itemAll);
    //                 const data = response.data.map((x) => ({
    //                     ...x,
    //                     value: x.idRegimenLaboral,
    //                     label: `${x.descripcionRegimenLaboral}`,
    //                 }));
    //                 this.comboLists.listRegimenLaboral = data;
    //                 this.form.get("idRegimenLaboral").setValue(0);
    //             }
    //         });
    // };

    private setTiposResolucion = (response) => {
        if (response) {
            const itemAll = {
                idCatalogoItem: 0,
                descripcionCatalogoItem: this.textComboDefault,
            };
            response.unshift(itemAll);
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.comboLists.listTipoResolucion = data;
            this.form.get("idTipoResolucion").setValue(0);
        }
    };

    // private loadTiposResolucion = () => {
    //     this.dataService
    //         .ProyectosResolucion()
    //         .getComboTiposResolucion()
    //         .pipe(
    //             catchError(() => of([])),
    //             finalize(() => {})
    //         )
    //         .subscribe((response: any) => {
    //             if (response && response.result) {
    //                 const itemAll = {
    //                     idCatalogoItem: 0,
    //                     descripcionCatalogoItem: this.textComboDefault,
    //                 };
    //                 response.data.unshift(itemAll);
    //                 const data = response.data.map((x) => ({
    //                     ...x,
    //                     value: x.idCatalogoItem,
    //                     label: `${x.descripcionCatalogoItem}`,
    //                 }));
    //                 this.comboLists.listTipoResolucion = data;
    //                 this.form.get("idTipoResolucion").setValue(0);
    //             }
    //         });
    // };

    private setEstadosResolucion = (response) => {
        if (response) {
            const itemAll = {
                idCatalogoItem: 0,
                descripcionCatalogoItem: this.textComboDefault,
            };
            response.unshift(itemAll);
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.comboLists.listEstado = data;
            this.form.get("idEstado").setValue(0);
        }
    };

    // private loadEstadosResolucion = () => {
    //     this.dataService
    //         .ProyectosResolucion()
    //         .getComboEstadosResolucion()
    //         .pipe(
    //             catchError(() => of([])),
    //             finalize(() => {})
    //         )
    //         .subscribe((response: any) => {
    //             if (response && response.result) {
    //                 const itemAll = {
    //                     idCatalogoItem: 0,
    //                     descripcionCatalogoItem: this.textComboDefault,
    //                 };
    //                 response.data.unshift(itemAll);
    //                 const data = response.data.map((x) => ({
    //                     ...x,
    //                     value: x.idCatalogoItem,
    //                     label: `${x.descripcionCatalogoItem}`,
    //                 }));
    //                 this.comboLists.listEstado = data;
    //                 this.form.get("idEstado").setValue(0);
    //             }
    //         });
    // };

    loadGruposAccion = (idRegimen) => {
        this.regimenSeleccionado = this.regimenesLaborales.find(
            (r) => r.idRegimenLaboral == idRegimen
        );

        if (!this.regimenSeleccionado) {
            return false;
        }
        
        const data={
            idRegimenLaboral: idRegimen,
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }
        this.dataService
            .ProyectosResolucion()
            // .getComboGruposAccion(
            //     this.regimenSeleccionado.idRolRegimenLaboral.toString(),
            //     environment.gestionProyectoResolucion.CODIGO_SISTEMA.toString()
            // )
            .getGrupoAccionPorRegimenLaboralPorRolTipoSede(data)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    response = response ? response : [];

                    const itemAll = {
                        idGrupoAccion: 0,
                        descripcionGrupoAccion: this.textComboDefault,
                    };

                    response.unshift(itemAll);
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idGrupoAccion,
                        label: `${x.descripcionGrupoAccion}`,
                    }));

                    this.comboLists.listGrupoAccion = data;
                    this.form.get("idGrupoAccion").setValue(0);
                } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    };

    loadAcciones = (idGrupoAccion) => {
        
        const data={
            idRegimenLaboral:  this.regimenSeleccionado.idRegimenLaboral,
            idGrupoAccion: idGrupoAccion,
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }
        this.dataService
            .ProyectosResolucion()
            // .getComboAcciones(
            //     this.regimenSeleccionado.idRolRegimenLaboral.toString(),
            //     idGrupoAccion,
            //     environment.gestionProyectoResolucion.CODIGO_SISTEMA.toString()
            // )
            .getAccionPorRegimenLaboralPorGrupoAccionPorRolPorTipoSede(data)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    response = response ? response : [];
                    const itemAll = {
                        idAccion: 0,
                        descripcionAccion: this.textComboDefault,
                    };
                    response.unshift(itemAll);
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idAccion,
                        label: `${x.descripcionAccion}`,
                    }));
                    this.comboLists.listAccion = data;
                    this.form.get("idAccion").setValue(0);
                } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    };

    loadMotivosAccion = (idGrupoAccion, idAccion) => {
        
        const data={
            idRegimenLaboral:  this.regimenSeleccionado.idRegimenLaboral,
            idGrupoAccion: idGrupoAccion,
            idAccion: idAccion,
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }
        this.dataService
            .ProyectosResolucion()
            // .getComboMotiviosAccion(
            //     this.regimenSeleccionado.idRolRegimenLaboral.toString(),
            //     idGrupoAccion,
            //     idAccion,
            //     environment.gestionProyectoResolucion.CODIGO_SISTEMA.toString()
            // )
            .getMotivoAccionPorRegimenLaboralPorGrupoAccionPorAccionPorRolPorTipoSede(data)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    response = response ? response : [];

                    const itemAll = {
                        idMotivoAccion: 0,
                        descripcionMotivoAccion: this.textComboDefault,
                    };
                    response.unshift(itemAll);
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idMotivoAccion,
                        label: `${x.descripcionMotivoAccion}`,
                    }));
                    this.comboLists.listMotivoAccion = data;
                    this.form.get("idMotivoAccion").setValue(0);
                } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    }

    validDataForm(){
        let brespuesta:Boolean=false;
        if (!this.form.valid) {
            let mensajes="";

            if(this.form.controls.numeroProyecto.valid==false)
            {  
                mensajes=(mensajes.length==0?PROYECTO_RESOLUCION_MESSAGE.M01:mensajes+", "+PROYECTO_RESOLUCION_MESSAGE.M01);                
            }
            if(this.form.controls.idTipoDocumentoIdentidad.value>0){
                if (this.form.controls.numeroDocumentoIdentidad.valid == false) {
                    let mensajeNumDocumento=(this.form.get("idTipoDocumentoIdentidad").value === TipoDocumentoIdentidadEnum.DNI ? PROYECTO_RESOLUCION_MESSAGE.M34 : PROYECTO_RESOLUCION_MESSAGE.M116);
                    mensajes=(mensajes.length==0?mensajeNumDocumento:mensajes+", "+mensajeNumDocumento);                
                }
            }
            
            if (this.form.controls.codigoPlaza.valid == false) {
                mensajes=(mensajes.length==0?PROYECTO_RESOLUCION_MESSAGE.M64:mensajes+", "+PROYECTO_RESOLUCION_MESSAGE.M64);                
            }
            
            
            if (this.form.controls.codigoCentroTrabajo.valid == false) {
                mensajes=(mensajes.length==0?PROYECTO_RESOLUCION_MESSAGE.M38:mensajes+", "+PROYECTO_RESOLUCION_MESSAGE.M38);                
            }
            
            mensajes=(mensajes.length==0?'"EXISTEN ERRORES, REVISAR LOS CRITERIOS DE BÚSQUEDA"':mensajes);
            this.dataService.Message().msgWarning(mensajes, () => { });

            return brespuesta=true;
        }

        if(this.form.controls.fechaDesde.value!=null && this.form.controls.fechaHasta.value!=null){
            if(Date.parse(this.form.controls.fechaDesde.value) < Date.parse(this.form.controls.fechaVigenciaFin.value)){
                this.dataService
                .Message().msgWarning(
                    '"LA FECHA FIN NO PUEDE SER MENOR A LA FECHA INICIO"',
                    () => { });
                return brespuesta=true;
            }
        }
        if(this.form.controls.fechaDesde.value!=null && this.form.controls.fechaHasta.value==null)
        {
            this.dataService
            .Message().msgWarning(
                '"DEBE DE INGRESAR LA FECHA FIN"',
                () => { });
            return brespuesta=true;
        }
    
        if(this.form.controls.fechaDesde.value==null && this.form.controls.fechaHasta.value!=null)
        {
            this.dataService
            .Message().msgWarning(
                '"DEBE DE INGRESAR LA FECHA INICIO"',
                () => { });
            return brespuesta=true;
        }       

        return brespuesta;
    }
    buscarProyectosResolucion = (butonAccion:boolean=false) => {
        if(this.validDataForm()){            
            return;
        }

        const formData = this.form.value;

        this.request = {
            anio: formData.anio.getFullYear(),
            idTipoResolucion: formData.idTipoResolucion,
            numeroProyecto: formData.numeroProyecto,
            idRegimenLaboral: formData.idRegimenLaboral,
            idGrupoAccion: formData.idGrupoAccion,
            idAccion: formData.idAccion,
            idMotivoAccion: formData.idMotivoAccion,
            esMotivoJudicial: formData.idMandatoJudicial   ? formData.idMandatoJudicial == "0"  ? null : formData.idMandatoJudicial == "1"     ? true     : false   : null,
            idEstado: formData.idEstado,
            idServidorPublico: formData.idServidorPublico,
            idTipoDocumentoIdentidad: formData.idTipoDocumentoIdentidad == "0"    ? null  : formData.idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad: formData.numeroDocumentoIdentidad  ? formData.numeroDocumentoIdentidad : null,
            codigoPlaza: formData.codigoPlaza,
            idCentroTrabajo:  this.datosCentroTrabajo &&  this.datosCentroTrabajo.idCentroTrabajo ? this.datosCentroTrabajo.idCentroTrabajo : null,
            codigoCentroTrabajo: (formData.codigoCentroTrabajo || "").trim().length === 0 ? formData.codigoCentroTrabajo  : formData.codigoCentroTrabajo.trim(),
            fechaInicio: formData.fechaDesde,
            fechaFin: formData.fechaHasta,
            codigoSistema: parseInt(CODIGO_SISTEMA.toString() ),
            idNivelInstancia: this.data.idNivelInstancia,
            idDre: this.data.idDre,
            idUgel: this.data.idUgel,
            idOtraInstancia: this.data.idOtraInstancia,
            idInstancia: this.data.idInstancia === "" || this.data.idInstancia === undefined? null : this.data.idInstancia,
            idSubInstancia: formData.idSubinstancia === ""||formData.idSubinstancia === undefined ? null : formData.idSubinstancia,
            butonAccion:butonAccion
        };
        this.dataSource = new ProyectoResolucionDataSource(this.dataService);
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    };

    buscarCentrotrabajo(event) {
        // this.limpiarFiltroCentroDeTrabajo();

        // const codigoModularIngresado = this.form.controls["codigoCentroTrabajo"]
        //     .value;
        // const data = {
        //     codigoCentroTrabajo: codigoModularIngresado
        //         ? codigoModularIngresado.trim()
        //         : "",
        //     idNivelInstancia: this.storageService.passport.idNivelInstancia,
        //     idEntidadSede: this.storageService.passport.idEntidadSede,
        //     registrado: false,
        // };

        // if (
        //     (data.codigoCentroTrabajo || "").trim().length === 0 ||
        //     (data.codigoCentroTrabajo || "").trim().length > 8
        // ) {
        //     this.dataService
        //         .Message()
        //         .msgWarning(
        //             '"DEBE INGRESAR UN CÓDIGO MODULAR VÁLIDO PARA REALIZAR LA BÚSQUEDA"',
        //             () => { }
        //         );
        //     return;
        // }

        // this.dataService
        //     .ProyectosResolucion()
        //     .buscarCentroTrabajo(data)
        //     .pipe(
        //         catchError((e) => of(e)),
        //         finalize(() => { })
        //     )
        //     .subscribe((response: any) => {
        //         if (response) {
        //             if (response.length > 0) {
        //                 this.setCentroTrabajo(response);
        //             }
        //         } else if (
        //             response &&
        //             (response.statusCode === 422 || response.statusCode === 404)
        //         ) {
        //             this.dataService
        //                 .Message()
        //                 .msgWarning('"'+response.messages[0]+'"', () => {
        //                     this.limpiar();
        //                 });
        //         } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
        //             this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
        //         } else {
        //             this.dataService
        //                 .Message()
        //                 .msgError(
        //                     '"OCURRIERON ALGUNOS PROBLEMAS AL BUSCAR EL CENTRO DE TRABAJO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS"',
        //                     () => {
        //                         this.limpiar();
        //                     }
        //                 );
        //         }
        //     });
    }

    setCentroTrabajo(data) {
        if (data.length > 1) {
            this.form.controls["codigoCentroTrabajo"].setValue("");
            this.busquedaCentroTrabajoPersonalizada(data);
            this.dataService
                .Message()
                .msgWarning(
                    '"SE ENCONTRARON MAS DE CENTROS DE TRABAJO, POR FAVOR REALIZAR LA BUSQUEDA PERSONALIZADA"',
                    () => { }
                );
            return;
        }

        this.form.patchValue(data[0]);
        this.datosCentroTrabajo = data[0];
    }

    busquedaCentroTrabajoPersonalizada(data) {
        // this.limpiarFiltroCentroDeTrabajo();

        var codigoIngresado = this.form.controls["codigoCentroTrabajo"].value;

        if (codigoIngresado !== null && codigoIngresado !== "") {
            this.buscarCentrotrabajo(null);
            return;
        }

        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1300px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                    idTipoOperacion: 0,//TablaTipoOperacion.REGISTRAR,
                    registrado: false,
                    // centrosTrabajos: data,
                    currentSession:this.currentSession,
                    passport:this.currentSession,
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {
            const codigoCentroTrabajo = response?.centroTrabajo?.codigo_centro_trabajo;
            if (codigoCentroTrabajo) {
                this.form.get('codigoCentroTrabajo').setValue(codigoCentroTrabajo);
            }
            // if (!response) {
            //     return;
            // }

            // var data = [response];
            // this.setCentroTrabajo(data);
        });
    }

    private limpiarFiltroCentroDeTrabajo = () => {
        this.datosCentroTrabajo = null;
    };

    private limpiarRegimenSeleccionado = () => {
        this.regimenSeleccionado = null;
    };

    buscarServidorPublico = () => { };

    busquedaServidorPublicoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscadorServidorPublicoComponent,
            {
                panelClass: "minedu-buscador-servidor-publico-dialog",
                width: "980px",
                disableClose: true,
                data: {
                    action: "busqueda",
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
                const servidorPublico = resp.servidorPublico;
                this.form
                    .get("idServidorPublico")
                    .setValue(servidorPublico.idServidorPublico);
                this.form
                    .get("idTipoDocumentoIdentidad")
                    .setValue(servidorPublico.idTipoDocumentoIdentidad);
            
                this.selectTipoDocumento(servidorPublico.idTipoDocumentoIdentidad);                                
                this.form
                    .get("numeroDocumentoIdentidad")
                    .setValue(servidorPublico.numeroDocumentoIdentidad);
        });
    };

    busquedaPlazas = () => {
        this.dialogRef = this.materialDialog.open(
            BuscadorCodigoPlazaComponent,
            {
                panelClass: "minedu-buscador-codigo-plaza-dialog",
                width: "980px",
                disableClose: true,
                data: {
                    action: "busqueda",
                    currentSession:this.currentSession
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const servidorPublico = resp;
                this.form
                    .get("codigoPlaza")
                    .setValue(servidorPublico.codigoPlaza);
            }
        });
    };

    limpiar() { }

    // private accesoRol() {
    //     const rol = this.dataService.Storage().getPassportRolSelected();

    //     this.dataService
    //         .ProyectosResolucion()
    //         .accesoRolPassport(rol.CODIGO_ROL, rol.CODIGO_TIPO_SEDE)
    //         .pipe(catchError(() => of(null)))
    //         .subscribe((response) => {
    //             if (response && response.result) {
    //                 this.data.idNivelInstancia = response.data.idNivelInstancia;
    //                 this.data.idRolPassport = response.data.idRolPassport;
    //                 this.data.codigoRolPassport =
    //                     response.data.codigoRolPassport;
    //                 this.data.descripcionRolPassport =
    //                     response.data.descripcionRolPassport;

    //                 this.tienePermisoAgregar = response.data.accesoCrear;
    //                 this.tienePermisoEliminar = response.data.accesoAnular;

    //                 if (
    //                     rol.CODIGO_TIPO_SEDE ===
    //                     TablaEquivalenciaSede.CODIGO_TIPO_SEDE
    //                 ) {
    //                     rol.CODIGO_SEDE = TablaEquivalenciaSede.CODIGO_SEDE;
    //                 }

    //                 this.entidadPassport(rol.CODIGO_SEDE);
    //             } else {
    //                 this.dataService
    //                     .Message()
    //                     .msgInfo(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
    //                         this.router.navigate(["ayni", "plazas", "inicio"]);
    //                     });
    //             }
    //         });
    // }

    private setEntidadPassport = (response) => {
        
        if (response) {
            this.data.idNivelInstancia = response.codigoNivelInstancia;
            this.data.idOtraInstancia = response.idOtraInstancia;
            this.data.idDre = response.idDre;
            this.data.idUgel = response.idUgel;
            // this.storageService.setCurrentSession(this.data);

            // this.loadRegimenLaboral(
            //     this.storageService.passport.idNivelInstancia,
            //     this.storageService.passport.idRolPassport,
            //     null,
            //     null,
            //     null,
            //     true
            // );
            

           // this.buscarProyectosResolucion();
        } else {
            this.dataService
                .Message()
                .msgWarning(
                    '"NO SE PUDO OBTENER LA ENTIDAD DEL USUARIO"',
                    () => { }
                );
        }
    };

    // private entidadPassport(codigoEntidadSede: any) {
    //     this.dataService
    //         .ProyectosResolucion()
    //         .entidadPassport(codigoEntidadSede)
    //         .pipe(
    //             catchError(() => of(null)),
    //             finalize(() => {
    //                 this.dataService.Spinner().hide("sp6");
    //             })
    //         )
    //         .subscribe((response) => {
    //             if (response && response.result) {
    //                 this.data.idEntidadSede = response.data.idEntidadSede;
    //                 this.data.idOtraInstancia = response.data.idOtraInstancia;
    //                 this.data.idDre = response.data.idDre;
    //                 this.data.idUgel = response.data.idUgel;
    //                 this.storageService.setCurrentSession(this.data);

    //                 this.loadRegimenLaboral(
    //                     this.storageService.passport.idNivelInstancia,
    //                     this.storageService.passport.idRolPassport,
    //                     null,
    //                     null,
    //                     null,
    //                     true
    //                 );

    //                 this.handleBuscar();
    //             } else {
    //                 this.dataService
    //                     .Util()
    //                     .msgWarning(
    //                         "No se pudo obtener de la entidad del usuario.",
    //                         () => {}
    //                     );
    //             }
    //         });
    // }

    loadRegimenLaboral()
    {
        this.dataService.Spinner().show("sp6"); /////
        
        const data={
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }
        this.dataService
            .ProyectosResolucion()
            .getRegimenesLaboralesPorRolyTipoSede(data)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {                    
                if(response){
                    this.regimenesLaborales = [...response];

                    const itemAll = {
                        idRegimenLaboral: 0,
                        descripcionRegimenLaboral: this.textComboDefault,
                    };

                    response.unshift(itemAll);

                    const data = response.map((x) => ({
                        ...x,
                        value: x.idRegimenLaboral,
                        label: `${x.descripcionRegimenLaboral}`,
                    }));
                   
                    this.comboLists.listRegimenLaboral = data;
                    this.form.get("idRegimenLaboral").setValue(0);
                }
                else{
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });
    }
    // loadRegimenLaboral(
    //     idNivelInstancia,
    //     idRolPassport,
    //     idGrupoAccion,
    //     idAccion?: any,
    //     idMotivoAccion?: any,
    //     activo?: any
    // ) {
    //     this.dataService
    //         .ProyectosResolucion()
    //         .listarRegimenLaboral(
    //             idNivelInstancia,
    //             idRolPassport,
    //             environment.gestionProyectoResolucion.CODIGO_SISTEMA,
    //             idGrupoAccion,
    //             idAccion,
    //             idMotivoAccion,
    //             activo,
    //             false
    //         )
    //         .pipe(
    //             catchError((e) => of(e)),
    //             map((response: any) => response)
    //         )
    //         .subscribe((response) => {
    //             if (response) {
    //                 this.regimenesLaborales = [...response];

    //                 const itemAll = {
    //                     idRegimenLaboral: 0,
    //                     descripcionRegimenLaboral: this.textComboDefault,
    //                 };

    //                 response.unshift(itemAll);

    //                 const data = response.map((x) => ({
    //                     ...x,
    //                     value: x.idRegimenLaboral,
    //                     label: `${x.descripcionRegimenLaboral}`,
    //                 }));
                   
    //                 this.comboLists.listRegimenLaboral = data;
    //                 this.form.get("idRegimenLaboral").setValue(0);
    //             } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
    //                 this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
    //             }
    //         });
    // }
    selectTipoDocumento(tipoDocumento: number): void {        
        let tipoDocumentoSeleccionado = this.comboLists.listTipoDocumento.find(
            (r) => r.idCatalogoItem == tipoDocumento
        );
        this.form.get("numeroDocumentoIdentidad").setValue("");
        this.minLengthnumeroDocumentoIdentidad =
        (tipoDocumentoSeleccionado.codigoCatalogoItem||0)  === TipoDocumentoIdentidadEnum.DNI ? 8 : 9;
        this.maxLengthnumeroDocumentoIdentidad =
        (tipoDocumentoSeleccionado.codigoCatalogoItem||0)  === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
        
        if(tipoDocumento===null || 
           tipoDocumento===undefined || 
           tipoDocumento<=0)this.form.get("numeroDocumentoIdentidad").disable();
        else this.form.get("numeroDocumentoIdentidad").enable();

        this.form.get('numeroDocumentoIdentidad')
        .setValidators([
            Validators.minLength(this.minLengthnumeroDocumentoIdentidad),
            Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad)
        ]);
    };

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    }

    validatexto(){
        if(this.maxLengthnumeroDocumentoIdentidad==8)
        if(!Number( this.form.get("numeroDocumentoIdentidad").value))
        this.form.get("numeroDocumentoIdentidad").setValue("");
    };

    validaNumerosyLetras = (event) => {
    
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        var key = event.keyCode || event.which,
        tecla = String.fromCharCode(key).toLowerCase(),
        letras = " 0123456789áéíóúabcdefghijklmnñopqrstuvwxyz",
        especiales = [8, 37, 39, 46],
        tecla_especial = false;

        for (var i in especiales) {
        if (key == especiales[i]) {
            tecla_especial = true;
            break;
        }
        }

        if (letras.indexOf(tecla) == -1 && !tecla_especial) {
        return false;
        }
   };

    validaLetras = (event) => {
        var key = event.keyCode || event.which,
          tecla = String.fromCharCode(key).toLowerCase(),
          letras = " áéíóúabcdefghijklmnñopqrstuvwxyz",
          especiales = [8, 37, 39, 46],
          tecla_especial = false;
    
        for (var i in especiales) {
          if (key == especiales[i]) {
            tecla_especial = true;
            break;
          }
        }
    
        if (letras.indexOf(tecla) == -1 && !tecla_especial) {
          return false;
        }
      };
}

export class ProyectoResolucionDataSource extends DataSource<any> {
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
        this.dataService.ProyectosResolucion().bandejaProyectosResolucion(data, pageIndex, pageSize).pipe(catchError((error) => {
            
            this.dataService.Message().msgWarning('"'+error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this._loadingChange.next(false);
        })).subscribe((result: any) => {
                this._dataChange.next(result || []);
                this.totalregistro = (result || []).length === 0 ? 0 : result[0].totalRegistro;
            });
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

export interface AccesoUsuario {
    ELIMINAR_PROYECTO_RESOLUCION:boolean
}