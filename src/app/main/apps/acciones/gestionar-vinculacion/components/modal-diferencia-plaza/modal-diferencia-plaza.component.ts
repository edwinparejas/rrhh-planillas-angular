import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ObservarVinculacionComponent } from '../../vinculacion/components/observar-vinculacion/observar-vinculacion.component';

@Component({
  selector: 'minedu-modal-diferencia-plaza',
  templateUrl: './modal-diferencia-plaza.component.html',
  styleUrls: ['./modal-diferencia-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ModalDiferenciaPlazaComponent implements OnInit {


    id_gestion_vinculacion = 0;


    enProcesoMotivo: boolean = false;

    dataSource: DiferenciaPlazaDataSource | null;

    request = {
      id_gestion_vinculacion: 0,
      observar: false
    };

    displayedColumns: string[] = [      
      'nro',
      'campo',
      'original',
      'actualizado'
    ];

    @ViewChild('paginator', { static: true }) 
    paginator: MatPaginator;
  
    constructor(
      public matDialogRef: MatDialogRef<ModalDiferenciaPlazaComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private route: ActivatedRoute,
      private router: Router,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private dataShared: SharedService,
      private materialDialog: MatDialog,
      private globals: GlobalsService
    ) { }
  
    ngOnInit(): void {
      this.setInfo();   
      this.dataSource= new DiferenciaPlazaDataSource(this.dataService);
      
      this.enProcesoMotivo = this.data.enProceso;
       
      this.dataSource.load(this.request, 1, 10);
    }
  
    handleCancel = () => {
      this.matDialogRef.close();
    }
  
    setInfo() {
      this.request = {        
        id_gestion_vinculacion: this.data.id_gestion_vinculacion,
        observar: false
      };
      
    }


    handleObservar() {
      // let data = new FormData();
      let dialogRef = this.materialDialog.open(ObservarVinculacionComponent, {
        panelClass: 'Minedu-observar-accion-desplazamiento-dialog',
          disableClose: true,
          data: {
            id_gestion_vinculacion: this.request.id_gestion_vinculacion,
            soloVer: false,
            is_saved: true,
            dialogTitle: 'Observar la Adjudicación'
          }
      });
      dialogRef.afterClosed().subscribe(data=>{
        debugger;

        console.log("data retorna de observar ",data);
        this.request = {        
          id_gestion_vinculacion: this.data.id_gestion_vinculacion,
          observar: data.observar
        };
        if(data.observar){
          this.matDialogRef.close(this.request);
        } 
      })

    }


    handleActualizar() {
      this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ACTUALIZAR LA DIFERENCIA DE CAMPOS?', () => {
        this.dataService.Spinner().show("sp6");
        let viewModel = {
          id_gestion_vinculacion: this.request.id_gestion_vinculacion
        }
        this.dataService.AccionesVinculacion().actualizarPlazaDetalle(viewModel).subscribe(
          (response) => {
            this.dataService.Spinner().hide("sp6");
            this.dataService.Message().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA", () => {
              this.matDialogRef.close();
            });
          },
          (error: HttpErrorResponse) => {
            this.dataService.Spinner().hide("sp6")
            this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
          }
        )
      }, () => { });
    }
    
  }

  export class DiferenciaPlazaDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
  
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
  
    constructor(private dataService: DataService) {
        super();
    }
  
    load(data: any, pageIndex, pageSize): void {
      debugger;
        this._loadingChange.next(false);
            this.dataService.AccionesVinculacion().ObservarDiferenciaPlaza(data)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => this._loadingChange.next(false))
            ).subscribe((response: any) => {
              if (response) {
        
                this._dataChange.next(response);
              } else {
                this._dataChange.next([]);
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE VINCULACIÓN DE EL(LOS) SERVIDOR(ES) PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
              }
                
            });

            this._dataChange.next(data);

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