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
import { BusquedaPlazaComponent } from "../../components/busqueda-plaza/busqueda-plaza.component";
import { TipoFormatoPlazaEnum, EstadoConsolidadoPlazaEnum, SituacionPlazasEnum, EstadoValidacionPlazaEnum, TipoAccionEnum, FlujoEstadoEnum } from "../../_utils/constants";
import { ResultadoOperacionEnum } from "../../../../../../core/model/types";
import { ConsolidadoPlazasConvocarComponent } from "../components/consolidado-plazas-convocar/consolidado-plazas-convocar.component";
import { ConsolidadoPlazasObservadasComponent } from "../components/consolidado-plazas-observadas/consolidado-plazas-observadas.component";
import { RegistrarRechazoComponent } from "../components/registrar-rechazo/registrar-rechazo.component";
import { SecurityModel } from "app/core/model/security/security.model";
import { criterioBusqueda } from '../../models/criterioBusqueda.model';
import { RegimenLaboralEnum } from '../../../reasignacion/_utils/constants';
import { bandejaConsolidadoModel } from '../../models/bandejaConsolidado.model';

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
    firstTime :boolean = false;
    idDre:number;
    idUgel:number;
    codSedeCabecera:any;
    instancia:any = "SIN DATOS"; // DATOS DE PRUEBA PARA MAQUETEAR
    subinstancia:any = "SIN DATOS"; // DATOS DE PRUEBA PARA MAQUETEAR
    // estadoConsolidadoPlazas:any;
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
        esBecario: null,
        idCentroTrabajo: null,
        idPlaza: null,
        estadoAprobacion: null,
        usuarioModificacion: null,
        codigoCentroTrabajoMaestro:null,
        numeroDocumentoIdentidad: null,
        tipoDocumento: null,
        firstTime:false,
	codigoRol:null,
        anio:null,
        idIteracion:null,
        idFlujoEstado:null
    };

    currentSession: SecurityModel = new SecurityModel();
    bandejaConsolidado: bandejaConsolidadoModel = new bandejaConsolidadoModel();

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
        // this.obtenerEtapa();
        this.obtenerConsolidadoPlaza();
        // this.resetForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        //this.codSedeCabecera = this.currentSession.codigoSede;
        // this.idDre = parseInt(this.route.snapshot.params.id2);
        // this.idUgel = parseInt(this.route.snapshot.params.id23);

        this.obtenerInformacionEstadoConsolidadoPlazas(this.idConsolidadoPlaza, this.idEtapaProceso);
        this.obtenerFlujoEstado();
    }
    
  obtenerFlujoEstado (){
    let data = {
      idEtapaProceso: this.idEtapaProceso,
      codigoDre: this.currentSession.codigoSede,
      codigoTipoAccion: TipoAccionEnum.CONSOLIDADO,
      codigoEstadoInformacion: FlujoEstadoEnum.PENDIENTE,
    }
    this.dataService.Contrataciones()
    .getFlujoEstadoPorCodigoDre(data)
    .pipe(
      catchError(() => { return of(null); })
    ).subscribe(this.bandejaConsolidado.setFlujoEstado);
  }
    obtenerInformacionEstadoConsolidadoPlazas(idConsolidadoPlaza:any, idEtapaProceso:any){
        this.dataService.Contrataciones().getEstadoConsolidadoPlaza(idConsolidadoPlaza, idEtapaProceso, ).pipe(
            catchError(() => of([])),
            finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log("Datos Servicio", response)
                    this.instancia = response.nombreInstancia;
                    this.subinstancia = response.nombreSubInstancia;
                    this.codSedeCabecera = response.codigoSede;
                    this.idDre = response.idInstancias;
                    // this.estadoConsolidadoPlazas = response.estadoConsolidado;
                }
        });
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
        this.sharedService.setSharedBreadcrumb("Contratación / Plazas Consolidadas");
        this.sharedService.setSharedTitle("Listado de Plazas");
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            codigoCentroTrabajo: [null],
            plazasPara: [null]
        });
    }

    obtenerConsolidadoPlaza = () => {
        this.dataService.Contrataciones().getConsolidadoPlazaById(this.idConsolidadoPlaza).pipe(
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
        const becario = formulario.plazasPara != "-1" ? formulario.plazasPara : null;
        const codigoCentroTrabajo = formulario.codigoCentroTrabajo;
        const codigoPlaza = formulario.codigoPlaza;

        if (codigoPlaza) {
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (codigoCentroTrabajo) {
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }
        switch (this.selectedTabIndex) {
            case 0:
                this.consolidadoPlazasConvocarComponent.actualizarLista(
                    this.request = {
                        idEtapaProceso: this.idEtapaProceso,
                        idConsolidadoPlaza: this.idConsolidadoPlaza,
                        situacionValidacion: SituacionPlazasEnum.A_CONVOCAR,
                        esBecario: becario == "1" && becario != null ? true : becario == "0" && becario != null ? false : null,
                        codigoCentroTrabajo: codigoCentroTrabajo,
                        codigoPlaza: codigoPlaza,
                        idCentroTrabajo: null,
                        idPlaza: null,
                        estadoAprobacion: null,
                        usuarioModificacion: null,
                        codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                        numeroDocumentoIdentidad: this.currentSession.numeroDocumento,
                        tipoDocumento: this.currentSession.tipoNumeroDocumento,
                        firstTime: this.firstTime,
			codigoRol:this.currentSession.codigoRol,
                        anio: this.consolidadoPlaza.anio,
                        idIteracion:this.bandejaConsolidado.getIteracion(),
                        idFlujoEstado:this.bandejaConsolidado.getIdFlujoEstado()
                    }
                );
                break;
            case 1:
                this.consolidadoPlazasObservadasComponent.actualizarLista(
                    this.request = {
                        idEtapaProceso: this.idEtapaProceso,
                        idConsolidadoPlaza: this.idConsolidadoPlaza,
                        situacionValidacion: SituacionPlazasEnum.OBSERVADA,
                        esBecario: becario == "1" && becario != null ? true : becario == "0" && becario != null ? false : null,
                        codigoCentroTrabajo: codigoCentroTrabajo,
                        codigoPlaza: codigoPlaza,
                        idCentroTrabajo: null,
                        idPlaza: null,
                        estadoAprobacion: null,
                        usuarioModificacion: null,
                        codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                        numeroDocumentoIdentidad: this.currentSession.numeroDocumento,
                        tipoDocumento: this.currentSession.tipoNumeroDocumento,
                        firstTime: this.firstTime,
			codigoRol: this.currentSession.codigoRol,
                        anio: this.consolidadoPlaza.anio,
                        idIteracion:this.bandejaConsolidado.getIteracion(),
                        idFlujoEstado:this.bandejaConsolidado.getIdFlujoEstado()
                    }
                );
                break;
            default:
                break;
            }
        };
    
        obtenerEtapa = () => {
            this.dataService.Contrataciones().obtenerCabeceraEtapaProcesoById(this.idEtapaProceso).pipe(
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
            width: "1300px",
            disableClose: true,
            data: {
                action: "requerimiento",
                codigoSede : this.codSedeCabecera,
		idEtapaProceso: this.idEtapaProceso
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
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
		        idRegimenLaboral: RegimenLaboralEnum.LEY_30328,
                idEtapaProceso : this.idEtapaProceso,
		        codigoCentroTrabajo: this.codSedeCabecera
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }

    handleBuscar = () => {
        this.buscarPlazas();
    };

    handleLimpiar(): void {
        this.resetForm();
        this.buscarPlazas();
    }

    resetForm = () => {
        this.form.reset();
    };

    handleRetornar = () => {
        this.router.navigate(["../../../consolidado/" + this.idEtapaProceso], { relativeTo: this.route });
    };

    handleSelectTab = (e) => {
        this.selectedTabIndex = e.index;
        this.firstTime = true;
        this.buscarPlazas();
        this.firstTime = false;
    };

    handleAprobarPlazas = () => {
        this.request.idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.id_plaza : null;
        this.request.idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        this.request.estadoAprobacion = EstadoValidacionPlazaEnum.APROBADO;
        this.request.usuarioModificacion = this.currentSession.numeroDocumento;
        this.request.codigoCentroTrabajoMaestro = this.currentSession.codigoSede;
        this.request.numeroDocumentoIdentidad = this.currentSession.numeroDocumento;
        this.request.tipoDocumento = this.currentSession.tipoNumeroDocumento;
        this.request.codigoRol = this.currentSession.codigoRol;
        this.request.idIteracion=this.bandejaConsolidado.getIteracion(),
        this.request.idFlujoEstado=this.bandejaConsolidado.getIdFlujoEstado()

        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA APROBAR EL LISTADO DE LAS PLAZAS?",
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().aprobarConsolidadoPlazas(this.request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {});
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
