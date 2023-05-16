import {
    CollectionViewer,
    DataSource,
    SelectionModel,
} from "@angular/cdk/collections";
import {
    Component,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    AfterViewInit,
    OnDestroy,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { TipoFormatoPlazaEnum } from "../../_utils/constants";
import { criterioBusqueda } from '../../models/criterioBusqueda.model';
import { RegimenLaboralEnum } from '../../../reasignacion/_utils/constants';
import { numeroFilaGrilla } from '../../_utils/grilla';

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
    numeroFilaGrilla:any = numeroFilaGrilla;
    dataSource: PlazaDataSource | null;
    selection = new SelectionModel<any>(true, []);
    tipoFormatoPlaza = TipoFormatoPlazaEnum.GENERAL;
    idEtapaProceso: number =  null;
    idRegimenLaboral: number =  null;
    codigoCentroTrabajoMaestro: string = '';
    codigoResultadoFinal: null;
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    seleccionado: any = null;
    
    esIncorporacion:boolean = false;
    
    comboLists = {
        listRegimenLaboral: [],
    };

    request = {
        codigoPlaza: null,
        descripcionCentroTrabajo: null,
        centroTrabajo:null,
        codigoCentroTrabajo: null,
        codigoCentroTrabajoMaestro: null,
        idRegimenLaboral: null,
        tipoFormato: this.tipoFormatoPlaza,
        idEtapaProceso:null,
        esIncorporacion:false,
	codigoResultadoFinal:null
    };

    displayedColumns: string[] = [
	"numero_registro",
        "codigoPlaza",
        "itemPlaza",
        "descripcionTipoPlaza",
        "codigoCentroTrabajo",
        "anexoCentroTrabajo",
        "descripcionInstitucionEducativa",
        "abreviaturaModalidadEducativa",
        "descripcionNivelEducativo",
        "descripcionRegimenLaboral",
        "descripcionCargo",
        "descripcionAreaCurricular",
        "jornadaLaboral",
        "descripcionMotivoVacancia",
    ];

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
        this.codigoCentroTrabajoMaestro =
                data?.tipoFormato != null
                    ? data?.codigoCentroTrabajo
                    : null;
        this.esIncorporacion =
                data?.esIncorporacion != null
                    ? data?.esIncorporacion
                    : false;
        this.codigoResultadoFinal =
                data?.tipoFormato != null
                    ? data?.codigoResultadoFinal
                    : null;
    }

    ngOnInit(): void {
        this.working = true;
        this.buildForm();
        this.handleResponsive();
        this.loadRegimenLaboral();
        this.inicializarGrilla();
        this.working = false;
        //this.dataSource.load(this.request, 1, 10);
    }
    inicializarGrilla = () =>{
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

    buildForm = () => {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            descripcionCentroTrabajo: [null],
            codigoCentroTrabajo: [null],
            idRegimenLaboral: [null],
        });
    };

    cargarFiltro(): void {
        this.request = this.form.getRawValue();
        this.request.tipoFormato = this.tipoFormatoPlaza;
        this.request.idEtapaProceso = this.idEtapaProceso;
	this.request.codigoCentroTrabajoMaestro = this.codigoCentroTrabajoMaestro;
	this.request.codigoResultadoFinal = this.codigoResultadoFinal;

	if(this.request.descripcionCentroTrabajo == '')
	    this.request.descripcionCentroTrabajo =null;
	if(this.request.codigoPlaza == '')
	    this.request.codigoPlaza =null;
	if(this.request.codigoCentroTrabajo == '')
	    this.request.codigoCentroTrabajo =null;

	if(this.request.descripcionCentroTrabajo)
	    this.request.descripcionCentroTrabajo = this.request.descripcionCentroTrabajo.toUpperCase();
	if(this.request.codigoPlaza)
	    this.request.codigoPlaza = this.request.codigoPlaza.toUpperCase();
	if(this.request.idRegimenLaboral == '-1')
	    this.request.idRegimenLaboral = null;
    }

    handleBuscar(): void {
        this.buscarPlaza();
    }

    buscarPlaza = () => {
        this.cargarFiltro();
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

        this.request.esIncorporacion = this.esIncorporacion;
        console.log("data enviada request buscar plaza:", this.request, this.request.esIncorporacion)
	    this.paginator.firstPage();
            this.dataSource.load(
                this.request,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize
            );
        //}
    };

    onSelect(selected: any): void {
        // this.selection.clear();
        // this.selection.toggle(selected);
        // this.seleccionado = selected;
        // // TODO:
        // // this.dataShared.sendDataSharedBuscarDocumento({ registro: selected });

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
	//if(this.idRegimenLaboral)this.setUpIdRegimenLaboral();
	this.form.get('idRegimenLaboral').setValue('-1');
	this.paginator.firstPage();
	//this.handleBuscar();
    //    this.dataSource = new PlazaDataSource(this.dataService);
        this.inicializarGrilla();
    }

    handleCancel = () => {
        this.matDialogRef.close();
    };

    loadRegimenLaboral = () => {
        this.dataService
            .Contrataciones()
            .getComboRegimenLaboralPorRol("AYNI_004") // ******************* BUSCAR EN BD
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((regimeneslaborales: any) => {
                if (regimeneslaborales) {
                    const data = regimeneslaborales.map((x) => ({
                        ...x,
                        value: x.id_regimen_laboral,
                        label: `${x.nombre_regimen_laboral}`,
                    })).filter(x =>{
			if(this.idRegimenLaboral)
			{
			    if(this.idRegimenLaboral == RegimenLaboralEnum.LEY_30328)
			    {
				if(x.value != RegimenLaboralEnum.LEY_30493)
				    return true;
			        else return false;
			    }else{
				if(x.value == this.idRegimenLaboral)
				    return true;
				else return false;
			    }
			}
			return true;	
		    });
                    this.comboLists.listRegimenLaboral = data;
		    this.form.get('idRegimenLaboral').setValue('-1');
		    //if(this.idRegimenLaboral) this.setUpIdRegimenLaboral();
                }

            // actualizar grilla al iniciar componente de
            //this.handleBuscar();

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

        //if (
            //data.codigoPlaza === null &&
            //data.descripcionCentroTrabajo === null &&
            //data.codigoCentroTrabajo === null &&
            //data.idRegimenLaboral === null
        //) {
            //this._loadingChange.next(false);
            //this._dataChange.next([]);
        //} else {
            data.centroTrabajo = data.descripcionCentroTrabajo;
            if(data.descripcionCentroTrabajo===null)
                data.centroTrabajo = data.descripcionCentroTrabajo;
            
            this.dataService.Spinner().show("sp6");
            this.dataService
                .Contrataciones()
                .buscarPlazasPaginado(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((plazas: any) => {
                    console.log(" ******* plazas encontradas",plazas)
                    this._dataChange.next(plazas.plazasPaginadas || []);
                    this.totalregistro =
                        (plazas.plazasPaginadas || []).length === 0
                            ? 0
                            : plazas.totalElementos;
                    if ((plazas.plazasPaginadas || []).length === 0) {
                    this.dataService
		        .Message()
			.msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
                    }
                });
        //}
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
