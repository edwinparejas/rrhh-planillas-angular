import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { TipoDocumentoIdentidadEnum, CatalogoItemEnum, EdadMaximaEnum } from '../../../_utils/constants';
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';

@Component({
  selector: 'minedu-buscar-informacion-personal',
  templateUrl: './buscar-informacion-personal.component.html',
  styleUrls: ['./buscar-informacion-personal.component.scss']
})
export class BuscarInformacionPersonalComponent implements OnInit {
    documento = TipoDocumentoIdentidadEnum;
    postulante: any = {};
    formBuscar: FormGroup;
    soloLectura:boolean=true;
    combo = {
	tiposDocumentoIdentidad: [],
	nacionalidades: [],
	tiposDocumento: [],
    };
    maxLengthnumeroDocumentoIdentidad: number;
    tipoDocumento: number;
    @Output() eventDataPersona: EventEmitter<any> = new EventEmitter();
    @Input() conValidacionEdad:boolean;
    @Input() conNacionalidad:boolean;
    @Input() dataInicial:any;
    constructor(
	private formBuilder: FormBuilder,
	private dataService: DataService,
    ) { }

    ngOnInit(): void {
	this.getDocumentoTipos();
	this.buildForm();
	this.loadDataInicial();
    }
    ngOnChanges(changes: SimpleChanges) {
	if(changes['dataInicial']){
	    let dataPostulante = changes['dataInicial']['currentValue'];
	    if(dataPostulante == null){
		if(this.formBuscar)
		    this.formBuscar.reset();
		this.postulante = {
		    ...this.postulante,
		    numeroDocumentoIdentidadCompleto:null
		};
	   }
	}
    }
    loadDataInicial = () => {
	this.soloLectura = true;
	if(this.dataInicial != null) {
	    this.postulante = this.dataInicial;
	    this.formBuscar.get('idTipoDocumentoIdentidad').setValue(parseInt(this.dataInicial.tipoDocumento));
	    this.formBuscar.get('numeroDocumentoIdentidad').setValue(this.dataInicial.numeroDocumentoIdentidad);
	    this.soloLectura = false;
	}
    }

    buildForm() {
	this.formBuscar = this.formBuilder.group({
	    idTipoDocumentoIdentidad: [null, Validators.required],
	    numeroDocumentoIdentidad: [null, Validators.required],
	    nacionalidad: [null],
	});

    }

    handleCambiarValorNacionalidad = (valorNacionalidad: number): void => {        
	const nacionalidad = this.combo.nacionalidades.find(x => x.id == valorNacionalidad);
	this.postulante.descripcionNacionalidad = nacionalidad.descripcion;
    }

    validaNumericos = (event) => {
	if (event.charCode >= 48 && event.charCode <= 57) {
	    return true;
	}
	return false;
    }

    handleBuscarPostulante = () => {
	let idTipoDocumento = this.formBuscar.get("idTipoDocumentoIdentidad").value;
	let numeroDocumentoIdentidad = this.formBuscar.get("numeroDocumentoIdentidad").value;
	let usuarioModificacion = "ADMIN";
	this.formBuscar.markAllAsTouched();
	if (idTipoDocumento !== null && this.formBuscar.valid) {
	    const numeroDocumento = numeroDocumentoIdentidad === "" ? null : numeroDocumentoIdentidad;
	    if (numeroDocumento !== null && this.formBuscar.valid) {
		this.dataService.Spinner().show("sp6");
		this.dataService.Contrataciones()
		.getPostulanteByNumeroDocumento(idTipoDocumento, numeroDocumento, usuarioModificacion)
		.pipe(
		    catchError(() => of([])),
			finalize(() => {
			this.dataService.Spinner().hide("sp6");
		    })
		).subscribe((response: any) => {
		    if (!response || response.length == 0) {
			this.dataService
			.Message()
			.msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
			this.formBuscar.get('numeroDocumentoIdentidad').setValue('');
			this.postulante
			.numeroDocumentoIdentidadCompleto=null;
		    } else {
			this.postulante = response;
			//this.form.get('tieneVinculacion').setValue(false);
			//this.tieneVinculacion = false;
			let ejecutaEvento:boolean = true;
			if(this.conValidacionEdad)
			    ejecutaEvento = this.calcularEdad();
			if(ejecutaEvento)
			    this.eventDataPersona.emit(response);
			//if (this.postulante.sancionesAdministrativas != null && 
			//this.postulante.sancionesAdministrativas.length != 0){
			//this.buscarSancionesAdministrativas(this.postulante);
			//}
		    }
		});
	    } else {
		this.dataService.Message().msgWarning('"INGRESE EL NÚMERO DE DOCUMENTO."', () => { });
	    }
	} else {
	    this.dataService.Message().msgWarning('"SELECCIONE EL TIPO DE DOCUMENTO."', () => { });
	}
    }

    calcularEdad() {
        const fechaNacimiento = this.postulante.fechaNacimiento.split("/");
        const fecha = fechaNacimiento[1] + "/" + fechaNacimiento[0] + "/" + fechaNacimiento[2].split(' ')[0];
        var hoy = new Date();
        var cumpleanos = new Date(fecha);
        var edad = hoy.getFullYear() - cumpleanos.getFullYear();
        var m = hoy.getMonth() - cumpleanos.getMonth();

        if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
            edad--;
        }

        if (edad > EdadMaximaEnum.EDAD_MAXIMA) {
            this.dataService.Message().msgWarning('"LA EDAD DE LA PERSONA DEBE SER MENOR A 65 AÑOS, NO SE PUEDE REGISTRAR COMO POSTULANTE."', () => { });
            this.formBuscar.reset();
            this.postulante = {};
	    return false;
        } else {
            this.postulante.edad = edad;
    //        this.getVinculacionPostulante();
        }
	return true;
    }

    getDocumentoTipos() {
	this.dataService
	.Contrataciones()
	.getComboTipoDocumentos(
	    CatalogoItemEnum.TIPOS_DOCUMENTOS_IDENTIDAD
	).pipe(
	catchError(() => {
	    this.dataService
	    .SnackBar()
	    .msgError(
		CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD,
		SNACKBAR_BUTTON.CLOSE);
		return of(null);
	}
		  )
	).subscribe((response: any) => {
	    if (response) {
		this.combo.tiposDocumentoIdentidad = response;
		//this.formBuscar.get('idTipoDocumentoIdentidad').setValue(1);
	    } else {
		this.dataService 
		.SnackBar() 
		.msgError(
		    CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD,
		    SNACKBAR_BUTTON.CLOSE);
		    this.combo.tiposDocumentoIdentidad = [];
	    }
	});
    }

    handleCambiarValor = (valorDocumento: number): void => {
	this.tipoDocumento = valorDocumento;
	this.formBuscar.get('numeroDocumentoIdentidad').setValue(null);
	this.maxLengthnumeroDocumentoIdentidad = valorDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
	this.formBuscar.get('numeroDocumentoIdentidad').setValidators([ 
	    Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),
	    Validators.required
	]);
	if(this.conNacionalidad)
	    if (valorDocumento === TipoDocumentoIdentidadEnum.CARNET_EXTRANJERIA) {
		this.getNacionalidades();
	    } else {
		this.combo.nacionalidades = [];
	    }
    }

    getNacionalidades() {
	this.dataService
	.Contrataciones()
	.getPaisNacionalidad(true)
	.pipe(catchError(() => {
	    this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.NACIONALIDADES, SNACKBAR_BUTTON.CLOSE);
	    return of(null);
	})).subscribe((response: any) => {
	    if (response) {
		this.combo.nacionalidades = response;
	    } else {
		this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.NACIONALIDADES, SNACKBAR_BUTTON.CLOSE);
		this.combo.nacionalidades = [];
	    }
	});
    }
}
