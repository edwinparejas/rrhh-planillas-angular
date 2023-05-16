import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { ActivoFlagEnum, CatalogoItemEnum, EdadMaximaEnum, EstadoPostulacionEnum, TipoDocumentoIdentidadEnum, TipoRegistroEnum, TipoFormatoPlazaEnum, ResultadoFinalEnum } from '../../../_utils/constants';
import { IPostulanteContratacionDirecta, PlazasPublicacionInformacionResponseModel } from '../../../models/contratacion.model';
import { ModalSancionPostulanteComponent } from '../modal-sancion-postulante/modal-sancion-postulante.component';
import { ModalBuscarPlazaComponent } from '../modal-buscar-plaza/modal-buscar-plaza.component';
import { SecurityModel } from 'app/core/model/security/security.model';
import { BusquedaPlazaComponent } from '../../../components/busqueda-plaza/busqueda-plaza.component';
import { RegimenLaboralEnum } from 'app/main/apps/procesos/reasignacion/_utils/constants';
import { modalPostulante } from '../../../models/modalPostulante';
import { CONTRATACION_MESSAGE } from '../../../models/contratacionMensajes';
import { BusquedaPlazaPostulanteComponent } from '../../../components/busqueda-plaza-postulante/busqueda-plaza-postulante.component';

@Component({
    selector: 'minedu-modal-nuevo-postulante',
    templateUrl: './modal-nuevo-postulante.component.html',
    styleUrls: ['./modal-nuevo-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalNuevoPostulanteComponent implements OnInit {

    form: FormGroup;
    working = false;
    isMobile = false;
    nowDate = new Date();
    postulante: any = {};
    tipoDocumento: number;
    //plazaFiltroSeleccionado: any;
    idEtapaProceso: number;
    idFlujoEstado: number;
    currentSession: SecurityModel = new SecurityModel();
    tieneVinculacion:boolean = false;
    modal = {
        title: "",
        action: ""
    }

    combo = {
        tiposDocumentoIdentidad: [],
        nacionalidades: [],
        tiposDocumento: []
    };

    permisoPassport = {
        buttonCrearComite: false,
        buttonModificarComite: false,
        buttonEliminarComite: false
    }

    request = {
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        noTieneImpedimento: null,
        numeroExpediente: null,
        fechaExpediente: null,
        codigoPlaza: null,
        nacionalidad: null,
	cumpleNormaTecnica: null,
	tieneVinculacion:null
    };

    requestPostulante: any | null;
    dialogRef: any;
    documento = TipoDocumentoIdentidadEnum;
    maxLengthnumeroDocumentoIdentidad: number;
    plaza: PlazasPublicacionInformacionResponseModel = null;
    dataSourcePlazasVinculadas: any[] = [];
    displayedColumnsPlazas: string[] = [
        "registro",
        "instancia",
        "subInstancia",
        "centroTrabajo",
        "nivelEducativo",
        "codigoPlaza",
        "tipoPlaza",
        "regimenLaboral",
        "condicionLaboral",
        "cargo",
        "areaCurricular",
        "jornadaLaboral",
        "fechaInicio",
        "fechaFin",
    ];
    sinPasaporte:boolean=false;
    modalPostulante:modalPostulante = new modalPostulante();

    constructor(
        public matDialogRef: MatDialogRef<ModalNuevoPostulanteComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.idFlujoEstado = this.data.idFlujoEstado;
        this.buildForm();
        this.initialize();
        this.getDocumentoTipos();
        console.log("Valor inicial postulante ",this.postulante);
	this.form.get('numeroDocumentoIdentidad').disable();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null, Validators.required],
            numeroDocumentoIdentidad: [null, Validators.required],
            nacionalidad: [null],
            numeroExpediente: [null, Validators.required],
            fechaExpediente: [null, Validators.required],
            codigoPlaza: [null, Validators.required],
            cumpleNormaTecnica: [null, Validators.required]
        });
    }
    
    defaultPermisoPassport() {
        this.permisoPassport.buttonCrearComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
        this.permisoPassport.buttonModificarComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
        this.permisoPassport.buttonEliminarComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Eliminar);
    }
    
    initialize() {
        this.modal = this.data;
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
		if(this.sinPasaporte)
		{
		    this.combo.tiposDocumentoIdentidad = this.combo.tiposDocumentoIdentidad.filter(x=>x.codigo!=4);
		}
            } else {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD, SNACKBAR_BUTTON.CLOSE);
                this.combo.tiposDocumentoIdentidad = [];
            }
        });
    }

    handleCambiarValor = (valorDocumento: number): void => {
	this.postulante = {};
	this.tipoDocumento = valorDocumento;
	this.form.get('numeroDocumentoIdentidad').enable();
	this.form.get('numeroDocumentoIdentidad').setValue('');
	this.maxLengthnumeroDocumentoIdentidad = valorDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
	this.form.get('numeroDocumentoIdentidad').setValidators([ Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad) ]);

	this.form.get("nacionalidad").clearValidators();
	this.form.get("nacionalidad").setErrors(null);
	this.form.updateValueAndValidity();

	this.combo.nacionalidades = [];
	this.postulante = {};
	this.form.get('nacionalidad').setValue(null);
	if (valorDocumento === TipoDocumentoIdentidadEnum.CARNET_EXTRANJERIA) {
	    this.form.get("nacionalidad").setValidators([Validators.required]);
	    this.form.get("nacionalidad").setErrors({'required':true});
	    this.form.updateValueAndValidity();
	    this.form.get('nacionalidad').markAsUntouched();
	    this.getNacionalidades();
	} 
    }

    getNacionalidades() {
        this.dataService.Contrataciones().getPaisNacionalidad(true).pipe(
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
        const idTipoDocumento = this.form.get("idTipoDocumentoIdentidad").value;
        const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad").value;
        const usuarioModificacion = "ADMIN";


        if (idTipoDocumento !== null) {
            const numeroDocumento = numeroDocumentoIdentidad === "" ? null : numeroDocumentoIdentidad;
            if (numeroDocumento !== null) {

		let validacionDocumento = this.modalPostulante.validarDocumento(numeroDocumento, idTipoDocumento);
		if (!validacionDocumento.esValido) {
		    this.dataService.Message().msgWarning(validacionDocumento.mensaje);
		    return;
		}

                 // ************************************* VERIFICAR POSTULANTES
                this.currentSession = this.dataService.Storage().getInformacionUsuario();
                var dataValidacion = {
                    idEtapaProceso : this.idEtapaProceso,
                    numeroDocumento :  this.form.get("numeroDocumentoIdentidad").value,
                    codigoCentroTrabajoMaestro : this.currentSession.codigoSede
                };
                this.dataService.Contrataciones().getPostulanteRegistradoByNumeroDocumento(dataValidacion).pipe(
                    catchError(() => {
                        return of(null);
                    }))
                .subscribe((response: any) => {
		    this.modalPostulante.setOcultar(false);
                    if (response.respuesta) {
                        this.dataService.Message().msgAutoCloseWarning('"LA PERSONA YA SE ENCUENTRA REGISTRADO."',3000, () => { });
                        return;
                    }
                    else{

                        this.dataService.Spinner().show("sp6");
                        this.dataService.Contrataciones().getPostulanteByNumeroDocumento(idTipoDocumento, numeroDocumento, usuarioModificacion).pipe(
                            catchError(() => of([])),
                            finalize(() => {
                                this.dataService.Spinner().hide("sp6");
                            })
                        ).subscribe((response: any) => {
                            if (!response || response.length == 0) {
                                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
                                this.form.get('numeroDocumentoIdentidad').setValue('');
                                this.postulante = {};
				this.modalPostulante.setOcultar(false);
                            } else {
                                let fecha = response.fechaNacimiento.split(" ");
                                response.fechaNacimiento = fecha[0];
                                this.postulante = response;
                                if(!this.calcularEdad()) return;
                                if (this.postulante.sancionesAdministrativas != null){
                                    this.buscarSancionesAdministrativas(this.postulante);
                                }
				this.modalPostulante.setOcultar(true);
                            }
                        });

                    }

                });
                // ****************************************************************


               
            } else {
                this.dataService.Message().msgWarning('"INGRESE EL NÚMERO DE DOCUMENTO."', () => { });
            }
        } else {
            this.dataService.Message().msgWarning('"SELECCIONE EL TIPO DE DOCUMENTO."', () => { });
        }
    }

    handleKeyPressNumeroDocumento = (event:any):boolean =>{
	var respuesta = this.maxLengthnumeroDocumentoIdentidad == 8 ? this.validaNumericos(event):true;
	return respuesta;
    }

    handleKeyDownNumeroDocumento = (event:any) =>{
	if(event.key =="Delete" || event.key =="Backspace") {
	    this.modalPostulante.setOcultar(false);
	}
    }

    buscarSancionesAdministrativas = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalSancionPostulanteComponent, {
            panelClass: 'modal-sancion-postulante-dialog',
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
                this.postulante = {};
		this.plaza = null;
		this.tieneVinculacion = false;
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
	    this.modalPostulante.setOcultar(false);
	    return false;
        } else {
            this.postulante.edad = edad;
            this.getVinculacionPostulante();
	    return true
        }
    }

    getVinculacionPostulante() {
        const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad").value;
        console.log("GetVinculacion:",numeroDocumentoIdentidad);
        this.dataService.Spinner().show("sp6");
	this.tieneVinculacion=false;
        this.dataService.Contrataciones().getVinculacionPostulanteByNumeroDocumento(numeroDocumentoIdentidad).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response && response.length != 0) {
                this.dataSourcePlazasVinculadas = response;
		this.tieneVinculacion = true;
            }
        });
    }

    handleBuscar = () => {
        const codigoPlaza = this.form.get("codigoPlaza").value;

        if (codigoPlaza != null && codigoPlaza != "") {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
                codigoPlaza: codigoPlaza
            };

            this.dataService.Spinner().show("sp6");
            this.dataService.Contrataciones().getContratacionDirectaPlazaByCodigo(request).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response && response.length != 0) {
                    this.plaza = response;
                } else {
                    this.dataService.Message().msgWarning('"LA PLAZA NO SE ENCUENTRA PARA EL DESARROLLO DEL PROCESO DE CONTRATACIÓN DIRECTA."', () => { });
                    this.form.get("codigoPlaza").setValue('');
                    this.plaza = null;
                }
            });
        } else {
            this.dataService.Message().msgWarning('"INGRESE EL CÓDIGO DE LA PLAZA A BUSCAR."', () => { });
        }
    }

    buscarPlazasContratacionPublicadas = () => {
        this.handleBuscar();
    }

    busquedaPlazaPersonalizada(): void {
      this.dialogRef = this.materialDialog.open(BusquedaPlazaPostulanteComponent, {
	  panelClass: "minedu-busqueda-plaza-postulante",
	  width: "1000px",
	  disableClose: true,
	  data: {
	      action: "busqueda",
	      tipoFormato: TipoFormatoPlazaEnum.GENERAL,
	      idEtapaProceso : this.idEtapaProceso,
	      idRegimenLaboral : RegimenLaboralEnum.LEY_30328,
          codigoCentroTrabajo : this.currentSession.codigoSede,
	  codigoResultadoFinal: ResultadoFinalEnum.PENDIENTE
	  },
      });

      this.dialogRef.afterClosed().subscribe((result) => {
	  if (result != null) {
	      this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
	  }
      });
        //console.log("MOdalnuevoPostulante sesion: ",this.currentSession);
        //this.dialogRef = this.materialDialog.open(ModalBuscarPlazaComponent, {
            //panelClass: "modal-buscar-plazas-dialog",
            //width: "1000px",
            //disableClose: true,
            //data: {
                //action: "busqueda",
                //idEtapaProceso: this.idEtapaProceso,
                //codigoCentroTrabajoMaestro: this.currentSession.codigoSede
            //},
        //});
//
//
        //this.dialogRef.afterClosed().subscribe((result) => {
            //if (result != null) {
                //this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                ////this.plazaFiltroSeleccionado = { ...result.plaza };
            //}
        //});
    }

    cargarDatosPostulante(): void {
        this.request = this.form.getRawValue();
    }

    validarPuedeGuardarNuevoPostulante = ():boolean => this.form.valid && this.plaza?.codigoPlaza != null;

    handleGuardarNuevoPostulante = () => {

        if (this.validarPuedeGuardarNuevoPostulante()) {
            this.cargarDatosPostulante();

            if (this.request.idTipoDocumentoIdentidad == TipoDocumentoIdentidadEnum.CARNET_EXTRANJERIA && this.request.nacionalidad == null) {
                this.dataService.Message().msgWarning('"SELECCIONE LA NACIONALIDAD DEL POSTULANTE."', () => { });
            } else {
                this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA REGISTRAR AL POSTULANTE?',
                    () => {
                        this.requestPostulante = {
                            idEtapaProceso: this.idEtapaProceso,
                            idPersona: this.postulante.idPersona,
                            idPlazaContratacionDetalle: this.plaza.idPlazaContratacion,                          
                            idEstadoPostulacion: EstadoPostulacionEnum.REGISTRADO,
                            idTipoRegistro: TipoRegistroEnum.WEB,
                            edad: this.postulante.edad,
                            numeroExpediente: this.request.numeroExpediente,
                            fechaExpediente: this.request.fechaExpediente,
                            activo: true,
                            usuarioCreacion: "ADMIN",
                            codigoCentroTrabajoMaestro : this.dataService.Storage().getInformacionUsuario().codigoSede,
			    cumpleNormaTecnica:this.request.cumpleNormaTecnica,
			    tieneVinculacion:this.tieneVinculacion,
			    idNacionalidad:this.request.nacionalidad,
			    idTipoDocumento:this.request.idTipoDocumentoIdentidad,
			    idFlujoEstado:this.idFlujoEstado
                        };
        
                        this.dataService.Spinner().show("sp6");
                        this.dataService.Contrataciones()
		            .registrarContratacionDirectaPostulante(this.requestPostulante)
			    .pipe(
                            catchError(() => of([])),
                            finalize(() => { this.dataService.Spinner().hide("sp6"); })
                        ).subscribe((response: any) => {
                            if (response > 0) {
                                this.dataService
				    .Message()
				    .msgAutoCloseSuccessNoButton('"SE REGISTRO CORRECTAMENTE AL POSTULANTE."',3000, () => {
					this.handleCancelar(ActivoFlagEnum.INACTIVO); 
				    });
                            } else {
                                this.dataService
				    .Message()
				    .msgWarning('"OCURRIÓ UN ERROR AL TRATAR DE REGISTRAR AL POSTULANTE."', () => { });
                            }
                        });
                    }
                );
            }
        } else {
            // this.dataService.Message().msgWarning('"VERIFICAR SI ALGÚN DATO OBLIGATORIO NO HA SIDO INGRESADO."', () => { }); 
            this.dataService.Message().msgWarning(CONTRATACION_MESSAGE.M08_FRM_COMPLETAR_DATOS, () => { }); // M08
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
