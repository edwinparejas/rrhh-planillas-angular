import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { mineduAnimations } from "../../../../../../@minedu/animations/animations";
import { BuscarCentroTrabajoComponent } from "../../contratacion/components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BusquedaPlazaComponent } from "../../contratacion/components/busqueda-plaza/busqueda-plaza.component";
import { ConsolidadoPlazasConvocarComponent } from "../../contratacion/consolizadoplaza/components/consolidado-plazas-convocar/consolidado-plazas-convocar.component";
import { ConsolidadoPlazasObservadasComponent } from "../../contratacion/consolizadoplaza/components/consolidado-plazas-observadas/consolidado-plazas-observadas.component";
import { EstadoConsolidadoPlazaEnum, EstadoValidacionPlazaEnum, RegimenLaboralEnum, SituacionPlazasEnum, TipoFormatoPlazaEnum } from "../../contratacion/_utils/constants";
import { ResultadoOperacionEnum } from "../_utils/constants";
import { BandejaPlazaConvocar } from './componentes/plazas-convocar/bandeja-plazas-convocar.component';
import { BandejaPlazasObservadas } from './componentes/plazas-observadas/bandeja-plazas-observadas.component';
import { BandejaPlazasPrePublicadas } from './componentes/plazas-prePublicadas/bandeja-plazas-prePublicadas.component';
import { BandejaPlazaResultadoFinal } from './componentes/plazas-resultadoFinal/bandeja-plaza-resultadoFinmal.component';

@Component({
    selector: 'minedu-bandeja-plazas',
    templateUrl: './bandeja-plaza.component.html',
    styleUrls: ['./bandeja-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPlazaComponent implements OnInit {

    @ViewChild(BandejaPlazasPrePublicadas) private bandejaPlazasPrePublicadas: BandejaPlazasPrePublicadas;
    @ViewChild(BandejaPlazaConvocar) private bandejaPlazaConvocar: BandejaPlazaConvocar;
    @ViewChild(BandejaPlazasObservadas) private bandejaPlazasObservadas: BandejaPlazasObservadas;
    @ViewChild(BandejaPlazaResultadoFinal) private bandejaPlazaResultadoFinal: BandejaPlazaResultadoFinal;

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
        esBecario: null,
        idCentroTrabajo: null,
        idPlaza: null,
        estadoAprobacion: null,
        usuarioModificacion: null
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private _location: Location,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService,

    ) {
    }

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.buildForm();
        this.handleResponsive();
        this.obtenerEtapa();
        this.resetForm();
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
            finalize(() => { })
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

        switch (this.selectedTabIndex) {
            case 0:
                this.bandejaPlazasPrePublicadas.listarPlazasPrePublicadas(true);
                break;
            case 1:
                this.bandejaPlazaConvocar.listarPlazasConvocar(true);
                break;
            case 2:
                this.bandejaPlazasObservadas.listarPlazasObservadas(true);
                break;
            case 3:
                this.bandejaPlazaResultadoFinal.listarPlazasResultadoFinal(true);
                break;
            default:
                break;
        }
    };

    obtenerEtapa = () => {
        this.dataService.Contrataciones().obtenerCabeceraEtapaProcesoById(this.idEtapaProceso).pipe(
            catchError(() => of([])),
            finalize(() => { })
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
            width: "1000px",
            disableClose: true,
            data: {
                action: "requerimiento",
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
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigo_plaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
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

    handleGoAscenso() {
        this._location.back();
    };

    handleSelectTab = (e) => {
        this.selectedTabIndex = e.index;
        this.buscarPlazas();
    };

    handleAprobarPlazas = () => {
        this.request.idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.id_plaza : null;
        this.request.idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        this.request.estadoAprobacion = EstadoValidacionPlazaEnum.APROBADO;
        this.request.usuarioModificacion = 'ADMIN';

        const resultMessage = '"SE APROBARON CORRECTAMENTE TODAS LAS PLAZAS LISTADAS."';
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
                            this.dataService.Message().msgSuccess(resultMessage, () => { });
                            this.obtenerConsolidadoPlaza();
                            this.buscarPlazas();
                        } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else {
                            this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL APROBAR LISTADO DE PLAZAS."', () => { });
                        }
                    });
            },
            (error) => { }
        );
    };
}
