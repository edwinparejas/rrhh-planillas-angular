import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { SharedService } from '../../../../../../../core/shared/shared.service';
import { RubroCalificacionEnum, TipoPuntajeEnum, AreaCurricularEnum, MensajesSolicitud } from '../../../_utils/constants';
import { PlazasPublicacionInformacionResponseModel } from "../../../models/contratacion.model";
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';

@Component({
    selector: 'minedu-requisitos-calificaciones',
    templateUrl: './requisitos-calificaciones.component.html',
    styleUrls: ['./requisitos-calificaciones.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class RequisitosCalificacionesComponent implements OnInit {

    working = true;
    isMobile = false;
    form: FormGroup;
    idPersona: number;
    idCalificacion: number;
    idEtapaProceso: number;
    codigoPlaza: string;
    info: any;
    rubro: any;
    dialogRef: any;
    plaza: PlazasPublicacionInformacionResponseModel = null;
    dtSource: EvaluacionDataSource[] | null = [];
    selection = new SelectionModel<any>(true, []);
    TipoPuntajeEnum = TipoPuntajeEnum;
    displayedColumns: any[];
    codigosAreaCurricular:string='';
    ieEnZonFrontera:boolean=null;
    request = {
        idCalificacionDetalle: null,
        idMaestroProcesoCalificacion: null,
        anotaciones: null,
        usuarioModificacion: null,
        rubro:  null,
        puntajeFinal: null
    }

    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.idPersona = parseInt(this.route.snapshot.params.idPersona);
        this.idCalificacion = parseInt(this.route.snapshot.params.id);
        this.codigoPlaza = this.route.snapshot.params.codigo;
        this.idEtapaProceso = parseInt(this.route.parent.snapshot.params.id);
        this.buildForm();
        this.handleResponsive();
        this.handleBuscarPlaza();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            anotaciones: [null]
        });
    }

    handleBuscarPlaza = () => {
        if (this.codigoPlaza != null && this.codigoPlaza != "") {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
                codigoPlaza: this.codigoPlaza
            };

            this.dataService.Contrataciones().getContratacionDirectaPlazaByCodigo(request).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response && response.length != 0) {
                    this.plaza = response;
		    this.codigosAreaCurricular = response.codigosAreaCurricular;
		    this.ieEnZonFrontera = response.frontera;
                } else {
                    this.dataService.Message().msgWarning('"LA PLAZA NO SE ENCUENTRA PARA EL DESARROLLO DEL PROCESO DE CONTRATACIÓN DIRECTA."', () => { });
                    this.plaza = null;
                }
		this.obtenerInformación();
            });
        } else {
            this.dataService.Message().msgWarning('"INGRESE EL CÓDIGO DE LA PLAZA A BUSCAR."', () => { });
        }
    }

    changeCumpleCheck(event, dtIndex, rowIndex) {
        this.dtSource[dtIndex].data[rowIndex].cumpleDocumento = !this.dtSource[dtIndex].data[rowIndex].cumpleDocumento;        
    }

    changeAcreditaDocumento(event, row, dtIndex, rowIndex) {
        this.dtSource[dtIndex].data[rowIndex].cumpleDocumento = !this.dtSource[dtIndex].data[rowIndex].cumpleDocumento;
    }

    changeCantidad(event, row, dtIndex, rowIndex) {
        const html = document.getElementById("cantidad" + dtIndex + rowIndex) as HTMLInputElement;
        this.dtSource[dtIndex].data[rowIndex].cantidad = parseInt(html.value);
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
                this.displayedColumns = [];
                this.rubro = this.info.rubro;
		let esNuevoRegistro:boolean = response.tieneRegistroRubro == 0;
                this.info.rubro.forEach((r, i) => {
                    this.dtSource[i] = new EvaluacionDataSource(
			                   this.dataService,
					   this.codigosAreaCurricular,
					   this.ieEnZonFrontera,
		                           esNuevoRegistro);

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
            usuarioModificacion: "ADMIN",
            rubro: this.info.rubro.filter(x => x.codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN),
            puntajeFinal: this.info.puntajeFinal == null ? 0 : this.info.puntajeFinal
        };
    }

    handleGuardar = () => {
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LA EVALUACIÓN?',
            () => {
                this.dataService.Spinner().show("sp6");
                this.setRequest();
                this.dataService.Contrataciones().postGuardarCalificacion(this.request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MensajesSolicitud.M07,3000, () => {});
                        this.handleRetornar();
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
        );
    }

    handleRetornar = () => {
        this.router.navigate(["../../../../"], { relativeTo: this.route });
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
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Directa / Calificaciones");
        this.sharedService.setSharedTitle("Revisar Requisitos");
    }

    obtenerPuntajeMaximoGrilla(row : any):string{
        return row.puntajeMaximo;
    }
}

export class EvaluacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    private _idsAreaCurricular:any;
    private _idEnZonaFrontera:boolean;
    private _esNuevoRegistro:boolean;

    constructor(
	        private dataService: DataService,
		idsAreaCurricular:any,
		ieEnZonFrontera:boolean,
                esNuevoRegistro:boolean) {
        super();
	this._idsAreaCurricular = idsAreaCurricular;
	this._idEnZonaFrontera = ieEnZonFrontera;
	this._esNuevoRegistro = esNuevoRegistro;
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
		let codigoRubro = d[0].codigoRubro;
		d.forEach(element => { 
		    element['noEsParteDeCalificacion'] = false;
		    if(this._esNuevoRegistro)
			element['cumpleDocumento'] = true; 
		});
		if(codigoRubro == '3'){
		    let codigoAreaCurricularEducacionReligiosa = AreaCurricularEnum.EducacionReligiosa;
		    let ids = this._idsAreaCurricular? this._idsAreaCurricular.split(',') : [];
		    let existeEducacionReligiosa = ids.some(item => item.trim() == codigoAreaCurricularEducacionReligiosa);
		    let ieEnZonaFrontera = this._idEnZonaFrontera;

		    d.forEach(element => {
		    	element['existeEducacionReligiosa'] = existeEducacionReligiosa;
		    	element['ieEnZonaFrontera'] =  ieEnZonaFrontera;
		    	element['noEsParteDeCalificacion'] =  this.verificarSiEsParteDeCalificaicon(element);

			if(element['noEsParteDeCalificacion'] && element.codigoCriterio == 'R1' ){
			    element['cumpleDocumento'] = false; 
			}

			if(element['noEsParteDeCalificacion'] && element.codigoCriterio == 'R2' ){
			    element['cumpleDocumento'] = false; 
			}
		    });
		}
                console.log("detalle calificacion: ",d);
                this._dataChange.next(d || []);
                this.totalregistro = (d || []).length === 0 ? 0 : d[0].total_registros;
            });
        }
    }

    private verificarSiEsParteDeCalificaicon =  (row:any):boolean =>{
	    if(row.codigoCriterio == 'R1' ){
		if(row.ieEnZonaFrontera)
		    return false;
		else
		    return true; 
	    }

	    if(row.codigoCriterio == 'R2' ){
		if(row.existeEducacionReligiosa)
		    return false;
		else 
		    return   true;
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
