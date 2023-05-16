import {
  Component,
  OnInit,
  Inject,
  ViewEncapsulation,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  catchError,
  map,
  finalize,
  takeUntil,
  filter,
  find,
} from "rxjs/operators";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  TablaTipoOperacion,
  TablaConfiguracionSistema,
  MISSING_TOKEN,
} from "app/core/model/types";

import { SingleFileInputComponent } from "app/main/apps/components/single-file-input/single-file-input.component";

import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { GlobalsService } from "app/core/shared/globals.service";
import { StorageService } from "app/core/data/services/storage.service";

import { TablaConfiguracionDias } from "app/core/model/types";
import { environment } from "environments/environment";
import { PASSPORT_MESSAGE } from "app/core/model/message";
import { SecurityModel } from "app/core/model/security/security.model";

@Component({
  selector: "minedu-proyecto-resolucion-eliminar",
  templateUrl: "./eliminar-proyecto-resolucion.component.html",
  styleUrls: ["./eliminar-proyecto-resolucion.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class EliminarProyectoResolucionComponent
  implements OnInit, OnDestroy, AfterViewInit {
  private _unsubscribeAll: Subject<any>;
  private sharedSubscription: Subscription;

  form: FormGroup;
  working = false;
  action: string;
  dialogTitle: string = "Eliminar Proyecto de Resolución";
  idTipoOperacion: any;

  dialogRef: any;

  tiposDocumentoSustento: any[] = [];
  files: FileList;
  archivoAdjunto: any;
  listaPlazaAprobar: any;
  registro: any;
  mensaje: string;
  currentSession: SecurityModel = new SecurityModel();
  ocultar = true;

  constructor(
      public matDialogRef: MatDialogRef<EliminarProyectoResolucionComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private route: ActivatedRoute,
      private router: Router,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private dataShared: SharedService,
      private globals: GlobalsService,
      private storageService: StorageService,
      private materialDialog: MatDialog
  ) {
      this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
      this.idTipoOperacion = this.data.idTipoOperacion;
      this.action = this.data.action;

      this.buildForm();
  }

  buildForm() {
      this.form = this.formBuilder.group({
          motivoEliminacion: [null, [Validators.required]],
      });
  }

  ngAfterViewInit() { }

  handleEliminar() {
      if (!this.form.valid) {
          this.dataService
              .Message()
              .msgWarning('"COMPLETAR LOS DATOS REQUERIDOS"', () => { });
          return;
      }
      this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR LA INFORMACIÓN?', () => {
          this.eliminarProyectoResolucion(); }, () => { });  
  }

  private eliminarProyectoResolucion() {
      this.dataService.Spinner().show("sp6");
      const usuario = this.currentSession;
      if (!usuario) {
          this.dataService
              .Message()
              .msgWarning(
                  '"DATOS DE USUARIO NO ENCONTRADO, POR FAVOR VUELVA A INICIAR SESIÓN."',
                  () => { }
              );
          return;
      }

      let request = this.form.getRawValue();

      request.usuarioCreacion = usuario.nombreUsuario;

      this.dataService
          .ProyectosResolucion()
          .EliminarProyectoResolucion(this.data.idProyectoResolucion, request)
          .pipe(
              catchError((e) => of(e)),
              finalize(() => {
                  this.working = false;
                  this.dataService.Spinner().hide("sp6");
              })
          )
          .subscribe((response) => {
              if (response) {
                this.dataService
                      .Message()
                      .msgAutoSuccess(
                          '"OPERACIÓN REALIZADA DE FORMA EXITOSA"',
                          3000,
                          ()=>{
                            this.finalizarProceso();
                          }
                      );
              } else if (
                  response &&
                  (response.statusCode === 422 || response.statusCode === 404)
              ) {
                  this.dataService
                      .Message()
                      .msgWarning('"'+response.messages[0]+'"', () => { });
              } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                  this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
              } else {
                  this.dataService
                      .Message()
                      .msgError(
                          '"OCURRIERON ALGUNOS PROBLEMAS DURANTE LA TRANSACCIÓN, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS Y SI EL PROBLEMA PERSISTE COMÚNIQUESE CON EL ADMINISTRADOR DEL SISTEMA"',
                          () => { }
                      );
              }
          });
  }

  private finalizarProceso() {
      this.matDialogRef.close({ operacion: true });
  }

  handleCancelar() {
      this.matDialogRef.close();
  }

  ngOnDestroy(): void { }

  disabledControls() {
      this.form.controls["idTipoDocumentoSustento"].disable();
      this.form.controls["numeroDocumentoReferencia"].disable();
      this.form.controls["fechaEmision"].disable();
      this.form.controls["documento"].disable();
      this.ocultar = false;
  }

  enabledControls() {
      this.form.controls["idTipoDocumentoSustento"].enable();
      this.form.controls["numeroDocumentoReferencia"].enable();
      this.form.controls["fechaEmision"].enable();
      this.form.controls["documento"].enable();
      this.ocultar = true;
  }
}
