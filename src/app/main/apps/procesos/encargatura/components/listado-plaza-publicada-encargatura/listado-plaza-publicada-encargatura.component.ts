import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { EstadoDocumentoEnum, GrupoDocumentoEnum } from "../../_utils/constants";
import { saveAs } from "file-saver";
import { ENCARGATURA_MESSAGE } from "../../_utils/message";
import { MatPaginator } from "@angular/material/paginator";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { SecurityModel } from "app/core/model/security/security.model";

@Component({
    selector: 'minedu-listado-plaza-publicada-encargatura',
    templateUrl: './listado-plaza-publicada-encargatura.component.html',
    styleUrls: ['./listado-plaza-publicada-encargatura.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ListadoPlazaPublicadaEncargaturaComponent implements OnInit, AfterViewInit {
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    loading = false;
    displayedColumns: string[] = [
        "rowNum",
        "fechaPublicacion",
        "estado",
        "acciones"
    ];
    dataSource: DocumentoPublicadoDataSource | null;
    selection = new SelectionModel<any>(false, []); 
    estadoDocumentoEnum = EstadoDocumentoEnum;
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    dialogRefPreview: any;
    currentSession: SecurityModel = new SecurityModel();
    disableGeneraPDFPlaza:boolean=false;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    request = {
        idEtapaProceso: 0,
        idDesarrolloProceso: 0,
        codigoGrupoDocumento: null
    };
    constructor(
        public dialogRef: MatDialogRef<ListadoPlazaPublicadaEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.idDesarrolloProceso = this.data.idDesarrolloProceso;
        this.currentSession=this.data.currentSession;
    }

    ngOnInit(): void {
        this.dataSource = new DocumentoPublicadoDataSource(this.dataService);
        this.searchDocumentoPublicado(true);
        
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }

    }

    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.searchDocumentoPublicado())).subscribe();

    }
    setRequest() {
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            codigoGrupoDocumento: GrupoDocumentoEnum.Plaza
        };
    }

    searchDocumentoPublicado(firstTime: boolean = false) {
        this.setRequest();
        if (firstTime) {
            this.dataSource.load(this.request,  (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
    }

    handleRefrescar(){
        this.searchDocumentoPublicado(true);
    }

    handleGenerarPlazas(){

        debugger
        if (this.selection.selected.length == 0) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M91, () => { });
            return;
        }
        if (this.selection.selected.length > 1) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M92, () => { });
            return;
        }

        var elegido=this.selection.selected;

        var request={
            IdDocumentoPublicado:elegido[0].idDocumentoPublicado,
            CodigoEstadoDocumento:this.estadoDocumentoEnum.EnProgreso,
            UsuarioModificacion:this.currentSession.nombreUsuario
        };

        this.disableGeneraPDFPlaza=true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().ActualizarEstadoDocumentoPublicado(request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((validaexiste) => {
            if(validaexiste){
                this.searchDocumentoPublicado(true);
            }
            this.disableGeneraPDFPlaza=false;
        });
    }

    disabledCheck(row:any){
        if(row.rowNum==1){
            if(row.codigoEstado==this.estadoDocumentoEnum.Pendiente){
                return false;
            }
        }
        return true;
    }
    // downloadDocumentoGenerado(row: any) {
    //     const request = row.codigoDocumentoGenerado;
    //     this.loading = true;
    //     this.dataService.Spinner().show("sp6");
    //     this.dataService.Encargatura().downloadDocumentoPublicado(request).pipe(catchError((e) => of(e)), finalize(() => {
    //         this.dataService.Spinner().hide("sp6")
    //         this.loading = false;
    //     })).subscribe(result => {
    //         if (result) {
    //             saveAs(result, "documentopublicado.pdf");
    //         } else {
    //             this.dataService.Message().msgWarning("No se pudo descargar documento sustento", () => { });
    //         }
    //     });
    // }

    downloadDocumentoGenerado(row: any) {
        const codigoAdjunto = row.codigoDocumentoGenerado;

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE DOCUMENTO DE SUSTENTO."', () => {
            });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(codigoAdjunto)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreview(response, codigoAdjunto);
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO."', () => {
                    });
                }
            });
    };

    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,            
            width: '100%',
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Documento de sustento',
                    file: file,
                    fileName: codigoAdjuntoSustento
                }
            }
        });

        this.dialogRefPreview.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    };

    handleCancel() {
        this.dialogRef.close();
    }
}

export class DocumentoPublicadoDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        console.log('load', data, pageIndex, pageSize);
        this._loadingChange.next(false);
        this.dataService.Spinner().show("sp6");
        this.dataService
        .Encargatura()
        .searchDocumentoPublicadoPaginado(data, pageIndex, pageSize)
        .pipe(catchError(() => of([])), finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide("sp6");
        })).subscribe((result: any) => {
            this._dataChange.next(result || []);
            this.totalRegistros = (result || []).length === 0 ? 0 : result[0].totalRegistros;
            if ((result || []).length === 0) {
                this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M09, () => { });
            }
        });
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalRegistros;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}