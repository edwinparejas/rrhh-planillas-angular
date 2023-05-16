import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { PlazaModelS } from '../../../models/ascenso.model';

@Component({
    selector: 'minedu-ver-informacion-plaza',
    templateUrl: './ver-informacion-plaza.component.html',
    styleUrls: ['./ver-informacion-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerInformacionPlazaAscensoComponent implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;
    row: number;
    dataSource: VerInformacionPlazasAscensoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    idProceso :number;
    paginatorPageSize = 3;
    paginatorPageIndex = 1;
    seleccionado: any = null;
 

    
    idRolPassport: number = 1;
    displayedColumns: string[] = [
        'position',
        'estado'
       // 'descripcion'        
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;
    // plaza: PlazaModelS = new PlazaModelS();
    plaza: PlazaModelS = new PlazaModelS();
    // adjudicacion: AdjudicacionDetalleModel = new AdjudicacionDetalleModel();
    // estadoAdjudicacion = EstadoAdjudicacionEnum;
    constructor(
        public matDialogRef: MatDialogRef<VerInformacionPlazasAscensoDataSource>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog) { }

    ngAfterViewInit(): void {
    }
    ngOnDestroy(): void {    }
    ngOnInit(): void {
       
        this.dataSource = new VerInformacionPlazasAscensoDataSource(this.dataService);
        this.detalleInfo(this.data.dataKey.idPlaza); 
       
       // this.getFormType();
    }

   loadData(pageIndex, pageSize) {
        this.dataSource.load(
            this.idProceso,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize);
    }
    handleCancel = () => {
        this.matDialogRef.close();
    }
    buscarGrupoModalidad = (idProceso:number,fistTime: boolean = false) => {
        
        if (fistTime) {
            this.dataSource.load(idProceso, 1, 3);
        } else {          
            this.dataSource.load(
                idProceso,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize
            );
        }
      }
  detalleInfo = (data)=>{
    console.log("data", data);
    this.dataService.Ascenso()
     .getPlazaById(data)
    .pipe(
        catchError(() => of([])),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        console.log('plazas', response);
        if (response) {
            this.plaza=response;   
        }
    });
  }

//   getFormType() {
//     var data = this.plaza.;
//     console.log(data); 
//     return data;
//   }


}


export class VerInformacionPlazasAscensoDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
       
        this._loadingChange.next(false);

       /* if (data.codigoModular === null && data.codigoPlaza === null && data.idRegimenLaboral === null && data.idCargo === null && data.numeroDocumentoReferencia === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {*/
            this.dataService.Ascenso().getListaGrupoModalidad(data, pageIndex, pageSize).pipe(
                
                catchError(() => of([])),
                finalize(() => this._loadingChange.next(false))
            ).subscribe((response: any) => {
             
                 this._dataChange.next(response.data || []);
                this.totalregistro = ((response.data || []).length === 0) ? 0 : response.data[0].totalRegistro;
               // if ((response.data || []).length === 0) {
                  //  this.dataService.Message().msgWarning('No se encontró información de grupo de modalidades.', () => { });
                //}
            });
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

 