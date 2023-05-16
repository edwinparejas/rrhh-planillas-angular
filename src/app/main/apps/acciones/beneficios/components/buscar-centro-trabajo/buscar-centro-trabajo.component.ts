import {
    Component,
    OnInit,
    Inject,
    ViewEncapsulation,
    OnDestroy,
    ViewChild,
    AfterViewInit,
} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
import {
    SelectionModel,
    DataSource,
    CollectionViewer,
} from "@angular/cdk/collections";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, map, finalize } from "rxjs/operators";
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
//import { NivelInstanciaCodigoEnum, TipoCentroTrabajoCodigoEnum } from 'app/core/model/types';
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { GlobalsService } from "app/core/shared/globals.service";
import { PassportModel } from "app/core/model/passport-model";
import { CentroTrabajoEnum,NivelInstanciaCodigoEnum,PassportTipoSede,TipoCentroTrabajoCodigoEnum } from '../../_utils/constants';
import { SecurityModel } from "app/core/model/security/security.model";
import { HttpParams } from "@angular/common/http";

@Component({
    selector: "minedu-buscar-centro-trabajo",
    templateUrl: "./buscar-centro-trabajo.component.html",
    styleUrls: ["./buscar-centro-trabajo.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BuscarCentroTrabajoComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    private dataSubscription: Subscription;
    private _loadingChange = new BehaviorSubject<boolean>(false);

    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;

    form: FormGroup;
    working = false;
    dialogTitle: string;
    action: string;

    dialogRef: any;
    comboLists = {
        listInstancia: [],
        listSubInstancia: [],
        listCentroTrabajo :[],
        listModalidadEducativa:[],
        listNivelEducativo:[],
    };

    filtro: HttpParams;

    tieneEstructuraOrganica = null;

    displayedColumns: string[] = [
        "registro",
        "codigoModular",
        "anexoInstitucionEducativa",
        "institucionEducativa",
        "instancia",
        "subInstancia",
        "tipoCentroTrabajo",
        "modalidadEducativa",
        "nivelEducativo",
    ];

    // codigoSede : string=null;

    dataSource: CentroTrabajoDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild("paginatorCentroTrabajo", { static: true })
    paginator: MatPaginator;
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
    buscarPaginator:boolean=false;
    

    currentSession: SecurityModel = new SecurityModel();
    constructor(
        public matDialogRef: MatDialogRef<BuscarCentroTrabajoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.action = this.data.action;
        this.dialogTitle = "Búsqueda de centro de trabajo";
        this.buildSeguridad();
        this.buildForm();
        this.handleResponsive();
        this.buildData();
        this.buidGrid();
        console.log("Datos obtenidos de modulo principal:", this.data)
        //this.obtenerInstanciaSubinstanciaDefault();
	    //this.form.get('idInstancia').setValue(0);
    }
    buildSeguridad() {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        console.log('this.currentSession',this.currentSession);
    };
    buidGrid(){
        this.dataSource = new CentroTrabajoDataSource(this.dataService);
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
    }
    obtenerInstanciaSubinstanciaDefault(){
        console.log("codigo Sede", this.data.codigoSede)

        if(this.data.codigoSede != null){
            this.dataService.Contrataciones().getDefaultValueComboInstanciasByCodSede(this.data.codigoSede).pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log("Datos de instancia  por codSede response:",response);
                    this.form.get("idInstancia").setValue(response.idInstancia); 
		    if(response.idSubInstancia)
			this.form.get("idSubinstancia").setValue(this.obtenerIdSubInstancia(response.idSubInstancia)); 
                }
            });
        }
    }

    obtenerIdSubInstancia = (idSubInstancia:string):string => {
	var ids = idSubInstancia.split('-');
	return `3-${ids[1]}`;
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            idNivelInstancia: [null],
            idInstancia: [null],
            idSubinstancia: [null],
            idTipoCentroTrabajo: [null],
            idModalidadEducativa: [null],
            idNivelEducativo: [null],
            institucionEducativa: [null],
        });
    };
   

    buildData = () => {
        this.loadInstancia();
        this.loadTipoCentroTrabajo();
        this.loadModalidadEducativa();
    };

    ngAfterViewInit(): void {
	this.paginator.page.subscribe(() =>{
	    this.loadData(
		(this.paginator.pageIndex + 1).toString(),
		this.paginator.pageSize.toString()
	    );
	}
				     );
    }

    loadData = (pageIndex, pageSize) => {
        this.dataSource.load(this.filtro, pageIndex, pageSize);
    };

    ngOnDestroy(): void {}
    loadNivelEducativo = () => {
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'idModalidadEducativa', this.getValueOrNullFromCero(this.form.get('idModalidadEducativa').value));

       
        this.dataService
            .Beneficios()
            .getComboNivelEducativo(queryParam)
            .pipe(
                catchError(() => of([])),
                map((response: any) => response)
            )
            .subscribe((response) => {
                
                if (response) {
                    var index = 0;
                    response.splice(index, 0,
                        {
                            idNivelEducativo: 0,
                            descripcionNivelEducativo:"TODOS"
                        });
                    this.comboLists.listNivelEducativo = response.map((x) => ({
                        ...x,
                        value: x.idNivelEducativo,
                        label: x.descripcionNivelEducativo
                    }));
                }
            });
    }
    loadModalidadEducativa = () => {
        this.dataService
            .Beneficios()
            .getComboModalidadEducativa()
            .pipe(
                catchError(() => of([])),
                map((response: any) => response)
            )
            .subscribe((response) => {
                
                if (response) {
                    var index = 0;
                    response.splice(index, 0,
                        {
                            idModalidadEducativa: 0,
                            descripcionModalidadEducativa:"TODOS"
                        });
                    this.comboLists.listModalidadEducativa = response.map((x) => ({
                        ...x,
                        value: x.idModalidadEducativa,
                        label: x.descripcionModalidadEducativa
                    }));
                }
            });
    }
    addParam(queryParam:HttpParams,param,value){
        if(value)
            queryParam = queryParam.set(param, value);
        return queryParam
    }
    
    loadInstancia = () => {
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'codigoSede', this.currentSession.codigoSede);
        queryParam = this.addParam(queryParam,'codigoTipoSede', this.currentSession.codigoTipoSede);
        
        this.dataService
            .Beneficios()
            .getComboInstancia(queryParam)
            .pipe(
                catchError(() => of([])),
                map((response: any) => response)
            )
            .subscribe((response) => {
                let isDre = false;
                if (response) {
                    if(response.length>1)
                    {
                        var index = 0;
                        response.splice(index, 0,
                            {
                                idInstancia: 0,
                                descripcionInstancia:"TODOS"
                            });
                    }else 
                        if(response.length==1)
                            isDre = true;
                    
                    this.comboLists.listInstancia = response.map((x) => ({
                        ...x,
                        value: x.idInstancia,
                        label: x.descripcionInstancia
                    }));
                    if(isDre)
                    {
                        this.form.controls["idInstancia"].setValue(response[0].idInstancia);
                        this.loadSubinstancia();
                    }
                }
            });
    };

    loadSubinstancia = () => {
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'codigoSede', this.currentSession.codigoSede);
        queryParam = this.addParam(queryParam,'codigoTipoSede', this.currentSession.codigoTipoSede);
        queryParam = this.addParam(queryParam,'idInstancia', this.getValueOrNullFromCero(this.form.get('idInstancia').value));
      
        this.dataService
            .Beneficios()
            .getComboSubInstancia(queryParam)
            .pipe(
                catchError(() => of([])),
                map((response: any) => response)
            )
            .subscribe((response) => {
                let isUgel = false;
                if (response) {
                    if(response.length>1)
                    {
                        var index = 0;
                        response.splice(index, 0,
                            {
                                idSubInstancia: 0,
                                descripcionSubInstancia:"TODOS"
                            });
                    }else 
                        if(response.length==1)
                        isUgel = true;
                    
                    this.comboLists.listSubInstancia = response.map((x) => ({
                        ...x,
                        value: x.idSubInstancia,
                        label: x.descripcionSubInstancia
                    }));
                    if(isUgel)
                    {
                        this.form.controls["idSubinstancia"].setValue(response[0].idSubInstancia);
                        this.loadTipoCentroTrabajo();
                    }
                }
            });
    };

    loadTipoCentroTrabajo = () => {
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'codigoTipoSede', this.currentSession.codigoTipoSede);
       
        this.dataService
            .Beneficios()
            .getComboTipoCentroTrabajo(queryParam)
            .pipe(
                catchError(() => of([])),
                map((response: any) => response)
            )
            .subscribe((response) => {
                if (response) {
                    
                    var index = 0;
                    response.splice(index, 0,
                        {
                            idTipoCentroTrabajo: 0,
                            descripcionTipoCentroTrabajo:"TODOS"
                        });
                   
                    
                    this.comboLists.listCentroTrabajo = response.map((x) => ({
                        ...x,
                        value: x.idTipoCentroTrabajo,
                        label: x.descripcionTipoCentroTrabajo
                    }));
                    
                }
                
            });
    };
    selectModalidadEducativa(id) {
        this.loadNivelEducativo();
      }
    
    cancelar = () => {
        this.resetFiltro();
        this.matDialogRef.close();
    };

    limpiar = () => {
        if(this.currentSession.codigoTipoSede == PassportTipoSede.DRE) {
            this.form.get('idSubinstancia').setValue(0);
        }
        this.form.get('idTipoCentroTrabajo').setValue(0);
        this.form.get('idModalidadEducativa').setValue(0);
        this.form.get('idNivelEducativo').setValue(0);
        this.form.get('institucionEducativa').setValue(null);
    }

    
    buscar = () => {
        this.setFiltro();
	    this.paginator.firstPage();
        this.dataSource.load(
            this.filtro,
            this.paginator.pageIndex + 1,
            this.globals.paginatorPageSize
        );
    };

    setFiltro = () => {
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'idInstancia', this.getValueOrNullFromCero(this.form.get('idInstancia').value));
        queryParam = this.addParam(queryParam,'idSubinstancia', this.getValueOrNullFromCero(this.form.get('idSubinstancia').value));
        queryParam = this.addParam(queryParam,'idTipoCentroTrabajo', this.getValueOrNullFromCero(this.form.get('idTipoCentroTrabajo').value));
        queryParam = this.addParam(queryParam,'idModalidadEducativa', this.getValueOrNullFromCero(this.form.get('idModalidadEducativa').value));
        queryParam = this.addParam(queryParam,'idNivelEducativo', this.getValueOrNullFromCero(this.form.get('idNivelEducativo').value));
        queryParam = this.addParam(queryParam,'institucionEducativa', this.getValueOrNullFromEmpy(this.form.get('institucionEducativa').value));
        this.filtro = queryParam;
    };
    getValueOrNullFromCero(value){
        return value==0?null:value;
      }
      getValueOrNullFromEmpy(value){
        return value==""?null:value;
      }
    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        // this.dataShared.sendDataSharedCentroTrabajo({ registro: selected });
        this.matDialogRef.close({ centroTrabajo: selected });
    }
    resetFiltro = () => {
        this.form.clearValidators();
    };

    resetFiltroBuscar = () => {
        this.filtro = null;
    };
}

export class CentroTrabajoDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load = (queryParam: any, pageIndex, pageSize) => {
        this._loadingChange.next(false);
        this.dataService.Spinner().show("sp6");
        //Add pagination
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('paginaTamanio', pageSize == undefined ? 5 : pageSize); 
        
        
        this.dataService
            .Beneficios()
            .buscarCentrosTrabajoPaginado(queryParam)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((centrosTrabajo: any) => {
                this._dataChange.next(centrosTrabajo || []);
                this.totalregistro =
                    (centrosTrabajo || []).length === 0
                        ? 0
                        : centrosTrabajo[0].totalRegistros;
                if ((centrosTrabajo || []).length === 0) {
                    this.dataService
                        .Message()
                        .msgAutoCloseWarningNoButton(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',3000,
                            () => {}
                        );
                }
            });
    };

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}
