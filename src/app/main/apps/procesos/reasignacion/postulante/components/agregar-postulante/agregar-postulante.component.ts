import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { TipoOperacionEnum } from 'app/core/model/types';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SecurityModel } from 'app/core/model/security/security.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { DatosModificarServidorPublico, DatosServidorPublicoModel, OpcionFiltro, ResultadoOperacionEnum, TablaPermisos } from '../../../models/reasignacion.model';
import { of, pipe, BehaviorSubject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { isArray } from 'lodash';
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '@minedu/animations/animations';
import { HttpClient } from '@angular/common/http';
import { MENSAJES, TablaTipoDocumentoIdentidad, TablaEtapaPostulacion } from '../../../_utils/constants';
import { BuscarServidorPublicoComponent} from '../../../components/buscar-servidor-publico/buscar-servidor-publico.component';
import { BuscarVinculacionesComponent } from '../../../components/buscar-vinculaciones/buscar-vinculaciones.component';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';

@Component({
  selector: 'minedu-agregar-postulante',
  templateUrl: './agregar-postulante.component.html',
  styleUrls: ['./agregar-postulante.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AgregarPostulanteComponent implements OnInit {
  ipAddress = '';
  idOperacion: number;
  idep: number;
  idetp: number;
  tipoDocumento: string;
  numeroDocumento: string;
  dialogTitle: string;
  dialogRef: any;
  icon = 'create';
  idPostulacion: string;
  tipoOperacion = TipoOperacionEnum;
  currentSession: SecurityModel = new SecurityModel();
  working = false;
  workingServidor: boolean = false;
  workingInforme: boolean = false;
  servidorPublico = null;
  plaza = null;
  vinculacionesVigentes = null;
  form: FormGroup;
  formInforme: FormGroup;
  formExpediente: FormGroup;
  formPostular: FormGroup;
  now = new Date();
  idpr: number;
  servidor: DatosServidorPublicoModel = null;
  opcionFiltro: OpcionFiltro = new OpcionFiltro();
  datoPersona: DatosServidorPublicoModel = new DatosServidorPublicoModel();
  dtExtra: DatosModificarServidorPublico = new DatosModificarServidorPublico();
  desactivarDocumentoIdentidad:boolean = true;
  selectCausal = 0;
  selectEtapa = 0;

  numeroEscalafonario: string;
  fechaEscalafonario: string;
  documentoEscalafonario: string;

  comboLists = {
    listTipoDocumento: [],
    listCausal: [],
    listEtapaPostulante: [],
  }

  dato = {
    tipo_documento: '',
    numero_documento: ''
  }

  //Informe escalafonario
  informe = null;
  idDetalleInformeEscalafonario = null;
  centroTrabajo = null;
  postulacion = null;
  estudios = [];
  meritos = [];
  sanciones = [];

    /*
        *_____________________________estudios___________________________________
     */
        displayedColumnsEstudios: string[] = [
            'index',
            'centroEstudios',
            'especialidad',
            'gradoAcademico',
            'grupoCarrera',
            'nivelEducativo',
            'situacionAcademica',
            'titulo',
            'anioInicio',
            'anioFin'
        ];
        private _loadingChangeEstudios = new BehaviorSubject<boolean>(false);
        loadingEstudios = this._loadingChangeEstudios.asObservable();
        dataSourceEstudios: MatTableDataSource<any>;
        selectionEstudios = new SelectionModel<any>(false, []);
        /*
            *_____________________________meritos___________________________________
         */
        displayedColumnsMerito: string[] = [
            'index',
            'tipoMerito',
            'merito',
            'fechaMerito',
            'instancia'
        ];
        private _loadingChangeMerito = new BehaviorSubject<boolean>(false);
        loadingMerito = this._loadingChangeMerito.asObservable();
        dataSourceMerito: MatTableDataSource<any>;
        selectionMerito = new SelectionModel<any>(false, []);
        /*
            *_____________________________sanciones___________________________________
         */
        displayedColumnsSancion: string[] = [
            'index',
            'tipoDemerito',
            'demerito',
            'fechaInicio',
            'fechaFin'
        ];
        private _loadingChangeSancion = new BehaviorSubject<boolean>(false);
        loadingSancion = this._loadingChangeSancion.asObservable();
        dataSourceSancion: MatTableDataSource<any>;
        selectionSancion = new SelectionModel<any>(false, []);

  constructor(
    private http: HttpClient,
    public matDialogRef: MatDialogRef<AgregarPostulanteComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
  ) {
    this.idOperacion = data.idOperacion;
    this.idPostulacion = data.idPostulacion;
    this.idep = data.idep;
    this.idetp = data.idetp;
    this.tipoDocumento = data.tipoDocumento;
    this.numeroDocumento = data.numeroDocumento;
    this.currentSession = data.currentSession;
  }
  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false
  };

  ngOnInit(): void {
    this.idpr = this.data.id;
    this.buildForm();
    this.buildSeguridad();
    this.loadTipoDocumento();
    this.loadCausal();
    this.loadEtapaPostulante();
    this.form.controls['documentoIdentidad'].disable();

    if (this.idOperacion === TipoOperacionEnum.Modificar) {
        this.form.patchValue({
            idTipoDocumento: this.tipoDocumento,
            documentoIdentidad: this.numeroDocumento
        });
      this.GetPostulacion();
    }else if (this.idOperacion === TipoOperacionEnum.Ver) {
        this.formExpediente.controls['numeroExpediente'].disable();
        this.formExpediente.controls['fechaExpediente'].disable();
        this.formPostular.controls['idCausal'].disable();
        this.formPostular.controls['idEtapa'].disable();
        this.formInforme.controls['escalafonario'].disable();
        this.GetPostulacion();
    } else {
      this.servidor = new DatosServidorPublicoModel();
      this.working = false;
    }
    this.configurarDatoInicial();

  }

  ngAfterInit(){
    if (this.idOperacion === TipoOperacionEnum.Registrar) {
        this.lengthDocumento("");
      }
  }

  buildSeguridad = () => {
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  loadCausal = () => {
    this.dataService.Reasignaciones()
      .getComboCausal()
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          const data = response.map((x) => ({
            ...x,
            value: x.id,
            label: `${x.descripcion}`,
          }));
          this.comboLists.listCausal = data;
        //   this.comboLists.listCausal.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  }

  loadEtapaPostulante = () => {
    this.dataService.Reasignaciones()
      .getComboEtapaPostulante()
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          const data = response.map((x) => ({
            ...x,
            value: x.id,
            label: `${x.descripcion}`,
          }));
          this.comboLists.listEtapaPostulante = data;
        //   this.comboLists.listEtapaPostulante.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  }

  resetForm = () => {
    this.form.reset();
    this.form.get('idTipoDocumento').setValue(null);
    this.form.get('documentoIdentidad').setValue(null);
    this.servidorPublico = null;
    this.plaza = null;
    this.form.controls['documentoIdentidad'].disable();
  }

  setDato = () => {
    if (this.idOperacion === TipoOperacionEnum.Modificar) {
      this.dato = {
        tipo_documento: this.tipoDocumento,
        numero_documento: this.numeroDocumento,
      }
    } else {
      this.dato = {
        tipo_documento: this.form.get('idTipoDocumento').value,
        numero_documento: this.form.get('documentoIdentidad').value
      }
    }
  }

  handleBuscar = () => {
    const form = this.form.value;
    if (!form.documentoIdentidad) {
        this.dataService.Message().msgWarning('DEBE INGRESAR UN NÚMERO DE DOCUMENTO PARA REALIZAR LA BÚSQUEDA.', () => {
        });
        return;
    }
    if (form.documentoIdentidad.length < 8 || form.documentoIdentidad.length > 12) {
        this.dataService.Message().msgWarning('DEBE INGRESAR UN NÚMERO DE DOCUMENTO DE (8 A 12) DÍGITOS PARA REALIZAR LA BÚSQUEDA.', () => {
        });
        return;
    }
    const data = {
        idTipoDocumentoIdentidad: form.idTipoDocumento,
        numeroDocumentoIdentidad: form.documentoIdentidad
      }
    this.workingServidor = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
    .Reasignaciones().getVinculacionPostulante(data).pipe(
        catchError(() => of([])),
        finalize(() => {
            this.dataService.Spinner().hide("sp6");
        })
    )
    .subscribe((response: any) => {
        if (response && response.length != 0) {
            this.vinculacionesVigentes = response;
            if(response.length > 1){
                let dialogRef = this.materialDialog.open(BuscarVinculacionesComponent, {
                    panelClass: 'minedu-buscar-vinculaciones-dialog',
                      disableClose: true,
                      data: {
                           vinculaciones: this.vinculacionesVigentes,
                           persona: null
                      }
                  });
                  dialogRef.afterClosed().subscribe((response: any) => {
                    if (!response) {
                      return;
                    }else{
                            this.dataService
                            .Reasignaciones()
                            // .getServidorPublico(form.idTipoDocumento, form.documentoIdentidad)
                            .getServidorPublicoVinculaciones(form.idTipoDocumento, form.documentoIdentidad, response.idPlaza)
                            .pipe(
                                catchError((e) => { return  this.configCatch(e);        }),
                                finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingServidor = false; })
                            ).subscribe((response: any) => {
                                if (response) {
                                    const { servidorPublico, plaza } = response;
                                    this.servidorPublico = servidorPublico;
                                    this.plaza = plaza;
                                } else {
                                    this.dataService.Message().msgWarning('"DOCUMENTO BUSCADO NO PERTENECE A UN SERVIDOR PÚBLICO."', () => { });
                                }
                            });
                    }
                  });
            }else{
                    this.dataService
                    .Reasignaciones()
                    .getServidorPublico(form.idTipoDocumento, form.documentoIdentidad)
                    .pipe(
                        catchError((e) => { 
                            
                            return  this.configCatch(e);        }),
                        finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingServidor = false; })
                    ).subscribe((response: any) => {
                        if (response) {
                            const { servidorPublico, plaza } = response;
                            this.servidorPublico = servidorPublico;
                            this.plaza = plaza;
                        } else {
                            this.dataService.Message()
                            .msgWarning('"DOCUMENTO BUSCADO NO PERTENECE A UN SERVIDOR PÚBLICO, O EL SERVIDOR PÚBLICO NO PERTENECE AL REGIMEN LABORAL LEY 29944."', () => { });
                        }
                    });
            }
        }else{
            this.dataService.Message().msgWarning('"DOCUMENTO BUSCADO NO PERTENECE A UN SERVIDOR PÚBLICO, O EL SERVIDOR PÚBLICO NO PERTENECE AL REGIMEN LABORAL LEY 29944."', () => { });
        }
    });
  };

  getVinculacionPostulante() {
    const numeroDocumentoIdentidad = this.servidorPublico.numeroDocumentoIdentidad;
    this.dataService.Spinner().hide("sp6");
    this.dataService.Contrataciones().getVinculacionPostulanteByNumeroDocumentoApiRest(numeroDocumentoIdentidad).pipe(
        catchError(() => of([])),
        finalize(() => {
            this.dataService.Spinner().hide("sp6");
        })
    )
    .subscribe((response: any) => {
        if (response && response.length != 0) {
            this.vinculacionesVigentes = response;
        }
    });
  }

  handleVerVinculacionVigente(){
    let dialogRef = this.materialDialog.open(BuscarVinculacionesComponent, {
      panelClass: 'minedu-buscar-vinculaciones-dialog',
        disableClose: true,
        data: {
            id_persona: this.servidorPublico.id_persona
        }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (!response) {
        return;
      }
      console.log(response);
    });
  }

  handleLimpiar = () => {
    this.resetForm();
  }

  buildForm = () => {
    this.form = this.formBuilder.group({
      idTipoDocumento: [null, [Validators.required]],
      documentoIdentidad: [null, [Validators.required]]
    });
    this.formExpediente = this.formBuilder.group({
        numeroExpediente: [null, [Validators.required]],
        fechaExpediente: [null, [Validators.required]]
      });
      this.formPostular = this.formBuilder.group({
        idCausal: [null, [Validators.required]],
        idEtapa: [null, [Validators.required]]
      });
      this.formInforme = this.formBuilder.group({
        escalafonario: [null,[Validators.required]],
        numeroEscalafonario: [null],
        fechaEscalafonario: [null],
        documentoEscalafonario: [null]
      });

      this.dataSourceEstudios = new MatTableDataSource([]);
      this.dataSourceMerito = new MatTableDataSource([]);
      this.dataSourceSancion = new MatTableDataSource([]);

      this.formPostular.get("idEtapa").valueChanges.subscribe((value) => {
        if (value) {
            const idEtapaPostulacion = this.formPostular.get("idEtapa").value;
            const etapaPostulacion = this.comboLists.listEtapaPostulante.find(pred => pred.value === idEtapaPostulacion);
            const plaza = this.plaza;
            switch (etapaPostulacion?.codigo) {
                case TablaEtapaPostulacion.ETAPA_REGIONAL:
                    if(plaza!== null && plaza?.codigoInstancia !== this.currentSession.codigoPadreSede){
                        this.dataService
                        .Message()
                        .msgWarning(
                          '"EL SERVIDOR PÚBLICO PERTENECE A OTRA REGIÓN."',
                          () => {     this.formPostular.get('idEtapa').setValue(null);}
                        );
                    }
                  break;
                case TablaEtapaPostulacion.ETAPA_INTERREGIONAL:
                    if(plaza!== null && plaza?.codigoInstancia == this.currentSession.codigoPadreSede){
                        this.dataService
                        .Message()
                        .msgWarning(
                          '"EL SERVIDOR PÚBLICO PERTENECE A LA MISMA REGIÓN."',
                          () => { this.formPostular.get('idEtapa').setValue(null);}
                        );
                    }
                  break;
                default:
                 
           }
        }
    });

    this.form.get("documentoIdentidad").valueChanges.subscribe((value) => {
        if (value) {
            this.servidorPublico = null;
        }
    });
  }

  configurarDatoInicial = () => {
    if (this.idOperacion === TipoOperacionEnum.Registrar) {
      this.icon = 'create';
      this.dialogTitle = 'REGISTRAR NUEVO POSTULANTE';
    } else if (this.idOperacion === TipoOperacionEnum.Modificar) {
      this.dialogTitle = 'MODIFICAR POSTULANTE';
    }else if (this.idOperacion === TipoOperacionEnum.Ver) {
        this.dialogTitle = 'INFORMACIÓN POSTULANTE';
      }
  }

  loadTipoDocumento = () => {
    this.dataService.Reasignaciones()
      .getComboTipodocumento()
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          const data = response.map((x) => ({
            ...x,
            value: x.id,
            label: `${x.descripcion}`,
          }));
          this.comboLists.listTipoDocumento = data;
        //   this.comboLists.listTipoDocumento.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  }

  lengthDocumento(event): void {
    const idTipoDocumentoIdentidad = this.form.get("idTipoDocumento").value;
    const tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(pred => pred.value === idTipoDocumentoIdentidad);

    switch (tipoDocumentoIdentidad?.codigo) {

    case TablaTipoDocumentoIdentidad.DNI:
        this.form.controls['documentoIdentidad'].enable();
        this.desactivarDocumentoIdentidad = false;
        this.servidorPublico = null;
        this.form.get('documentoIdentidad').setValue("");
        document.getElementById('documentoIdentidad').setAttribute("maxlength", "8");
        break;

    case TablaTipoDocumentoIdentidad.PASAPORTE:
        this.form.controls['documentoIdentidad'].enable();
        this.desactivarDocumentoIdentidad = false;
        this.servidorPublico = null;
        this.form.get('documentoIdentidad').setValue("");
        document.getElementById('documentoIdentidad').setAttribute("maxlength", "12");
        break;

    case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
        this.form.controls['documentoIdentidad'].enable();
        this.desactivarDocumentoIdentidad = false;
        this.servidorPublico = null;
        this.form.get('documentoIdentidad').setValue("");
        document.getElementById('documentoIdentidad').setAttribute("maxlength", "15");
        break;
      default:
        this.form.controls['documentoIdentidad'].disable();
        this.desactivarDocumentoIdentidad = true;
        this.servidorPublico = null;
        this.form.get('documentoIdentidad').setValue("");
        document.getElementById('documentoIdentidad').setAttribute("maxlength", "8");
        break;
    }
  }

  onKeyOnlyNumbers(e) {
    const idTipoDocumentoIdentidad = this.form.get("idTipoDocumento").value;
    let permiteIngreso = true;
    const tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(pred => pred.value === idTipoDocumentoIdentidad);

     switch (tipoDocumentoIdentidad?.codigo) {
        case TablaTipoDocumentoIdentidad.DNI:
            if (e.keyCode == 13 || (e.keyCode >= 48 && e.keyCode <= 57)) {
                permiteIngreso = true;                
            } else {
                permiteIngreso = false;
            }
            break;
        case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
            permiteIngreso = true;
            break;
        case TablaTipoDocumentoIdentidad.PASAPORTE:
            permiteIngreso = true;
            break;
        default:
            permiteIngreso = false;
            break;
    }
    return permiteIngreso;
  }

  handleCancel = () => {
    this.matDialogRef.close({ registrado: false });
  }

  buscarServidorPublico = () => {
    this.setDato();
    this.dataService.Reasignaciones()
      .getBuscarServidor(this.dato)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
          // this.dataService.Spinner().show('sp6');
          // this.working = false;
          this.validarPostulantes();
        })
      )
      .subscribe((response: any) => {
        if (response) {
          if (response.length === 0) {
            this.dataService
              .Message()
              .msgWarning(
                'No se encontró información del Postulante para el criterio de búsqueda ingresados.',
                () => { }
              );
            return
          }
          this.datoPersona = response[0];
          // this.working = false;
        }
        else if (response === ResultadoOperacionEnum.NotFound) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
        }
      });
  }

  private GetPostulacion = () => {
    const { idPostulacion, idEtapaProceso } = this.data;
    // this.dataService.Spinner().show('sp6');
    this.dataService
        .Reasignaciones()
        .getPostulacion(idPostulacion, idEtapaProceso)
        .pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => { this.dataService.Spinner().hide('sp6'); })
        ).subscribe((response: any) => {
            if (response) {
                const { postulacion, servidorPublico, plaza, informe } = response;
                this.postulacion = postulacion;
                this.formExpediente.patchValue({
                    fechaExpediente: postulacion.fechaExpediente,
                    numeroExpediente: postulacion.numeroExpediente
                });
                this.formPostular.patchValue({
                    idCausal: postulacion.idCausal,
                    idEtapa: postulacion.idEtapaPostulacion,
                });
                this.formInforme.patchValue({
                    escalafonario: postulacion.numeroIE
                });
                this.servidorPublico = servidorPublico;
                this.plaza = plaza;
                this.informe = informe;
                this.idDetalleInformeEscalafonario = informe.idDetalleInformeEscalafonario;
                this.estudios = informe.estudios;
                this.meritos = informe.meritos;
                this.sanciones = informe.sanciones;
                this.dataSourceEstudios = new MatTableDataSource(informe.estudios);
                this.dataSourceMerito = new MatTableDataSource(informe.meritos);
                this.dataSourceSancion = new MatTableDataSource(informe.sanciones);
            } else {
                this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
            }
        });
  }

  busquedaServidorPublicoDialog = () =>{
    const form = this.form.value;
    const tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(pred => pred.id === form.idTipoDocumento);
    const idTipoDocumentoIdentidad = tipoDocumentoIdentidad.codigo;
    const numeroDocumentoIdentidad = form.documentoIdentidad;

    this.dialogRef = this.materialDialog.open(BuscarServidorPublicoComponent,
        {
            panelClass: 'buscar-servidor-publico',
            disableClose: true,
            data: {
                idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
                numeroDocumentoIdentidad: numeroDocumentoIdentidad,
            },
        }
    );
    this.dialogRef.afterClosed().subscribe((resp) => {
        if (!resp) {
            return;
        }
        this.form.patchValue({ idTipoDocumento: resp.idTipoDocumentoIdentidad });
        this.form.patchValue({ documentoIdentidad: resp.numeroDocumentoIdentidad });
    });
  }

  validarPostulantes = () => {
    if (this.idOperacion === TipoOperacionEnum.Registrar) {
        this.handleAscenso();
        this.handleLicencia();
    } else if (this.idOperacion === TipoOperacionEnum.Modificar) {
        this.buscarModificar();
    }
  }

  buscarModificar = () => {
    let bus = {
      id: this.idPostulacion
    }
    this.setDato();
    this.dataService.Reasignaciones()
      .getBuscarModificar(bus)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
        })
      )
      .subscribe((response: any) => {
        if (response) {
          this.dtExtra = response[0];        
          this.form.get('numeroExpediente').setValue(this.dtExtra.num_exp);
          this.form.get('fechaExpediente').setValue(this.dtExtra.fech_exp);
          this.selectCausal = this.dtExtra.idc;
          this.selectEtapa = this.dtExtra.idetp;
        }
        else if (response === ResultadoOperacionEnum.NotFound) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
        }
      });
  }

  handleBuscarEscalafonario = () => {
    let esca = {
      idepr: this.idep,
      idper: this.datoPersona.idper,
      idsp: this.datoPersona.idsp,
    }
    this.dataService
      .Message()
      .msgWarning(
        'Falta comtemplar con la Api Escalafonario' + esca,
        () => { }
      );
  }

  handleBuscarInformeEscalafonario = () => {
    const form = this.form.value;
    const formInforme = this.formInforme.value;

    if (!form.idTipoDocumento || !form.documentoIdentidad) {
        this.dataService.Message().msgWarning('DEBE INGRESAR UN EL TIPO DE DOCUMENTO DE IDENTIDAD Y EL NÚMERO DE DOCUMENTO DE IDENTIDAD PARA REALIZAR LA BÚSQUEDA DE INFORME ESCALAFONARIO.', () => {
        });
        return; 
    }
    this.workingInforme = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
        .Reasignaciones()
        .getInformeEscalafonario(form.idTipoDocumento, form.documentoIdentidad, formInforme.escalafonario)
        .pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingInforme = false; })
        ).subscribe((response: any) => {
            if (response) {
                this.informe = response;
                this.estudios = response.estudios;
                this.meritos = response.meritos;
                this.sanciones = response.sanciones;
                this.dataSourceEstudios = new MatTableDataSource(response.estudios);
                this.dataSourceMerito = new MatTableDataSource(response.meritos);
                this.dataSourceSancion = new MatTableDataSource(response.sanciones);
            } else {
                this.dataService.Message().msgWarning('No se encontró Informe escalafonario.', () => { });
            }
        });
  };

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
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                this.handlePreview(response, codigoAdjunto);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO."', () => {
                });
            }
        });
  }

  handlePreview(file: any, codigoAdjuntoSustento: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
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

    this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
  }

  handleAscenso = () => {
    debugger;
    let id: Number = this.datoPersona.idsp;
    this.dataService.Reasignaciones()
      .getValidadorAscenso({ id })
      .pipe(
        catchError(() => of([])),
        finalize(() => { 
        })
      )
      .subscribe((response: any) => {
        if (response) {
          if (response.length > 0) {
            this.dataService
              .Message()
              .msgWarning(
                'LA PERSONA <b>' + this.datoPersona.primer_apellido +
                ' ' + this.datoPersona.segundo_apellido +
                ' ' + this.datoPersona.nombres +
                '</b>, NO PUEDE SER REGISTRADO COMO POSTULANTE, YA QUE SE ENCUENTRA REGISTRADO EN EL PROCESO DE ASCENSO DE ESCALA" ',
                () => { }
              );
            this.handleCancel();
          }
        }
        else if (response === ResultadoOperacionEnum.NotFound) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
        }
      });
  }

  handleLicencia = () => {
    debugger;
    let id: Number = this.datoPersona.idper;
    this.dataService.Reasignaciones()
      .getLicencia({ id })
      .pipe(
        catchError(() => of([])),
        finalize(() => { 
        })
      )
      .subscribe((response: any) => {
        if (response) {
          if (response.length > 0) {
            this.dataService
              .Message()
              .msgWarning(
                'LA PERSONA <b>' + this.datoPersona.primer_apellido +
                ' ' + this.datoPersona.segundo_apellido +
                ' ' + this.datoPersona.nombres +
                '</b>, NO PUEDE SER REGISTRADO COMO POSTULANTE, YA QUE CUENTA CON LICENCIA SIN GOCE DE REMUNERACIONES VIGENTE. ',
                () => { }
              );
            this.handleCancel();
          }
        }
        else if (response === ResultadoOperacionEnum.NotFound) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
        }
      });
  }

  handleRegistrar = () => {

    const { idEtapaProceso, idDesarrolloProceso } = this.data;
    const formExpediente = this.formExpediente.value;
    const passport = this.dataService.Storage().getInformacionUsuario();

    if (!this.form.valid) {
        this.dataService.Message().msgWarning('"INGRESE DATOS: TIPO DOCUMENTO, NÚMERO DE DOCUMENTO".', () => { });
        return;
    }
    if (!this.formExpediente.valid) {
        this.dataService.Message().msgWarning('"INGRESE DATOS EN LA SECCIÓN EXPEDIENTE."', () => { });
        return;
    }
    if (!this.formPostular.valid) {
        this.dataService.Message().msgWarning('"INGRESE DATOS EN LA SECCIÓN DATOS DE POSTULACIÓN."', () => { });
        return;
    }
    if (!this.formInforme.valid) {
        this.dataService.Message().msgWarning('"INGRESE DATOS EN LA SECCIÓN INFORME ESCALAFONARIO."', () => { });
        return;
    }

    this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?', () => {
    const model = {
        idEtapaProceso: idEtapaProceso,
        idDesarrolloProceso: idDesarrolloProceso,
        idPersona: this.servidorPublico.idPersona,
        idServidorPublico: this.servidorPublico.idServidorPublico,
        numeroExpediente: formExpediente.numeroExpediente,
        fechaExpediente: formExpediente.fechaExpediente,
        idCausal: this.formPostular.get('idCausal').value,
        idEtapaPostulacion: this.formPostular.get('idEtapa').value,
        numeroIE: this.informe.numeroInformeEscalafonario,
        fechaIE: this.informe.fechaInformeEscalafonario,
        documentoIE: this.informe.documentoInformeEscalafonario,
        usuarioCreacion: passport.numeroDocumento,
        informe: this.informe,
    }
    this.working = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
        .Reasignaciones()
        .insertarPostulacion(model)
        .pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
        ).subscribe((response: any) => {
            if (response) {
                if(response > 0){
                    this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                    this.matDialogRef.close({ registrado: true });
                }
            } else {
                this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
            }
        });
    });
  };

  handleModificar = () => {
    const { idPostulacion, idEtapaProceso } = this.data;
    const formExpediente = this.formExpediente.value;
    const passport = this.dataService.Storage().getInformacionUsuario();
    if (!this.form.valid) {
        this.dataService.Message().msgWarning('"INGRESE DATOS: TIPO DOCUMENTO, NÚMERO DE DOCUMENTO."', () => { });
        return;
    }
    if (!this.formExpediente.valid) {
        this.dataService.Message().msgWarning('"INGRESE DATOS EN LA SECCIÓN EXPEDIENTE."', () => { });
        return;
    }
    if (!this.formPostular.valid) {
        this.dataService.Message().msgWarning('"INGRESE DATOS EN LA SECCIÓN DATOS DE POSTULACIÓN."', () => { });
        return;
    }
    if (!this.formInforme.valid) {
        this.dataService.Message().msgWarning('"INGRESE DATOS EN LA SECCIÓN INFORME ESCALAFONARIO."', () => { });
        return;
    }
    this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?', () => {

        //Actualizamos this.idDetalleInformeEscalafonario
        this.informe.idDetalleInformeEscalafonario = this.idDetalleInformeEscalafonario;      
        var requestExpediente = this.formExpediente.getRawValue();    
        
    const model = {
        idPostulacion: idPostulacion,
        idEtapaProceso: idEtapaProceso,
        idPersona: this.servidorPublico.idPersona,
        idServidorPublico: this.servidorPublico.idServidorPublico,
        numeroExpediente: formExpediente.numeroExpediente,
        // fechaExpediente: formExpediente.fechaExpediente,
        fechaExpediente: new Date(requestExpediente.fechaExpediente),
        idCausal: this.formPostular.get('idCausal').value,
        idEtapaPostulacion: this.formPostular.get('idEtapa').value,
        numeroIE: this.informe.numeroInformeEscalafonario,
        fechaIE: this.informe.fechaInformeEscalafonario,
        documentoIE: this.informe.documentoInformeEscalafonario,
        usuarioCreacion: passport.numeroDocumento,
        informe: this.informe
    }
    this.working = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
        .Reasignaciones()
        .modificarPostulacion(model)
        .pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
        ).subscribe((response: any) => {
            if (response) {
                if(response > 0){
                    this.dataService.Util().msgAutoCloseSuccess(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {});
                    this.matDialogRef.close({ registrado: true });
                }
            } else {
                this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
            }
        });
    });
  };


  confirDato = (data: any) => {
    if ((data.num_exp.length || data.fech_exp.length) == 0) {
      this.dataService.Message().msgWarning('DEBE DE INGRESAR EL NUMERO Y FECHA DEL EXPEDIENTE.', () => { });
      return
    }
  }

  private configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}
