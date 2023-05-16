import { Component, OnInit, ViewEncapsulation, Input, Inject, ChangeDetectionStrategy } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BehaviorSubject, Observable, of } from "rxjs";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { mineduAnimations } from "@minedu/animations/animations";
import { ModalVerMotivoDevolucionModel} from "../models/bandeja-mensual.model";
import { DataService } from "app/core/data/data.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { TablaProcesosConfiguracionAcciones } from "app/core/model/action-buttons/action-types";
import { catchError, finalize } from "rxjs/operators";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource } from "@angular/material/table";
import { ASISTENCIA_MESSAGE, SNACKBAR_BUTTON } from "app/core/model/messages-error";
import { TipoMotivoDevolucion } from "../_utils/enum";


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "app-modal-ver-motivo-devolucion",
    templateUrl: "./modal-ver-motivo-devolucion.component.html",
    styleUrls: ["./modal-ver-motivo-devolucion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalVerMotivoDevolucionComponent implements OnInit {
   
    form: FormGroup;
    working = false;
    isDisabled = false;    
    dialogRef: any;
    //centroTrabajo: CentroTrabajoModel = null;
    detalleDevolucionAsistencia: ModalVerMotivoDevolucionModel;
    usuarioObservador_: any;
    rolUsuarioObservador_: any;
    detalleMotivoDevolucion_: any;
    tipo:number;

    permisoPassport = {       
        buttonVerMotivo: false
    }
    max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    min = new Date();

    modal = {
        icon: "",
        title: "",
        action: "",
        info: null,
        editable: false
    }
    private passport: SecurityModel;

    isMobile = false;
    idControlAsistencia: number;
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
    public matDialogRef: MatDialogRef<ModalVerMotivoDevolucionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService) { }

    ngOnInit() :void{
       
       this.buildForm(); 
   
     
    }

    ngAfterViewInit() {
      
    }

    buildForm(){
      this.initialize();
      this.form = this.formBuilder.group({
      usuarioObservador_: [null],
      rolUsuarioObservador_: [null],
      detalleDevolucion_: [null, Validators.required]
    });

    }

    initialize() {
        this.modal = this.data.modal;
        this.passport = this.data.passport;
        this.tipo = this.data.tipo;
        console.log(this.tipo);
        console.log(typeof this.tipo);
        this.idControlAsistencia = this.modal.info.idControlAsistencia;
       
    }  
    
    handleCancelar = (data? : any) => {
        this.matDialogRef.close();
    };
}
