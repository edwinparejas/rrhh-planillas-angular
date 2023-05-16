import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../../../core/data/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { saveAs } from "file-saver";
import * as moment from 'moment';
import { ENCARGATURA_MESSAGE } from '../../_utils/message';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { InformacionDocumentoSustentoEncargaturaComponent } from '../informacion-documento-sustento-encargatura/informacion-documento-sustento-encargatura.component';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';


@Component({
    selector: "minedu-registro-documento-sustento-encargatura",
    templateUrl: "./registro-documento-sustento-encargatura.component.html",
    styleUrls: ["./registro-documento-sustento-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroDocumentoSustentoEncargaturaComponent implements OnInit {
    plazasSeleccionadas: number;
    formMotivoNoPublicacion: FormGroup;
    formDocumentoSustento: FormGroup;
    loading = false;
    comboLists = {
        listMotivoNoPublicacion: [],
        listTiposDocumentoSustento: [],
        listTiposFormatoSustento: []
    };
    dialogRefPreview: any;
    nombreUsuario: string;
    maxDate = new Date();
    dataSource: DocumentoSustentoDataSource | null;
    archivoAdjunto: any;
    totalSelected=false;
    listaPlazaEncargatura = [];
    listaPlazaEncargaturaDesSeleccion = [];
    listaDocumentoSustento = [];
    requestParam: any;
    displayedColumns: string[] = [
        'N',
        'tipoDocumento',
        'numeroDocumento',
        'tipoFormato',
        'folios',
        'fechaEmision',
        'fechaRegistro',
        'acciones',
    ];
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
        public dialogRef: MatDialogRef<RegistroDocumentoSustentoEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        this.requestParam = data.requestParam;
        this.totalSelected = data.totalSelected;
        this.listaPlazaEncargatura = data.listaPlazaEncargatura;
        this.listaPlazaEncargaturaDesSeleccion = data.listaPlazaEncargaturaDesSeleccion;
        this.nombreUsuario = data.nombreUsuario;
        this.plazasSeleccionadas = this.listaPlazaEncargatura.length;
    }

    ngOnInit(): void {
        this.buildForm();
        this.loadCombos();
        this.dataSource = new DocumentoSustentoDataSource();
    }

    buildForm() {
        this.formMotivoNoPublicacion = this.formBuilder.group({
            codigoMotivoNoPublicacion: [null, Validators.required],
            detalleNoPublicacion: [null, Validators.required]
        });

        this.formDocumentoSustento = this.formBuilder.group({
            codigoTipoDocumentoSustento: [null, Validators.required],
            numeroDocumentoSustento: [null, Validators.required],
            entidadEmisora: [null],
            fechaEmision: [null, Validators.required],
            numeroFolios: [null, Validators.required],
            codigoTipoFormatoSustento: [null, Validators.required],
            sumilla: [null],
            codigoDocumentoSustento: [null, [Validators.maxLength(40)]],
            codigoAdjuntoSustento: [null, [Validators.maxLength(100)]],
        });
    }

    resetFormDocumentoSustento() {
        this.formDocumentoSustento.controls.codigoTipoDocumentoSustento.reset();
        this.formDocumentoSustento.controls.numeroDocumentoSustento.setValue(null);
        this.formDocumentoSustento.controls.entidadEmisora.setValue(null);
        this.formDocumentoSustento.controls.fechaEmision.setValue(null);
        this.formDocumentoSustento.controls.numeroFolios.setValue(0);
        this.formDocumentoSustento.controls.codigoTipoFormatoSustento.reset();
        this.formDocumentoSustento.controls.sumilla.setValue(null);
        this.formDocumentoSustento.controls.codigoDocumentoSustento.setValue(null);
        this.formDocumentoSustento.controls.codigoAdjuntoSustento.setValue(null);
        this.archivoAdjunto = null;
    }

    loadCombos() {
        this.loadMotivoNoPublicacion();
        this.loadTipoDocumentoSustento();
        this.loadTipoFormatoSustento();
    }

    loadMotivoNoPublicacion() {
        this.dataService.Encargatura().getComboMotivoNoPublicacion().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listMotivoNoPublicacion = result.map((x) => ({
                    ...x,
                    value: x.codigoMotivoNoPublicacion,
                    label: x.descripcionMotivoNoPublicacion
                }));
            }
        });
    }

    loadTipoDocumentoSustento() {
        this.dataService.Encargatura().getComboTipoDocumentoSustento().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listTiposDocumentoSustento = result.map((x) => ({
                    ...x,
                    value: x.codigoTipoDocumentoSustento,
                    label: x.descripcionTipoDocumentoSustento
                }));
            }
        });
    }

    loadTipoFormatoSustento() {
        this.dataService.Encargatura().getComboTipoFormatoSustento().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listTiposFormatoSustento = result.map((x) => ({
                    ...x,
                    value: x.codigoTipoFormatoSustento,
                    label: x.descripcionTipoFormatoSustento
                }));
            }
        });
    }

    handleAddDocumentoSustento() {
        if (this.formDocumentoSustento.valid == false) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M08, () => { });
            return;
        }
        if(this.formDocumentoSustento.controls.numeroFolios.value==0){
            this.dataService.Message().msgWarning('"DEBE INGRESAR VALOR AL CAMPO FOLIO"', () => { });
            return;
        }
        const model = this.setDocumentoSustento(this.formDocumentoSustento.getRawValue());
        if (typeof this.archivoAdjunto == 'undefined' || this.archivoAdjunto == null) {
            this.addDocumentoSustento(model);
        } else {
            const formData = new FormData();
            formData.append('archivoAdjuntoDocumentoSustento', this.archivoAdjunto);
            formData.append('UsuarioCreacion', this.nombreUsuario);
            this.dataService.Encargatura().uploadDocumentoSustento(formData).pipe(catchError((e) => of(e)), finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })).subscribe(result => {
                if (result?.codigoDocumento) {
                    this.addDocumentoSustento(model, result.codigoDocumento);
                } else {
                    this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                }
            });
        }
    }

    uploadFile(files: any) {
        const inputNode: any = document.querySelector('#file');
        if (typeof (FileReader) !== 'undefined') {
            if (files[0].size >= (2 * 1024 * 1024)) {
                this.dataService.Message().msgWarning('"EL ARCHIVO ADJUNTO SUPERA EL LIMITE PERMITIDO DE 2MB."', () => { });
            } else {
                if(files[0].type!="application/pdf") {
                    this.dataService.Message().msgAutoWarning('"EL ARCHIVO ADJUNTO NO ES DEL FORMATO PDF."',3000, () => { });
                    return;
                }
                this.formDocumentoSustento.controls['codigoAdjuntoSustento'].setValue(files[0].name);
                this.archivoAdjunto = files[0];
            }
        }
    }

    setDocumentoSustento(row: any) {
        const tipoDocumentoSustento = this.comboLists.listTiposDocumentoSustento.filter(function (x) {
            return x.value == row.codigoTipoDocumentoSustento;
        })[0];
        const tipoFormatoSustento = this.comboLists.listTiposFormatoSustento.filter(function (x) {
            return x.value == row.codigoTipoFormatoSustento;
        })[0];

        return {
            codigoTipoDocumentoSustento: row.codigoTipoDocumentoSustento,
            descripcionTipoDocumentoSustento: tipoDocumentoSustento.label,
            numeroDocumentoSustento: row.numeroDocumentoSustento,
            entidadEmisora: row.entidadEmisora,
            fechaEmision: moment(row.fechaEmision).format('DD/MM/YYYY'),
            numeroFolios: row.numeroFolios,
            codigoTipoFormatoSustento: row.codigoTipoFormatoSustento,
            descripcionTipoFormatoSustento: tipoFormatoSustento.label,
            sumilla: row.sumilla,
            fechaRegistro: moment(new Date()).format('DD/MM/YYYY'),
            codigoAdjuntoSustento: null
        };
    }

    addDocumentoSustento(row: any, codigoDocumento = '') {
        if (codigoDocumento != '') row.codigoAdjuntoSustento = codigoDocumento;
        const data = this.dataSource.data;
        data.push(row);
        this.dataSource.load(data);
        this.resetFormDocumentoSustento();
        this.listaDocumentoSustento = data;
    }

    handleSave() {
        if (this.formMotivoNoPublicacion.valid == false) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M08, () => { });
            return;
        }

        if (this.listaDocumentoSustento.length === 0) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M37, () => { });
            return;
        }

        this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.M30, () => {
            const motivoNoPublicacion = this.formMotivoNoPublicacion.getRawValue();
            const request = {
                ...this.requestParam,
                ...motivoNoPublicacion,
                totalSeleccionado:this.totalSelected,
                listaPlazaEncargaturaSeleccionado: this.listaPlazaEncargatura,
                listaPlazaEncargaturaDeselecionado: this.listaPlazaEncargaturaDesSeleccion,
                listaDocumentoSustento: this.listaDocumentoSustento,
                UsuarioModificacion:this.nombreUsuario
            };
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().remarkPlazaEncargatura(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => { });
                        this.dialogRef.close({event:'Save'});
                    } else {
                        this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                    }
                }
            });
        }, () => { });
    }

    handleRemoveDocumentoSustento(index: number) {
        const data = this.dataSource.data;
        data.splice(index, 1);
        this.dataSource.load(data);
        this.listaDocumentoSustento = data;
    }

    handleCancel() {
        this.dialogRef.close({event:'Cancel'});
    }
    
    handleViewDocumentoSustento(row: any){
        this.materialDialog.open(InformacionDocumentoSustentoEncargaturaComponent, {
            panelClass: 'minedu-informacion-documento-sustento-encargatura',
            width: '500px',
            disableClose: true,
            data: {
                info: row
            }
        });
    }
    // handleDownloadAdjuntoSustento(row: any) {
    //     this.loading = true;
    //     this.dataService.Spinner().show("sp6");
    //     this.dataService.Encargatura().downloadDocumentoSustento(row.codigoAdjuntoSustento).pipe(catchError((e) => of(e)), finalize(() => {
    //         this.dataService.Spinner().hide("sp6")
    //         this.loading = false;
    //     })).subscribe(result => {
    //         if (result) {
    //             saveAs(result, "documentosustento.pdf");
    //         } else {
    //             this.dataService.Message().msgWarning('"NO SE PUDO DESCARGAR DOCUMENTO SUSTENTO"', () => { });
    //         }
    //     });
    // }
    handleDownloadAdjuntoSustento = (row: any) => {
        const codigoAdjunto = row.codigoAdjuntoSustento;

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE DOCUMENTO ESCANEADO."', () => {
            });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(codigoAdjunto)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreview(response, codigoAdjunto);
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO ESCANEADO."', () => {
                    });
                }
            });
    };

    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,            
            width: '100%',
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Documento Escaneado',
                    file: file,
                    fileName: codigoAdjuntoSustento
                }
            }
        });

        this.dialogRefPreview.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    };
}

export class DocumentoSustentoDataSource extends DataSource<any>{
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();

    constructor() {
        super();
    }

    load(data: any): void {
        this._loadingChange.next(false);
        this._dataChange.next(data || []);
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