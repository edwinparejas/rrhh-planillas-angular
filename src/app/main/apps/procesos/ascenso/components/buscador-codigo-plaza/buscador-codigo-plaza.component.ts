import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { GlobalsService } from 'app/core/shared/globals.service';
@Component({
    selector: 'minedu-buscador-codigo-plaza',
    templateUrl: './buscador-codigo-plaza.component.html',
    styleUrls: ['./buscador-codigo-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscadorCodigoPlazaComponent implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;
    
    dataSource: ServidorCodigoPlazaDataSource | null;
    selection = new SelectionModel<any>(true, []);
    selectedRegimen = 0;
    paginatorPageSize = 10;
    paginatorPageIndex = 1;
    seleccionado: any = null;

    comboLists = {
        listRegimenLaboral: []
    };

    // TODO
    request = {
        codigoPlaza: null,
        centroTrabajo: null,
        codigoCentroTrabajo: null,
        idRegimenLaboral: null
    };
    idRolPassport: number = 1;
    displayedColumns: string[] = [
        'codigoPlaza',
        'codigoCentroTrabajo',
        'descripcionCentroTrabajo',
        'abreviaturaModalidad',
        'descripcionNivelEducativo',
        'descripcionRegimenLaboral',
        'descripcionCargo',
        'descripcionAreaCurricular',
        'jornadaLaboral',
        'tipoVacancia',
        'tipoPlaza'
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;

    constructor(
        public matDialogRef: MatDialogRef<BuscadorCodigoPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
         public globals: GlobalsService,
        private materialDialog: MatDialog) { }

        ngAfterViewInit(): void {
            this.paginator.page.subscribe(() =>
                this.loadData(
                    (this.paginator.pageIndex + 1).toString(),
                      this.paginator.pageSize.toString()
                  )
              );
          }
    ngOnDestroy(): void {

    }

    ngOnInit(): void {
        this.buildForm();
        this.loadRegimenLaboral();
        this.dataSource = new ServidorCodigoPlazaDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.resetForm();
      //  this.buscarPlaza(true);
    }

   

    buildForm = () => {
        this.form = this.formBuilder.group({
            codigoPlaza: [null ],
            centroTrabajo: [null],
            codigoCentroTrabajo: [null],
            idRegimenLaboral: [null],
        });
    }

    loadRegimenLaboral = () => {
        this.dataService.Ascenso().getComboRegimenLaboral().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idRegimenLaboral,
                    label: `${x.abreviaturaRegimenLaboral}`
                }));
                this.comboLists.listRegimenLaboral = data;
                
            }
        });
    }

    
    cargarFiltro(): void {
        this.request = this.form.getRawValue();
    }


    handleLimpiar(): void {
        this.form.reset();
        this.form.get('idRegimenLaboral').setValue(0);
    }

    handleBuscar(): void {this.buscarPlaza();    }

    selectedRow(row) {
        this.selection.clear();
        this.selection.toggle(row);
        return row;
      }

  

    handleCancel = () => {
        this.matDialogRef.close();
    }

    buscarPlaza = (fistTime: boolean = false) => {
        this.setRequest();
        if (fistTime) {
            this.request.idRegimenLaboral=0;
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
            this.paginator.pageSize);
    }

    resetForm = () => {
        this.form.reset();
        this.form.get('idRegimenLaboral').setValue(0);
      }



      setRequest = () => {
        this.request = {
            codigoPlaza: this.form.get('codigoPlaza').value,
            centroTrabajo: this.form.get('centroTrabajo').value,
            codigoCentroTrabajo: this.form.get('codigoCentroTrabajo').value,
            idRegimenLaboral: this.form.get('idRegimenLaboral').value
        };
      }
      



}

export class ServidorCodigoPlazaDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        // console.log(data);
         this._loadingChange.next(false);                
         if (data.anio === null) {
             this._loadingChange.next(false);
             this._dataChange.next([]);
         } else {
             this.dataService
                 .Ascenso()
                 .buscarPlaza(data, pageIndex, pageSize)
                 .pipe(
                     catchError(() => of([])),
                     finalize(() => {
                         this._loadingChange.next(false);
                     })
                 )
                 .subscribe((response: any) => {
                     this._dataChange.next(response.data || []);
                   
                    // console.log(" subscribe getGrillas:", (response.data || []).length === 0 ? 0 : response.data[0].totalRegistro);
                     this.totalregistro = (response.data || []).length === 0 ? 0 : response.data[0].totalRegistro;
                     if ((response.data || []).length === 0) {
                         this.dataService
                             .Message()
                             .msgWarning(
                                 'No se encontró información de plazas para los criterios de búsqueda ingresados.',
                                 () => { }
                             );
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

 