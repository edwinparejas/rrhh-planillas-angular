import {
    Component,
    OnInit,
    Inject,
    ViewEncapsulation,
    ViewChild,
    AfterViewInit,
    OnDestroy,
} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { BehaviorSubject, of, Observable } from "rxjs";
import {
    SelectionModel,
    DataSource,
    CollectionViewer,
} from "@angular/cdk/collections";
import { FormGroup, FormBuilder } from "@angular/forms";
import { catchError, map, finalize } from "rxjs/operators";
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";

import { DataService } from "app/core/data/data.service";
import { GlobalsService } from "app/core/shared/globals.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { NivelInstanciaCodigoEnum, TablaUsuarioRol, TipoCentroTrabajoCodigoEnum } from "../../../_utils/constants";
import { CodigoDreUgelService } from "../../../services/codigo-dre-ugel.service";

@Component({
    selector: "minedu-buscar-centro-trabajo",
    templateUrl: "./buscar-centro-trabajo.component.html",
    styleUrls: ["./buscar-centro-trabajo.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BuscarCentroTrabajoComponent
    implements OnInit, AfterViewInit, OnDestroy {


    form: FormGroup;
    working = false;

    dialogTitle: string;
    action: string;
    idTipoOperacion: any;
    registrado: boolean = false;

    // dialogRef: any;

    instancias: any[];
    subinstancias: any[];
    tiposCentroTrabajo: any[];
    modalidades: any[] = [];
    nivelesEducativos: any[] = [];

    passport = {
        idNivelInstancia: null,
        codigoNivelInstancia: null,
        idEntidadSede: null,
        idRolPassport: null
    }

    filtro = {
        idTipoOperacion: null,
        idNivelInstancia: null,
        idInstancia: null,
        idSubinstancia: null,
        idTipoCentroTrabajo: null,
        institucionEducativa: null,
        registrado: null,

        idModalidadEducativa: -1,
        idNivelEducativo: -1
    };

    mostrarInstancia: boolean = false;
    mostrarSubinstancia: boolean = false;
    mostrarTipoCentroTrabajo: boolean = false;
    mostrarModalidadNivelEducativo: boolean = false;
    // mostrarInstitucionEducativa: boolean = false;

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
    currentSession: SecurityModel = new SecurityModel();
    dataSource: CentroTrabajoDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild("paginatorCentroTrabajo", { static: true })
    paginator: MatPaginator;

    constructor(
        public matDialogRef: MatDialogRef<BuscarCentroTrabajoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService,
        private codigoDreUgelService: CodigoDreUgelService
    ) {
        this.currentSession = data.currentSession;
        this.passport = data.currentSession;
    }

    ngOnInit(): void {
        this.cargarTodo();
    }


    async cargarTodo() {
        this.action = this.data.action;
        this.dialogTitle = "Búsqueda de centro de trabajo";
        this.filtro.idTipoOperacion = 1;

        this.buildForm();
        await this.datosSede();
        this.buildData();

        this.dataSource = new CentroTrabajoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) { return `0 de ${length}`; }
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
    }

    async datosSede() {

        const entidadSede = this.codigoDreUgelService.getCodigoDreUgel();
        

        const data = {
            codigoSede: entidadSede.codigoSede,
            activo: true
        }
        let isSuccess = true;
        console.log('entro');


        var response = await this.dataService.AccionesVinculacion()
            .obtenerCentroTrabajoPorCodigoSede(data).pipe(catchError((e) => {
                isSuccess = false;
                return of([e]);
            }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            // this.passport.codigoNivelInstancia = response?.codigoNivelInstancia;
            this.passport.idNivelInstancia = response?.codigoNivelInstancia;

            switch (+this.passport.idNivelInstancia) {
                case NivelInstanciaCodigoEnum.DRE:
                    this.passport.idEntidadSede = response?.idDre;
                    break;
                case NivelInstanciaCodigoEnum.UGEL:
                    this.passport.idEntidadSede = response?.idUgel;
                    break;
                default:
                    this.passport.idEntidadSede = response?.idEntidadSede;
                    break;
            }


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
            idModalidadEducativa: [-1],
            idNivelEducativo: [-1]
        });

        this.form.get("idInstancia").valueChanges.subscribe((value) => {
            this.form.patchValue({ idSubinstancia: "-1", idTipoCentroTrabajo: "-1" });
            this.mostrarSubinstancia = false;

            if (value && value !== "-1") {
                let idNivelInstancia = null;
                let codigoNivelInstancia = null;
                let idInstancia = null;
                this.subinstancias = [];
                this.tiposCentroTrabajo = [];
                const data = this.instancias.find(
                    (x) => x.idInstancia === value
                );
                // idNivelInstancia = this.passport.idNivelInstancia;
                idNivelInstancia = parseInt(value.split("-")[0]);
                //codigoNivelInstancia= this.passport.codigoNivelInstancia;
                // codigoNivelInstancia= parseInt(value.split("-")[0]);
                idInstancia = data.id;

                switch (idNivelInstancia) {
                    case NivelInstanciaCodigoEnum.MINEDU: {
                        if (value) {
                            this.mostrarOpciones(true, false, true, false, false);
                            this.loadTipoCentroTrabajo(idNivelInstancia, true);
                        }
                        break;
                    }
                    case NivelInstanciaCodigoEnum.DRE: {
                        if (value) {
                            this.mostrarOpciones(true, true, false, false, false);
                            this.loadSubinstancia(idInstancia, true);
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
            // this.mostrarInstitucionEducativa = false;

            if (value && value !== "-1") {
                let idNivelInstancia = null;
                let idSubinstancia = null;
                let codigoNivelInstancia = null;

                this.tiposCentroTrabajo = [];

                const data = this.subinstancias.find(
                    (x) => x.idSubinstancia === value
                );
                idNivelInstancia = parseInt(value.split("-")[0].toString());
                idSubinstancia = data.id;
                // codigoNivelInstancia= parseInt(value.split("-")[0]);
                switch (parseInt(this.passport.idNivelInstancia)) {
                    // switch (parseInt(idNivelInstancia)) {
                    case NivelInstanciaCodigoEnum.MINEDU: {
                        if (value) {
                            this.mostrarOpciones(true, true, true, false, false);
                            this.loadTipoCentroTrabajo(idNivelInstancia, true);
                        }
                        break;
                    }
                    case NivelInstanciaCodigoEnum.DRE: {
                        if (value) {
                            this.mostrarOpciones(false, true, true, false, false);
                            this.loadTipoCentroTrabajo(idNivelInstancia, true);
                        }
                        break;
                    }
                    case NivelInstanciaCodigoEnum.UGEL: {
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
            this.form.patchValue({ idModalidadEducativa: -1, idNivelEducativo: -1, institucionEducativa: '' });
            this.mostrarModalidadNivelEducativo = false;
            // this.mostrarInstitucionEducativa = false;

            if (value && value !== "-1") {
                const tipoCentroTrabajo = this.tiposCentroTrabajo.find(pred => pred.idTipoCentroTrabajo === value);
                if (tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitucionEducativaDRE ||
                    tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitucionEducativaUgel) {
                    // this.mostrarInstitucionEducativa = true;
                } else {
                    // this.mostrarInstitucionEducativa = false;
                }

                if (tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitucionEducativaDRE ||
                    tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitucionEducativaUgel ||
                    tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitutoSuperiorDRE ||
                    tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitutoSuperiorUgel
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
            if (value && value !== -1) {
                this.getNivelesEducativos(value);
            }
        });
    }

    buildData() {
        if (!this.passport) return;

        this.mostrar(parseInt(this.passport?.idNivelInstancia));
        switch (parseInt(this.passport?.idNivelInstancia)) {
            case NivelInstanciaCodigoEnum.MINEDU: {
                this.loadInstancia(true);
                break;
            }
            case NivelInstanciaCodigoEnum.DRE: {
                this.loadSubinstancia(
                    parseInt(this.passport.idEntidadSede),
                    true
                );
                break;
            }
            case NivelInstanciaCodigoEnum.UGEL: {
                this.loadTipoCentroTrabajo(
                    parseInt(this.passport.idNivelInstancia),
                    true
                );
                break;
            }
        }
    }

    default() {
        let idInstancia = this.form.controls["idInstancia"].value;
        let idSubinstancia = this.form.controls["idSubinstancia"].value;

        if (this.mostrarInstancia) idInstancia = "-1";
        if (this.mostrarSubinstancia) idSubinstancia = "-1";

        this.form.patchValue({
            idInstancia,
            idSubinstancia,
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
                    '"Debe ingresar al menos un criterio de búsqueda."'.toUpperCase(),
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
        
        const entidadSede = this.codigoDreUgelService.getCodigoDreUgel();

        const request = {
            codigoSede: entidadSede.codigoSede,
            activo: activo
        }
        this.dataService
            .AccionesVinculacion()
            .getComboInstancia(request)
            .pipe(
                catchError((e) => of(e)),
                map((response: any) => response)
            )
            .subscribe((response) => {
                if (response) {
                    this.instancias = response;
                    /* El usuario que tiene el ROL Especialista de AIRHSP solo puede generar plazas para MINEDU*/
                    if (
                        parseInt(this.passport.idRolPassport) ===
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
                }
            });
    }

    loadSubinstancia(idInstancia, activo) {
        const request = {
            idInstancia: idInstancia,
            activo: activo
        }
        this.dataService
            .AccionesVinculacion()
            .getComboSubinstancia(request)
            .pipe(
                catchError((e) => of(e)),
                map((response: any) => response)
            )
            .subscribe((response) => {
                if (response) {
                    this.subinstancias = response;
                    this.form.controls["idSubinstancia"].setValue("-1");
                }
            });
    }

    loadTipoCentroTrabajo(idNivelInstancia, activo) {
        this.dataService
            .AccionesVinculacion()
            .getTipoCentroTrabajo(idNivelInstancia, activo)
            .pipe(
                catchError((e) => of(e)),
                map((response: any) => response)
            )
            .subscribe((response) => {
                if (response) {
                    this.tiposCentroTrabajo = response;
                    if (this.tiposCentroTrabajo.length === 1) {
                        this.form.controls["idTipoCentroTrabajo"].setValue(
                            this.tiposCentroTrabajo[0].idTipoCentroTrabajo
                        );
                        this.form.controls["idTipoCentroTrabajo"].disable();
                    } else {
                        this.form.controls["idTipoCentroTrabajo"].setValue(
                            "-1"
                        );
                        this.form.controls["idTipoCentroTrabajo"].enable();
                    }
                }
            });
    }

    private getModalidadesEducativas() {
        this.dataService.Spinner().show("sp6")
        this.dataService
            .AccionesVinculacion()
            .getModalidadEducativa()
            .pipe(
                catchError((e) => { return of(e); }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                this.modalidades = [];
                if (response && response) {
                    this.modalidades = response;
                }
            });
    }

    private getNivelesEducativos(idModalidadEducativa) {
        if (!idModalidadEducativa)
            return;
        this.dataService.Spinner().show("sp6")
        this.dataService
            .AccionesVinculacion()
            .getNivelEducativo(idModalidadEducativa)
            .pipe(
                catchError((e) => { return of(e); }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                this.nivelesEducativos = [];
                if (response) {
                    this.nivelesEducativos = response;
                }
            });
    }

    cancelar() {
        this.resetFiltro();
        this.matDialogRef.close();
    }

    limpiar() {
        this.resetFiltro();
        this.mostrarModalidadNivelEducativo = true;
        // this.mostrarInstitucionEducativa = true;
        this.buildData();
    }

    buscar() {
        this.setFiltro();
        // if (this.form.value.idInstancia === '-1') {
        if (this.filtro.idInstancia === "-1") {
            this.dataService
                .Util()
                .msgWarning(
                    '"DEBE INGRESAR AL MENOS UN CRITERIO DE BÚSQUEDA."',
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

        this.resetFiltroBuscar();
        if (data.idInstancia !== null && data.idInstancia !== "-1") {
            this.filtro.idNivelInstancia = parseInt(
                data.idInstancia.split("-")[0]
            );
            this.filtro.idInstancia = parseInt(data.idInstancia.split("-")[1]);
            // this.filtro.idInstancia = parseInt(data.idInstancia);
        } else {
            this.filtro.idNivelInstancia = parseInt(
                this.passport.idNivelInstancia
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
            if (this.filtro.idNivelInstancia !== NivelInstanciaCodigoEnum.MINEDU) {
                switch (
                parseInt(this.passport.idNivelInstancia)
                ) {
                    case NivelInstanciaCodigoEnum.DRE: {
                        this.filtro.idInstancia = this.filtro.idInstancia
                            ? this.filtro.idInstancia
                            : parseInt(
                                this.passport.idEntidadSede
                            );
                        break;
                    }
                    case NivelInstanciaCodigoEnum.UGEL: {
                        if (data.idSubinstancia === null) {
                            this.filtro.idNivelInstancia = parseInt(
                                this.passport.idNivelInstancia
                            );
                            this.filtro.idSubinstancia = parseInt(
                                this.passport.idEntidadSede
                            );
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

        switch (parseInt(this.passport.idNivelInstancia)) {
            case NivelInstanciaCodigoEnum.MINEDU:
            case NivelInstanciaCodigoEnum.DRE: {
                this.filtro.idInstancia = this.filtro.idInstancia
                    ? this.filtro.idInstancia
                    : parseInt(this.passport.idEntidadSede);
                break;
            }
            case NivelInstanciaCodigoEnum.UGEL: {
                if (data.idSubinstancia === null) {
                    this.filtro.idNivelInstancia = parseInt(
                        this.passport.idNivelInstancia
                    );
                    this.filtro.idSubinstancia = parseInt(
                        this.passport.idEntidadSede
                    );
                }
                break;
            }
        }

        this.filtro.institucionEducativa = data.institucionEducativa
            ? data.institucionEducativa
            : null;

        this.filtro.idModalidadEducativa = data.idModalidadEducativa !== -1 ? data.idModalidadEducativa : null;
        this.filtro.idNivelEducativo = data.idNivelEducativo !== -1 ? data.idNivelEducativo : null;
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        // this.dataShared.sendDataSharedCentroTrabajo({ centroTrabajo: selected });
        this.matDialogRef.close({ centroTrabajo: selected });
    }

    mostrar(codigoNivelInstancia) {
        this.resetearOpciones();

        switch (codigoNivelInstancia) {
            case NivelInstanciaCodigoEnum.MINEDU: {
                this.mostrarInstancia = true;
                break;
            }
            case NivelInstanciaCodigoEnum.DRE: {
                this.mostrarSubinstancia = true;
                break;
            }
            case NivelInstanciaCodigoEnum.UGEL: {
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
        // this.mostrarInstitucionEducativa = mostrarInstitucionEducativa;
    }

    resetearOpciones() {
        this.mostrarInstancia = false;
        this.mostrarSubinstancia = false;
        this.mostrarTipoCentroTrabajo = false;
        // this.ocultarInstitucionesEducativas = false;

        this.mostrarModalidadNivelEducativo = false;
        // this.mostrarInstitucionEducativa = false;
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
            idModalidadEducativa: -1,
            idNivelEducativo: -1
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

        this.dataService
            .AccionesVinculacion()
            .buscarCentrosTrabajoPaginado(data, pageIndex, pageSize)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                this.totalregistro =
                    (response || []).length === 0
                        ? 0
                        : response[0].totalRegistros;
                this._dataChange.next(response || []);

                if ((response || []).length === 0) {
                    this.dataService
                        .Message()
                        .msgAutoCloseWarningNoButton(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', 3000,
                            () => { }
                        );
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

    get data(): any {
        return this._dataChange.value || [];
    }
}
