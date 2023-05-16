import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { ActivoFlagEnum, TipoDocumentoIdentidadEnum } from '../../../_utils/constants';
import { IModificarPostulanteContratacionDirecta, PlazasPublicacionInformacionResponseModel } from '../../../models/contratacion.model';
import { ModalBuscarPlazaComponent } from '../modal-buscar-plaza/modal-buscar-plaza.component';

@Component({
    selector: 'minedu-modal-editar-postulante',
    templateUrl: './modal-editar-postulante.component.html',
    styleUrls: ['./modal-editar-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalEditarPostulanteComponent implements OnInit {

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

    requestPostulante: IModificarPostulanteContratacionDirecta | null;
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

    constructor(
        public matDialogRef: MatDialogRef<ModalEditarPostulanteComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.buildForm();
        this.postulante = this.data.datos;
	this.modal.title = this.data.title;
        this.idEtapaProceso = this.data.idEtapaProceso;
	if(this.postulante.tieneVinculacion)
	    this.getVinculacionPostulante();
        let arrayFecha = this.postulante.fechaExpediente.split('/');
        let fecha = arrayFecha[1] + '/' + arrayFecha[0] + '/'+arrayFecha[2];
        this.form.get("numeroExpediente").setValue(this.postulante.numeroExpediente);
        this.form.get("fechaExpediente").setValue(fecha);
        this.form.get("codigoPlaza").setValue(this.postulante.codigoPlaza);
        this.form.get("cumpleNormaTecnica").setValue(this.postulante.cumpleNormaTecnica);
    }    

    buildForm() {
        this.form = this.formBuilder.group({
            numeroExpediente: [null, Validators.required],
            fechaExpediente: [null, Validators.required],
            codigoPlaza: [null, Validators.required],
            cumpleNormaTecnica: [null, Validators.required]
        });

        setTimeout((_) => this.buscarPlaza(this.postulante.codigoPlaza));
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

    handleBuscar = () => {
        var codigo = this.form.get("codigoPlaza").value;

        if (codigo != null && codigo != "") {
            this.dataService.Spinner().show("sp6");
            this.buscarPlaza(codigo);
        } else {
            this.dataService.Message().msgWarning('"INGRESE EL CÓDIGO DE LA PLAZA A BUSCAR."', () => { });
        }
    }

    buscarPlaza = (codigoPlaza) => {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            codigoPlaza: codigoPlaza
        };

        this.dataService.Contrataciones().getContratacionDirectaPlazaByCodigo(request).pipe(catchError(() => of([])),
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
    }

    buscarPlazasContratacionPublicadas = () => {
        this.handleBuscar();
    }

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(ModalBuscarPlazaComponent, {
            panelClass: "modal-buscar-plazas-dialog",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                idEtapaProceso: this.idEtapaProceso,
                // codigoCentroTrabajoMaestro: this.passport.codigoSede

            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
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
                        idPlazaContratacionDetalle: this.plaza.idPlazaContratacion,
                        numeroExpediente: this.request.numeroExpediente,
                        fechaExpediente: new Date(this.request.fechaExpediente),
                        usuarioModificacion: "ADMIN"
                    };
        
                    this.dataService.Spinner().show("sp6");
                    this.dataService.Contrataciones().actualizarContratacionDirectaPostulante(this.requestPostulante).pipe(
                        catchError(() => of([])),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response: any) => {
                        if (response == 0) {
                            this.dataService.Message().msgAutoCloseSuccessNoButton('"SE MODIFICÓ CORRECTAMENTE LOS DATOS DEL POSTULANTE."',3000, () => { this.handleCancelar(ActivoFlagEnum.INACTIVO); });
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
