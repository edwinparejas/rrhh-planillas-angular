import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { MatPaginator } from "@angular/material/paginator";
import { mineduAnimations } from "../../../../../../../../@minedu/animations/animations";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { saveAs } from 'file-saver';
import { DatePipe } from "@angular/common";
import { SecurityModel } from 'app/core/model/security/security.model';
import { EstadoDocumentoEnum } from '../../../_utils/constants';


@Component({
    selector: 'minedu-modal-servidor-publico-vinculado',
    templateUrl: './modal-servidor-publico-vinculado.component.html',
    styleUrls: ['./modal-servidor-publico-vinculado.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ModalServidorPublicoVinculadoComponent implements OnInit {

    dialogTitle = "Listado de Documentos Publicados";
    columnTitle = "Pre Publicación"
    working = false;
    isMobile = false; 
    dialogRef: any;
   
    @ViewChild("paginatorDocumentos", { static: true }) paginatorDocumentos: MatPaginator;
   
    selection = new SelectionModel<any>(false, []);

    displayedColumnsDocumentosPublicados: string[] = [
        "sel",
        "instancia",
        "sub",
        "centroTrabajo",
        "modalidad",
        "nivelEducativo",
        "codigoPlaza",
        "tipoPlaza",
        "regimenLaboral",
        "condicionLaboral",
        "cargo",        
        "JornadaLaboral",     
        "fechaInicio",
        "fechaFin"
    ];

    request = {
        idEtapaProceso: null,
        idGrupoDocumento: null,
        anio: null,
        codigoCentroTrabajoMaestro:null
    };

    currentSession: SecurityModel = new SecurityModel();
    listaVinculacionServidorPublico: any;
    constructor(
        public matDialogRef: MatDialogRef<ModalServidorPublicoVinculadoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private datePipe: DatePipe,
        private materialDialog: MatDialog,
        private dataService: DataService
    ) { }

    ngOnInit(): void {    
        this.listaVinculacionServidorPublico = this.data.listaVinculacionServidorPublico;
        console.log("Datos de Data:", this.data);        
        this.handleResponsive();
        if (this.data.dialogTitle != null) {
            this.dialogTitle = this.data.dialogTitle;
        }
        if (this.data.columnTitle != null) {
            this.columnTitle = this.data.columnTitle;
        }
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

   
    handleCancel = () => { this.matDialogRef.close(); }

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

    transformarFecha(date){
        return this.datePipe.transform(date, 'dd/MM/yyyy');
    }

    handleSeleccionarFila = () => {
        const selected: any[] = this.selection.selected;
        if (selected.length <= 0) {
            this.dataService.Message().msgWarning('SELECCIONE UN REGISTRO PARA CONTINUAR CON LA OPERACIÓN', () => {});
            return;
        }
        const form = selected[0].value;
        this.selection.clear();
        this.selection.toggle(selected);
        this.matDialogRef.close(selected);
    }
}
