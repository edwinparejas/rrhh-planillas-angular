import { AfterViewInit, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE } from 'app/core/model/message';
import { MISSING_TOKEN } from 'app/core/model/types';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-modal-eliminar-accion-grabada',
  templateUrl: './modal-eliminar-accion-grabada.component.html',
  styleUrls: ['./modal-eliminar-accion-grabada.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalEliminarAccionGrabadaComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  constructor(
      public matDialogRef: MatDialogRef<ModalEliminarAccionGrabadaComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private formBuilder: FormBuilder,
      private dataService: DataService
  ) { }

  valoresRecibidos: any;
  ngOnInit(): void {
      this.buildForm();
      this.valoresRecibidos = this.data;
  }
  buildForm() {
      this.form = this.formBuilder.group({
          motivoEliminacion: [null, [Validators.required, Validators.maxLength(400), Validators.minLength(5)]],
      });
  }
  ngAfterViewInit() {
  }

  eliminarAccionGrabada() {
      if (!this.form.valid) {
          this.dataService.Util().msgError(
              "INGRESE UN MOTIVO DE ELIMINACIÓN.", () => { });
          return;
      }
      let idAccionGrabada = this.valoresRecibidos.idAccionGrabada;
      let motivoEliminacion = this.form.value.motivoEliminacion;

      this.dataService.AccionesGrabadas().eliminar(idAccionGrabada, motivoEliminacion)
        .pipe(
          catchError((e) => { return of(e); }),
          finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
          if (response) {
            this.dataService.Message().msgAutoSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => { this.matDialogRef.close();});
  
          } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
            this.dataService.Message().msgWarning('"'+response.messages[0]+'"', () => { });
          } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
          } else {
            this.dataService.Message().msgWarning('"NO SE PUDO ACTUALIZAR LA PROPUESTA REUBICACIÓN."', () => { });
          }
        });
    }


}

