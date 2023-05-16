import { Component, OnInit, ViewEncapsulation, EventEmitter, ViewChild, Input, Output } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { Subscription, BehaviorSubject, of, Observable, Subject, forkJoin } from 'rxjs';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';

import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';

import { TablaConfiguracionSistema, MISSING_TOKEN } from 'app/core/model/types';
import { TablaEstadoCargaMasiva, TablaMetodosCargaMasiva } from 'app/core/model/types-cargamasiva';
import { LocalStorageService } from '@minedu/services/secure/local-storage.service';
import { PASSPORT_MESSAGE } from 'app/core/model/message';
import { TablaAccionesPassport } from 'app/core/model/action-types';

@Component({
  selector: 'minedu-archivo-carga',
  templateUrl: './archivo-carga.component.html',
  styleUrls: ['./archivo-carga.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ArchivoCargaComponent implements OnInit {

  @Input() public refrescarGrillaCargaMasiva: Function;
  @Input() public listarDetalle: Function;
  @Output() cerrarDetalleCarga = new EventEmitter();
  @Output() cargarDocumento = new EventEmitter();

  form: FormGroup;
  working = false;
  mostrar: boolean = false;

  formatos: any[] = [];
  listaEstado: any[] = [];

  cantidadColumnas: any;
  displayedGrid: string[] = [];
  displayedColumns: string[] = [];
  titulosGrid: string[] = [];


  archivo: any;
  ocultar = true;
  ocultarCarga = true;
  visible: boolean = false;
  descargar: boolean = false;
  exportar: boolean = false;
  validar: boolean = false;
  procesar: Boolean = false;
  idEstado: any;
  detalleProcesado: boolean = false;

  dataFormato = {
    idCarga: null,
    usuarioModificacion: null,
    codigoEstado: null,
    idEstado: null,
    codigoRol: null,
    codigoTipoSede: null,
    codigoSede: null,
  };

  parametro: any = null;
  registroConsulta: any = null;

  datosSistema = {
    datosRegistroOrigen: null,
    codigoSistema: null,
    codigoFuncionalidad: null,
    parametro: null,
    parametro2: null,
    idParametro: null
  };

  dataSource: ArchivoCargaDataSource | null;
  selection = new SelectionModel<any>(false, []);

  @ViewChild('paginatorCargaMasiva', { static: true }) paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    public globals: GlobalsService,
    private localStorageService: LocalStorageService
  ) {
  }

  ngOnInit(): void {

    this.dataSource = new ArchivoCargaDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';

    this.route.data.subscribe((data) => {
      if (data) {
        this.route.params.subscribe((parametro) => { if (parametro) { this.parametro = parametro.codigo; } });
        this.datosSistema = {
          datosRegistroOrigen: this.parametro,
          codigoSistema: this.parametro.substr(0, 3),
          codigoFuncionalidad: this.parametro.substr(3, 4),
          parametro: this.parametro.substr(7, 10),
          parametro2: this.parametro.substr(17, 10),
          idParametro: this.parametro.substr(27, 10)
        };

        this.registroConsulta = data['Ratificacion'];
      }
    });

    this.buildForm();
    this.buildData();

    this.default();
    this.enabledControls();
  }

  buildData() {
    const data = {
      codigoSistema: this.datosSistema.codigoSistema,
      codigoFuncionalidad: this.datosSistema.codigoFuncionalidad
    };

    forkJoin([this.dataService.CargaMasiva().listarEstado(true),
    this.dataService.CargaMasiva().getFormato(data)]
    ).subscribe((response: any) => {
      this.listaEstado = response[0].data;
      this.formatos = response[1].data;
    });
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idFormato: [null, Validators.compose([Validators.required])],
      codigoDocumentoCarga: [null],
      nombreArchivo: [null],
      detalleFormato: [null]
    });

    this.form.get('idFormato').valueChanges.subscribe(value => {
      if (value && value > 0) {
        const formato = this.formatos.find(x => x.idFormato === value);
        setTimeout(() => {
          this.tituloGrilla(formato);
        }, 0);

        this.descargar = true;
      } else {
        this.displayedGrid = [];
        this.displayedColumns = [];
      }
    });
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
  }

  loadData(pageIndex, pageSize) {
    this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosCargaMasiva.GRID_DETALLE_CARGA_MASIVA, { pageIndex: pageIndex, pageSize: pageSize });
  }

  private handleloadData(parametro) {
    this.dataSource.load(this.dataFormato, parametro.pageIndex, parametro.pageSize);
  }

  loadCargaMasiva(data) {
    this.dataSource = new ArchivoCargaDataSource(this.dataService);
    this.dataSource.load(data, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
  }

  descargarFormato() {
    this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosCargaMasiva.DESCARGAR_FORMATO);
  }

  private handleDescargarFormato() {
    const data = this.form.getRawValue();
    const idFormato = data.idFormato;
    if (idFormato === null || idFormato == "-1") return true;
    const formato = this.formatos.find(x => x.idFormato === idFormato);
    this.dataService.Documento().getDocumentoFormato(formato.codigoDocumentoFormato)
      .pipe(
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe(
        data => {
          let nombreArchivo = 'Formato ' + formato.codigoFormato + '.xlsx';
          this.dataService.Documento().downloadFile(data, nombreArchivo);
        },
        error => {
          this.dataService.Util().msgWarning('NO SE ENCONTRÓ EL FORMATO', () => { });
        }
      );
  }

  validarInformacion() {
    this.obtenerClavePublica(TablaAccionesPassport.Importar, true, TablaMetodosCargaMasiva.VALIDAR_CARGA);
  }

  private handleValidarInformacion() {
    this.dataService.Spinner().hide("sp6");
    const usuario = this.dataService.Storage().getPassportUserData();
    if (!usuario) {
      this.dataService.Util().msgWarning('DATOS DE USUARIO NO ENCONTRADO, POR FAVOR VUELVA INGRESAR.', () => { });
      return;
    }

    const rol = this.dataService.Storage().getPassportRolSelected();
    const data = {
      idCarga: this.dataFormato.idCarga,
      codigoSistema: parseInt(this.datosSistema.codigoSistema),
      codigoFuncionalidad: parseInt(this.datosSistema.codigoFuncionalidad),
      parametro: parseInt(this.datosSistema.parametro),
      parametro2: parseInt(this.datosSistema.parametro2),
      idParametro: parseInt(this.datosSistema.idParametro),
      usuarioModificacion: usuario.NOMBRES_USUARIO,
      codigoRol: rol.CODIGO_ROL,
      codigoSede: rol.CODIGO_SEDE,
      codigoTipoSede: rol.CODIGO_TIPO_SEDE
    };

    this.dataService.Util().msgConfirm('¿ESTÁ SEGURO QUE DESEA REALIZAR LA VALIDACIÓN DE LA CARGA MASIVA?', () => {
      this.dataService.Spinner().show("sp6");
      this.validar = false;
      this.procesar = false;
      this.dataService.CargaMasiva().validarCargaMasiva(data).pipe(
        catchError((e) => of(e)),
        finalize(() => { this.working = false; })
      ).subscribe(response => {
        if (response && response.result) {

          const estado = this.listaEstado.find(x => x.codigoCatalogoItem === TablaEstadoCargaMasiva.EnProcesoValidacion);
          this.idEstado = estado.idCatalogoItem;
          this.dataFormato.codigoEstado = TablaEstadoCargaMasiva.EnProcesoValidacion;
          this.dataFormato.idEstado = estado.idCatalogoItem;

          const registro = JSON.parse(this.localStorageService.getItem('registro'));

          const carga = {
            idCarga: registro.idCarga,
            idFormato: registro.idFormato,
            codigoEstado: TablaEstadoCargaMasiva.EnProcesoValidacion,
            idEstado: estado.idCatalogoItem
          };
          this.localStorageService.setItem('registro', JSON.stringify(carga));
          this.refrescarGrillaCargaMasiva();
          this.loadCargaMasiva(this.dataFormato);
          this.dataService.Util().msgWarning('Se está validando la carga masiva.', () => { });
        } else if (response && response.statusCode === 404) {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Util().msgWarning(response.messages[0], () => { });
        } else if (response && response.statusCode === 422) {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Util().msgWarning(response.messages[0], () => { });
        } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
        } else {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Util().msgError('Ocurrieron algunos problemas al realizar la validación de la carga masiva, por favor intente dentro de unos segundos, gracias.',
            () => { });
        }
      });
    }, () => { });
  }

  procesarInformacion() {
    this.obtenerClavePublica(TablaAccionesPassport.Importar, true, TablaMetodosCargaMasiva.PROCESAR_CARGA);
  }

  handleProcesarInformacion() {
    this.dataService.Spinner().hide("sp6");
    const estado = this.listaEstado.find(x => x.codigoCatalogoItem === TablaEstadoCargaMasiva.Validado);
    if (this.idEstado !== estado.idCatalogoItem) {
      return this.dataService.Util().msgWarning('No se puede procesar la información, porque no esta VALIDADO.', () => { });
    }

    const usuario = this.dataService.Storage().getPassportUserData();
    if (!usuario) {
      this.dataService.Util().msgWarning('Datos de usuario no encontrado, por favor vuelva ingresar.', () => { });
      return;
    }

    const rol = this.dataService.Storage().getPassportRolSelected();
    const data = {
      idCarga: this.dataFormato.idCarga,
      codigoSistema: parseInt(this.datosSistema.codigoSistema),
      codigoFuncionalidad: parseInt(this.datosSistema.codigoFuncionalidad),
      parametro: parseInt(this.datosSistema.parametro),
      parametro2: parseInt(this.datosSistema.parametro2),  // *************** VIENE DE DATOS SISTEMA
      idParametro: parseInt(this.datosSistema.idParametro),
      usuarioModificacion: usuario.NOMBRES_USUARIO,
      codigoRol: rol.CODIGO_ROL,
      codigoSede: rol.CODIGO_SEDE,
      codigoTipoSede: rol.CODIGO_TIPO_SEDE
    };

    console.log("Carga masiva >> Data Procesar Informacion [CargaMasiva().procesarCargaMasiva] :", data);

    this.dataService.Util().msgConfirm('¿Está seguro que desea procesar la información?', () => {
      this.dataService.Spinner().show("sp6");
      this.validar = false;
      this.procesar = false;
      this.dataService.CargaMasiva().procesarCargaMasiva(data).pipe(
        catchError((e) => of(e)),
        finalize(() => { this.working = false; this.dataService.Spinner().hide("sp6"); })
      ).subscribe(response => {
        if (response && response.result) {
            console.log("Carga masiva >> Response Carga: ", response);
          const estado = this.listaEstado.find(x => x.codigoCatalogoItem === TablaEstadoCargaMasiva.ProcesandoCarga);
          this.idEstado = response.data;
          this.dataFormato.idEstado = estado.idCatalogoItem;

          var registro = JSON.parse(this.localStorageService.getItem('registro'));
          console.log("Carga masiva >> Registro Carga: ", registro);

          const carga = {
            idCarga: registro.idCarga,
            idFormato: registro.idFormato,
            codigoEstado: TablaEstadoCargaMasiva.ProcesandoCarga,
            idEstado: estado.idCatalogoItem
          };
          console.log("Carga masiva >> ID Carga: ", response);


          this.localStorageService.setItem('registro', JSON.stringify(carga));
          console.log("Carga masiva >> ID Carga: ", response);

          this.dataService.Util().msgSuccess('Operación realizada de forma exitosa.', () => {
            this.router.navigate(['../../'], { relativeTo: this.route });
          });
        } else if (response && response.statusCode === 404) {
          this.dataService.Util().msgWarning(response.messages[0], () => { });
        } else if (response && response.statusCode === 422) {
          this.dataService.Util().msgWarning(response.messages[0], () => { });
        } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
          this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
        } else {
          this.dataService.Util().msgError('Ocurrieron algunos problemas al procesar de la carga masiva, por favor intente dentro de unos segundos, gracias.',
            () => { });
        }
      });
    }, () => { });

  }

  cerrarCarga() {
    this.cerrarDetalleCarga.emit(true);
  }

  default() {
    this.form.patchValue({ idFormato: '-1' });
    this.form.controls['nombreArchivo'].reset();
    this.form.controls['detalleFormato'].reset();
  }

  uploadFile(files) {
    const data = this.form.getRawValue();
    const idFormato = parseInt(data.idFormato) <= 0 ? null : parseInt(data.idFormato);

    if (idFormato === null || data.nombreArchivo === '') {
      return this.dataService.Util().msgWarning(`Debe seleccionar primero el formato`, () => { });
    }
    const inputNode: any = document.querySelector('#file');
    if (typeof (FileReader) !== 'undefined') {
      if (files[0].size >= this.globals.PESO_ARCHIVO_ADJUNTO_2MB) {
        this.dataService.Util().msgWarning(`El archivo adjunto supera el límite permitido de ${this.globals.PESO_2MB}.`, () => { });
      } else {
        const nombreArchivo = files[0].name;
        let cantidadCaracteres = nombreArchivo.split('.', 1)[0].length;

        if (files.length !== 1) {
          return this.dataService.Util().msgWarning(`Solo se puede seleccionar un archivo`, () => { });
        }

        if (cantidadCaracteres > this.globals.tamanioNombreArchivo) {
          return this.dataService
            .Util().msgWarning(`El nombre del archivo es muy grande, la cantidad máxima de caracteres es de ${this.globals.tamanioNombreArchivo} dígitos`, () => { });
        }

        this.form.controls['nombreArchivo'].setValue(nombreArchivo);
        this.archivo = files[0];
        this.disabledControls();
        inputNode.value = '';
        this.guardarCargaMasiva();
      }
    }
  }

  guardarCargaMasiva() {
    const usuario = this.dataService.Storage().getPassportUserData();
    if (!usuario) {
      this.dataService.Util().msgWarning('Datos de usuario no encontrado, por favor vuelva ingresar.', () => { });
      return;
    }

    let codigoDocumento = null;
    const data = this.form.getRawValue();
    const idFormato = parseInt(data.idFormato) <= 0 ? null : parseInt(data.idFormato);
    const nombreArchivo = ((data.nombreArchivo || '').trim().length === 0) ? null : data.nombreArchivo.trim();
    const detalleFormato = ((data.detalleFormato || '').trim().length === 0) ? ' ' : data.detalleFormato.trim();

    if (idFormato === null || nombreArchivo === null) {
      this.dataService.Util().msgWarning('Completar los datos requeridos.', () => { });
      this.enabledControls();
      return;
    }

    if (typeof this.archivo === 'undefined') {
      this.dataService.Util().msgWarning('Debe adjuntar un documento para la carga masiva.', () => { });
      this.enabledControls();
      return;
    }

    this.obtenerClavePublica(TablaAccionesPassport.Importar, true, TablaMetodosCargaMasiva.NUEVA_CARGA,
      {
        nombreArchivo: nombreArchivo,
        idFormato: idFormato.toString(),
        codigoDocumento: codigoDocumento,
        detalleFormato: detalleFormato
      });
  }

  private handleguardarCargaMasiva(parametro) {
    this.dataService.Spinner().hide("sp6");
    const datosDocumento = new FormData();
    const usuario = this.dataService.Storage().getPassportUserData();
    datosDocumento.append('codigoSistema', TablaConfiguracionSistema.PERSONAL.toString());
    datosDocumento.append('descripcionDocumento', parametro.nombreArchivo);
    datosDocumento.append('codigoUsuarioCreacion', usuario.NOMBRES_USUARIO);
    datosDocumento.append('archivo', this.archivo);
    if (typeof this.archivo === 'undefined') {
      this.dataService.Util().msgWarning('Debe adjuntar un documento para la carga masiva.', () => { });
      return;
    }
    
    const carga = {
      idFormato: parametro.idFormato,
      codigoDocumentoCarga: parametro.codigoDocumento,
      nombreArchivo: parametro.nombreArchivo,
      detalleFormato: parametro.detalleFormato,
      usuarioCreacion: usuario.NUMERO_DOCUMENTO
    };

    this.dataService.Util().msgConfirm('¿Está seguro que desea cargar el archivo?', () => {
      this.dataService.Spinner().show("sp6");
      this.dataService.Documento().crear(datosDocumento).pipe(
        catchError((e) => of(e)),
        finalize(() => { this.working = false; })
      ).subscribe(response => {
        if (response && response.result) {
          if (response.data) {
            carga.codigoDocumentoCarga = response.data.codigoDocumento;
            this.crearCargaMasiva(carga);
            this.enabledControls();
          }
        } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Util().msgWarning(response.messages[0], () => { });
        } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
        } else {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Util().msgError('Ocurrieron algunos problemas al registrar la carga masiva, por favor intente dentro de unos segundos, gracias.',
            () => { });
        }
      });
    }, () => { });
  }

  errorCargar() {
    this.cargarDocumento.emit(false);
    this.validar = false;
  }

  crearCargaMasiva(carga: any) {
    const usuario = this.dataService.Storage().getPassportUserData();
    if (!usuario) {
      this.dataService.Spinner().hide("sp6");
      this.dataService.Util().msgWarning('Datos de usuario no encontrado, por favor vuelva ingresar.', () => { });
      return;
    }

    const rol = this.dataService.Storage().getPassportRolSelected();
    const cargamasiva = new FormData();
    cargamasiva.append('carga.idFormato', carga.idFormato);
    cargamasiva.append('carga.codigoDocumentoCarga', carga.codigoDocumentoCarga);
    cargamasiva.append('carga.nombreArchivo', carga.nombreArchivo);
    cargamasiva.append('carga.detalleFormato', carga.detalleFormato);
    cargamasiva.append('carga.codigoSistema', this.datosSistema.codigoSistema);
    cargamasiva.append('carga.codigoFuncionalidad', this.datosSistema.codigoFuncionalidad);
    cargamasiva.append('carga.parametro', this.datosSistema.parametro);
    cargamasiva.append('carga.parametro2', this.datosSistema.parametro2);
    cargamasiva.append('carga.idParametro', this.datosSistema.idParametro);
    cargamasiva.append('carga.datosRegistroOrigen', this.datosSistema.datosRegistroOrigen);
    cargamasiva.append('carga.usuarioCreacion', usuario.NOMBRES_USUARIO);
    cargamasiva.append('archivo', this.archivo);
    cargamasiva.append('carga.codigoRol', rol.CODIGO_ROL);
    cargamasiva.append('carga.codigoSede', rol.CODIGO_SEDE);
    cargamasiva.append('carga.codigoTipoSede', rol.CODIGO_TIPO_SEDE);

    this.dataService.CargaMasiva().crearCargaMasiva(cargamasiva).pipe(
      catchError((e) => of(e)),
      finalize(() => { this.working = false; this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response && response.result) {
        const estado = this.listaEstado.find(x => x.codigoCatalogoItem === TablaEstadoCargaMasiva.Cargado);
        const data = {
          idCarga: response.data,
          idFormato: carga.idFormato,
          codigoEstado: TablaEstadoCargaMasiva.Cargado,
          idEstado: estado.idCatalogoItem
        };

        this.localStorageService.setItem('registro', JSON.stringify(data));

        this.dataFormato.idCarga = response.data;
        this.finalizarProceso();

      } else if (response && response.statusCode === 404) {
        this.dataService.Util().msgWarning(response.messages[0], () => { });
        this.errorCargar();
      } else if (response && response.statusCode === 422) {
        this.dataService.Util().msgWarning(response.messages[0], () => { });
        this.errorCargar();
      } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
      } else {
        this.dataService.Util().msgError('Ocurrieron algunos problemas al registrar la carga masiva, por favor intente dentro de unos segundos, gracias.', () => { });
        this.errorCargar();
      }
    });
  }

  finalizarProceso() {
    this.dataService.Util().msgSuccess('Operación realizada de forma exitosa',
      () => {
        this.refrescarGrillaCargaMasiva();
        this.loadCargaMasiva(this.dataFormato);
        this.cargarDocumento.emit(true);
      });
  }

  disabledControls() {
    this.form.controls['idFormato'].disable();
    this.form.controls['nombreArchivo'].disable();
    this.form.controls['detalleFormato'].disable();

    this.mostrar = true;
    this.ocultar = false;
  }

  enabledControls() {
    this.form.controls['idFormato'].enable();
    this.form.controls['nombreArchivo'].enable();
    this.form.controls['detalleFormato'].enable();

    this.dataSource = new ArchivoCargaDataSource(this.dataService);
    this.displayedColumns = [];

    this.default();
    this.mostrar = false;
    this.exportar = false;
    this.ocultar = true;
    this.ocultarCarga = true;

    this.validar = false;
    this.procesar = false;
  }

  tituloGrilla(formato) {
    this.cantidadColumnas = formato.cantidadColumnas;
    let columns = '';
    let titulos = '';

    if (this.idEstado === undefined || this.idEstado === null) {
      const estados = this.listaEstado.find(x => x.codigoCatalogoItem === TablaEstadoCargaMasiva.EnProcesoCarga);
      this.idEstado = estados.idCatalogoItem;
    }

    const estado = this.listaEstado.find(x => x.idCatalogoItem === this.idEstado);
    if (estado.codigoCatalogoItem === TablaEstadoCargaMasiva.EnProcesoCarga ||
      estado.codigoCatalogoItem === TablaEstadoCargaMasiva.Cargado ||
      estado.codigoCatalogoItem === TablaEstadoCargaMasiva.EnProcesoValidacion) {
      columns = 'select,fila,' + formato.columnas;
      titulos = 'Check,Registro,' + formato.titulos;
    } else {
      columns = 'select,fila,' + formato.columnas + ',detalleError';
      titulos = 'Check,Registro,' + formato.titulos + ',Detalle de errores';
    }

    this.displayedGrid = columns.split(',');
    this.titulosGrid = titulos.split(',');

    this.displayedColumns = this.displayedGrid;
  }

  cargarDatos(data) {
    const usuario = this.dataService.Storage().getPassportUserData();
    if (!usuario) {
      this.dataService.Util().msgWarning('', () => { });
      return;
    }

    const rol = this.dataService.Storage().getPassportRolSelected();
    this.dataFormato = {
      idCarga: data.idCarga,
      usuarioModificacion: usuario.NOMBRES_USUARIO,
      codigoEstado: data.codigoEstado,
      idEstado: data.idEstado,
      codigoRol: rol.CODIGO_ROL,
      codigoTipoSede: rol.CODIGO_TIPO_SEDE,
      codigoSede: rol.CODIGO_SEDE
    };

    this.idEstado = data.idEstado;
    this.form.controls['idFormato'].setValue(parseInt(data.idFormato));
    this.ocultarCarga = false;
    this.exportar = true;
    this.validar = false;
    this.procesar = false;

    if (data.codigoEstado === TablaEstadoCargaMasiva.Cargado) {
      this.validar = true;
    }

    if (data.codigoEstado === TablaEstadoCargaMasiva.Validado) {
      this.procesar = true;
    }

    this.disabledControls();
    this.loadCargaMasiva(this.dataFormato);
  }

  cargarDatosProcesados(data) {
    const usuario = this.dataService.Storage().getPassportUserData();
    if (!usuario) {
      this.dataService.Util().msgWarning('DATOS DE USUARIO NO ENCONTRADO, POR FAVOR VUELVA INGRESAR.', () => { });
      return;
    }

    const rol = this.dataService.Storage().getPassportRolSelected();
    this.dataFormato = {
      idCarga: data.idCarga,
      usuarioModificacion: usuario.NOMBRES_USUARIO,
      codigoEstado: data.codigoEstado,
      idEstado: data.idEstado,
      codigoRol: rol.CODIGO_ROL,
      codigoTipoSede: rol.CODIGO_TIPO_SEDE,
      codigoSede: rol.CODIGO_SEDE
    };

    this.idEstado = data.idEstado;
    this.form.controls['idFormato'].setValue(data.idFormato);
    this.ocultarCarga = false;
    this.exportar = true;
    this.detalleProcesado = true;
    this.validar = true;
    this.disabledControls();
    this.loadCargaMasiva(this.dataFormato);
  }

  exportarDetalle() {
    if (this.dataSource.totalRegistros === 0) { return true; }
    this.obtenerClavePublica(TablaAccionesPassport.Exportar, true, TablaMetodosCargaMasiva.EXPORTAR_DETALLE_CARGA_MASIVA);
  }

  private handleExportarCargaMasiva() {
    var values = this.form.getRawValue();

    const rol = this.dataService.Storage().getPassportRolSelected();
    const data = {
      idCarga: this.dataFormato.idCarga,
      error: 0,
      idFormato: values.idFormato,
      codigoRol: rol.CODIGO_ROL,
      codigoTipoSede: rol.CODIGO_TIPO_SEDE,
      codigoSede: rol.CODIGO_SEDE
    }
    this.dataService.CargaMasiva().exportarDetalleCargaMasivaExcel(data)
      .pipe(
        catchError(() => { return of(null) }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response) => {
        const nombreFile: string = 'DetalleCargaMasiva.xlsx';
        this.dataService.CargaMasiva().downloadFile(response, nombreFile);
      });
  }


  obtenerClavePublica(operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosCargaMasiva, param?: any) {
    this.dataService.Spinner().show("sp6");
    this.dataService.Passport().boot().pipe(
      catchError(() => of(null))
    ).subscribe((response: any) => {
      if (response) {
        const d = response;
        this.confirmarOperacion(d.Token, operacion, requiredLogin, method, param);
      } else {
        this.dataService.Spinner().hide("sp6");
        if (!requiredLogin) { this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => { }); }
        else { this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); }); }
        return;
      }
    });
  }

  confirmarOperacion(token: any, operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosCargaMasiva, parametro?: any) {
    //Descomentar
    /*
    const parametroPermiso = this.dataService.Storage().getParamAccion(operacion);
    if (!parametroPermiso) {
      this.dataService.Spinner().hide("sp6");
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => { });
      return;
    }
    
   
    const param = this.dataService.Cifrado().PassportEncode(token, parametroPermiso);
    this.dataService.Passport().getAutorizacion(param).pipe(
      catchError(() => { return of(null) }),
      finalize(() => { })
    ).subscribe(response => {
      if (response && !response.HasErrors) {
        const data = response.Data[0];
        */
        let data = {
            ESTA_AUTORIZADO : true
        };
        if (data.ESTA_AUTORIZADO) {  
          switch (method) {
            case TablaMetodosCargaMasiva.GRID_DETALLE_CARGA_MASIVA: {
              this.handleloadData(parametro);
              break;
            }
            case TablaMetodosCargaMasiva.DESCARGAR_FORMATO: {
              this.handleDescargarFormato();
              break;
            }
            case TablaMetodosCargaMasiva.VALIDAR_CARGA: {
              this.handleValidarInformacion();
              break;
            }
            case TablaMetodosCargaMasiva.NUEVA_CARGA: {
              this.handleguardarCargaMasiva(parametro);
              break;
            }
            case TablaMetodosCargaMasiva.EXPORTAR_DETALLE_CARGA_MASIVA: {
              this.handleExportarCargaMasiva();
              break;
            }
            case TablaMetodosCargaMasiva.PROCESAR_CARGA:{
              this.handleProcesarInformacion();
              break;
            }
          }
        } else {
          this.dataService.Spinner().hide("sp6");
          if (!requiredLogin) { this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => { }); }
          else { this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); }); }
          return;
        }
        /*
      } else {
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); });
      }
    });
    */
  }

}

export class ArchivoCargaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalRegistros = 0;
  public registrosCorrectos = 0;
  public registrosErrados = 0;
  public nombreArchivo = '';
  public fechaCarga = '';

  constructor(
    private dataService: DataService) {
    super();
  }

  load(data, pageIndex, pageSize) {
    this._loadingChange.next(true);
    this.dataService.CargaMasiva().listaDetalleCargaMasiva(data, pageIndex, pageSize).pipe(
      catchError((e) => of(e)),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this._dataChange.next(response.data || []);
        this.totalRegistros = ((response.data || []).length === 0) ? 0 : response.data[0].totalRegistros;
        this.nombreArchivo = ((response.data || []).length === 0) ? '' : response.data[0].nombreArchivo;
        this.fechaCarga = ((response.data || []).length === 0) ? '' : response.data[0].fechaCarga;
        this.registrosErrados = ((response.data || []).length === 0) ? 0 : response.data[0].registrosErrados;
        this.registrosCorrectos = ((response.data || []).length === 0) ? 0 : response.data[0].registrosCorrectos;
      }
      else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
      } else {
        this._dataChange.next([]);
        this.totalRegistros = 0;
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

  get data(): any {
    return this._dataChange.value || [];
  }

}


