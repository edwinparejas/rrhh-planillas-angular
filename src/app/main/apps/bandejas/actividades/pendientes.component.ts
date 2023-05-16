import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { Subscription, BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { saveAs } from 'file-saver';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
// import { GlobalsService } from 'app/core/shared/globals.service';
import { EditarPendientesComponent } from '../actividades/gestion-pendientes/editar-pendientes/editar-pendientes.component';
import { ResultadoOperacionEnum } from './gestion-pendientes/_utils/constants';
import { AprobarActividadModel } from './models/pendientes.model';

@Component({
    selector: 'minedu-pendientes',
    templateUrl: './pendientes.component.html',
    styleUrls: ['./pendientes.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class PendientesComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    loading: false;
    untilDate = new Date();
    minDate = new Date("July 21, 1890 01:15:00");
    textComboDefault = "-- SELECCIONE --";
    comboLists = {
        listEstadoActividad: [],
        listTipoActividad: [],
        listTipoDocumentoIdentidad: [],
        listTipoResolucion: [],
        listRegimenLaboral: [],
        listGrupoAccion: [],
        listAccion: [],
        listMotivoAccion: []
    };
    dataSource: ActividadesDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    dialogRef: any;
    request = {
        idEstadoActividad: 14,
        idTipoActividad: null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        primerApellido: null,
        segundoApellido: null,
        nombres: null,
        fechaVigenciaInicio: null,
        fechaVigenciaFin: null,
        idTipoResolucion: null,
        idRegimenLaboral: null,
        idGrupoAccion: null,
        idAccion: null,
        idMotivoAccion: null
    };

    displayedColumns: string[] = [
        'registro',
        'tipoResolucion',
        'numeroResolucion',
        'fechaResolucion',
        'regimenLaboral',
        'grupoAccion',
        'accion',
        'motivoAccion',
        'documentoIdentidad',
        'nombreRazon',
        'fechaInicio',
        'fechaFin',
        'estadoActividad',
        'acciones'
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        // public globals: GlobalsService,
        private materialDialog: MatDialog) { }

    ngOnInit(): void {
        this.buildForm();
        this.iniCombos();
        this.dataSource = new ActividadesDataSource(this.dataService);
        this.dataSource.load(this.request, 1, 10);
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
    }
    ngOnDestroy(): void {
    }

    iniCombos(): void{
        this.loadEstadosActividad();
        this.loadTiposActividad();
        this.loadTiposDocumentoIdentidad();
        this.loadTiposResolucion();
        this.loadRegimenesLaborales();        
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idEstadoActividad: [14],
            idTipoActividad: [null],
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            primerApellido: [null],
            segundoApellido: [null],
            nombres: [null],
            fechaVigenciaInicio: [null],
            fechaVigenciaFin: [null],
            idTipoResolucion: [null],
            idRegimenLaboral: [null],
            idGrupoAccion: [null],
            idAccion: [null],
            idMotivoAccion: [null],            
        });

        this.form.get("idRegimenLaboral").valueChanges.subscribe(value => {
            this.form.get('idGrupoAccion').setValue(null);
            this.form.get('idAccion').setValue(null);
            this.form.get('idMotivoAccion').setValue(null);
            if (value !== null && value !== 0) {
                this.loadGruposAccion(value);
                this.comboLists.listAccion = [];
                this.comboLists.listMotivoAccion = [];                
            }
        });  
        
        this.form.get("idGrupoAccion").valueChanges.subscribe(value => {
            this.form.get('idAccion').setValue(null);
            this.form.get('idMotivoAccion').setValue(null);
            if (value !== null) {
                this.loadAcciones(this.form.value.idRegimenLaboral, value);
                this.comboLists.listMotivoAccion = [];                
            }
        });     
        
        this.form.get("idAccion").valueChanges.subscribe(value => {
            this.form.get('idMotivoAccion').setValue(null);
            if (value !== null) {
                this.loadMotivosAccion(this.form.value.idRegimenLaboral, this.form.value.idGrupoAccion, value);
            }
        });           
        
        this.form.get("fechaVigenciaInicio").valueChanges.subscribe(value => {
            if (value) {
              this.minDate = value;
            }
        });      
        this.form.get("fechaVigenciaFin").valueChanges.subscribe(value => {
            if (value) {
              this.untilDate = value;
            }
        });        
    }

    loadData(pageIndex, pageSize): void {
        this.request = {
            idEstadoActividad: 14,
            idTipoActividad: null,
            idTipoDocumentoIdentidad: null,
            numeroDocumentoIdentidad: null,
            primerApellido: null,
            segundoApellido: null,
            nombres: null,
            fechaVigenciaInicio: null,
            fechaVigenciaFin: null,
            idTipoResolucion: null,
            idRegimenLaboral: null,
            idGrupoAccion: null,
            idAccion: null,
            idMotivoAccion: null,  
        };
        this.dataSource.load(this.request, 1, 10);
    }

    handleLimpiar(): void {
        this.form.reset();
        this.form.get('idEstadoActividad').setValue(14);
        this.buscarActividades();
    }

    handleBuscar(): void {
        this.buscarActividades();
    }

    handleExportar = () => {
    }

    handleNuevo = () => {
    }

    handleObservar = (row: any) => {
        this.dialogRef = this.materialDialog.open(EditarPendientesComponent, {
            width: '1200px',
            disableClose: true,
            data: {
                action: 'observar',
                title: 'Motivo de observación',
                idActividad: row.idActividad,
                idEstadoActividad: row.idEstadoActividad,
                informativo: false,
            }
        });
        this.dialogRef.afterClosed().subscribe(result => {
            if (result){
                this.handleLimpiar();
            }
          });        
    }    
    
    handleDetalleObservacion = (row: any) => {
        this.dialogRef = this.materialDialog.open(EditarPendientesComponent, {
            width: '1200px',
            disableClose: true,
            data: {
                action: 'verdetalle',
                title: 'Detalle de observación',
                idActividad: row.idActividad,                
                idEstadoActividad: row.idEstadoActividad,
                informativo: false,
            }
        });
        this.dialogRef.afterClosed().subscribe(result => {
            if (result){
                this.handleLimpiar();
            }
          });        
    }   

    handleInformativo = (row: any) => {
        this.dialogRef = this.materialDialog.open(EditarPendientesComponent, {
            width: '1200px',
            disableClose: true,
            data: {
                action: 'Informativo',
                title: 'Informativo',
                idActividad: row.idActividad,                
                idEstadoActividad: row.idEstadoActividad,
                informativo: true,
            }
        });
        this.dialogRef.afterClosed().subscribe(result => {
            if (result){
                this.handleLimpiar();
            }
          });        
    }   


    getData = (row: any) => {
        const model: AprobarActividadModel = new AprobarActividadModel();
        model.idActividad = row.idActividad;
        model.usuario = 'ADMIN';
        return model;
    }   

    handleAprobar = (row: any) => {        
        const actividad = this.getData(row);
        this.dataService.Message().msgConfirm('¿Esta seguro de que desea aprobar la actividad?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Actividades().AprobarActividad(actividad).pipe(
                catchError((e) => of(e)),
                finalize(() => { })
            ).subscribe(response => {
                this.dataService.Spinner().hide("sp6");
                if (response && response.result) {                   
                    this.dataService.Message().msgInfo('Operación realizada de forma exitosa.', () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información, por favor intente dentro de unos segundos, gracias.', () => { });
                }
            });
        }, () => { });
    }
    
    handleLink = (row: any) => {  
        console.log(row);
       const alerta = {
        idActividad: row.idActividad,
        usuario: 'ADMIN'
       }
       this.dataService.Message().msgConfirm('¿Esta seguro de salir de la opción?', () => {
           this.router.navigate(
             [row.link]          
           );        
       }, () => { });
 
     }

    handleDescargarDocumento = (row: any) => {
        if (row.codigoDescargaDocumento === null) {
          this.dataService.Message().msgWarning('La actividad resolución no tiene documento adjunto.', () => { });
          return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(row.codigoDescargaDocumento)
          .pipe(
            catchError((e) => of(null)),
            finalize(() => this.dataService.Spinner().hide("sp6"))
          ).subscribe(response => {
            if (response) {
              saveAs(response, row.numeroResolucion + ".pdf");
            } else {
              this.dataService.Message().msgWarning('No se pudo descargar el documento adjunto', () => { });
            }
          });        
    }

    loadEstadosActividad = () => {
        this.dataService.Actividades().getComboEstadosActividad().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const itemAll = { idEstadoActividad: 0, descripcionEstadoActividad: this.textComboDefault};
                response.data.unshift(itemAll);                 
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idEstadoActividad,
                    label: `${x.descripcionEstadoActividad}`
                }));
                this.comboLists.listEstadoActividad = data;
                this.form.get('idEstadoActividad').setValue(14);
            }
        });
    }

    loadTiposActividad = () => {
        this.dataService.Actividades().getComboTiposActividad().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const itemAll = { idTipoActividad: 0, descripcionTipoActividad: this.textComboDefault};
                response.data.unshift(itemAll);                 
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idTipoActividad,
                    label: `${x.descripcionTipoActividad}`
                }));
                this.comboLists.listTipoActividad = data;
                this.form.get('idTipoActividad').setValue(0);
            }
        });
    }

    loadTiposDocumentoIdentidad = () => {
        this.dataService.Actividades().getComboTiposDocumentoIdentidad().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const itemAll = { idTipoDocumentoIdentidad: 0, descripcionTipoDocumentoIdentidad: this.textComboDefault};
                response.data.unshift(itemAll);                 
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idTipoDocumentoIdentidad,
                    label: `${x.descripcionTipoDocumentoIdentidad}`
                }));
                this.comboLists.listTipoDocumentoIdentidad = data;
                this.form.get('idTipoDocumentoIdentidad').setValue(0);
            }
        });
    }


    loadTiposResolucion = () => {
        this.dataService.Actividades().getComboTiposResolucion().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const itemAll = { idTipoResolucion: 0, descripcionTipoResolucion: this.textComboDefault};
                response.data.unshift(itemAll);                 
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idTipoResolucion,
                    label: `${x.descripcionTipoResolucion}`
                }));
                this.comboLists.listTipoResolucion = data;
                this.form.get('idTipoResolucion').setValue(0);
            }
        });
    }

    loadRegimenesLaborales = () => {
        this.dataService.Actividades().getComboRegimenesLaborales().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const itemAll = { idRegimenLaboral: 0, descripcionRegimenLaboral: this.textComboDefault};
                response.data.unshift(itemAll);                 
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idRegimenLaboral,
                    label: `${x.descripcionRegimenLaboral}`
                }));
                this.comboLists.listRegimenLaboral = data;
                this.form.get('idRegimenLaboral').setValue(0);
            }
        });
    }

    loadGruposAccion = (idRegimen) => {
        this.dataService.Actividades().getComboGruposAccion(idRegimen).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const itemAll = { idGrupoAccion: 0, descripcionGrupoAccion: this.textComboDefault};
                response.data.unshift(itemAll);                 
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idGrupoAccion,
                    label: `${x.descripcionGrupoAccion}`
                }));
                this.comboLists.listGrupoAccion = data;
                this.form.get('idGrupoAccion').setValue(0);
            }
        });
    }

    loadAcciones = (idRegimen, idGrupoAccion) => {
        this.dataService.Actividades().getComboAcciones(idRegimen, idGrupoAccion).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const itemAll = { idAccion: 0, descripcionAccion: this.textComboDefault};
                response.data.unshift(itemAll);                 
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idAccion,
                    label: `${x.descripcionAccion}`
                }));
                this.comboLists.listAccion = data;
                this.form.get('idAccion').setValue(0);
            }
        });
    }

    loadMotivosAccion = (idRegimen, idGrupoAccion, idAccion) => {
        this.dataService.Actividades().getComboMotiviosAccion(idRegimen, idGrupoAccion, idAccion).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const itemAll = { idMotivoAccion: 0, descripcionMotivoAccion: this.textComboDefault};
                response.data.unshift(itemAll);                 
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idMotivoAccion,
                    label: `${x.descripcionMotivoAccion}`
                }));
                this.comboLists.listMotivoAccion = data;
                this.form.get('idMotivoAccion').setValue(0);
            }
        });
    }

    buscarActividades = () => {
        this.request = {            
            idEstadoActividad: this.form.value.idEstadoActividad, //+this.form.get('idEstadoActividad'),            
            idTipoActividad: this.form.value.idTipoActividad, // +this.form.get('idTipoActividad'),            
            idTipoDocumentoIdentidad: this.form.value.idTipoDocumentoIdentidad, //+this.form.get('idTipoDocumentoIdentidad'),
            numeroDocumentoIdentidad: this.form.value.numeroDocumentoIdentidad, //+this.form.get('numeroDocumentoIdentidad'),
            primerApellido: this.form.value.primerApellido, //+this.form.get('primerApellido'),
            segundoApellido: this.form.value.segundoApellido, //+this.form.get('segundoApellido'),
            nombres: this.form.value.nombres, //+this.form.get('nombres'),
            fechaVigenciaInicio: this.form.value.fechaVigenciaInicio, //+this.form.get('fechaVigenciaInicio')
            fechaVigenciaFin: this.form.value.fechaVigenciaFin, //+this.form.get('fechaVigenciaFin')
            idTipoResolucion: this.form.value.idTipoResolucion, //+this.form.get('idTipoResolucion')
            idRegimenLaboral: this.form.value.idRegimenLaboral, //+this.form.get('idRegimenLaboral')
            idGrupoAccion: this.form.value.idGrupoAccion, //+this.form.get('idGrupoAccion')
            idAccion: this.form.value.idAccion, //+this.form.get('idAccion')
            idMotivoAccion: this.form.value.idMotivoAccion, //+this.form.get('idMotivoAccion')
        };
        this.dataSource = new ActividadesDataSource(this.dataService);
        this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginatorPageSize);
    }

}


export class ActividadesDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }


    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(true);
        this.dataService.Actividades().consultar(data, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => this._loadingChange.next(false))
        ).subscribe((response: any) => {
            this._dataChange.next(response.data || []);
            this.totalregistro = ((response.data || []).length === 0) ? 0 : response.data[0].totalRegistro;
            if ((response.data || []).length === 0) {
                this.dataService.Message().msgWarning('No se encontró información de la(s) actividad(s) para los criterios de búsqueda ingresados.', () => { });
            }
        });
        this._dataChange.next(data);
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

