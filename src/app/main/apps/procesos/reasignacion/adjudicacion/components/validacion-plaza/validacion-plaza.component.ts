import { Component, Inject, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { SecurityModel } from 'app/core/model/security/security.model';
import { BehaviorSubject, of, Observable } from 'rxjs';

@Component({
  selector: 'minedu-validacion-plaza',
  templateUrl: './validacion-plaza.component.html',
  styleUrls: ['./validacion-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class validacionPlazaComponent implements OnInit {
  
  form: FormGroup;
  working = false;
  currentSession: SecurityModel = new SecurityModel();
  combo = {
    estadosSubsanacion: []
  }

  displayedColumns: string[] = [
    'numero',
    'campo',
    'datoOriginal',
    'datoActualizado'
  ];

  dataSource: PlazaDataSource | null;
  dataParent: any = {};

  constructor(
    public matDialogRef: MatDialogRef<validacionPlazaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService

  ) {
    this.dataParent = data;
  }

  ngOnInit(): void {
    this.buildSeguridad();
    this.buildForm();
    this.dataSource = new PlazaDataSource(this.dataService);
    this.dataSource.load(this.dataParent.response.listaDiferencia);
  }
  buildSeguridad = () => {
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
}
  private buildForm = () => {
    this.form = this.formBuilder.group({

    });
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };

  handleRegistrar = () => {

   var mensaje='';
   if(this.dataParent.response.esDiferenteGestionProceso == true){
    mensaje += '"LA PLAZA REGISTRA MODIFICACIONES QUE NO ESTAN DEFINIDAS EN LA GESTION DE PROCESOS."';
   }
   if(mensaje.length>0){
    this.dataService.Message().msgWarning(mensaje, () => {
        // this.funActualizar();
    });
   }else{
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ACTUALIZAR LA INFORMACIÓN?', () => {
        this.funActualizar();
    }, () => { });
   }
  }

  
  funActualizar  = () => {
    const model = {
        idPlaza: this.dataParent.response.idPlaza,
        usuarioCreacion: this.currentSession.numeroDocumento,
        usuarioModificacion: this.currentSession.numeroDocumento
    };
    this.dataService.Spinner().show('sp6');
    this.dataService
        .Reasignaciones()
        .actualizarValidacionPlaza(model)
        .pipe(
        catchError((e) => {
            const { developerMessage } = e;
            this.dataService.Message().msgWarning(developerMessage, () => { });
            return of(null);
        }),
        finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
        ).subscribe((response: any) => {
            this.dataService.Message().msgSuccess('OPERACIÓN REALIZADA DE FORMA EXITOSA', () => { });
            this.matDialogRef.close({ registrado: true });
            
        });
   }

}
export class PlazaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;
  private _data = {};

  public loading = this._loadingChange.asObservable();
  
  constructor(private dataService: DataService) {
    super();
  }

  load(data: any) {
    this._dataChange.next(data);
  }

  connect(collectionViewer: CollectionViewer): Observable<[]> {
    return this._dataChange.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._dataChange.complete();
    this._loadingChange.complete();
  }

  get dataTotal(): any {
    return this._totalRows;
  }
  get data(): any {
    return this._dataChange.value || [];
  }
}
