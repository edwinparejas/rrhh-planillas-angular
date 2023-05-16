import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { GrillaActividadModel } from './models/grilla-model';
import { DataService } from 'app/core/data/data.service';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, delay } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { EstadoActividadEnum, GrupoAccionEnum } from './types/Enums';
import * as moment from 'moment';
import { descargarExcel } from 'app/core/utility/functions';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalObservacionComponent } from './components/modal-observacion/modal-observacion.component';
import { VerMotivoObservacionComponent } from './components/ver-motivo-observacion/ver-motivo-observacion.component';
import { MatTabGroup } from '@angular/material/tabs';
import { EntidadSedeService } from './Services/entidad-sede.service';
import { AccionPersonalAtencionPopupComponent } from './components/informacion-accion-personal/components/popups/accion-personal-atencion-popup/accion-personal-atencion-popup.component';
import { LoadingService } from 'app/core/data/interceptors/loading.service';
import { LicenciasPopupComponent } from './components/informacion-licencias/components/popups/licencias-popup/licencias-popup.component';
import { SancionesPopupComponent } from './components/informacion-sancion/components/popups/sanciones-popup/sanciones-popup.component';
import { VacacionesPopupComponent } from './components/informacion-vacaciones/components/popups/vacaciones-popup/vacaciones-popup.component';

@Component({
    selector: 'minedu-gestion-plazaespejo',
    templateUrl: './gestion-plazaespejo.component.html',
    styleUrls: ['./gestion-plazaespejo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class GestionPlazaespejoComponent implements OnInit {
    dialogRef: any;

    grillaPendientes: GrillaActividadModel = new GrillaActividadModel();
    grillaRealizados: GrillaActividadModel = new GrillaActividadModel(true);
    redirecciones = {};

    @ViewChild("plazaEspejoTab", { static: false }) plazaEspejoTab: MatTabGroup;

    constructor(
        private dataService: DataService,
        private materialDialog: MatDialog,
        private entidadSedeService: EntidadSedeService
    ) {
        this.redirecciones[GrupoAccionEnum.LICENCIAS] = './licencias/';
        this.redirecciones[GrupoAccionEnum.DESPLAZAMIENTO] = './desplazamiento/';
    }

    ngOnInit(): void {
        this.cargarTodo();
    }



    private async cargarTodo() {
        this.configurarCargaInicial(this.grillaPendientes);
        this.cargaActividadPendientes();

        // const accionParam = this.route?.snapshot?.queryParamMap?.get('accion') ?? null;
        // if (accionParam == 'REALIZADOS') {
        //     // this.seleccionOptionAtencion({ index: 1 });
        //     const plazaEspejoTab = this.plazaEspejoTab;
        //     if (!plazaEspejoTab || !(plazaEspejoTab instanceof MatTabGroup)) return;
        //     plazaEspejoTab.selectedIndex = 1;
        // }
    }

    private configurarCargaInicial(grilla: GrillaActividadModel) {
        const { idDre, idUgel } = this.entidadSedeService.entidadSede;
        grilla.configurarDataInicial(idDre, idUgel);
    }


    get estadosPendiente() {
        return [EstadoActividadEnum.PENDIENTE]
    }

    get estadosRealizadas() {
        return [EstadoActividadEnum.ATENDIDO, EstadoActividadEnum.RECHAZADO];
    }

    get EstadoActividadEnum() {
        return EstadoActividadEnum;
    }

    buscarActividadPendientes = async (event: any) => {
        const { idDre, idUgel } = this.entidadSedeService.entidadSede;
        this.grillaPendientes.configurarRequest(
            {
                ...event, idDre, idUgel,
                paginaActual: 1
            });
        await this.cargaActividadPendientes();
    }

    buscarActividadRealizados = (event: any) => {
        // this.configurarCargaInicial(this.grillaRealizados);

        const { idDre, idUgel } = this.entidadSedeService.entidadSede;

        this.grillaRealizados.configurarRequest({ ...event, idDre, idUgel });
        this.cargaActividadRealizados();
    }

    cargaActividadRealizadosPage = (event: any) => {
        let request = this.grillaRealizados.request;
        request = {
            ...request,
            paginaActual: (event.pageIndex + 1),
            tamanioPagina: event.pageSize
        };

        this.grillaRealizados.configurarRequest(request);
        this.cargaActividadRealizados();
    }

    cargaActividadPendientesPage = (event: any) => {
        let request = this.grillaPendientes.request;
        request = {
            ...request,
            paginaActual: (event.pageIndex + 1),
            tamanioPagina: event.pageSize
        };

        this.grillaPendientes.configurarRequest(request);
        this.cargaActividadPendientes();
    }

    exportarActividadPendientes = () => {
        this.cargarExportarActividadPendientes();
    }

    exportarActividadRealizados = () => {
        this.cargarExportarActividadRealizados();
    }

    cargaActividadPendientes = async () => {
        const request = { ...this.grillaPendientes.request, estados: this.estadosPendiente }
        this.grillaPendientes.configurarRequest(request);
        this.grillaPendientes.loading = true;
        await this.cargaActividad(
            this.grillaPendientes.request,
            this.grillaPendientes.cargaDataPaginado);
        this.grillaPendientes.loading = false;
    }

    cargaActividadRealizados = async () => {
        const request = { ...this.grillaRealizados.request, estados: this.estadosRealizadas }
        this.grillaRealizados.configurarRequest(request);
        this.grillaRealizados.loading = true;
        await this.cargaActividad(
            this.grillaRealizados.request,
            this.grillaRealizados.cargaDataPaginado);
        this.grillaRealizados.loading = false;
    }

    cargarExportarActividadPendientes = () => {
        const request = { ...this.grillaPendientes.request, estados: this.estadosPendiente }
        this.grillaPendientes.configurarRequest(request);

        this.exportarActividad(
            this.grillaPendientes.request,
            this.grillaPendientes.cargaDataPaginado);
    }

    cargarExportarActividadRealizados = () => {
        const request = { ...this.grillaRealizados.request, estados: this.estadosRealizadas };
        this.grillaRealizados.configurarRequest(request);
        const _request = { ...this.grillaRealizados.request, esRealizadas: true }
        this.exportarActividad(
            _request,
            this.grillaRealizados.cargaDataPaginado,
        );
    }


    cargaActividad = async (request: any, cargarData: Function) => {
        cargarData([]);
        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getActividaPaginado(request)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => { })).toPromise();

        if (response) {
            cargarData(response);
        }
    }

    exportarActividad = async (request: any, cargarData: Function) => {
        let isSuccess = true;
        const response = await this.dataService
            .AccionesPlazaEspejo()
            .exportarActividad(request)
            .pipe(
                catchError((e) => {
                    isSuccess = false;
                    const errorMessage = e.error?.messages[0];
                    if (errorMessage) {
                        this.dataService.Message().msgWarning(`"${errorMessage?.toUpperCase()}"`);
                    }

                    return of([e]);
                }),
                finalize(() => { })).toPromise();


        if (isSuccess && response) {
            const fecha = moment().format('DDMMYYYY');
            descargarExcel(response, `PLAZAESPEJO ${fecha}.xlsx`);
        }
    }

    seleccionOptionAtencion = (event) => {
        if (event.index == 0) {
            this.configurarCargaInicial(this.grillaPendientes);
            this.cargaActividadPendientes();
        }
        if (event.index == 1) {
            this.configurarCargaInicial(this.grillaRealizados);
            this.cargaActividadRealizados();
        }
    }

    handleGoAtencion(row: any) {
        this.abrirFormulariosResolucion(row, false);
    }

    handleGoVerAtencion = (row: any) => {
        this.abrirFormulariosResolucion(row, true);
    };

    private abrirFormulariosResolucion = async (row: any, esVer = false) => {
        let component = null;
        let codigoGrupoAccion = row.codigoGrupoAccion;
        let peticion: Observable<any> = null;

        //quitar
        // codigoGrupoAccion = GrupoAccionEnum.LICENCIAS;

        switch (codigoGrupoAccion) {
            case GrupoAccionEnum.DESPLAZAMIENTO:
                peticion = this.dataService.AccionesPlazaEspejo().getDatosDesplazamiento(row.numeroResolucion);
                component = AccionPersonalAtencionPopupComponent;
                break;

            case GrupoAccionEnum.LICENCIAS:
                peticion = of(null).pipe(delay(500));
                component = LicenciasPopupComponent;
                break;

            case GrupoAccionEnum.SANCION:
                peticion = of(null).pipe(delay(500));
                component = SancionesPopupComponent;
                break;

            case GrupoAccionEnum.VACACIONES:
                peticion = of(null).pipe(delay(500));
                component = VacacionesPopupComponent;
                break;
        }

        if (!peticion) return;

        const actividadResolucion = await this.obtenerActividadResolucion(row.idActividadResolucion);

        if (!actividadResolucion) return;

        const datoRegistro = await peticion.pipe(
            catchError(() => {
                return of(null);
            }),
            finalize(() => { })
        ).toPromise();


        this.dialogRef = this.materialDialog.open(component, {
            panelClass: "minedu-plaza-espejo-popup",
            width: "980px",
            disableClose: true,
            data: {
                datoRegistro,
                actividadResolucion,
                idActividad: row.idActividad,
                idActividadResolucion: row.idActividadResolucion,
                esVer
            },
        });

        this.dialogRef.afterClosed()
            .subscribe((resp) => {
                if (resp?.refrescar) {
                    this.buscarActividadPendientes({});
                }
            });



        // let ruta = `${this.redirecciones[row.codigoGrupoAccion]}${row.idActividadResolucion}/${row.idActividad}`;
        // this.router.navigate(
        //     [ruta],
        //     {
        //         relativeTo: this.route,
        //     });
    };


    obtenerActividadResolucion = async (idActividadResolucion) => {
        let data = null;
        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getActividad(idActividadResolucion)
            .pipe(
                catchError((ex) => {
                    this.dataService.Message().msgWarning('"' + ex?.error?.messages[0]?.toUpperCase() + '"');
                    return of(null);
                }),
                finalize(() => { })).toPromise();

        if (response) {
            data = {
                fechaInicio: response.fechaVigenciaInicio,
                fechaFin: response.fechaVigenciaFin,
                tipoResolucion: response.tipoResolucion,
                numeroResolucion: response.numeroResolucion,
                fechaResolucion: response.fechaResolucion,
                regimenLaboral: response.regimenLaboral,
                idRegimenLaboral: response.idRegimenLaboral,
                grupoAccion: response.grupoAccion,
                accion: response.accion,
                motivoAccion: response.motivoAccion,
                codigoResolucion: response.codigoResolucion,
                idTipoCargoNuevo: response.idTipoCargoNuevo,
                idCargoNuevo: response.idCargoNuevo,
                idJornadaNuevo: response.idJornadaLaboralNuevo,
                motivoObservacion: response.motivoObservacion,
                codigoTipoPlazaOrigen: response.codigoTipoPlazaOrigen,
                codigoPlazaOrigen: response.codigoPlazaOrigen,
                idItemPlazaOrigen: response.idItemPlazaOrigen
            };

            return data;
        }
    }




    handleObservar = (idActividad) => {

        const dialogRef = this.materialDialog.open(ModalObservacionComponent, {
            panelClass: "minedu-modal-observacion",
            width: "600px",
            disableClose: true,
            data: {
                idActividad: idActividad
            },
        });

        dialogRef
            .afterClosed()
            .subscribe((resp) => {
                if (resp?.refrescar) {
                    this.cargaActividadPendientes();
                }
            });
    }

    handleVerObservado = async (idActividad) => {

        if (!idActividad) return;

        const actividad = await this.dataService
            .AccionesPlazaEspejo()
            .getActividad(idActividad)
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => { })
            ).toPromise();

        if (!actividad) return;

        this.dialogRef = this.materialDialog.open(VerMotivoObservacionComponent, {
            panelClass: "minedu-ver-motivo-observacion",
            width: "980px",
            disableClose: true,
            data: { actividad },
        });
    }

    async descargarResolucion(row) {
        if (row?.codigoResolucion === null || row?.codigoResolucion === '00000000-0000-0000-0000-000000000000' ||
            row?.codigoResolucion === '') {
            this.dataService.Message().msgWarning('"NO SE PUEDE OBTENER DOCUMENTO DE RESOLUCION."', () => { });
            return;
        }
        let isSuccess = true;
        var response = await this.dataService.Documento().descargar(row?.codigoResolucion)
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of(null)
                })
            ).toPromise();

        if (isSuccess && response) {
            this.handlePreviewS1(response, row?.codigoResolucion);
        } else {
            this.dataService.Message().msgWarning('"NO SE PUEDE OBTENER DOCUMENTO DE RESOLUCION."', () => { });
        }
    }

    private handlePreviewS1(file: any, codigoAdjuntoSustento: string) {
        this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Proyecto resolución',
                    file: file,
                    fileName: codigoAdjuntoSustento
                }
            }
        });


    }






}
