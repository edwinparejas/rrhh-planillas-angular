import {
    Component,
    OnInit,
    Inject,
    ViewEncapsulation,
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

import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { GlobalsService } from "app/core/shared/globals.service";
import { StorageService } from "app/core/data/services/storage.service";

import {
    MISSING_TOKEN,
    PassportTipoSede,
    TablaNivelInstancia,
    TablaNivelInstanciaCodigo,
    TablaTipoCentroTrabajo,
    TablaTipoOperacion,
    TablaUsuarioRol,
} from "app/core/model/types";
import { PASSPORT_MESSAGE } from "app/core/model/message";
import { TablaRotacionNivelInstancia } from "../../_utils/constants";

@Component({
    selector: "minedu-busqueda-centros-trabajo",
    templateUrl: "./busqueda-centros-trabajo.component.html",
    styleUrls: ["./busqueda-centros-trabajo.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BusquedaCentrosTrabajoComponent
    implements OnInit, AfterViewInit {
    private dataSubscription: Subscription;
    private _loadingChange = new BehaviorSubject<boolean>(false);

    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;

    form: FormGroup;
    working = false;

    dialogTitle: string;
    action: string;
    idTipoOperacion: any;
    registrado: boolean = false;

    dialogRef: any;

    instancias: any[];
    subinstancias: any[];
    tiposCentroTrabajo: any[];
    modalidades: any[] = [];
    nivelesEducativos: any[] = [];

    filtro = {
        idTipoOperacion: null,
        idNivelInstancia: null,
        idInstancia: null,
        idSubinstancia: null,
        idTipoCentroTrabajo: null,
        institucionEducativa: null,
        registrado: null,

        idModalidadEducativa: null,
        idNivelEducativo: null
    };

    mostrarInstancia : boolean = false;
    mostrarSubinstancia: boolean = false;
    mostrarTipoCentroTrabajo: boolean = false;
    mostrarModalidadNivelEducativo: boolean = false;
    mostrarInstitucionEducativa: boolean = false;

    tieneEstructuraOrganica = null;
    permiteBuscar: boolean = true;
    displayedColumns: string[] = [
        "index",
        "idCentroTrabajo",
        "codigoCentroTrabajo",
        "anexo",
        "id",
        "centroTrabajo",
        "instancia",
        "subinstancia",
        "idTipoCentroTrabajo",
        "tipoCentroTrabajo",
        "modalidadEducativa",
        "nivelEducativo",
    ];

    dataSource: CentroTrabajoDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild("paginatorCentroTrabajo", { static: true })
    paginator: MatPaginator;

    constructor(
        public matDialogRef: MatDialogRef<BusquedaCentrosTrabajoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private storageService: StorageService,
        private materialDialog: MatDialog
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        console.log('data',this.data)
        this.action = this.data.action;
        this.idTipoOperacion = this.data.idTipoOperacion;
        this.registrado = this.data.registrado;
        this.dialogTitle = "Búsqueda de centro de trabajo";
        this.filtro.idTipoOperacion = this.data.idTipoOperacion;
        const rol =  this.dataService.Storage().getPassportRolSelected();
        console.log('ROL', rol)

        console.log('passport', this.dataService.Storage().passport)

        if(parseInt(this.dataService.Storage().passport.idNivelInstancia) === TablaRotacionNivelInstancia.DRE ){
            this.mostrarSubinstancia = false;
        } 

        this.buildForm();
        this.buildData();

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

        this.permiteBuscar = this.data.centrosTrabajos == null ? true : false;
        if (!this.permiteBuscar) {
            this.dataSource.loadData(this.data.centrosTrabajos);
            return;
        }

        if(rol.CODIGO_TIPO_SEDE === PassportTipoSede.IE){
            this.mostrarInstancia = false;
            this.mostrarSubinstancia = false;
            this.mostrarTipoCentroTrabajo = true;
        }

    }

    buildForm() {
        this.form = this.formBuilder.group({
            idTipoOperacion: [null],
            idNivelInstancia: [null],
            idInstancia: [null],
            idSubinstancia: [null],
            idTipoCentroTrabajo: [null],
            institucionEducativa: [null],
            idModalidadEducativa: [null],
            idNivelEducativo: [null]
        });

        this.form.get("idInstancia").valueChanges.subscribe((value) => {
            this.form.patchValue({ idSubinstancia: "-1", idTipoCentroTrabajo: "-1" });
            this.mostrarSubinstancia = false;
            console.log('12', value);
            if (value && value !== "-1") {
                console.log('entre');
                let idNivelInstancia = null;
                let idInstancia = null;
                this.subinstancias = [];
                this.tiposCentroTrabajo = [];
                const data = this.instancias.find( (x) => x.idInstancia === value);
                idNivelInstancia = parseInt(value.split("-")[0]);
                idInstancia = data.id;
                console.log('idNivelInstancia', idNivelInstancia)
                switch (idNivelInstancia) {
                    case TablaRotacionNivelInstancia.MINEDU: {
                        if (value) {
                            this.mostrarOpciones(true, false, true, false, false);
                            this.loadTipoCentroTrabajo(idNivelInstancia, true);
                            this.mostrarInstanciaSeleccionada(parseInt(this.storageService.passport.idNivelInstancia));
                        }
                        break;
                    }
                    case TablaRotacionNivelInstancia.DRE: {
                        if (value) {
                            this.mostrarOpciones(false, true, false, false, false);
                            this.loadSubinstancia(idInstancia, true);
                            this.mostrarInstanciaSeleccionada(parseInt(this.storageService.passport.idNivelInstancia));
                        }
                        break;
                    }
                }
            }
            
        });

        this.form.get("idSubinstancia").valueChanges.subscribe((value) => {
            this.form.patchValue({ idTipoCentroTrabajo: "-1" });
            this.mostrarTipoCentroTrabajo = false;
            this.mostrarModalidadNivelEducativo = false;
            this.mostrarInstitucionEducativa = false;
            
            if(parseInt(this.storageService.passport.idNivelInstancia)===TablaRotacionNivelInstancia.DRE){
                value = this.subinstancias[0].idSubinstancia;
                this.mostrarOpciones(false, false, true, false, false);
            }


            if (value && value !== "-1") {
                let idNivelInstancia = null;
                let idSubinstancia = null;

                this.tiposCentroTrabajo = [];

                const data = this.subinstancias.find(
                    (x) => x.idSubinstancia === value
                );
                idNivelInstancia = parseInt(value.split("-")[0].toString());
                idSubinstancia = data.id;

                switch (parseInt(this.storageService.passport.idNivelInstancia)) {
                    case TablaRotacionNivelInstancia.MINEDU: {
                        if (value) {
                            this.mostrarOpciones(true, true, true, false, false);
                            this.loadTipoCentroTrabajo(idNivelInstancia, true);
                        }
                        break;
                    }
                    case TablaRotacionNivelInstancia.DRE: {
                      
                        if (value) {
                            this.mostrarOpciones(false, false, true, false, false);
                            this.loadTipoCentroTrabajo(idNivelInstancia, true);
                        }
                        break;
                    }
                    case TablaRotacionNivelInstancia.UGEL: {
                        if (value) {
                            this.mostrarOpciones(false, false, true, false, false);
                            this.loadTipoCentroTrabajo(idNivelInstancia, true);
                        }
                        break;
                    }
                }
            }
        });

        this.form.get("idTipoCentroTrabajo").valueChanges.subscribe((value) => {
            this.form.patchValue({ idModalidadEducativa: "-1", idNivelEducativo: "-1", institucionEducativa: '' });
            this.mostrarModalidadNivelEducativo = false;
            this.mostrarInstitucionEducativa = false;

            if (value && value !== "-1") {
                const tipoCentroTrabajo = this.tiposCentroTrabajo.find(pred => pred.idTipoCentroTrabajo === value);
                if (tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitucionEducativaDRE||
                    tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitucionEducativaUgel) {
                    this.mostrarInstitucionEducativa = true;
                } else {
                    this.mostrarInstitucionEducativa = false;
                }
    
                if (tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitucionEducativaDRE ||
                    tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitucionEducativaUgel ||
                    tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitutoSuperiorDRE ||
                    tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitutoSuperiorUgel
                ) {
                    this.mostrarModalidadNivelEducativo = true;
                    this.getModalidadesEducativas();
                } else {
                    this.mostrarModalidadNivelEducativo = false;
                }
            }
        });

        this.form.get("idModalidadEducativa").valueChanges.subscribe((value) => {
            this.nivelesEducativos = [];
            this.form.patchValue({ idNivelEducativo: null });
            if (value && value !== "-1") {
                this.getNivelesEducativos(value);
            }
        });
    }

    buildData() {
        this.mostrar(parseInt(this.storageService.passport.idNivelInstancia));
        const rol =  this.dataService.Storage().getPassportRolSelected();
        const Ugel =parseInt(TablaRotacionNivelInstancia.UGEL.toString());

        switch (parseInt(this.storageService.passport.idNivelInstancia)) {
            case TablaRotacionNivelInstancia.MINEDU: {
                this.loadInstancia(true);
                break;
            }
            case TablaRotacionNivelInstancia.DRE: {
                if(rol.CODIGO_TIPO_SEDE === PassportTipoSede.IE){
                    this.loadTipoCentroTrabajo(Ugel,true);
                }else{
                    this.loadSubinstancia(parseInt(this.storageService.passport.idEntidadSede),true);
                }                
                break;
            }
            case TablaRotacionNivelInstancia.UGEL: {
                this.loadTipoCentroTrabajo(parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia),true);
                break;
            }
        }
    }

    default() {
        this.form.patchValue({
            idInstancia: "-1",
            idSubinstancia: "-1",
            idTipoCentroTrabajo: "-1",

            idModalidadEducativa: "-1",
            idNivelEducativo: "-1"
        });
        this.form.controls["institucionEducativa"].reset();
    }

    ngAfterViewInit() {
        this.paginator.page.subscribe(() => this.loadData());
    }

    loadData() {
        if (!this.filtro) {
            this.dataService
                .Util()
                .msgWarning(
                    "Debe ingresar al menos un criterio de búsqueda.",
                    () => { }
                );
            return;
        }
        this.dataSource.load(
            this.filtro,
            (this.paginator.pageIndex + 1).toString(),
            this.paginator.pageSize.toString()
        );
    }

    ngOnDestroy(): void { }

    loadInstancia(activo) {
        this.dataService
            .Rotacion()
            .listarInstancia(activo)
            .pipe(
                catchError((e) => of(e)),
                map((response: any) => response)
            )
            .subscribe((response) => {
                if (response && response.result) {
                    this.instancias = response.data;
                    /* El usuario que tiene el ROL Especialista de AIRHSP solo puede generar plazas para MINEDU*/
                    if (
                        parseInt(this.storageService.passport.idRolPassport) ===
                        TablaUsuarioRol.EspecialistaAIRHSP
                    ) {
                        this.form.controls["idInstancia"].setValue(
                            this.instancias[0].idInstancia
                        );
                        this.form.controls["idInstancia"].disable();
                    } else {
                        this.form.controls["idInstancia"].setValue("-1");
                        this.form.controls["idInstancia"].enable();
                    }
                } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    }

    loadSubinstancia(idInstancia, activo) {
        this.dataService
            .Rotacion()
            .listarSubinstancia(idInstancia, activo)
            .pipe(
                catchError((e) => of(e)),
                map((response: any) => response)
            )
            .subscribe((response) => {
                if (response && response.result) {
                    this.subinstancias = response.data;
                    this.form.controls["idSubinstancia"].setValue("-1");
                } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    }

    loadTipoCentroTrabajo(codigoNivelInstancia, activo) {
        this.dataService
            .Rotacion()
            .listarTipoCentroTrabajo(codigoNivelInstancia, activo)
            .pipe(
                catchError((e) => of(e)),
                map((response: any) => response)
            )
            .subscribe((response) => {
                console.log('loadTipoCentroTrabajo', response);
                if (response) {
                    this.tiposCentroTrabajo = response;
                    if (this.tiposCentroTrabajo.length === 1) {
                        this.form.controls["idTipoCentroTrabajo"].setValue(this.tiposCentroTrabajo[0].idTipoCentroTrabajo);
                        this.form.controls["idTipoCentroTrabajo"].disable();
                    } else {
                        this.form.controls["idTipoCentroTrabajo"].setValue("-1");
                        this.form.controls["idTipoCentroTrabajo"].enable();
                    }
                } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    }

    private getModalidadesEducativas() {
        this.dataService.Spinner().show("sp6")
        this.dataService.Rotacion().getModalidadEducativa()
            .pipe(
                catchError((e) => { return of(e); }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                this.modalidades = [];
                if (response && response.result) {
                    this.modalidades = response.data;
                } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    }

    private getNivelesEducativos(idModalidadEducativa) {
        if (!idModalidadEducativa)
            return;
        this.dataService.Spinner().show("sp6")
        this.dataService.Rotacion().getNivelEducativo(idModalidadEducativa)
            .pipe(
                catchError((e) => { return of(e); }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                this.nivelesEducativos = [];
                if (response && response.result) {
                    this.nivelesEducativos = response.data;
                } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    }

    cancelar() {
        this.resetFiltro();
        this.matDialogRef.close();
    }

    limpiar(){
        this.resetFiltro();
        this.mostrarModalidadNivelEducativo = true;
        this.mostrarInstitucionEducativa = true;
        this.buildData();
    }

    buscar() {
        this.setFiltro();
        // if (this.form.value.idInstancia === '-1') {
        if (this.filtro.idInstancia === "-1") {
            this.dataService
                .Util()
                .msgWarning(
                    "Debe ingresar al menos un criterio de búsqueda.",
                    () => { }
                );
            return;
        }
        this.dataSource.load(
            this.filtro,
            this.paginator.pageIndex + 1,
            this.globals.paginatorPageSize
        );
    }

    setFiltro() {
        const data = this.form.getRawValue();
        const rol =  this.dataService.Storage().getPassportRolSelected();

        this.resetFiltroBuscar();
        if (data.idInstancia !== null && data.idInstancia !== "-1") {
            this.filtro.idNivelInstancia = parseInt(
                data.idInstancia.split("-")[0]
            );
            this.filtro.idInstancia = parseInt(data.idInstancia.split("-")[1]);
        } else {
            this.filtro.idNivelInstancia = parseInt(
                this.storageService.passport.idNivelInstancia
            );
        }

        if (data.idSubinstancia !== null && data.idSubinstancia !== "-1") {
            this.filtro.idNivelInstancia = parseInt(
                data.idSubinstancia.split("-")[0]
            );
            this.filtro.idSubinstancia = parseInt(
                data.idSubinstancia.split("-")[1]
            );
        } else {
            if (this.filtro.idNivelInstancia !== TablaRotacionNivelInstancia.MINEDU) {
                switch (
                parseInt(this.storageService.passport.idNivelInstancia)
                ) {
                    case TablaRotacionNivelInstancia.DRE: {
                        if(rol.CODIGO_TIPO_SEDE === PassportTipoSede.IE){
                            this.filtro.idInstancia =  parseInt(this.storageService.passport.idDre);
                            this.filtro.idNivelInstancia = parseInt(TablaRotacionNivelInstancia.UGEL.toString());
                            this.filtro.idSubinstancia = parseInt(this.storageService.passport.idEntidadSede);                        
                        }
                        else{
                            this.filtro.idInstancia = this.filtro.idInstancia ? this.filtro.idInstancia : parseInt(this.storageService.passport.idEntidadSede);
                        }                      
                        break;
                    }
                    case TablaRotacionNivelInstancia.UGEL: {
                        if (data.idSubinstancia === null) {
                            this.filtro.idNivelInstancia = parseInt(this.storageService.passport.idNivelInstancia);
                            this.filtro.idSubinstancia = parseInt(this.storageService.passport.idEntidadSede);
                        }
                        break;
                    }
                }
            }
        }

        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
            this.filtro.idTipoCentroTrabajo = data.idTipoCentroTrabajo;
        }

        this.filtro.idTipoOperacion = this.idTipoOperacion;
        this.filtro.registrado = this.registrado;

        switch (parseInt(this.storageService.passport.idNivelInstancia)) {
            case TablaRotacionNivelInstancia.MINEDU:
            case TablaRotacionNivelInstancia.DRE: {
                this.filtro.idInstancia = this.filtro.idInstancia? this.filtro.idInstancia: parseInt(this.storageService.passport.idEntidadSede);
                break;
            }
            case TablaRotacionNivelInstancia.UGEL: {
                if (data.idSubinstancia === null) {
                    this.filtro.idNivelInstancia = parseInt( this.storageService.passport.idNivelInstancia );
                    this.filtro.idSubinstancia = parseInt( this.storageService.passport.idEntidadSede);
                }
                break;
            }
        }

        this.filtro.institucionEducativa = data.institucionEducativa
            ? data.institucionEducativa
            : null;

        this.filtro.idModalidadEducativa = data.idModalidadEducativa ? data.idModalidadEducativa : null;
        this.filtro.idNivelEducativo = data.idNivelEducativo ? data.idNivelEducativo : null;
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        this.dataShared.sendDataSharedCentroTrabajo({ registro: selected });
        this.matDialogRef.close(selected);
    }

    mostrar(idNivelInstancia) {
        this.resetearOpciones();

        console.log('mostrar idNivelInstancia', idNivelInstancia);
        switch (idNivelInstancia) {
            case TablaRotacionNivelInstancia.MINEDU: {
                this.mostrarInstancia = true;
                break;
            }
            case TablaRotacionNivelInstancia.DRE: {
                this.mostrarSubinstancia = true;
                break;
            }
            case TablaRotacionNivelInstancia.UGEL: {
                this.mostrarTipoCentroTrabajo = true;
                break;
            }
        }
    }

    mostrarInstanciaSeleccionada(idNivelInstancia) {
        this.resetearOpciones();

        switch (idNivelInstancia) {
            case TablaRotacionNivelInstancia.MINEDU: {
                this.mostrarInstancia = true;
                this.mostrarSubinstancia = true;
                break;
            }
            case TablaRotacionNivelInstancia.DRE: {
                this.mostrarSubinstancia = true;
                break;
            }
            case TablaRotacionNivelInstancia.UGEL: {
                this.mostrarTipoCentroTrabajo = true;
                break;
            }
        }
    }
    

    mostrarOpciones(
        mostrarInstancia: boolean,
        mostrarSubinstancia: boolean,
        mostrarTipoCentroTrabajo: boolean,
        mostrarModalidadNivelEducativo: boolean,
        mostrarInstitucionEducativa: boolean
    ) {
        this.mostrarInstancia = mostrarInstancia;
        this.mostrarSubinstancia = mostrarSubinstancia;
        this.mostrarTipoCentroTrabajo = mostrarTipoCentroTrabajo;
        this.mostrarModalidadNivelEducativo = mostrarModalidadNivelEducativo;
        this.mostrarInstitucionEducativa = mostrarInstitucionEducativa;
    }

    resetearOpciones() {
        this.mostrarInstancia = false;
        this.mostrarSubinstancia = false;
        this.mostrarTipoCentroTrabajo = false;
        // this.ocultarInstitucionesEducativas = false;

        this.mostrarModalidadNivelEducativo = false;
        this.mostrarInstitucionEducativa = false;
    }

    resetFiltro() {
        this.form.clearValidators();
        this.default();
    }

    resetFiltroBuscar() {
        this.filtro = {
            idTipoOperacion: null,
            idNivelInstancia: null,
            idInstancia: null,
            idSubinstancia: null,
            idTipoCentroTrabajo: null,
            institucionEducativa: null,
            registrado: null,
            idModalidadEducativa: null,
            idNivelEducativo: null
        };
    }
}

export class CentroTrabajoDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    loadData(data: any[]) {
        this._loadingChange.next(false);
        if (data.length > 0) {
            this.totalregistro = (data[0] || [{ total: 0 }]).total;
            this._dataChange.next(data);
        } else {
            this.totalregistro = 0;
            this._dataChange.next([]);
        }
    }

    load(data: any, pageIndex, pageSize) {
        this._loadingChange.next(true);
        this.dataService.Spinner().show("sp6");

        // console.log('load data', data);
        // switch (data.idTipoOperacion) {
        //     case TablaTipoOperacion.REGISTRAR: {
                this.dataService
                    .Rotacion()
                    .getListCentroTrabajo(data, pageIndex, pageSize)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            this._loadingChange.next(false);
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response: any) => {
                        if (response && (response || []).length > 0) {
                            this.totalregistro = (
                                response[0] || [{ totalRegistro: 0 }]
                            ).totalRegistro;
                            this._dataChange.next(response || []);
                        } else if (response && (response.code === 422 || response.code === 404)) {
                            this.totalregistro = 0;
                            this._dataChange.next([]);
                            this.dataService.Message().msgWarning(response.message, () => { });
                        } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.totalregistro = 0;
                            this._dataChange.next([]);
                            this.dataService
                                .Util()
                                .msgWarning(
                                    "NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.",
                                    () => { }
                                );
                        }
                    });
            //     break;
            // }
            // case TablaTipoOperacion.RATIFICAR: {
            //     this.dataService
            //         .Rotacion()
            //         .getListCentroTrabajo(data, pageIndex, pageSize)
            //         .pipe(
            //             catchError((e) => of(e)),
            //             finalize(() => {
            //                 this._loadingChange.next(false);
            //                 this.dataService.Spinner().hide("sp6");
            //             })
            //         )
            //         .subscribe((response: any) => {
            //             if (response && response.result && (response.data || []).length > 0) {
            //                 this.totalregistro = (
            //                     response.data[0] || [{ totalRegistro: 0 }]
            //                 ).totalRegistro;
            //                 this._dataChange.next(response.data || []);
            //             } else if (response && (response.code === 422 || response.code === 404)) {
            //                 this.totalregistro = 0;
            //                 this._dataChange.next([]);
            //                 this.dataService.Message().msgWarning(response.message, () => { });
            //             } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
            //                 this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
            //             } else {
            //                 this.totalregistro = 0;
            //                 this._dataChange.next([]);
            //                 this.dataService
            //                     .Util()
            //                     .msgWarning(
            //                         "No se encontró información para los criterios de búsqueda ingresados.",
            //                         () => { }
            //                     );
            //             }
            //         });
            //     break;
            // }
            // case TablaTipoOperacion.ADECUAR: {
            //     this.dataService
            //         .Rotacion()
            //         .getListCentroTrabajo(data, pageIndex, pageSize)
            //         .pipe(
            //             catchError((e) => of(e)),
            //             finalize(() => {
            //                 this._loadingChange.next(false);
            //                 this.dataService.Spinner().hide("sp6");
            //             })
            //         )
            //         .subscribe((response: any) => {
            //             if (response && response.result && (response.data || []).length > 0) {
            //                 this.totalregistro = (
            //                     response.data[0] || [{ totalRegistro: 0 }]
            //                 ).totalRegistro;
            //                 this._dataChange.next(response.data || []);
            //             } else if (response && (response.code === 422 || response.code === 404)) {
            //                 this.totalregistro = 0;
            //                 this._dataChange.next([]);
            //                 this.dataService.Message().msgWarning(response.message, () => { });
            //             } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
            //                 this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
            //             } else {
            //                 this.totalregistro = 0;
            //                 this._dataChange.next([]);
            //                 this.dataService
            //                     .Util()
            //                     .msgWarning(
            //                         "No se encontró información para los criterios de búsqueda ingresados.",
            //                         () => { }
            //                     );
            //             }
            //         });
            //     break;
            // }
        // }
    }

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
