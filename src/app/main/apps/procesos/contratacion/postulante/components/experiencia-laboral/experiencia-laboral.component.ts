import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { DataService } from '../../../../../../../core/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../../../../../core/shared/globals.service';
import { catchError, finalize } from 'rxjs/operators';
import { ExperienciaLaboralCalc, ExperienciaLaboralModel } from '../../../models/contratacion.model';
import { TablaConfiguracionSistema, ResultadoOperacionEnum } from '../../../../../../../core/model/types';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { InformacionExperienciaLaboralComponent } from '../informacion-experiencia-laboral/informacion-experiencia-laboral.component';

@Component({
    selector: 'minedu-experiencia-laboral',
    templateUrl: './experiencia-laboral.component.html',
    styleUrls: ['./experiencia-laboral.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ExperienciaLaboralComponent implements OnInit {
    form: FormGroup;
    selection = new SelectionModel<any>(true, []);
    dataSource: ExperienciaLaboralDataSource | null;
    @Input() data: ExperienciaLaboralModel[] = [];
    @Input() soloLectura: boolean;
    archivoAdjunto: any;
    working = false;
    dialogRef: any;
    maxDate = new Date();
    minDate = new Date();    
    displayedColumns: string[] = [
        'descripcionTipoExperiencia',
        'cargoExperienciaLaboral',
        'descripcionNivelExperiencia',
        'descripcionTipoEntidad',
        'nombreEntidad',
        'fechaInicio',
        'fechaFin',
        'sustento',
        'acciones',
    ];

    comboLists = {
        listTipoExperiencia: [],
        listNivelExperiencia: [],
        listTipoEntidad: [],
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
        private globals: GlobalsService
    ) { }

    ngOnInit(): void {
        this.buildForm();
        this.handleResponsive();
        this.loadNivelExperiencia();
        this.loadTipoExperiencia();
        this.loadTipEntidad();
        this.dataSource = new ExperienciaLaboralDataSource();
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
            idExperienciaLaboral: [0],
            idTipoExperiencia: [null, Validators.required],
            cargoExperienciaLaboral: [null, Validators.required],
            idNivelExperiencia: [null, Validators.required],
            fechaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
            idTipoEntidad: [null, Validators.required],
            nombreEntidad: [null, Validators.required],
            codigoAdjuntoSustento: [null, [Validators.required, Validators.maxLength(100)]],
        });
    }

    configurarFechaFin = () => {
        this.form.get('fechaFin').setValue(null);
        this.maxDate = this.form.get('fechaInicio').value;
        this.minDate = this.form.get('fechaInicio').value;
    }

    actualizarLista = (data: ExperienciaLaboralModel[]) => {
        this.data = data;
        this.dataSource.load(this.data, 1, 20);
    }

    asignarData = (row) => {
        const model: ExperienciaLaboralModel = new ExperienciaLaboralModel();
        model.idExperienciaLaboral = 0;
        model.idPostulacion = 0;
        model.idTipoExperiencia = row.idTipoExperiencia;
        model.idNivelExperiencia = row.idNivelExperiencia;
        model.idTipoEntidad = row.idTipoEntidad;
        model.cargoExperienciaLaboral = row.cargoExperienciaLaboral;
        model.fechaInicio = row.fechaInicio;
        model.fechaFin = row.fechaFin;
        model.nombreEntidad = row.nombreEntidad;
        model.codigoExperienciaLaboral = 0;
        // model.codigoAdjuntoSustento = null;

        this.comboLists.listTipoExperiencia.forEach(element => {
            if (element.value === model.idTipoExperiencia) {
                model.descripcionTipoExperiencia = element.label;
            }
        });

        this.comboLists.listNivelExperiencia.forEach(element => {
            if (element.value === model.idNivelExperiencia) {
                model.descripcionNivelExperiencia = element.label;
            }
        });

        this.comboLists.listTipoEntidad.forEach(element => {
            if (element.value === model.idTipoEntidad) {
                model.descripcionTipoEntidad = element.label;
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
        const confirmMessage = '¿Esta seguro de que desea guardar la información?';

        const datosDocumento = new FormData();
        datosDocumento.append('codigoSistema', TablaConfiguracionSistema.LICENCIA_CERTIFICADO.toString());
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
                    const data: ExperienciaLaboralModel[] = this.dataSource.data;
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
        this.dialogRef = this.materialDialog.open(InformacionExperienciaLaboralComponent, {
            panelClass: 'informacion-experiencia-laboral-dialog',
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
                    saveAs(response, 'experiencia-laboral.pdf');
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

    loadTipoExperiencia = () => {
        this.dataService.Contrataciones().getComboTipoExperiencia().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.listTipoExperiencia = data;
            }
        });
    }

    loadNivelExperiencia = () => {
        this.dataService.Contrataciones().getComboNivelExperiencia().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.listNivelExperiencia = data;
            }
        });
    }

    loadTipEntidad = () => {
        this.dataService.Contrataciones().getComboTipoEntidad().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.listTipoEntidad = data;
            }
        });
    }
}

export class ExperienciaLaboralDataSource extends DataSource<any>{
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
