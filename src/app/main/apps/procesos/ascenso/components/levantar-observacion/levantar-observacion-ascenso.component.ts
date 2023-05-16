import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder,Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { NullTemplateVisitor } from '@angular/compiler';
import {  ResultadoOperacionEnum } from '../../_utils/constants';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { TablaPermisos } from '../../../../../../core/model/types';
@Component({
    selector: 'minedu-levantar-observacion-ascenso',
    templateUrl: './levantar-observacion-ascenso.component.html',
    styleUrls: ['./levantar-observacion-ascenso.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class LevantarObservacionAscensoComponent implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;
    idAdjudicacion: number;
    situacionObs:number
    selection = new SelectionModel<any>(true, []);
    seleccionado: any = null;
    comboLists = {
        listEstado: []
    };
    resultadoOperacion=ResultadoOperacionEnum;
    // TODO
    request = {
        idAdjudicacion: null,
        situacionObservacion: null,
        idMotivoSubsanacion: null,
        detalleSubsanacion: null,
    };

    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
        autorizadoConsultar:false,
    };
    currentSession: SecurityModel = new SecurityModel();
    idRolPassport: number  ;
    formParent:any;
 

    constructor(
        public matDialogRef: MatDialogRef<LevantarObservacionAscensoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        ) { 
            this.formParent=data.parent;

        }

    ngAfterViewInit(): void {     
    }
    ngOnDestroy(): void {

    }

    ngOnInit(): void {
        this.buildSeguridad();
        this.buildForm();
        this.loadEstado();
        this.idAdjudicacion=this.data.dataKey.idAdjudicacion;
        this.situacionObs=this.data.dataKey.idEstado;
    }
    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.idRolPassport=this.currentSession.idRol;
    }
   buildForm = () => {
        this.form = this.formBuilder.group({
            idMotivoSubsanacion: [null,Validators.required],
            detalleSubsanacion: [null,Validators.required],
        });
    }

    loadEstado = () => {
        this.dataService.Ascenso().getComboEstadoSubsanacion().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                    
                }));
                this.comboLists.listEstado = data;
            }
        });
    }

    setRequest = () => {
        this.request = {
            idAdjudicacion:this.idAdjudicacion,
            situacionObservacion: this.situacionObs, 
            idMotivoSubsanacion: this.form.get('idMotivoSubsanacion').value,
            detalleSubsanacion: this.form.get('detalleSubsanacion').value,
        };
      }
      
      updateObservacion  = () =>{
        this.setRequest();
        this.dataService.Ascenso().updateObservacionAjudicacion(this.request).pipe(
            catchError((e) => of(e)),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                this.dataService.Message().msgAutoCloseSuccess('Subsanación registrada correctamente.',this.formParent.tiempoMensaje,() => { });
                this.formParent.handleBuscar();
                this.matDialogRef.close();
        }  else if (response && response.statusCode === this.resultadoOperacion.NotFound) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response && response.statusCode === this.resultadoOperacion.UnprocessableEntity) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
            this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
        }
        });
    }  
    cargarFiltro(): void {
        this.request = this.form.getRawValue();
    }



 
    handleLimpiar(): void {
        this.form.reset();
    }

   

    handleCancel = () => {
        this.matDialogRef.close();
    }


}
 