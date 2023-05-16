import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
//import { EtapaResponseModel, InformacionPlazaPrepublicadaResponseModel } from '../../../models/reasignacion.model';

@Component({
  selector: 'minedu-informacion-sustento-nopublicacion',
  templateUrl: './informacion-sustento-nopublicacion.component.html',
  styleUrls: ['./informacion-sustento-nopublicacion.component.scss']
})
export class InformacionSustentoNopublicacionComponent implements OnInit {

    working: false;
    form: FormGroup;
    row: number;
    dataSource: InformacionMotivoNoPublicacionSource | null;
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
    //etapa: InformacionPlazaPrepublicadaResponseModel = new InformacionPlazaPrepublicadaResponseModel();
    constructor(
        public matDialogRef: MatDialogRef<InformacionSustentoNopublicacionComponent>,
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
        this.dataSource = new InformacionMotivoNoPublicacionSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
       
      
    }

   loadData(pageIndex, pageSize) {
        this.dataSource.load(
            this.idProceso,
            pageIndex + 1,
            pageSize);
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
            // this.etapa=response.data;
            // this.idProceso=this.etapa.idProceso;
            this.buscarGrupoModalidad( this.idProceso,true);
        }
    });

  }


}


export class InformacionMotivoNoPublicacionSource extends DataSource<any>{

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

 