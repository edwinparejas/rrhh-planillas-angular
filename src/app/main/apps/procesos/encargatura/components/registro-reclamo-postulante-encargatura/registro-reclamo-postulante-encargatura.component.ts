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
    selector: "minedu-registro-reclamo-postulante-encargatura",
    templateUrl: "./registro-reclamo-postulante-encargatura.component.html",
    styleUrls: ["./registro-reclamo-postulante-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroReclamoPostulanteEncargaturaComponent implements OnInit {
    idCalificacion: number;
    form: FormGroup;
    loading = false;    
    currentSession: SecurityModel = new SecurityModel();
    constructor(
        public dialogRef: MatDialogRef<RegistroReclamoPostulanteEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {
        this.idCalificacion = data.idCalificacion;
        this.currentSession=data.currentSession;
    }

    ngOnInit(): void {
        this.buildForm();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            detalleReclamo: [null, [Validators.required, Validators.maxLength(4000)]]
        });
    }

    handleSave() {
        if (this.form.valid == false) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS."', () => {});
            return;
        }

        const data = this.form.getRawValue();
        const request = {
            idCalificacion: this.idCalificacion,
            detalleReclamo: data.detalleReclamo,
            UsuarioModificacion:this.currentSession.nombreUsuario
        }
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?', () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().claimCalificacionEncargatura(request).pipe(catchError((e) => of(e)), finalize(() => {
                this.dataService.Spinner().hide("sp6")
                this.loading = false;
            })).subscribe(result => {
                if (result > 0) {
                    this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => {});
                    this.dialogRef.close();
                } else {
                    this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => {});
                }
            });
        }, (error) => { });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}