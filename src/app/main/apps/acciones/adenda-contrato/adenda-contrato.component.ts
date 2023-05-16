import { SharedService } from 'app/core/shared/shared.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
// import { BuscarPlazaComponent } from '../components/buscar-plaza/buscar-plaza.component';
import { BuscarCentroTrabajoComponent } from '../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BuscarPersonaComponent } from '../gestionar-vinculacion/components/buscar-persona/buscar-persona.component';
import { HttpErrorResponse } from '@angular/common/http';
import { BuscarPlazaComponent } from '../gestionar-vinculacion/components/buscar-plaza/buscar-plaza.component';
import { AdjuntarDocumentoComponent } from './components/adjuntar-documento/adjuntar-documento.component';
import { descargarExcel } from 'app/core/utility/functions';
import { isNumber } from 'lodash';
import { DocumentViewerComponent } from '../../components/document-viewer/document-viewer.component';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ModalMonitorVinculacionComponent } from '../gestionar-vinculacion/vinculacion/components/modal-monitor-instancias/modal-monitor-vinculacion.component';
import * as moment from 'moment';
import { CentroTrabajoModel, TablaEquivalenciaSede } from '../gestionar-vinculacion/models/vinculacion.model';
import { CodigoDreUgelService } from '../pronoei/services/codigo-dre-ugel.service';

@Component({
  selector: 'minedu-adenda-contrato',
  templateUrl: './adenda-contrato.component.html',
  styleUrls: ['./adenda-contrato.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AdendaContratoComponent implements OnInit, OnDestroy, AfterViewInit {

  centroTrabajo: CentroTrabajoModel = null;
  
  Nombre_Usuario = "";
  idDre = 0
  idUgel = 0
  codigoTipoSede = "";
  codigoSede = "";
  codigoRol = "";

  working = false;
  form: FormGroup;

  now = new Date();
  minDate = new Date("July 21, 1890 01:15:00");
  untilDate = new Date();

  FechaFinalBusqueda = new Date(new Date().getFullYear(), 11, 31);

  TipoContrato = "contrato";

  dataUserLoginModel: any;

  combo = {
    tiposDocumentoIdentidad: [],
    estadosContrato: [],
    gruposAccion: [],
    acciones: [],
    motivosAccion: [],
    listAccion: [],
    listMotivoAccion: [],
    listMandatoJudicial: [],
    listTipoDocumento: [],
    listEstado: [],
    listTieneAdenda: []
  }

  displayedColumns: string[] = [
    'nro',
    'numeroContrato',
    'fechaContrato',
    // 'grupoAccion',
    'accion',
    'motivoAccion',
    'mandatoJudicial',
    'numeroDocumentoIdentidad',
    'nombresCompletos',
    'fechaInicio',
    'fechaFin',
    'codigoPlaza',
    // 'cargo',
    // 'centroTrabajo',
    'tieneAdenda',
    'estado',
    'opciones'
  ];

  private currentSession: SecurityModel = new SecurityModel();
  private passport: SecurityModel = new SecurityModel();

  dialogRef: any;

  dataSource: AdendaDataSource | null;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private sharedService: SharedService,
    private materialDialog: MatDialog,
    private codigoDreUgelService: CodigoDreUgelService
  ) { }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    debugger;
    setTimeout(_ => this.buildShared());
    this.buildForm();
    

    this.buildPassport();   
    
    this.getDreUgelData(); 
    this.entidadPassport();
    
    this.loadCombos();

    this.buildGrid();   

 //   this.entidadPassport();
  //  this.obtenerCodigoDreUgelLogeado();

    //if (this.currentSession.codigoRol=='AYNI_019' && (this.codigoTipoSede=='TS001' || this.codigoTipoSede=='TS002' || this.codigoTipoSede=='TS012'))
    //this.handleModalInstancia();
  }

  private async getDreUgelData() {

    this.codigoTipoSede = this.codigoDreUgelService.passportModel.CODIGO_TIPO_SEDE;
    this.codigoSede = this.codigoDreUgelService.passportModel.CODIGO_SEDE;
    this.codigoRol = this.codigoDreUgelService.passportModel.CODIGO_ROL;

    if (this.codigoRol == 'AYNI_019' && this.codigoDreUgelService.passportInstanciaModel) {
      this.codigoSede = this.codigoDreUgelService.passportInstanciaModel.codigoInstancia;
    }

    await this.codigoDreUgelService.getCodigoDreUgelFromServiceInit();
    const codigos = this.codigoDreUgelService.getCodigoDreUgel();

    if (codigos) {          
        this.idUgel = codigos.idUgel;
        this.idDre = codigos.idDre;  
    }

  }

  buildPassport() {
    debugger
    this.passport = this.dataService.Storage().getInformacionUsuario();    
    const usuario = this.dataService.Storage().getPassportUserData();
    this.Nombre_Usuario = usuario.NOMBRES_USUARIO;
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
  }

  entidadPassport(){
    this.dataService.AccionesVinculacion().entidadPassport(this.passport.codigoSede).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response.length > 0){
        if (response.length > 1)
          response = response.filter(x => x.idNivelInstancia <= 3);

        if (response.length == 1 && response[0].idNivelInstancia == 3)
        this.passport.codigoTipoSede = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;

        this.centroTrabajo = response[0];
        this.idDre = this.centroTrabajo?.idDre;
        this.idUgel = this.centroTrabajo?.idUgel;
        this.codigoTipoSede = this.passport.codigoTipoSede;

        this.handleBuscar();
      }else{
        this.centroTrabajo = null;
      }
    });
  }

  ActualizarFecha(){

    var anioBusqueda = new Date(this.form.get('anio').value).getFullYear();
    this.FechaFinalBusqueda = new Date(anioBusqueda, 11, 31);
    console.log(anioBusqueda + " - " + this.FechaFinalBusqueda);
  }

  handleModalInstancia(){
    debugger
    console.log("codigoSede Original: ",this.currentSession.codigoSede);

    // console.log("Busqueda personalizada data ",  this.idEtapaProceso, 'busqueda');
    this.dialogRef = this.materialDialog.open(ModalMonitorVinculacionComponent, {
        panelClass: "minedu-modal-monitor-vinculacion",
        width: "1100px",
        disableClose: true,
        data: {
            codigoRol:this.currentSession.codigoRol,
            codigoSede:this.currentSession.codigoSede,
            codigoTipoSede:this.currentSession.codigoTipoSede,
        },
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      debugger
        if (result != null) {
            if(result.codigoSede != null)
                this.handleSeleccionarSedeMonitor(result.codigoSede);
                this.obtenerCodigoDreUgelLogeado();
                this.handleBuscar();

        }
    });
  }

  handleSeleccionarSedeMonitor(codigoSede){
    debugger
    // console.log("Detalles de Sesion 150103",this.dataService.Storage().getPassportRolSelected());
    var rolSession = this.dataService.Storage().getPassportRolSelected();
    rolSession.CODIGO_SEDE = codigoSede;//"150209";
    this.dataService.Storage().setPassportRolSelected(rolSession);
    // console.log("Detalles de Sesion ¿150209??",this.dataService.Storage().getPassportRolSelected());
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    console.log("codigoSede Alterado: ",this.currentSession.codigoSede);

    this.dataService.Storage().getInformacionUsuario()
  }

  obtenerCodigoDreUgelLogeado(): void {
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    const sedeSeleccionado = rolSelected.CODIGO_SEDE;
    const request = {
      codigoEntidadSede: sedeSeleccionado
    };
    this.dataService.AccionesVinculacion().getCodigoDreUgel(request).subscribe(
      (response) => {
        console.log('obtenerCodigoDreUgelLogeado() =>', response);
        this.dataUserLoginModel = response;
        if (this.dataUserLoginModel == null) {
          this.dataService
            .Message()
            .msgWarning(
              '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
              () => { }
            );
        } else {
          this.handleBuscar();
        }
      }, 
      (error: HttpErrorResponse) => {
      }
    )
  }


  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.handleBuscar())
      )
      .subscribe();
  }

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Gestionar contratos DL 1057");
    this.sharedService.setSharedTitle("Gestionar contratos DL 1057");
  }

  buildForm() {
    this.form = this.formBuilder.group({
      anio: [new Date()],
      numeroDocumentoIdentidad: [null],
      codigoPlaza: [null],
      idMotivoAccion: [-1],
      fechaInicio: [null],
      fechaTermino: [null],
      idMandatoJudicial: [-1],
      idTipoDocumento: [-1],
      idEstado: [-1],

      idTieneAdenda: [-1],

      idDre: [null],
      idUgel: [null],
    });

    this.form.get("anio").valueChanges.subscribe(value => {
      debugger
      if (value) {
        this.onChangeMinMaxDate(); 
      }
    });

  }

  onChangeMinMaxDate() {
    const anio = new Date(this.form.get('anioDt').value).getFullYear();
    this.minDate = new Date(anio, 0, 1);
    this.untilDate = new Date(anio, 11, 31);
  }


  buildGrid() {
    this.dataSource = new AdendaDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";

    this.paginator._intl.getRangeLabel = function (page, pageSize, length) {
      if (length === 0 || pageSize === 0) {
        return '0 de ' + length;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      // If the start index exceeds the list length, do not try ngAfterViewInit fix the end index to the end.
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return startIndex + 1 + ' - ' + endIndex + ' de ' + length;
    }; 
  }

  

  buscarPersona(event) {
    event.preventDefault();
    const idTipoDocumentoIdentidad = this.form.get("idTipoDocumentoIdentidad").value;
    if (!idTipoDocumentoIdentidad) {
      this.dataService.Message().msgWarning('Seleccione el tipo de documento de identidad de la persona.', () => { });
      return;
    }
    const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad").value;
    if (!numeroDocumentoIdentidad) {
      this.dataService.Message().msgWarning('Ingrese el número de documento de identidad de la persona para realizar la búsqueda.', () => { });
      return;
    }
    this.dataService.Spinner().show("sp6");
    this.dataService.Acciones().getServidorPublico(idTipoDocumentoIdentidad, numeroDocumentoIdentidad).pipe(
      catchError(() => of(null)),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response && response.result) {
        // this.persona = response.data;
      } else {
        this.dataService.Message().msgWarning('Datos no encontrados para los criterios de búsqueda ingresados.', () => { });
        //  this.persona = null;
      }
    });
  }

  buscarPersonaDialogo(event) {
    event.preventDefault();
    const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad").value;
    if (numeroDocumentoIdentidad) {
      this.buscarPersona(event);
      return;
    }

    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (codigoPlaza) {
      this.buscarPlaza(event);
      return;
    }

    this.dialogRef = this.materialDialog.open(
      BuscarPersonaComponent,
      {
        panelClass: 'buscar-persona-form-dialog',
        disableClose: true,
        data: {
          action: "busqueda",
        },
      }
    );

    this.dialogRef.afterClosed().subscribe((resp) => {
      if (resp != null) {
        // const servidorPublico = resp.servidorPublico;
        // this.idServidorPublicoSelected =
        //     servidorPublico.idServidorPublico;
        // this.form
        //     .get("idTipoDocumentoIdentidad")
        //     .setValue(servidorPublico.idTipoDocumentoIdentidad);
        // this.form
        //     .get("numeroDocumentoIdentidad")
        //     .setValue(servidorPublico.numeroDocumentoIdentidad);
        // this.obtenerDatosServidorPublico(
        //     this.idServidorPublicoSelected
        // );
      }
    });
  }

  buscarPlaza(event) {
    event.preventDefault();
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (!codigoPlaza) {
      this.dataService.Message().msgWarning('Ingrese el código de plaza para realizar la búsqueda.', () => { });
      return;
    }
    this.dataService.Spinner().show("sp6");
    this.dataService.Acciones().getPlazaPorCodigo(codigoPlaza).pipe(
      catchError(() => of(null)),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response && response.result) {
        //this.plaza = response.data;
      } else {
        this.dataService.Message().msgWarning('Datos no encontrados para el criterio de búsqueda ingresado.', () => { });
        //this.plaza = null;
      }
    });
  }

  buscarPlazaDialogo(event) {
    event.preventDefault();
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (codigoPlaza) {
      this.buscarPlaza(event);
      return;
    }

    this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
      panelClass: 'buscar-plaza-form-dialog',
      disableClose: true,
      data: {

      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        console.log(response);
        this.form.patchValue({ codigoPlaza: response.codigo_plaza });
        // this.plaza = response;
      });
  }

  buscarCentroTrabajo(event) {
    event.preventDefault();
    const codigoCentroTrabajo = this.form.get("codigoCentroTrabajo").value;
    if (!codigoCentroTrabajo) {
      this.dataService.Message().msgWarning('Ingrese el código de centro de trabajo para realizar la búsqueda', () => { });
      return;
    }
    this.dataService.Spinner().show("sp6");
    this.dataService.Acciones().getCentroTrabajoPorCodigo(codigoCentroTrabajo).pipe(
      catchError(() => of(null)),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response && response.result) {
        //  this.centroTrabajo = response.data;
      } else {
        this.dataService.Message().msgWarning('Centro de trabajo no encontrado para el código ingresado', () => { });
      }
    });
  }

  buscarCentroTrabajoDialogo(event) {
    event.preventDefault();
    const codigoModular = this.form.get("codigoModular").value;
    if (codigoModular) {
      this.buscarCentroTrabajo(event);
      return;
    }
    this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
      panelClass: 'buscar-centro-trabajo-form-dialog',
      disableClose: true,
      data: {
        action: 'buscar',
        //centroEstudio: this.form.value
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        // this.centroTrabajo = response;
      });
  }

  handleVerContratoGenerado() {

  }

  handleVerCartaCese() {

  }

  handleVerContratoSuscrito(row) {
    this.dataService.AccionesVinculacion().getGestionContratoDocumentos(row.id_gestion_contrato).subscribe(
      (resp) => {
        console.log("handleVerContratoSuscrito() =>", resp);
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(resp.documento_contrato_firmado ?? resp.documento_contrato_sin_firma)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreviewS1(response, resp.documento_contrato_firmado ?? resp.documento_contrato_sin_firma);
                } else {
                    this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO.', () => {
                    });
                }
            });
      },
      (error: HttpErrorResponse) => {
        console.log("handleVerContratoSuscrito() => ", error);
      }
    );
  }

  handlePreviewS1(file: any, codigoAdjuntoSustento: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: 'Contrato',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });

    this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
  };

  handleVerAgendaGenerada() {

  }

  handleVerAgendaSuscrita() {

  }

  handleGestionarAdenda(row) {
    console.log(row);
    this.router.navigate(['ayni/personal/acciones/contratoadenda/bandeja-adenda/' + row.id_gestion_contrato]);
  }

  handleEliminar(row, index) {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ELIMINAR LA INFORMACIÓN.?', () => {
      this.dataService.Spinner().show("sp6");
      let viewModel = {
        id_gestion_contrato: parseInt(row.id_gestion_contrato)
      }
      this.dataService.AccionesVinculacion().eliminarGestionContrato(viewModel).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgAutoSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
            this.handleBuscar();
          });
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      )
    }, () => { });
  }

  handleGenerarContrato(row, index) {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA GENERAR EL CONTRATO.?', () => {
      this.dataService.Spinner().show("sp6");
      
      let viewModel = {
        id_gestion_contrato: parseInt(row.id_gestion_contrato),
        locationPdfTemplates: '',
        pathWrite: ''
      }

      this.dataService.AccionesVinculacion().generarContrato(viewModel).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
            this.handleBuscar();
          });
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      )
    }, () => { });
  }

  handleAdjuntarContratoSuscrito(row) {
    let dialogRef = this.materialDialog.open(AdjuntarDocumentoComponent, {
      panelClass: 'adjuntar-documento-suscrito-form-dialog',
        disableClose: true,
        data: {
          id_gestion_contrato: row.id_gestion_contrato,
          id_gestion_adenda: 0,
          titulo: 'Adjuntar contrato suscrito'
        }
    });
    dialogRef.afterClosed()
    .subscribe((response: any) => {
      debugger
      if (!response) {
        return;
      }
      console.log(response);
    });
  }

  handleBuscar() {
    const form = this.form.value;
    form.idDre = this.idDre;
    form.idUgel = this.idUgel;
    this.dataSource.load(this.form.value, (this.paginator.pageIndex + 1), this.paginator.pageSize == null ? 10 : this.paginator.pageSize  );
  }

  handleExportar() {
      this.dataService.Spinner().show("sp6");
      let body = this.form.getRawValue();
      body.anio = new Date(this.form.get('anio').value).getFullYear();

      this.dataService.AccionesVinculacion().getGestionContratoExcel(body).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          const fecha = moment().format('DDMMYYYY');
          descargarExcel(response, `Contratos DL 1057 ${fecha}.xlsx`);
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      ) 
  }

  handleLimpiar() {    
    this.form = this.formBuilder.group({
      anio: [new Date()],
      numeroDocumentoIdentidad: [null],
      codigoPlaza: [null],
      idMotivoAccion: [-1],
      fechaInicio: [null],
      fechaTermino: [null],
      idMandatoJudicial: [-1],
      idTipoDocumento: [-1],
      idEstado: [-1],

      idTieneAdenda: [-1]
    });

    this.handleBuscar();
  }

  handleNuevo(){
    
    this.router.navigate(['ayni/personal/acciones/contratoadenda/agregarcontrato/' + this.TipoContrato])
  }


  loadCombos = () => {
    // this.loadAnio();
    // this.loadRegimenesLaborales();
    //this.loadAcciones();
    this.loadMotivosAcciones();
    this.loadMandatoJudicial();
    this.loadTipoDocumento();
    this.loadEstado();
    this.loadTieneAdenda();
  } 

  
  loadAcciones = () => {
    this.dataService.AccionesVinculacion().getComboAccion().subscribe(
      (response) => {
        this.combo.listAccion = response;
        this.combo.listAccion.unshift({
          id_accion: -1,
          descripcion_accion: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadMotivosAcciones = () => {
    const params = {
      id_accion: 34
    }
    this.dataService.AccionesVinculacion().getComboMotivoAccion(params).subscribe(
      (response) => {
        this.combo.listMotivoAccion = response;
        this.combo.listMotivoAccion.unshift({
          id_motivo_accion: -1,
          descripcion_motivo_accion: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadMandatoJudicial= () => {
    this.combo.listMandatoJudicial.unshift({
      value: 1,
      label: 'SI'
    })
    this.combo.listMandatoJudicial.unshift({
      value: 0,
      label: 'NO'
    })
    this.combo.listMandatoJudicial.unshift({
      value: -1,
      label: '--TODOS--'
    })
  }

  loadTieneAdenda= () => {
    this.combo.listTieneAdenda.unshift({
      value: 1,
      label: 'SI'
    })
    this.combo.listTieneAdenda.unshift({
      value: 0,
      label: 'NO'
    })
    this.combo.listTieneAdenda.unshift({
      value: -1,
      label: '--TODOS--'
    })
  }


  loadTipoDocumento = () => {
    let request = {
      codigoCatalogo: 6,
      Inactivo: true
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        this.combo.listTipoDocumento = response;
        this.combo.listTipoDocumento.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadEstado = () => {
    let request = {
      codigoCatalogo: 133
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        this.combo.listEstado = response;
        this.combo.listEstado.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  buscarPlazaPersona(event) {
    event.preventDefault();
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (codigoPlaza) {
      this.buscarPlaza(event);
      return;
    }

    this.dialogRef = this.materialDialog.open(BuscarPersonaComponent, {
      panelClass: 'buscar-persona-form-dialog',
      disableClose: true,
      data: {
        esProceso: false
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        console.log('persona selected - close => ', response);
        this.form.patchValue({ 
          numeroDocumentoIdentidad: response.numeroDocumentoIdentidad,
          idTipoDocumento: response.idTipoDocumentoIdentidad
        });
        // this.plaza = response;
      });
  }


  onKeyPressNumeroDocumento(e: any): boolean {
    let _idTipoDocumento  = this.form.get('idTipoDocumento').value;
    let tipoDocumentoSelect = this.combo.listTipoDocumento.find(m => m.id_catalogo_item == _idTipoDocumento);
    if (tipoDocumentoSelect.codigo_catalogo_item == 1) {
      //------------ DNI
      const reg = /^\d+$/;
      const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
      }  
    } else {
      //------------ PASAPORTE O CARNET DE EXTRANJERIA
      var inp = String.fromCharCode(e.keyCode);

      if (/[a-zA-Z0-9]/.test(inp)) {
        return true;
      } else {
        e.preventDefault();
        return false;
      }
    }    
  }

  onKeyPressCodigoPlaza(e: any): boolean {
    var inp = String.fromCharCode(e.keyCode);

      if (/[a-zA-Z0-9]/.test(inp)) {
        return true;
      } else {
        e.preventDefault();
        return false;
      }  
  }

  handleModificar(row) {
    this.router.navigate(['ayni/personal/acciones/contratoadenda/accioncontrato/contrato/edit/' + row.id_gestion_contrato ])
  }

  handleInformacion(row) {
    this.router.navigate(['ayni/personal/acciones/contratoadenda/accioncontrato/contrato/info/' + row.id_gestion_contrato ])
  }

}

export class AdendaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    
    if (isNaN(data.anio)) {
      data.anio = new Date();
    }
    if (isNumber(data.anio)) {
      data.anio = new Date(data.anio, 1, 1);
    }

    data.anio = new Date(data.anio).getFullYear();
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;

    console.log('handleSearch() => ', data);

    this.dataService.AccionesVinculacion().getGestionContratoPaginado(data).pipe(
      catchError(() => of([])),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      this._dataChange.next(response || []);
      if ((response || []).length > 0) {
        this._totalRows = (response[0] || [{ total: 0 }]).total;
      } else {
        this._totalRows = 0;
        this.dataService.Message().msgWarning('NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO', () => { });
      }
    });
    

    
  }

  connect(collectionViewer: CollectionViewer): Observable<[]> {
    return this._dataChange.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._dataChange.complete();
    this._loadingChange.complete();
  }

  get dataTotal(): any {
    return this._totalRows;
  }

  get data(): any {
    return this._dataChange.value || [];
  }

  


}

