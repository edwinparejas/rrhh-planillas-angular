import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { Subscription, BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { ObservarActividadModel } from '../../models/pendientes.model';
import { ResultadoOperacionEnum } from '../_utils/constants';
import { GlobalsService } from '../../../../../../core/shared/globals.service';
import { ActividadesDataSource } from '../../pendientes.component';
import { saveAs } from 'file-saver';

@Component({
    selector: 'minedu-editar-pendientes',
    templateUrl: './editar-pendientes.component.html',
    styleUrls: ['./editar-pendientes.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EditarPendientesComponent implements OnInit {
    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;

    form: FormGroup;
    isWorking = false;
    action: string;
    dialogTitle: string;
    esPendiente: boolean = false;
    archivo: any;
    maxDate = new Date();
    informativo: boolean = false;
    constructor(
        public matDialogRef: MatDialogRef<EditarPendientesComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.buildForm();
        this.dialogTitle = this.data.title;
        this.informativo = this.data.informativo;        
        this.reloadForm();
    }

    buildForm(): void {
        this.esPendiente = this.data.idEstadoActividad === 14 ? true : false;
        console.log(this.esPendiente);
        this.form = this.formBuilder.group({
            idActividad: [this.data.idActividad],
            tipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            apellidoPaterno: [null],
            apellidoMaterno: [null],
            nombres: [null],
            regimenLaboral: [null],
            grupoAccion: [null],
            accion: [null],
            motivoAccion: [null],
            codigoDocumentoSustento: [null],
            estadoActividad: [null],        
            motivoObservacion: [null, Validators.required],
            nombreArchivo: [null]  
        });
    } 

    adjunto(pIdDocumento) {
        this.form.patchValue({ codigoDocumentoSustento: pIdDocumento });
    }

    descargarSustento() {
      let data = this.form.getRawValue();
      if (data.codigoDocumentoSustento === null) {
        this.dataService.Message().msgWarning('La observación de la actividad no tiene documento adjunto.', () => { });
        return;
      }
      console.log(data.codigoDocumentoSustento);
      this.dataService.Spinner().show("sp6");
      this.dataService.Documento().descargar(data.codigoDocumentoSustento)
        .pipe(
          catchError((e) => of(null)),
          finalize(() => this.dataService.Spinner().hide("sp6"))
        ).subscribe(response => {
          if (response) {
            saveAs(response, "documentoSustento.pdf");
          } else {
            this.dataService.Message().msgWarning('No se pudo descargar el documento adjunto', () => { });
          }
        });  
    }

    reloadForm = () => {
        this.dataService.Actividades().getRegistroActividades(this.data.idActividad).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {            
            if (response && response.result) {
                this.form.get('tipoDocumentoIdentidad').setValue(response.data.tipoDocumentoIdentidad);
                this.form.get('numeroDocumentoIdentidad').setValue(response.data.numeroDocumentoIdentidad);
                this.form.get('apellidoPaterno').setValue(response.data.apellidoPaterno);
                this.form.get('apellidoMaterno').setValue(response.data.apellidoMaterno);
                this.form.get('nombres').setValue(response.data.nombres);
                this.form.get('regimenLaboral').setValue(response.data.regimenLaboral);
                this.form.get('grupoAccion').setValue(response.data.grupoAccion);
                this.form.get('accion').setValue(response.data.accion);
                this.form.get('motivoAccion').setValue(response.data.motivoAccion);
                this.form.get('codigoDocumentoSustento').setValue(response.data.codigoDocumentoSustento);
                this.form.get('estadoActividad').setValue(response.data.estadoActividad);
                this.form.get('motivoObservacion').setValue(response.data.motivoObservacion);                 
            }
        }); 
    }

    getData = (row: any) => {
        const model: ObservarActividadModel = new ObservarActividadModel();
        model.idActividad = this.data.idActividad;
        model.documentoSustento = row.codigoDocumentoSustento;     
        model.observacion = row.motivoObservacion;
        model.usuario = 'ADMIN';
        return model;
    }    

    handleObservar = (form) => {
      let data = this.form.getRawValue();
        if (!this.form.valid || data.codigoDocumentoSustento == null) {
            this.dataService.Message().msgWarning('Debe ingresar datos obligatorios.', () => { });
            return;
        }        
        const actividad = this.getData(data);
        this.dataService.Message().msgConfirm('¿Esta seguro de que desea observar la actividad?', () => {
          this.dataService.Spinner().show("sp6");
            this.dataService.Actividades().ObservarActividad(actividad).pipe(
                catchError((e) => of(e)),
                finalize(() => { })
            ).subscribe(response => {
                if (response && response.result) {  
                  this.dataService.Spinner().hide("sp6");                 
                    this.dataService.Message().msgInfo('Operación realizada de forma exitosa.', () => { });
                    this.matDialogRef.close(true);
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información, por favor intente dentro de unos segundos, gracias.', () => { });
                }
            });
        }, () => {});
    }    

    handleCancel = () => {
        this.matDialogRef.close(false);
    }

}

