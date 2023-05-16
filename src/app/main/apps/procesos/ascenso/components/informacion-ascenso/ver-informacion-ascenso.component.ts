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
import { EtapaResponseModel } from '../../models/ascenso.model';
import { GlobalsService } from 'app/core/shared/globals.service';
@Component({
    selector: 'minedu-ver-informacion-ascenso',
    templateUrl: './ver-informacion-ascenso.component.html',
    styleUrls: ['./ver-informacion-ascenso.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerInformacionAscensoComponent implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;
    row: number;
    dataSource: VerInformacionAscensoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    idProceso :number;
    paginatorPageSize = 3;
    paginatorPageIndex = 1;
    seleccionado: any = null;
 

    
    idRolPassport: number = 1;
    displayedColumns: string[] = [
        'abreviatura',
        'descripcion'        
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;
    etapa: EtapaResponseModel = new EtapaResponseModel();
    constructor(
        public matDialogRef: MatDialogRef<VerInformacionAscensoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog) { }

    ngAfterViewInit(): void {
     //   console.log("enttroooo");
     //   console.log(this.paginator.pageIndex);
     //   console.log(this.paginator.pageSize);
 //    this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
    }
    ngOnDestroy(): void {    }
    ngOnInit(): void {
        this.obtenerProcesoEtapa(this.data.dataKey.idEtapa);
        this.dataSource = new VerInformacionAscensoDataSource(this.dataService);
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



obtenerProcesoEtapa = (idEtapa) => {
    this.dataService.Ascenso()
    .getEtapaById(idEtapa)
    .pipe(
        catchError(() => of([])),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        if (response && response.result) {
            this.etapa=response.data;
            this.idProceso=this.etapa.idProceso;
            this.buscarGrupoModalidad( this.idProceso,true);
        }
    });

  }


}


export class VerInformacionAscensoDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
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

 