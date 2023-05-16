import { SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { InformacionDocumentoSustentoComponent} from "../../../components/informacion-documento-sustento/informacion-documento-sustento.component"

@Component({
    selector: "minedu-informacion-motivo-nopublicacion",
    templateUrl: "./informacion-motivo-nopublicacion.component.html",
    styleUrls: ["./informacion-motivo-nopublicacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionMotivoNopublicacionComponent implements OnInit {
    motivoNoPublicacion = null;

    displayedColumns: string[] = [
        "tipoDocumentoSustento",
        "numeroDocumentoSustento",
        "tipoFormatoSustento",
        "numeroFolios",
        "fechaEmision",
        "fechaRegistro",
        "opciones",
    ];
    private _loadingChange = new BehaviorSubject<boolean>(false);
    loading = this._loadingChange.asObservable();
    dataSource: MatTableDataSource<any>;
    selection = new SelectionModel<any>(false, []);

    dialogRef: any;

    constructor(
        public matDialogRef: MatDialogRef<InformacionMotivoNopublicacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private materialDialog: MatDialog,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.buildForm();
        }, 0);
    }

    buildForm() {
        this.dataSource = new MatTableDataSource([]);
        setTimeout(() => {
            this.getMotivoNoPublicacion();
        }, 0);
    }

    private getMotivoNoPublicacion() {
        const { idPlazaReasignacion, idPlazaReasignacionDetalle } = this.data;

        this.dataService.Spinner().show("sp6");
        this.dataService
            .Reasignaciones()
            .getMotivoNoPublicacionPlazaReasignacion(
                idPlazaReasignacion,
                idPlazaReasignacionDetalle
            )
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if (response) {
                    const { motivo, sustentos } = response;
                    if (!motivo) {
                        this.handleCancelar();
                    }
                    this.motivoNoPublicacion = motivo;
                    this.dataSource = new MatTableDataSource(sustentos);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            "Error inesperado en el servidor. Inténtelo en unos segundos, si el error persiste comuníquese con el administrador del sistema.",
                            () => {}
                        );
                }
            });
    }

    handleInformacion(row) {
        this.dialogRef = this.materialDialog.open(
            InformacionDocumentoSustentoComponent,
            {
                panelClass: "documento-sustento-informacion",
                disableClose: true,
                data: { documento: row },
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    }

    handleVerAdjunto(row) {
        if (!row.codigoAdjunto) {
            this.dataService
                .Message()
                .msgWarning(
                    "EL REGISTRO NO TIENE DOCUMENTO DE SUSTENTO ADJUNTADO.",
                    () => {}
                );
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(row.codigoAdjunto)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                if (response) {
                    this.handlePreview(response, row.codigoAdjunto);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            "NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO.",
                            () => {}
                        );
                }
            });
    }

    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Documento de sustento",
                    file: file,
                    fileName: codigoAdjuntoSustento,
                },
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    }

    handleCancelar(data?: any) {
        this.matDialogRef.close(data);
    }
}
