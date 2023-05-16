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
    selector: 'minedu-modal-nuevo-postulante-evaluacion',
    templateUrl: './modal-nuevo-postulante-evaluacion.component.html',
    styleUrls: ['./modal-nuevo-postulante-evaluacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalNuevoPostulanteEvalExpComponent implements OnInit {
    idEtapaProceso;
    form: FormGroup;
    working = false;
    isMobile = false;
    nowDate = new Date();
    postulante: any = {};
    tipoDocumento: number;
    plazaFiltroSeleccionado: any;

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
        noTieneImpedimento: null,
        numeroExpediente: null,
        fechaExpediente: null,
        codigoPlaza: null,
        nacionalidad: null,
	tieneVinculacion: null,
	cumpleNormaTecnica: null
    };

    tieneVinculacion:boolean = false;
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
        "modalidad",
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

    constructor(
        public matDialogRef: MatDialogRef<ModalNuevoPostulanteEvalExpComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.buildForm();
        this.buildCombo();
        this.initialize();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null, Validators.required],
            numeroDocumentoIdentidad: [null, Validators.required],
            nacionalidad: [null],
            numeroExpediente: [null, Validators.required],
            fechaExpediente: [null, Validators.required],

            idModalidadEducativa: [null, Validators.required],
            idNivelEducativo: [null, Validators.required],
            idAreaCurricular: [null, Validators.required],
            idEspecialidad: [null, Validators.required],
            numeroExpedienteTitulo: [null, Validators.required],
            fechaExpedienteTitulo: [null, Validators.required],

	    tieneVinculacion: [null, Validators.required],
	    cumpleNormaTecnica: [null, Validators.required]
        });
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

        this.form.get('idAreaCurricular').valueChanges.subscribe((value) => {
            this.combo.especialidad = [];
            this.form.patchValue({ idEspecialidad: null });
            if (value && value !== '-1') {
                this.getEspecialidad(value);
            }
        });
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
    getEspecialidad(idAreaCurricular) {
        let d = {
            idAreaCurricular: idAreaCurricular,
            idEspecialidad: null
        };
        this.dataService.Contrataciones().getObtenerEspecialidad(d)
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => {})
            )
            .subscribe((response) => {
                this.combo.especialidad = [];
                if (response) {
                    this.combo.especialidad = response;
                }
            });
    }

    handleCambiarValor = (valorDocumento: number): void => {
        this.postulante = {};
        this.tipoDocumento = valorDocumento;
        this.form.get('numeroDocumentoIdentidad').setValue('');
        this.maxLengthnumeroDocumentoIdentidad = valorDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
        this.form.get('numeroDocumentoIdentidad').setValidators([ Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad) ]);
        
        if (valorDocumento === TipoDocumentoIdentidadEnum.CARNET_EXTRANJERIA) {
            this.getNacionalidades();
        } else {
            this.combo.nacionalidades = [];
            this.postulante = {};
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
        // this.dataService.Contrataciones().getComboTipoDocumentos(CatalogoItemEnum.NACIONALIDADES).pipe(
        //         catchError(() => {
        //             this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.NACIONALIDADES, SNACKBAR_BUTTON.CLOSE);
        //             return of(null);
        //         }
        //     )
        // )
        // .subscribe((response: any) => {
        //     if (response) {
        //         this.combo.nacionalidades = response;
        //     } else {
        //         this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.NACIONALIDADES, SNACKBAR_BUTTON.CLOSE);
        //         this.combo.nacionalidades = [];
        //     }
        // });
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
        const usuarioModificacion =  "ADMIN";
	this.form.get('tieneVinculacion').setValue(false);
	this.tieneVinculacion = false;

        if (idTipoDocumento !== null) {
            const numeroDocumento = numeroDocumentoIdentidad === "" ? null : numeroDocumentoIdentidad;
            if (numeroDocumento !== null) {
                this.dataService.Spinner().hide("sp6");
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
                    } else {
                        this.postulante = response;
                        this.calcularEdad();
                        if (this.postulante.sancionesAdministrativas != null && 
                            this.postulante.sancionesAdministrativas.length != 0){
                            this.buscarSancionesAdministrativas(this.postulante);
                        }
                    }
                });
            } else {
                this.dataService.Message().msgWarning('"INGRESE EL NÚMERO DE DOCUMENTO."', () => { });
            }
        } else {
            this.dataService.Message().msgWarning('"SELECCIONE EL TIPO DE DOCUMENTO."', () => { });
        }
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
                this.postulante = {};
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
            this.getVinculacionPostulante();
        }
    }

    getVinculacionPostulante() {
        const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad").value;

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
        if (this.form.valid) {
            this.cargarDatosPostulante();

            if (this.request.idTipoDocumentoIdentidad == TipoDocumentoIdentidadEnum.CARNET_EXTRANJERIA && this.request.nacionalidad == null) {
                this.dataService.Message().msgWarning('"SELECCIONE LA NACIONALIDAD DEL POSTULANTE."', () => { });
            } else {
                this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA REGISTRAR AL POSTULANTE?',
                    () => {
                        this.requestPostulante = {
                            idEtapaProceso: this.idEtapaProceso,
                            idPersona: this.postulante.idPersona,
                            idModalidadEducativa: this.form.get('idModalidadEducativa').value,
                            idNivelEducativo: this.form.get('idNivelEducativo').value,
                            idAreaCurricular: this.form.get('idAreaCurricular').value,
                            idEspecialidad: this.form.get('idEspecialidad').value,
                            numeroExpedienteTitulo: this.form.get('numeroExpedienteTitulo').value,
                            fechaExpedicionTitulo: this.form.get('fechaExpedienteTitulo').value,
                            //idPlazaContratacionDetalle: this.plaza.idPlazaContratacion,                          
                            idEstadoPostulacion: EstadoPostulacionEnum.REGISTRADO,
                            idTipoRegistro: TipoRegistroEnum.WEB,
                            edad: this.postulante.edad,
                            numeroExpediente: this.request.numeroExpediente,
                            fechaExpediente: this.request.fechaExpediente,
                            activo: true,
                            usuarioCreacion: "ADMIN",
                            codigoCentroTrabajoMaestro : this.dataService.Storage().getInformacionUsuario().codigoSede,
                            //idPlazaContratacionDetalle: this.plaza.idPlazaContratacion,                        
                            tieneVinculacion: this.form.get('tieneVinculacion').value,
                            cumpleNormaTecnica: this.form.get('cumpleNormaTecnica').value,
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
