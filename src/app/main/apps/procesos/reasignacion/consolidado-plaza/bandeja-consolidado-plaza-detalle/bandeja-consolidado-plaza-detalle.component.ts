import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { BuscarCentroTrabajoComponent } from "../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BuscarPlazaComponent } from "../../components/buscar-plaza/buscar-plaza.component";
import { TipoFormatoPlazaEnum, EstadoConsolidadoPlazaEnum, SituacionPlazasEnum, EstadoValidacionPlazaEnum, MENSAJES } from "../../_utils/constants";
import { ResultadoOperacionEnum } from "../../../../../../core/model/types";
import { ConsolidadoPlazasConvocarComponent } from "../components/consolidado-plazas-convocar/consolidado-plazas-convocar.component";
import { ConsolidadoPlazasObservadasComponent } from "../components/consolidado-plazas-observadas/consolidado-plazas-observadas.component";
import { RegistrarRechazoComponent } from "../components/registrar-rechazo/registrar-rechazo.component";
import { SecurityModel } from "app/core/model/security/security.model";

@Component({
    selector: "minedu-bandeja-consolidado-plaza-detalle",
    templateUrl: "./bandeja-consolidado-plaza-detalle.component.html",
    styleUrls: ["./bandeja-consolidado-plaza-detalle.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaConsolidadoPlazaDetalleComponent implements OnInit {

    @ViewChild(ConsolidadoPlazasConvocarComponent) private consolidadoPlazasConvocarComponent: ConsolidadoPlazasConvocarComponent;
    @ViewChild(ConsolidadoPlazasObservadasComponent) private consolidadoPlazasObservadasComponent: ConsolidadoPlazasObservadasComponent;
    etapaResponse: any = {};
    idEtapaProceso: number;
    idConsolidadoPlaza: number;
    form: FormGroup;
    isMobile = false;
    becario: string;
    consolidadoPlaza: any = {};
    estadoConsolidadoPlaza = EstadoConsolidadoPlazaEnum;
    centroTrabajoFiltroSeleccionado: any;
    plazaFiltroSeleccionado: any;
    dialogRef: any;
    selectedTabIndex = 0;
    request = {
        idEtapaProceso: null,
        idConsolidadoPlaza: null,
        situacionValidacion: null,
        codigoCentroTrabajo: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        idPlaza: null,
        estadoAprobacion: null,
        usuarioModificacion: null,
        codigoCentroTrabajoMaestro:null,
        numeroDocumentoIdentidad: null,
        tipoDocumento: null,
    };

    currentSession: SecurityModel = new SecurityModel();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) {}

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.idConsolidadoPlaza = parseInt(this.route.snapshot.params.id1);
        this.buildForm();
        this.handleResponsive();
        this.obtenerEtapa();
        this.obtenerConsolidadoPlaza();
        this.resetForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
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

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Reasignación / Plazas Consolidadas");
        this.sharedService.setSharedTitle("Listado de Plazas");
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            codigoCentroTrabajo: [null]
            // plazasPara: [null]
        });
    }

    obtenerConsolidadoPlaza = () => {
            this.dataService.Reasignaciones().getConsolidadoPlazaById(this.idConsolidadoPlaza).pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                this.consolidadoPlaza = response;
                this.buscarPlazas();
            }
        });
    };

    buscarPlazas = () => {
        const formulario = this.form.getRawValue();
        const codigoCentroTrabajo = formulario.codigoCentroTrabajo;
        const codigoPlaza = formulario.codigoPlaza;

        switch (this.selectedTabIndex) {
            case 0:
                this.consolidadoPlazasConvocarComponent.actualizarLista(
                    this.request = {
                        idEtapaProceso: this.idEtapaProceso,
                        idConsolidadoPlaza: this.idConsolidadoPlaza,
                        situacionValidacion: SituacionPlazasEnum.A_CONVOCAR,
                        codigoCentroTrabajo: codigoCentroTrabajo,
                        codigoPlaza: codigoPlaza,
                        idCentroTrabajo: null,
                        idPlaza: null,
                        estadoAprobacion: null,
                        usuarioModificacion:  this.currentSession.numeroDocumento,
                        codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                        numeroDocumentoIdentidad: this.currentSession.numeroDocumento,
                        tipoDocumento: this.currentSession.tipoNumeroDocumento,
                    }
                );
                break;
            case 1:
                this.consolidadoPlazasObservadasComponent.actualizarLista(
                    this.request = {
                        idEtapaProceso: this.idEtapaProceso,
                        idConsolidadoPlaza: this.idConsolidadoPlaza,
                        situacionValidacion: SituacionPlazasEnum.OBSERVADA,
                        codigoCentroTrabajo: codigoCentroTrabajo,
                        codigoPlaza: codigoPlaza,
                        idCentroTrabajo: null,
                        idPlaza: null,
                        estadoAprobacion: null,
                        usuarioModificacion: this.currentSession.numeroDocumento,
                        codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                        numeroDocumentoIdentidad: this.currentSession.numeroDocumento,
                        tipoDocumento: this.currentSession.tipoNumeroDocumento,
                    }
                );
                break;
            default:
                break;
        }
    };

    obtenerEtapa = () => {
            this.dataService.Reasignaciones().getDatosProcesoEtapaById(this.idEtapaProceso).pipe(            
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response && response.result) {
                this.etapaResponse = response.data;
            }
        });
    };

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
            panelClass: "buscar-centro-trabajo-dialog",
            width: "1200px",
            disableClose: true,
            data: {
                action: "requerimiento",
                tipoSede: this.currentSession.codigoTipoSede,
                codigoSede: this.currentSession.codigoSede
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
                this.centroTrabajoFiltroSeleccionado = { ...result.centroTrabajo };
            }
        });
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
            panelClass: "buscar-plaza-form",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.codigoPlaza.trim());      
            }
        });
    }

    handleBuscar = () => {
        this.buscarPlazas();
    };

    handleLimpiar(): void {
        this.resetForm();
    }

    resetForm = () => {
        this.form.reset();
    };

    handleRetornar = () => {
        this.router.navigate(["../../../consolidado/" + this.idEtapaProceso], { relativeTo: this.route });
    };

    handleSelectTab = (e) => {
        this.selectedTabIndex = e.index;
        this.buscarPlazas();
    };

    handleAprobarPlazas = () => {
        this.request.idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.id_plaza : null;
        this.request.idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        this.request.estadoAprobacion = EstadoValidacionPlazaEnum.APROBADO;
        this.request.usuarioModificacion = this.currentSession.numeroDocumento;

        const resultMessage = '"SE APROBARON CORRECTAMENTE TODAS LAS PLAZAS LISTADAS."';
        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA APROBAR EL LISTADO DE LAS PLAZAS?",
            () => {
                this.dataService.Spinner().show("sp6");
                    this.dataService.Reasignaciones().aprobarConsolidadoPlazas(this.request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {});
                        this.obtenerConsolidadoPlaza();
                        this.buscarPlazas();
                    } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => {});
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => {});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL APROBAR LISTADO DE PLAZAS."', () => {});
                    }
                });
            },
            (error) => {}
        );
    };

    handleRechazarPlazas = () => {
        this.dialogRef = this.materialDialog.open(RegistrarRechazoComponent, {
            panelClass: "minedu-registrar-rechazo",
            width: "700px",
            disableClose: true,
            data: {
                action: "rechazoDetalle",
                request: this.request,
            },
        });

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.obtenerConsolidadoPlaza();
            }
        });
    };
}
