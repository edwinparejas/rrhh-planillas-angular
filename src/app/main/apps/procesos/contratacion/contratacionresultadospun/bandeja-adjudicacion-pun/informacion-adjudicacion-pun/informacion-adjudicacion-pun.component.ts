import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { Form, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { SecurityModel } from '../../../../../../../core/model/security/security.model';
import { SharedService } from '../../../../../../../core/shared/shared.service';
import { MensajesSolicitud, RubroCalificacionEnum, TipoPuntajeEnum } from '../../../_utils/constants';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'minedu-informacion-adjudicacion-pun',
    templateUrl: './informacion-adjudicacion-pun.component.html',
    styleUrls: ['./informacion-adjudicacion-pun.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class InformacionAdjudicacionPUNComponent implements OnInit {
    
    working = true;
    isMobile = false;

    form: FormGroup;
    idPersona: number;
    idCalificacion: number;
    idAdjudicacion: number;
    idEtapaProceso: number;
    info: any;
    rubro: any;
    rubroCab: any;
    dialogRef: any;
    dtSource: EvaluacionDataSource[] | null = [];
    selection = new SelectionModel<any>(true, []);
    TipoPuntajeEnum = TipoPuntajeEnum;
    displayedColumns: any[];
    
    dtSourceAdjudicar = new MatTableDataSource<any>([]);
    @ViewChild("paginatorAdjudicar", { static: true }) paginatorAdjudicar: MatPaginator;

    loadingAdjudicar = false;

    displayedColumnsResultadosPUN: string[] = [
        "codigoCriterio",
        "descripcionCriterio",
        "puntajeObtenido"
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
        "vigencia_fin"
    ];
    
    request = {
        idCalificacionDetalle: null,
        idMaestroProcesoCalificacion: null,
        anotaciones: null,
        usuarioModificacion: null,
        rubro:  null,
        puntajeFinal: null
    }

    private passport: SecurityModel = new SecurityModel();

    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        setTimeout((_) => this.buildShared());
        this.idPersona = parseInt(this.route.snapshot.params.idPersona);
        this.idCalificacion = parseInt(this.route.snapshot.params.idCalificacion);
        this.idAdjudicacion = parseInt(this.route.snapshot.params.id);
        this.idEtapaProceso = parseInt(this.route.parent.snapshot.params.id);
        this.buildForm();
        this.handleResponsive();
        this.obtenerInformación();
    }

    ngAfterViewInit() {
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            anotaciones: [null]
        });
    }

    changeCumpleCheck(event, dtIndex, rowIndex) {
        this.dtSource[dtIndex].data[rowIndex].cumpleDocumento = !this.dtSource[dtIndex].data[rowIndex].cumpleDocumento;
        
    }

    changeAcreditaDocumento(event, row, dtIndex, rowIndex) {
        this.dtSource[dtIndex].data[rowIndex].cumpleDocumento = !this.dtSource[dtIndex].data[rowIndex].cumpleDocumento;
        this.calcularPuntajeObtenidoTotal(row, dtIndex, rowIndex);
    }

    changeCantidad(event, row, dtIndex, rowIndex) {
        const html = document.getElementById("cantidad" + dtIndex + rowIndex) as HTMLInputElement;
        this.dtSource[dtIndex].data[rowIndex].cantidadUnidad = parseInt(html.value);
        this.calcularPuntajeObtenidoTotal(row, dtIndex, rowIndex);
    }

    calcularPuntajeObtenidoTotal(row, dtIndex, rowIndex) {
        let puntajeObtenido = 0;
        if (this.dtSource[dtIndex].data[rowIndex].cumpleDocumento) {
            if (row.tieneCantidad) {
                let um = this.dtSource[dtIndex].data[rowIndex].puntajeMaximoUnidad == null ? 1 : this.dtSource[dtIndex].data[rowIndex].puntajeMaximoUnidad;
                puntajeObtenido = this.dtSource[dtIndex].data[rowIndex].cantidadUnidad * um;
            } else {
                puntajeObtenido = this.dtSource[dtIndex].data[rowIndex].puntajeMaximo;
            }
        }
        this.dtSource[dtIndex].data[rowIndex].puntajeObtenido = puntajeObtenido.toFixed(1);
        this.calcularPuntajeTotal();
    }

    CalcularPuntajeObtenido(rubro, dtIndex) {
        let puntajeObtenido = 0;
        if (rubro.idTipoPuntaje == TipoPuntajeEnum.PUNTAJE || rubro.idTipoPuntaje == TipoPuntajeEnum.NO_APLICA) {
            let data = this.dtSource[dtIndex].data;
            if (data.length > 0) {
                data.forEach(d => {
                    puntajeObtenido += parseFloat(d.puntajeObtenido == null ? 0 : d.puntajeObtenido);
                });
            }
        }
        return puntajeObtenido;
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

    calcularPuntajeTotal() {
        let total = 0;
        if (this.dtSource.length > 0) {
            this.dtSource.forEach((dt, i) => {
                dt.data.forEach(d => {
                    if (d.codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN && (d.idTipoPuntaje == TipoPuntajeEnum.PUNTAJE || d.idTipoPuntaje == TipoPuntajeEnum.NO_APLICA)) {
                        total += parseFloat(d.puntajeObtenido == null ? 0 : d.puntajeObtenido);
                    }
                });
            });
        }
        this.info.puntajeFinal = total;
    }

    obtenerInformación = () => {
        var d = {
            idCalificacion: this.idCalificacion
        };
        this.dataService.Contrataciones().getObtenerCalificacion(d).pipe(catchError(() => of([])),
            finalize(() => {
                this.working = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.info = response;
                this.form.get('anotaciones').setValue(this.info.anotacionesCalificacion);
                this.displayedColumns = [];
                this.rubroCab = [];

                this.rubro = this.info.rubro.filter(x => x.codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN);
                this.rubroCab = this.info.rubro.filter(x => x.codigoRubro == RubroCalificacionEnum.RESULTADOS_PUN)[0];
                this.info.rubro.forEach((r, i) => {
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
                this.handleBuscarAdjudicada();
            }
        });
    }

    resetForm = () => {
        this.form.reset();
    };

    setRequest(): void {
        const formulario = this.form.getRawValue();

        let anotaciones = formulario.anotaciones;
        
        for (let i = 0; i < this.info.rubro.length; i++) {
            this.info.rubro[i].evaluacion = [];
            if (this.info.rubro[i].codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN) {
                this.dtSource[i].data.forEach(d => {
                    if (d.puntajeObtenido != null) {
                        d.puntajeObtenido = parseFloat(d.puntajeObtenido);
                    }
                    this.info.rubro[i].evaluacion.push(d);
                });
            }
        }
        
        this.request = {
            idCalificacionDetalle: this.info.idCalificacionDetalle,
            idMaestroProcesoCalificacion: this.info.idMaestroProcesoCalificacion,
            anotaciones: anotaciones,
            usuarioModificacion: this.passport.numeroDocumento,
            rubro: this.info.rubro.filter(x => x.codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN),
            puntajeFinal: this.info.puntajeFinal == null ? 0 : this.info.puntajeFinal
        };
    }

    handleGuardar = () => {
        this.dataService.Message().msgConfirm(MensajesSolicitud.M02, () => {
            this.dataService.Spinner().show("sp6");
            this.setRequest();
            this.dataService.Contrataciones().postGuardarCalificacion(this.request).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message().msgSuccess(MensajesSolicitud.M07, () => {});
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
        }, () => {});
    }

    handleRetornar = () => {
        this.router.navigate(["./../../../../"], { relativeTo: this.route });
    };

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
        });
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
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Resultados de PUN");
        this.sharedService.setSharedTitle("Información Completa");
    }
}

export class EvaluacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
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