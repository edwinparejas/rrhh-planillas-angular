import {Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import { of} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';

@Component({
    selector: "minedu-registro-informe-escalafonario-postulante-encargatura",
    templateUrl: "./registro-informe-escalafonario-postulante-encargatura.component.html",
    styleUrls: ["./registro-informe-escalafonario-postulante-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroInformeEscalafonarioPostulanteEncargaturaComponent implements OnInit//, OnChanges 
{
    @Input() idEtapaProceso : number;
    @Input() idDesarrolloProceso : number;
    @Input() idTipoDocumento : number;
    @Input() numeroDocumentoIdentidad : string;
    
    // @Output() onChangeCambioDatosDocumentos: EventEmitter<boolean>;

    informe: any;
    loading = false;
    export = false;
    isMobile = false;
    dialogRefPreview: any;
    formInformeEscalafonarioPostular: FormGroup;
    request = {
        pIdTipoDocumentoIdentidad: 0,
        pNumeroDocumentoIdentidad: "",
        pNumeroInformeEscalafonario: null
    };
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    constructor(
        public dialogRef: MatDialogRef<RegistroInformeEscalafonarioPostulanteEncargaturaComponent>,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        // this.onChangeCambioDatosDocumentos = new EventEmitter();
    }

    // ngOnChanges(): void {        
    //     this.obtenerInforme();
    // }

    ngOnInit(): void {
        this.handleResponsive();
        this.buildForm();
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildForm() {
        this.formInformeEscalafonarioPostular = this.formBuilder.group({
            numeroInformeEscalafonario: [null, Validators.required]
        });
    }

    setRequest() {
        debugger
        const idEtapaProceso = this.idEtapaProceso;
        const idDesarrolloProceso = this.idDesarrolloProceso;
        const idTipoDocumento = this.idTipoDocumento;
        const numeroDocumentoIdentidad = this.numeroDocumentoIdentidad;
        const numeroInformeEscalafonario = this.formInformeEscalafonarioPostular.get("numeroInformeEscalafonario").value;
        this.request = {
            pIdTipoDocumentoIdentidad: idTipoDocumento,
            pNumeroDocumentoIdentidad: numeroDocumentoIdentidad,
            pNumeroInformeEscalafonario: numeroInformeEscalafonario
        };
    }

    handleBuscar(): void {     
        if (this.formInformeEscalafonarioPostular.valid == false) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS."', () => { });
            return;
        } 
        this.obtenerInforme();
    }

    limpiarDataInforme(){
        this.informe = null;
    }
    
    obtenerInforme():void{
        this.setRequest();
        this.loading = true;
        this.dataService.Spinner().show('sp6');
        this.dataService.Encargatura().getInformeEscalafonario(this.request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.loading = false;
            this.dataService.Spinner().hide('sp6');
        })).subscribe((result: any) => {
            debugger
            if(result){
                this.informe = {
                    numeroInformeEscalafonario:result.numeroInformeEscalafonario,
                    fechaInformeEscalafonario:result.fechaInformeEscalafonario,
                    documentoInformeEscalafonario:result.documentoInformeEscalafonario
                }
                return;
            }
            // else{
            //     this.informe = {
            //         numeroInformeEscalafonario:this.request.pNumeroInformeEscalafonario,
            //         fechaInformeEscalafonario:new Date(),
            //         documentoInformeEscalafonario:'2/516f138e-fda9-ec11-b81a-0050569005a4'
            //     }
            //     return;
            // }
            this.informe = null;
            this.formInformeEscalafonarioPostular.reset();
            
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }     

    handleVerDocumentoSustento = () => {
        const codigoAdjunto = this.informe.documentoInformeEscalafonario;

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE INFORME ESCALAFONARIO."', () => {
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
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL INFORME ESCALAFONARIO."', () => {
                    });
                }
            });
    };
    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
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
}