import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import * as moment from 'moment';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DatoConsolidadoModel, ResultadoOperacionEnum, TablaPermisos } from '../../../models/reasignacion.model';

@Component({
  selector: 'minedu-rechazar-plazas-convocadas',
  templateUrl: './rechazar-plazas-convocadas.component.html',
  styleUrls: ['./rechazar-plazas-convocadas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class RechazarPlazasConvocadasComponent implements OnInit {
  currentSession: SecurityModel = new SecurityModel();
  dt: DatoConsolidadoModel = new DatoConsolidadoModel();
  ipAddress = '';
  action: any;
  idcp: any;
  dialogTitle: String;
  form: FormGroup;

  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false
  };

  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public MatDialogRef: MatDialogRef<RechazarPlazasConvocadasComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    ) { }

  ngOnInit(): void {
    this.action = this.data.action;
    this.idcp = this.data.idcp;
    this.buildForm();
    this.buildSeguridad();
    this.obtenerConsolidadoPlaza();
  }
  buildForm(): void {
    this.form = this.formBuilder.group({
      motivoRechazo: [null]
    });
  }
  
  buildSeguridad = () => {
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  obtenerConsolidadoPlaza = () => {
    let dato = {
      idcp: Number(this.idcp)
    }
    console.log('Buscar dato ->', dato)
    console.log('Buscar action ->', this.action)
    this.dataService
      .Reasignaciones()
      .getBuscarConsolidado(dato)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
         })
      )
      .subscribe((response: any) => {
        if (response) {
          this.dt = response[0];
          this.asignarDatos();
          console.log('respuesta del Consolidado ->', this.dt)
        }
      });
  };

  pro_apro: String;
  inst_soli:String;
  usua_soli: String; 
  fech_soli: String;
  inst_apro: String;
  usua_apro: String;
  fech_apro: String;
  motivo: String;

  asignarDatos = () => {
    console.log('se procede a asignar dato')
    this.pro_apro = this.dt.proceso_aprobacion;
    this.inst_soli = this.dt.instancia_solicitante;
    this.usua_soli = this.dt.usuario_solicitante;
    this.fech_soli = moment(this.dt.fecha_solicitante).format('DD/MM/YYYY');
    if(this.action === 'MOTIVO'){
      this.dialogTitle = 'RECHAZAR SOLICITUD DE APROBACION';
      this.inst_apro = this.dt.instancia_aprobador;
      this.usua_apro = this.dt.usuario_aprobador;
      this.fech_apro = moment(this.dt.fecha_aprobador).format('DD/MM/YYYY');
      this.motivo = this.dt.motivo;
    } else if(this.action === 'RECHAZAR'){
      this.dialogTitle = 'MOTIVO DE RECHAZO';
      this.inst_apro = 'falta';
      this.usua_apro = 'falta';
      this.fech_apro = String(Date.now());
    }
  }

  

  handleCancel = () => {
    this.MatDialogRef.close();
  }

  aprobarRechazar = (proceso) => {
    let dato = {
      idcp: Number(this.idcp),
      motivo: this.form.get('motivoRechazo').value,
      operacion: proceso,
      usuario: this.currentSession.nombreUsuario,
      ip: this.ipAddress
    }
    console.log(dato);
    this.dataService.Message().msgConfirm(
      "¿ESTÁ SEGURO QUE DESEA RECHAZAR EL LISTADO DE LAS PLAZAS?",
       () => {
          this.dataService.Spinner().show("sp6");
          this.dataService.Reasignaciones()
          .getAprobarRechazarConsolidado(dato).pipe(
            catchError((e) => of(e)),
            finalize(() => {
              this.dataService.Spinner().hide("sp6");
            })
          )
            .subscribe((response) => {
              if (response) {
                this.MatDialogRef.close('guardado');
              } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
              } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
              } else {
                this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL APROBAR LISTADO DE PLAZAS."', () => { });
              }
            });
        },
        (error) => { }
      );
  }
}
