import { Component, Input, OnInit, ViewEncapsulation, EventEmitter, Output } from "@angular/core";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";
import { TipoDocumentoIdentidadEnum } from '../../_utils/constants';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { CustomValidate } from '../../_utils/CustomValidate';

@Component({
    selector: "minedu-informacion-postulante-calificacion",
    templateUrl: "./informacion-postulante-calificacion.component.html",
    styleUrls: ["./informacion-postulante-calificacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionPostulanteCalificacionComponent implements OnInit {
    @Input() idPersona: number;
    @Input() mostrarDetallesAdicionales?: boolean = false;
    @Input() formData?: FormGroup = null;
    @Input() tipo?:any = null;
    form: FormGroup;
    
    @Output() formValue = new EventEmitter<any>();

    Response: any;

    constructor(
	private dataService: DataService,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.obtenerInformacion();
	this.buildForm();
        this.emitFormValue();
    }

    obtenerInformacion = () => {
        var d = {
            idPersona: this.idPersona
        };

        this.dataService.Contrataciones().getObtenerInformacionPostulante(d).pipe(
            catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((d: any) => {
            if (d) {
                this.Response = {
                    documento: d.documento,
                    numeroDocumento: d.numeroDocumento,
                    primerApellido: d.primerApellido,
                    segundoApellido: d.segundoApellido,
                    nombres: d.nombres,
                    nacionalidad: this.obtenerNacionalidad(d.tipoDocumento,d.nacionalidad),
                    fechaNacimiento: d.fechaNacimiento,
                    sexo: d.sexo
                };

                this.calcularEdad();
            }
        });
    }

    obtenerNacionalidad = (tipoDocumento,nacionalidad) => {
	if(tipoDocumento == TipoDocumentoIdentidadEnum.DNI && !nacionalidad){
	    nacionalidad = "Peruana";
	}
	return nacionalidad;
    }

    calcularEdad() {
        const fechaNacimiento = this.Response.fechaNacimiento.split("/");
        const fecha = fechaNacimiento[1] + "/" + fechaNacimiento[0] + "/" + fechaNacimiento[2];
        var hoy = new Date();
        var cumpleanos = new Date(fecha);
        var edad = hoy.getFullYear() - cumpleanos.getFullYear();
        var m = hoy.getMonth() - cumpleanos.getMonth();

        if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
            edad--;
        }

        this.Response.edad = edad;
    }

    buildForm() {
        this.form = this.formBuilder.group({
            correoElectronico: [null, [Validators.required, CustomValidate.correoElectronico]],
            direccionDomicilio: [null, Validators.required],
        });
        this.form.valueChanges.subscribe(x => {
	this.formValue.emit(this.form)
          this.emitFormValue();
        })
    }


    emitFormValue() {
	this.formValue.emit(this.form)
    }
}
