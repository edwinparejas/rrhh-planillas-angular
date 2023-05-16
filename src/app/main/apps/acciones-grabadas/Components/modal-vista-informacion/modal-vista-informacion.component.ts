import { AfterViewInit, Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { PASSPORT_MESSAGE } from "app/core/model/messages-error";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { TablaGrupoAccionCodigo } from "../../Models/accionesGrabadas.model";

@Component({
    selector: "minedu-modal-vista-informacion",
    templateUrl: "./modal-vista-informacion.component.html",
    styleUrls: ["./modal-vista-informacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalVistaInformacionComponent
    implements OnInit, AfterViewInit
{
    constructor(
        public matDialogRef: MatDialogRef<ModalVistaInformacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {

        
    }

    TablaGrupoAccionCodigoInterno=TablaGrupoAccionCodigo;

    dataInformacion:any;
    ngOnInit(): void {
       this.obtenerInformacion();
    }
    ngAfterViewInit(): void {
        
    }
    obtenerInformacion() {
        this.dataService.Spinner().show("sp6");
        this.dataService
            .AccionesGrabadas()
            .obtenerDetalleProyecto(this.data.idAccionGrabada)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {               
                if(response){                    
                    this.dataInformacion = response;
                }
            });
    }
}