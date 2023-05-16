import { Component, OnInit, ViewEncapsulation, Input, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable, of } from "rxjs";
import { mineduAnimations } from "@minedu/animations/animations";
import { SelectionModel } from "@angular/cdk/collections";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MessageService } from 'app/core/data/services/message.service';
import { SecurityModel } from "app/core/model/security/security.model";
import { DataService } from "app/core/data/data.service";
import { TablaProcesosConfiguracionAcciones } from "app/core/model/action-buttons/action-types";
import { catchError, finalize } from "rxjs/operators";
import { ASISTENCIA_MESSAGE } from '../../../../../core/model/messages-error';
import { MESSAGE_ASISTENCIA } from '../../control-asistencia/_utils/messages';

@Component({
    selector: "app-modal-devolver-reportes",
    templateUrl: "./modal-devolver-reportes.component.html",
    styleUrls: ["./modal-devolver-reportes.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalDevolverReportesComponent implements OnInit {
 
    selection = new SelectionModel<any>(false, []);
    form: FormGroup;
    working = false; 
    dialogRef: any;
    idControlAsistencia;
    permisoPassport = {       
        buttonDevolverReportes: false
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

 

    constructor(
        public matDialogRef: MatDialogRef<ModalDevolverReportesComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private utilService: MessageService,
        private dataService: DataService
    ) {}

    ngOnInit() {
        this.buildForm(); 
        this.defaultPermisoPassport();       
    }
    ngAfterViewInit() {
      
    }
    buildForm(){
      this.initialize();
        this.form = this.formBuilder.group({
        usuarioObservador: this.passport.numeroDocumento,
        rolUsuarioObservador: this.passport.nombreRol,
        observacion: [null, Validators.required]
      });
 
    }

    initialize() {
        this.modal = this.data.modal;
        this.passport = this.data.passport;
        this.idControlAsistencia = this.modal.info.idControlAsistencia;
    } 
    defaultPermisoPassport() {
        this.permisoPassport.buttonDevolverReportes = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Observar);        
    }

    handleCancelar = () => {
        this.matDialogRef.close({working: this.working });
    };
    handleSaveReporte = () => {
        
        const form = this.form.value;       
        let detalledevolucion = {         
          detalleDevolucion: form.observacion,
          usuarioCreacion: this.passport.numeroDocumento,
          usuarioRolDevolucion : this.passport.nombreRol,
          idControlAsistencia : this.modal.info.idControlAsistencia        
        }     
        this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información.?', () => {
            this.dataService.Spinner().show("sp6");
            this.working = true;
            this.dataService
              .Asistencia()
              .devolverReportes(detalledevolucion)
              .pipe(
                catchError((e) => of(e)),
                finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
              )
              .subscribe(response => {
                if (response && response.result) {
                  this.dataService.Message().msgSuccess(MESSAGE_ASISTENCIA.M07, () => {this.working = true; this.handleCancelar(); });
                } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
                  this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                  this.dataService.Message().msgWarning('No se puede remitir el reporte, intente de nuevo.', () => { });
                }
              });
          }, () => { });
    };

}
