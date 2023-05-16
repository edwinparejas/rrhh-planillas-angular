import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { CONFIGURACION_PROCESO_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { Subscription } from 'rxjs';
import { ResultadoOperacionEnum } from 'app/core/model/types';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { ASISTENCIA_MESSAGE } from '../../../../../core/model/messages-error';
import { MESSAGE_ASISTENCIA } from '../../utils/messages';
import * as moment from 'moment';
import { AsistenciaModel } from 'app/core/model/asistencia-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'minedu-modal-rechazo-solicitud',
  templateUrl: './modal-rechazo-solicitud.component.html',
  styleUrls: ['./modal-rechazo-solicitud.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ModalRechazoSolicitudComponent implements OnInit, AfterViewInit {

  private _unsubscribeAll: Subject<any>;
  private sharedSubscription: Subscription;
  form: FormGroup;
  maxDate = new Date();
  Asistencia: AsistenciaModel;


  dataAsistencia: any[] = [];
  working = false;
  isDisabled = false;
  nombreSede; 
  fechaAprobacion;
  numeroDocumento;
  response;
  fechaSolicitud;
  usuarioSolicitante;


  permisoPassport = {
    buttonCrearRechazo: false,
  }

  max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  min = new Date();

  modal = {
    icon: "",
    title: "",
    action: "",
    info: null,
    info_: null,
    esMasivo:false,
    editable: false
  }

  private passport: SecurityModel;
  centroTrabajo: CentroTrabajoModel = null;

  private _loadingChange = new BehaviorSubject<boolean>(false);
  loading = this._loadingChange.asObservable();
  totalRegistros: number = 0;
  dataSolicitud :any;
  dataAprobacion :any;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);

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

  constructor(
    public matDialogRef: MatDialogRef<ModalRechazoSolicitudComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.defaultPermisoPassport();
    this.buildData();
  }

  ngAfterViewInit() {
   
  }
  buildData=() => {
    // solicitante
    this.modal = this.data.modal;
    console.log(this.modal);
    this.passport = this.data.passport; 
    const form = this.form.value;
    this.dataService.Asistencia().getAsistenciaMensual_(this.passport.codigoSede, this.modal.info_.anio).pipe(
      catchError((e) => of(e)),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      console.log(response);
      if (response && response.result) {
        console.log(response);
       
        this.fechaSolicitud = response.fechaSolicitada;
         this.usuarioSolicitante = response.usuarioSolicitante;
        // / this..fechaSolicitud = moment(new Date(response.fechaSolicitud)).format('DD/MM/YYYY');
      }
      //  else {
      //   this.dataService.Message().msgWarning('No se encontró información del proceso.', () => { this.handleCancelar(); });
      // }
    });
    this.nombreSede = this.passport.nombreSede;
    this.numeroDocumento =  this.passport.numeroDocumento;
    this.fechaAprobacion =  moment(new Date()).format('DD/MM/YYYY');

    
  }

  resetForm = () => {
    this.form.reset();
    this.form.patchValue({
      detalleMotivoRechazo: null   });
   
}

  buildForm() {
    this.form = this.formBuilder.group({
      detalleMotivoRechazo:  [null, Validators.required],     
      fechaSolicitud: [null],    
    });
    this.initialize();
  }


  initialize() {
    this.modal = this.data.modal;
    this.passport = this.data.passport;
   this.buildData();
  }


  defaultPermisoPassport() {
    this.permisoPassport.buttonCrearRechazo = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar); 
  }

  
  handleSave = (form) => {
    if (!this.form.valid) {
        this.dataService.Message().msgWarning('Completar los datos requeridos.', () => { });
        return;
    }
    // rechazo masivo
    if(this.modal.esMasivo)
    {

      const data = {
        idControlAsistencia : this.modal.info.idControlAsistencia,     
        fechaAprobacion : this.fechaAprobacion,
        detalleMotivoRechazo : this.form.value.detalleMotivoRechazo,
        idEstado : this.modal.info.idEstado,
        anio : this.modal.info.anio,
        codigoCentroTrabajo: this.modal.info.codigoCentroTrabajo,
        usuarioRol: this.passport.nombreRol,
        usuarioRechazado: this.passport.numeroDocumento,
        usuarioRolRechazado: this.passport.nombreRol
      }
      console.log(data);
      console.log(this.modal.info);
      this.dataService.Message().msgConfirm(MESSAGE_ASISTENCIA.M83, () => {
        this.dataService.Spinner().show("sp6");
        this.working = true;
        this.dataService.Asistencia().postRechazarMasivo(this.modal.info).pipe(
            catchError((e) => of(e)),
            finalize(() => { 
                this.working = false; 
                this.dataService.Spinner().hide("sp6");
            })
        ).subscribe(response => {
            console.log("response", response);
            if (response && response.result) {
              this.dataService.Message().msgInfo(MESSAGE_ASISTENCIA.M07, () => {
                this.matDialogRef.close(data);
               });
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message()
                    .msgError('Ocurrieron algunos problemas al procesar su solicitud, por favor intenet de nuevo, gracias.',
                        () => { this.working = false; });
            }
        });
    }, () => { });
    }
    // rechazo individual      
//  return this.restangular.one('consolidadoaprobacion',data.idControlAsistencia).all('rechazar').post(data); 
    else {
      const data = {
        idControlAsistencia : this.modal.info.idControlAsistencia,
        usuarioAprobador : this.numeroDocumento,
        fechaAprobacion : this.fechaAprobacion,
        detalleMotivoRechazo : this.form.value.detalleMotivoRechazo,
        idEstado : this.modal.info.idEstado,
        anio : this.modal.info.anio,
        codigoCentroTrabajo: this.modal.info.codigoCentroTrabajo,
        usuarioRol: this.passport.nombreRol
  
      }
      console.log(data);
      this.dataService.Message().msgConfirm(MESSAGE_ASISTENCIA.M83, () => {
        this.dataService.Spinner().show("sp6");
        this.working = true;
        this.dataService.Asistencia().postSolicitudRechazo(data).pipe(
            catchError((e) => of(e)),
            finalize(() => { 
                this.working = false; 
                this.dataService.Spinner().hide("sp6");
            })
        ).subscribe(response => {
            console.log("response", response);
            if (response && response.result) {
              this.dataService.Message().msgInfo(MESSAGE_ASISTENCIA.M07, () => {
                this.matDialogRef.close(data);
               });
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message()
                    .msgError('Ocurrieron algunos problemas al procesar su solicitud, por favor intenet de nuevo, gracias.',
                        () => { this.working = false; });
            }
        });
    }, () => { });
    }  
}

  handleCancelar(data?: any) {
    this.matDialogRef.close(data);
  }

}