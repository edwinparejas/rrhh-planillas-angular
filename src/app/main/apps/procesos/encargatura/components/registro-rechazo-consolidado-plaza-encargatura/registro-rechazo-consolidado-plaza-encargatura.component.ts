import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';
import { ENCARGATURA_MESSAGE } from '../../_utils/message';
import { SecurityModel } from 'app/core/model/security/security.model';

@Component({
    selector: "minedu-registro-rechazo-consolidado-plaza-encargatura",
    templateUrl: "./registro-rechazo-consolidado-plaza-encargatura.component.html",
    styleUrls: ["./registro-rechazo-consolidado-plaza-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroRechazoConsolidadoPlazaEncargaturaComponent implements OnInit {
    form: FormGroup;
    
    idConsolidadoPlaza: number;
    
    loading = false;


    currentSession: SecurityModel = new SecurityModel();   
    constructor(
        public dialogRef: MatDialogRef<RegistroRechazoConsolidadoPlazaEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {
        this.idConsolidadoPlaza = data.idConsolidadoPlaza,
        this.currentSession=data.currentSession
    }

    ngOnInit(): void {
        this.buildForm();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            detalleMotivoRechazo: [null, [Validators.required, Validators.maxLength(4000)]]
        });
    }

    handleSave() {
        if (this.form.valid == false) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M08, () => {});
            return;
        }
        const detalleMotivoRechazo = this.form.get("detalleMotivoRechazo").value;
        
        var user=this.dataService.Storage().getPassportUserData();
        
        var request = {
            idConsolidadoPlaza:  this.idConsolidadoPlaza,
            detalleMotivoRechazo: detalleMotivoRechazo,
            usuarioModificacion: this.currentSession.nombreUsuario,
            numeroDocumento:this.currentSession.numeroDocumento,
            tipoNumeroDocumento:this.currentSession.tipoNumeroDocumento,
            solicitante:this.currentSession.nombreCompleto,
            codigoCentroTrabajo:this.currentSession.codigoSede,
            codigoRol:this.currentSession.codigoRol,
            primerApellidoAprobador:user.APELLIDO_PATERNO,
            segundoApellidoAprobador:user.APELLIDO_MATERNO,
            nombresAprobador:user.NOMBRES_USUARIO
        }

        this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.M93, () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().rejectConsolidadoPlazaEncargatura(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe(result => {
                if (result !== null) {
                    if (result === true) {
                        this.dialogRef.close({event:'Save'});
                    } else {
                        this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                    }
                }
            });
        }, () => { });
    }

    handleCancel() {
        this.dialogRef.close({event:'Cancel'});
    }
}