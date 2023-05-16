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
    selector: "minedu-registro-observacion-postulante-encargatura",
    templateUrl: "./registro-observacion-postulante-encargatura.component.html",
    styleUrls: ["./registro-observacion-postulante-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroObservacionPostulanteEncargaturaComponent implements OnInit {
    idCalificacion: number;
    codigoEtapa: number;
    form: FormGroup;
    loading = false;
    comboLists = {
        listMotivoObservacion: []
    };

    currentSession: SecurityModel = new SecurityModel();
    constructor(
        public dialogRef: MatDialogRef<RegistroObservacionPostulanteEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {
        this.idCalificacion = data.idCalificacion;
        this.codigoEtapa = data.codigoEtapa;
        this.currentSession=data.currentSession;
    }

    ngOnInit(): void {
        this.buildForm();
        this.loadCombos();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idMotivoObservacion: [null, Validators.required],
            anotacionesObservacion: [null, [Validators.required, Validators.maxLength(4000)]]
        });
    }

    loadCombos() {
        this.loadMotivoObservacion();
    }

    loadMotivoObservacion() {
        this.dataService.Encargatura().getComboMotivoObservacionCalificacion().pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.comboLists.listMotivoObservacion = result.map((x) => ({
                    ...x,
                    value: x.idMotivoObservacion,
                    label: x.descripcionMotivoObservacion
                }));
            }
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
            idMotivoObservacion: data.idMotivoObservacion,
            anotacionesObservacion: data.anotacionesObservacion,
            UsuarioModificacion:this.currentSession.nombreUsuario,
            codigoEtapa: this.codigoEtapa
        }
        this.dataService.Message().msgConfirm('¿ESTA SEGURO DE QUE DESEA OBSERVAR POSTULANTE?', () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().remarkCalificacionEncargatura(request).pipe(catchError((e) => of(e)), finalize(() => {
                this.dataService.Spinner().hide("sp6")
                this.loading = false;
            })).subscribe(result => {
                if (result == 1) {
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