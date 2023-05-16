import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { SharedService } from '../../../../../../../core/shared/shared.service';
import { RubroCalificacionEnum, TipoPuntajeEnum, AreaCurricularEnum } from '../../../_utils/constants';
import { PlazasPublicacionInformacionResponseModel } from "../../../models/contratacion.model";

@Component({
    selector: 'minedu-informacion-completa',
    templateUrl: './informacion-completa.component.html',
    styleUrls: ['./informacion-completa.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class InformacionCompletaComponent implements OnInit {

    codigosAreaCurricular:string='';
    ieEnZonFrontera:boolean=null;
    working = true;
    isMobile = false;
    form: FormGroup;
    idPersona: number;
    idCalificacion: number;
    idEtapaProceso: number;
    codigoPlaza: string;
    info: any;
    rubro: any;
    rubroCab: any;
    dialogRef: any;
    plaza: PlazasPublicacionInformacionResponseModel = null;
    dtSource: EvaluacionDataSource[] | null = [];
    selection = new SelectionModel<any>(true, []);
    TipoPuntajeEnum = TipoPuntajeEnum;
    displayedColumns: any[];
    
    displayedColumnsResultadosPUN: string[] = [
        "codigoCriterio",
        "descripcionCriterio",
        "puntajeObtenido"
    ];

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
                if (response) {
                    this.plaza = response;
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
                this.form.get('anotaciones').setValue(this.info.anotacionesCalificacion);
                this.displayedColumns = [];
                this.rubroCab = [];

                this.rubro = this.info.rubro.filter(x => x.codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN);
                this.rubroCab = this.info.rubro.filter(x => x.codigoRubro == RubroCalificacionEnum.RESULTADOS_PUN)[0];
                this.info.rubro.forEach((r, i) => {
                    this.dtSource[i] = new EvaluacionDataSource(this.dataService,this.codigosAreaCurricular,this.ieEnZonFrontera);

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
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Directa");
        this.sharedService.setSharedTitle("Revisar Requisitos");
    }

}

export class EvaluacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    private _idsAreaCurricular:any;
    private _idEnZonaFrontera:boolean;

    constructor(private dataService: DataService,
		idsAreaCurricular:any,
		ieEnZonFrontera:boolean) {
        super();
	this._idsAreaCurricular = idsAreaCurricular;
	this._idEnZonaFrontera = ieEnZonFrontera;
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
		d.forEach(element => { element['noEsParteDeCalificacion'] = false; });
		if(codigoRubro == '3'){
		    let codigoAreaCurricularEducacionReligiosa = AreaCurricularEnum.EducacionReligiosa;
		    let ids = this._idsAreaCurricular? this._idsAreaCurricular.split(',') : [];
		    let existeEducacionReligiosa = ids.some(item => item == codigoAreaCurricularEducacionReligiosa);
		    let ieEnZonaFrontera = this._idEnZonaFrontera;

		    d.forEach(element => {
		    	element['existeEducacionReligiosa'] = existeEducacionReligiosa;
		    	element['ieEnZonaFrontera'] =  ieEnZonaFrontera;
		    	element['noEsParteDeCalificacion'] =  this.verificarSiEsParteDeCalificaicon(element);
		    });
		}
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
