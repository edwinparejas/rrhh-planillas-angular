import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import {Component,OnInit,ViewEncapsulation,OnDestroy,ViewChild,AfterViewInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoAscensoEnum } from '../_utils/constants';
import {BuscadorServidorPublicoComponent} from '../components/buscador-servidor-publico/buscador-servidor-publico.component';
import {BuscarPlazaComponent} from '../components/buscar-plaza/buscar-plaza.component';

@Component({
    selector: 'minedu-bandeja-postulante',
    templateUrl: './bandeja-postulante.component.html',
    styleUrls: ['./bandeja-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPostulanteComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    loading: false;
    export = false;
    now = new Date();
    comboLists = {
        listAnio: [],
        listRegimenlaboral: [],
        listEstadoProceso: [],
    };
    displayedColumns: string[] = [
        'registro',
        'idEtapaFase',        
        'descripcionRegimenLaboral',
        'fechaCreacion',
        'idProceso',
        'descripcionEtapa', 
        'descripcionEstado',
        'acciones'
    ];

    dataSource: AscensoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    eliminando = false;
    dialogRef: any;

      estadoAscenso = EstadoAscensoEnum;
    request = {
        anio: null,
        idRegimenLaboral: null,
        idEstadoProceso: null,
        idRolPassport: null,
    };
    idRolPassport: number = 1;

    constructor(
        private route: ActivatedRoute,
        private router: Router,                
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
       // this.buildForm();
       // this.loadRegimenLaboral();
     //   this.loadEstadoProceso();
        this.dataSource = new AscensoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
      //  this.resetForm();
      //  this.buscarProcesosAscenso(true);
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

    buildForm(): void {
        this.form = this.formBuilder.group({
            anio: [null, Validators.required],
            idRegimenLaboral: [null],
            idEstadoProceso: [null],
        });
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    handleBuscar(): void {
        this.buscarProcesosAscenso();
    }

    handleGoPublicaciones = (row) => {
        this.router.navigate(['./publicacion/' + row.idEtapa], { relativeTo: this.route });
    }
    handleGoPostulantes = (row) => {
        this.router.navigate(['./postulante/' + row.idEtapa], { relativeTo: this.route });
    }
    buscarProcesosAscenso = (fistTime: boolean = false) => {
        this.setRequest();
        if (fistTime) {
            console.log("entroooo if");
            this.dataSource.load(this.request, 1, 10);
        } else {          
            
            console.log("entroooo else");
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
    busquedaPersonalizada(){
                this.dialogRef = this.materialDialog.open(
                    BuscadorServidorPublicoComponent,
                    {
                        panelClass: 'minedu-buscador-servidor-publico-dialog',
                        width: '980px',
                        disableClose: true,
                        data: {
                            action: 'busqueda',
                        },
                    }
                );
    }
    busquedaPersonalizadaPlaza(){
        this.dialogRef = this.materialDialog.open(
            BuscarPlazaComponent,
            {
                panelClass: 'buscar-plaza-form-dialog',
                width: '980px',
                disableClose: true,
                data: {
                    action: 'busqueda',
                },
            }
        );
}

 
    resetForm = () => {
        this.form.reset();
        this.form.get('anio').setValue(new Date());
    }

    loadRegimenLaboral = () => {
        this.dataService.Ascenso()
            .getComboRegimenLaboral()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
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
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listEstadoProceso = data;
                }
            });
    }

    setRequest = () => {
        this.request = {
            anio: this.form.get('anio').value.getFullYear(),
            idRegimenLaboral: this.form.get('idRegimenLaboral').value,
            idEstadoProceso: this.form.get('idEstadoProceso').value,
            idRolPassport: this.idRolPassport,
        };
    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning('No se encontró información para para exportar.', () => { });
            return;
        }

        this.export = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Ascenso()
            .exportarExcelAscenso(
                this.request,
                1,
                this.dataSource.dataTotal)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                    this.export = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    saveAs(response, 'procesos-etapas.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'No se encontró información para los criterios de búsqueda ingresado',
                            () => { }
                        );
                }
            });
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
        this._loadingChange.next(false);                
        if (data.anio === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Ascenso()
                .getListaprocesos(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                    })
                )
                .subscribe((response: any) => {
                    this._dataChange.next(response.data || []);
                    console.log(" subscribe getGrillas:", (response.data || []).length === 0 ? 0 : response.data[0].totalRegistro);
                    this.totalregistro = (response.data || []).length === 0 ? 0 : response.data[0].totalRegistro;
                    if ((response.data || []).length === 0) {
                        this.dataService
                            .Message()
                            .msgWarning(
                                'No se encontró información de postulante(s) para los criterios de búsqueda ingresados.',
                                () => { }
                            );
                    }
                });
        }
    }
    connect(collectionViewer: CollectionViewer): Observable<[]> {         return this._dataChange.asObservable();    }
    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }
    get dataTotal(): any {        return this.totalregistro;    }
    get data(): any {        return this._dataChange.value || [];    }
    
}

