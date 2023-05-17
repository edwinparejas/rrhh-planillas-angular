import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'minedu-modal-afp',
  templateUrl: './modal-afp.component.html',
  styleUrls: ['./modal-afp.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalAfpComponent implements OnInit {
    modal = {
        icon: "",
        title: "",
        origin: "",
    };

    form: FormGroup;

  constructor(
    public matDialogRef: MatDialogRef<ModalAfpComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.modal = this.data.modal;
    this.buildForm();
}

buildForm() {
    this.form = this.formBuilder.group({
        codigo: [null],
        descripcion: [null],
        ruc: [null],
        telefono: [null],
        departamento: [null],
        provincia: [null],
        distrito: [null],
        direccion: [null],
        estado: [null],
        motivo: [null],
    });
}

}
