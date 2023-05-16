import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { GlobalsService } from "app/core/shared/globals.service";
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { cargarCombos, ResultadoOperacionEnum } from "../../_utils/constants";
import { SharedService } from "app/core/shared/shared.service";
import { MatPaginator } from "@angular/material/paginator";
import { TipoDocumentoIdentidadEnum } from "../../_utils/constants";
import { EntidadSedeService } from '../../Services/entidad-sede.service';

@Component({
    selector: "minedu-buscador-servidor-publico",
    templateUrl: "./buscador-servidor-publico.component.html",
    styleUrls: ["./buscador-servidor-publico.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BuscadorServidorPublicoComponent
    implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;
    idDNI: number;

    idTipoDocumentoSeleccionado: any;
    idRegimenLaboralSeleccionado: any;
    numeroDocumentoIdentidadIngresado: any;

    IDROLPASSPORT = cargarCombos.IDROLPASSPORT;
    IDNIVELINSTANCIA = cargarCombos.IDNIVELINSTANCIA;

    maxLengthnumeroDocumentoIdentidad: number;
    dataSource: ServidorPublicoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    seleccionado: any = null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    selectedRegimen = 0;

    buscarEnOtraSede: boolean = false;

    @ViewChild("paginator", { static: true })
    paginator: MatPaginator;

    dialogRef: any;
    currentSession: SecurityModel = new SecurityModel();
    vIdTipoDocumentoIdentidad: number;

    comboLists = {
        listTipoDocumento: [],
        listRegimenlaboral: [],
    };

    request = {
        codigoSede: "",
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: "",
        primerApellido: "",
        segundoApellido: "",
        nombres: "",
        idRegimenLaboral: null,
        paginaActual: 1,
        tamanioPagina: 10,
        buscarEnOtraSede: false,
        validarSancion: false
    };

    displayedColumns: string[] = [
        "numeroDocumentoIdentidadCompleto",
        "nombreCompleto",
        "fechaNacimiento",
        "iged",
        "centroTrabajo",
        "abreviaturaRegimenLaboral",
        "condicionLaboral",
    ];

    private _unsubscribeAll: Subject<any>;

    constructor(
        public matDialogRef: MatDialogRef<BuscadorServidorPublicoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService,
        private entidadSedeService: EntidadSedeService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.idTipoDocumentoSeleccionado = this.data.idTipoDocumentoSeleccionado;
        this.idRegimenLaboralSeleccionado = this.data.idRegimenLaboralSeleccionado;
        this.numeroDocumentoIdentidadIngresado = this.data.numeroDocumentoIdentidad;
        this.buscarEnOtraSede = this.data.buscarEnOtraSede;

        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        this.buildForm();
        this.dataSource = new ServidorPublicoDataSource(this.dataService);
        //Inicio Prueba
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        //Fin Prueba

        this.loadRegimenLaboral();
        this.loadTipoDocumentoIdentidad();

    }

    buildShared() { }
    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );

        if (this.numeroDocumentoIdentidadIngresado?.length > 0) {
            this.handleBuscar(true);
        }
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: this.idTipoDocumentoSeleccionado,
            numeroDocumentoIdentidad: this.numeroDocumentoIdentidadIngresado,
            primerApellido: [null],
            segundoApellido: [null],
            nombres: [null],
            idRegimenLaboral: this.idRegimenLaboralSeleccionado,
            buscarEnOtraSede: [this.buscarEnOtraSede]
        });
    };

    selectedRow(row) {
        this.selection.clear();
        this.selection.toggle(row);
        return row;
    }
    //Inicio Combo Tipo Documento
    loadTipoDocumentoIdentidad = () => {
        this.dataService
            .AccionesPersonal()
            .getComboTipoDocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                console.log("Consumo Tipo Documento ", response);
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTipoDocumento = data;
                }
            });
    };
    //Fin Conbo Tipo Documento

    //INICIO Combo Regimen Laboral

    loadRegimenLaboral = () => {
        this.dataService
            .AccionesPersonal()
            .getComboRegimenLaboral(this.IDROLPASSPORT, this.IDNIVELINSTANCIA, null)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                console.log("Consumo Regimen Loboral :", response);
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idRegimenLaboral,
                        label: `${x.abreviaturaRegimenLaboral}`,
                    }));
                    this.comboLists.listRegimenlaboral = data;
                }
            });
    };
    //FIN Combo Regimen Laboral

    ngOnDestroy(): void { }

    //Inicio Evento Buscar

    handleBuscar(firstTime = false): void {
        this.buscarProcesosDocumentacion(firstTime);
    }

    buscarProcesosDocumentacion = async (fistTime: boolean = false) => {
        this.setRequest();

        if (fistTime) {
            await this.dataSource.load(this.request, 1, 10);

            // if ((this.dataSource.data || []).length == 1) {
            //     const firstRow = this.dataSource.data[0];
            //     this.matDialogRef.close(this.selectedRow(firstRow));
            // }


        } else {
            if (
                this.request.numeroDocumentoIdentidad == "" &&
                this.request.idTipoDocumentoIdentidad == -1 &&
                this.request.nombres == "" &&
                this.request.primerApellido == "" &&
                this.request.segundoApellido == "" &&
                this.request.idRegimenLaboral == -1
            ) {
                this.dataService
                    .Message()
                    .msgWarning("Ingrese algún criterios de búsqueda.", () => {
                        return;
                    });
                // return;
            } else {
                await this.dataSource.load(
                    this.request,
                    this.paginator.pageIndex + 1,
                    this.paginator.pageSize
                );
            }
        }
    };

    loadData(pageIndex, pageSize): void {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get("numeroDocumentoIdentidad").setValue("");
        this.maxLengthnumeroDocumentoIdentidad =
            tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;

        this.form
            .get("numeroDocumentoIdentidad")
            .setValidators([
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),
            ]);
    }

    setRequest = () => {
        const { codigoSede } = this.entidadSedeService.entidadSede;

        this.request = {
            codigoSede,
            numeroDocumentoIdentidad: this.form.get("numeroDocumentoIdentidad").value == null ? "" : this.form.get("numeroDocumentoIdentidad").value,
            idTipoDocumentoIdentidad: this.idTipoDocumentoSeleccionado == 0 ? -1 : this.idTipoDocumentoSeleccionado,
            nombres: this.form.get("nombres").value == null ? "" : this.form.get("nombres").value,
            primerApellido: this.form.get("primerApellido").value == null ? "" : this.form.get("primerApellido").value,
            segundoApellido: this.form.get("segundoApellido").value == null ? "" : this.form.get("segundoApellido").value,
            idRegimenLaboral: this.idRegimenLaboralSeleccionado == 0 ? -1 : this.idRegimenLaboralSeleccionado,
            paginaActual: 1,
            tamanioPagina: 10,
            buscarEnOtraSede: this.form.get("buscarEnOtraSede").value ?? false,
            validarSancion: this.data?.validarSancion ?? false
        };

    };

    buscarServidorPublico = () => {
        this.dataSource = new ServidorPublicoDataSource(this.dataService);
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginatorPageSize
        );
    };

    handleCancel = () => {
        this.matDialogRef.close();
    };

    handleLimpiar(): void {
        // this.form.reset();
        this.form.controls["idTipoDocumentoIdentidad"].reset();
        this.form.controls["numeroDocumentoIdentidad"].reset();
        this.form.controls["primerApellido"].reset();
        this.form.controls["segundoApellido"].reset();
        this.form.controls["nombres"].reset();
        this.form.controls["buscarEnOtraSede"].setValue(false);
        // this.form.controls["idRegimenLaboral"].reset();
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        this.seleccionado = selected;
        // TODO:
    }

    handleSelect = () => {
        if (this.seleccionado === null) {
            this.dataService
                .Message()
                .msgWarning("Debe seleccionar un registro.", () => { });
        } else {
            this.matDialogRef.close({ servidorPublico: this.seleccionado });
        }
    };
}

export class ServidorPublicoDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    async load(data: any, pageIndex, pageSize): Promise<void> {
        console.log("segunda grilla", data)
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        const response = await this.dataService
            .AccionesPersonal()
            .getListarServidorPublico(data, pageIndex, pageSize)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this._loadingChange.next(false);
                })
            ).toPromise();

        if (response) {
            this._dataChange.next(response || []);
            this.totalregistro =
                (response || [])?.length === 0
                    ? 0
                    : response[0]?.totalregistro;

            if ((response || [])?.length === 0) {
                this.dataService.Message().msgWarning("No se encontró información de la(s) servidor(es) para los criterios de búsqueda ingresados.", () => { });
            }

            if (response && response.result) {
            } else if (
                response &&
                response.statusCode === ResultadoOperacionEnum.NotFound
            ) {
                this.dataService
                    .Message()
                    .msgWarning(response.messages[0], () => { });
            } else if (
                response &&
                response.statusCode ===
                ResultadoOperacionEnum.UnprocessableEntity
            ) {
                this.dataService
                    .Message()
                    .msgWarning(response.messages[0], () => { });
            }
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
