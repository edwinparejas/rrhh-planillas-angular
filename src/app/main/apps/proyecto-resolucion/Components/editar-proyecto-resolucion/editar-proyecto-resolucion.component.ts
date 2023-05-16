import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  ViewChild,
  ComponentFactoryResolver,
  ViewEncapsulation,
} from "@angular/core";
import { Subscription, Subject, of } from "rxjs";
import { FormGroup } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { DynamicComponent } from "../dynamic/dynamic.component";
import { DynamicHostDirective } from "../directive/dynamic-host.directive";
import {
  Comment,
  SeccionVistaProyecto,
} from "../../models/proyectoResolucion.model";
import { DataService } from "app/core/data/data.service";
import { catchError, finalize } from "rxjs/operators";
import { ResultadoOperacionEnum } from "../../_utils/constants";
import { mineduAnimations } from "@minedu/animations/animations";
import { PASSPORT_MESSAGE } from "app/core/model/message";
import { MISSING_TOKEN } from "app/core/model/types";
import { SecurityModel } from "app/core/model/security/security.model";


@Component({
  selector: "minedu-editar-proyecto-resolucion",
  templateUrl: "./editar-proyecto-resolucion.component.html",
  styleUrls: ["./editar-proyecto-resolucion.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class VistaProyectoComponent implements OnInit, AfterViewInit {
  private _unsubscribeAll: Subject<any>;
  private sharedSubscription: Subscription;
  @ViewChild(DynamicHostDirective) public dynamicHost: DynamicHostDirective;
  form: FormGroup;
  isWorking = false;
  action: string;
  dialogTitle: string;
  disabledDias: boolean = false;
  vistaProyecto: SeccionVistaProyecto[] = [];
  visibleEliminar = false;
  maxDate = new Date();
  currentSession: SecurityModel = new SecurityModel();
  constructor(
      public matDialogRef: MatDialogRef<VistaProyectoComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private componentFactoryResolver: ComponentFactoryResolver,
      private dataService: DataService,
      private materialDialog: MatDialog
  ) {
      this._unsubscribeAll = new Subject();
      this.visibleEliminar = data.action == "delete" ? true : false;
      this.currentSession=data.currentSession;
  }

  public RenderizaComponent(): void {
      const component = this.componentFactoryResolver.resolveComponentFactory(
          DynamicComponent
      );
      this.dynamicHost.viewContainerRef.clear();
      let ref = this.dynamicHost.viewContainerRef.createComponent(component);
      ref.instance.secciones = this.vistaProyecto;
      ref.instance.codigoGrupoAccion = this.data.row.codigoGrupoAccion;
  }

  ngOnInit(): void {
      this.reloadForm();
      this.dialogTitle = "Información completa";
  }

  ngAfterViewInit(): void {
      // this.RenderizaComponent();
  }

  reloadForm = () => { 
      this.dataService
          .ProyectosResolucion()
          .listarDetallesSeccionesVistaProyectoById(
              this.data.row.idProyectoResolucion
          )
          .pipe(
              catchError((e) => of(e)),
              finalize(() => { })
          )
          .subscribe((response: any) => {
              if (response) {
                  // const detalles = response.data.map((d) =>
                  //     d.secciones && d.secciones.length ? d.secciones[0] : []
                  // );


                  // //CABECERA
                  // var cabeceraProyectoResolucion = {
                  //     detalleVistaProyecto: [
                  //         {
                  //             etiquetaCampo: "Tipo resolución",
                  //             idDetalleVistaProyecto: 1,
                  //             valorCampoFormateado: this.data.row
                  //                 .tipoResolucion,
                  //         },
                  //         {
                  //             etiquetaCampo: "Número proyecto resolución",
                  //             idDetalleVistaProyecto: 2,
                  //             valorCampoFormateado: this.data.row
                  //                 .numeroProyecto,
                  //         },
                  //         {
                  //             etiquetaCampo:
                  //                 "Fecha de proyecto de resolución",
                  //             idDetalleVistaProyecto: 3,
                  //             valorCampoFormateado: this.data.row
                  //                 .fechaProyecto,
                  //         },
                  //     ],
                  //     etiquetaSeccioVistaProyecto:
                  //         "Detalle del proyecto de resolución",
                  //     idSeccionVistaProyecto: 0,
                  //     idSeccionVistaProyectoPadre: 0,
                  //     idTipoPresentacion: 8,
                  //     seccionVistaProyecto: null,
                  //     tituloSecciones: "",
                  // };

                  // //DETALLE RESOLUCION
                  // var detalleResolucion = {
                  //     detalleVistaProyecto: [
                  //         {
                  //             etiquetaCampo: "Número de resolución",
                  //             idDetalleVistaProyecto: 1,
                  //             valorCampoFormateado: this.data.row
                  //                 .numeroResolucion,
                  //         },
                  //         {
                  //             etiquetaCampo: "Fecha de resolución",
                  //             idDetalleVistaProyecto: 3,
                  //             valorCampoFormateado: this.data.row
                  //                 .fechaResolucion,
                  //         },
                  //     ],
                  //     etiquetaSeccioVistaProyecto: "Detalle de la resolución",
                  //     idSeccionVistaProyecto: 0,
                  //     idSeccionVistaProyectoPadre: 0,
                  //     idTipoPresentacion: 8,
                  //     seccionVistaProyecto: null,
                  //     tituloSecciones: "",
                  // };

                  // //AGREGA CABECERA Y DETALLE RESOLUCION.
                  // this.vistaProyecto = [
                  //     cabeceraProyectoResolucion,
                  //     ...detalles,
                  //     detalleResolucion,
                  // ];

                  this.vistaProyecto = response;
                  this.RenderizaComponent();
              } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                  this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
              }
          });
  };

  getData = (row: any) => {
      return null;
  };
  handleCancel = () => {
      this.matDialogRef.close(false);
  };

  handleEliminarProyecto = () => {
      var request = {
          idProyectoResolucion: this.data.idProyectoResolucion,
          usuarioCreacion: this.currentSession.nombreUsuario,
      };
      this.dataService.Message().msgConfirm(
          "¿ESTA SEGURO DE QUE DESEA ELIMINAR EL PROYECTO?",
          () => {
              this.dataService
                  .ProyectosResolucion()
                  .EliminarProyectoResolucion(
                      this.data.row.idProyectoResolucion,
                      request
                  )
                  .pipe(
                      catchError((e) => of(e)),
                      finalize(() => { })
                  )
                  .subscribe((response) => {
                      if (response) {
                          this.dataService
                              .Message()
                              .msgInfo(
                                  '"OPERACIÓN REALIZADA DE FORMA EXITOSA."',
                                  () => { }
                              );
                          this.matDialogRef.close(true);
                      } else if (
                          response &&
                          response.statusCode ===
                          ResultadoOperacionEnum.NotFound
                      ) {
                          this.dataService
                              .Message()
                              .msgWarning('"'+response.messages[0]+'"', () => { });
                      } else if (
                          response &&
                          response.statusCode ===
                          ResultadoOperacionEnum.UnprocessableEntity
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
                                  '"OCURRIERON ALGUNOS PROBLEMAS AL ELIMINAR EL PROYECTO DE RESOLUCIÓN, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."',
                                  () => { }
                              );
                      }
                  });
          },
          () => { }
      );
  };

//   handleEliminarProyectoConReplica = () => {
//       var request = {
//           codigoProyectoResolucion: this.data.codigoProyectoResolucion,
//           usuarioCreacion: "Admin",
//       };
//       this.dataService.Message().msgConfirm(
//           "¿Esta seguro de que desea eliminar el proyecto",
//           () => {
//               this.dataService
//                   .PlazaReubicacion()
//                   .EliminarProyectoResolucionConReplica(
//                       this.data.row.codigoProyectoResolucion,
//                       request
//                   )
//                   .pipe(
//                       catchError((e) => of(e)),
//                       finalize(() => { })
//                   )
//                   .subscribe((response) => {
//                       if (response && response.result) {
//                           this.dataService
//                               .Message()
//                               .msgInfo(
//                                   "Operación realizada de forma exitosa.",
//                                   () => { }
//                               );
//                           this.matDialogRef.close(true);
//                       } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
//                           this.dataService.Message().msgWarning(response.messages[0], () => { });
//                       } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
//                           this.dataService.Message().msgWarning(response.messages[0], () => { });
//                       } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
//                           this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
//                       } else {
//                           this.dataService
//                               .Message()
//                               .msgError(
//                                   "Ocurrieron algunos problemas al eliminar el proyecto de resolución, por favor intente dentro de unos segundos, gracias.",
//                                   () => { }
//                               );
//                       }
//                   });
//           },
//           () => { }
//       );
//   };
}
