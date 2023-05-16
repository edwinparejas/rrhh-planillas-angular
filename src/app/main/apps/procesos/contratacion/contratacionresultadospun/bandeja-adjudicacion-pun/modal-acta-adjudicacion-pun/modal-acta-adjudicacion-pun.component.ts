import { Component, OnInit, ViewEncapsulation, Inject, QueryList, ViewChild } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import {  EtapaResponseModel } from '../../../models/contratacion.model';
import { SecurityModel } from '../../../../../../../core/model/security/security.model';
import { DocumentViewerComponent } from '../../../../../components/document-viewer/document-viewer.component';
import { saveAs } from 'file-saver';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { MensajesSolicitud } from "../../../_utils/constants";

@Component({
    selector: 'minedu-modal-acta-adjudicacion-pun',
    templateUrl: './modal-acta-adjudicacion-pun.component.html',
    styleUrls: ['./modal-acta-adjudicacion-pun.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalActaAdjudicacionPUNComponent implements OnInit {

    form: FormGroup;
    adjudicacion: any;
    idPersona: any;
    dialogRef: any;
    estadoPlaza = 0;
    working = false;
    isMobile = false;
    totalregistro = 0;
    dataSourceActasAdjudicadas: ActasAdjudicadasDataSource | null;
    
    displayedColumnsActasAdjudicadas: string[] = [
        "registro",
        "codigo_plaza",
        "acciones",
    ];

    request = {
        idAdjudicacion: null
    };

    etapaResponse: EtapaResponseModel;
    passport: SecurityModel = new SecurityModel();
    
    constructor(
        public matDialogRef: MatDialogRef<ModalActaAdjudicacionPUNComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) { 
        this.adjudicacion = data.adjudicacion;
        this.idPersona = data.adjudicacion.idPersona;
        this.etapaResponse = data.etapaResponse;
        this.passport = data.passport;
    }

    ngOnInit(): void {
        this.buildGrids();
        this.handleResponsive();
        setTimeout(() => {
            this.handleBuscarActasAdjudicacion();
        });
    }

    ngAfterViewInit() {
    }

    buildGrids(): void {
        this.dataSourceActasAdjudicadas = new ActasAdjudicadasDataSource(this.dataService);
    }

    setRequest(): void {
        this.request = {
            idAdjudicacion: this.adjudicacion.idAdjudicacion
        };
    }

    handleBuscarActasAdjudicacion = () => {
        this.setRequest();
        this.dataSourceActasAdjudicadas.load(this.request);
    };

    handleCancelar(data?: any) {
        if (data) {
            this.matDialogRef.close({ plazas: data });
        } else {
            data = "0";
            this.matDialogRef.close();
        }        
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    handleGenerarPDF = (d) => {
        this.dataService.Spinner().show("sp6");
        const requestGenerarPdf: any = {
            idAdjudicacionDetalle: d.idAdjudicacionDetalle,
            usuarioCreacion: this.passport.numeroDocumento,
            maestroProceso: this.etapaResponse.descripcionTipoProceso,
            descripcionEtapa: this.etapaResponse.descripcionEtapa,
            descripcionTipoSede:this.passport.descripcionTipoSede,
            nombreSede:this.passport.nombreSede,
            codigoPlaza:d.codigoPlaza,
            codigoCentroTrabajoMaestro:this.passport.codigoSede,
        };

        this.dataService.Contrataciones().getGenerarPdfActaAdjudicacionResultadosPUN(requestGenerarPdf).pipe(
            catchError((e) => of([e])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        ).subscribe((response: any) => {
            let r = response[0];
            if (r == null) {
                const plazasFile = response.file;
                this.handleVerActaAdjudicacion(plazasFile);
            } else {
                if (r.status == ResultadoOperacionEnum.InternalServerError) {
                    this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                } else if (r.status == ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(r.message, () => { });
                } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                } else {
                    this.dataService.Message().msgError(MensajesSolicitud.ERROR_PDF, () => { });
                }
            }
        });
    }

    handleVerActaAdjudicacion(file: string) {
        if (!file) {
            this.dataService.Message().msgWarning('No se pudo generar el acta de adjucación.', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(file).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('Error, no se pudo acceder al servicio.', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                this.handlePreview(response, "Acta_Adjudicacipn_Resultados_PUN");
            } else {
                this.dataService.Message().msgWarning('No se pudo obtener el acta de adjucación.', () => { });
            }
        });
    }

    handlePreview(file: any, nameFile: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Acta de Adjudicación Contratación Resultados PUN",
                    file: file
                }
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                if (response.download) {
                    saveAs(file, nameFile + ".pdf");
                }
            }
        );
    }

    resetForm = () => {
        this.form.reset();
    };

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

export class ActasAdjudicadasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idAdjudicacion === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Contrataciones().getBuscarActasAdjudicadasPaginado(data).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
            });
        }
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalregistro;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}
