import { CollectionViewer,DataSource,SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { TipoFormatoPlazaEnum } from "../../_utils/constants";
import { criterioBusqueda } from '../../models/criterioBusqueda.model';
import { SecurityModel } from "app/core/model/security/security.model";
import { ENCARGATURA_MESSAGE } from "../../_utils/message";

@Component({
    selector: "minedu-busqueda-plaza",
    templateUrl: "./busqueda-plaza.component.html",
    styleUrls: ["./busqueda-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BusquedaPlazaComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    working = false;
    form: FormGroup;

    dataSource: PlazaDataSource | null;
    selection = new SelectionModel<any>(true, []);
    tipoFormatoPlaza = TipoFormatoPlazaEnum.GENERAL;
    idEtapaProceso: number =  null;
    idRegimenLaboral: number =  null;

    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    seleccionado: any = null;

    comboLists = {
        listRegimenLaboral: [],
    };

    request = {
        codigoPlaza: null,
        descripcionCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idRegimenLaboral: null,
        butonAccion:null
    };

    displayedColumns: string[] = [
        "rowNum",
        "codigoPlaza",
        "itemPlaza",
        "descripcionTipoPlaza",
        "codigoCentroTrabajo",
        "anexoCentroTrabajo",
        "descripcionInstitucionEducativa",
        "abreviaturaModalidadEducativa",
        "descripcionNivelEducativo",
        // "descripcionRegimenLaboral",
        "descripcionCargo",
        // "descripcionAreaCurricular",
        "jornadaLaboral",
        "descripcionMotivoVacancia"        
    ];
    currentSession: SecurityModel = new SecurityModel();   
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
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

    constructor(
        public matDialogRef: MatDialogRef<BusquedaPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog
    ) {
        this.tipoFormatoPlaza =
            data?.tipoFormato != null
                ? data?.tipoFormato
                : TipoFormatoPlazaEnum.GENERAL;

        this.idEtapaProceso =
                data?.tipoFormato != null
                    ? data?.idEtapaProceso
                    : null;
        this.idRegimenLaboral =
                data?.tipoFormato != null
                    ? data?.idRegimenLaboral
                    : null;

        this.currentSession = data.currentSession;                    
    }

    ngOnInit(): void {
        this.working = true;
        this.buildForm();
        this.handleResponsive();
        this.loadRegimenLaboral();
        this.dataSource = new PlazaDataSource(this.dataService);
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

        setTimeout(()=>{
            this.buscarPlaza(false,true);
        }, 2000);       

        this.working = false;
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    ngOnDestroy(): void {}

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.buscarPlaza()
        );
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            descripcionCentroTrabajo: [null],
            codigoCentroTrabajo: [null],
            idRegimenLaboral: [null],
        });
    };

    cargarFiltro(butonAccion: boolean = false): void {       
        this.request = this.form.getRawValue();
        this.request.butonAccion=butonAccion;
    }

    handleBuscar(): void {
        this.buscarPlaza(true,false);
    }

    buscarPlaza(butonAccion: boolean = false,firstTime: boolean = false){     
        
        if(!this.form.valid){
            let mensajes="";
            if (this.form.controls.codigoCentroTrabajo.valid == false) {
                mensajes=(mensajes.length==0?ENCARGATURA_MESSAGE.M38:mensajes+", "+ENCARGATURA_MESSAGE.M38);                
            }
            if (this.form.controls.codigoPlaza.valid == false) {
                mensajes=(mensajes.length==0?ENCARGATURA_MESSAGE.M64:mensajes+", "+ENCARGATURA_MESSAGE.M64);                 
            }

            this.dataService.Message().msgWarning(mensajes, () => { });
            return;
        }
        
        if (this.form.controls.idRegimenLaboral.value === null || this.form.controls.idRegimenLaboral.value<0) {
                this.dataService.Message().msgWarning('"NO HAY REGIMEN LABORAL ELEGIDO"');
                return;
        }
        
        this.cargarFiltro(butonAccion);
        
        if (firstTime) {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
    };

    onSelect(selected: any): void {

        this.selection.clear();
        this.selection.toggle(selected);

        this.matDialogRef.close({ plaza: selected });
    }

    handleSelect = (form) => {
        if (this.seleccionado === null) {
            this.dataService
                .Message()
                .msgAutoCloseWarningNoButton('"DEBE SELECCIONAR UN REGISTRO."',3000, () => {});
        } else {
            this.matDialogRef.close({ plazaSelected: this.seleccionado });
        }
    };

    handleLimpiar(): void {
        this.form.reset();
	    if(this.idRegimenLaboral)this.setUpIdRegimenLaboral();
        this.buscarPlaza(false,true);
    }

    handleCancel = () => {
        this.matDialogRef.close();
    };

    loadRegimenLaboral = () => { 
        const data = {
        idEtapaProceso:this.idEtapaProceso,
        codTipoSede: this.currentSession.codigoTipoSede,
        codRol: this.currentSession.codigoRol
        }
        this.dataService
            .Encargatura()
            .getComboRegimenLaboral(data) // ******************* BUSCAR EN BD
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((regimeneslaborales: any) => {
                if (regimeneslaborales) {
                    const data = regimeneslaborales.map((x) => ({
                        ...x,
                        value: x.idRegimenLaboral,
                        label: `${x.descripcionRegimenLaboral}`,
                    })).filter(x =>{
                        if(this.idRegimenLaboral)
                        {
                            if(x.value == this.idRegimenLaboral)
                            return true;
                            else return false;
                        }
                        return true;	
                        });
                    this.comboLists.listRegimenLaboral = data;
        		    if(this.idRegimenLaboral) this.setUpIdRegimenLaboral();
                }
            });
    };
    setUpIdRegimenLaboral = () =>{
	if(this.idRegimenLaboral) this.form.get('idRegimenLaboral').setValue(this.idRegimenLaboral);
    }
}
export class PlazaDataSource extends DataSource<any> {
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
        this.dataService
            .Encargatura()
            .buscarPlazasTransversalPaginado(data, pageIndex, pageSize).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this._loadingChange.next(false);
            })).subscribe((result: any) => {
                this._dataChange.next(result || []);
                this.totalregistro = (result || []).length === 0 ? 0 : result[0].total;  
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
