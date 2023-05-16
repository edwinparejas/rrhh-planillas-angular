import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../../../../../core/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../../../../../core/shared/globals.service';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { catchError, finalize } from 'rxjs/operators';
import { TablaConfiguracionSistema, ResultadoOperacionEnum } from '../../../../../../../core/model/types';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { InformacionFormacionAcademicaComponent } from '../informacion-formacion-academica/informacion-formacion-academica.component';
import { FormacionAcademicaModel } from '../../../models/reasignacion.model';


@Component({
    selector: 'minedu-formacion-academica',
    templateUrl: './formacion-academica.component.html',
    styleUrls: ['./formacion-academica.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class FormacionAcademicaComponent implements OnInit {
    form: FormGroup;
    selection = new SelectionModel<any>(true, []);
    dataSource: FormacionAcademicaDataSource | null;
    @Input() data: FormacionAcademicaModel[] = [];
    @Input() soloLectura: boolean;
    archivoAdjunto: any;
    working = false;
    dialogRef: any;
    displayedColumns: string[] = [
        'fechaRegistro',
        'descripcionNivelEducativo',
        'descripcionGrado',
        'descripcionAreaCurricular',
        'descripcionCentroEstudio',
        'anioInicioEstudios',
        'anioFinEstudios',
        'estudioCompleto',
        'sustento',
        'acciones',
    ];

    comboLists = {
        listNivelEducativo: [],
        listGrado: [],
        listAreaCurricular: [],
        listCentroEstudio: [],
        listEstudiosCompletados: []
    };

    currentSession = {
        idDre: 1,
        idUgel: 1,
        codigoRolPassport: '1',
        codigoUsuario: '1'
    };
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
        private globals: GlobalsService) { }

    ngOnInit(): void {
        this.buildForm();
        this.handleResponsive();
        this.loadNivelEducativa();
        this.loadAreaCurricular();
        this.loadGradoEstudio();
        this.loadCentroEstudio();
        this.loadEstudioCompleto();
        this.dataSource = new FormacionAcademicaDataSource();
        this.dataSource.load(this.data, 1, 20);
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idFormacionAcademica: [0],
            idNivelEducativo: [null, Validators.required],
            idGradoEstudio: [null, Validators.required],
            idAreaCurricular: [null, Validators.required],
            idCentroEstudio: [null, Validators.required],
            anioInicioEstudios: [null, Validators.required],
            anioFinEstudios: [null, Validators.required],
            fechaExpedicionGradoEstudios: [null, Validators.required],
            idEstudiosCompletos: [null, Validators.required],
            codigoAdjuntoSustento: [null, [Validators.required, Validators.maxLength(100)]],
        });
    }

    actualizarLista = (data: FormacionAcademicaModel[]) => {
        this.data = data;
        this.dataSource.load(this.data, 1, 20);
    }

    limpiar = () => {
        this.form.reset();
        this.archivoAdjunto = null;
    }

    asignarData = (row) => {
        const model: FormacionAcademicaModel = new FormacionAcademicaModel();
        model.idFormacionAcademica = 0;
        model.idPostulacion = 0;
        model.idNivelEducativo = row.idNivelEducativo;
        model.idGradoEstudio = row.idGradoEstudio;
        model.idAreaCurricular = row.idAreaCurricular;
        model.idCentroEstudio = row.idCentroEstudio;
        model.idEstudiosCompletos = row.idEstudiosCompletos;
        model.codigoFormacionAcademica = 0;
        model.anioInicioEstudios = row.anioInicioEstudios;
        model.anioFinEstudios = row.anioFinEstudios;
        model.fechaExpedicionGradoEstudios = row.fechaExpedicionGradoEstudios; // moment(row.fechaExpedicionGradoEstudios).format('DD/MM/YYYY');
        // model.codigoAdjuntoSustento = null;
        model.beneficiarioPronabec = false;
        model.fechaRegistro = new Date(); // moment(new Date()).format('DD/MM/YYYY');

        this.comboLists.listNivelEducativo.forEach(element => {
            if (element.value === model.idNivelEducativo) {
                model.descripcionNivelEducativo = element.label;
            }
        });

        this.comboLists.listGrado.forEach(element => {
            if (element.value === model.idGradoEstudio) {
                model.descripcionGradoEstudio = element.label;
            }
        });

        this.comboLists.listAreaCurricular.forEach(element => {
            if (element.value === model.idAreaCurricular) {
                model.descripcionAreaCurricular = element.label;
            }
        });

        this.comboLists.listCentroEstudio.forEach(element => {
            if (element.value === model.idCentroEstudio) {
                model.descripcionCentroEstudio = element.label;
            }
        });

        this.comboLists.listEstudiosCompletados.forEach(element => {
            if (element.value === model.idEstudiosCompletos) {
                model.descripcionEstudiosCompletos = element.label;
            }
        });

        return model;
    }

    handleAdd(form): void {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Debe ingresar datos obligatorios.', () => { });
            return;
        }
        const model = this.asignarData(this.form.getRawValue());

        // validaciones 
        if (model.anioFinEstudios < model.anioInicioEstudios) {
            this.dataService.Message().msgWarning('Año fin debe ser mayor o igual a año inicio.', () => { });
            return;
        }

        const confirmMessage = '¿Esta seguro de que desea guardar la información?';

        const datosDocumento = new FormData();
        datosDocumento.append('codigoSistema', TablaConfiguracionSistema.LICENCIA_CERTIFICADO.toString()); // TODO
        datosDocumento.append('descripcionDocumento', this.form.get('codigoAdjuntoSustento').value);
        datosDocumento.append('codigoUsuarioCreacion', this.currentSession.codigoUsuario);
        datosDocumento.append('archivo', this.archivoAdjunto);
        if (typeof this.archivoAdjunto === 'undefined' || this.archivoAdjunto == null) {
            this.dataService.Message().msgWarning('Debe adjuntar un documento de sustento.', () => { });
            return;
        }
        this.dataService.Message().msgConfirm(confirmMessage, () => {
            this.dataService.Spinner().show('sp6');
            this.dataService.Documento().crear(datosDocumento).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.working = false;
                    this.dataService.Spinner().hide('sp6');
                })
            ).subscribe(response => {
                if (response && response.data.codigoDocumento) {
                    model.codigoAdjuntoSustento = response.data.codigoDocumento;
                    const data: FormacionAcademicaModel[] = this.dataSource.data;
                    data.push(model);
                    this.dataSource.load(data, 0, 20);
                    this.limpiar();
                    this.data = data;
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

    hadleEliminarRow(row, index): void {
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

    handleInfo(row): void {
        this.dialogRef = this.materialDialog.open(InformacionFormacionAcademicaComponent, {
            panelClass: 'informacion-formacion-academica-dialog',
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

    descargarAdjunto(row): void {
        const data = row;
        if (data.codigoAdjuntoSustento === null || data.codigoAdjuntoSustento === '00000000-0000-0000-0000-000000000000' ||
            data.codigoAdjuntoSustento === '') {
            this.dataService.Message().msgWarning('No tiene Documento sustento.', () => { });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(data.codigoAdjuntoSustento)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    saveAs(response, 'formacion-academica.pdf');
                } else {
                    this.dataService.Message().msgWarning('No se pudo descargar documento sustento', () => { });
                }
            });
    }

    uploadFile = (files) => {
        const inputNode: any = document.querySelector('#file');

        if (typeof (FileReader) !== 'undefined') {
            if (files[0].size >= this.globals.PESO_ARCHIVO_ADJUNTO_2MB) {
                this.dataService.Message().msgWarning(`El archivo adjunta supera el limite permitido de ${this.globals.PESO_2MB}.`, () => { });

            } else {
                this.form.controls['codigoAdjuntoSustento'].setValue(files[0].name);
                this.archivoAdjunto = files[0];
            }
        }
    }

    loadNivelEducativa = () => {
        this.dataService.Reasignaciones().getAllComboNivelEducativa().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idNivelEducativo,
                    label: `${x.descripcionNivelEducativo}`
                }));
                this.comboLists.listNivelEducativo = data;
            }
        });
    }

    loadAreaCurricular = () => {
        this.dataService.Reasignaciones().getComboAreacurricular().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idAreaCurricular,
                    label: `${x.descripcionAreaCurricular}`
                }));
                this.comboLists.listAreaCurricular = data;

            }
        });
    }

    loadGradoEstudio = () => {
        this.dataService.Reasignaciones().getComboGradoEstudio().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idGradoEstudio,
                    label: `${x.descripcionGradoInstruccion}`
                }));
                this.comboLists.listGrado = data;

            }
        });
    }
    loadCentroEstudio = () => {
        this.dataService.Reasignaciones().getComboCentroEstudio().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCentroEstudio,
                    label: `${x.descripcionCentroEstudio}`
                }));
                this.comboLists.listCentroEstudio = data;

            }
        });
    }

    loadEstudioCompleto = () => {
        this.dataService.Reasignaciones().getComboEstudioCompleto().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.listEstudiosCompletados = data;

            }
        });
    }

}

export class FormacionAcademicaDataSource extends DataSource<any>{
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
