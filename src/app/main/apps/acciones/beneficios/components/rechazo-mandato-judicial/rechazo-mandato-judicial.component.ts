
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { MensajesSolicitud } from '../../_utils/constants';

@Component({
  selector: 'minedu-rechazo-mandato-judicial',
  templateUrl: './rechazo-mandato-judicial.component.html',
  styleUrls: ['./rechazo-mandato-judicial.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class RechazoMandatoJudicialComponent implements OnInit {
    formPopup: FormGroup;
    dialogTitle: string;
    now = new Date();
    untilDate = new Date();
    
    constructor(
        public matDialogRef: MatDialogRef<RechazoMandatoJudicialComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
    ) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm(): void {
    this.formPopup = this.formBuilder.group({
        motivoRechazo:[null,Validators.required],
    });
    
    }
    handleGuardar(): void {
        
        if (!this.formPopup.valid) {
            this.dataService.Message().msgWarning(MensajesSolicitud.M08, () => { });
            return;
        }
        let dataForm = this.formPopup.value;
        dataForm.codigoEstadoAprobaciones = "3";
        console.log('dataForm',dataForm);
        this.matDialogRef.close({ data: dataForm });
    }
    cancelar = () => {
        this.matDialogRef.close();
    }; 
}
