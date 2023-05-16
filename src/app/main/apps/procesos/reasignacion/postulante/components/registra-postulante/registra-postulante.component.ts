import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ResultadoOperacionEnum, TipoOperacionEnum } from 'app/core/model/types';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BuscarPlazaComponent } from '../../../components/buscar-plaza/buscar-plaza.component';
import { DocumentosSustentoComponent } from '../../../components/documentos-sustento/documentos-sustento.component';
import { CapacitacionModel, DatoPlazaPostularModel, DatosServidorPublicoModel, DocumentoSustentoModel, EtapaResponseModel, ExperienciaLaboralCalc, ExperienciaLaboralModel, FormacionAcademicaModel, PlazaGrillaModel, PlazaPostuladaModel, PostulacionModel, ResumenPlazasResponseModel, ServidorPublicoModel } from '../../../models/reasignacion.model';
import { CodigoTipoOperacionSustentoEnum, EtapaFaseEnum, OrigenRegistroEnum, RegimenLaboralEnum, TipoFormatoPlazaEnum } from '../../../_utils/constants';
import { CapacitacionesComponent } from '../capacitaciones/capacitaciones.component';
import { ExperienciaLaboralComponent } from '../experiencia-laboral/experiencia-laboral.component';
import { FormacionAcademicaComponent } from '../formacion-academica/formacion-academica.component';

@Component({
  selector: 'minedu-registra-postulante',
  templateUrl: './registra-postulante.component.html',
  styleUrls: ['./registra-postulante.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class RegistraPostulanteComponent implements OnInit {
  
  now = new Date();

  icon = 'create';
  dialogTitle: string;
  grabado = false;
  working = false;
  form: FormGroup;
  idOperacion: number;
  idPostulacion: number;
  postulacion: PostulacionModel = null;
  etapaResponse: EtapaResponseModel;
  plaza: PlazaGrillaModel;
  comboLists = {
    listTipoDocumento: [],
    listCausal: [],
    listEstado: [],
    listTipoVia: [],
    listTipoZona: [],
    listDepartamento: [],
    listProvincia: [],
    listDistrito: [],
    listTiposSustento: [],
    listTiposFormato: [],
    listCargo: [],
    listModalidadEducativa: [],
    listNivelEducativo: [],
    listAreaCurricular: [],
    listColegioProfesional: [],
  };
  documentosSustento: DocumentoSustentoModel[] = [];
  formacionesAcademica: FormacionAcademicaModel[] = [];
  capacitaciones: CapacitacionModel[] = [];
  experienciasLaborales: ExperienciaLaboralModel[] = [];
  experienciaLaboralCalc = new ExperienciaLaboralCalc();

  datoPersona: DatosServidorPublicoModel = new DatosServidorPublicoModel();
  persona = new ServidorPublicoModel();
  @ViewChild(DocumentosSustentoComponent)
  private documentosSustentoComponent: DocumentosSustentoComponent;

  @ViewChild(FormacionAcademicaComponent) private formacionAcademicaComponent: FormacionAcademicaComponent;
  @ViewChild(CapacitacionesComponent) private capacitacionesComponent: CapacitacionesComponent;
  @ViewChild(ExperienciaLaboralComponent) private experienciaLaboralComponent: ExperienciaLaboralComponent;

  selectedTabIndex = 0;
  currentSession: SecurityModel = new SecurityModel();
  dialogRef: any;
  regimenLaboral = RegimenLaboralEnum;
  etapaFaseEnum = EtapaFaseEnum;

  constructor(
    public matDialogRef: MatDialogRef<RegistraPostulanteComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
  ) {
    this.idOperacion = data.idOperacion;
    this.idPostulacion = data.idPostulacion;
    this.currentSession = data.currentSession;
  }
  resumenPlazas: ResumenPlazasResponseModel;

  request = {
    idProceso: null,
    idEtapa: null,
    codigoPlaza: null,
    codigoCentroTrabajo: null
  };

  ngOnInit(): void {
    this.working = true;
    this.etapaResponse = this.data.etapaResponse;
    this.buildForm();
    this.loadTipoDocumentoIdentidad();
    this.loadDepartamento();
    this.loadTipoVia();
    this.loadTipoZona();
    this.loadTipoSustento();
    this.loadTipoFormato();
    this.loadModalidadEducativa();
    this.loadAreaCurricular();
    this.loadCargo();
    this.loadColegioProfesional();
    if (this.idOperacion === TipoOperacionEnum.Modificar) {
      this.getData(this.idPostulacion);
    } else {
      this.postulacion = new PostulacionModel();
      this.working = false;
    }
    this.configurarDatoInicial();
    this.configurarRegistro();
  }

  buildForm = () => {
    this.form = this.formBuilder.group({
      idPostulacion: null,
      idProceso: null,
      idEtapa: null,
      idPersona: null,
      idTipoVia: [null ],
      idTipoZona: [null ],
      idPais: 0,
      idDistrito: [null ],
      idColegioProfesional: null,
      codigoPlaza: [null],
      nombreVia: [null ],
      nombreZona: [null ],
      numeroVia: [null ],
      direccion: null,
      telefonoMovil: [null ],
      telefonoFijo: [null ],
      numeroRuc: null,
      numeroColegioProfesional: null,
      codigoPostulante: null,
      idTipoDocumentoIdentidad: [null ],
      numeroDocumentoIdentidad: [null ],
      idDepartamento: [null ],
      idProvincia: [null ],

      idCargo: [null],
      idModalidadEducativa: [null],
      idNivelEducativo: [null],
      idAreaCurricular: [null],
      idPlazaPostulada: [0],
      idPlazaContratacion: [null],

    });
  }

  loadTipoSustento = () => {
    this.dataService.Reasignaciones()
      .getComboTipoSustento(CodigoTipoOperacionSustentoEnum.OTROS_DATOS_POSTULACION)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response && response.result) {
          const data = response.data.map((x) => ({
            ...x,
            value: x.idTipoDocumentoSustento,
            label: `${x.descripcionTipoDocumentoSustento}`,
          }));
          this.comboLists.listTiposSustento = data;
        }
      });
  }

  loadTipoFormato = () => {
    this.dataService.Reasignaciones()
      .getComboTipoFormato()
      .pipe(
        catchError(() => of([])),
        finalize(() => { this.working = false; })
      )
      .subscribe((response: any) => {
        if (response && response.result) {
          const data = response.data.map((x) => ({
            ...x,
            value: x.idCatalogoItem,
            label: `${x.descripcionCatalogoItem}`,
          }));
          this.comboLists.listTiposFormato = data;
        }
      });
  }

  handleSave = (form) => {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning('Debe ingresar datos obligatorios.', () => { });
      return;
    }

    if (this.formacionesAcademica.length === 0) {
      this.dataService.Message().msgWarning('Debe ingresar formación académica.', () => { });
      return;
    }

    if (this.capacitaciones.length === 0) {
      this.dataService.Message().msgWarning('Debe ingresar capacitación.', () => { });
      return;
    }

    if (this.experienciasLaborales.length === 0) {
      this.dataService.Message().msgWarning('Debe ingresar experiencia laboral.', () => { });
      return;
    }

    const postulacion = this.prepararData(this.form.getRawValue());
    if (this.idOperacion === TipoOperacionEnum.Registrar) {

      this.dataService.Message().msgConfirm('¿Esta seguro de que desea guardar la información?', () => {
        this.dataService.Spinner().show('sp6');
        this.working = true;
        this.createPostulacion(postulacion);
      });
    } else {
      this.dataService.Message().msgConfirm('¿Esta seguro de que desea guardar la información?', () => {
        this.dataService.Spinner().show('sp6');
        this.working = true;
        this.modificarPostulacion(postulacion);
      });
    }
  }

  resetForm = () => {
    this.form.reset();

    this.documentosSustento = [];
    this.documentosSustentoComponent?.actualizarLista(this.documentosSustento);
    this.persona = new ServidorPublicoModel();
  }

  createPostulacion = (postulacion: any) => {
    const resultMessage = 'Operación realizada de forma exitosa.';
    this.dataService.Reasignaciones().insertarPostulacion(postulacion).pipe(
      catchError((e) => of(e)),
      finalize(() => {
        this.dataService.Spinner().hide('sp6');
        this.working = false;
      })
    ).subscribe(response => {
      if (response && response.result) {
        this.resetForm();
        this.grabado = true;
        this.dataService.Message().msgInfo(resultMessage, () => { });
      } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
        this.dataService.Message().msgWarning(response.messages[0], () => { });
      } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
        this.dataService.Message().msgWarning(response.messages[0], () => { });
      } else {
        this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
      }
    });
  }

  modificarPostulacion = (postulacion: any) => {
/*     const resultMessage = 'Operación realizada de forma exitosa.';
    this.dataService.Contrataciones().modificarPostulacion(postulacion).pipe(
      catchError((e) => of(e)),
      finalize(() => {
        this.dataService.Spinner().hide('sp6');
        this.working = false;
      })
    ).subscribe(response => {
      if (response && response.result) {
        // M07: “OPERACIÓN REALIZADA DE FORMA EXITOSA”.
        this.grabado = true;
        this.dataService.Message().msgInfo(resultMessage, () => { });
        this.matDialogRef.close({ grabado: true });
      } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
        this.dataService.Message().msgWarning(response.messages[0], () => { });
      } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
        this.dataService.Message().msgWarning(response.messages[0], () => { });
      } else {
        this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
      }
    }); */
  }

  prepararData = (row: any, idOperacion: number = TipoOperacionEnum.Registrar) => {
    const model: PostulacionModel = new PostulacionModel();
    model.idPostulacion = this.idOperacion === TipoOperacionEnum.Registrar ? 0 : this.postulacion.idPostulacion;
    model.idProceso = this.etapaResponse.idProceso;
    model.idEtapa = this.etapaResponse.idEtapa;
    model.idPersona = row.idPersona;
    model.idOrigenRegistro = OrigenRegistroEnum.MODULO;
    model.idTipoVia = row.idTipoVia;
    model.idTipoZona = row.idTipoZona;
    model.idPais = 0;
    model.idDistrito = row.idDistrito;

    model.idColegioProfesional = (row.idColegioProfesional == -1 ? null : row.idColegioProfesional);
    model.idEstadoPostulacion = 1;
    model.nombreVia = row.nombreVia;
    model.nombreZona = row.nombreZona;
    model.numeroVia = row.numeroVia;
    model.direccion = null;
    model.telefonoMovil = row.telefonoMovil;
    model.telefonoFijo = row.telefonoFijo;
    model.numeroRuc = row.numeroRuc;
    model.numeroColegioProfesional = row.numeroColegioProfesional;
    model.codigoPostulante = 0;

    if (row.idCargo != null) {
      model.datoPlazaPostular = new DatoPlazaPostularModel();
      model.datoPlazaPostular.idDatoPostular = 0;
      model.datoPlazaPostular.idCargo = row.idCargo;
      model.datoPlazaPostular.idModalidadEducativa = row.idModalidadEducativa;
      model.datoPlazaPostular.idNivelEducativo = row.idNivelEducativo;
      model.datoPlazaPostular.idAreaCurricular = row.idAreaCurricular;
    }
    model.capacitaciones = this.capacitaciones;
    model.formacionesAcademica = this.formacionesAcademica;
    model.experienciasLaborales = this.experienciasLaborales;
    model.documentosSustento = this.documentosSustento;
    model.usuarioRegistro = this.currentSession.numeroDocumento;

    if (row.codigoPlaza != null) {
      model.codigoPlaza = row.codigoPlaza;
      const plazaPostulada = new PlazaPostuladaModel();
      plazaPostulada.idPlazaPostulada = row.idPlazaPostulada;
      plazaPostulada.idPlazaContratacion = row.idPlazaContratacion;
      plazaPostulada.idGrupoInscripcion = this.plaza.idGrupoInscripcion;
      model.plazaPostulada = plazaPostulada;
    }

    /*        model.idTipoDocumentoIdentidad = [null],
           model.numeroDocumentoIdentidad = [null],
           model.idDepartamento = [null],
           model.idProvincia = [null], */
    return model;
  }

  handleCancel = () => { this.matDialogRef.close({ grabado: this.grabado }); }

  configurarDatoInicial = () => {
    
    if (this.idOperacion === TipoOperacionEnum.Registrar) {
      this.icon = 'create';
      this.dialogTitle = 'Registrar nuevo postulante';
    } else if (this.idOperacion === TipoOperacionEnum.Modificar) {
      this.dialogTitle = 'Modificar nuevo postulante';
    }
  }

  loadTipoDocumentoIdentidad = () => {
    this.dataService.Reasignaciones().getComboTipodocumento().pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idCatalogoItem,
          label: `${x.descripcionCatalogoItem}`
        }));
        this.comboLists.listTipoDocumento = data;
      }
    });
  }

  loadTipoVia = () => {
    this.dataService.Reasignaciones().getComboTipoVia().pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idTipoVia,
          label: `${x.descripcionTipoVia}`
        }));
        this.comboLists.listTipoVia = data;
      }
    });
  }

  loadTipoZona = () => {
    this.dataService.Reasignaciones().getComboTipoZona().pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idTipoZona,
          label: `${x.descripcionTipoZona}`
        }));
        this.comboLists.listTipoZona = data;
      }
    });
  }

  loadDepartamento = () => {
    this.dataService.Reasignaciones().getComboDepartamento().pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idDepartamento,
          label: `${x.descripcion}`
        }));
        this.comboLists.listDepartamento = data;

      }
    });
  }

  loadProvincia = (idDepartamento) => {
    // const idDepartamento = this.form.get('idDepartamento');
    this.dataService.Reasignaciones().getComboProvincia(idDepartamento).pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idProvincia,
          label: `${x.descripcion}`
        }));
        this.comboLists.listProvincia = data;
      }
    });
  }

  loadDistrito = () => {
    const idDepartamento = this.form.get('idDepartamento').value;
    const idProvincia = this.form.get('idProvincia').value;
    this.dataService.Reasignaciones().getComboDistrito(idDepartamento, idProvincia).pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idDistrito,
          label: `${x.descripcion}`
        }));
        this.comboLists.listDistrito = data;
      }
    });
  }


  loadCargo = () => {
    this.dataService.Reasignaciones().getComboCargo().pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idCargo,
          label: `${x.descripcionCargo}`
        }));
        this.comboLists.listCargo = data;
      }
    });
  }

  loadModalidadEducativa = () => {
    this.dataService.Reasignaciones().getComboModalidadEducativa().pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idModalidadEducativa,
          label: `${x.descripcionModalidadEducativa}`
        }));
        this.comboLists.listModalidadEducativa = data;
      }
    });
  }

  loadNivelEducativa = (idModalidadEducativa) => {
    this.dataService.Reasignaciones().getComboNivelEducativa(idModalidadEducativa).pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idNivelEducativo,
          label: `${x.descripcionNivelEducativo}`
        }));
        this.comboLists.listNivelEducativo = data;
      }
    });
  }

  loadAreaCurricular = () => {
    this.dataService.Reasignaciones().getComboAreacurricular().pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idAreaCurricular,
          label: `${x.descripcionAreaCurricular}`
        }));
        this.comboLists.listAreaCurricular = data;

      }
    });
  }

  loadColegioProfesional = () => {
    this.dataService.Reasignaciones().getComboColegioProfesional().pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        const data = response.data.map(x => ({
          ...x,
          value: x.idColegioProfesional,
          label: `${x.nombreColegioProfesional}`
        }));
        this.comboLists.listColegioProfesional = data;
      }
    });
  }

  buscarPersona(): void {
    const idTipoDocumentoIdentidad = this.form.get('idTipoDocumentoIdentidad').value;
    const numeroDocumentoIdentidad = this.form.get('numeroDocumentoIdentidad').value;
    if (numeroDocumentoIdentidad === null || idTipoDocumentoIdentidad == null) {
      this.dataService
        .Message()
        .msgWarning('Debe ingresar Tipo de documento y Número de documento', () => { });
      return;
    }

    if (numeroDocumentoIdentidad.length === 0 || numeroDocumentoIdentidad.length < 8) {
      return;
    }

    // idDre: this.idDre,
    // idUgel: this.idUgel,

    const data = {
      idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
      numeroDocumentoIdentidad: numeroDocumentoIdentidad,
      primerApellido: '',
      segundoApellido: '',
      nombres: ''
    };

    const paginaActual = 1;
    const tamanioPagina = 10;
    this.persona = null;
    this.form.get('idPersona').setValue(null);

    this.dataService
      .Reasignaciones()
      .getListaServidorPublico(data, paginaActual, tamanioPagina)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response && response.result) {
          const servidorPublico = response.data[0];
          if (
            servidorPublico === null ||
            servidorPublico === undefined
          ) {
            this.dataService
              .Message()
              .msgWarning(
                'La persona no se encuentra registrado',
                () => { }
              );
          } else {
            this.persona = servidorPublico;
            this.form.get('idPersona').setValue(this.persona.idPersona);
          }
        }
      });
  }

  getData = (idPostulacion: number) => {
    this.dataService
      .Reasignaciones()
      .getPostulacionById(idPostulacion)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
          this.dataService.Spinner().hide('sp6');
          this.working = false;
        })
      )
      .subscribe((response: any) => {
        if (response && response.result) {
          this.bindData(response.data);
        }
      });
  }

  bindData = (row: PostulacionModel) => {
    this.postulacion = row;
    this.form.get('idTipoVia').setValue(row.idTipoVia);
    this.form.get('nombreVia').setValue(row.nombreVia);
    this.form.get('idTipoZona').setValue(row.idTipoZona);
    this.form.get('nombreZona').setValue(row.nombreZona);
    this.form.get('numeroVia').setValue(row.numeroVia);
    this.form.get('telefonoMovil').setValue(row.telefonoMovil);
    this.form.get('telefonoFijo').setValue(row.telefonoFijo);
    this.form.get('idDepartamento').setValue(row.idDepartamento);
    this.form.get('idProvincia').setValue(row.idProvincia);
    this.form.get('idDistrito').setValue(row.idDistrito);
    this.form.get('idTipoDocumentoIdentidad').setValue(row.idTipoDocumentoIdentidad);
    this.form.get('numeroDocumentoIdentidad').setValue(row.numeroDocumentoIdentidad);
    this.form.get('numeroRuc').setValue(row.numeroRuc);
    this.form.get('idColegioProfesional').setValue(row.idColegioProfesional);
    this.form.get('numeroColegioProfesional').setValue(row.numeroColegioProfesional);

    if (row.datoPlazaPostular != null) {
      this.form.get('idCargo').setValue(row.datoPlazaPostular.idCargo);
      this.form.get('idModalidadEducativa').setValue(row.datoPlazaPostular.idModalidadEducativa);
      this.form.get('idNivelEducativo').setValue(row.datoPlazaPostular.idNivelEducativo);
      this.form.get('idAreaCurricular').setValue(row.datoPlazaPostular.idAreaCurricular);
    }

    this.persona = new ServidorPublicoModel();
    this.form.get('idPersona').setValue(row.idPersona);
    // datos de persona       
    this.persona.idPersona = row.idPersona,
      this.persona.idTipoDocumentoIdentidad = row.idTipoDocumentoIdentidad;
    this.persona.numeroDocumentoIdentidad = row.numeroDocumentoIdentidad;
    this.persona.numeroDocumentoIdentidadCompleto = row.numeroDocumentoIdentidadCompleto;
    this.persona.fechaNacimiento = row.fechaNacimiento;
    this.persona.primerApellido = row.primerApellido;
    this.persona.segundoApellido = row.segundoApellido;
    this.persona.nombres = row.nombres;
    this.persona.descripcionGenero = row.descripcionGenero;
    this.persona.descripcionNacionalidad = row.descripcionNacionalidad;

    this.formacionesAcademica = row.formacionesAcademica;
    this.capacitaciones = row.capacitaciones;
    this.experienciasLaborales = row.experienciasLaborales;
    this.documentosSustento = row.documentosSustento;
    this.experienciaLaboralCalc = row.experienciaLaboralCalc;

    this.formacionAcademicaComponent.actualizarLista(this.formacionesAcademica);
    this.capacitacionesComponent.actualizarLista(this.capacitaciones);
    this.experienciaLaboralComponent.actualizarLista(this.experienciasLaborales);
    this.documentosSustentoComponent.actualizarLista(this.documentosSustento);

    if (row.plazaPostulada != null) {
      console.log("row.plazaPostulada", row.plazaPostulada);
      this.form.get('codigoPlaza').setValue(row.plazaPostulada.codigoPlaza.trim());
      this.plaza = new PlazaGrillaModel();
      this.form.get('idPlazaPostulada').setValue(row.plazaPostulada.idPlazaPostulada);
      this.form.get('idPlazaContratacion').setValue(row.plazaPostulada.idPlazaContratacion);
      this.plaza.codigoModular = row.plazaPostulada.codigoModular;
      this.plaza.descripcionInstitucionEducativa = row.plazaPostulada.descripcionInstitucionEducativa;
      this.plaza.abreviaturaModalidadEducativa = row.plazaPostulada.abreviaturaModalidadEducativa;
      this.plaza.descripcionNivelEducativo = row.plazaPostulada.descripcionNivelEducativo;
      this.plaza.descripcionTipoGestionEducativa = row.plazaPostulada.descripcionTipoGestionEducativa;
      this.plaza.nombreZona = row.plazaPostulada.nombreZona;
      this.plaza.eib = row.plazaPostulada.eib;
      this.plaza.codigoPlaza = row.plazaPostulada.codigoPlaza;
      this.plaza.descripcionCargo = row.plazaPostulada.descripcionCargo;
      this.plaza.descripcionAreaCurricular = row.plazaPostulada.descripcionAreaCurricular;
      this.plaza.jornadaLaboral = row.plazaPostulada.jornadaLaboral;
      this.plaza.descripcionTipoPlaza = row.plazaPostulada.descripcionTipoPlaza;
      this.plaza.descripcionMotivoVacancia = row.plazaPostulada.descripcionMotivoVacancia;
      this.plaza.codigoCentroTrabajo = row.plazaPostulada.codigoCentroTrabajo;
      this.plaza.idPlazaContratacion = row.plazaPostulada.idPlazaContratacion;
      this.plaza.descripcionRegimenLaboral = row.plazaPostulada.descripcionRegimenLaboral;
      this.plaza.idGrupoInscripcion = row.plazaPostulada.idGrupoInscripcion;
      this.plaza.descripcionGrupoInscripcion = row.plazaPostulada.descripcionGrupoInscripcion;
    }


    this.working = false;
  }

  handleSelectTab = (e) => {
    this.selectedTabIndex = e.index;
    switch (this.selectedTabIndex) {
      case 1:

        break;

      default:
        break;
    }
  }

  limpiarBusquedaPlaza(): void {
    this.plaza = null;
  }

  buscarPlaza = () => {
    const data = {
      codigoPlaza: this.form.get('codigoPlaza').value,
      descripcionCentroTrabajo: null,
      codigoCentroTrabajo: null,
      idRegimenLaboral: null,
      tipoFormato: TipoFormatoPlazaEnum.CONVOCADAS
    }
    this.dataService.Spinner().show("sp6");
    this.dataService.Reasignaciones()
      .getListaPlaza(data, 1, 20).pipe(
        catchError(() => of([])),
        finalize(() => this.dataService.Spinner().hide("sp6"))
      ).subscribe((response: any) => {
        if ((response.data || []).length === 0) {
          this.dataService.Message().msgWarning('No se encontró información de la(s) plazas para los criterios de búsqueda ingresados.', () => { });
          this.plaza = null;

        } else {
          this.plaza = response.data[0];
          this.form.get('idPlazaContratacion').setValue(this.plaza.idPlazaContratacion);
        }
      });
  }

  busquedaPersonalizada(): void {

  }

  busquedaPlazaPersonalizada(): void {
    this.dialogRef = this.materialDialog.open(
        BuscarPlazaComponent,
      {
        panelClass: 'buscar-plaza-dialog',
        width: '1080px',
        disableClose: true,
        data: {
          action: 'busqueda',
          tipoFormato: TipoFormatoPlazaEnum.CONVOCADAS
        },
      }
    );

    this.dialogRef.afterClosed().subscribe((resp) => {
      if (resp != null) {
        const plaza = resp.plazaSelected;
        this.form.get('codigoPlaza').setValue(plaza.codigoPlaza.trim());
        this.form.get('idPlazaContratacion').setValue(plaza.idPlazaContratacion);
        this.plaza = plaza;
      }
    });
  }

  // TODO
  obtenerResumenPlazas = () => {
    this.dataService
      .Reasignaciones()
      .getResumenPlazas(this.request)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response && response.result) {
          this.resumenPlazas = response.data;
        }
      });
  }

  configurarRegistro(): void {
    if (this.etapaResponse.codigoRegimenLaboral === this.regimenLaboral.LEY_30512 &&
      (this.etapaResponse.codigoEtapaFase === this.etapaFaseEnum.FASE2 || this.etapaResponse.codigoEtapaFase === this.etapaFaseEnum.FASE3)) {
      this.form.get('idPlazaContratacion').setValidators(Validators.required);
      this.form.get('codigoPlaza').setValidators(Validators.required);
    }

    if (this.etapaResponse?.codigoRegimenLaboral === this.regimenLaboral.LEY_30328 /*&&
          (this.etapaResponse.codigoEtapaFase === this.etapaFaseEnum.FASE2 || this.etapaResponse.codigoEtapaFase === this.etapaFaseEnum.FASE3)*/) {
      this.form.get('idCargo').setValidators(Validators.required);
      this.form.get('idModalidadEducativa').setValidators(Validators.required);
      this.form.get('idNivelEducativo').setValidators(Validators.required);
      this.form.get('idAreaCurricular').setValidators(Validators.required);
    }
  }

}
