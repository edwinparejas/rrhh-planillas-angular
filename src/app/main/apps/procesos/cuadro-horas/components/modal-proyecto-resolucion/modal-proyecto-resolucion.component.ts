import { Component, Inject, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SingleFileInputComponent } from 'app/main/apps/components/single-file-input/single-file-input.component';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { ModalVerInformacionComponent } from './modal-ver-informacion/modal-ver-informacion.component';
import { DatePipe, formatDate } from '@angular/common';
import { MESSAGE_GESTION } from '../../_utils/messages';
import { HttpErrorResponse } from '@angular/common/http';
import { CodigoAccion, CodigoGrupoAccion } from '../../_utils/types-gestion';
import { TablaSeccion, TablaTipoSeccion } from 'app/core/model/types';
import { environment } from 'environments/environment';
import { isArray } from 'lodash';
import { ActivatedRoute, Router } from "@angular/router";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'minedu-modal-proyecto-resolucion',
  templateUrl: './modal-proyecto-resolucion.component.html',
  styleUrls: ['./modal-proyecto-resolucion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ModalProyectoResolucionComponent implements OnInit {
  ELEMENTOS_TEMP_DATAGRID: tblGridAccGrab[] = [];
  CONSIDERANDO_TEMP_DATAGRID: tblGridConGrab[] = [];
  working = false;
  form: FormGroup;
  formCons: FormGroup;
  tiempoMensaje: number = 3000; 
  tiposDocumentoSustento: any[] = [];
  tiposFormatoSustento: any[] = [];
  tiposDeResolucion: any[] = [];
  maximo: number = 8;
  CODIGO_SISTEMA = environment.documentoConfig.CODIGO_SISTEMA;
  datosIged: any = null;
  dataSource = new MatTableDataSource;
  dataSourceConsiderando = new MatTableDataSource;
  displayedColumns: string[] = [
    "tipoDocumentoSustento",
    "numeroDocumentoSustento",
    "fechaEmision",
    "tipoFormatoSustento",
    "numeroFolios",
    "fechaCreacion",
    "acciones",
  ];
  displayedColumnsConsiderando: string[] = [
    "orden",
    "seccion",
    "tipoSeccion",
    "considerando",
    "acciones"
  ];
  tipoSeccion = "";
  seccion = "";
  propuesta = {
    propuestasAdecuacion: [],
    usuarioCreacion: null,
    codigoTipoDocumentoIdentidad: null,
    numeroDocumentoIdentidad: null
};
  file: any = null;
  grillaTemporalSustentos: Array<any> = [];
  ACCIONES_GRABADAS_IDS: Array<any> = [];
  anexos : Array<string> = []; 
  multipleRegimen: string = "";
  multipleGrupoAccion: string = "";
  multipleAccion: string = "";
  multipleMotivo: string = "";

  codigoRegimenLaboral: number;
  codigoGrupoAccion: number;
  codigoAccion: number;
  codigoMotivoAccion: number;

  codigoUgel: string;
  codigoDre: string;
  idConsolidado:number;
  idParametroInicial:number;
  esProyectoIndividual: boolean;
  paramIdAccionesGrabadas = {
    idRegimenLaboral:0,
    idGrupoAccion:0,
    idAccion: 0,
    idMotivoAccion:0
}
  dialogRef: any;
  constructor(
    private route: ActivatedRoute,
    public matDialogRef: MatDialogRef<ModalProyectoResolucionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
    public datepipe: DatePipe,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.idConsolidado = this.data.idConsolidado;
    this.idParametroInicial = this.data.idParametroInicial;
    console.log("this.idConsolidado",this.idConsolidado);
    this.buildForm();
    this.validBuildData();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idTipoResolucion: [null, [Validators.required]],
      idTipoDocumentoSustento: [null, [Validators.required]],
      numeroDocumentoSustento: [null, [Validators.required, Validators.maxLength(this.maximo), Validators.minLength(this.maximo)]],
      entidadEmisora: [null, [Validators.required, Validators.maxLength(400)]],
      fechaEmision: [null, [Validators.required]],
      numeroFolios: [null, [Validators.required, Validators.maxLength(8), Validators.minLength(1)]],
      idTipoFormatoSustento: [null, [Validators.required]],
      sumilla: [null, [Validators.required, Validators.maxLength(400)]],
      adjuntarDocumento: [null, [Validators.required]],
      vistoDeProyecto: [null, [Validators.required]],
    });
    this.formCons = this.formBuilder.group({
        considerando: [null, [Validators.required]],
        sangria: [{value: true, disabled: true}]
    });
  }

  private validBuildData() {

    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    let codigoTipoSede = rolSelected.CODIGO_TIPO_SEDE;

    if (rolSelected.CODIGO_TIPO_SEDE === "TS005") {
      rolSelected.CODIGO_SEDE = "000000";
    }
    this.seccion = TablaSeccion.SECCION;
    this.tipoSeccion = TablaTipoSeccion.PARRAFO;

    this.dataService.CuadroHoras().getTiposDocumentoSustento()
      .pipe(
        catchError((e) => {
          return of(e);
        }),
        finalize(() => { })
      ).subscribe((response) => {
        if (response) {
          this.tiposDocumentoSustento = response;
        }
      });

    this.dataService.CuadroHoras().getTiposFormatoSustento()
      .pipe(
        catchError((e) => {
          return of(e);
        }),
        finalize(() => { })
      ).subscribe((response) => {
        if (response) {
          this.tiposFormatoSustento = response;
        }
      });


    this.dataService.CuadroHoras().getTiposResolucion()
      .pipe(
        catchError((e) => {
          return of(e);
        }),
        finalize(() => { })
      ).subscribe((response) => {
        if (response ) {
          this.tiposDeResolucion = response;

          var tipoResolucion = response.find(x => x.codigoCatalogoItem === 1)
          if (tipoResolucion)
            this.form.patchValue({
              idTipoResolucion: tipoResolucion.idCatalogoItem
            });
        }
      });
//this.data.proceso.idProceso, 
// CodigoGrupoAccion.Comite, 
// CodigoAccion.ConformacionComite
    this.dataService.CuadroHoras().getRegimenGrupoAccion()
      .pipe(
        catchError((e) => {
          return of(e);
        }),
        finalize(() => { })
      ).subscribe((response) => {
        if (response) {
          this.multipleRegimen = response.regimenLaboral;
          this.multipleGrupoAccion = response.grupoAccion;
          this.multipleAccion = response.accion;
          this.multipleMotivo = response.motivoAccion;
          this.paramIdAccionesGrabadas.idAccion=response.idAccion;
          this.paramIdAccionesGrabadas.idGrupoAccion=response.idGrupoAccion;
          this.paramIdAccionesGrabadas.idMotivoAccion=response.idMotivoAccion;
          this.paramIdAccionesGrabadas.idRegimenLaboral=response.idRegimenLaboral;

        }
      });


       
  }


  @ViewChildren(SingleFileInputComponent)
  fileComponent: QueryList<SingleFileInputComponent>
  limpiar() {
    this.form.controls['idTipoDocumentoSustento'].reset();
    this.form.controls['numeroDocumentoSustento'].reset();
    this.form.controls['entidadEmisora'].reset();
    this.form.controls['fechaEmision'].reset();
    this.form.controls['numeroFolios'].reset();
    this.form.controls['idTipoFormatoSustento'].reset();
    this.form.controls['sumilla'].reset();
    this.form.controls['adjuntarDocumento'].reset();
    this.form.controls['vistoDeProyecto'].reset();
    this.fileComponent.forEach(c => c.eliminarDocumento());
  };
   
 
  agregarAGrillaTemporal() {

    if (!this.form.valid) {
      this.dataService.Message()
        .msgWarning(MESSAGE_GESTION.M08);
      return;
    }
    const usuario = this.dataService.Storage().getPassportUserData();
    const data = this.dataSource.data;
    var cont = data.length;
    const form = this.form.value;
            
    const documentoSustento = this.tiposDocumentoSustento.find(d => d.idCatalogoItem === form.idTipoDocumentoSustento);
    const formatoSustento = this.tiposFormatoSustento.find(d => d.idCatalogoItem === form.idTipoFormatoSustento);
    
    let item: tblGridAccGrab = {
      tipoDocumentoSustento: documentoSustento.descripcionCatalogoItem,
      tipoFormatoSustento: formatoSustento.descripcionCatalogoItem,
      idDocumentoSustento: 0,
      idAccionGrabada: 0, /*este item se llenara el backend despues de guardar la accion grabada*/
      idTipoResolucion: 0 /*este item se llenara al final cuando se envie la lista final, ya que es 1 resolucion por el bloque*/,
      idTipoDocumentoSustento:
      this.form.value.idTipoDocumentoSustento,
      idTipoFormatoSustento: this.form.value.idTipoFormatoSustento,
      numeroDocumentoSustento:
      this.form.value.numeroDocumentoSustento,
      entidadEmisora: this.form.value.entidadEmisora,
      fechaEmision: this.form.value.fechaEmision,
      numeroFolios: Number(this.form.value.numeroFolios),
      sumilla: this.form.value.sumilla,
      codigoDocumentoSustento: "", //this.form.value.adjuntarDocumento,
      vistoProyecto:
      this.form.value.mostrarVistoProyecto == "1" ? true : false,
      activo: true,
      fechaCreacion: new Date(),
      usuarioCreacion: usuario.NOMBRES_USUARIO,
      ipCreacion: "",
      fechaModificacion: new Date(),
      archivoSustento: this.form.value.adjuntarDocumento,
      nombreArchivoSustento: this.form.value.adjuntarDocumento.name
  };

    this.ELEMENTOS_TEMP_DATAGRID.push(item);
    data.push(item);
    this.dataSource.data = data;

    this.limpiar();

  }

  // agregarConsiderandoAGrillaTemporal() {
  //   if (this.formCons.valid) {
  //     const data = this.dataSourceConsiderando.data;
  //     var cont = data.length;
  //     let item = {
  //         orden: cont + 1,
  //         seccion: this.seccion,
  //         tipoSeccion: this.tipoSeccion,
  //         considerando: this.formCons.value.considerando,
  //         sangria: this.formCons.controls.sangria.value
  //     };
  //     data.push(item);
  //     this.dataSourceConsiderando.data = data;
      
  //     this.formCons.patchValue({ considerando: '' });
  //   } else {
  //       this.dataService.Message().msgWarning("DEBE INGRESAR EL CAMPO OBLIGATORIO", () => {});
  //       return;
  //   }
  // }
  agregarConsiderandoAGrillaTemporal = () => {
    if (this.formCons.valid) {
      const data = this.dataSourceConsiderando.data;
      console.log("data",data);
      var cont = data.length;
        const usuario = this.dataService.Storage().getPassportUserData();
        let item: tblGridConGrab = {
            seccion: this.seccion,
            tipoSeccion: this.tipoSeccion,
            idSeccion: 1,
            idtipoSeccion: 1,
            considerando: this.formCons.value.considerando,
            sangria: true,
            activo: true,
            fechaCreacion: new Date(),
            usuarioCreacion: usuario.NOMBRES_USUARIO,
            ipCreacion: "",
            fechaModificacion: new Date(),
        };
        this.CONSIDERANDO_TEMP_DATAGRID.push(item);
        data.push(item);
        this.dataSourceConsiderando.data = data;
        this.limpiarConsiderando();
    }
    else {
        this.dataService.Message()
            .msgWarning('DEBE INGRESAR TODOS LOS CAMPOS OBLIGATORIOS.', () => { });
        return;
    }

}
limpiarConsiderando() {
    this.formCons.controls['considerando'].reset();
};

  guardarDocumentoSustentoYGenerarProyectoResolucionOBSOLETO() {
    const documentosSustento: Array<any> = this.dataSource.data;
    if (documentosSustento.length < 1 || documentosSustento.filter(x => x.mostrarVistoProyecto == true).length == 0){
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M124, () => {});
      return;
    }

    const usuario = this.dataService.Storage().getPassportUserData();
    const rolSelected = this.dataService.Storage().getPassportRolSelected();

    if (rolSelected.CODIGO_TIPO_SEDE === "TS005") {
      rolSelected.CODIGO_SEDE = "000000";
    }

    let objGenerarProyectoResolucion = new FormData();
    objGenerarProyectoResolucion.append('idProceso', this.data.proceso.idProceso);
    objGenerarProyectoResolucion.append('idTipoResolucion', this.form.value.idTipoResolucion);
    objGenerarProyectoResolucion.append('idAlcanceProceso', this.data.proceso.idProceso);// this.data.permisoComite.idAlcanceProceso);
    objGenerarProyectoResolucion.append('codigoTipoSede', rolSelected.CODIGO_TIPO_SEDE);
    objGenerarProyectoResolucion.append('tipoSede', rolSelected.CODIGO_SEDE);
    objGenerarProyectoResolucion.append('usuarioCreacion', usuario.NOMBRES_USUARIO);

    for (let i = 0; i < documentosSustento.length; i++) {
      var fechaEmision = this.datepipe.transform(documentosSustento[i].fechaEmision, 'dd/MM/yyyy');

      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].idTipoDocumentoSustento", documentosSustento[i].idTipoDocumentoSustento);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].numeroDocumentoSustento", documentosSustento[i].numeroDocumentoSustento);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].entidadEmisora", documentosSustento[i].entidadEmisora);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].fechaEmision", fechaEmision);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].numeroFolios", documentosSustento[i].numeroFolios);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].idTipoFormatoSustento", documentosSustento[i].idTipoFormatoSustento);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].adjunto", documentosSustento[i].adjunto);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].sumilla", documentosSustento[i].sumilla);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].mostrarVistoProyecto", documentosSustento[i].mostrarVistoProyecto);
    }

    const considerandos: Array<any> = this.dataSourceConsiderando.data;
    for (let i = 0; i < considerandos.length; i++) {
      objGenerarProyectoResolucion.append("detalleConsiderando[" + i + "].orden", considerandos[i].orden);
      objGenerarProyectoResolucion.append("detalleConsiderando[" + i + "].considerando", considerandos[i].considerando);
      objGenerarProyectoResolucion.append("detalleConsiderando[" + i + "].sangria", considerandos[i].sangria);
    }

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M29, () => {

      this.dataService.Spinner().show("sp6");
      this.dataService.CuadroHoras().crearProyectoResolucion(objGenerarProyectoResolucion)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => {
            this.dataService.Spinner().hide("sp6");
          })
        ).subscribe((response) => {
          if (response && response > 0) 
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, 3000, () => { this.matDialogRef.close({ reload: true }); });
        });
    });
  }
  guardarDocumentoSustentoYGenerarProyectoResolucion = () => {
    
    const usuario = this.dataService.Storage().getPassportUserData();
    const rolSelected = this.dataService.Storage().getPassportRolSelected();

    if (rolSelected.CODIGO_TIPO_SEDE === "TS005") {
      rolSelected.CODIGO_SEDE = "000000";
    }

    this.dataService.Message().msgConfirm('¿Está seguro de que desea generar el proyecto.?', () => {
        const form = this.form.value;
        const usuario = this.dataService.Storage().getPassportUserData();   
        
        const accionesGrabadasIds = {
                idRegimenLaboral:this.paramIdAccionesGrabadas.idRegimenLaboral,
                idGrupoAccion:this.paramIdAccionesGrabadas.idGrupoAccion,
                idAccion: this.paramIdAccionesGrabadas.idAccion,
                idMotivoAccion:this.paramIdAccionesGrabadas.idMotivoAccion
        }
        const data = {             
            oProyectoResolucion: {
                idTipoResolucion: form.idTipoResolucion,
                usuarioCreacion: usuario.NOMBRES_USUARIO,
                documentosSustento: this.ELEMENTOS_TEMP_DATAGRID,
                codigoSistema: this.CODIGO_SISTEMA,
                listaIdAccionesGrabadas: accionesGrabadasIds,
                codigoTipoDocumentoIdentidad: this.propuesta.codigoTipoDocumentoIdentidad,
                numeroDocumentoIdentidad: this.propuesta.numeroDocumentoIdentidad,
                detalleConsiderando: this.CONSIDERANDO_TEMP_DATAGRID
            },
            idProceso: this.data.proceso.idProceso,
            idTipoResolucion: this.form.value.idTipoResolucion,
            idAlcanceProceso: this.data.proceso.idProceso,// this.data.permisoComite.idAlcanceProceso);
            codigoTipoSede: rolSelected.CODIGO_TIPO_SEDE,
            tipoSede: rolSelected.CODIGO_SEDE,
            usuarioCreacion: usuario.NOMBRES_USUARIO,
            idConsolidadoPlaza:this.idConsolidado,
            idParametroInicial:this.idParametroInicial
          }     
        console.log("*************data", data)
        const formData = new FormData();
        this.appendFormData(formData, data, "");
       // this.appendFormData(formData, objGenerarProyectoResolucion, "");

         console.log("formData",formData);
       // return;

        this.dataService.CuadroHoras()
            //.crearProyectoResolucion(data)
            .crearProyectoResolucion(formData)
            .pipe(
              catchError((e) => { return  this.configCatch(e);        }),
              finalize(() => {    })
            ).subscribe((response: any) => {
                console.log("response mensaje de confirmacion", response)
                if (response.result) {
                    
                    this.dataService.Message().msgSuccess('Proyecto Generado Correctamente.', () => { 
                      this.getDocumento({nombreArchivo:response.documentoProyectoResolucion});
                      this.handleCancelar({ reload: true }); 
                    });
                }else {
                    this.dataService.Message().msgWarning('Error, no se pudo crear el registro.', () => { });
                }                    
            });
    }, () => { });
}
getDocumento(data) {
  this.dataService.Documento().descargar(data.nombreArchivo)
  .pipe(
    catchError((e) => { return  this.configCatch(e);        }),
    finalize(() => { })
  ).subscribe(response => {
      if (response) {
        const data = window.URL.createObjectURL(response);
        this.file = this.sanitizer.bypassSecurityTrustResourceUrl(data);
        this.handlePreview(response, "ResolucionGenerada");
      } else {
        this.dataService.Util().msgWarning('<b>No tiene generado el reporte anexo 1.</b>', () => { });
      }
    });
}
handlePreview(file: any, nameFile: string) {
  this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
      panelClass: 'modal-viewer-form-dialog',
      disableClose: true,
      data: {
          modal: {
              icon: "remove_red_eye",
              title: "Consolidado Plazas",
              file: file
          }
      }
  });

  this.dialogRef.afterClosed().subscribe((response: any) => {
      if (!response) {
          return;
      }
      if (response.download) {
          saveAs(file,   "ResolucionGenerada.pdf");
      }
  });
}
handleCancelar = (data?: any) => {
//   this.matDialogRef.close(data);
}
convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat)
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-')
}
appendFormData(formData, data, rootName) {        
  let root = rootName || "";
  if (data instanceof File) {
      formData.append(root, data);
  } else if (data instanceof Date) {
      formData.append(root, this.convertDate(data));
  } else if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
          this.appendFormData(formData, data[i], root + "[" + i + "]");
      }
  } else if (typeof data === "object" && data) {
      for (var key in data) {
          if (data.hasOwnProperty(key)) {
              if (root === "") {
                  this.appendFormData(formData, data[key], key);
              } else {
                  this.appendFormData(
                      formData,
                      data[key],
                      root + "." + key
                  );
              }
          }
      }
  } else {
      if (data !== null && typeof data !== "undefined") {
          formData.append(root, data);
      }
  }
}
  handleAdjunto(file) {
    if (file === null)
      return;

    this.form.patchValue({ adjuntarDocumento: file[0] });
  }


  descargar(registro) {
    const codigoDocumentoReferencia = registro.codigoDocumentoSustento;
    // if (codigoDocumentoReferencia === null) {
    //   this.dataService.Util().msgWarning(
    //     "La accion grabada no tiene documento adjunto.",
    //     () => { }
    //   );
    //   return true;
    // }

    this.dataService.Spinner().show("sp6");
    this.dataService.Documento().descargar(codigoDocumentoReferencia)
      .pipe(
        catchError((e) => of(null)),
        finalize(() => this.dataService.Spinner().hide("sp6"))
      )
      .subscribe((data) => {
        // const nombreArchivo = "archivo.pdf";
        // saveAs(data, nombreArchivo);
      });
  }
  descargarResolucion(documentoProyectoResolucion) {
    const codigoDocumentoReferencia = documentoProyectoResolucion;
    // if (codigoDocumentoReferencia === null) {
    //   this.dataService.Util().msgWarning(
    //     "La accion grabada no tiene documento adjunto.",
    //     () => { }
    //   );
    //   return true;
    // }

    this.dataService.Spinner().show("sp6");
    this.dataService.Documento().descargar(codigoDocumentoReferencia)
      .pipe(
        catchError((e) => of(null)),
        finalize(() => this.dataService.Spinner().hide("sp6"))
      )
      .subscribe((data) => {
          const nombreArchivo = "archivoResol.pdf";
          saveAs(data, nombreArchivo);
      });
  }

  btnInformacion(registro) {

    this.dialogRef = this.materialDialog.open(ModalVerInformacionComponent, {
      panelClass: 'modal-ver-informacion-dialog',
      disableClose: true,
      width: "500px",
      data: {
        modal: {
          icon: "edit",
          title: "Modificar miembro de comité",
          action: "edit",
          disabled: true
        },
        data: registro
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          // this.cargarGrilla();
        }
      });

  }

  btnEliminar(row) {
    this.dataSource.data = this.dataSource.data.filter(obj => obj !== row);
  }

  btnEliminarConsiderando(row) {
      this.dataSourceConsiderando.data = this.dataSourceConsiderando.data.filter(obj => obj !== row);
  }

  btnDescargarAdjunto(registro) {
    saveAs(registro.codigoDocumentoSustento, registro.name);
  }
  private configCatch(e: any) { 
  console.log("configCatch",e);
    if (e && (e.status === 400 || e.status === 500) && isArray(e.error.messages)) {
      this.dataService.Util().msgWarning(e.error.messages[0], () => { });
    } else {
      this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
  
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  
    }
}

export interface tblGridAccGrab {

  tipoDocumentoSustento: string,
  tipoFormatoSustento: string,

  idTipoResolucion: number,
  idDocumentoSustento: number,
  idAccionGrabada: number,
  idTipoDocumentoSustento: number,
  idTipoFormatoSustento: number,
  numeroDocumentoSustento: string,
  entidadEmisora: string,
  fechaEmision: Date,
  numeroFolios: number,
  sumilla: string,
  codigoDocumentoSustento: string,
  vistoProyecto: boolean,
  activo: boolean,
  fechaCreacion: Date,
  usuarioCreacion: string,
  ipCreacion: string,
  fechaModificacion?: Date,
  usuarioModificacion?: string,
  ipModificacion?: string,
  archivoSustento: File;
  nombreArchivoSustento: string;
}

export interface tblGridConGrab {

  seccion: string,
  tipoSeccion: string,
  idSeccion: number,
  idtipoSeccion: number,
  considerando: string,
  sangria: boolean,
  activo: boolean,
  fechaCreacion: Date,
  usuarioCreacion: string,
  ipCreacion: string,
  fechaModificacion?: Date,
  usuarioModificacion?: string,
  ipModificacion?: string
}
