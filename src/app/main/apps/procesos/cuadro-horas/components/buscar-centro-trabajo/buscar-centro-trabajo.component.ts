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
import { BehaviorSubject, of, Observable, Subject } from "rxjs";
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
//import { NivelInstanciaCodigoEnum, TipoCentroTrabajoCodigoEnum } from 'app/core/model/types';
import { DataService } from "app/core/data/data.service";
import { GlobalsService } from "app/core/shared/globals.service";
import { PassportModel } from "app/core/model/passport-model";
import {
    NivelInstanciaCodigoEnum,
    TipoCentroTrabajoCodigoEnum,
} from "../../models/cuadro-horas.model";
import { SecurityModel } from "app/core/model/security/security.model";

@Component({
    selector: "minedu-buscar-centro-trabajo",
    templateUrl: "./buscar-centro-trabajo.component.html",
    styleUrls: ["./buscar-centro-trabajo.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BuscarCentroTrabajoComponent
    implements OnInit, OnDestroy, AfterViewInit {

    private _unsubscribeAll: Subject<any>;

    form: FormGroup;
    working = false;
    dialogTitle: string;
    action: string;

    dialogRef: any;

    instancias: any[];
    subinstancias: any[];
    tiposCentroTrabajo: any[];

    filtro = {
        idNivelInstancia: null,
        idInstancia: null,
        idSubinstancia: null,
        idTipoCentroTrabajo: null,
        institucionEducativa: null,
    };

    private passport: PassportModel = {
        idNivelInstancia: null,
        idEntidad: null,
        usuario: null,
    };

    ocultarInstancia = false;
    ocultarSubinstancia = false;
    ocultarTipoCentroTrabajo = false;
    ocultarInstitucionesEducativas = false;

    tieneEstructuraOrganica = null;

    displayedColumns: string[] = [
        "index",
        "idCentroTrabajo",
        "codigoCentroTrabajo",
        "anexoCentroTrabajo",
        "id",
        "centroTrabajo",
        "instancia",
        "subinstancia",
        "idTipoCentroTrabajo",
        "tipoCentroTrabajo",
        "modalidadEducativa",
        "nivelEducativo",
    ];
    disabledDre: boolean;
    disabledUgel: boolean;
    idDre = 0;
    idUgel = 0;
    currentSession: SecurityModel = new SecurityModel();
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

    constructor(
        public matDialogRef: MatDialogRef<BuscarCentroTrabajoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.action = this.data.action;
        this.idUgel = this.data.idUgelSel;
        this.idDre = this.data.idDreSel;
        if (this.idDre != null) this.disabledDre = true;
        if (this.idUgel != null) this.disabledUgel = true;
        console.log("this.data.", this.data)
        this.dialogTitle = "Búsqueda de centro de trabajo";

        this.buildForm();
        this.handleResponsive();
        this.buildData();

        this.dataSource = new CentroTrabajoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        // this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        //     if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
        //     const length2 = Math.max(length, 0);
        //     const startIndex = page * pageSize;
        //     const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
        //     return `${startIndex + 1} – ${endIndex} de ${length2}`;
        // }

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
            institucionEducativa: [null],
        });
        let pass = this.dataService.Storage().getInformacionUsuario();
        let pass2 = this.dataService.Storage().getPassportRolSelected();

        console.log("pass", pass);
        console.log("pass2", pass2);

        this.passport.idNivelInstancia = 1;
        this.passport.idEntidad = 1;

        console.log("this.passport", this.passport);

        this.form.get("idInstancia").valueChanges.subscribe((value) => {
            let idNivelInstancia = null;
            let idInstancia = null;

            this.subinstancias = [];
            this.tiposCentroTrabajo = [];

            if (value === "-1") {
                switch (this.passport.idNivelInstancia) {
                    case NivelInstanciaCodigoEnum.MINEDU: {
                        this.mostrarOpciones(true, false, false, false);
                        break;
                    }
                }
                return;
            }

            if (
                this.instancias.length !== 0 &&
                value !== null &&
                value !== undefined
            ) {
                const data = this.instancias.find(
                    (x) => x.id_instancia === value
                );
                idNivelInstancia = parseInt(value.split("-")[0]);
                idInstancia = data.id;
            }

            this.form.patchValue({
                idSubinstancia: "-1",
                idTipoCentroTrabajo: "-1",
            });

            switch (idNivelInstancia) {
                case NivelInstanciaCodigoEnum.MINEDU: {
                    if (value) {

                        const _instancia = this.instancias.find(x => x.id == idInstancia);
                        const codigoInstancia = _instancia?.codigo == "" ? null : _instancia.codigo;

                        this.mostrarOpciones(true, false, true, false);
                        this.loadTipoCentroTrabajo(idNivelInstancia, codigoInstancia, true);
                    }
                    break;
                }
                case NivelInstanciaCodigoEnum.DRE: {
                    if (value) {
                        this.mostrarOpciones(true, true, false, false);
                        this.loadSubinstancia(idInstancia, true);
                    }
                    break;
                }
            }
        });

        this.form.get("idSubinstancia").valueChanges.subscribe((value) => {
            let idNivelInstancia = null;
            let idSubinstancia = null;

            this.tiposCentroTrabajo = [];

            if (value === "-1") {
                switch (this.passport.idNivelInstancia) {
                    case NivelInstanciaCodigoEnum.MINEDU: {
                        this.mostrarOpciones(true, true, false, false);
                        break;
                    }
                    case NivelInstanciaCodigoEnum.DRE: {
                        this.mostrarOpciones(false, true, false, false);
                        break;
                    }
                }
                return;
            }

            if (
                this.subinstancias.length !== 0 &&
                value !== null &&
                value !== undefined
            ) {
                const data = this.subinstancias.find(
                    (x) => x.id_subinstancia === value
                );
                idNivelInstancia = parseInt(value.split("-")[0].toString());
                idSubinstancia = data.id;
            }

            this.form.patchValue({ idTipoCentroTrabajo: "-1" });

            const _instancia = this.subinstancias.find(x => x.id == idSubinstancia);
            const codigoInstancia = _instancia?.codigo == "" ? null : _instancia?.codigo;


            switch (this.passport.idNivelInstancia) {
                case NivelInstanciaCodigoEnum.MINEDU: {
                    if (value) {
                        this.mostrarOpciones(true, true, true, false);
                        this.loadTipoCentroTrabajo(idNivelInstancia, codigoInstancia, true);
                    }
                    break;
                }
                case NivelInstanciaCodigoEnum.DRE: {
                    if (value) {
                        this.mostrarOpciones(false, true, true, false);
                        this.loadTipoCentroTrabajo(idNivelInstancia, codigoInstancia, true);
                    }
                    break;
                }
                case NivelInstanciaCodigoEnum.UGEL: {
                    if (value) {
                        this.mostrarOpciones(false, false, true, false);
                        this.loadTipoCentroTrabajo(idNivelInstancia, codigoInstancia, true);
                    }
                    break;
                }
            }
        });

        this.form.get("idTipoCentroTrabajo").valueChanges.subscribe((value) => {
            console.log("this.passport.idNivelInstancia", this.passport.idNivelInstancia);
            if (value === "-1") {
                switch (this.passport.idNivelInstancia) {
                    case NivelInstanciaCodigoEnum.MINEDU: {
                        this.mostrarOpciones(true, true, true, true);
                        break;
                    }
                    case NivelInstanciaCodigoEnum.DRE: {
                        this.mostrarOpciones(false, true, true, false);
                        break;
                    }
                    case NivelInstanciaCodigoEnum.UGEL: {
                        this.mostrarOpciones(false, false, true, false);
                        break;
                    }
                }
                return;
            }

            let idTipoCentroTrabajo = null;
            this.form.controls["institucionEducativa"].setValue("");

            if (
                this.tiposCentroTrabajo.length !== 0 &&
                value !== null &&
                value !== undefined
            ) {
                const data = this.tiposCentroTrabajo.find(
                    (x) => x.idTipoCentroTrabajo === value
                );
                idTipoCentroTrabajo = data?.id_tipo_centrotrabajo;
                this.tieneEstructuraOrganica = data?.tieneEstructuraOrganica ?? null;
            }

            switch (this.passport.idNivelInstancia) {
                case NivelInstanciaCodigoEnum.MINEDU: {
                    if (value && value > 0) {
                        if (this.tieneEstructuraOrganica === true) {
                            if (
                                idTipoCentroTrabajo ===
                                TipoCentroTrabajoCodigoEnum.Minedu
                            ) {
                                this.mostrarOpciones(true, false, true, false);
                            } else {
                                this.mostrarOpciones(true, true, true, false);
                            }
                        } else {
                            this.mostrarOpciones(true, true, true, true);
                        }
                    }
                    break;
                }
                case NivelInstanciaCodigoEnum.DRE: {
                    if (value && value > 0) {
                        if (this.tieneEstructuraOrganica === true) {
                            this.mostrarOpciones(false, true, true, false);
                        } else {
                            this.mostrarOpciones(false, true, true, true);
                        }
                    }
                    break;
                }
                case NivelInstanciaCodigoEnum.UGEL: {
                    if (value && value > 0) {
                        if (this.tieneEstructuraOrganica === true) {
                            this.mostrarOpciones(false, false, true, false);
                        } else {
                            this.mostrarOpciones(false, false, true, true);
                        }
                    }
                    break;
                }
            }
        });
    };

    // buildPassport = () => {
    //     this.passport = {
    //         idNivelInstancia: 12,
    //         idEntidad: 1,
    //         usuario: "admin",
    //     };
    // };

    buildData = () => {
        this.mostrar(this.passport.idNivelInstancia);

        switch (this.passport.idNivelInstancia) {
            case NivelInstanciaCodigoEnum.MINEDU: {
                this.loadInstancia(true);
                break;
            }
            case NivelInstanciaCodigoEnum.DRE: {
                this.loadSubinstancia(this.passport.idEntidad, true);
                break;
            }
            case NivelInstanciaCodigoEnum.UGEL: {






                // this.loadTipoCentroTrabajo(
                //     this.passport.idNivelInstancia,
                //     true
                // );
                break;
            }
        }
    };

    default = () => {
        this.form.patchValue({
            idInstancia: "-1",
            idSubinstancia: "-1",
            idTipoCentroTrabajo: "-1",
        });

        this.form.controls["institucionEducativa"].reset();
    };

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
            // this.loadData(
            //     ( 1).toString(),
            //     5
            // )
        );
    }

    loadData = (pageIndex, pageSize) => {
        this.dataSource.load(this.filtro, pageIndex, pageSize);
    };

    ngOnDestroy(): void { }

    loadInstancia = (activo) => {
        this.dataService
            .CuadroHoras()
            .getComboInstanciaFiltro(activo)
            .pipe(
                catchError(() => of([])),
                map((response: any) => response)
            )
            .subscribe((instancias) => {
                if (instancias) {
                    // this.instancias = instancias;
                    //this.form.controls["idInstancia"].setValue("-1");

                    const data = instancias.map((x) => ({
                        ...x,
                        id_instancia: x.id_instancia,
                        codigo: x.codigo,
                        descripcion_instancia: `${x.descripcion_instancia}`,
                        selected: this.idDre == x.id,
                        id_instancia_selected: this.idDre == x.id ? x.id_instancia : -1
                    }));
                    console.log("instancias", data);
                    this.instancias = data;
                    const dataSel = this.instancias.find((x) => x.selected === true);
                    if (dataSel !== undefined) {
                        this.form.controls['idInstancia'].setValue(dataSel.id_instancia_selected);
                    } else
                        this.form.controls["idInstancia"].setValue("-1");
                }
            });
    };

    loadSubinstancia = (idInstancia, activo) => {
        this.dataService
            .CuadroHoras()
            .getComboSubinstanciaFiltro(idInstancia, activo)
            .pipe(
                catchError(() => of([])),
                map((response: any) => response)
            )
            .subscribe((subinstancias) => {
                if (subinstancias) {
                    //this.subinstancias = subinstancias;
                    //this.form.controls["idSubinstancia"].setValue("-1");

                    const data = subinstancias.map((x) => ({
                        ...x,
                        id_subinstancia: x.id_subinstancia,
                        codigo: x.codigo,
                        descripcion_subinstancia: `${x.descripcion_subinstancia}`,
                        selected: this.idUgel == x.id,
                        id_subinstancia_selected: this.idUgel == x.id ? x.id_subinstancia : -1
                    }));

                    this.subinstancias = data;
                    const dataSel = this.subinstancias.find((x) => x.selected === true);
                    if (dataSel !== undefined) {
                        this.form.controls['idSubinstancia'].setValue(dataSel.id_subinstancia_selected);

                    }
                }
            });
    };

    loadTipoCentroTrabajo = (idNivelInstancia, codigoCentroTrabajo, activo) => {

        this.dataService
            .CuadroHoras()
            .getTipoCentroTrabajo(idNivelInstancia, codigoCentroTrabajo, activo)
            .pipe(
                catchError(() => of([])),
                map((response: any) => response)
            )
            .subscribe((tiposCentroTrabajo) => {
                if (tiposCentroTrabajo) {
                    this.tiposCentroTrabajo = tiposCentroTrabajo;
                    if (this.tiposCentroTrabajo.length === 1) {
                        this.form.controls["idTipoCentroTrabajo"].setValue(
                            this.tiposCentroTrabajo[0].id_tipo_centrotrabajo
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
    };

    cancelar = () => {
        this.resetFiltro();
        this.matDialogRef.close();
    };

    limpiar = () => {
        this.resetFiltro();
    };

    buscar = () => {
        this.setFiltro();
        if (this.form.value.idInstancia === "-1") {
            this.dataService
                .Message()
                .msgAutoCloseWarningNoButton(
                    '"DEBE INGRESAR AL MENOS UN CRITERIO DE BÚSQUEDA."', 3000,
                    () => { }
                );
            return;
        }

        this.dataSource.load(
            this.filtro,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    };

    setFiltro = () => {
        const data = this.form.getRawValue();
        this.resetFiltroBuscar();

        if (data.idInstancia !== null && data.idInstancia !== "-1") {
            this.filtro.idNivelInstancia = parseInt(
                data.idInstancia.split("-")[0]
            );
            this.filtro.idInstancia = parseInt(data.idInstancia.split("-")[1]);
        }

        if (data.idSubinstancia !== null && data.idSubinstancia !== "-1") {
            this.filtro.idNivelInstancia = parseInt(
                data.idSubinstancia.split("-")[0]
            );
            this.filtro.idSubinstancia = parseInt(
                data.idSubinstancia.split("-")[1]
            );
        }

        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
            this.filtro.idTipoCentroTrabajo = data.idTipoCentroTrabajo;
        }

        switch (this.passport.idNivelInstancia) {
            case NivelInstanciaCodigoEnum.MINEDU:
            case NivelInstanciaCodigoEnum.DRE: {
                this.filtro.idInstancia = this.filtro.idInstancia
                    ? this.filtro.idInstancia
                    : this.passport.idEntidad;
                break;
            }
            case NivelInstanciaCodigoEnum.UGEL: {
                if (data.idSubinstancia === null) {
                    this.filtro.idNivelInstancia =
                        this.passport.idNivelInstancia;
                    this.filtro.idSubinstancia = this.passport.idEntidad;
                }
                break;
            }
        }

        this.filtro.institucionEducativa = data.institucionEducativa
            ? data.institucionEducativa
            : null;
    };

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        // this.dataShared.sendDataSharedCentroTrabajo({ registro: selected });
        this.matDialogRef.close({ centroTrabajo: selected });
    }

    mostrar = (idNivelInstancia) => {
        this.resetearOpciones();

        switch (idNivelInstancia) {
            case NivelInstanciaCodigoEnum.MINEDU: {
                this.ocultarInstancia = true;
                break;
            }
            case NivelInstanciaCodigoEnum.DRE: {
                this.ocultarSubinstancia = true;
                break;
            }
            case NivelInstanciaCodigoEnum.UGEL: {
                this.ocultarTipoCentroTrabajo = true;
                break;
            }
        }
    };

    mostrarOpciones = (
        instancia,
        subinstancia,
        tipoCentroTrabajo,
        InstitucionEducativa
    ) => {
        this.ocultarInstancia = instancia;
        this.ocultarSubinstancia = subinstancia;
        this.ocultarTipoCentroTrabajo = tipoCentroTrabajo;
        this.ocultarInstitucionesEducativas = InstitucionEducativa;
    };

    resetearOpciones = () => {
        this.ocultarInstancia = false;
        this.ocultarSubinstancia = false;
        this.ocultarTipoCentroTrabajo = false;
        this.ocultarInstitucionesEducativas = false;
    };

    resetFiltro = () => {
        //this.form.clearValidators();
        this.form.controls["idTipoCentroTrabajo"].setValue("-1");
        this.form.controls["institucionEducativa"].setValue("");

        //  this.default();
    };

    resetFiltroBuscar = () => {
        this.filtro = {
            idNivelInstancia: null,
            idInstancia: null,
            idSubinstancia: null,
            idTipoCentroTrabajo: null,
            institucionEducativa: null,
        };
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

    load = (filtro: any, pageIndex, pageSize) => {
        this._loadingChange.next(false);
        this.dataService
            .CuadroHoras()
            .buscarCentrosTrabajoPaginado(filtro, pageIndex, pageSize)
            .pipe(
                catchError(() => of([])),
                finalize(() => this._loadingChange.next(false))
            )
            .subscribe((centrosTrabajo: any) => {
                this._dataChange.next(centrosTrabajo || []);
                this.totalregistro =
                    (centrosTrabajo || []).length === 0
                        ? 0
                        : centrosTrabajo[0].total_registros;
                if ((centrosTrabajo || []).length === 0) {
                    this.dataService
                        .Message()
                        .msgAutoCloseWarningNoButton(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', 3000,
                            () => { }
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
