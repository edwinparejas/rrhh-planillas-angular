import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { DataService } from '../../../../../../../core/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../../../../../core/shared/globals.service';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { catchError, finalize } from 'rxjs/operators';
import { CapacitacionModel } from '../../../models/contratacion.model';
import { TablaConfiguracionSistema, ResultadoOperacionEnum } from '../../../../../../../core/model/types';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { InformacionCapacitacionesComponent } from '../informacion-capacitaciones/informacion-capacitaciones.component';

@Component({
    selector: 'minedu-capacitaciones',
    templateUrl: './capacitaciones.component.html',
    styleUrls: ['./capacitaciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CapacitacionesComponent implements OnInit {
    form: FormGroup;
    selection = new SelectionModel<any>(true, []);
    dataSource: CapacitacionDataSource | null;
    @Input() data: CapacitacionModel[] = [];
    @Input() soloLectura: boolean;
    archivoAdjunto: any;
    working = false;
    dialogRef: any;
    maxDate = new Date();
    minDate = new Date();

    displayedColumns: string[] = [
        'fechaRegistro',
        'descripcionTipoCapacitacion',
        'nombreCapacitacion',
        'fechaInicio',
        'fechaFin',
        'duracionHoras',
        'institucionCapacitacion',
        'lugarCapacitacion',
        'sustento',
        'acciones',
    ];

    comboLists = {
        listTipoCapacitacion: [],
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
        this.loadTipoCapacitacion();
        this.dataSource = new CapacitacionDataSource();
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
            idCapacitacion: [0],
            idTipoCapacitacion: [null, Validators.required],
            nombreCapacitacion: [null, Validators.required],
            fechaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
            duracionHoras: [null, Validators.required],
            institucionCapacitacion: [null, Validators.required],
            lugarCapacitacion: [null, Validators.required],
            codigoAdjuntoSustento: [null, [Validators.required, Validators.maxLength(100)]],
        });
    }

    configurarFechaFin = () => {
        this.form.get('fechaFin').setValue(null);
        this.maxDate = this.form.get('fechaInicio').value;
        this.minDate = this.form.get('fechaInicio').value;
    }
    
    actualizarLista = (data: CapacitacionModel[]) => {
        this.data = data;
        this.dataSource.load(this.data, 1, 20);
    }

    asignarData = (row) => {
        const model: CapacitacionModel = new CapacitacionModel();
        model.idCapacitacion = 0;
        model.idPostulacion = 0;
        model.idTipoCapacitacion = row.idTipoCapacitacion;
        model.idPais = 1;
        model.nombreCapacitacion = row.nombreCapacitacion;
        model.fechaInicio = row.fechaInicio;
        model.fechaFin = row.fechaFin;
        model.duracionHoras = row.duracionHoras;
        model.institucionCapacitacion = row.institucionCapacitacion;
        model.lugarCapacitacion = row.lugarCapacitacion;
        model.codigoCapacitacion = 0;
        // model.codigoAdjuntoSustento = null;
        model.fechaCreacion = new Date(); // moment(new Date()).format('DD/MM/YYYY');

        this.comboLists.listTipoCapacitacion.forEach(element => {
            if (element.value === model.idTipoCapacitacion) {
                model.descripcionTipoCapacitacion = element.label;
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
                    const data: CapacitacionModel[] = this.dataSource.data;
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
        this.dialogRef = this.materialDialog.open(InformacionCapacitacionesComponent, {
            panelClass: 'informacion-capacitaciones-dialog',
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
                    saveAs(response, 'capacitacion.pdf');
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

    loadTipoCapacitacion = () => {
        this.dataService.Contrataciones().getComboTipoCapacitacion().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.listTipoCapacitacion = data;
            }
        });
    }

}

export class CapacitacionDataSource extends DataSource<any>{
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
