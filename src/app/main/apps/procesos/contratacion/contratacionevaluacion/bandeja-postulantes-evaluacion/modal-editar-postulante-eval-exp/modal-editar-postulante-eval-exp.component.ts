import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { ActivoFlagEnum, EdadMaximaEnum, ProcesoEtapaEnum, TipoDocumentoIdentidadEnum, TipoFormatoPlazaEnum } from '../../../_utils/constants';
import { BusquedaPlazaComponent } from '../../../components/busqueda-plaza/busqueda-plaza.component';
import { IModificarPostulanteContratacionDirecta, PlazasPublicacionInformacionResponseModel } from '../../../models/contratacion.model';
import { SelectionModel } from '@angular/cdk/collections';
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { ModalBuscarPlazaComponent } from '../../../contrataciondirecta/bandeja-postulantes/modal-buscar-plaza/modal-buscar-plaza.component';

@Component({
    selector: 'minedu-modal-editar-postulante-eval-exp',
    templateUrl: './modal-editar-postulante-eval-exp.component.html',
    styleUrls: ['./modal-editar-postulante-eval-exp.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalEditarPostulanteEvalExpComponent implements OnInit {
    form: FormGroup;
    isMobile = false;
    nowDate = new Date();
    postulante: any = {};
    plazaFiltroSeleccionado: any;
    idEtapaProceso: number;

    modal = {
        title: "",
        action: ""
    }

    combo = {
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
        noTieneImpedimento: null,
        numeroExpediente: null,
        fechaExpediente: null
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
        public matDialogRef: MatDialogRef<ModalEditarPostulanteEvalExpComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.buildForm();
        this.buildCombo();
        this.postulante = this.data.datos;
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.getVinculacionPostulante();
        let arrayFecha = this.postulante.fechaExpediente.split('/');
        let fecha = arrayFecha[1] + '/' + arrayFecha[0] + '/'+arrayFecha[2];
        this.form.get("numeroExpediente").setValue(this.postulante.numeroExpediente);
        this.form.get("fechaExpediente").setValue(fecha);
        this.form.get('idModalidadEducativa').setValue(this.postulante.idModalidadEducativa);
        this.form.get('idAreaCurricular').setValue(this.postulante.idAreaCurricular);

        var feExp = this.postulante.fechaExpedicionTitulo.split('/');
        this.form.get("numeroExpedienteTitulo").setValue(this.postulante.titulo);
        this.form.get("fechaExpedienteTitulo").setValue(new Date(feExp[2], feExp[1] - 1, feExp[0]));

        this.getNivelesEducativos(this.postulante.idModalidadEducativa);
        this.getEspecialidad(this.postulante.idAreaCurricular);

        this.form.get('idNivelEducativo').setValue(this.postulante.idNivelEducativo);
        this.form.get('idEspecialidad').setValue(this.postulante.idEspecialidad);
        
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
        this.form.get('tieneVinculacion').setValue(this.postulante.tieneVinculacion);
        this.form.get('cumpleNormaTecnica').setValue(this.postulante.cumpleNormaTecnica);
    }    

    buildForm() {
        this.form = this.formBuilder.group({
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
        this.getModalidadesEducativas();
        this.getAreaCurricular();
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

    defaultPermisoPassport() {
        this.permisoPassport.buttonCrearComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
        this.permisoPassport.buttonModificarComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
        this.permisoPassport.buttonEliminarComite = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Eliminar);
    }

    getVinculacionPostulante() {
        const numeroDocumentoIdentidad = this.postulante.numeroDocumentoIdentidad;

        this.dataService.Contrataciones().getVinculacionPostulanteByNumeroDocumento(numeroDocumentoIdentidad).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response && response.length != 0) {
                this.dataSourcePlazasVinculadas = response;
            }
        });
    }

    cargarDatosPostulante(): void {
        this.request = this.form.getRawValue();
    }

    handleModificarPostulante = () => {
        if (this.form.valid) {
            this.cargarDatosPostulante();

            this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA MODIFICAR LOS DATOS DEL POSTULANTE?',
                () => {
                    this.requestPostulante = {
                        idPostulacion: this.postulante.idPostulacion,
                        numeroExpediente: this.request.numeroExpediente,
                        fechaExpediente: new Date(this.request.fechaExpediente),
                        usuarioModificacion: "ADMIN",

                        idModalidadEducativa: this.form.get('idModalidadEducativa').value,
                        idNivelEducativo: this.form.get('idNivelEducativo').value,
                        idAreaCurricular: this.form.get('idAreaCurricular').value,
                        idEspecialidad: this.form.get('idEspecialidad').value,
                        numeroExpedienteTitulo: this.form.get('numeroExpedienteTitulo').value,
                        fechaExpedicionTitulo: this.form.get('fechaExpedienteTitulo').value
                    };
        
                    this.dataService.Spinner().show("sp6");
                    this.dataService.Contrataciones().postGuardarContratacionEvalExpPostulante(this.requestPostulante).pipe(
                        catchError(() => of([])),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response: any) => {
                        if (response > 0) {
                            this.dataService.Message().msgSuccess('"SE MODIFICÓ CORRECTAMENTE LOS DATOS DEL POSTULANTE."', () => { this.handleCancelar(ActivoFlagEnum.INACTIVO); });
                        } else {
                            this.dataService.Message().msgWarning('"OCURRIÓ UN ERROR AL TRATAR DE REGISTRAR AL POSTULANTE."', () => { });
                        }
                    });
                });
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
