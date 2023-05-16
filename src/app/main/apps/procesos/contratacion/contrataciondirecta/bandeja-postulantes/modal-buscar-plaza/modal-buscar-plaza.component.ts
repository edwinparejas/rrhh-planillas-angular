import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { SituacionPlazasEnum, TipoFormatoPlazaEnum } from "../../../_utils/constants";
import { criterioBusqueda } from '../../../models/criterioBusqueda.model';

@Component({
    selector: 'minedu-modal-buscar-plaza',
    templateUrl: './modal-buscar-plaza.component.html',
    styleUrls: ['./modal-buscar-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalBuscarPlazaComponent implements OnInit {

    working = false;
    form: FormGroup;
    dataSource: PlazaDataSource | null;
    selection = new SelectionModel<any>(true, []);
    tipoFormatoPlaza = TipoFormatoPlazaEnum.GENERAL;
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    seleccionado: any = null;
    idEtapaProceso: number;
    comboLists = {
        listRegimenLaboral: [],
    };

    request = {
        idEtapaProceso: null,
        codigoPlaza: null,
        codigoCentroTrabajo: null,
        idRegimenLaboral: null,
        idPlaza: null,
        idCentroTrabajo: null,
        idResultadoFinal: null,

        codigoCentroTrabajoMaestro : null,
    };
    currentSession: SecurityModel = new SecurityModel();


    displayedColumns: string[] = [
        "registro",
        "codigoPlaza",
        "codigoCentroTrabajo",
        "descripcionInstitucionEducativa",
        "abreviaturaModalidadEducativa",
        "descripcionNivelEducativo",
        "descripcionCargo",
        "descripcionTipoGestion",
        "descripcionTipoPlaza",
    ];

    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    isMobile = false;

    constructor(
        public matDialogRef: MatDialogRef<ModalBuscarPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        this.working = true;
        this.idEtapaProceso = this.data.idEtapaProceso;
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
        this.working = false;
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

    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.handleBuscar())).subscribe();
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            codigoCentroTrabajo: [null],
            idRegimenLaboral: [null],
        });

        setTimeout((_) => this.handleBuscar());
    };

    cargarFiltro(): void {
        this.request = this.form.getRawValue();
        this.request.idEtapaProceso = this.idEtapaProceso;
        this.request.idPlaza = null;
        this.request.idCentroTrabajo = null;
        this.request.idResultadoFinal = null;
        this.request.codigoCentroTrabajoMaestro = this.currentSession.codigoSede;
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


	this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    };

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        this.matDialogRef.close({ plaza: selected });
    }

    handleSelect = (form) => {
        if (this.seleccionado === null) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR UN REGISTRO."', () => {});
        } else {
            this.matDialogRef.close({ plazaSelected: this.seleccionado });
        }
    };

    handleLimpiar(): void {
        this.form.reset();
    }

    handleCancel = () => {
        this.matDialogRef.close();
    };

    loadRegimenLaboral = () => {
        this.dataService.Contrataciones().getComboRegimenLaboral().pipe(catchError(() => of([])), 
            finalize(() => {})
        )
        .subscribe((regimeneslaborales: any) => {
            if (regimeneslaborales) {
                const data = regimeneslaborales.map((x) => ({
                    ...x,
                    value: x.id_regimen_laboral,
                    label: `${x.nombre_regimen_laboral}`,
                }));
                this.comboLists.listRegimenLaboral = data;
            }
        });
    };
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

        if (data.codigoPlaza !== null && data.codigoCentroTrabajo !== null && data.idRegimenLaboral !== null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            data.idSituacionValidacion = SituacionPlazasEnum.PUBLICADO;
            
            this.dataService.Spinner().show("sp6");
            this.dataService.Contrataciones().getBuscarPlazasDirectaPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this._loadingChange.next(false);
                })
            )
            .subscribe((plazas: any) => {
                this._dataChange.next(plazas || []);
                this.totalregistro = (plazas || []).length === 0 ? 0 : plazas[0].total_registros;
                if ((plazas || []).length === 0) {
                    this.dataService.Message().msgWarning("No se encontró información de la(s) plazas para los criterios de búsqueda ingresados.", () => {});
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
