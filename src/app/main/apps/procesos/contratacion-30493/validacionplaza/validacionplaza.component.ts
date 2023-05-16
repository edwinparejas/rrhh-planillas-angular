import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { IPlazasContratacionValidacion } from '../models/contratacion.model';
import { EstadoValidacionPlazaEnum } from '../_utils/constants';
import { saveAs } from 'file-saver';

@Component({
  selector: 'minedu-validacionplaza',
  templateUrl: './validacionplaza.component.html',
  styleUrls: ['./validacionplaza.component.scss'],
  animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ValidacionplazaComponent implements OnInit {
    validacionPlaza;
    soloLectura = true;
    form: FormGroup;
    idEtapaProceso: number;
    dialogRef: any;
    becario: string;
    isMobile = false;
    totalregistro = 0;
    selectedTabIndex = 0;
    fecha = new Date();
    plazaFiltroSeleccionado: any;
    paginatorPlazasPrepublicadasPageIndex = 0;
    paginatorPlazasPrepublicadasPageSize = 10;
    paginatorPlazasConvocarPageIndex = 0;
    paginatorPlazasConvocarPageSize = 10;
    paginatorPlazasObservarPageIndex = 0;
    paginatorPlazasObservarPageSize = 10;
    @ViewChild("paginatorPlazasPrepublicadas", { static: true }) paginatorPlazasPrepublicadas: MatPaginator;
    @ViewChild("paginatorPlazasConvocar", { static: true }) paginatorPlazasConvocar: MatPaginator;
    @ViewChild("paginatorPlazasObservar", { static: true }) paginatorPlazasObservar: MatPaginator;
    centroTrabajoFiltroSeleccionado: any;
    estadoPlaza = EstadoValidacionPlazaEnum;
    selectionPlazasPrepublicadas = new SelectionModel<any>(true, []);
    selectionPlazasConvocar = new SelectionModel<any>(true, []);
    selectionPlazasObservar = new SelectionModel<any>(true, []);
    dataSourcePrepublicadas: PlazasContratacionPrepublicadasDataSource | null;
    dataSourceConvocadas: PlazasContratacionConvocadasDataSource | null;
    dataSourceObservadas: PlazasContratacionObservadasDataSource | null;
    displayedColumnsPlazasPrepublicadas: string[] = [
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
        "es_becario",
        "acciones",
    ];
    displayedColumnsPlazasConvocar: string[] = [
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
        "es_becario",
        "acciones",
    ];
    displayedColumnsPlazasObservar: string[] = [
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
        "es_becario",
        "acciones",
    ];
    request = {
        idPlaza: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idEtapaProceso: null,
        esBecario: null,
        codigoCentroTrabajoMaestro:null
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

    

    constructor(private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        if (this.route.routeConfig.path.search('ver-validacion-plazas/') > -1) {
            this.soloLectura = true;
        } else {
            this.soloLectura = false;
        }
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.buildForm();
        this.buildGrids();
        this.handleResponsive();
        this.obtenerPlazaContratacion();
        this.buildSeguridad();
    }

    buildSeguridad = () => {
        /*this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar); */
        this.permisos.autorizadoEnviar = true;
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        console.log(this.currentSession);
        this.buildSeguridadControles(this.currentSession.codigoRol);
        // if (!this.permisos.autorizadoConsultar) { // Verificar permisos
        //     this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        //     return;
        // }
        // console.log("Autorizado!")
    };

    // TODO : CLEAN HARDCODE
    controlesActivos:ControlesActivos = {
        btnFinalizarValidacionPlazas:false, btnPublicarPlazas:false, btnAperturarPublicacion:false, btnIncorporarPlazas: false, btnPlazasConvocar:false, btnPlazasObservadas:false, btnVerPlazasPDF:false, btnExportar:false, btnEliminarPlazas:false   
    }
    buildSeguridadControles = (codigoRol:string) => {
        const rol = this.dataService.Storage().getPassportRolSelected();
        // Ajustar Valores
        this.currentSession.idRol = 0;  
        switch(rol.CODIGO_TIPO_SEDE){
            case "TS001":
                this.currentSession.idTipoSede = 2;              
                if(rol.CODIGO_ROL == "AYNI_004")
                    this.currentSession.idRol = 5; // Resp. DRE   
                break;
            case "TS002":
                this.currentSession.idTipoSede = 3;
                if(rol.CODIGO_ROL == "AYNI_004")
                    this.currentSession.idRol = 6; // Resp UGEL
                break;
            case "TS004":
                this.currentSession.idTipoSede = 4;
                if(rol.CODIGO_ROL == "AYNI_004") 
                    this.currentSession.idRol = 7; // Resp. IE Militar
                break;
            case "TS005":
                this.currentSession.idTipoSede = 1;
                if(rol.CODIGO_ROL == "AYNI_006")
                    this.currentSession.idRol = 2; // Esp Diten
                if(rol.CODIGO_ROL == "AYNI_004") 
                    this.currentSession.idRol = 5; // Resp. DRE
                break;
            case "TS013":
                this.currentSession.idTipoSede = 1;
                if(rol.CODIGO_ROL == "AYNI_019")
                    this.currentSession.idRol = 9; // Esp Diten
                break;    
            default:
                if(rol.CODIGO_ROL == "AYNI_006")
                    this.currentSession.idRol = 2; // Monitor
                break;
        }

        const data = { 
            idEtapaProceso:this.idEtapaProceso, 
            idTipoSede:this.currentSession.idTipoSede,
            idRol:this.currentSession.idRol
        }

        console.log("Datos entrada seguridad: ",data);
        this.dataService.Contrataciones().getObtenerAccesoUsuariosValidacionPlazas(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Valores de tabla accesos: ",response)
                this.controlesActivos = { 
                    btnFinalizarValidacionPlazas:response.finalizarValidacionPlazas,
                    btnPublicarPlazas:response.publicarPlazas, 
                    btnAperturarPublicacion:response.aperturarPrepublicacion, 
                    btnIncorporarPlazas: response.incorporarPlazas,
                    btnPlazasConvocar:response.plazasConvocar, 
                    btnPlazasObservadas:response.plazasObservadas, 
                    btnVerPlazasPDF:true, 
                    btnExportar:true, 
                    btnEliminarPlazas:response.incorporarPlazas
                 }; 
            }
        });       

    }

    obtenerPlazaContratacion(): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        let d = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
        }
        
        this.dataService.Contrataciones().getObtenerPlazaContratacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                if (response.length > 0) {
                    if (response[0].estadoValidacionPlaza == 'PRE PUBLICADO') {
                        this.validacionPlaza = 'PENDIENTE';
                    } else {
                        this.validacionPlaza = response[0].estadoValidacionPlaza;
                    }
                }
                else {
                    this.validacionPlaza = 'PENDIENTE';
                }
            }
        });
    }

    ngAfterViewInit() {
        this.paginatorPlazasPrepublicadas.page.pipe(tap(() => this.handleBuscar())).subscribe();
        this.paginatorPlazasConvocar.page.pipe(tap(() => this.handleBuscar())).subscribe();
        this.paginatorPlazasObservar.page.pipe(tap(() => this.handleBuscar())).subscribe();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoCentroTrabajo: [null],
            codigoPlaza: [null],
            plazasPara: [null],
            fechaActual: [null],
        });

        this.form.get("plazasPara").setValue("-1");
        setTimeout((_) => this.handleBuscar());
    }

    buildGrids(): void {
        this.dataSourcePrepublicadas = new PlazasContratacionPrepublicadasDataSource(this.dataService);
        this.dataSourceConvocadas = new PlazasContratacionConvocadasDataSource(this.dataService);
        this.dataSourceObservadas = new PlazasContratacionObservadasDataSource(this.dataService);
        this.buildPaginators(this.paginatorPlazasPrepublicadas);
        this.buildPaginators(this.paginatorPlazasConvocar);
        this.buildPaginators(this.paginatorPlazasObservar);
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Filas por tabla";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    resetForm = () => {
        this.form.reset();
        this.form.get("plazasPara").setValue("-1");
    };

    handleBuscar = () => {
        this.buscarPlazasContratacionPublicadas();
    }

    handleIncorporarPlazas() { // **********************

        /*this.dialogRef = this.materialDialog.open(ModalIncorporacionPlazasComponent, {
            panelClass: "modal-incorporacion-plaza-dialog",
            width: "100%",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idSituacionValidacion: 346, // Prepublicada
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });*/
    }

    checkboxLabelPlazasPrepublicadas(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasPrepublicadas() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasPrepublicadas.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    masterTogglePlazasPrepublicadas = () => {
        this.isAllSelectedPlazasPrepublicadas() ? this.selectionPlazasPrepublicadas.clear() : this.dataSourcePrepublicadas.data.forEach((row) =>
            this.selectionPlazasPrepublicadas.select(row)
        );
    };

    isAllSelectedPlazasPrepublicadas = () => {
        const numSelected = this.selectionPlazasPrepublicadas.selected.length;
        const numRows = this.dataSourcePrepublicadas.data.length;
        return numSelected === numRows;
    };

    checkboxLabelPlazasConvocar(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasConvocar() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasConvocar.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    masterTogglePlazasConvocar = () => {
        this.isAllSelectedPlazasConvocar() ? this.selectionPlazasConvocar.clear() : this.dataSourceConvocadas.data.forEach((row) =>
            this.selectionPlazasConvocar.select(row)
        );
    };

    isAllSelectedPlazasConvocar = () => {
        const numSelected = this.selectionPlazasConvocar.selected.length;
        const numRows = this.dataSourceConvocadas.data.length;
        return numSelected === numRows;
    };

    checkboxLabelPlazasObservar(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasObservar() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasObservar.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    masterTogglePlazasObservar = () => {
        this.isAllSelectedPlazasObservar() ? this.selectionPlazasObservar.clear() : this.dataSourceObservadas.data.forEach((row) =>
            this.selectionPlazasObservar.select(row)
        );
    };

    isAllSelectedPlazasObservar = () => {
        const numSelected = this.selectionPlazasObservar.selected.length;
        const numRows = this.dataSourceObservadas.data.length;
        return numSelected === numRows;
    };

    buscarPlazasContratacionPublicadas = () => {
        this.setRequest();

        if (this.request.codigoPlaza != null) {
            const codigoPlaza: string = this.request.codigoPlaza;
            if (codigoPlaza.length < 12) {
                this.dataService.Message().msgWarning('"CÓDIGO NO VÁLIDO, DEBE INGRESAR UN CÓDIGO CON DOCE (12) DÍGITOS."', () => {});
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
        }        
        this.buscarPlazasContratacion();
    };

    private buscarPlazasContratacion = () => {        
        this.buscarPlazasContratacionPrepublicadas();
        this.buscarPlazasContratacionConvocadas();
        this.buscarPlazasContratacionObservadas();
    };

    private buscarPlazasContratacionPrepublicadas = () => {
        this.selectionPlazasPrepublicadas = new SelectionModel<any>(true, []);
        this.dataSourcePrepublicadas.load(this.request, this.paginatorPlazasPrepublicadas.pageIndex + 1, this.paginatorPlazasPrepublicadas.pageSize);
    };

    private buscarPlazasContratacionConvocadas = () => {
        this.selectionPlazasConvocar = new SelectionModel<any>(true, []);
        this.dataSourceConvocadas.load(this.request, this.paginatorPlazasConvocar.pageIndex + 1, this.paginatorPlazasConvocar.pageSize);
    };

    private buscarPlazasContratacionObservadas = () => {
        this.selectionPlazasObservar = new SelectionModel<any>(true, []);
        this.dataSourceObservadas.load(this.request, this.paginatorPlazasObservar.pageIndex + 1, this.paginatorPlazasObservar.pageSize);
    };

    setRequest(): void {
        const formulario = this.form.getRawValue();

        let idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.id_plaza : null;
        let codigoPlaza = formulario.codigoPlaza;
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo;
        let becario = formulario.plazasPara != "-1" ? formulario.plazasPara : null;

        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idPlaza: idPlaza,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo,
            esBecario: becario == "1" && becario != null ? true : becario == "0" && becario != null ? false : null,
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede
        };
    }

    busquedaCentroTrabajoPersonalizada = () => {
        /*this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
            panelClass: "buscar-centro-trabajo-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                action: "requerimiento",
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
                this.centroTrabajoFiltroSeleccionado = { ...result.centroTrabajo };
            }
        });*/
    };

    busquedaPlazaPersonalizada(): void {
       /* this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
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
        });*/
    }

    informacionValidacionPlazaView = (id) => {
      /*  this.dialogRef = this.materialDialog.open(InformacionPlazaValidacionComponent, {
            panelClass: "informacion-validacion-plazas-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idPlaza: id
            },
        });*/
    };

    informacionMotivoPlazaObservadaView = (plazaMotivoObservada) => {
     /*   this.dialogRef = this.materialDialog.open(ModalInformacionPlazaObservadaComponent, {
            panelClass: "modal-informacion-plaza-observada-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                plazaObservada: plazaMotivoObservada,
            },
        });*/
    };

    handleFinalizarValidacionPlazas = () => {
        if (this.dataSourcePrepublicadas.data.length !== 0) {
            this.dataService.Message().msgWarning('"AÚN TIENE PLAZAS PRE PUBLICADAS POR VALIDAR."', () => { });
            return;
        }

        const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA FINALIZAR LA VALIDACIÓN DE LAS PLAZAS?</strong><br>Al finalizar la validación de las plazas se enviarán a la instancia superior para solicitar su aprobación.";
        this.dataService.Message().msgConfirm(confirmationMessage,
            () => {
                const request = {
                    idEtapaProceso: this.idEtapaProceso,
                    idEstadoValidacion: this.estadoPlaza.VALIDADO,
                    usuarioModificacion: "ADMIN",
                    codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().actualizarPlazaContratacionEstadoValidacion(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {
                            this.obtenerPlazaContratacion();
                        });
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE FINALIZAR LA VALIDACIÓN."')
                    }                        
                });
            }
        );
    }

    handlePublicarPlazas() {
        if (this.dataSourceConvocadas.data[0].codigo_estado_validacion !== this.estadoPlaza.APROBADO) {
            this.dataService.Message().msgWarning('"LAS PLAZAS AÚN NO HAN SIDO APROBADAS POR LA INSTANCIA SUPERIOR."', () => { });
            return;
        }

        const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA REALIZAR LA PUBLICACIÓN DE LAS PLAZAS?</strong><br>Al publicar las plazas, se generá el listado de las plazas en formato PDF.";
        this.dataService.Message().msgConfirm(confirmationMessage,
            () => {
                const request = {
                    idEtapaProceso: this.idEtapaProceso,
                    idEstadoValidacion: this.estadoPlaza.PUBLICADO,
                    maestroProceso: 'CONTRATACIÓN DOCENTE',
                    anio: this.fecha.getFullYear(),
                    instancia: 'DRE BARRANCA',
                    subInstancia: 'UGEL BARRANCA',
                    usuarioModificacion: 'ADMIN',
                    codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().actualizarPlazaContratacionEstadoValidacion(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {});
                        this.obtenerPlazaContratacion();
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE FINALIZAR LA VALIDACIÓN."')
                    }                        
                });
            }
        );
    }

    handleFinalizarEtapaProceso = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        /*this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE FINALIZAR LA ETAPA DE PUBLICACIÓN?',
            () => {
                const request = {
                    idEtapaProceso: this.idEtapaProceso,
                    idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
                    usuarioCreacion: "ADMIN",
                    codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().registrarPlazaContratacionSiguienteEtapaDirectaResultadosPUN(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response) {
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE FINALIZAR LA ETAPA PROCESO."', () => {});
                    }
                });
            }
        );*/
    }

    handleVerPlazasPublicadas() {
       /* this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent, {
            panelClass: 'modal-documentos-publicados-dialog',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idGrupoDocumento: GrupoDocumentoPublicadoEnum.PUBLICACION,
                nombreDocumento: 'Plazas_Publicadas'
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            }
        );*/
    }

    descargarDocumentoPdf = (documento) => {
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(documento).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('"ERROR, NO SE PUDO ACCEDER AL SERVICIO."', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                this.handlePreview(response, "Plazas_Publicadas");
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO ACCEDER AL DOCUMENTO PDF DE LAS PLAZAS PUBLICADAS."', () => { });
            }
        });
    }

    handlePreview(file: any, nameFile: string) {
        /*this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Plazas Publicadas",
                    file: file
                }
            }
        });*/
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                if (response.download) {
                    saveAs(file, nameFile + ".pdf");
                }
            }
        );
    }

    handlePlazasConvocar = () => {
        let seleccionados = this.selectionPlazasPrepublicadas.selected || [];

        if (!((this.isAllSelectedPlazasPrepublicadas() && this.dataSourcePrepublicadas.data.length) || seleccionados.length)) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR AL MENOS UNA PLAZA."', () => {});
            return;
        }

        /*
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA CONVOCAR LAS PLAZAS?',
            () => {
                const plazasConvocar = [];

                for(let i = 0; i < seleccionados.length; i++) {
                    const idPlaza = seleccionados[i].id_plaza_contratacion_detalle;
                    plazasConvocar.push(idPlaza);
                }

                const request: IActualizarPlazaPublicacionSituacionValidacionViewModel = {
                    idEtapaProceso: SituacionPlazasEnum.PRE_PUBLICADA,
                    usuarioModificacion: "ADMIN",
                    plazas: null,
                    plazasConvocar: plazasConvocar.map((idPlaza) => {
                        return {
                            idPlazaContratacionConvocar: idPlaza
                        }
                    }),
                    plazasObservar: null,
                    codigoCentroTrabajoMaestro : this.currentSession.codigoSede
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().actualizarPlazaSituacionValidacion(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."');
                        this.buscarPlazasContratacion();
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE CONVOCAR LA PLAZA."')
                    }
                });
            }
        );*/
    };

    handlePlazasObservar = () => {        
        let seleccionados = this.selectionPlazasPrepublicadas.selected || [];

        if (!((this.isAllSelectedPlazasPrepublicadas() && this.dataSourcePrepublicadas.data.length) || seleccionados.length)) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR AL MENOS UNA PLAZA."', () => {});
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA OBSERVAR LAS PLAZAS?',
            () => {
                this.handleObservarPlazasModal(seleccionados);
            }
        );
    }

    observarPlazas = (seleccionados) => {
        const plazasObservar = [];

        for(let i = 0; i < seleccionados.length; i++) {
            const idPlaza = seleccionados[i].id_plaza_contratacion_detalle;
            plazasObservar.push(idPlaza);
        }

        /*const request: IActualizarPlazaPublicacionSituacionValidacionViewModel = {
            idEtapaProceso: SituacionPlazasEnum.PRE_PUBLICADA,
            usuarioModificacion: "ADMIN",
            plazas: null,
            plazasConvocar: null,
            plazasObservar: plazasObservar.map((idPlaza) => {
                return{
                    idPlazaContratacionObservar: idPlaza
                }
            }), 
            codigoCentroTrabajoMaestro : this.currentSession.codigoSede
        };

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().actualizarPlazaSituacionValidacion(request).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((result: number) => {
            if (result) {
                this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."');
                this.buscarPlazasContratacion();
            } else {
                this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE CONVOCAR LA PLAZA."')
            }
        });*/
    }

    handlePlazasConvocarObservar = () => {
        let seleccionados = this.selectionPlazasConvocar.selected || [];

        if (!((this.isAllSelectedPlazasConvocar() && this.dataSourceConvocadas.data.length) || seleccionados.length)) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR AL MENOS UNA PLAZA."', () => {});
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA OBSERVAR LAS PLAZAS?',
            () => {
                this.handleObservarPlazasModal(seleccionados);
            }
        );
    }

    handlePlazasObservarConvocar = () => {
        let seleccionados = this.selectionPlazasObservar.selected || [];

        if (!((this.isAllSelectedPlazasObservar() && this.dataSourceObservadas.data.length) || seleccionados.length)) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR AL MENOS UNA PLAZA."', () => {});
            return;
        }
        /*

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA CONVOCAR LAS PLAZAS?',
            () => {
                const plazasConvocar = [];

                for(let i = 0; i < seleccionados.length; i++) {
                    const idPlaza = seleccionados[i].id_plaza_contratacion_detalle;
                    plazasConvocar.push(idPlaza);
                }

                const request: IActualizarPlazaPublicacionSituacionValidacionViewModel = {
                    idEtapaProceso: SituacionPlazasEnum.PRE_PUBLICADA,
                    usuarioModificacion: "ADMIN",
                    plazas: null,
                    plazasConvocar: plazasConvocar.map((idPlaza) => {
                        return {
                            idPlazaContratacionConvocar: idPlaza
                        }
                    }),
                    plazasObservar: null,
                    codigoCentroTrabajoMaestro : this.currentSession.codigoSede
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().actualizarPlazaSituacionValidacion(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        const dataRequest = { idMotivo: null, detalle: null, flag: 1 };
                        this.actualizarPlazaDocumentoSustento(seleccionados, dataRequest);
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE CONVOCAR LA PLAZA."')
                    }
                });
            }
        );*/
    }

    actualizarPlazaDocumentoSustento(seleccionados: any, data: any) {
        const ids = [];
        for(let i = 0; i < seleccionados.length; i++) {
            let idPlazaContratacion = seleccionados[i].id_plaza_contratacion_detalle;
            ids.push(idPlazaContratacion);
        }

       /* const request: IActualizarIdDocumentoSustentoViewModel =
        {
            idMotivoNoPublicacion: data.idMotivo,
            detalleNoPublicacion: data.detalle,
            plazasObservar: ids.map((p) => {
                return {
                    idPlazaContratacionObservar: p,
                };
            }),
            usuarioModificacion: "ADMIN",
            flag: data.flag
        };

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().actualizarIdDocumentoSustento(request).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((result: any) => {
            if (!result) {
                this.dataService.Message().msgWarning('"HUBO ERRORES AL TRATAR DE ACTUALIZAR LA(S) PLAZA(S) SELECCIONADA(S)."', () => {});
            } else {
                this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."');
                this.buscarPlazasContratacion();
            }
        });*/
    }

    handleObservarPlazasModal(seleccionados: any[]): void {
       /* this.dialogRef = this.materialDialog.open(ModalPlazaObservadaComponent, {
            panelClass: "modal-plaza-observada-dialog",
            width: "980px",
            disableClose: true,
            data: {
                plazasObservadas: seleccionados,
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            } else {
                if (response.id !== "0") {
                    this.observarPlazas(seleccionados);
                    this.actualizarPlazaDocumentoSustento(seleccionados, response);
                } else {
                    return;
                }
            }
        });*/
    }

    handleExportarPlazasPrepublicadas = () => {
        // this.handleExportarPlazasValidadas(this.dataSourcePrepublicadas.data, SituacionPlazasEnum.PRE_PUBLICADA, "Validacion_Plazas_Prepublicadas.xlsx");
    }

    handleExportarPlazasConvocar = () => {
        // this.handleExportarPlazasValidadas(this.dataSourceConvocadas.data, SituacionPlazasEnum.A_CONVOCAR, "Validacion_Plazas_Convocadas.xlsx");
    }

    handleExportarPlazasObservadas = () => {
        // this.handleExportarPlazasValidadas(this.dataSourceObservadas.data, SituacionPlazasEnum.OBSERVADA, "Validacion_Plazas_Observadas.xlsx");
    }

    handleExportarPlazasValidadas = (data: any[], codigoValidacion: number, nombreExcel: string) => {
        if (data.length == 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }

        let requestExport: IPlazasContratacionValidacion = { 
            idEtapaProceso: this.idEtapaProceso, 
            idSituacionValidacion: codigoValidacion, 
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede
        };

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelValidacionPublicacionPlazas(requestExport).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, nombreExcel);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO GENERAR EL DOCUMENTO EXCEL DE LAS PLAZAS A EXPORTAR."', () => {});
            }
        });
    }

    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
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

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Publicación de Plazas");
        this.sharedService.setSharedTitle("Validación de Plazas");
    }

    handleAperturarValidacionPlazas  = () => {
        /*const request: any = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: 'ADMIN',
            ipModificacion : '::1',
            fechaModificacion : new Date(),
        };

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE APERTURAR LA ETAPA DE VALIDACION DE PLAZAS?',
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().putAperturarPlazasValidacion(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response > 0) {
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA ETAPA DE VALIDACION DE PLAZAS"', () => {});
                    }
                });
            }, (error) => {}
        );*/
    }
}

export class PlazasContratacionPrepublicadasDataSource extends DataSource<any> {
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
            // data.idSituacionValidacion = SituacionPlazasEnum.PRE_PUBLICADA; // ************************ TODO

            this.dataService.Contrataciones().buscarPlazasContratacionPrepublicacionPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
                if ((plazasContratacion || []).length === 0) {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ PLAZAS PREPUBLICADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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

export class PlazasContratacionConvocadasDataSource extends DataSource<any> {
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
            // data.idSituacionValidacion = SituacionPlazasEnum.A_CONVOCAR; // TODO

            this.dataService.Contrataciones().buscarPlazasContratacionPrepublicacionPaginado(data, pageIndex, pageSize).pipe(
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

export class PlazasContratacionObservadasDataSource extends DataSource<any> {
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
           //  data.idSituacionValidacion = SituacionPlazasEnum.OBSERVADA;

            this.dataService.Contrataciones().buscarPlazasContratacionPrepublicacionPaginado(data, pageIndex, pageSize).pipe(
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

interface ControlesActivos{
    btnFinalizarValidacionPlazas:boolean,
    btnPublicarPlazas:boolean,
    btnAperturarPublicacion:boolean,
    btnIncorporarPlazas: boolean,
    btnPlazasConvocar:boolean,
    btnPlazasObservadas:boolean
    btnVerPlazasPDF:boolean,
    btnExportar:boolean,
    btnEliminarPlazas:boolean
    // btnFinalizarEtapa : boolean,
    // btnAperturaEtapa : boolean,
    // btnPrePublicarPlazas:boolean,
    // btnPlazaBecarios:boolean,
}