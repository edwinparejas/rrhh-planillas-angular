import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import {Component,OnInit,ViewEncapsulation,OnDestroy,ViewChild,AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoEtapaEnum,ResultadoOperacionEnum } from '../_utils/constants';
import { MatDialog } from '@angular/material/dialog';
import { VerInformacionAscensoComponent } from '../components/informacion-ascenso/ver-informacion-ascenso.component';
import { TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { MotivoCancelaciionComponent } from '../components/motivo-cancelacion/motivo-cancelacion.component';

@Component({
    selector: 'minedu-bandeja-ascenso',
    templateUrl: './bandeja-ascenso.component.html',
    styleUrls: ['./bandeja-ascenso.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaAscensoComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    loading: false;
    export = false;
    now = new Date();
    selectedRegimen = 0;
    selectedEstado = 0;
    comboLists = {
        listAnio: [],
        listRegimenlaboral: [],
        listEstadoProceso: [],
    };
    displayedColumns: string[] = [
        'registro',
        'codigo',        
        'regimenLaboral',
        'proceso',
        'fechaCreacionProceso',
        'etapa',
        'estado',
        'acciones'
    ];
/*variables responsive*/
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
/*variables responsive*/
    dataSource: AscensoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    eliminando = false;
    dialogRef: any;

currentSession: SecurityModel = new SecurityModel();
permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false,
    autorizadoConsultar:false
};
hasAccessPage: boolean;
    estadoEtapaAscenso = EstadoEtapaEnum;
    request = {
        anio: null,
        idRegimenLaboral: null,
        idEstado: null,
        // idRolPassport: null,
        // descripcion:null,
        paginaActual:1,
        tamanioPagina:10
    };
    idRolPassport: number = 1;

    constructor(
        private route: ActivatedRoute,
        private router: Router,                
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService,
         
    ) { }

    ngOnInit(): void {
        setTimeout(_ => this.buildShared());
        this.buildSeguridad();   
        this.handleResponsive();
        this.buildForm();
        this.dataSource = new AscensoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.resetForm();

        if(this.hasAccessPage){
            this.loadRegimenLaboral();
            this.loadEstadoProceso();
            this.buscarProcesosAscenso(true);
        }
        else this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.', () => { });   
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );
    }

    ngOnDestroy(): void { }
    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        if(!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar &&
          !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar &&
          !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar)
           { 
               this.hasAccessPage=false;
           }else{
            this.hasAccessPage=true;
           }
          
    }
    buildForm(): void {
        this.form = this.formBuilder.group({
            anio: [null],
            idRegimenLaboral: [null],
            idEstadoProceso: null,
            descripcion: [null],
        });
    }
    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }
    buildShared() {
        this.sharedService.setSharedBreadcrumb("Procesos de ascenso");
        this.sharedService.setSharedTitle("Desarrollo de procesos de ascensos");
    }
    handleLimpiar(): void {this.resetForm();    }
    handleBuscar(): void {this.buscarProcesosAscenso();    }
    handleGoPublicaciones = (row) => {this.router.navigate(['./publicacion/' + row.idEtapa], { relativeTo: this.route });    }
    handleGoPostulantes = (row) => {this.router.navigate(['./postulante/' + row.idEtapa], { relativeTo: this.route });    }
    handleGoCalificaciones = (row) => {this.router.navigate(['./calificacion/' + row.idProceso + '/' + row.idEtapa], { relativeTo: this.route });    }
    handleGoAdjudicaciones = (row) => {this.router.navigate(['./adjudicacion/' + row.idProceso], { relativeTo: this.route }); }
    handleGoPlazas = (row) => {this.router.navigate(['./plaza/' + row.idProceso], { relativeTo: this.route }); }
    // handleGoAscenso = (row) => {this.router.navigate(['./ascenso'], { relativeTo: this.route }); }
    
    buscarProcesosAscenso = (fistTime: boolean = false) => {
        this.setRequest();
        if (fistTime) {
            this.dataSource.load(this.request, 1, 10);
            
        } else {    
                 
            this.dataSource.load(
                this.request,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize   
            );
        }
    }

    loadData(pageIndex, pageSize): void {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    resetForm = () => {
        this.form.reset();
        this.form.get('anio').setValue(new Date());
        this.form.controls['idRegimenLaboral'].setValue(0);
        this.form.controls['idEstadoProceso'].setValue(0);
    }

    loadRegimenLaboral = () => {
        this.dataService.Ascenso()
            .getComboRegimenLaboral()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                console.log(response)
                if (response) {
                    var index=0;
                    response.splice(index,0,
                                   {idRegimenLaboral:0,
                                    codigoRegimenLaboral:0,
                                    abreviaturaRegimenLaboral:"TODOS"});
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idRegimenLaboral,
                        label: `${x.abreviaturaRegimenLaboral}`,
                    }));
                    this.comboLists.listRegimenlaboral = data;
                }
            });
    }

    loadEstadoProceso = () => {
        this.dataService.Ascenso()
            .getComboEstadoProceso()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                console.log('Proceso', response);
                if (response) {
                    var index=0;
                    response.splice(index,0,
                                   {idCatalogoItem:0,
                                    idCatalogo:0,
                                    descripcionCatalogoItem:"TODOS"});
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listEstadoProceso = data;
                }
            });
    }
    handleMotivoCancelacion = (row) => {
        this.dialogRef = this.materialDialog.open(MotivoCancelaciionComponent, {
            panelClass: "motivo-cancelacion-dialog",
            width: "700px",
            disableClose: true,
            data: {
                action: "motivoDetalle",
                detalle: row
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.buscarProcesosAscenso();
            }
        });
    }
    setRequest = () => {
        this.request = {
            anio: this.form.get('anio').value.getFullYear(),
            idRegimenLaboral: this.form.get('idRegimenLaboral').value,
            idEstado: this.form.get('idEstadoProceso').value, 
            // idRolPassport: this.idRolPassport,
            // descripcion:this.form.get('descripcion').value,
            paginaActual:1,  
            tamanioPagina:10
        };
    }
    // handleExportar = () => {
    //     if (this.dataSource.data.length === 0) {
    //         this.dataService
    //             .Message()
    //             .msgWarning('No se encontró información para para exportar.', () => { });
    //         return;
    //     }

    //     this.export = true;
    //     this.dataService.Spinner().show('sp6');
    //     this.dataService
    //         .Ascenso()
    //         .exportarExcelAscenso(
    //             this.request,
    //             1,
    //             this.dataSource.dataTotal)
    //         .pipe(
    //             catchError((e) => of(null)),
    //             finalize(() => {
    //                 this.dataService.Spinner().hide('sp6');
    //                 this.export = false;
    //             })
    //         )
    //         .subscribe((response: any) => {
    //             if (response) {
    //                 saveAs(response, 'procesos-etapas.xlsx');
    //             } else {
    //                 this.dataService
    //                     .Message()
    //                     .msgWarning(
    //                         'No se encontró información para los criterios de búsqueda ingresado',
    //                         () => { }
    //                     );
    //             }
    //         });
    // }
    handleExportar = () => {
       
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {} );
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Ascenso().exportarExcelAscenso(this.request, 1, this.dataSource.dataTotal).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            console.log("exportando", response);
            if (response) {
                console.log("entre...!!",response);
                saveAs(response, "Consolidado_Plazas.xlsx");
            } else {
                this.dataService.Message().msgWarning('"NO SE GENERÓ CORRECTAMENTE EL ARCHIVO EXCEL DE CONSOLIDADO DE PLAZAS."', () => {} );
            }
        });
    }
    busquedaPersonalizada = (row) => { 
        console.log('row', row);
        this.dialogRef = this.materialDialog.open(VerInformacionAscensoComponent, {                      
                       panelClass: 'minedu-ver-informacion-ascenso-dialog',
                       width: '980px',
                       disableClose: true,
                       data: {
                           action: 'busqueda',
                           dataKey:row
                       },
                       
                   }
               );
    }
}

export class AscensoDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        console.log('buscar', data); 
        this._loadingChange.next(false);                
        if (data.anio === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Ascenso()
                .getListaprocesos(data, pageIndex, pageSize)
                .pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this._loadingChange.next(false);
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        this._dataChange.next(response || []);
                        this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistro;
                        if ((response|| []).length === 0) {
                            this.dataService
                                .Message()
                                .msgWarning(
                                    'No se encontró información de ascensos(s) para los criterios de búsqueda ingresados.',
                                    () => { }
                                );
                        }
                    }
                        else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else {
                            this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => {  });
                        }
                     
                });
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

