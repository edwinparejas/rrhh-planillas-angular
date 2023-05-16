import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { of, BehaviorSubject, Subject, Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { TablaSeccion, TablaTipoSeccion } from 'app/core/model/types';
import { HttpErrorResponse } from '@angular/common/http';
import { SingleFileInputTempComponent } from 'app/main/apps/components/single-file-input-temp/single-file-input-temp.component';
import { RegexPatterns } from '../../_utils/regexPatterns';
import { MESSAGE_GESTION } from '../../_utils/constants';
import { CabeceraDatosAccion } from '../../models/desplazamiento.model';
import { GenerarProyectoService } from './generar-proyecto.service';

@Component({
    selector: 'minedu-generar-proyecto',
    templateUrl: './generar-proyecto.component.html',
    styleUrls: ['./generar-proyecto.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class GenerarProyectoComponent implements OnInit, OnDestroy, AfterViewInit {
    ELEMENTOS_TEMP_DATAGRID: tblGridAccGrab[] = [];
    CONSIDERANDO_TEMP_DATAGRID: tblGridConGrab[] = [];
    working: boolean = false;
    verInformacion: boolean = false;
    form: FormGroup;
    tiposDeResolucion: any[] = [];
    tiposDocumentoSustento: any[] = [];
    tiposFormatoSustento: any[] = [];
    maximo: number = 8;
    formCons: FormGroup;
    row: number;
    private _loadingChange = new BehaviorSubject<boolean>(false);
    loading = this._loadingChange.asObservable();
    dataSource: MatTableDataSource<any>;
    dataSourceCons: MatTableDataSource<any>;
    selection = new SelectionModel<any>(true, []);
    idProceso: number;
    paginatorPageSize = 3;
    paginatorPageIndex = 1;
    seleccionado: any = null;
    selectedTabIndex = 0;
    seccion = "";
    tipoSeccion = "";
    sustentos: any[] = [];
    conteo = 0;
    conVistoProyecto: boolean = false;
    workingAdd = false;
    dialogRef: any;

    nowDate = new Date();

    conDiferencia: boolean = false;

    idRolPassport: number = 1;

    propuesta = {
        propuestasAdecuacion: [],
        usuarioCreacion: null,
        codigoTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null
    };
    displayedColumns: string[] = [
        'index',
        'tipoDocumentoSustento',
        'numeroDocumentoSustento',
        'fechaEmision',
        'tipoFormatoSustento',
        'numeroFolios',
        'fechaRegistro',
        'detallevisto',
        'opciones'
    ];

    displayedConsColumns: string[] = [
        'index',
        'seccion',
        'tipoSeccion',
        'considerando',
        'acciones'
    ];


    selectedTipoDoc = 0;
    comboLists = {
        listTipoDocumento: [],
        listTipoResolucion: [],
        listTipoFormato: [],
    }

    esMandatoJudicial: boolean;

    // @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;

    cabeceraAccion: CabeceraDatosAccion = new CabeceraDatosAccion();

    formDocSustento: FormGroup | null;

    constructor(
        public matDialogRef: MatDialogRef<GenerarProyectoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog,
        private generarProyectoService: GenerarProyectoService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngAfterViewInit() { }

    @ViewChildren(SingleFileInputTempComponent)
    fileComponent: QueryList<SingleFileInputTempComponent>;

    limpiarProyecto() {
        this.formDocSustento.controls['idTipoFormato'].reset();
        this.formDocSustento.controls['mostrarVistoProyecto'].reset();
        this.formDocSustento.controls['idTipoDocumento'].reset();
        this.formDocSustento.controls['numeroDocumentoSustento'].reset();
        this.formDocSustento.controls['numeroFolios'].reset();
        this.formDocSustento.controls['sumilla'].reset();
        this.formDocSustento.controls['codigoAdjuntoSustento'].reset();
        this.formDocSustento.controls['entidadEmisora'].reset();
        this.formDocSustento.controls['fechaEmision'].reset();
        this.formDocSustento.controls['adjuntarDocumento'].reset();

        this.fileComponent.forEach((c) => c.eliminarDocumento());

    }

    ngOnInit(): void {

        this.seccion = TablaSeccion.SECCION;
        this.tipoSeccion = TablaTipoSeccion.PARRAFO;

        this.llenar();
        this.buildForm();
        this.loadTipoDocumentoSustento();
        this.loadTipoResolucion();
        this.loadTipoFormato();

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    llenar = () => {
        this.cabeceraAccion = this.data;
    }

    multipleRegimen: string = "";
    multipleGrupoAccion: string = "";
    multipleAccion: string = "";
    multipleMotivo: string = "";

    codigoRegimenLaboral: number;
    codigoGrupoAccion: number;
    codigoAccion: number;
    codigoMotivoAccion: number;

    codigoUgel: string;
    codigoDre: string;

    esProyectoIndividual: boolean;


    buildForm(): void {
        const formDocSustento = this.formBuilder.group({
            mostrarVistoProyecto: [-1, [Validators.required, Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]],
            numeroDocumentoSustento: [null, Validators.required],
            numeroFolios: [null, Validators.compose([Validators.required, Validators.maxLength(3)])],
            sumilla: [null, [Validators.maxLength(400)]],
            codigoAdjuntoSustento: [null],
            entidadEmisora: [null, [Validators.maxLength(400)]],
            fechaEmision: [null, Validators.required],
            usuarioCreacion: [null],
            idTipoDocumento: [-1, [Validators.required, Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]],
            idTipoFormato: [-1, [Validators.required, Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]],
            adjuntarDocumento: [null]
        });

        formDocSustento.controls["numeroFolios"]
            .valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(value => {
                if (value && value.slice(0, 1) == "0")
                    this.formDocSustento.patchValue({ numeroFolios: value.replace(/^0+/, null) });
            });

        const formCons = this.formBuilder.group({
            idSeccion: [2],
            idTipoSeccion: [1],
            seccion: [null],
            TipoSeccion: [null],
            considerando: [null, [Validators.required]],
            sangria: [null],
        });

        this.form = this.formBuilder.group({
            idTipoResolucion: [-1, [Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]],
            formDocSustento,
            formCons
        });

        this.formDocSustento = (this.form.controls['formDocSustento'] as FormGroup);
        this.formCons = (this.form.controls['formCons'] as FormGroup);

        this.dataSource = new MatTableDataSource([]);
        this.dataSourceCons = new MatTableDataSource([]);
    }

    handleAgregar() {

        if (!this.formDocSustento.valid) {
            this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
            return;
        }

        const usuario = this.dataService.Storage().getPassportUserData();
        const form = this.formDocSustento.value;
        const documentoSustento = this.comboLists.listTipoDocumento.find(d => d.idCatalogoItem == form.idTipoDocumento);
        const formatoSustento = this.comboLists.listTipoFormato.find(d => d.idCatalogoItem == form.idTipoFormato);

        const item: tblGridAccGrab = {
            tipoDocumentoSustento: documentoSustento.descripcionCatalogoItem,
            tipoFormatoSustento: formatoSustento.descripcionCatalogoItem,
            idDocumentoSustento: 0,
            idAccionGrabada: 0, /*este item se llenara el backend despues de guardar la accion grabada*/
            idTipoResolucion: 0 /*este item se llenara al final cuando se envie la lista final, ya que es 1 resolucion por el bloque*/,
            idTipoDocumentoSustento: form.idTipoDocumento,
            idTipoFormatoSustento: form.idTipoFormato,
            numeroDocumentoSustento: form.numeroDocumentoSustento,
            entidadEmisora: form.entidadEmisora,
            fechaEmision: form.fechaEmision,
            numeroFolios: Number(form.numeroFolios),
            sumilla: form.sumilla == null ? "" : form.sumilla,
            codigoDocumentoSustento: "", //this.formDocSustento.value.adjuntarDocumento,
            vistoProyecto:
                this.formDocSustento.value.mostrarVistoProyecto == "1" ? true : false,
            DetallevistoProyecto:
                this.formDocSustento.value.mostrarVistoProyecto == "1" ? "SI" : "NO",
            activo: true,
            fechaCreacion: new Date(),
            usuarioCreacion: usuario.NOMBRES_USUARIO,
            ipCreacion: "",
            fechaModificacion: new Date(),
            archivoSustento: form.adjuntarDocumento == null ? null : form.adjuntarDocumento,
            nombreArchivoSustento: form.adjuntarDocumento == null ? null : form.adjuntarDocumento.name
        };

        // form.tipoFormato = formatoSustento.descripcion_catalogo_item;
        this.sustentos.push(item);
        this.ELEMENTOS_TEMP_DATAGRID.push(item);
        this.dataSource = new MatTableDataSource(this.sustentos);
        this.workingAdd = false;
        this.limpiarProyecto();
    }


    handleEliminar(row, index) {
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE ELIMINAR EL DOCUMENTO DE SUSTENTO?', () => {
            this.sustentos.splice(index, 1);
            this.ELEMENTOS_TEMP_DATAGRID.splice(index, 1);
            this.dataSource = new MatTableDataSource(this.sustentos);
        }, () => { });
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    handleSelectTab = (e) => {
        this.selectedTabIndex = e.index;
    }

    handleGenerarProyecto = () => {
        if (!this.form.controls["idTipoResolucion"].valid) {
            this.form.controls["idTipoResolucion"].markAsTouched();
            this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
            return;
        }

        const total = this.ELEMENTOS_TEMP_DATAGRID.length;

        if (total == 0) {
            // this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
            this.dataService.Message().msgWarning('"DEBE REGISTRAR COMO MINIMO UN DOCUMENTO DE SUSTENTO QUE SE MUESTRE EN EL VISTO DEL PROYECTO"');
            return;
        }

        this.conteo = 0;
        this.conVistoProyecto = false;
        console.log(this.sustentos);
        const conVistoProyecto = (this.sustentos as tblGridAccGrab[]).some(x => x.vistoProyecto);

        if (!conVistoProyecto) {
            this.dataService.Message().msgWarning(MESSAGE_GESTION.M124);
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GENERAR EL PROYECTO?', async () => {
            const form = this.form.value;
            const usuario = this.dataService.Storage().getPassportUserData();
            let data = {
                // idGestionPronoei: this.data?.idGestionPronoei ?? null,
                esMandatoJudicial: this.data?.esMandatoJudicial,
                oProyectoResolucion: {
                    idTipoResolucion: form.idTipoResolucion,
                    usuarioCreacion: `${usuario.NOMBRES_USUARIO}`,
                    documentosSustento: this.ELEMENTOS_TEMP_DATAGRID,
                    codigoSistema: 4,
                    codigoTipoDocumentoIdentidad: this.propuesta.codigoTipoDocumentoIdentidad,
                    numeroDocumentoIdentidad: this.propuesta.numeroDocumentoIdentidad,
                    detalleConsiderando: this.CONSIDERANDO_TEMP_DATAGRID
                },
                esRegistro: this.data?.esRegistro == false ? false : true,
                oAccionPersonal: {
                    ...this.data.info
                }
            }

            this.generarProyecto(data);
        });
    }

    async generarProyecto(data) {
        this.dataService.Spinner().show("sp6");
        const formData = new FormData();
        this.appendFormData(formData, data, "");
        let isSuccess = true;

        const response = await this.dataService.AccionesPersonal()
            .generarProyectoResolucion(formData)
            .pipe(
                catchError((ex) => {
                    isSuccess = false;
                    this.dataService.Message().msgWarning('"' + ex?.error?.messages[0]?.toUpperCase() + '"');
                    return of([]);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                })
            ).toPromise();

        if (isSuccess && response !== -1) {
            this.dataService.Message().msgAutoCloseSuccessNoButton('"PROYECTO GENERADO CORRECTAMENTE"', 3000, () => {
                if (response?.documentoProyectoResolucion) {
                    this.generarProyectoService.visualizarProyectoResolucion = response?.documentoProyectoResolucion;
                }
                this.matDialogRef.close({ isSuccess });
            });
        }
    }

    convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat)
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('-')
    }

    appendFormData(formData, data, rootName) {
        let root = rootName || "";
        if (data instanceof File) {
            formData.append(root, data);
        } else if (data instanceof Date) {
            formData.append(root, this.convertDate(data));
        } else if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                this.appendFormData(formData, data[i], root + "[" + i + "]");
            }
        } else if (typeof data === "object" && data) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    if (root === "") {
                        this.appendFormData(formData, data[key], key);
                    } else {
                        this.appendFormData(
                            formData,
                            data[key],
                            root + "." + key
                        );
                    }
                }
            }
        } else {
            if (data !== null && typeof data !== "undefined") {
                formData.append(root, data);
            }
        }
    }

    handleCancelar = (data?: any) => {
        this.matDialogRef.close(data);
    }

    handleAdjunto(FILE) {
        if (FILE?.file != null || FILE?.file != undefined) {
            const documento = (FILE.file as File);
            this.formDocSustento.controls["adjuntarDocumento"].setValue(documento);
        } else {
            this.formDocSustento.controls["adjuntarDocumento"].setValue(null);
        }
    }

    agregarConsiderandoAGrillaTemporal = () => {
        if (this.formCons.valid) {

            const usuario = this.dataService.Storage().getPassportUserData();
            let item: tblGridConGrab = {
                seccion: this.seccion,
                tipoSeccion: this.tipoSeccion,
                idSeccion: 1,
                idtipoSeccion: 1,
                considerando: this.formCons.value.considerando,
                sangria: true,
                activo: true,
                fechaCreacion: new Date(),
                usuarioCreacion: usuario.NUMERO_DOCUMENTO,
                ipCreacion: "",
                fechaModificacion: new Date(),
            };
            this.CONSIDERANDO_TEMP_DATAGRID.push(item);
            this.dataSourceCons = new MatTableDataSource(this.CONSIDERANDO_TEMP_DATAGRID);
            this.limpiarConsiderando();
        }
        else {
            this.dataService.Message()
                .msgWarning(MESSAGE_GESTION.M08, () => { });
            this.formCons.markAllAsTouched();
            return;
        }

    }

    limpiarConsiderando() {
        this.formCons.controls['considerando'].reset();

    };

    quitarElementoConsiderandoDeGrillaTemporal(index) {
        this.CONSIDERANDO_TEMP_DATAGRID.splice(index, 1);
        this.dataSourceCons = new MatTableDataSource(this.CONSIDERANDO_TEMP_DATAGRID);
    }

    loadTipoDocumentoSustento = async () => {
        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getComboTipoDocumentoSustento()
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of([]);
                }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.comboLists.listTipoDocumento = data;
        }
    }

    loadTipoResolucion = async () => {

        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getComboTipoResolucion()
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of([]);
                }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.comboLists.listTipoResolucion = data;
        }
    }

    loadTipoFormato = async () => {

        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal().getComboTipoFormato()
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of([]);
                }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.comboLists.listTipoFormato = data;
        }
    }

    handleMostrarAdjunto(fileTEMP) {
        this.handlePreview(fileTEMP, fileTEMP.name);
    }

    handlePreview(file: any, codigoAdjuntoAdjunto: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Accion Grabada",
                    file: file,
                    fileName: codigoAdjuntoAdjunto,
                },
            },
        });

    }

    handleVerInfoDocSustento(row) {
        // this.dialogRef = this.materialDialog.open(VerInformacionSustentoComponent, {
        //     panelClass: 'modal-ver-informacion-dialog',
        //     disableClose: true,
        //     data: {
        //         info: row
        //     }
        // })
    }

}



export interface tblGridAccGrab {

    tipoDocumentoSustento: string,
    tipoFormatoSustento: string,

    idTipoResolucion: number,
    idDocumentoSustento: number,
    idAccionGrabada: number,
    idTipoDocumentoSustento: number,
    idTipoFormatoSustento: number,
    numeroDocumentoSustento: string,
    entidadEmisora: string,
    fechaEmision: Date,
    numeroFolios: number,
    sumilla: string,
    codigoDocumentoSustento: string,
    vistoProyecto: boolean,
    DetallevistoProyecto: string,
    activo: boolean,
    fechaCreacion: Date,
    usuarioCreacion: string,
    ipCreacion: string,
    fechaModificacion?: Date,
    usuarioModificacion?: string,
    ipModificacion?: string

    archivoSustento: File;
    nombreArchivoSustento: string;
}

export interface tblGridConGrab {

    seccion: string,
    tipoSeccion: string,
    idSeccion: number,
    idtipoSeccion: number,
    considerando: string,
    sangria: boolean,
    activo: boolean,
    fechaCreacion: Date,
    usuarioCreacion: string,
    ipCreacion: string,
    fechaModificacion?: Date,
    usuarioModificacion?: string,
    ipModificacion?: string
}