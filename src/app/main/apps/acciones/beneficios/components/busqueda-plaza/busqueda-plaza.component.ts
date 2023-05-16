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
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { TipoFormatoPlazaEnum,RegimenLaboralEnum } from "../../_utils/constants";
import { criterioBusqueda } from '../../models/criterioBusqueda.model';
import { SecurityModel } from "app/core/model/security/security.model";
import { HttpParams } from "@angular/common/http";

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
    codigoCentroTrabajoMaestro: string = '';
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    seleccionado: any = null;

    comboLists = {
        listRegimenLaboral: [],
    };

    request:HttpParams;

    displayedColumns: string[] = [
        "registro",
        "codigoPlaza",
        "codigoModular",
        "anexo",
        "centroTrabajo",
        "modalidadEducativa",
        "nivelEducativo",
        "cargo",
        "jornadaLaboral",
        "motivoVacancia",
        "tipoPlaza"
    ];

    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    isMobile = false;
    
   currentSession: SecurityModel = new SecurityModel();
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
        console.log("Datos recibidos de pantalla principal ", this.idEtapaProceso, this.tipoFormatoPlaza);
    }

    ngOnInit(): void {
        this.working = true;
        
        this.buildSeguridad();
        this.buildForm();
        this.handleResponsive();
        this.loadCombos();
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
        //this.dataSource.load(this.request, 1, 10);
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }
    buildSeguridad() {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    };
    loadCombos() {
        let dataLoadRegimenLaboral = {
            codigoRol: this.currentSession.codigoRol,
            codigoSede: this.currentSession.codigoSede,
            codigoTipoSede: this.currentSession.codigoTipoSede,
        }
        this.loadRegimenLaboral(dataLoadRegimenLaboral);
    };
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
            centroTrabajo: [null], 
            codigoModular: [null],
            idRegimenLaboral: [null],
        });
    };
    addParam(queryParam:HttpParams,param,value){
        if(value)
            queryParam = queryParam.set(param, value);
        return queryParam
    }
    getValueOrNullFromCero(value){
        return value==0?null:value;
      }
      getValueOrNullFromEmpy(value){
        return value==""?null:value;
      }
    cargarFiltro(): void {
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'codigoRol', this.currentSession.codigoRol);
        queryParam = this.addParam(queryParam,'codigoSede', this.currentSession.codigoSede);
        queryParam = this.addParam(queryParam,'codigoTipoSede', this.currentSession.codigoTipoSede);

        queryParam = this.addParam(queryParam,'idRegimenLaboral', this.getValueOrNullFromCero(this.form.get('idRegimenLaboral').value));
        queryParam = this.addParam(queryParam,'codigoPlaza', this.getValueOrNullFromEmpy(this.form.get('codigoPlaza').value));
        queryParam = this.addParam(queryParam,'codigoModular', this.getValueOrNullFromEmpy(this.form.get('codigoModular').value));
        queryParam = this.addParam(queryParam,'centroTrabajo', this.getValueOrNullFromEmpy(this.form.get('centroTrabajo').value));
        this.request = queryParam;

    }

    handleBuscar(): void {
        this.buscarPlaza();
    }

    buscarPlaza = () => {
        const form = this.form.value;
        if (form.codigoPlaza || form.codigoModular || form.centroTrabajo || form.idRegimenLaboral ) {
            this.cargarFiltro();
            
            if (form.codigoPlaza) {
                let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(form.codigoPlaza);
                if (!validacionCodigoPlaza.esValido) {
                    this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                    return;
                }
                }
        
            if (form.codigoModular) {
                let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(form.codigoModular);
                if (!validacionCodigoTrabajo.esValido) {
                    this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                    return;
                }
                }

            this.paginator.firstPage();
                this.dataSource.load(
                    this.request,
                    this.paginator.pageIndex + 1,
                    this.paginator.pageSize
                );
    
        } else {
            this.dataService.Message().msgAutoCloseWarningNoButton(
                '"DEBE ESPECIFICAR POR LO MENOS UN CRITERIO DE BÚSQUEDA."',3000,
                () => {});
          return;
        }
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
        this.form.get('idRegimenLaboral').setValue(0);
    }

    handleCancel = () => {
        this.matDialogRef.close();
    };

    loadRegimenLaboral(data) {
        this.dataService.Beneficios().getComboRegimenLaboralRegistro(data).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                if(result.length == 0)
                {
                    this.dataService.Message().msgInfo(
                        "NO HAY REGISTROS DE REGIMEN LABORAL", () => {
                        
                    });
                }
                var index = 0;
                result.splice(index, 0,
                    {
                        idRegimenLaboral: 0,
                        descripcionRegimenLaboral:"TODOS",
                        administrativo:false
                    });
                this.comboLists.listRegimenLaboral = result.map((x) => ({
                    ...x,
                    value: x.idRegimenLaboral,
                    label: x.descripcionRegimenLaboral,
                    administrativo:x.administrativo
                }));
            }
            
        });
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

    load(queryParam: any, pageIndex, pageSize: number,fistTime: boolean = false): void {

        //Add pagination
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('paginaTamanio', pageSize == undefined ? 5 : pageSize); 

        this._loadingChange.next(false);
        this.dataService.Spinner().show("sp6");

        this.dataService
            .Beneficios()
            .buscarPlazasPaginado(queryParam)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.totalregistro = (response[0] || [{ total: 0 }]).totalregistro;
                    this._dataChange.next(response || []);
                    if ((response || []).length === 0) {
                        if(!fistTime)
                          this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE ACUERDO CON LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
                      }
                  } else {
                    this.totalregistro = 0;
                    this._dataChange.next([]);
                  }
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
