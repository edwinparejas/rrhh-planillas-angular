import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';

@Component({
  selector: 'minedu-adjuntar-documento',
  templateUrl: './adjuntar-documento.component.html',
  styleUrls: ['./adjuntar-documento.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class AdjuntarDocumentoComponent implements OnInit {

  titulo: string = '';

  form: FormGroup;
  working: boolean = false;
  soloVer: boolean = false;
  
  constructor(
    public matDialogRef: MatDialogRef<AdjuntarDocumentoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.working=true;
    this.buildForm();
    if (this.data) {
      console.log(this.data);
      this.titulo = this.data.titulo;

      this.form.patchValue({
        id_gestion_contrato: this.data.id_gestion_contrato,
        id_gestion_adenda: this.data.id_gestion_adenda,
      })
    }
  }

  buildForm() {
    this.form = this.formBuilder.group({
      id_gestion_contrato: 0,
      id_gestion_adenda: 0,
      adjuntarDocumento: [null],
    });
  }

  handleAdjunto(file) {
    if (file === null)
      return;

    this.form.patchValue({ adjuntarDocumento: file[0] });
  }

  handleGuardar() {
    let formData = this.form.value;
    let viewModel = new FormData();
    viewModel.append('documento', formData.adjuntarDocumento);
    if (formData.id_gestion_contrato > 0) 
      viewModel.append('id_gestion_contrato', formData.id_gestion_contrato);
    if (formData.id_gestion_adenda > 0) 
      viewModel.append('id_gestion_adenda', formData.id_gestion_adenda);

    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE ADJUNTAR EL DOCUMENTO FIRMADO.?', () => {
      debugger
      this.dataService.Spinner().show("sp6");
      this.working = true;

      if (formData.id_gestion_contrato > 0) {
        this.dataService.AccionesVinculacion().adjuntarContratoFirmado(viewModel).subscribe(
          (response) => {
            this.dataService.Spinner().hide("sp6");
            this.dataService.Message().msgAutoCloseSuccessNoButton('"CONTRATO FIRMADO ADJUNTADO DE FORMA EXITOSA."', 3000, () => {
              this.matDialogRef.close(true);
              this.router.navigate(['ayni/personal/acciones/contratoadenda']);
            });
          },
          (error: HttpErrorResponse) => {
            this.dataService.Spinner().hide("sp6")
            console.log(error);
            this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
          }
        )
      }

      if (formData.id_gestion_adenda > 0) {
        this.dataService.AccionesVinculacion().adjuntarAdendaFirmada(viewModel).subscribe(
          (response) => {
            this.dataService.Spinner().hide("sp6");
            this.dataService.Message().msgAutoCloseSuccessNoButton('"ADENDA FIRMADA ADJUNTADA DE FORMA EXITOSA."', 3000, () => {
              this.matDialogRef.close(true);
              this.router.navigate(['ayni/personal/acciones/contratoadenda']);
            });
          },
          (error: HttpErrorResponse) => {
            this.dataService.Spinner().hide("sp6")
            console.log(error);
            this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
          }
        )
      }

      


    }, () => { });
  }

  handleCancelar(data?: any) {
    this.matDialogRef.close(data);
  }

}
