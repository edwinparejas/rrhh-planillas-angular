import { FormBuilder, FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';
import { Component, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { CriterioBusquedaModel } from '../../models/criterio.busqueda-model';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";
import { CatalogoEnum, IdTipoActividadEnum } from '../../types/Enums';
import * as moment_ from "moment";
import { MatDialog } from '@angular/material/dialog';
import { BuscarCentroTrabajoComponent } from '../buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BuscarPlazaComponent } from '../buscar-plaza/buscar-plaza.component';
import { BuscarPersonaComponent } from '../buscar-persona/buscar-persona.component';
import { EntidadSedeService } from '../../Services/entidad-sede.service';

@Component({
    selector: 'minedu-criterio-busqueda',
    templateUrl: './criterio-busqueda.component.html',
    styleUrls: ['./criterio-busqueda.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CriterioBusquedaComponent implements OnInit {
    form: FormGroup;
    model: CriterioBusquedaModel = new CriterioBusquedaModel();
    @Output() onEventBuscar = new EventEmitter<any>();
    constructor(
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private entidadSedeService: EntidadSedeService,
    ) { }

    ngOnInit(): void {
        this.buildForm();
        this.cargaDataInicial();
    }

    handleLimpiar = () => {
        this.form.reset();
        this.form.patchValue(this.model.generarForm(true))
        this.form.controls["idTipoActividad"].setValue(IdTipoActividadEnum.GENERACION_PLAZAS_ESPEJO);
    }

    handleBuscar = () => {
        const formData = this.form.getRawValue();
        if (!formData.fechaVigenciaInicio) delete formData.fechaVigenciaInicio;
        else
            formData.fechaVigenciaInicio = moment_.utc(formData.fechaVigenciaInicio).format();

        if (!formData.fechaVigenciaFin) delete formData.fechaVigenciaFin;
        else
            formData.fechaVigenciaFin = moment_.utc(formData.fechaVigenciaFin).format();
        Object.entries(formData).forEach(item => {
            if (item[1] == -1 || item[1] == null) delete formData[item[0]];
        });
        this.onEventBuscar.emit(formData);
    }

    cargaDataInicial = async () => {
        await this.obtenerDataCatalogos();
        await this.obtenerDataRegimenLaboral();
        await this.obtenerDataTipoActividad();
    }

    tipoActividadesChangeEvent() {
        this.form.patchValue({
            idRegimenLaboral: -1,
            idGrupoAccion: -1,
            idAccion: -1,
            idMotivoAccion: -1
        });
        this.model.cargarGrupoAccion([]);
        this.model.cargarAccion([]);
        this.model.cargarMotivoAccion([]);
    }

    obtenerDataRegimenLaboral = async () => {

        const { codigoRol, codigoTipoSede } = this.entidadSedeService.entidadSede;

        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getRegimenLaboral(codigoRol, codigoTipoSede)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => { })).toPromise();

        if (response) {
            this.model.cargarRegimenaLaboral(response);
        }
    };


    async obtenerDataTipoActividad() {
        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getTipoActividad()
            .pipe(
                catchError((e) => of([e])),
                finalize(() => { })).toPromise();

        if (response) {
            this.model.cargarEstadoActividad(response);
            this.form.controls["idTipoActividad"].setValue(IdTipoActividadEnum.GENERACION_PLAZAS_ESPEJO);
        }
    }

    obtenerDataGrupoAccion = async ({ value }) => {
        const idRegimenLaboral = value;
        const idTipoActividadValue = this.form.controls["idTipoActividad"].value;

        this.form.patchValue({
            idGrupoAccion: -1,
            idAccion: -1,
            idMotivoAccion: -1
        });

        this.model.cargarGrupoAccion([]);
        this.model.cargarAccion([]);
        this.model.cargarMotivoAccion([]);

        if (idTipoActividadValue == -1) {
            return;
        }


        const { codigoRol, codigoTipoSede } = this.entidadSedeService.entidadSede;

        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getGrupoAccionPorIdRegimenLaboral(codigoRol, codigoTipoSede, idTipoActividadValue, idRegimenLaboral)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => { })).toPromise();
        if (response) {
            this.model.cargarGrupoAccion(response);
        }
    };
    obtenerDataAccion = async ({ value }) => {
        const idTipoActividadValue = this.form.controls["idTipoActividad"].value;
        const idRegimenLaboral = this.form.controls['idRegimenLaboral'].value;
        const idGrupoAccion = value;
        const { codigoRol, codigoTipoSede } = this.entidadSedeService.entidadSede;


        this.form.patchValue({
            idAccion: -1,
            idMotivoAccion: -1
        });

        this.model.cargarAccion([]);
        this.model.cargarMotivoAccion([]);

        if ([codigoRol, codigoTipoSede, idTipoActividadValue, idRegimenLaboral, idGrupoAccion].includes(-1)) {
            return;
        }

        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getAccionPorRegimenYGrupoAccion(
                codigoRol,
                codigoTipoSede,
                idTipoActividadValue,
                idRegimenLaboral,
                idGrupoAccion)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => { })).toPromise();

        if (response) {
            this.model.cargarAccion(response);
        }

    };

    obtenerDataMotivoAccion = async ({ value }) => {

        const idTipoActividadValue = this.form.controls["idTipoActividad"].value;
        const idRegimenLaboral = this.form.controls['idRegimenLaboral'].value;
        const idGrupoAccion = this.form.controls['idGrupoAccion'].value;

        const { codigoRol, codigoTipoSede } = this.entidadSedeService.entidadSede;

        const idAccion = value;

        this.form.patchValue({
            idMotivoAccion: -1
        });

        this.model.cargarMotivoAccion([]);
        if ([codigoRol, codigoTipoSede, idTipoActividadValue, idRegimenLaboral, idGrupoAccion, idAccion].includes(-1)) {
            return;
        }

        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getMotivoAccionPorRegimenYGrupoAccionYAccion(
                codigoRol,
                codigoTipoSede,
                idTipoActividadValue,
                idRegimenLaboral,
                idGrupoAccion,
                value)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => { }))
            .toPromise();

        if (response) {
            this.model.cargarMotivoAccion(response);
        }

    };
    obtenerDataCatalogos = async () => {
        const codigos: number[] = [
            CatalogoEnum.TIPODOCUMENTO,
            CatalogoEnum.TIPORESOLUCION,
            CatalogoEnum.TIPOACCIONACTIVIDAD
        ];
        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getCatalogos(codigos)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => { })).toPromise();

        if (response) {
            this.model.cargarCatalogo(response);
        }
    }

    buildForm(): void {
        this.form = this.formBuilder.group(this.model.generarForm());
    }


    buscarCentroTrabajoDialogo() {
        const currentSession = this.dataService.Storage().getInformacionUsuario();
        var dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
            panelClass: 'buscar-centro-trabajo-form-dialog',
            width: "1000px",
            disableClose: true,
            data: {
                action: "requerimiento",
                currentSession: currentSession
            },
        });

        dialogRef.afterClosed()
            // .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                if (response?.centroTrabajo?.codigoCentroTrabajo) {
                    const codCentroTrabajo = response?.centroTrabajo?.codigoCentroTrabajo;
                    this.form.controls['codigoModular'].setValue(codCentroTrabajo);
                }
            });
    }


    buscarPlazaDialogo(event) {
        event.preventDefault();
        const codigoPlaza = this.form.get("codigoPlaza").value ?? null;
        // if (codigoPlaza) {
        //     this.buscarPlaza(event);
        //     return;
        // }
        const selectedTipoDoc = this.form.controls["idTipoDocumento"].value;
        const selectedRegimen = this.form.controls["idRegimenLaboral"].value;

        const dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
            panelClass: 'buscar-plaza-form-dialog',
            disableClose: true,
            data: {
                action: 'busqueda',
                idTipoDocumentoSeleccionado: selectedTipoDoc,
                idRegimenLaboralSeleccionado: selectedRegimen,
                codigoPlaza
            },
        });

        dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                // console.log('LLEGO DE PLAZA',response);
                this.form.patchValue({ codigoPlaza: response.codigoPlaza });
                this.form.get('codigoPlaza').setValue(response.codPlaza);
                // this.plaza = response;
            });
    }



    busquedaServidorPublicoPersonalizada = () => {

        const { idDre, idUgel } = this.entidadSedeService.entidadSede;

        const idTipoDocumentoIdentidad = this.form.controls["idTipoDocumento"].value;
        const numeroDocumentoIdentidad = this.form.controls["numeroDocumento"].value;

        const dialogRef = this.materialDialog.open(
            BuscarPersonaComponent,
            {
                panelClass: "buscar-persona-form-dialog",
                width: "980px",
                disableClose: true,
                data: {
                    action: "busqueda",
                    idTipoDocumentoIdentidad,
                    numeroDocumentoIdentidad,
                    idDre,
                    idUgel
                },
            }
        );
        dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const servidorPublico = resp;
                this.form.patchValue({
                    idTipoDocumento: servidorPublico.servidorPublico.idTipoDocumentoIdentidad,
                    numeroDocumento: servidorPublico.servidorPublico.numeroDocumentoIdentidad
                });
            }
        });
    };
}
