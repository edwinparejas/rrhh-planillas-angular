import { Component, Inject, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SingleFileInputComponent } from 'app/main/apps/components/single-file-input/single-file-input.component';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ModalVerInformacionSustentoComponent } from './modal-ver-informacion/modal-ver-informacion.component';
import { DatePipe } from '@angular/common';
import { CodigoAccion, CodigoGrupoAccion } from '../../_utils/types-gestion';
import { MESSAGE_GESTION } from '../../_utils/messages';
import { HttpErrorResponse } from '@angular/common/http';
import { TablaSeccion, TablaTipoSeccion } from 'app/core/model/types';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';

@Component({
  selector: 'minedu-modal-proyecto-resolucion',
  templateUrl: './modal-proyecto-resolucion.component.html',
  styleUrls: ['./modal-proyecto-resolucion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ModalProyectoResolucionCronogramaComponent implements OnInit {

  working = false;
  form: FormGroup;
  formSustento: FormGroup;
  formCons: FormGroup;
  tiposDocumentoSustento: any[] = [];
  tiposFormatoSustento: any[] = [];
  tiposDeResolucion: any[] = [];
  maximo: number = 8;
  fechaActual = new Date(new Date().setHours(0, 0, 0, 0));

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
    "mostrarVistoProyecto",
    "acciones"
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

  grillaTemporalSustentos: Array<any> = [];
  ACCIONES_GRABADAS_IDS: Array<any> = [];

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

  esProyectoIndividual: boolean;

  dialogRef: any;
  constructor(
    public matDialogRef: MatDialogRef<ModalProyectoResolucionCronogramaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
    public datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.validBuildData();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idTipoResolucion: [null, [Validators.required]]
    });

    this.formSustento = this.formBuilder.group({
      idTipoDocumentoSustento: [null, [Validators.required]],
      numeroDocumentoSustento: [null, [Validators.required]],
      entidadEmisora: [null, [Validators.maxLength(400)]],
      fechaEmision: [null, [Validators.required]],
      numeroFolios: [null, Validators.compose([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.maxLength(3)])],
      idTipoFormatoSustento: [null, [Validators.required]],
      sumilla: [null, [Validators.maxLength(400)]],
      adjuntarDocumento: [null],
      vistoDeProyecto: [null, [Validators.required]],
    });
    
    this.formCons = this.formBuilder.group({
        considerando: [null, [Validators.required]],
        sangria: [{value: true, disabled: true}]
    });

    this.formSustento.get("numeroFolios").valueChanges.subscribe(value => {
      if (value && value.slice(0, 1) == "0") 
        this.formSustento.patchValue({ numeroFolios: value.replace(/^0+/, '') });
    });
  }

  private validBuildData() {
    this.seccion = TablaSeccion.SECCION;
    this.tipoSeccion = TablaTipoSeccion.PARRAFO;

    this.dataService.GestionProcesos().getTiposDocumentoSustento()
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

    this.dataService.GestionProcesos().getTiposFormatoSustento()
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


    this.dataService.GestionProcesos().getTiposResolucion(this.data.centroTrabajo.idDre, this.data.centroTrabajo.idUgel)
      .pipe(
        catchError((e) => {
          return of(e);
        }),
        finalize(() => { })
      ).subscribe((response) => {
        if (response ) {
          this.tiposDeResolucion = response;
        }
      });

    this.dataService.GestionProcesos().getRegimenGrupoAccion(this.data.proceso.idProceso, CodigoGrupoAccion.Cronograma, CodigoAccion.AprobacionCronograma)
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
        }
      });

  }


  @ViewChildren(SingleFileInputComponent)
  fileComponent: QueryList<SingleFileInputComponent>
  limpiar() {
    this.formSustento.controls['idTipoDocumentoSustento'].reset();
    this.formSustento.controls['numeroDocumentoSustento'].reset();
    this.formSustento.controls['entidadEmisora'].reset();
    this.formSustento.controls['fechaEmision'].reset();
    this.formSustento.controls['numeroFolios'].reset();
    this.formSustento.controls['idTipoFormatoSustento'].reset();
    this.formSustento.controls['sumilla'].reset();
    this.formSustento.controls['adjuntarDocumento'].reset();
    this.formSustento.controls['vistoDeProyecto'].reset();
    this.fileComponent.forEach(c => c.eliminarDocumento());
  };

  agregarAGrillaTemporal() {
    const form = this.formSustento;
    if (!form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }

    if(!(form.value.numeroFolios > 0 && form.value.numeroFolios <= 999)){
      this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_FOLIOS, () => { });
      return;
    }

    const data = this.dataSource.data;
    var cont = data.length;

    let item = {
      registro: cont + 1,
      idTipoDocumentoSustento: form.value.idTipoDocumentoSustento,
      tipoDocumentoSustento: this.tiposDocumentoSustento.filter((ds) => ds.idCatalogoItem == form.value.idTipoDocumentoSustento)[0].descripcionCatalogoItem,
      numeroDocumentoSustento: form.value.numeroDocumentoSustento,
      entidadEmisora: form.value.entidadEmisora,
      fechaEmision: form.value.fechaEmision,
      numeroFolios: +form.value.numeroFolios,
      idTipoFormatoSustento: form.value.idTipoFormatoSustento,
      tipoFormatoSustento: this.tiposFormatoSustento.filter((ts) => ts.idCatalogoItem == form.value.idTipoFormatoSustento)[0].descripcionCatalogoItem,
      sumilla: form.value.sumilla,
      adjunto: form.value.adjuntarDocumento,
      mostrarVistoProyecto: form.value.vistoDeProyecto == "1" ? true : false,
      fechaCreacion: new Date()
    };

    data.push(item);
    this.dataSource.data = data;

    this.limpiar();

  }

  agregarConsiderandoAGrillaTemporal() {
    if (!this.formCons.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }
    const data = this.dataSourceConsiderando.data;
    var cont = data.length;
    let item = {
        orden: cont + 1,
        seccion: this.seccion,
        tipoSeccion: this.tipoSeccion,
        considerando: this.formCons.value.considerando,
        sangria: this.formCons.controls.sangria.value
    };
    data.push(item);
    this.dataSourceConsiderando.data = data;
    
    this.formCons.controls['considerando'].reset();
  }

  guardarDocumentoSustentoYGenerarProyectoResolucion() {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }
    const documentosSustento: Array<any> = this.dataSource.data;
    if (documentosSustento.length < 1 || documentosSustento.filter(x => x.mostrarVistoProyecto == true).length == 0){
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M124, () => {});
      return;
    }

    const usuario = this.dataService.Storage().getPassportUserData();

    let objGenerarProyectoResolucion = new FormData();
    objGenerarProyectoResolucion.append('idProceso', this.data.proceso.idProceso);
    objGenerarProyectoResolucion.append('idTipoResolucion', this.form.value.idTipoResolucion);
    objGenerarProyectoResolucion.append('codigoTipoSede', this.data.passport.codigoTipoSede);
    objGenerarProyectoResolucion.append('tipoSede', this.data.passport.codigoSede);
    objGenerarProyectoResolucion.append('usuarioCreacion', usuario.NOMBRES_USUARIO);

    for (let i = 0; i < this.data.etapasProceso.length; i++) {
      objGenerarProyectoResolucion.append("etapasProceso[" + i + "].idCronograma", this.data.etapasProceso[i].idCronograma);
      objGenerarProyectoResolucion.append("etapasProceso[" + i + "].idEtapaProceso", this.data.etapasProceso[i].idEtapaProceso);
    }

    for (let i = 0; i < documentosSustento.length; i++) {
      var fechaEmision = this.datepipe.transform(documentosSustento[i].fechaEmision, 'dd/MM/yyyy');

      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].idTipoDocumentoSustento", documentosSustento[i].idTipoDocumentoSustento);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].numeroDocumentoSustento", documentosSustento[i].numeroDocumentoSustento);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].entidadEmisora", documentosSustento[i].entidadEmisora ?? "");
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].fechaEmision", fechaEmision);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].numeroFolios", documentosSustento[i].numeroFolios);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].idTipoFormatoSustento", documentosSustento[i].idTipoFormatoSustento);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].adjunto", documentosSustento[i].adjunto);
      objGenerarProyectoResolucion.append("documentosSustento[" + i + "].sumilla", documentosSustento[i].sumilla ?? "");
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
      this.dataService.GestionProcesos().crearProyectoResolucionCronograma(objGenerarProyectoResolucion)
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

  handleAdjunto(file) {
    if (file === null)
      return;

    this.formSustento.patchValue({ adjuntarDocumento: file[0] });
  }

  btnInformacion(registro) {

    this.dialogRef = this.materialDialog.open(ModalVerInformacionSustentoComponent, {
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

  btnVerDocumentoSustento(adjunto) {
    this.handlePreview("Ver documento de sustento", adjunto, adjunto.name.replaceAll('.pdf',''));
  }
  
  handlePreview(title: string, file: any, nameFile: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
              icon: 'remove_red_eye',
              title: title,
              file: file,
              fileName: nameFile
            }
        }
    });

    this.dialogRef.afterClosed()
    .subscribe((response: any) => {
        if (!response) return
    });
  }
}
