import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { Form, FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize, filter, tap } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { SecurityModel } from '../../../../../../../core/model/security/security.model';
import { SharedService } from '../../../../../../../core/shared/shared.service';
import { RubroCalificacionEnum, TipoPuntajeEnum, TipoFormatoPlazaEnum, MensajesSolicitud } from '../../../_utils/constants';
import { MatPaginator } from '@angular/material/paginator';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { forEach } from 'lodash';
import { MatTableDataSource } from '@angular/material/table';
import { BuscarCentroTrabajoComponent } from "../../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BusquedaPlazaComponent } from "../../../components/busqueda-plaza/busqueda-plaza.component";
import { criterioBusqueda } from '../../../models/criterioBusqueda.model';
import { RegimenLaboralEnum } from 'app/main/apps/procesos/reasignacion/_utils/constants';
import { InformacionPlazaValidacionComponent } from "../../../validacionplaza/informacion-plaza-validacion/informacion-plaza-validacion.component";

@Component({
    selector: 'minedu-adjudicar-plaza-pun',
    templateUrl: './adjudicar-plaza-pun.component.html',
    styleUrls: ['./adjudicar-plaza-pun.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class AdjudicarPlazaPUNComponent implements OnInit {
    
    minDate: Date = new Date();
    maxDate: Date = new Date(new Date().getFullYear(), 11, 31, 17, 23, 42, 11); 

    working = true;
    isMobile = false;
    centroTrabajoFiltroSeleccionado: any;
    plazaFiltroSeleccionado: any;

    form: FormGroup;
    formPostulante: FormGroup;
    formGrid: FormGroup;
    ls_grid: FormArray;

    idPersona: number;
    idAdjudicacion: number;
    idEtapaProceso: number;
    info: any;
    rubro: any;
    rubroCab: any;
    dialogRef: any;
    dtSource: EvaluacionDataSource[] | null = [];

    dtSourceDisponible = new MatTableDataSource<any>([]);
    dtSourceAdjudicar = new MatTableDataSource<any>([]);

    @ViewChild("paginatorDisponible", { static: true }) paginatorDisponible: MatPaginator;
    @ViewChild("paginatorAdjudicar", { static: true }) paginatorAdjudicar: MatPaginator;

    TipoPuntajeEnum = TipoPuntajeEnum;
    displayedColumns: any[];
    selectionPlazasDisponible = new SelectionModel<any>(true, []);

    displayedColumnsResultadosPUN: string[] = [
        "codigoCriterio",
        "descripcionCriterio",
        "puntajeObtenido"
    ];
    displayedColumnsResultadosPUN2: string[] = [
        "codigoCriterio",
        "descripcionCriterio2",
        "puntajeObtenido2"
    ];
    displayedColumnsDisponible: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "jornada_laboral",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin"
    ];
    displayedColumnsAdjudicar: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "jornada_laboral",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "acciones"
    ];

    loadingDisponible = false;
    loadingAdjudicar = false;

    request = {
        idAdjudicacion: null,
        idEtapaProceso: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        codigoCentroTrabajoMaestro:null
    }

    requestAdjudicar = {
        idAdjudicacion: null,
        usuarioModificacion: null,
        plazas: null,
	correoElectronico: null,
	direccion: null,
	idPersona: null
    }

    private passport: SecurityModel = new SecurityModel();

    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        setTimeout((_) => this.buildShared());
        this.idPersona = parseInt(this.route.snapshot.params.idPersona);
        this.idAdjudicacion = parseInt(this.route.snapshot.params.id);
        this.idEtapaProceso = parseInt(this.route.parent.snapshot.params.id);
        this.buildForm();
        this.buildGrids();
        this.handleResponsive();
        this.obtenerInformación();
        this.handleBuscar();
    }

    buildGrids(): void {
        this.buildPaginators(this.paginatorDisponible);
        this.buildPaginators(this.paginatorAdjudicar);
    }

    isAllSelectedPlazasDisponible = () => {
        const numSelected = this.selectionPlazasDisponible.selected.length;
        const numRows = this.dtSourceDisponible.data.length;
        return numSelected === numRows;
    };

    checkboxLabelPlazasDisponibleGeneradas(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasDisponible() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasDisponible.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    masterTogglePlazasGeneradas = () => {
        this.isAllSelectedPlazasDisponible() ? this.selectionPlazasDisponible.clear() : this.dtSourceDisponible.data.forEach((row) =>
            this.selectionPlazasDisponible.select(row)
        );
    };

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

    ngAfterViewInit() {
        
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoCentroTrabajo: [null],
            codigoPlaza: [null],
        });

        this.formGrid = this.formBuilder.group({
            ls_grid: this.formBuilder.array([
            ])
        });

        this.formPostulante = this.formBuilder.group({
            correoElectronico: [null, null],
            direccionDomicilio: [null, null],
        });
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    handleBuscar = () => {
        this.setRequest();

        if (this.request.codigoPlaza) {
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(this.request.codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (this.request.codigoCentroTrabajo) {
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(this.request.codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }

        this.loadingDisponible = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().getBuscarPlazasDisponiblePUN(this.request).pipe(
            catchError((e) => of([e])),
            finalize(() => {
                this.loadingDisponible = false;
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((d: any) => {
            this.dtSourceDisponible = new MatTableDataSource<any>(d || []);
            this.dtSourceDisponible.paginator = this.paginatorDisponible;
        });
    }

    handleBuscarAdjudicada = () => {  
        let d = {
            idAdjudicacion: this.idAdjudicacion
        };
        this.loadingAdjudicar = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().getBuscarPlazasAdjudicadaPUN(d).pipe(
            catchError((e) => of([e])),
            finalize(() => {
                this.loadingAdjudicar = false;
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((d: any) => {
            this.dtSourceAdjudicar = new MatTableDataSource<any>(d || []);
            this.dtSourceAdjudicar.paginator = this.paginatorAdjudicar;
            this.DataBindAdjudicacion();
        });
    }

    CalcularPuntajeObtenidoPUN() {
        let puntajeObtenido = 0;
        if (this.dtSource != null && this.dtSource.length > 0) {
            let data = this.dtSource[0].data;
            if (data.length > 0) {
                data.forEach(d => {
                    if (isNaN(parseFloat(d.puntajePUN))) {
                        puntajeObtenido += 0;
                    } else {
                        puntajeObtenido += parseFloat(d.puntajePUN);
                    }
                });
            }
        }
        return puntajeObtenido;
    }

    obtenerInformación = () => {
        var d = {
            idAdjudicacion: this.idAdjudicacion
        };
        this.dataService.Contrataciones().getObtenerAdjudicacion(d).pipe(catchError(() => of([])),
            finalize(() => {
                this.working = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Informacion recuoerada de ObtenerAdjudicacion:", response);
                this.info = response;
                this.displayedColumns = [];
                this.rubroCab = [];

                this.info.calificacion.rubro = this.info.calificacion.rubro.filter(x => x.codigoRubro == RubroCalificacionEnum.RESULTADOS_PUN);
                this.rubroCab = this.info.calificacion.rubro[0];
                this.info.calificacion.rubro.forEach((r, i) => {
                    this.dtSource[i] = new EvaluacionDataSource(this.dataService);
                    let d = {
                        idCalificacionResultadoRubro: r.idCalificacionResultadoRubro,
                        idMaestroRubroCalificacion: r.idMaestroRubroCalificacion
                    }
                    this.displayedColumns[i] = [
                        "codigoCriterio",
                        "descripcionCriterio"
                    ];
                    if (r.idTipoPuntaje == TipoPuntajeEnum.NO_APLICA) {
                        this.displayedColumns[i].push("puntaje");
                    }
                    if (r.idTipoPuntaje == TipoPuntajeEnum.CUMPLE) {
                        this.displayedColumns[i].push("cumpleDocumento");
                    }
                    if (r.idTipoPuntaje == TipoPuntajeEnum.PUNTAJE) {
                        this.displayedColumns[i].push("puntajeMaximo");
                        this.displayedColumns[i].push("descripcionUnidadMedida");
                        this.displayedColumns[i].push("acreditaDocumento");
                        this.displayedColumns[i].push("cantidad");
                        this.displayedColumns[i].push("puntajeObtenido");
                    }
                    this.dtSource[i].load(d);
                });
            }
        });
    }


    onFormValue = ($event) => {
	let value = $event
	let keys:string[] = Object.keys(value);
	keys.forEach(key => {
	   this.formPostulante.get(key).setValue(value[key]);
	});
    }

    handleAgregar = () => {
        if (this.selectionPlazasDisponible.selected.length == 0) {
            this.dataService.Message().msgWarning('SELECCIONE ALGUN REGISTRO', () => {});
        } else {
	    var sumaJornadaLaboral =  this.selectionPlazasDisponible
					  .selected
					  .map(x => parseInt( x.jornadaLaboral.split(' ')[0]))
					  .reduce((a,b)=>a+b,0);
	    if(sumaJornadaLaboral > 30){
		this.dataService.Message().msgWarning('"LA SUMA DE JORNADA LABORAL DE LAS PLAZAS SELECCIONADAS SOBRE PASAN A 30 HORAS"', () => {});
		return;
	    }


            let finish = [];
            let adjudicado = this.dtSourceAdjudicar.filteredData;
            this.dtSourceAdjudicar = new MatTableDataSource<any>([]);
            this.dataService.Message().msgConfirm('¿ESTÁ SEGURO AGREGAR LOS REGISTROS?', () => {
                let data = this.selectionPlazasDisponible.selected;
                let index = 1;
                data.forEach(d => {
                    d.numero_registro = index;
                    let existe = adjudicado.filter(x => x.idPlazaContratacionDetalle == d.idPlazaContratacionDetalle)[0];
                    if (existe == null) {
                        d.vigenciaInicioContrato = null;
                        d.vigenciaFinContrato = null;
                        finish.push(d);
                        index++;
                    }
                });
                adjudicado.forEach(d => {
                    d.numero_registro = index;
                    finish.push(d);
                    index++;
                });
                this.dtSourceAdjudicar = new MatTableDataSource<any>(finish || []);
                this.dtSourceAdjudicar.paginator = this.paginatorAdjudicar;
                this.DataBindAdjudicacion();
            }, () => {
                this.dtSourceAdjudicar = new MatTableDataSource<any>(adjudicado || []);
                this.dtSourceAdjudicar.paginator = this.paginatorAdjudicar;
                this.DataBindAdjudicacion();
            });
        }
    }


    DataBindAdjudicacion = () => {
        let filas = this.formBuilder.array([]);
        this.dtSourceAdjudicar.data.forEach(x => {
            let ini = x.vigenciaInicioContrato == null ? null : (new Date(x.vigenciaInicioContrato));
            let fin = x.vigenciaFinContrato == null ? null : (new Date(x.vigenciaFinContrato));

            filas.push(this.formBuilder.group({
                ini: [ini, Validators.required],
                fin: [fin, Validators.required]
            }));
        });

        this.formGrid = this.formBuilder.group({
            ls_grid: filas
        });
    }

    handleAdjudicarPlaza = () => {
        if (this.dtSourceAdjudicar.filteredData.length == 0) {
            this.dataService.Message().msgWarning('No tiene plaza(s) a adjudicar', () => {});
        } else {
            if (!this.formGrid.valid) {
                this.dataService.Message().msgWarning(MensajesSolicitud.M08, () => { });

                Object.keys(this.form.controls).forEach(field => {
                    const control = this.form.get(field);
                    control.markAsTouched({ onlySelf: true });
                });
                return;
            }

	    let correoElectronico = this.formPostulante.get('correoElectronico');
	    if(correoElectronico.value){
		correoElectronico.setValidators([Validators.email]);
		correoElectronico.updateValueAndValidity();
		if(!correoElectronico.valid){
		    this.dataService.Message().msgWarning('"EL CORREO INGRESADO NO TIENE EL FORMATO CORRECTO."', () => {});
		    return;
		}
	    }


            this.dataService.Message().msgConfirm(MensajesSolicitud.M02, () => {
                this.dataService.Spinner().show("sp6");
                this.setRequestAdjudicar(this.formGrid.controls.ls_grid);
                this.dataService.Contrataciones().putAdjudicarPlazaPUN(this.requestAdjudicar).pipe(
                    catchError((e) => of([e])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    }))
                    .subscribe((response: any) => {
                        if (response > -1) {
                            this.dataService.Message().msgSuccess(MensajesSolicitud.M07, () => {});
                            this.handleBuscar();
                            this.handleBuscarAdjudicada();
                            this.handleRetornar();
                        } else {
                            let r = response[0];
                            if (r.status == ResultadoOperacionEnum.InternalServerError) {
                                this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                            } else if (r.status == ResultadoOperacionEnum.NotFound) {
                                this.dataService.Message().msgWarning(r.message, () => { });
                            } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                                this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                            } else if (r.error.errors.Error.length > 0) {
                                this.dataService.Message().msgWarning(r.error.errors.Error[0], () => { });
                            } else {
                                this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                            }
                        }
                    });
            }, () => {});
        }
    }

    handleEliminar = (row) => {
        let finish = [];
        //let adjudicado = this.dtSourceAdjudicar.filteredData;
        let adjudicadoTmp = this.dtSourceAdjudicar.filteredData;
        let adjudicado = this.setAdjudicarTmp(adjudicadoTmp, this.formGrid.controls.ls_grid);

        this.dtSourceAdjudicar = new MatTableDataSource<any>([]);
        this.dataService.Message().msgConfirm(MensajesSolicitud.M05, () => {
            if (row.idAdjudicacionDetalle == null) {
                let index = 1;
                finish = adjudicado.filter(x => x != row);
                finish.forEach(d => {
                    d.numero_registro = index;
                    index++;
                });
                this.dtSourceAdjudicar = new MatTableDataSource<any>(finish || []);
                this.dtSourceAdjudicar.paginator = this.paginatorAdjudicar;
                this.DataBindAdjudicacion();
            } else {
                this.dataService.Spinner().show("sp6");
                let d = {
                    idAdjudicacionDetalle: row.idAdjudicacionDetalle,
                    usuarioModificacion: this.passport.numeroDocumento
                };
                this.dataService.Contrataciones().postEliminarAdjudicacionPlazaPUN(d).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message().msgSuccess(MensajesSolicitud.M07, () => {});
                        this.handleBuscar();
                        this.handleBuscarAdjudicada();
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
                    }
                });
            }
        }, () => {
            this.dtSourceAdjudicar = new MatTableDataSource<any>(adjudicado || []);
            this.dtSourceAdjudicar.paginator = this.paginatorAdjudicar;
            this.DataBindAdjudicacion();
        });
    }

    resetForm = () => {
        this.form.reset();
    };

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1300px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
                this.centroTrabajoFiltroSeleccionado = { ...result.centroTrabajo };
            }
        });
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "1200px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
		idRegimenLaboral: RegimenLaboralEnum.LEY_30328,
        codigoCentroTrabajoMaestro: this.passport.codigoSede

            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }

    setRequest(): void {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        const formulario = this.form.getRawValue();

        let codigoPlaza = formulario.codigoPlaza ? formulario.codigoPlaza : null;
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo ? formulario.codigoCentroTrabajo : null;

        this.request = {
            idAdjudicacion: this.idAdjudicacion,
            idEtapaProceso: this.idEtapaProceso,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo, 
            codigoCentroTrabajoMaestro: this.passport.codigoSede, 

        };
        
    }
    
    setRequestAdjudicar(ls_grid: any): void {
        let plazas = [];
        
        ls_grid.controls.forEach((x, index) => {
            let d = {
                idAdjudicacionDetalle: this.dtSourceAdjudicar.data[index].idAdjudicacionDetalle,
                idAdjudicacion: this.idAdjudicacion,
                idPlazaContratacionDetalle: this.dtSourceAdjudicar.data[index].idPlazaContratacionDetalle,
                cantidadJornadaLaboral: this.dtSourceAdjudicar.data[index].cantidadJornadaLaboral,
                inicioContrato: x.controls.ini.value,//this.dateToString(x.controls.ini.value),
                finContrato: x.controls.fin.value//this.dateToString(x.controls.fin.value)
            }
            plazas.push(d);
        });
        
        this.requestAdjudicar = {
            idAdjudicacion: this.idAdjudicacion,
            usuarioModificacion: this.passport.numeroDocumento,
            plazas: plazas,
	    idPersona: null,
	    correoElectronico: null,
	    direccion: null
        }

	if(this.formPostulante.get('correoElectronico').value || 
	   this.formPostulante.get('direccionDomicilio').value)
	    {
		this.requestAdjudicar = {
		    ...this.requestAdjudicar,
		    idPersona: this.idPersona,
		    correoElectronico: this.formPostulante.get('correoElectronico').value,
		    direccion: this.formPostulante.get('direccionDomicilio').value
		};
	    }

    }

    setAdjudicarTmp(adjudicado: any, ls_grid: any): any {
        adjudicado.forEach((x, index) => {
            x.vigenciaInicioContrato = ls_grid.controls[index].controls.ini.value,
            x.vigenciaFinContrato = ls_grid.controls[index].controls.fin.value
        });
        return adjudicado;
    }

    handleRetornar = () => {
        this.router.navigate(["./../../../"], { relativeTo: this.route });
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
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Resultados de PUN");
        this.sharedService.setSharedTitle("Adjudicar Plaza");
        this.handleBuscarAdjudicada();
    }

    dateToString(d: Date) {
        try {
            return ('00' +  d.getDate()).slice(-2) + '/' + ('00' +  (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
        } catch (error) {
            return '';
        }
    }
    informacionValidacionPlazaView = (id) => {
        // console.log("datos de row",id)
        this.dialogRef = this.materialDialog.open(InformacionPlazaValidacionComponent, {
            panelClass: "informacion-validacion-plazas-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idPlaza: id
            },
        });
    };
}

export class EvaluacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(
	private dataService: DataService
    ) {
        super();
    }

    load(data: any): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idCalificacion === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Contrataciones().getObtenerCalificacionRubroDetalle(data).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((d: any) => {
                this._dataChange.next(d || []);
                this.totalregistro = (d || []).length === 0 ? 0 : d[0].total_registros;
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
