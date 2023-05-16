import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { of, BehaviorSubject, Subject, Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { TablaSeccion, TablaTipoSeccion } from 'app/core/model/types';
import { HttpErrorResponse } from '@angular/common/http';
import { SingleFileInputTempComponent } from 'app/main/apps/components/single-file-input-temp/single-file-input-temp.component';
import { MESSAGE_GESTION } from '../../../_utils/constants';
import { CodigoDreUgelService } from '../../../services/codigo-dre-ugel.service';
import { RegimenGrupoAccionService } from '../../../services/regimen-grupo-accion.service';
import { IRegimenGrupoAccionResponse } from '../../../interfaces/regimen-grupo-accion.interface';
import { RegexPatterns } from '../../../_utils/regexPatterns';
import { VerInformacionSustentoComponent } from '../ver-informacion-sustento/ver-informacion-sustento.component';



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
    working: false;
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
    regimenGrupoAccionData$: Observable<IRegimenGrupoAccionResponse>;


    private _unsubscribeAll: Subject<any>;

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
        private codigoDreUgelService: CodigoDreUgelService,
        private regimenGrupoAccionService: RegimenGrupoAccionService
    ) {
        this.regimenGrupoAccionData$ = this.regimenGrupoAccionService.regimenGrupoAccionData$;
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

        this.seccion = TablaSeccion.SECCION.toUpperCase();
        this.tipoSeccion = TablaTipoSeccion.PARRAFO.toUpperCase();

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
        this.esMandatoJudicial = this.data.esMandatoJudicial;
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
            this.dataService.Message().msgWarning(`"${MESSAGE_GESTION.M08}"`);
            return;
        }

        const usuario = this.dataService.Storage().getPassportUserData();
        const form = this.formDocSustento.value;
        const documentoSustento = this.comboLists.listTipoDocumento.find(d => d.id_catalogo_item == form.idTipoDocumento);
        const formatoSustento = this.comboLists.listTipoFormato.find(d => d.id_catalogo_item == form.idTipoFormato);

        const item: tblGridAccGrab = {
            tipoDocumentoSustento: documentoSustento.descripcion_catalogo_item,
            tipoFormatoSustento: formatoSustento.descripcion_catalogo_item,
            idDocumentoSustento: 0,
            idAccionGrabada: 0,
            idTipoResolucion: 0,
            idTipoDocumentoSustento: form.idTipoDocumento,
            idTipoFormatoSustento: form.idTipoFormato,
            numeroDocumentoSustento: form.numeroDocumentoSustento,
            entidadEmisora: form.entidadEmisora,
            fechaEmision: form.fechaEmision,
            numeroFolios: Number(form.numeroFolios),
            sumilla: form.sumilla == null ? "" : form.sumilla,
            codigoDocumentoSustento: "",
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
            this.dataService.Message().msgWarning(`"${MESSAGE_GESTION.M08}"`);
            return;
        }

        // if (this.form.value.idTipoResolucion == null) {
        //     this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
        //     return;
        // }

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
            this.dataService.Message().msgWarning(`"${MESSAGE_GESTION.M124}"`);
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GENERAR EL PROYECTO?', async () => {
            const form = this.form.value;
            const usuario = this.dataService.Storage().getPassportUserData();
            const codigoTipoResolucion = form.idTipoResolucion;

            let data = {
                oProyectoResolucion: {
                    codigoTipoResolucion,
                    idTipoResolucion: form.idTipoResolucion,
                    usuarioCreacion: `${usuario.NOMBRES_USUARIO}`,
                    documentosSustento: this.ELEMENTOS_TEMP_DATAGRID,
                    codigoSistema: 4,
                    codigoTipoDocumentoIdentidad: this.propuesta.codigoTipoDocumentoIdentidad,
                    numeroDocumentoIdentidad: this.propuesta.numeroDocumentoIdentidad,
                    detalleConsiderando: this.CONSIDERANDO_TEMP_DATAGRID
                }
            }

            if (this.data.esSimple) {
               const dataSimple = {
                    ...data,
                    usuarioCreacion: `${usuario.NOMBRES_USUARIO}`,
                    idGestionPronoei: this.data?.idGestionPronoei ?? null,

                };
                this.generarProyectoSimple(dataSimple);
                return;
            }

            const gestionPronoeiPersona = this.data.formDataPronoei;
            const gestionPronoei = gestionPronoeiPersona.gestionPronoei;
            const persona = gestionPronoeiPersona.persona;
            const oProyectoResolucion = data.oProyectoResolucion;

            const _data = { ...data, gestionPronoei, persona, oProyectoResolucion };
            this.generarProyectoComplejo(_data);

        });
    }


    async generarProyectoComplejo(data) {
        this.dataService.Spinner().show("sp6");
        const formData = new FormData();
        this.appendFormData(formData, data, "");
        let isSuccess = true;
        var response = await this.dataService.AccionesVinculacion()
            .generarProyectoResolucionPronoeiComplejo(formData)
            .pipe(
                catchError((error) => {
                    isSuccess = false;
                    const errorMessage = error.error.messages[0];
                    this.dataService.Message().msgWarning(`"${errorMessage}"`.toUpperCase(), () => { });
                    this.dataService.Spinner().hide("sp6");
                    return of(null);
                }),
                finalize(() => { })
            ).toPromise();

        if (!isSuccess) { return; }
        if (response == -1) {
            this.dataService.Message().msgWarning('"NO SE PUEDE GENERAR EL PROYECTO POR FALTA DE CONFIGURACIÓN"', () => { });
            this.dataService.Spinner().hide("sp6");
            return;
        } else {
            this.dataService.Message().msgSuccess('"PROYECTO GENERADO CORRECTAMENTE"', () => { this.handleCancelar({ reload: true }); });
            this.dataService.Spinner().hide("sp6");
            this.dataService.Message().msgAutoCloseSuccessNoButton('"PROYECTO GENERADO CORRECTAMENTE"', 3000, () => {
                this.matDialogRef.close();
                this.router.navigate(['ayni/personal/acciones/pronoei']);
            });
        }
    }

    async generarProyectoSimple(data) {
        this.dataService.Spinner().show("sp6");
        const formData = new FormData();
        this.appendFormData(formData, data, "");
        let isSuccess = true;
        var response = await this.dataService.AccionesVinculacion()
            .generarProyectoResolucionPronoeiSimple(formData)
            .pipe(
                catchError((error) => {
                    isSuccess = false;
                    const errorMessage = error.error.messages[0];

                    this.dataService.Message().msgWarning(`"${errorMessage}"`.toUpperCase(), () => { });
                    this.dataService.Spinner().hide("sp6");
                    return of(null);
                }),
                finalize(() => { })
            ).toPromise();

        if (!isSuccess) { return; }
        if (response == -1) {
            this.dataService.Message().msgWarning('"NO SE PUEDE GENERAR EL PROYECTO POR FALTA DE CONFIGURACIÓN"', () => { });
            this.dataService.Spinner().hide("sp6");
            return;
        } else {
            this.dataService.Message().msgSuccess('Proyecto Generado Correctamente.', () => { this.handleCancelar({ reload: true }); });
            this.dataService.Spinner().hide("sp6");
            this.dataService.Message().msgAutoCloseSuccessNoButton('"PROYECTO GENERADO CORRECTAMENTE"', 3000, () => {
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
                seccion: this.seccion.toUpperCase(),
                tipoSeccion: this.tipoSeccion.toUpperCase(),
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
                .msgWarning(`"${MESSAGE_GESTION.M08}"`.toUpperCase(), () => { });
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

    loadTipoDocumentoSustento = () => {
        let request = {
            codigoCatalogo: 20
        }
        this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
            (response) => {
                const data = response.map((x) => ({
                    ...x,
                    value: x.id_catalogo_item,
                    label: `${x.descripcion_catalogo_item}`,
                }));
                this.comboLists.listTipoDocumento = data;
            },
            (error: HttpErrorResponse) => {
            }
        )
    }

    loadTipoResolucion = async () => {

        const entidadSede = this.codigoDreUgelService.getCodigoDreUgel();
        const request = {
            idDre: entidadSede.idDre,
            idUgel: entidadSede.idUgel,
            anio: (new Date).getFullYear()
        };

        var response = await this.dataService.AccionesVinculacion().getCatalogoTipoResolPronoei(request).toPromise();
        if (response) {
            const data = response.map((x) => ({
                ...x,
                value: x.id_catalogo_item,
                label: `${x.descripcion_catalogo_item}`,
            }));
            this.comboLists.listTipoResolucion = data;
        }
    }

    loadTipoFormato = () => {
        let request = {
            codigoCatalogo: 33
        }
        this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
            (response) => {
                const data = response.map((x) => ({
                    ...x,
                    value: x.id_catalogo_item,
                    label: `${x.descripcion_catalogo_item}`,
                }));
                this.comboLists.listTipoFormato = data;
            },
            (error: HttpErrorResponse) => {
            }
        )
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
        this.dialogRef = this.materialDialog.open(VerInformacionSustentoComponent, {
            panelClass: 'modal-ver-informacion-dialog',
            disableClose: true,
            data: {
                info: row
            }
        })
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