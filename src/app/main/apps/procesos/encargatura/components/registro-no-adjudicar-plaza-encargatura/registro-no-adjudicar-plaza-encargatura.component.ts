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
    selector: "minedu-registro-no-adjudicar-plaza-encargatura",
    templateUrl: "./registro-no-adjudicar-plaza-encargatura.component.html",
    styleUrls: ["./registro-no-adjudicar-plaza-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroNoAdjudicarPlazaEncargaturaComponent implements OnInit {
    idAdjudicacion: number;
    idPostulacion: number;
    form: FormGroup;
    loading = false;   
    idDesarrolloProceso: number;
    codigoEtapa: number; 
    idServidorPublico: number; 
    idPersona: number; 
    currentSession: SecurityModel = new SecurityModel();    
    comboLists = {
        listMotivoNoAdjudicacion: []
    };

    constructor(
        public dialogRef: MatDialogRef<RegistroNoAdjudicarPlazaEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {
        this.idAdjudicacion = this.data.idAdjudicacion;
        this.idPostulacion = this.data.idPostulacion;
        this.currentSession=this.data.currentSession;
        this.idDesarrolloProceso = this.data.idDesarrolloProceso;
        this.codigoEtapa = this.data.codigoEtapa;
        this.idServidorPublico=this.data.idServidorPublico;
        this.idPersona=this.data.idPersona;
    }

    ngOnInit(): void {
        console.log(this.idAdjudicacion);
        this.buildForm();
        this.loadCombos();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idMotivoNoAdjudicacion: [null, Validators.required],
            detalleAnotacion: [null, [Validators.required, Validators.maxLength(4000)]]
        });
    }

    loadCombos() {
        this.loadMotivoNoAdjudicacion();
    }

    loadMotivoNoAdjudicacion() {
        this.dataService.Encargatura().getComboMotivoNoAdjudicacionEncargatura().pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.comboLists.listMotivoNoAdjudicacion = result.map((x) => ({
                    ...x,
                    value: x.idMotivoNoAdjudicacion,
                    label: x.descripcionMotivoNoAdjudicacion
                }));
            }
        });
    }

    handleSave() {
        if (this.form.valid == false) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS."', () => {});
            return;
        }
        this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE NO DESEA ADJUDICAR LA PLAZA?', () => {
            const request = {
                idAdjudicacion: this.idAdjudicacion,
                idPostulacion: this.idPostulacion,
                idMotivoNoAdjudicacion: this.form.get('idMotivoNoAdjudicacion').value,
                detalleAnotacion: this.form.get('detalleAnotacion').value,                
                UsuarioModificacion:this.currentSession.nombreUsuario,
                idServidorPublico:this.idServidorPublico,
                idPersona:this.idPersona,
                idDesarrolloProceso:this.idDesarrolloProceso,
                codigoEtapa:this.codigoEtapa,
            }
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().registrarNoAdjudicarPlazaAdjudicacionEncargatura(request).pipe(catchError((e) => of(e)), finalize(() => {
                this.dataService.Spinner().hide("sp6")
                this.loading = false;
            })).subscribe(result => {
                if (result == 1) {
                    this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000,() => {});
                    this.dialogRef.close();
                } else {
                    this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => {});
                }
            });
        }, () => { });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}