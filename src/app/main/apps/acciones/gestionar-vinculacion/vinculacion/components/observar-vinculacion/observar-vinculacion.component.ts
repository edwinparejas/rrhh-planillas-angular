import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-observar-vinculacion',
  templateUrl: './observar-vinculacion.component.html',
  styleUrls: ['./observar-vinculacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ObservarVinculacionComponent implements OnInit {

  form: FormGroup;
  working: boolean = false;
  soloVer: boolean = false;
  dialogTitle: string = '';

  NuevoRegistro: boolean = true;
 
  dataObservar: string = '';
  textoTitulo: string = '';

  Valorclose = {
    observar: false
  };

  constructor(
    public matDialogRef: MatDialogRef<ObservarVinculacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    
    this.dialogTitle = this.data.dialogTitle;    

    this.textoTitulo = "Detalle de la observación (*)";
    
    this.working=true;
      this.buildForm();
      if(this.data){
        console.log(this.data);
        if (this.data.id_gestion_vinculacion != undefined && this.data.id_gestion_vinculacion > 0) {  
          debugger;        
          this.NuevoRegistro = false;
          this.soloVer = this.data.soloVer;
          if(this.soloVer) {
            this.textoTitulo = "Detalle de la observación";
            this.dataObservar = this.data.observaciones;
            this.form.patchValue({
              observacion: this.dataObservar.toUpperCase()
            })

            this.form.controls["observacion"].disable();
            
          }
          
        }
      }
  }

  buildForm() {
debugger;
    this.form = this.formBuilder.group({
      observacion: [null, Validators.required]
    });

    
    
    
    
  }

  handleGuardar (_id_gestion_vinculacion) {
    // this.dataService.Message().msgConfirm('¿Está seguro de que desea observar la vinculación.?', () => {
      this.dataService.Spinner().show("sp6");
      let viewModel = {
        id_gestion_vinculacion: _id_gestion_vinculacion,
        observacion: this.form.get('observacion').value,
        
      }
      this.working = true;
      this.dataService.AccionesVinculacion().observarGestionVinculacion(viewModel).subscribe(
        (response) => {
          debugger;
          this.dataService.Spinner().hide("sp6");            
          
          this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
            console.log("observado")            
            this.router.navigate(['ayni/personal/acciones/vinculacion'])
            this.Valorclose.observar = true;
            this.matDialogRef.close(this.Valorclose);
          });
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      )
    // }, () => { });
  }

  handleGuardarPrimero () {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA OBSERVAR LA ADJUDICACIÓN?', () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      debugger;
      // !this.data.is_saved 
      if (this.NuevoRegistro ) {

        const dataVinculacion = {                             
          gestion_vinculacion: {
            fecha_inicio: (new Date).toUTCString(),
            fecha_fin: (new Date).toUTCString()    
          }
                    
        }

        let data : FormData = this.data.info;

        this.appendFormData(data, dataVinculacion, "");

        data.append('gestion_vinculacion.detalle_observacion_adjudicacion', this.form.get('observacion').value);
        this.dataService.AccionesVinculacion().guardarVinculacionPorObservacion(this.data.info).subscribe(
          (response) => {            
            this.dataService.Spinner().hide("sp6");
            this.handleGuardar(response)
          },
          (error: HttpErrorResponse) => {
            this.dataService.Spinner().hide("sp6")
            this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
          }
        )
      } else {
        this.handleGuardar(this.data.id_gestion_vinculacion)
      }
      


    }, () => { });
  }

  handleCancelar() {
    debugger;
    this.matDialogRef.close(this.Valorclose);
  }

   appendFormData(formData, data, rootName) {            
    let root = rootName || "";
    if (data instanceof File) {
        formData.append(root, data);
    } else if (data instanceof Date) {
        formData.append(root, this.convertDate(data));
    } else if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            this.appendFormData(formData, data[i], root + "[" + i + "]");
        }
    } else if (typeof data === "object" && data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (root === "") {
                    this.appendFormData(formData, data[key], key);
                } else {
                    this.appendFormData(
                        formData,
                        data[key],
                        root + "." + key
                    );
                }
            }
        }
    } else {
        if (data !== null && typeof data !== "undefined") {
            formData.append(root, data);
        }
    }
}

convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat)
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-')
}


}
