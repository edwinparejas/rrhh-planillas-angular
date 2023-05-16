import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CONFIGURACION_PROCESO_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { ActivoFlagEnum, CatalogoItemEnum, EdadMaximaEnum, ProcesoEnum, ProcesoEtapaEnum, TipoDocumentoIdentidadEnum, TipoFormatoPlazaEnum, EstadoPostulacionEnum, TipoRegistroEnum, MensajesSolicitud } from '../../../_utils/constants';
import { BusquedaPlazaComponent } from '../../../components/busqueda-plaza/busqueda-plaza.component';
import { PlazasPublicacionInformacionResponseModel } from '../../../models/contratacion.model';
import { ModalSancionPostulanteEvalExpComponent } from '../modal-sancion-postulante-evaluacion/modal-sancion-postulante-evaluacion.component';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';

@Component({
  selector: 'minedu-modal-nuevo-postulante-evaluacion-rl30493',
  templateUrl: './modal-nuevo-postulante-evaluacion-rl30493.component.html',
  styleUrls: ['./modal-nuevo-postulante-evaluacion-rl30493.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ModalNuevoPostulanteEvaluacionRl30493Component implements OnInit {
    idEtapaProceso;
    form: FormGroup;
    //formBuscar: FormGroup;
    working = false;
    isMobile = false;
    nowDate = new Date();
    postulante: any = null;
    tipoDocumento: number;
    plazaFiltroSeleccionado: any;
    soloLectura:boolean;
    modal = {
        title: "",
        action: ""
    }

    combo = {
        tiposDocumentoIdentidad: [],
        nacionalidades: [],
        tiposDocumento: [],
        modalidadEducativa: [],
        nivelEducativa: [],
        areaCurricular: [],
        especialidad: []
    };

    permisoPassport = {
        buttonCrearComite: false,
        buttonModificarComite: false,
        buttonEliminarComite: false
    }

    request = {
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        nacionalidad: null,

        noTieneImpedimento: null,
        codigoPlaza: null,

	numeroExpediente: null,
	fechaExpediente: null,

	numeroExpedienteTitulo: null,
	fechaExpedienteTitulo: null,
	idModalidadEducativa: null,
	idNivelEducativo: null,
	fechaRegistroTitulo: null,

	tieneVinculacion: null,
	cumpleNormaTecnica: null
    };

    requestPostulante: any | null;
    dialogRef: any;
    documento = TipoDocumentoIdentidadEnum;
    maxLengthnumeroDocumentoIdentidad: number;
    plaza: PlazasPublicacionInformacionResponseModel = null;
    dataSourcePlazasVinculadas: any[] = [];
    idPostulacion:any;
    tieneVinculacion:boolean = false;
    numeroDocumentoIdentidad:string;

    constructor(
        public matDialogRef: MatDialogRef<ModalNuevoPostulanteEvaluacionRl30493Component>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.soloLectura = this.data.soloLectura || false;
        this.buildForm(this.data.dataForm);
        this.buildCombo();
        this.initialize();
    }
    private formatFecha = (fecha:any)=>{
        //var feExp = this.postulante.fechaExpedicionTitulo.split('/');
        //this.form.get("numeroExpedienteTitulo").setValue(this.postulante.titulo);
        //this.form.get("fechaExpedienteTitulo").setValue(new Date(feExp[2], feExp[1] - 1, feExp[0]));

	let arrayFecha = fecha.split('/');
	//let fechaFin = arrayFecha[1] + '/' + arrayFecha[0] + '/'+arrayFecha[2];
	return new Date(arrayFecha[2], arrayFecha[1] - 1, arrayFecha[0]);
    }
    ObtenerDataPersona = (postulante:any) => {
	if(postulante != null){
	    this.postulante = postulante;
	    this.form.get('tieneVinculacion').setValue(false);
	    this.tieneVinculacion = false;
	    //this.calcularEdad();
	    if (this.postulante.sancionesAdministrativas != null && 
		this.postulante.sancionesAdministrativas.length != 0){
		this.buscarSancionesAdministrativas(this.postulante);
	    }
            this.getVinculacionPostulante(postulante.numeroDocumentoIdentidad);
	}
    }
    mapForm(dataForm:any) {
	let data = this.postulante;
	this.postulante = {
	    ...data,
	    numeroDocumentoIdentidadCompleto:dataForm.documento,
	    numeroDocumentoIdentidad:dataForm.numeroDocumentoIdentidad,
	    tipoDocumento:dataForm.tipoDocumento,
	    primerApellido:dataForm.primerApellido,
	    segundoApellido:dataForm.segundoApellido,
	    nombres:dataForm.nombres,
	    descripcionGenero:dataForm.descripcionGenero,
	    fechaNacimiento:dataForm.fechaNacimiento,
	    edad:dataForm.edad,
	    descripcionNacionalidad:dataForm.descripcionNacionalidad
	};

	this.form.get("idPostulacion").setValue(dataForm.idPostulacion);
	this.form.get("numeroExpediente").setValue(dataForm.numeroExpediente);
	this.form.get("fechaExpediente").setValue(this.formatFecha(dataForm.fechaExpediente));

	this.form.get("numeroExpedienteTitulo").setValue(dataForm.titulo);
	this.form.get("fechaExpedienteTitulo").setValue(this.formatFecha(dataForm.fechaExpedicionTitulo));
	this.form.get("fechaRegistroTitulo").setValue(this.formatFecha(dataForm.fechaRegistroTitulo));

	this.form.get("idModalidadEducativa").setValue(dataForm.idModalidadEducativa);
	this.form.get("idNivelEducativo").setValue(dataForm.idNivelEducativo);
	this.form.get("cumpleNormaTecnica").setValue(dataForm.cumpleNormaTecnica);
	this.form.get("tieneVinculacion").setValue(dataForm.tieneVinculacion);
	this.tieneVinculacion = dataForm.tieneVinculacion;
	if(dataForm.tieneVinculacion){
	    //this.formBuscar.get('numeroDocumentoIdentidad').setValue(dataForm.numeroDocumentoIdentidad);
	    this.getVinculacionPostulante(dataForm.numeroDocumentoIdentidad);
	}
	this.getNivelesEducativos(dataForm.idModalidadEducativa);
	this.idPostulacion = dataForm['idPostulacion'] || null;
    }
    buildForm(dataForm:any) {
        this.form = this.formBuilder.group({
            idPostulacion: [null, Validators.nullValidator],
            numeroExpediente: [{value:null,disabled:this.soloLectura}, Validators.required],
            fechaExpediente: [{value:null,disabled:this.soloLectura}, Validators.required],

	    numeroExpedienteTitulo: [{value:null,disabled:this.soloLectura}, Validators.required],
	    fechaExpedienteTitulo: [{value:null,disabled:this.soloLectura}, Validators.required],
	    idModalidadEducativa: [{value:null,disabled:this.soloLectura}, Validators.required],
	    idNivelEducativo: [{value:null,disabled:this.soloLectura}, Validators.required],
	    fechaRegistroTitulo: [{value:null,disabled:this.soloLectura}, Validators.required],

	    tieneVinculacion: [null, Validators.required],
	    cumpleNormaTecnica: [null, Validators.required],
        });
	if(dataForm != null)
	    this.mapForm(dataForm);
    }

    buildCombo() {
        this.getDocumentoTipos();
        this.getModalidadesEducativas();
        this.getAreaCurricular();
    }
    
    defaultPermisoPassport() {
        this.permisoPassport.buttonCrearComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
        this.permisoPassport.buttonModificarComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
        this.permisoPassport.buttonEliminarComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Eliminar);
    }
    
    initialize() {
        this.modal = this.data;
        this.form.get('idModalidadEducativa').valueChanges.subscribe((value) => {
            this.combo.nivelEducativa = [];
            this.form.patchValue({ idNivelEducativo: null });
            if (value && value !== '-1') {
                this.getNivelesEducativos(value);
            }
        });
        //this.form.get('idAreaCurricular').valueChanges.subscribe((value) => {
            //this.combo.especialidad = [];
            //this.form.patchValue({ idEspecialidad: null });
            //if (value && value !== '-1') {
                //this.getEspecialidad(value);
            //}
        //});
    }

    getDocumentoTipos() {
        this.dataService.Contrataciones().getComboTipoDocumentos(CatalogoItemEnum.TIPOS_DOCUMENTOS_IDENTIDAD).pipe(
                catchError(() => {
                    this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD, SNACKBAR_BUTTON.CLOSE);
                    return of(null);
                }
            )
        )
        .subscribe((response: any) => {
            if (response) {
                this.combo.tiposDocumentoIdentidad = response;
            } else {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD, SNACKBAR_BUTTON.CLOSE);
                this.combo.tiposDocumentoIdentidad = [];
            }
        });
    }

    getModalidadesEducativas() {
        var d = {
            idModalidadEducativa: null
        };
        this.dataService.Contrataciones().getObtenerModalidadEducativa(d)
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => {})
            )
            .subscribe((response) => {
                this.combo.modalidadEducativa = [];
                if (response) {
                    this.combo.modalidadEducativa = response;
                }
            });
    }

    getNivelesEducativos(idModalidadEducativa) {
        if (!idModalidadEducativa) {
            return;
        }
        var d = {
            idModalidadEducativa: idModalidadEducativa,
            idNivelEducativo: null
        };
        this.dataService.Contrataciones().getObtenerNivelEducativo(d)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {})
            )
            .subscribe((response) => {
                this.combo.nivelEducativa = [];
                if (response) {
                    this.combo.nivelEducativa = response;
                }
            });
    }

    getAreaCurricular() {
        let d = {
            idAreaCurricular: null
        };
        this.dataService.Contrataciones().getObtenerAreaCurricular(d)
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => {})
            )
            .subscribe((response) => {
                this.combo.areaCurricular = [];
                if (response) {
                    this.combo.areaCurricular = response;
                }
            });
    }

    handleCambiarValor = (valorDocumento: number): void => {
        this.postulante = {};
        this.tipoDocumento = valorDocumento;
        //this.formBuscar.get('numeroDocumentoIdentidad').setValue('');
        this.maxLengthnumeroDocumentoIdentidad = valorDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
        //this.formBuscar.get('numeroDocumentoIdentidad').setValidators([ Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad) ]);
        
        if (valorDocumento === TipoDocumentoIdentidadEnum.CARNET_EXTRANJERIA) {
            this.getNacionalidades();
        } else {
            this.combo.nacionalidades = [];
            this.postulante = {};
        }
    }

    getNacionalidades() {
        this.dataService.Contrataciones().getComboTipoDocumentos(CatalogoItemEnum.NACIONALIDADES).pipe(
                catchError(() => {
                    this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.NACIONALIDADES, SNACKBAR_BUTTON.CLOSE);
                    return of(null);
                }
            )
        )
        .subscribe((response: any) => {
            if (response) {
                this.combo.nacionalidades = response;
            } else {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.NACIONALIDADES, SNACKBAR_BUTTON.CLOSE);
                this.combo.nacionalidades = [];
            }
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
        //const idTipoDocumento = this.formBuscar.get("idTipoDocumentoIdentidad").value;
        //const numeroDocumentoIdentidad = this.formBuscar.get("numeroDocumentoIdentidad").value;
        const usuarioModificacion = "ADMIN";

        //if (idTipoDocumento !== null) {
            //const numeroDocumento = numeroDocumentoIdentidad === "" ? null : numeroDocumentoIdentidad;
            //if (numeroDocumento !== null) {
               //this.dataService.Spinner().show("sp6");
                //this.dataService.Contrataciones()
		    //.getPostulanteByNumeroDocumento(idTipoDocumento, numeroDocumento, usuarioModificacion)
		    //.pipe(
			//catchError(() => of([])),
			//finalize(() => {
			    //this.dataService.Spinner().hide("sp6");
			//})
			//).subscribe((response: any) => {
			    //if (!response || response.length == 0) {
				//this.dataService
				    //.Message()
				    //.msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
				////this.formBuscar.get('numeroDocumentoIdentidad').setValue('');
				//this.postulante = {};
			    //} else {
				//this.postulante = response;
				//this.form.get('tieneVinculacion').setValue(false);
				//this.tieneVinculacion = false;
				//this.calcularEdad();
				//if (this.postulante.sancionesAdministrativas != null && 
				    //this.postulante.sancionesAdministrativas.length != 0){
				    //this.buscarSancionesAdministrativas(this.postulante);
				//}
			    //}
			//});
            //} else {
                //this.dataService.Message().msgWarning('"INGRESE EL NÚMERO DE DOCUMENTO."', () => { });
            //}
        //} else {
            //this.dataService.Message().msgWarning('"SELECCIONE EL TIPO DE DOCUMENTO."', () => { });
        //}
    }

    buscarSancionesAdministrativas = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalSancionPostulanteEvalExpComponent, {
            panelClass: 'modal-sancion-postulante-evaluacion-dialog',
            disableClose: true,
            data: {
                icon: "save",
                title: "Sanciones Administrativas de Postulante",
                postulante: dataPostulante
            }
        });
      
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response == 0) {
                this.form.reset();
                this.postulante = null;
            }
        });
    }

    calcularEdad() {
        const fechaNacimiento = this.postulante.fechaNacimiento.split("/");
        const fecha = fechaNacimiento[1] + "/" + fechaNacimiento[0] + "/" + fechaNacimiento[2];
        var hoy = new Date();
        var cumpleanos = new Date(fecha);
        var edad = hoy.getFullYear() - cumpleanos.getFullYear();
        var m = hoy.getMonth() - cumpleanos.getMonth();

        if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
            edad--;
        }

        if (edad > EdadMaximaEnum.EDAD_MAXIMA) {
            this.dataService.Message().msgWarning('"LA EDAD DE LA PERSONA DEBE SER MENOR A 65 AÑOS, NO SE PUEDE REGISTRAR COMO POSTULANTE."', () => { });
            this.form.reset();
            this.postulante = {};
        } else {
            this.postulante.edad = edad;
            //this.getVinculacionPostulante();
        }
    }

    getVinculacionPostulante(numeroDocumentoIdentidad:string) {
        //const numeroDocumentoIdentidad = this.formBuscar.get("numeroDocumentoIdentidad").value;

        this.dataService.Spinner().hide("sp6");
        this.dataService.Contrataciones().getVinculacionPostulanteByNumeroDocumento(numeroDocumentoIdentidad).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response && response.length != 0) {
                this.dataSourcePlazasVinculadas = response;
		this.form.get('tieneVinculacion').setValue(true);
		this.tieneVinculacion = true;
            }
        });
    }

    cargarDatosPostulante(): void {
        this.request = this.form.getRawValue();
    }

    handleGuardarNuevoPostulante = () => {
	this.form.markAllAsTouched();
        if (this.form.valid) {
            this.cargarDatosPostulante();

            if (this.request.idTipoDocumentoIdentidad == TipoDocumentoIdentidadEnum.CARNET_EXTRANJERIA && this.request.nacionalidad == null) {
                this.dataService.Message().msgWarning('"SELECCIONE LA NACIONALIDAD DEL POSTULANTE."', () => { });
            } else {
                this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA REGISTRAR AL POSTULANTE?',
                    () => {
                        this.requestPostulante = {
			    idPostulacion: this.form.get("idPostulacion").value,
                            idEtapaProceso: this.idEtapaProceso,
                            idPersona: this.postulante.idPersona,
                            idModalidadEducativa: this.form.get('idModalidadEducativa').value,
                            idNivelEducativo: this.form.get('idNivelEducativo').value,
                            numeroExpedienteTitulo: this.form.get('numeroExpedienteTitulo').value,
                            fechaExpedicionTitulo: this.form.get('fechaExpedienteTitulo').value,
                            idEstadoPostulacion: EstadoPostulacionEnum.REGISTRADO,
                            idTipoRegistro: TipoRegistroEnum.WEB,
                            edad: this.postulante.edad,
                            numeroExpediente: this.request.numeroExpediente,
                            fechaExpediente: this.request.fechaExpediente,
                            activo: true,
                            usuarioCreacion: "ADMIN",
                            codigoCentroTrabajoMaestro : this.dataService.Storage().getInformacionUsuario().codigoSede,
                            tieneVinculacion: this.form.get('tieneVinculacion').value,
                            cumpleNormaTecnica: this.form.get('cumpleNormaTecnica').value,
                            fechaRegistroTitulo: this.form.get('fechaRegistroTitulo').value,
                        };
        
                        this.dataService.Spinner().show("sp6");
                        this.dataService.Contrataciones().postGuardarContratacionEvalExpPostulante(this.requestPostulante).pipe(
                            catchError((e) => of([e])),
                            finalize(() => {
                                this.dataService.Spinner().hide("sp6");
                            })
                        )
                        .subscribe((response: any) => {
                            if (response > 0) {
                                this.dataService.Message().msgSuccess('"SE REGISTRO CORRECTAMENTE AL POSTULANTE"');
                                this.handleCancelar(ActivoFlagEnum.INACTIVO);
                            } else {
                                let r = response[0];
                                if (r.status == ResultadoOperacionEnum.InternalServerError) {
                                    this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                                } else if (r.status == ResultadoOperacionEnum.NotFound) {
                                    this.dataService.Message().msgWarning(r.message, () => { });
                                } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                                } else {
                                    this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                                }
                            }
/*
                            if (response == 0) {
                                this.dataService.Message().msgSuccess('"SE REGISTRO CORRECTAMENTE AL POSTULANTE."', () => { this.handleCancelar(ActivoFlagEnum.INACTIVO); });
                            } else {
                                this.dataService.Message().msgWarning('"OCURRIÓ UN ERROR AL TRATAR DE REGISTRAR AL POSTULANTE."', () => { });
                            }*/
                        });
                    }
                );
            }
        } else {
            this.dataService.Message().msgWarning('"VERIFICAR SI ALGÚN DATO OBLIGATORIO NO HA SIDO INGRESADO."', () => { });
        }
    }

    handleCancelar(data?: any) {
        this.matDialogRef.close(data);
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

}
