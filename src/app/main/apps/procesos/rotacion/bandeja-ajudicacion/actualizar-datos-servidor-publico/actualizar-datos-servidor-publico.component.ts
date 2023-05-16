import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { isArray } from 'lodash';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MENSAJES } from '../../_utils/constants';

@Component({
  selector: 'minedu-actualizar-datos-servidor-publico',
  templateUrl: './actualizar-datos-servidor-publico.component.html',
  styleUrls: ['./actualizar-datos-servidor-publico.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})

export class ActualizarDatosServidorPublicoComponent implements OnInit {
     
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

  dataSource: ServidorPublicoDataSource | null;
  dataParent: any = {};
  constructor(
    public matDialogRef: MatDialogRef<ActualizarDatosServidorPublicoComponent>,
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
    this.dataSource = new ServidorPublicoDataSource(this.dataService);
    
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

    /*
    * - Validar que los nuevos datos del servidor público la situación laboral no cambie de nombrado, en caso contrario mostrar mensaje "EL SERVIDOR PUBLICO HA CAMBIADO SU SITUACION LABORAL DIFERENTE A NOMBRADO o DESIGNADO"
    * - Validar que la condición laboral no cambie de EN ACTIVIDAD, en caso contrario mostrar mensaje "EL SERVIDOR PUBLICO HA CAMBIADO SU CONDICION LABORAL DIFERENTE A EN ACTIVIDAD"
    * - Validar que el centro de trabajo pertenezca al mismo ambito de la ugel, si es Etapa Regional Fase 1 o Etapa Regional Fase 2, en caso contrario mostrar mensaje "EL SERVIDOR PUBLICO HA CAMBIADO SU CENTRO DE TRABAJO QUE NO TIENE EL MISMO AMBITO QUE LA REASIGNACIÓN EN LA ETAPA REGIONAL".
    * - Validar que el centro de trabajo no pertenezca al mismo ambito de la ugel, si es Etapa InterRegional, en caso contrario mostrar mensaje "EL SERVIDOR PUBLICO HA CAMBIADO SU CENTRO DE TRABAJO QUE  TIENE EL MISMO AMBITO QUE LA REASIGNACIÓN EN LA ETAPA INTERREGIONAL".
    * - Validar que la categoria remunerativa no haya cambiado, en caso contrario mostrar mensaje "EL SERVIDOR PUBLICO HA CAMBIADO DE ESCALA REMUNERATIVA"
    * - Validar que el estado de fallecido no cambie a SI, en caso contrario mostrar mensaje "EL SERVIDOR PUBLICO HA CAMBIADO SU ESTADO A FALLECIDO"
    * - Validar que el régimen laboral no cambie, en caso contrario mostrar mensaje "EL SERVIDOR PUBLICO HA CAMBIADO SU REGIMEN LABORAL"
    * - Si cumple las validaciones anteriores, se podrá actualizar datos y continuar con la pantalla para adjudicar una plaza
    */
   var mensaje='';
   if(this.dataParent.response.esDiferenteSituacionLaboral == true){
    mensaje += '"EL SERVIDOR PUBLICO HA CAMBIADO SU SITUACION LABORAL DIFERENTE A EN ACTIVIDAD."';
   }

   if(this.dataParent.response.esDiferenteCondicionLaboral == true){
    if(mensaje.length>0){mensaje+='<br/>'}
    mensaje += '"EL SERVIDOR PUBLICO HA CAMBIADO SU CONDICIÓN LABORAL DIFERENTE A NOMBRADO."';
   }
   if(this.dataParent.esCentroTrabajoConEtapaUgel == true){
    if(mensaje.length>0){mensaje+='<br/>'}
    mensaje += '"EL SERVIDOR PUBLICO HA CAMBIADO SU CENTRO DE TRABAJO QUE NO TIENE EL MISMO AMBITO QUE LA REASIGNACIÓN EN LA ETAPA REGIONAL."';
   }
   if(this.dataParent.esCentroTrabajoConEtapaSinUgel == true){
    if(mensaje.length>0){mensaje+='<br/>'}
    mensaje += '"EL SERVIDOR PUBLICO HA CAMBIADO SU CENTRO DE TRABAJO QUE  TIENE EL MISMO AMBITO QUE LA REASIGNACIÓN EN LA ETAPA INTERREGIONAL."';
   }   
   if(this.dataParent.response.esDiferenteCategoriaRemunerada == true){
    if(mensaje.length>0){mensaje+='<br/>'}
    mensaje += '"EL SERVIDOR PUBLICO HA CAMBIADO DE ESCALA REMUNERATIVA."';
   }
   if(this.dataParent.response.esDiferenteFallecido == true){
    if(mensaje.length>0){mensaje+='<br/>'}
    mensaje += '"EL SERVIDOR PUBLICO HA CAMBIADO SU ESTADO A FALLECIDO."';
   }

   if(this.dataParent.response.esDiferenteRegimenLaboral == true){
    if(mensaje.length>0){mensaje+='<br/>'}
    mensaje += '"EL SERVIDOR PUBLICO HA CAMBIADO SU REGIMEN LABORAL."';
   }

   if(mensaje.length>0){
    this.dataService.Message().msgWarning(mensaje, () => {
    });
   }else{
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ACTUALIZAR LA INFORMACIÓN?', () => {
        this.funActualizar();
    }, () => { });
   }

  }

  
  funActualizar  = () => {
    const model = {
        idPostulacion: this.dataParent.response.idPostulacion,
        usuarioCreacion: this.currentSession.numeroDocumento
    };
    this.dataService.Spinner().show('sp6');
    this.dataService
        .Rotacion()
        .actualizarValidacionServidorPublico(model)
        .pipe(
        catchError((e) => {
            const { developerMessage } = e;
            this.dataService.Message().msgWarning(developerMessage, () => { });
            return of(null);
        }),
        finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
        ).subscribe((response: any) => {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => {
              this.matDialogRef.close({ registrado: true });
             });
        });
   }

}
export class ServidorPublicoDataSource extends DataSource<any>{

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


