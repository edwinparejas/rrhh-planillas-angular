import {
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DataService } from "../../../../../../../core/data/data.service";
import { SharedService } from "../../../../../../../core/shared/shared.service";
import { MatDialog } from "@angular/material/dialog";
import { CollectionViewer, SelectionModel } from "@angular/cdk/collections";
import { Observable, of, BehaviorSubject } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { DataSource } from "@angular/cdk/table";
import {
    ResultadoOperacionEnum,
    TablaConfiguracionSistema,
    TipoOperacionEnum,
} from "../../../../../../../core/model/types";
import { InformacionCalificacionComponent } from "../../components/informacion-calificacion/informacion-calificacion.component";
import { saveAs } from "file-saver";
import { RegistrarCalificacionComponent } from "../../components/registrar-calificacion/registrar-calificacion.component";
import Swal from "sweetalert2";
import { RegistrarReclamoComponent } from "../../components/registrar-reclamo/registrar-reclamo.component";
import { MatPaginator } from "@angular/material/paginator";
import { RegimenLaboralEnum } from "../../../../../licencias/_utils/constants";
import {
    EstadoCalificacionEnum,
    EtapaFaseEnum,
    TipoDocumentoIdentidadEnum,
} from "../../../_utils/constants";
import { SecurityModel } from "../../../../../../../core/model/security/security.model";
import {
    ContratacionModel,
    EtapaResponseModel,
    OpcionFiltro,
} from "../../../models/contratacion.model";
import { CalificacionFinalComponent } from "../components/calificacion-otras/calificacion-otras.component";
import { mineduAnimations } from "../../../../../../../../@minedu/animations/animations";
import { BuscadorServidorPublicoComponent } from "../../../components/buscador-servidor-publico/buscador-servidor-publico.component";

@Component({
    selector: "minedu-bandeja-calificacion-otras",
    templateUrl: "./bandeja-calificacion-otras.component.html",
    styleUrls: ["./bandeja-calificacion-otras.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaCalificacionOtrasComponent implements OnInit {
    disableBrake = false;
    selection = new SelectionModel<any>(true, []);
    etapaResponse: EtapaResponseModel;
    regimenLaboral = RegimenLaboralEnum;
    currentSession: SecurityModel = new SecurityModel();
    idEtapa: number;
    form: FormGroup;
    comboLists = {
        listTipoDocumento: [],
        listInstancia: [],
        listSubInstancia: [],
        listEstadoCalificacion: [],
        listGrupoInscripcion: [],
    };
    selectedTabIndex = 0;
    maxLengthnumeroDocumentoIdentidad: number;
    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    dialogRef: any;
    idServidorPublicoSelected: number;
    @ViewChild(CalificacionFinalComponent)
    private calificacionFinalComponent: CalificacionFinalComponent;
    request = {
        idEtapa: null,
        idProceso: null,
        numeroDocumentoIdentidad: null,
        idTipoDocumentoIdentidad: null,
        idInstancia: null,
        idSubInstancia: null,
        idGrupoInscripcion: null,
        idEstadoCalificacion: null,
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog
    ) {}

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.idEtapa = this.route.snapshot.params.id;
        this.buildForm();
        this.buildSeguridad();
        this.loadTipodocumento();
        this.loadInstancia();
        this.loadEstadosCalificacion();
        this.loadGrupoInscripcion();
        this.obtenerEtapa();
        this.handleLimpiar();
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            numeroDocumentoIdentidad: [null],
            idTipoDocumentoIdentidad: [null],
            idOrigenRegistro: [null],
            idInstancia: [null],
            idSubInstancia: [null],
            idGrupoInscripcion: [null],
            idEstadoCalificacion: [null],
        });
    };

    setRequest = () => {
        this.request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            numeroDocumentoIdentidad: this.form.get("numeroDocumentoIdentidad")
                .value,
            idTipoDocumentoIdentidad: this.form.get("idTipoDocumentoIdentidad")
                .value,
            idInstancia: this.form.get("idInstancia").value,
            idSubInstancia: this.form.get("idSubInstancia").value,
            idGrupoInscripcion: this.form.get("idGrupoInscripcion").value,
            idEstadoCalificacion: this.form.get("idEstadoCalificacion").value,
        };
    };

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Calificaciones");
        this.sharedService.setSharedTitle("Desarrollo de Contratación");
    }

    handleSelectTab = (e) => {
        this.selectedTabIndex = e.index;
        this.handleBuscar();
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
                    this.handleBuscar();
                }
            });
    };

    //#region :::::::::::::::::: COMBOS ::::::::::::::
    loadTipodocumento = () => {
        this.dataService
            .Contrataciones()
            .getComboTipodocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTipoDocumento = data;
                    this.comboLists.listTipoDocumento.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadInstancia = () => {
        this.dataService
            .Contrataciones()
            .getComboInstancia()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.id,
                        label: `${x.descripcionInstancia}`,
                    }));
                    this.comboLists.listInstancia = data;
                    this.comboLists.listInstancia.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                    this.comboLists.listSubInstancia.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadSubInstancia = (idInstancia) => {
        if (idInstancia == null || idInstancia == -1) {
            this.comboLists.listSubInstancia = [];
            this.comboLists.listSubInstancia.unshift({
                value: this.opcionFiltro.item.value,
                label: this.opcionFiltro.item.label,
            });

            return;
        } else {
            this.dataService
                .Contrataciones()
                .getComboSubinstancia(idInstancia)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {})
                )
                .subscribe((response: any) => {
                    if (response && response.result) {
                        const data = response.data.map((x) => ({
                            ...x,
                            value: x.id,
                            label: `${x.descripcionSubinstancia}`,
                        }));
                        this.comboLists.listSubInstancia = data;
                        this.comboLists.listSubInstancia.unshift({
                            value: this.opcionFiltro.item.value,
                            label: this.opcionFiltro.item.label,
                        });
                        this.form
                            .get("idSubInstancia")
                            .setValue(this.opcionFiltro.item.value);
                    }
                });
        }
    };

    loadEstadosCalificacion = () => {
        this.dataService
            .Contrataciones()
            .getComboEstadosCalificacion()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listEstadoCalificacion = data;
                    this.comboLists.listEstadoCalificacion.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadGrupoInscripcion = () => {
        this.dataService
            .Contrataciones()
            .getComboGrupoInscripcion()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idGrupoInscripcion,
                        label: `${x.descripcionGrupoInscripcion}`,
                    }));
                    this.comboLists.listGrupoInscripcion = data;
                    this.comboLists.listGrupoInscripcion.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    //#endregion

    buildSeguridad = () => {
        this.currentSession = this.dataService
            .Storage()
            .getInformacionUsuario();
    };

    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
    };

    handleLimpiar = () => {
        this.form.reset();
        this.form
            .get("idTipoDocumentoIdentidad")
            .setValue(this.opcionFiltro.item.value);
        this.form
            .get("idOrigenRegistro")
            .setValue(this.opcionFiltro.item.value);
        this.form.get("idInstancia").setValue(this.opcionFiltro.item.value);
        this.form.get("idSubInstancia").setValue(this.opcionFiltro.item.value);
        this.form
            .get("idGrupoInscripcion")
            .setValue(this.opcionFiltro.item.value);
        this.form
            .get("idEstadoCalificacion")
            .setValue(this.opcionFiltro.item.value);
    };

    handleBuscar = () => {
        this.setRequest();

        if (
            this.request.idTipoDocumentoIdentidad == -1 &&
            this.request.numeroDocumentoIdentidad != null
        ) {
            this.dataService
                .Message()
                .msgWarning("Debe ingresar Tipo de documento.", () => {});
            return;
        }
        switch (this.selectedTabIndex) {
            case 0:
                this.calificacionFinalComponent.actualizarLista(this.request);
                break;

            case 1:
                this.calificacionFinalComponent.actualizarLista(this.request);
                break;

            default:
                break;
        }
    };

    busquedaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(
            BuscadorServidorPublicoComponent,
            {
                panelClass: "minedu-buscador-servidor-publico-dialog",
                width: "980px",
                disableClose: true,
                data: {
                    action: "busqueda",
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const servidorPublico = resp.servidorPublico;
                this.idServidorPublicoSelected =
                    servidorPublico.idServidorPublico;
                this.form
                    .get("idTipoDocumentoIdentidad")
                    .setValue(servidorPublico.idTipoDocumentoIdentidad);
                this.form
                    .get("numeroDocumentoIdentidad")
                    .setValue(servidorPublico.numeroDocumentoIdentidad);
            }
        });
    }

    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get("numeroDocumentoIdentidad").setValue("");
        this.maxLengthnumeroDocumentoIdentidad =
            tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;

        this.form
            .get("numeroDocumentoIdentidad")
            .setValidators([
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),
            ]);
    }

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    };
}
