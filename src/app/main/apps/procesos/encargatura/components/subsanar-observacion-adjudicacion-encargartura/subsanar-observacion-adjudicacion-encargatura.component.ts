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
    selector: "minedu-subsanar-observacion-adjudicacion-encargatura",
    templateUrl: "./subsanar-observacion-adjudicacion-encargatura.component.html",
    styleUrls: ["./subsanar-observacion-adjudicacion-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class SubsanarObservacionEncargaturaComponent implements OnInit {
    idAdjudicacion: number;
    form: FormGroup;
    loading = false;
    currentSession: SecurityModel = new SecurityModel();    
    comboLists = {
        listEstado: []
    };

    constructor(
        public dialogRef: MatDialogRef<SubsanarObservacionEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {
        this.idAdjudicacion = data.idAdjudicacion
    }

    ngOnInit(): void {
        this.buildForm();
        this.loadCombos();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idEstadoAdjudicacion: [null, Validators.required],
            detalleSubsanacion: [null, [Validators.required, Validators.maxLength(4000)]]
        });
    }

    loadCombos() {
        this.loadEstado();
    }

    loadEstado() {
        this.dataService.Encargatura().getComboTodosEstadoAdjudicacionEncargartura().pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.comboLists.listEstado = result.map((x) => ({
                    ...x,
                    value: x.idEstadoAdjudicacion,
                    label: x.descripcionEstadoAdjudicacion
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
            idAdjudicacion: this.idAdjudicacion,
            idEstadoAdjudicacion: data.idEstadoAdjudicacion,
            detalleSubsanacion: data.detalleSubsanacion,                
            UsuarioModificacion:this.currentSession.nombreUsuario
            
        }
        this.dataService.Message().msgConfirm('¿ESTA SEGURO DE QUE DESEA SUBSANAR LA ADJUDICACIÓN?', () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().registraSubsanarObsAdjudicacionEncargatura(request).pipe(catchError((e) => of(e)), finalize(() => {
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