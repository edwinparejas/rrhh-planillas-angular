import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';

@Component({
  selector: 'minedu-modal-rechazo',
  templateUrl: './modal-rechazo.component.html',
  styleUrls: ['./modal-rechazo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ModalRechazoComponent implements OnInit {

  form: FormGroup;

  constructor(
    public matDialogRef: MatDialogRef<ModalRechazoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      motivoRechazo: [null, [Validators.required, Validators.maxLength(400), Validators.minLength(5)]],
    });
  }


  handlerRechazar() {
    if (!this.form.valid) {
        this.dataService.Util().msgWarning(
            "INGRESE UN MOTIVO DE RECHAZO.", () => { });
        return;
    }
    
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE RECHAZAR ESTA PROPUESTA?', () => {
      this.matDialogRef.close(this.form.value); }, () => { });  
  }

  handleCancelar() {
    this.matDialogRef.close();
  }

}
