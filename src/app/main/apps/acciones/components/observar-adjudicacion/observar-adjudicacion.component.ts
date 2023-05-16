import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';

@Component({
  selector: 'minedu-observar-adjudicacion',
  templateUrl: './observar-adjudicacion.component.html',
  styleUrls: ['./observar-adjudicacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ObservarAdjudicacionComponent implements OnInit {

  form: FormGroup;
  working: boolean = false;
  
  constructor(
    public matDialogObsRef: MatDialogRef<ObservarAdjudicacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) { }


  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idAdjudicacion: [0],
      observacion: [null, Validators.required],
      usuarioCreacion: [null, Validators.required],
    });
  }

  handleEnviar() {    
    this.matDialogObsRef.close( {observado: true});
  }

  handleCancelar() {
    this.matDialogObsRef.close();
  }

}
