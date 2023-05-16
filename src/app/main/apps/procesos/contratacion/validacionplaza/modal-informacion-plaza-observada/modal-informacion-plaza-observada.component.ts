import { saveAs } from "file-saver";
import { Component, OnInit, ViewEncapsulation, Inject, QueryList, ViewChildren } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource } from "@angular/material/table";
import { ModalInformacionSustentoComponent } from "../modal-informacion-sustento/modal-informacion-sustento.component";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";

@Component({
    selector: 'minedu-modal-informacion-plaza-observada',
    templateUrl: './modal-informacion-plaza-observada.component.html',
    styleUrls: ['./modal-informacion-plaza-observada.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalInformacionPlazaObservadaComponent implements OnInit {

    working = false;
    dialogTitle: string = "Motivo de no Publicación de Plazas";
    documento: any;

    modal = {
        icon: "",
        title: "",
        action: "",
    };

    displayedColumns: string[] = [
        "index",
        "tipoDocumentoSustento",
        "numeroDocumentoSustento",
        "tipoFormatoSustento",
        "numeroFolios",
        "fechaEmision",
        "fechaCreacion",
        "opciones",
    ];

    private _loadingChange = new BehaviorSubject<boolean>(false);
    loading = this._loadingChange.asObservable();
    dataSource: MatTableDataSource<any>;
    selection = new SelectionModel<any>(false, []);
    dialogRef: any;
    plazaSeleccionada: any;

    constructor(public matDialogRef: MatDialogRef<ModalInformacionPlazaObservadaComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private materialDialog: MatDialog,
                private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.buildForm();
        this.modal = this.data.modal;
        this.plazaSeleccionada = this.data.plazaObservada;
        this.getInformacionDocumentoSustento();
    }

    buildForm() {
        this.dataSource = new MatTableDataSource([]);
    }

    getInformacionDocumentoSustento = () => {
        const id = this.plazaSeleccionada.id_plaza_contratacion_detalle;

        this.dataService.Contrataciones().getDocumentoSustentoById(id).pipe(catchError((e) => { return of(null); }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.dataSource = new MatTableDataSource(response);
                } else {
                    this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL CONSULTAR EL SERVICIO."', () => { });
                }
            }
        );
    }

    informacionSustentoView = (dataSustento) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionSustentoComponent,
            {
                panelClass: "informacion-modal-sustento-dialog",
                width: "850px",
                disableClose: true,
                data: {
                    sustento: dataSustento,
                },
            }
        );
    };

    handleVerAdjunto(data: any) {
        const file = data.codigoAdjuntoSustento;

        this.dataService.Documento().descargar(file).pipe(catchError((e) => { 
            this.dataService.SnackBar().msgError('"ERROR, NO SE PUEDE ACCEDER AL SERVICIO."', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
        )
        .subscribe(response => {
            if (response) {
                this.documento = response;
                this.viewDocumentoAdjunto();
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO DE PLAZAS PUBLICADAS."', () => { });
            }
        });
    }

    viewDocumentoAdjunto () {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Documento Sustento",
                    file: this.documento
                }
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                if (response.download) {
                    saveAs(this.documento, "Documento_Sustento.pdf");
                }
            }
        );
    }

    handleCancelar(data?: any) {
        this.matDialogRef.close(data);
    }

}
