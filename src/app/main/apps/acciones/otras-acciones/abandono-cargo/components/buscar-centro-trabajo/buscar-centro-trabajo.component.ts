import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, OnDestroy } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { BehaviorSubject, of, Observable, Subject } from "rxjs";
import { SelectionModel, DataSource, CollectionViewer } from "@angular/cdk/collections";
import { FormGroup, FormBuilder, } from "@angular/forms";
import { catchError, map, finalize, takeUntil } from "rxjs/operators";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { DataService } from "app/core/data/data.service";
import { GlobalsService } from "app/core/shared/globals.service";
import { SecurityModel } from "app/core/model/security/security.model";

@Component({
    selector: "minedu-buscar-centro-trabajo",
    templateUrl: "./buscar-centro-trabajo.component.html",
    styleUrls: ["./buscar-centro-trabajo.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BuscarCentroTrabajoComponent
    implements OnInit, OnDestroy {


    form: FormGroup;
    dialogTitle: string;
    // action: string;
    // idTipoOperacion: any;
    // registrado: boolean = false;

    // dialogRef: any;

    instancias: any[];
    subinstancias: any[];
    tiposCentroTrabajo: any[];
    modalidades: any[] = [];
    nivelesEducativos: any[] = [];

    // passport = {
    //     idNivelInstancia: null,
    //     codigoNivelInstancia: null,
    //     idEntidadSede: null,
    //     idRolPassport: null
    // }

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

    // mostrarInstancia: boolean = false;
    // mostrarSubinstancia: boolean = false;
    // mostrarTipoCentroTrabajo: boolean = false;
    // mostrarModalidadNivelEducativo: boolean = false;
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

    // currentSession: SecurityModel = new SecurityModel();
    dataSource: CentroTrabajoDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild("paginatorCentroTrabajo", { static: true })
    paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;

    constructor(
        public matDialogRef: MatDialogRef<BuscarCentroTrabajoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService
    ) {
        this._unsubscribeAll = new Subject();
        // this.currentSession = data.currentSession;
        // this.passport = data.currentSession;
    }

    ngOnInit(): void {
        this.cargarTodo();
    }

    private async cargarTodo() {

        this.dialogTitle = "Búsqueda de centro de trabajo";

        this.buildForm();
        await this.buildData();

        this.dataSource = new CentroTrabajoDataSource(this.dataService);
        this.buildPaginators(this.paginator);

        this.paginator.page
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(x => {
                this.dataSource.load(this.filtro, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        });
        // this.permiteBuscar = this.data.centrosTrabajos == null ? true : false;
        // if (!this.permiteBuscar) {
        //     this.dataSource.loadData(this.data.centrosTrabajos);
        //     return;
        // }
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {
                return `0 de ${length}`;
            }
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
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

        // this.form.get("idInstancia").valueChanges.subscribe((value) => {
        //     this.form.patchValue({ idSubinstancia: "-1", idTipoCentroTrabajo: "-1" });
        //     this.mostrarSubinstancia = false;

        //     if (value && value !== "-1") {
        //         let idNivelInstancia = null;
        //         let codigoNivelInstancia = null;
        //         let idInstancia = null;
        //         this.subinstancias = [];
        //         this.tiposCentroTrabajo = [];
        //         const data = this.instancias.find(
        //             (x) => x.idInstancia === value
        //         );
        //         idNivelInstancia = this.passport.idNivelInstancia;
        //         // codigoNivelInstancia= this.passport.codigoNivelInstancia;
        //         // codigoNivelInstancia= parseInt(value.split("-")[0]);
        //         idInstancia = data.id;

        //         // switch (idNivelInstancia) {
        //         //     case NivelInstanciaCodigoEnum.MINEDU: {
        //         //         if (value) {
        //         //             this.mostrarOpciones(true, false, true, false, false);
        //         //             this.loadTipoCentroTrabajo(idNivelInstancia, true);
        //         //         }
        //         //         break;
        //         //     }
        //         //     case NivelInstanciaCodigoEnum.DRE: {
        //         //         if (value) {
        //         //             this.mostrarOpciones(true, true, false, false, false);
        //         //             this.loadSubinstancia(idInstancia, true);
        //         //         }
        //         //         break;
        //         //     }
        //         // }
        //     }
        // });

        // this.form.get("idSubinstancia").valueChanges.subscribe((value) => {
        //     this.form.patchValue({ idTipoCentroTrabajo: "-1" });
        //     this.mostrarTipoCentroTrabajo = false;
        //     this.mostrarModalidadNivelEducativo = false;
        //     this.mostrarInstitucionEducativa = false;

        //     if (value && value !== "-1") {
        //         let idNivelInstancia = null;
        //         let idSubinstancia = null;
        //         let codigoNivelInstancia = null;

        //         this.tiposCentroTrabajo = [];

        //         const data = this.subinstancias.find(
        //             (x) => x.idSubinstancia === value
        //         );
        //         idNivelInstancia = this.passport.idNivelInstancia;
        //         // codigoNivelInstancia= this.passport.codigoNivelInstancia;
        //         // codigoNivelInstancia= parseInt(value.split("-")[0]);
        //         idSubinstancia = data.id;

        //         // switch (parseInt(this.passport.idNivelInstancia)) {
        //         //     case NivelInstanciaCodigoEnum.MINEDU: {
        //         //         if (value) {
        //         //             this.mostrarOpciones(true, true, true, false, false);
        //         //             this.loadTipoCentroTrabajo(idNivelInstancia, true);
        //         //         }
        //         //         break;
        //         //     }
        //         //     case NivelInstanciaCodigoEnum.DRE: {
        //         //         if (value) {
        //         //             this.mostrarOpciones(false, true, true, false, false);
        //         //             this.loadTipoCentroTrabajo(idNivelInstancia, true);
        //         //         }
        //         //         break;
        //         //     }
        //         //     case NivelInstanciaCodigoEnum.UGEL: {
        //         //         if (value) {
        //         //             this.mostrarOpciones(false, false, true, false, false);
        //         //             this.loadTipoCentroTrabajo(idNivelInstancia, true);
        //         //         }
        //         //         break;
        //         //     }
        //         // }
        //     }
        // });

        // this.form.get("idTipoCentroTrabajo").valueChanges.subscribe((value) => {
        //     this.form.patchValue({ idModalidadEducativa: "-1", idNivelEducativo: "-1", institucionEducativa: '' });
        //     this.mostrarModalidadNivelEducativo = false;
        //     this.mostrarInstitucionEducativa = false;

        //     if (value && value !== "-1") {
        //         const tipoCentroTrabajo = this.tiposCentroTrabajo.find(pred => pred.idTipoCentroTrabajo === value);
        //         if (tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitucionEducativaDRE ||
        //             tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitucionEducativaUgel) {
        //             this.mostrarInstitucionEducativa = true;
        //         } else {
        //             this.mostrarInstitucionEducativa = false;
        //         }

        //         if (tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitucionEducativaDRE ||
        //             tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitucionEducativaUgel ||
        //             tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitutoSuperiorDRE ||
        //             tipoCentroTrabajo?.codigoTipoCentroTrabajo == TipoCentroTrabajoCodigoEnum.InstitutoSuperiorUgel
        //         ) {
        //             this.mostrarModalidadNivelEducativo = true;
        //             this.getModalidadesEducativas();
        //         } else {
        //             this.mostrarModalidadNivelEducativo = false;
        //         }
        //     }
        // });

        // this.form.get("idModalidadEducativa").valueChanges.subscribe((value) => {
        //     this.nivelesEducativos = [];
        //     this.form.patchValue({ idNivelEducativo: null });
        //     if (value && value !== "-1") {
        //         this.getNivelesEducativos(value);
        //     }
        // });
    }

    buildData() {
        // if (!this.passport) return;

        // this.mostrar(parseInt(this.passport?.idNivelInstancia));
        // switch (parseInt(this.passport?.idNivelInstancia)) {
        //     case NivelInstanciaCodigoEnum.MINEDU: {
        //         this.loadInstancia(true);
        //         break;
        //     }
        //     case NivelInstanciaCodigoEnum.DRE: {
        //         this.loadSubinstancia(
        //             parseInt(this.passport.idEntidadSede),
        //             true
        //         );
        //         break;
        //     }
        //     case NivelInstanciaCodigoEnum.UGEL: {
        //         this.loadTipoCentroTrabajo(
        //             parseInt(this.passport.idNivelInstancia),
        //             true
        //         );
        //         break;
        //     }
        // }
    }

    async datosSede() {
        const usuario = this.dataService.Storage().getPassportRolSelected();

        const data = {
            codigoSede: usuario.CODIGO_SEDE,
            activo: true
        }
        // let isSuccess = true;
        console.log('entro');


        // var response = await this.dataService
        //     .AccionesPersonal()
        //     .obtenerCentroTrabajoPorCodigoSede(data).pipe(catchError((e) => {
        //         isSuccess = false;
        //         return of([e]);
        //     }),
        //         finalize(() => { })
        //     ).toPromise();

        // if (isSuccess && response) {
        //     // this.passport.codigoNivelInstancia = response?.codigoNivelInstancia;
        //     // this.passport.idNivelInstancia = response?.idNivelInstancia;
        //     // this.passport.idEntidadSede = response?.idEntidadSede;
        //     this.passport.idNivelInstancia = response?.codigoNivelInstancia;

        //     switch (+this.passport.idNivelInstancia) {
        //         case NivelInstanciaCodigoEnum.DRE:
        //             this.passport.idEntidadSede = response?.idDre;
        //             break;
        //         case NivelInstanciaCodigoEnum.UGEL:
        //             this.passport.idEntidadSede = response?.idUgel;
        //             break;
        //         default:
        //             this.passport.idEntidadSede = response?.idEntidadSede;
        //             break;
        //     }
        // }
    }

    default() {
        let idInstancia = this.form.controls["idInstancia"].value;
        let idSubinstancia = this.form.controls["idSubinstancia"].value;

        // if (this.mostrarInstancia) idInstancia = "-1";
        // if (this.mostrarSubinstancia) idSubinstancia = "-1";

        this.form.patchValue({
            idInstancia,
            idSubinstancia,
            idTipoCentroTrabajo: "-1",
            idModalidadEducativa: "-1",
            idNivelEducativo: "-1"
        });
        this.form.controls["institucionEducativa"].reset();
    }

    // ngAfterViewInit() {
    //     this.paginator.page.subscribe(() => this.loadData());
    // }

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

        // const { codigoSede } = this.entidadSedeService.entidadSede;

        // const request = {
        //     codigoSede,
        //     activo: activo
        // }
        // this.dataService
        //     .AccionesPersonal()
        //     .getComboInstancia(request)
        //     .pipe(
        //         catchError((e) => of(e)),
        //         map((response: any) => response)
        //     )
        //     .subscribe((response) => {
        //         if (response) {
        //             this.instancias = response;
        //             /* El usuario que tiene el ROL Especialista de AIRHSP solo puede generar plazas para MINEDU*/
        //             if (
        //                 parseInt(this.passport.idRolPassport) ===
        //                 TablaUsuarioRol.EspecialistaAIRHSP
        //             ) {
        //                 this.form.controls["idInstancia"].setValue(
        //                     this.instancias[0].idInstancia
        //                 );
        //                 this.form.controls["idInstancia"].disable();
        //             } else {
        //                 this.form.controls["idInstancia"].setValue("-1");
        //                 this.form.controls["idInstancia"].enable();
        //             }
        //         }
        //     });
    }

    loadSubinstancia(idInstancia, activo) {
        const request = {
            idInstancia: idInstancia,
            activo: activo
        }
        // this.dataService
        //     .AccionesPersonal()
        //     .getComboSubinstancia(request)
        //     .pipe(
        //         catchError((e) => of(e)),
        //         map((response: any) => response)
        //     )
        //     .subscribe((response) => {
        //         if (response) {
        //             this.subinstancias = response;
        //             this.form.controls["idSubinstancia"].setValue("-1");
        //         }
        //     });
    }

    loadTipoCentroTrabajo(idNivelInstancia, activo) {
        // this.dataService
        //     .AccionesPersonal()
        //     .getTipoCentroTrabajo(idNivelInstancia, activo)
        //     .pipe(
        //         catchError((e) => of(e)),
        //         map((response: any) => response)
        //     )
        //     .subscribe((response) => {
        //         if (response) {
        //             this.tiposCentroTrabajo = response;
        //             if (this.tiposCentroTrabajo.length === 1) {
        //                 this.form.controls["idTipoCentroTrabajo"].setValue(
        //                     this.tiposCentroTrabajo[0].idTipoCentroTrabajo
        //                 );
        //                 this.form.controls["idTipoCentroTrabajo"].disable();
        //             } else {
        //                 this.form.controls["idTipoCentroTrabajo"].setValue(
        //                     "-1"
        //                 );
        //                 this.form.controls["idTipoCentroTrabajo"].enable();
        //             }
        //         }
        //     });
    }

    private getModalidadesEducativas() {
        this.dataService.Spinner().show("sp6")
        this.dataService
            .AccionesPersonal()
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
            .AccionesPersonal()
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
        // this.mostrarModalidadNivelEducativo = true;
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

        // this.resetFiltroBuscar();
        // if (data.idInstancia !== null && data.idInstancia !== "-1") {
        //     this.filtro.idNivelInstancia = parseInt(
        //         data.idInstancia.split("-")[0]
        //     );
        //     this.filtro.idInstancia = parseInt(data.idInstancia.split("-")[1]);
        // } else {
        //     this.filtro.idNivelInstancia = parseInt(
        //         this.passport.idNivelInstancia
        //     );
        // }

        // if (data.idSubinstancia !== null && data.idSubinstancia !== "-1") {
        //     this.filtro.idNivelInstancia = parseInt(
        //         data.idSubinstancia.split("-")[0]
        //     );
        //     this.filtro.idSubinstancia = parseInt(
        //         data.idSubinstancia.split("-")[1]
        //     );
        // } else {
        //     if (this.filtro.idNivelInstancia !== NivelInstanciaCodigoEnum.MINEDU) {
        //         switch (
        //         parseInt(this.passport.idNivelInstancia)
        //         ) {
        //             case NivelInstanciaCodigoEnum.DRE: {
        //                 this.filtro.idInstancia = this.filtro.idInstancia
        //                     ? this.filtro.idInstancia
        //                     : parseInt(
        //                         this.passport.idEntidadSede
        //                     );
        //                 break;
        //             }
        //             case NivelInstanciaCodigoEnum.UGEL: {
        //                 if (data.idSubinstancia === null) {
        //                     this.filtro.idNivelInstancia = parseInt(
        //                         this.passport.idNivelInstancia
        //                     );
        //                     this.filtro.idSubinstancia = parseInt(
        //                         this.passport.idEntidadSede
        //                     );
        //                 }
        //                 break;
        //             }
        //         }
        //     }
        // }

        // if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
        //     this.filtro.idTipoCentroTrabajo = data.idTipoCentroTrabajo;
        // }

        // this.filtro.idTipoOperacion = this.idTipoOperacion;
        // this.filtro.registrado = this.registrado;

        // switch (parseInt(this.passport.idNivelInstancia)) {
        //     case NivelInstanciaCodigoEnum.MINEDU:
        //     case NivelInstanciaCodigoEnum.DRE: {
        //         this.filtro.idInstancia = this.filtro.idInstancia
        //             ? this.filtro.idInstancia
        //             : parseInt(this.passport.idEntidadSede);
        //         break;
        //     }
        //     case NivelInstanciaCodigoEnum.UGEL: {
        //         if (data.idSubinstancia === null) {
        //             this.filtro.idNivelInstancia = parseInt(
        //                 this.passport.idNivelInstancia
        //             );
        //             this.filtro.idSubinstancia = parseInt(
        //                 this.passport.idEntidadSede
        //             );
        //         }
        //         break;
        //     }
        // }

        this.filtro.institucionEducativa = data.institucionEducativa
            ? data.institucionEducativa
            : null;

        this.filtro.idModalidadEducativa = data.idModalidadEducativa ? data.idModalidadEducativa : null;
        this.filtro.idNivelEducativo = data.idNivelEducativo ? data.idNivelEducativo : null;
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        // this.dataShared.sendDataSharedCentroTrabajo({ centroTrabajo: selected });
        this.matDialogRef.close({ centroTrabajo: selected });
    }

    // mostrar(codigoNivelInstancia) {
    //     this.resetearOpciones();

    //     // switch (codigoNivelInstancia) {
    //     //     case NivelInstanciaCodigoEnum.MINEDU: {
    //     //         this.mostrarInstancia = true;
    //     //         break;
    //     //     }
    //     //     case NivelInstanciaCodigoEnum.DRE: {
    //     //         this.mostrarSubinstancia = true;
    //     //         break;
    //     //     }
    //     //     case NivelInstanciaCodigoEnum.UGEL: {
    //     //         this.mostrarTipoCentroTrabajo = true;
    //     //         break;
    //     //     }
    //     // }
    // }

    // mostrarOpciones(
    //     mostrarInstancia: boolean,
    //     mostrarSubinstancia: boolean,
    //     mostrarTipoCentroTrabajo: boolean,
    //     mostrarModalidadNivelEducativo: boolean,
    //     mostrarInstitucionEducativa: boolean
    // ) {
    //     this.mostrarInstancia = mostrarInstancia;
    //     this.mostrarSubinstancia = mostrarSubinstancia;
    //     this.mostrarTipoCentroTrabajo = mostrarTipoCentroTrabajo;
    //     this.mostrarModalidadNivelEducativo = mostrarModalidadNivelEducativo;
    //     this.mostrarInstitucionEducativa = mostrarInstitucionEducativa;
    // }

    // resetearOpciones() {
    //     this.mostrarInstancia = false;
    //     this.mostrarSubinstancia = false;
    //     this.mostrarTipoCentroTrabajo = false;
    //     // this.ocultarInstitucionesEducativas = false;

    //     this.mostrarModalidadNivelEducativo = false;
    //     this.mostrarInstitucionEducativa = false;
    // }

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
  
    load(data: any, pageIndex, pageSize) {

        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);

        this.dataService.OtrasFuncionalidades().getCodigoModularTransversal(data, pageIndex, pageSize).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistro;
                this._dataChange.next(response || []);

                if ((response || []).length === 0) {
                    this.totalregistro = 0;
                    this._dataChange.next([]);
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
    get dataTotal(): any {
        return this.totalregistro;
    }
    get data(): any {
        return this._dataChange.value || [];
    }
}
