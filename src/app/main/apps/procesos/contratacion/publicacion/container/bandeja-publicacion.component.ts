import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, finalize, takeUntil, filter, find } from "rxjs/operators";
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import {
    EtapaResponseModel,
    ConsolidadoPlazaModel,
    ResumenPlazasResponseModel,
} from "../../models/contratacion.model";
import { PlazasPublicacionComponent } from "../components/plazas-publicacion/plazas-publicacion.component";
import { PlazasConvocarComponent } from "../components/plazas-convocar/plazas-convocar.component";
import { PlazasObservadasComponent } from "../components/plazas-observadas/plazas-observadas.component";
import { MatDialog } from "@angular/material/dialog";
import { BusquedaPlazaComponent } from "../../components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { TablaPermisos } from "app/core/model/types";
import { SecurityModel } from "app/core/model/security/security.model";
import { CentroTrabajoModel } from "app/core/model/centro-trabajo.model";
import { SharedService } from "../../../../../../core/shared/shared.service";
import {
    RegimenLaboralEnum,
    EstadoConsolidadoPlazaEnum,
    TipoFormatoPlazaEnum,
} from "../../_utils/constants";
import { PlazasResultadoFinalComponent } from "../components/plazas-resultado-final/plazas-resultado-final.component";
import { ResultadoOperacionEnum } from "../../../../../../core/model/types";
import { criterioBusqueda } from "../../models/criterioBusqueda.model";

@Component({
    selector: "minedu-bandeja-publicacion",
    templateUrl: "./bandeja-publicacion.component.html",
    styleUrls: ["./bandeja-publicacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPublicacionComponent implements OnInit {
    form: FormGroup;
    etapaResponse: EtapaResponseModel;
    idEtapa: number;
    @ViewChild(PlazasPublicacionComponent)
    private plazasPublicacionComponent: PlazasPublicacionComponent;
    @ViewChild(PlazasConvocarComponent)
    private plazasConvocarComponent: PlazasConvocarComponent;
    @ViewChild(PlazasObservadasComponent)
    private plazasObservadasComponent: PlazasObservadasComponent;
    @ViewChild(PlazasResultadoFinalComponent)
    private plazasResultadoFinalComponent: PlazasResultadoFinalComponent;
    dialogRef: any;
    selectedTabIndex = 0;
    consolidadoPlaza: ConsolidadoPlazaModel;
    regimenLaboral = RegimenLaboralEnum;
    estadoConsolidadoPlaza = EstadoConsolidadoPlazaEnum;
    resumenPlazas: ResumenPlazasResponseModel;

    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
    };
    currentSession: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;
    working = false;

    request = {
        idProceso: null,
        idEtapa: null,
        idDre: null,
        idUgel: null,
        codigoPlaza: null,
        codigoCentroTrabajo: null,
        idResumenPlaza: null,
    };

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
        this.idEtapa = this.route.snapshot.params.id;
        this.buildForm();
        this.buildSeguridad();
        this.obtenerEtapa();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            codigoCentroTrabajo: [null],
        });
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb(
            "Contratación / Publicación de plazas"
        );
        this.sharedService.setSharedTitle("Desarrollo de Contratación");
    }

    handleBuscar = () => {
        this.buscarPlazas();
        this.obtenerResumenPlazas();
    };

    handleSelectTab = (e) => {
        this.selectedTabIndex = e.index;
        this.buscarPlazas();
    };

    setRequest(): void {
        this.request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            idDre: this.centroTrabajo.idDre,
            idUgel: this.centroTrabajo.idUgel,
            codigoPlaza: this.form.get("codigoPlaza").value,
            codigoCentroTrabajo: this.form.get("codigoCentroTrabajo").value,
            idResumenPlaza:
                this.consolidadoPlaza?.idResumenPlaza != null
                    ? this.consolidadoPlaza?.idResumenPlaza
                    : 0,
        };
    }

    buscarPlazas = () => {
        if (this.consolidadoPlaza == null) {
            this.dataService
                .Message()
                .msgWarning("No se ha definido consolizado plaza.", () => {});
            return;
        }
        this.setRequest();
        if (this.request.codigoPlaza) {
            const codigoPlaza: string = this.request.codigoPlaza;
            let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(codigoPlaza);
                if (!validacionCodigoPlaza.esValido) {
                    this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                    return;
                }
            }

          if (this.request.codigoCentroTrabajo) {
              const codigoCentroTrabajo: string = this.request.codigoCentroTrabajo;
          let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(codigoCentroTrabajo);
              if (!validacionCodigoTrabajo.esValido) {
                  this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                  return;
              }
          }
        /*
        if (this.request.codigoPlaza != null) {
            const codigoPlaza: string = this.request.codigoPlaza;
            if (codigoPlaza.length < 12) {
                this.dataService
                    .Message()
                    .msgWarning(
                        "Código no válido, debe ingresar un código de plaza con doce (12) dígitos.",
                        () => {}
                    );
                return;
            }
        }

        if (this.request.codigoCentroTrabajo != null) {
            const codigoCentroTrabajo: string =
                this.request.codigoCentroTrabajo;
            if (codigoCentroTrabajo.length < 7) {
                this.dataService
                    .Message()
                    .msgWarning(
                        "Código modular no válido, debe ingresar un número con siete (7) dígitos.",
                        () => {}
                    );
                return;
            }
        }*/

        this.obtenerResumenPlazas();
        switch (this.selectedTabIndex) {
            case 0:
                this.plazasPublicacionComponent.actualizarLista(this.request);
                break;

            case 1:
                this.plazasConvocarComponent.actualizarLista(this.request);
                break;

            case 2:
                this.plazasObservadasComponent.actualizarLista(this.request);
                break;

            case 3:
                this.plazasResultadoFinalComponent.actualizarLista(
                    this.request
                );
                break;

            default:
                break;
        }
    };

    obtenerEtapa = () => {
        this.dataService
            .Contrataciones()
            .obtenerCabeceraEtapaProcesoById(this.idEtapa)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.etapaResponse = response.data;
                    this.loadCentroTrabajo();
                }
            });
    };

    obtenerResumenPlazas = () => {
        this.dataService
            .Contrataciones()
            .getResumenPlazas(this.request)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.resumenPlazas = response.data;
                }
            });
    };

    obtenerConsolidadoPlaza = (etapa: EtapaResponseModel) => {
        console.log("etapa", etapa);
        const request = {
            idProceso: etapa.idProceso,
            idEtapa: etapa.idEtapa,
            idDre: this.centroTrabajo.idDre,
            idUgel: this.centroTrabajo.idUgel,
        };
        this.dataService
            .Contrataciones()
            .getConsolidadoPlaza(request)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((resp: any) => {
                if (resp && resp.result) {
                    this.consolidadoPlaza = resp.data;
                    this.buscarPlazas();
                    this.obtenerResumenPlazas();
                }
            });
    };

    handleLimpiar(): void {
        this.resetForm();
    }

    resetForm = () => {
        this.form.reset();
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
            },
        });

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const plaza = resp.plazaSelected;
                this.form.get("codigoPlaza").setValue(plaza.codigoPlaza.trim());
            }
        });
    }

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1300px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form
                    .get("codigoCentroTrabajo")
                    .setValue(result.centroTrabajo.codigoCentroTrabajo);
            }
        });
    };

    handleEnviar = () => {
        const request = {
            idResumenPlaza: this.consolidadoPlaza.idResumenPlaza,
            usuarioRegistro: this.currentSession.numeroDocumento,
        };

        const resultMessage = "Operación realizada de forma exitosa.";
        this.dataService.Message().msgConfirm(
            "¿Está seguro de que desea validar y enviar las plazas?",
            () => {
                this.working = true;
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Contrataciones()
                    .enviarConsolidadoPlazas(request)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                            this.working = false;
                        })
                    )
                    .subscribe((response) => {
                        if (response && response.result) {
                            this.dataService
                                .Message()
                                .msgInfo(resultMessage, () => {});
                            this.obtenerConsolidadoPlaza(this.etapaResponse);
                        } else if (
                            response &&
                            response.statusCode ===
                                ResultadoOperacionEnum.NotFound
                        ) {
                            this.dataService
                                .Message()
                                .msgWarning(response.messages[0], () => {});
                        } else if (
                            response &&
                            response.statusCode ===
                                ResultadoOperacionEnum.UnprocessableEntity
                        ) {
                            this.dataService
                                .Message()
                                .msgWarning(response.messages[0], () => {});
                        } else {
                            this.dataService
                                .Message()
                                .msgError(
                                    "Ocurrieron algunos problemas al envíar consolizado plaza.",
                                    () => {}
                                );
                        }
                    });
            },
            (error) => {}
        );
    };

    handlePublicar = () => {
        const request = {
            idResumenPlaza: this.consolidadoPlaza.idResumenPlaza,
            usuarioRegistro: this.currentSession.numeroDocumento,
        };

        const resultMessage = "Operación realizada de forma exitosa.";
        const confirmationMessage =
            "<strong>¿Está seguro de que desea publicar la lista?</strong><br>Al publicar el listado de plazas no podrá agregar modificar y/o eliminar plazas para este proceso posteriormente.";

        this.dataService.Message().msgConfirm(
            confirmationMessage,
            () => {
                this.working = true;
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Contrataciones()
                    .publicarPlazas(request)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                            this.working = false;
                        })
                    )
                    .subscribe((response) => {
                        if (response && response.result) {
                            this.dataService
                                .Message()
                                .msgInfo(resultMessage, () => {});
                            this.obtenerConsolidadoPlaza(this.etapaResponse);
                        } else if (
                            response &&
                            response.statusCode ===
                                ResultadoOperacionEnum.NotFound
                        ) {
                            this.dataService
                                .Message()
                                .msgWarning(response.messages[0], () => {});
                        } else if (
                            response &&
                            response.statusCode ===
                                ResultadoOperacionEnum.UnprocessableEntity
                        ) {
                            this.dataService
                                .Message()
                                .msgWarning(response.messages[0], () => {});
                        } else {
                            this.dataService
                                .Message()
                                .msgError(
                                    "Ocurrieron algunos problemas al publicar plazas.",
                                    () => {}
                                );
                        }
                    });
            },
            (error) => {}
        );
    };

    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
    };

    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = true;
        this.currentSession = this.dataService
            .Storage()
            .getInformacionUsuario();
    };

    loadCentroTrabajo = () => {
        const codigoCentroTrabajo = this.currentSession.codigoSede;
        this.dataService
            .Contrataciones()
            .getCentroTrabajoByCodigo(codigoCentroTrabajo, true)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.centroTrabajo = response.data;
                    this.obtenerConsolidadoPlaza(this.etapaResponse);
                }
            });
    };
}
