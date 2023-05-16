import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { EstadoValidacionPlazaEnum, DescripcionMaestroProcesoEnum } from "../../_utils/constants";
import { ENCARGATURA_MESSAGE } from "../../_utils/message";
import { ListadoPlazaPublicadaEncargaturaComponent } from "../listado-plaza-publicada-encargatura/listado-plaza-publicada-encargatura.component";
import { MotivoRechazoConsolidadoPlazaEncargaturaComponent } from "../motivo-rechazo-consolidado-plaza-encargatura/motivo-rechazo-consolidado-plaza-encargatura.component";

@Component({
    selector: "minedu-cabecera-plaza-encargatura",
    templateUrl: "./cabecera-plaza-encargatura.component.html",
    styleUrls: ["./cabecera-plaza-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CabeceraPlazaEncargaturaComponent implements OnInit, OnChanges {
    @Input() plazaEncargatura: any;
    @Input() controlesActivos: any;
    @Input() currentSession: SecurityModel = new SecurityModel();    
    @Output() onChangeEstadoValidacionPlaza: EventEmitter<boolean>;

    loading = false;
    dialogRef: any;

    EstadoValidacionPlazaEnum=EstadoValidacionPlazaEnum;

    visibleVerMotivoRechazo = false;
    visiblePublicarPlazas = false;
    visiblePlazasPublicadas = false;
    visibleAperturarPlazas = false;
    visibleFinalizarValidacionPlazas = false;
    visiblePlazasPendienteAprobacion = false;

    constructor(private dataService: DataService, private materialDialog: MatDialog) {
        this.onChangeEstadoValidacionPlaza = new EventEmitter();
    }

    ngOnChanges(): void {
        this.initializeComponent();
    }

    ngOnInit(): void {
        //this.initializeComponent();
    }

    initializeComponent() {
        this.visibleVerMotivoRechazo = false;
        this.visiblePublicarPlazas = false;
        this.visiblePlazasPublicadas = false;
        this.visibleAperturarPlazas = false;
        this.visibleFinalizarValidacionPlazas = false;
        this.visiblePlazasPendienteAprobacion = false;
        switch (this.plazaEncargatura.codigoEstadoValidacionPlaza) {
            case EstadoValidacionPlazaEnum.Pendiente:
                this.visiblePublicarPlazas = (this.plazaEncargatura.codigoDescripcionMaestroProceso == DescripcionMaestroProcesoEnum.EncargaturaPuestoMayorResponsabilidad);
                this.visibleFinalizarValidacionPlazas = (this.plazaEncargatura.codigoDescripcionMaestroProceso > DescripcionMaestroProcesoEnum.EncargaturaPuestoMayorResponsabilidad);
                break;
            case EstadoValidacionPlazaEnum.Validado:
                this.visiblePlazasPendienteAprobacion = true;
                break;
            case EstadoValidacionPlazaEnum.Rechazado:
                this.visibleVerMotivoRechazo = true;
                this.visibleFinalizarValidacionPlazas = true;
                break;
            case EstadoValidacionPlazaEnum.Aprobado:
                this.visiblePublicarPlazas = true;
                break;
            case EstadoValidacionPlazaEnum.Publicado:
                this.visiblePlazasPublicadas = this.visibleAperturarPlazas = true;
                break;
            case EstadoValidacionPlazaEnum.Aperturado:
                this.visiblePublicarPlazas = this.visiblePlazasPublicadas = true;
                break;
            default:
                break;
        }

        this.visibleFinalizarValidacionPlazas=(this.controlesActivos.btnFinalizarValidacionPlazas==false?false:this.visibleFinalizarValidacionPlazas);
        this.visiblePublicarPlazas=(this.controlesActivos.btnPublicarPlazas==false?false:this.visiblePublicarPlazas);
        this.visibleAperturarPlazas=(this.controlesActivos.btnAperturarPlazas==false?false:this.visibleAperturarPlazas);
        this.visiblePlazasPublicadas=(this.controlesActivos.btnVerPlazasPDF==false?false:this.visiblePlazasPublicadas);
    }

    handleVerMotivoRechazo() {
        this.dialogRef = this.materialDialog.open(MotivoRechazoConsolidadoPlazaEncargaturaComponent, {
            panelClass: 'minedu-motivo-rechazo-consolidado-plaza-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idPlazaEncargatura: this.plazaEncargatura.idPlazaEncargatura
            }
        });
    }

    handleVerPlazasPublicadas() {
        debugger
        this.dialogRef = this.materialDialog.open(ListadoPlazaPublicadaEncargaturaComponent, {
            panelClass: 'minedu-listado-plaza-publicada-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idEtapaProceso: this.plazaEncargatura.idEtapaProceso,
                idDesarrolloProceso: this.plazaEncargatura.idDesarrolloProceso,
                currentSession:this.currentSession
            }
        });
    }

    handlePublicarPlaza() {
        this.dataService.Encargatura().Validarexisteplazasprepublicadas(this.plazaEncargatura).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((validaexiste) => {
            if(!validaexiste){
                this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.M12, () => {
                    this.loading = true;
                    this.dataService.Spinner().show("sp6");
                    this.dataService.Encargatura().publishPlazaEncargatura(this.plazaEncargatura).pipe(catchError((error) => {
                        this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.loading = false;
                    })).subscribe((result: any) => {
                        if (result !== null) {
                            if (result === true) {
                                this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.OPERACION_SUCCESS,3000, () => { });
                                this.onChangeEstadoValidacionPlaza.emit(true);
                            } else {
                                this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                            }
                        }
                    })
                }, () => { });
            }
            else{
                this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M155);
            }
        });
    }

    handleAperturar() {
        this.dataService.Encargatura().Validaraperturar(this.plazaEncargatura).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((validaexiste) => {
            if(!validaexiste.valida){
                this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.M157, () => {
                    this.loading = true;
                    this.dataService.Spinner().show('sp6');
                    this.dataService.Encargatura().openPlazaEncargatura(this.plazaEncargatura).pipe(catchError((error) => {
                        this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.loading = false;
                    })).subscribe((result: any) => {
                        if (result !== null) {
                            if (result === true) {
                                this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.OPERACION_SUCCESS, 3000,() => { });
                                this.onChangeEstadoValidacionPlaza.emit(this.plazaEncargatura.codigoEstadoValidacionPlaza);
                            } else {
                                this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                            }
                        }
                    })
                }, () => { });
            }
            else{
                this.dataService.Message().msgWarning(validaexiste.mensaje, () => { });
            }
        });
        
    }

    handleFinalizarValidacionPlazas() {

        this.loading = true;
        this.dataService.Spinner().show('sp6');
        this.dataService.Encargatura().validarFinalizarvalidacionPlazaEncargatura(this.plazaEncargatura).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((result: any) => {
            if (result === true ) {
                this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.M76, () => {
                    this.loading = true;
                    this.dataService.Spinner().show('sp6');
                    this.dataService.Encargatura().validationPlazaEncargatura(this.plazaEncargatura).pipe(catchError((error) => {
                        this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.loading = false;
                    })).subscribe((result: any) => {
                        if (result !== null) {
                            if (result === true) {
                                this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.OPERACION_SUCCESS,3000, () => { });
                                this.onChangeEstadoValidacionPlaza.emit(true);
                            } else {
                                this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                            }
                        }
                    })
                }, () => { });
            }
        })
    }
}