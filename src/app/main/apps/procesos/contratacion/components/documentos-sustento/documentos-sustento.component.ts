import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { Subscription, BehaviorSubject, of, Observable, Subject } from 'rxjs';
import {
    SelectionModel,
    DataSource,
    CollectionViewer,
} from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from 'app/core/shared/globals.service';
import { saveAs } from "file-saver";
import { TablaConfiguracionSistema } from 'app/core/model/types';
import { ResultadoOperacionEnum } from 'app/main/apps/bandejas/actividades/gestion-pendientes/_utils/constants';
import { DocumentoSustentoModel } from '../../models/contratacion.model';
import { InformacionDocumentoSustentoComponent } from '../informacion-documento-sustento/informacion-documento-sustento.component';


@Component({
    selector: 'minedu-documentos-sustento',
    templateUrl: './documentos-sustento.component.html',
    styleUrls: ['./documentos-sustento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class DocumentosSustentoComponent implements OnInit {
    form: FormGroup;
    comboLists = {
        listTiposSustento: [],
        listTiposTipoFormato: [],
    };
    maxDate = new Date();
    displayedColumns: string[] = [
        'tipoSustento',
        'numeroDocumento',
        'fechaEmision',
        'tipoFormato',
        'folios',
        'fechaRegistro',
        'acciones',
    ];
    selection = new SelectionModel<any>(true, []);
    dataSource: SustentoDataSource | null;
    @Input() data: DocumentoSustentoModel[] = [];
    @Input() soloLectura: boolean;
    @Input() listTiposSustento: any[] = [];
    @Input() listTiposTipoFormato: any[] = [];
    @Input() sustentoObligatorio = false;

    dialogRef: any;
    archivoAdjunto: any;
    currentSession = {
        idDre: 1,
        idUgel: 1,
        codigoRolPassport: '1',
        codigoUsuario: '1'
    };
    working = false;
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
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private globals: GlobalsService,
    ) { }

    ngOnInit(): void {
        this.buildForm();
        this.handleResponsive();
        this.dataSource = new SustentoDataSource();
        this.dataSource.load(this.data, 1, 10);
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    actualizarLista = (data: DocumentoSustentoModel[]) => {
        this.data = data;
        this.dataSource.load(this.data, 1, 10);
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idDocumentoSustento: [0],
            idTipoDocumentoSustento: [null, Validators.required],
            idTipoFormatoSustento: [null, Validators.required],
            numeroDocumentoSustento: [null, Validators.required],
            entidadEmisora: [null],
            fechaEmision: [null, Validators.required],
            numeroFolios: [null, Validators.required],
            sumilla: [null],
            codigoDocumentoSustento: [null, [Validators.maxLength(100)]],
            codigoAdjuntoSustento: [null, [Validators.maxLength(100)]],
        });

        if (this.sustentoObligatorio) {
            this.form.get('codigoDocumentoSustento').setValidators(Validators.required);
        }
    }

    asignarData = (row) => {
        const model: DocumentoSustentoModel = new DocumentoSustentoModel();
        model.idDocumentoSustento = 0;
        model.idLicencia = 0;
        model.idTipoDocumentoSustento = row.idTipoDocumentoSustento;
        model.idTipoFormatoSustento = row.idTipoFormatoSustento;
        model.numeroDocumentoSustento = row.numeroDocumentoSustento;
        model.entidadEmisora = row.entidadEmisora;
        model.fechaEmision = moment(row.fechaEmision).format('DD/MM/YYYY');
        model.numeroFolios = +row.numeroFolios;
        model.sumilla = row.sumilla;
        // model.codigoDocumentoSustento = row
        model.fechaRegistro = moment(new Date()).format('DD/MM/YYYY');
        this.listTiposSustento.forEach(element => {
            if (element.value === model.idTipoDocumentoSustento) {
                model.descripcionTipoSustento = element.label;
            }
        });

        this.listTiposTipoFormato.forEach(element => {
            if (element.value === model.idTipoFormatoSustento) {
                model.descripcionTipoFormato = element.label;
            }
        });
        return model;
    }

    limpiar = () => {
        this.form.reset();
        this.archivoAdjunto = null;
    }

    handleAdd(form): void {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Debe ingresar datos obligatorios.', () => { });
            return;
        }
        const model = this.asignarData(this.form.getRawValue());
        const mensajeConfirmacion = '¿Esta seguro de que desea guardar la información?';

        if (typeof this.archivoAdjunto === 'undefined' || this.archivoAdjunto == null) {
            this.dataService.Message().msgConfirm(mensajeConfirmacion, () => {
                this.dataService.Spinner().show("sp6");
                this.agregarNuevo(model);
                this.dataService.Spinner().hide("sp6");
            }, () => { });
        } else {
            const datosDocumento = new FormData();
            datosDocumento.append('codigoSistema', TablaConfiguracionSistema.LICENCIA_CERTIFICADO.toString());
            datosDocumento.append('descripcionDocumento', this.form.get('codigoDocumentoSustento').value);
            datosDocumento.append('codigoUsuarioCreacion', this.currentSession.codigoUsuario);
            datosDocumento.append('archivo', this.archivoAdjunto);

            if (typeof this.archivoAdjunto === 'undefined' || this.archivoAdjunto == null) {
                this.dataService.Message().msgWarning('Debe adjuntar un documento de sustento.', () => { });
                return;
            }
            // M02: ¿ESTÁ SEGURO DE QUE DESEA GUARDAR LA INFORMACIÓN?
            this.dataService.Message().msgConfirm(mensajeConfirmacion, () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Documento().crear(datosDocumento).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.working = false;
                        this.dataService.Spinner().hide("sp6");
                    })
                ).subscribe(response => {
                    if (response && response.data.codigoDocumento) {
                        model.codigoDocumentoSustento = response.data.codigoDocumento;
                        this.agregarNuevo(model);
                    } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else {
                        this.dataService.Message()
                            .msgError('Ocurrieron algunos problemas al registrar el documento de certificado, por favor intente dentro de unos segundos, gracias.',
                                () => { });
                    }
                });

            }, () => { });
        }
    }

    agregarNuevo = (model) => {
        const data: DocumentoSustentoModel[] = this.dataSource.data;
        data.push(model);
        this.dataSource.load(data, 0, 10);
        this.limpiar();
        this.data = data;
    }

    hadleEliminarRow = (row, index) => {
        Swal.fire({
            title: '',
            text: '¿Está seguro de que desea eliminar la información?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.dataSource.data.splice(index, 1);
                this.actualizarLista(this.dataSource.data);
            }
        });
    }

    adjunto = (pIdDocumento) => {
        this.form.patchValue({ codigoDocumentoSustento: pIdDocumento });
    }

    confirmarDocumento = () => {
        const form = this.form.value;
        this.dataService.Documento().confirmar(form.codigoDocumentoSustento).subscribe(response => { });
    }


    handleInfo = (row: any, i) => {

        this.dialogRef = this.materialDialog.open(InformacionDocumentoSustentoComponent, {
            panelClass: 'informacion-documento-sustento-dialog',
            width: '600px',
            disableClose: true,
            data: {
                row: row,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                // this.handleBuscar();
            }
        });

    }

    uploadFile = (files) => {
        const inputNode: any = document.querySelector('#file');

        if (typeof (FileReader) !== 'undefined') {
            if (files[0].size >= this.globals.PESO_ARCHIVO_ADJUNTO_2MB) {
                this.dataService.Message().msgWarning(`El archivo adjunta supera el limite permitido de ${this.globals.PESO_2MB}.`, () => { });

            } else {
                this.form.controls['codigoDocumentoSustento'].setValue(files[0].name);
                this.archivoAdjunto = files[0];
            }
        }
    }

    descargarDocumentoSustento = (row) => {
        const data = row;

        if (data.codigoDocumentoSustento === null || data.codigoDocumentoSustento === '00000000-0000-0000-0000-000000000000' ||
            data.codigoDocumentoSustento === '') {
            this.dataService.Message().msgWarning('No tiene Documento sustento.', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(data.codigoDocumentoSustento)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                    saveAs(response, "documentosustento.pdf");
                } else {
                    this.dataService.Message().msgWarning('No se pudo descargar documento sustento', () => { });
                }
            });
    }

}

export class SustentoDataSource extends DataSource<any>{
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor() {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        // this._dataChange.next(data);
        this._dataChange.next(data || []);
        this.totalregistro = 0;
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
