import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from 'app/core/data/data.service';
import { DatosDocumentoSustento, DatosLaborales, DatosPersonales, DatosAtencionReporte, PlazaDetalleAtencion, ServidorPublicoDetalleAtencion } from 'app/core/model/abandono-cargo.model';
import { SecurityModel } from 'app/core/model/security/security.model';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { SingleFileInputComponent } from 'app/main/apps/components/single-file-input/single-file-input.component';
import { of, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BuscadorPersonaComponent } from '../components/buscador-persona/buscador-persona.component';
import { ObservarComponent } from './observar/observar.component';
import { SustentoInfoComponent } from './sustento-info/sustento-info.component';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'minedu-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations  
})
export class RegistroComponent implements OnInit {

  private passport: SecurityModel = new SecurityModel();
  nombreCabecera = '';
  idAtencionReporte = 0;
  datosPersonales = new DatosPersonales();
  datosLaborales = new DatosLaborales();
  datosAtencionReporte = new DatosAtencionReporte();
  datosDocumentoSustento: DatosDocumentoSustento[] = [];
  isObs: boolean = false;
  isRein = false;
  form: FormGroup;
  now = new Date();
  working = false;
  minDate = new Date(new Date());
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31);  
  dialogRef: any;
  totalLoadLists = 0;
  labelDateReport = "Fecha Reporte"
  widthTable = "0px";

  comboLists = {
    listTipoFormato: [],
    listTipoDocumentoIdentidad: [],
    listTipoDocumentoSustento: [],
    listRegimenLaboral: [],
    listMotivoAccion: []
  };

  displayedColumns: string[] = [
    'numeroRegistro',
    'tipoDocumentoSustento',
    'numeroDocumentoSustento',
    'fechaEmision',
    'tipoFormatoSustento',
    'numeroFolios',
    'fechaRegistro',
    'acciones'
  ];

  dialogRefPreview: any;
  dataSource:MatTableDataSource<DatosDocumentoSustento>;
  selection = new SelectionModel<any>(true, []);
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private materialDialog: MatDialog,
    private dataService: DataService,
    private datepipe: DatePipe) { }

  ngOnInit(): void {
    this.buildPassport();
    this.buildForm();
    this.activeRoute.paramMap.subscribe((params: any) => {
      this.nombreCabecera = 'Otras Acciones de Personal: Abandono de Cargo y Otros';
      if (params.params.idAtencionReporte) {
        this.idAtencionReporte = params.params.idAtencionReporte;
        if (params.params.idReincorporar) {
          this.isRein = true;
        }
      }
    });

    window.onresize = () => {
      this.resizeWindow();
    };

    this.resizeWindow();
    this.buildGridDefault();
    this.loadCombos();
  }

  resizeWindow() {
    var w = document.documentElement.clientWidth;
    var min = 0;
    if (w <= 599) {
      min = 130;
    }else if (w <= 1279) {
      min = 125
    }else {
      min = 195
    }

    this.widthTable = (w-min).toString() + 'px';
  }

  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idAtencionReporte: 0,
      mandatoJudicial: false,
      idDre: null,
      idUgel: null,
      idCentroTrabajo: null,
      anio: [this.now.getFullYear()],
      idServidorPublico: null,
      idPersona: [null, Validators.required],
      idOrigen: 2,
      idTipoAtencion: 2,
      idEstadoAtencion: 0,
      idRegimenLaboral: 0,
      idAccion: null,
      idMotivoAccion: null,
      idGrupoAccion: null,
      codigoPlaza: null,
      idItemPlaza: null,
      fechaAtencionReporte: [this.now, Validators.required],
      fechaRegistroAtencion: [this.now, Validators.required],
      reincorporado: null,
      idAtencionRelacionada: null,
      idTipoDocumentoIdentidad: null,
      numeroDocumentoIdentidad: null,
      // conPlazoEspejo: null,
      // codigoPlazoEspejo: null,
      // itemPlazaEspejo: null,
      observaciones: null,
      // codigoAccionGrabada: null,
      // fechaProyectoResolucion: null,
      // codigoProyectoResolucion: null,
      // documentoProyectoResolucion: null,
      // numeroProyectoResolucion: null,
      // fechaResolucion: null,
      // codigoResolucion: null,
      // codigoDocumentoResolucion: null,
      // entidadEmiteResolucion: null,
      // numeroResolucion: null
      sustentatorio: this.formBuilder.group(new DatosDocumentoSustento()),
      documentoSustento: this.formBuilder.array([], Validators.required),
      idPlazaDetalleAtencion: null,
      plazaDetalleAtencion: [PlazaDetalleAtencion, [Validators.required]],
      idServidorPublicoDetalleAtencion: null,
      servidorPublicoDetalleAtencion: [ServidorPublicoDetalleAtencion, [Validators.required]],
    });

    this.form.get('sustentatorio.fechaRegistro').setValue(this.now);
  }

  buildFormEdit(){
    if (this.idAtencionReporte > 0 && this.totalLoadLists == 4) {
      this.dataService.Spinner().show("sp6");
      this.dataService.OtrasFuncionalidades().getAtencionReporteIdAtencion(this.idAtencionReporte).pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Util().msgWarning(error.error.messages[0]);
          return of(null);
        }),
        finalize(() => {
          if (this.isRein) {
            this.idAtencionReporte = 0;
          }
          this.dataService.Spinner().hide('sp6');
        })
        ).subscribe(
        (response) => {
          if(response)
          {
            this.form.patchValue({
              idAtencionReporte: response.idAtencionReporte,
              mandatoJudicial: response.mandatoJudicial,
              idDre: response.idDre,
              idUgel: response.idUgel,
              idCentroTrabajo: response.idCentroTrabajo,
              anio: response.anio,
              idServidorPublico: response.idServidorPublico,
              idPersona: response.servidorPublicoDetalleAtencion.idPersona,
              idOrigen: response.idOrigen,
              idTipoAtencion: response.idTipoAtencion,
              idEstadoAtencion: response.idEstadoAtencion,
              idRegimenLaboral: response.idRegimenLaboral,
              idAccion: response.idAccion,
              idMotivoAccion: response.idMotivoAccion,
              idGrupoAccion: response.idGrupoAccion,
              codigoPlaza: response.codigoPlaza,
              idItemPlaza: response.idItemPlaza,
              fechaAtencionReporte: response.fechaAtencionReporte,
              fechaRegistroAtencion: response.fechaRegistroAtencion,
              reincorporado: response.reincorporado,
              idAtencionRelacionada: response.idAtencionRelacionada,
              idTipoDocumentoIdentidad: response.idTipoDocumentoIdentidad,
              numeroDocumentoIdentidad: response.idNumeroDocumentoIdentidad,
              // conPlazoEspejo: null,
              // codigoPlazoEspejo: null,
              // itemPlazaEspejo: null,
              observaciones: response.observaciones,
              // codigoAccionGrabada: null,
              // fechaProyectoResolucion: null,
              // codigoProyectoResolucion: null,
              // documentoProyectoResolucion: null,
              // numeroProyectoResolucion: null,
              // fechaResolucion: null,
              // codigoResolucion: null,
              // codigoDocumentoResolucion: null,
              // entidadEmiteResolucion: null,
              // numeroResolucion: null
              idPlazaDetalleAtencion: response.plazaDetalleAtencion.idPlazaDetalleAtencion,
              idServidorPublicoDetalleAtencion: response.servidorPublicoDetalleAtencion.idServidorPublicoDetalleAtencion
            });

            this.loadComboMotivoAccion();

            
            if (response.servidorPublicoDetalleAtencion) {
              this.datosPersonales.tipoDocumentoIdentidad = response.servidorPublicoDetalleAtencion.tipoDocumentoIdentidad;
              this.datosPersonales.numeroDocumentoIdentidad = response.servidorPublicoDetalleAtencion.numeroDocumentoIdentidad;
              this.datosPersonales.nombresCompletos = response.servidorPublicoDetalleAtencion.primerApellido + ' ' + response.servidorPublicoDetalleAtencion.segundoApellido + ', ' + response.servidorPublicoDetalleAtencion.nombres;
              this.datosPersonales.estadoCivil = response.servidorPublicoDetalleAtencion.estadoCivil;
              this.datosPersonales.genero = response.servidorPublicoDetalleAtencion.genero;
              this.datosPersonales.fechaNacimiento = response.servidorPublicoDetalleAtencion.fechaNacimiento;
              this.datosAtencionReporte.idPersona = response.servidorPublicoDetalleAtencion.idPersona;

              this.datosLaborales.codigoPlaza = response.servidorPublicoDetalleAtencion.codigoPlaza;
              this.datosLaborales.itemPlaza = response.servidorPublicoDetalleAtencion.itemPlaza;
              this.datosLaborales.idRegimenLaboral = response.idRegimenLaboral;
              this.datosLaborales.descripcionRegimenLaboral = response.servidorPublicoDetalleAtencion.descripcionRegimenLaboral;
              this.datosLaborales.idCentroTrabajo = response.servidorPublicoDetalleAtencion.idCentroTrabajo;
              this.datosLaborales.idCondicionLaboral = response.servidorPublicoDetalleAtencion.idCondicionLaboral;
              this.datosLaborales.idJornadaLaboral = response.servidorPublicoDetalleAtencion.idJornadaLaboral;
              this.datosLaborales.idCategoriaRemunerativa = response.servidorPublicoDetalleAtencion.idCategoriaRemunerativa;
              this.datosLaborales.descripcionCategoriaRemunerativa = response.servidorPublicoDetalleAtencion.descripcionCategoriaRemunerativa;
              this.datosLaborales.idCargo = response.servidorPublicoDetalleAtencion.idCargo;
              this.datosLaborales.idTipoCargo = response.plazaDetalleAtencion.idTipoCargo;
              this.datosLaborales.descripcionCargo = response.servidorPublicoDetalleAtencion.descripcionCargo;
              this.datosLaborales.idTipoPlaza = response.plazaDetalleAtencion.idTipoPlaza;
              this.datosLaborales.idEstadoPlaza = response.plazaDetalleAtencion.idEstadoPlaza;
              this.datosLaborales.idServidorPublico = response.servidorPublicoDetalleAtencion.idServidorPublico;
              this.datosLaborales.idSituacionLaboral = response.servidorPublicoDetalleAtencion.idSituacionLaboral;
              this.datosLaborales.codigoServidorPublico = response.servidorPublicoDetalleAtencion.codigoServidorPublico;
              this.datosLaborales.institucionEducativa = response.servidorPublicoDetalleAtencion.institucionEducativa;
              this.datosLaborales.idNivelEducativo = response.servidorPublicoDetalleAtencion.idNivelEducativo;
              this.datosLaborales.descripcionNivelEducativo = response.servidorPublicoDetalleAtencion.descripcionNivelEducativo;
              this.datosLaborales.idModalidadEducativa = response.servidorPublicoDetalleAtencion.idModalidadEducativa;
              this.datosLaborales.descripcionModalidadEducativa = response.servidorPublicoDetalleAtencion.descripcionModalidadEducativa;
              this.datosLaborales.idUgel = response.idUgel;
              this.datosLaborales.descripcionUgel = response.descripcionUgel;
              this.datosLaborales.idDre = response.idDre;
              this.datosLaborales.descripcionDre = response.descripcionDre;
              this.datosLaborales.idJornadaLaboral = response.servidorPublicoDetalleAtencion.idJornadaLaboral;
              this.datosLaborales.descripcionJornadaLaboral = response.servidorPublicoDetalleAtencion.descripcionJornadaLaboral;
              this.datosLaborales.idCentroTrabajo = response.servidorPublicoDetalleAtencion.idCentroTrabajo;
              this.datosLaborales.descripcionTipoCentroTrabajo = response.servidorPublicoDetalleAtencion.descripcionTipoCentroTrabajo;
              this.datosLaborales.idCondicionLaboral = response.servidorPublicoDetalleAtencion.idCondicionLaboral;
              this.datosLaborales.descripcionCondicionLaboral = response.servidorPublicoDetalleAtencion.descripcionCondicionLaboral;
              this.datosLaborales.idSituacionLaboral = response.servidorPublicoDetalleAtencion.idSituacionLaboral;
              this.datosLaborales.descripcionSituacionLaboral = response.servidorPublicoDetalleAtencion.descripcionSituacionLaboral;
              this.datosLaborales.vigenciaInicio = response.plazaDetalleAtencion.vigenciaInicioPlaza;
              this.datosLaborales.vigenciaFin = response.plazaDetalleAtencion.vigenciaFinPlaza;
           
            }

            this.form.patchValue({ 
              plazaDetalleAtencion: new PlazaDetalleAtencion(this.form.get('idPlazaDetalleAtencion').value, this.idAtencionReporte, this.datosLaborales.codigoPlaza, this.datosLaborales.itemPlaza
                                    , this.datosLaborales.vigenciaInicio, this.datosLaborales.vigenciaFin, this.datosLaborales.idRegimenLaboral, this.datosLaborales.idCentroTrabajo
                                    , this.datosLaborales.idCondicionLaboral, this.datosLaborales.idJornadaLaboral, this.datosLaborales.idCategoriaRemunerativa, this.datosLaborales.idTipoCargo
                                    , this.datosLaborales.idCargo, this.datosLaborales.idTipoPlaza, this.datosLaborales.idEstadoPlaza, response.plazaDetalleAtencion.idAreaDesempenioLaboral),
              servidorPublicoDetalleAtencion: new ServidorPublicoDetalleAtencion(this.form.get('idServidorPublicoDetalleAtencion').value, this.idAtencionReporte, this.datosLaborales.idServidorPublico, this.form.get('idPersona').value
                                              , this.datosLaborales.idRegimenLaboral, this.datosLaborales.idSituacionLaboral, this.datosLaborales.idCondicionLaboral
                                              , this.datosLaborales.idCargo, this.datosLaborales.idJornadaLaboral, this.datosLaborales.idCategoriaRemunerativa
                                              , this.datosLaborales.idCentroTrabajo, this.datosLaborales.codigoServidorPublico, this.datosLaborales.codigoPlaza
                                              , this.datosLaborales.itemPlaza)
            });

            this.datosDocumentoSustento = response.documentoSustento;
            this.dataSource.data = this.datosDocumentoSustento;

            response.documentoSustento.forEach(element => {
              const docSust = this.form.controls.documentoSustento as FormArray;
              docSust.push(this.getFormSustentatorio(element));
            });

            
            if (this.isRein) {
              this.form.get('idMotivoAccion').setValue(response.idMotivoAccionReincorporar);
              this.form.get('idAtencionRelacionada').setValue(this.idAtencionReporte);
              this.form.controls.idRegimenLaboral.disable();
              this.form.controls.idMotivoAccion.disable();
            }

          }
          this.dataService.Spinner().hide("sp6");
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
    }
  }
  
  buildGridDefault(){
    this.datosDocumentoSustento = [];
    this.dataSource = new MatTableDataSource(this.datosDocumentoSustento);
    this.dataSource.paginator = this.paginator;
  }

  onChangeRegimenLaboral(event) {
    this.loadComboMotivoAccion();
  }

  onChangeMotivoAccion(event: any){
    this.setLabelFechaReporte(event.value);
  }

  setLabelFechaReporte(idMotivoAccion: number): void{
    var selectTipoReporte = this.comboLists.listMotivoAccion.find(e => e.idMotivoAccion == idMotivoAccion);
    if (selectTipoReporte) {
      switch (selectTipoReporte.codigoMotivoAccion) {
        case 305:
          this.labelDateReport = "Fecha Abandono de Cargo";
          break;
        case 306:
          this.labelDateReport = "Fecha por Reincorporar por Abandono de Cargo";
          break;
        case 307:
          this.labelDateReport = "Fecha de Poner a Disposición";
          break;
        case 308:
          this.labelDateReport = "Fecha por Reincorporar por Poner a Disposición";
          break;
        default:
          this.labelDateReport = "Fecha Reporte";
          break;
      } 
    }
  }

  loadCombos(){
    this.loadComboRegimenLaboral();
    this.loadComboTipoDocumentoIdentidad();
    this.loadComboTipoDocumentoSustento();
    this.loadComboTipoFormatoSustento();
  }

  loadComboTipoDocumentoIdentidad(){
    let request = {
      codigoCatalogo: 6,
      Inactivo: false
    }
    
    this.dataService.OtrasFuncionalidades().getCatalogoItem(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Util().msgWarning(error.error.messages[0]);
        return of(null);
      }),
      finalize(() => {
          this.dataService.Spinner().hide('sp6');
      })
      ).subscribe(
      (response) => {
        this.totalLoadLists+=1;
        this.comboLists.listTipoDocumentoIdentidad = response;
        this.comboLists.listTipoDocumentoIdentidad.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--SELECCIONE TIPO DOCUMENTO--'
        });
        this.buildFormEdit();
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }
  
  loadComboTipoDocumentoSustento(){
    let request = {
      codigoCatalogo: 20,
      Inactivo: false
    }
    
    this.dataService.OtrasFuncionalidades().getCatalogoItem(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Util().msgWarning(error.error.messages[0]);
        return of(null);
      }),
      finalize(() => {
          this.dataService.Spinner().hide('sp6');
      })
      ).subscribe(
      (response) => {
        this.totalLoadLists+=1;
        this.comboLists.listTipoDocumentoSustento = response;
        this.comboLists.listTipoDocumentoSustento.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--SELECCIONE TIPO SUSTENTO--'
        });
        this.buildFormEdit();
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  loadComboTipoFormatoSustento(){
    let request = {
      codigoCatalogo: 33,
      Inactivo: false
    }
    
    this.dataService.OtrasFuncionalidades().getCatalogoItem(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Util().msgWarning(error.error.messages[0]);
        return of(null);
      }),
      finalize(() => {
          this.dataService.Spinner().hide('sp6');
      })
      ).subscribe(
      (response) => {
        this.totalLoadLists+=1;
        this.comboLists.listTipoFormato = response;
        this.comboLists.listTipoFormato.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--SELECCIONE TIPO FORMATO--'
        });
        this.buildFormEdit();
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  loadComboRegimenLaboral() {
    let request = {
        SinFiltro: true
    }

    this.dataService.OtrasFuncionalidades().getComboRegimenLaboral(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Util().msgWarning(error.error.messages[0]);
        return of(null);
      }),
      finalize(() => {
          this.dataService.Spinner().hide('sp6');
      })
      ).subscribe(
      (response) => {
        this.totalLoadLists+=1;
        this.comboLists.listRegimenLaboral = response;
        this.comboLists.listRegimenLaboral.unshift({
            idRegimenLaboral: -1,
            descripcionRegimenLaboral: '--TODOS--'
        });
        this.buildFormEdit();
      },
      (error: HttpErrorResponse) => {
      console.log(error);
    });
  }

  loadComboMotivoAccion() {
    let request = {
        codigoAccion: 53,
        codigoGrupoAccion: 13,
        idRegimenLaboral: this.form.get('idRegimenLaboral').value
    }

    this.dataService.OtrasFuncionalidades().getMotivoAccion(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Util().msgWarning(error.error.messages[0]);
        return of(null);
      }),
      finalize(() => {
          this.dataService.Spinner().hide('sp6');
      })
      ).subscribe(
      (response) => {
        this.comboLists.listMotivoAccion = response;
        this.comboLists.listMotivoAccion.unshift({
          idMotivoAccion: -1,
          descripcionMotivoAccion: '--TODOS--'
        });
        this.setLabelFechaReporte(response.idMotivoAccion);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      });
  }

  onKeyPressNumeroDocumento(e: any): boolean {
    let _idTipoDocumento  = this.form.get('idTipoDocumentoIdentidad').value;    
    let tipoDocumentoSelect = this.comboLists.listTipoDocumentoIdentidad.find(m => m.id_catalogo_item == _idTipoDocumento);
    
    this.datosPersonales.nombresCompletos = null;
    this.datosLaborales.codigoPlaza = null;
    
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

  onKeyDownNumeroDocumento(e: any){
    if(e.key == 'Backspace')
    {
      if(this.form.get('numeroDocumentoIdentidad').value)
      {
        this.datosPersonales.nombresCompletos = null;
        this.datosLaborales.codigoPlaza = null;
        return true;
      }
    }
  }
  
  onKeyUpNumeroDocumento(e: any){
    if(!Number(this.form.get('numeroDocumentoIdentidad').value))
    {
      this.form.get('numeroDocumentoIdentidad').setValue(null);
    }

    if(e.key == 'Enter')
    {
      this.buscarNumeroDocumentoIdentidad();
    }
  }
  
  onKeyPressFolios(e: any): boolean {
      const reg = /^\d+$/;
      const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
      }
  }

  onKeyUpFolios(e: any){
    if(!Number(this.form.get('sustentatorio.numeroFolios').value))
    {
      this.form.get('sustentatorio.numeroFolios').setValue(null);
    }
  }

  onChangeTipoDocumentoIdentidad(event: any){
    this.form.get('numeroDocumentoIdentidad').setValue(null);
    if (event.value > 0)
    {
      if(event.value == 11 || event.value == 1)//DEFINIR ID
      {
        this.form.get('numeroDocumentoIdentidad').setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
      }
      else
      {
        this.form.get('numeroDocumentoIdentidad').setValidators([Validators.required, Validators.pattern('^[0-9]{12}$')]);
      }
    }
    else
    {
        this.form.get('numeroDocumentoIdentidad').setValidators([Validators.required]);
    }
  }

  onChangeTipoDocumentoSustento(event: any){
    if(event && event.value > 0)
    {
      this.form.get('sustentatorio.tipoDocumentoSustento').setValue(this.comboLists.listTipoDocumentoSustento.find(x => x.id_catalogo_item == event.value).descripcion_catalogo_item);
    }
    else
    {
      this.form.get('sustentatorio.tipoDocumentoSustento').setValue(null);
    }

    this.form.updateValueAndValidity();
  }

  onChangeTipoFormatoSustento(event: any){
    if(event)
    {
      if(event.value > 0)
      {
        this.form.get('sustentatorio.tipoFormatoSustento').setValue(this.comboLists.listTipoFormato.find(x => x.id_catalogo_item == event.value).descripcion_catalogo_item);
      }
      else
      {
        this.form.get('sustentatorio.tipoFormatoSustento').setValue(null);
      }
    }

    this.form.updateValueAndValidity();
  }

  buscarNumeroDocumentoIdentidad(){
    if(this.form.get('numeroDocumentoIdentidad').value){
      var param = this.form.value;
      const usuario = this.dataService.Storage().getPassportRolSelected();

      param.codigoCentroTrabajo = usuario.CODIGO_SEDE
      this.dataService.Spinner().show('sp6');

      this.dataService.OtrasFuncionalidades().getPersonaTransversal(param, 1, 1).pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Util().msgWarning(error.error.messages[0]);
          return of(null);
        }),
        finalize(() => {
            this.dataService.Spinner().hide('sp6');
        })
      ).subscribe((response: any) => {
        let totalregistro = ((response || []).length === 0) ? 0 : response[0].totalRegistro;
        if(totalregistro == 1)
        {
          this.datosPersonales.nombresCompletos = response[0].primerApellido + ' ' + response[0].segundoApellido + ', ' + response[0].nombres;
          this.datosPersonales.estadoCivil = response[0].estadoCivil;
          this.datosPersonales.genero = response[0].genero;
          this.datosPersonales.fechaNacimiento = response[0].fechaNacimiento;
          this.datosAtencionReporte.idPersona = response[0].idPersona;

          if (this.idAtencionReporte == 0) {
            this.form.patchValue({ 
              idPersona: response[0].idPersona,
              idTipoDocumentoIdentidad: response[0].idTipoDocumentoIdentidad,
              numeroDocumentoIdentidad: response[0].numeroDocumentoIdentidad
            });
          }

          this.buscarServidorPublico();
        }
        else
        {
          let idTipoDoc = this.form.get('idTipoDocumentoIdentidad').value < 0 ? -1 : this.form.get('idTipoDocumentoIdentidad').value;
          let numDocIde = this.form.get('numeroDocumentoIdentidad').value;
          this.buscarPersonaDialog(idTipoDoc, numDocIde);
        }
      });
    }else{
      let idTipoDoc = this.form.get('idTipoDocumentoIdentidad').value < 0 ? -1 : this.form.get('idTipoDocumentoIdentidad').value;
      let numDocIde = this.form.get('numeroDocumentoIdentidad').value;
      this.buscarPersonaDialog(idTipoDoc, numDocIde);
    }
  }
  
  buscarPersonaDialog(idTipoDocumentoIdentidad: number, numeroDocumentoIdentidad: string)
  {    
    this.dialogRef = this.materialDialog.open(BuscadorPersonaComponent,{
      panelClass: 'minedu-buscador-persona',
      disableClose: true,
      data: {
        idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
        numeroDocumentoIdentidad: numeroDocumentoIdentidad
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
        return;
        }
        this.datosPersonales.nombresCompletos = response.persona.primerApellido + ' ' + response.persona.segundoApellido + ', ' + response.persona.nombres;
        this.datosPersonales.estadoCivil = response.persona.estadoCivil;
        this.datosPersonales.genero = response.persona.genero;
        this.datosPersonales.fechaNacimiento = response.persona.fechaNacimiento;
        this.datosAtencionReporte.idPersona = response.persona.idPersona;

        this.form.patchValue({ 
          idPersona: response.persona.idPersona,
          idTipoDocumentoIdentidad: response.persona.idTipoDocumentoIdentidad,
          numeroDocumentoIdentidad: response.persona.numeroDocumentoIdentidad
        });

        this.buscarServidorPublico();
    });
  }

  buscarServidorPublico(){
    this.datosLaborales = new DatosLaborales();
    this.dataService.OtrasFuncionalidades().getServidorPublicoTransversal(this.datosAtencionReporte).subscribe(
      (response) => {
        if(response && (response || []).length > 0)
        {
          this.datosLaborales = response[0];

          if (this.idAtencionReporte > 0) {
            this.datosLaborales.codigoPlaza = this.form.get('codigoPlaza').value;
            this.datosLaborales.itemPlaza = this.form.get('idItemPlaza').value;
            this.datosLaborales.idRegimenLaboral = this.form.get('idRegimenLaboral').value;
            this.datosLaborales.idCentroTrabajo = this.form.get('idCentroTrabajo').value;
            this.datosLaborales.idCondicionLaboral = this.form.get('idCondicionLaboral').value;
            this.datosLaborales.idJornadaLaboral = this.form.get('idJornadaLaboral').value;
            this.datosLaborales.idCategoriaRemunerativa = this.form.get('idCategoriaRemunerativa').value;
            this.datosLaborales.idTipoCargo = this.form.get('idTipoCargo').value;
            this.datosLaborales.idCargo = this.form.get('idCargo').value;
            this.datosLaborales.idTipoPlaza = this.form.get('idTipoPlaza').value;
            this.datosLaborales.idServidorPublico = this.form.get('idServidorPublico').value;
            this.datosLaborales.idSituacionLaboral = this.form.get('idSituacionLaboral').value;
            this.datosLaborales.codigoServidorPublico = this.form.get('codigoServidorPublico').value;


            this.form.patchValue({ 
              plazaDetalleAtencion: new PlazaDetalleAtencion(this.form.get('idPlazaDetalleReporte').value, this.idAtencionReporte, this.datosLaborales.codigoPlaza, this.datosLaborales.itemPlaza
                                    , this.datosLaborales.vigenciaInicio, this.datosLaborales.vigenciaFin, this.datosLaborales.idRegimenLaboral
                                    , this.datosLaborales.idCentroTrabajo, this.datosLaborales.idCondicionLaboral, this.datosLaborales.idJornadaLaboral
                                    , this.datosLaborales.idCategoriaRemunerativa, this.datosLaborales.idTipoCargo, this.datosLaborales.idCargo, this.datosLaborales.idTipoPlaza
                                    , this.datosLaborales.idEstadoPlaza, this.datosLaborales.idAreaDesempenioLaboral),
              servidorPublicoDetalleAtencion: new ServidorPublicoDetalleAtencion(this.form.get('idServidorPublicoDetalleReporte').value, this.idAtencionReporte, this.datosLaborales.idServidorPublico, this.form.get('idPersona').value
                                              , this.datosLaborales.idRegimenLaboral, this.datosLaborales.idSituacionLaboral, this.datosLaborales.idCondicionLaboral
                                              , this.datosLaborales.idCargo, this.datosLaborales.idJornadaLaboral, this.datosLaborales.idCategoriaRemunerativa
                                              , this.datosLaborales.idCentroTrabajo, this.datosLaborales.codigoServidorPublico, this.datosLaborales.codigoPlaza
                                              , this.datosLaborales.itemPlaza)
            });

          }
          else{
            this.form.patchValue({ 
              codigoPlaza: this.datosLaborales.codigoPlaza,
              idCentroTrabajo: this.datosLaborales.idCentroTrabajo,
              idDre: this.datosLaborales.idDre,
              idUgel: this.datosLaborales.idUgel,
              idServidorPublico: this.datosLaborales.idServidorPublico,
              idItemPlaza: this.datosLaborales.idPlaza, 

              plazaDetalleAtencion: new PlazaDetalleAtencion(0, 0, this.datosLaborales.codigoPlaza, this.datosLaborales.idPlaza
                                    , this.datosLaborales.vigenciaInicio, this.datosLaborales.vigenciaFin, this.datosLaborales.idRegimenLaboral
                                    , this.datosLaborales.idCentroTrabajo, this.datosLaborales.idCondicionLaboral, this.datosLaborales.idJornadaLaboral
                                    , this.datosLaborales.idCategoriaRemunerativa, this.datosLaborales.idTipoCargo, this.datosLaborales.idCargo, this.datosLaborales.idTipoPlaza
                                    , this.datosLaborales.idEstadoPlaza, this.datosLaborales.idAreaDesempenioLaboral),
              servidorPublicoDetalleAtencion: new ServidorPublicoDetalleAtencion(0, 0, this.datosLaborales.idServidorPublico, this.form.get('idPersona').value
                                              , this.datosLaborales.idRegimenLaboral, this.datosLaborales.idSituacionLaboral, this.datosLaborales.idCondicionLaboral
                                              , this.datosLaborales.idCargo, this.datosLaborales.idJornadaLaboral, this.datosLaborales.idCategoriaRemunerativa
                                              , this.datosLaborales.idCentroTrabajo, this.datosLaborales.codigoServidorPublico, this.datosLaborales.codigoPlaza
                                              , this.datosLaborales.idPlaza)
            });
          }

        }
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  GetFormData(): any {
    let formRequest = this.form.getRawValue();
    let formDataReporte = new FormData();
    formDataReporte.append('idAtencionReporte', formRequest.idAtencionReporte);
    formDataReporte.append('mandatoJudicial', formRequest.mandatoJudicial);
    if (formRequest.idDre > 0) {
      formDataReporte.append('idDre', formRequest.idDre);
    }
    if (formRequest.idUgel > 0) {
      formDataReporte.append('idUgel', formRequest.idUgel);
    }
    formDataReporte.append('idCentroTrabajo', formRequest.idCentroTrabajo);
    formDataReporte.append('idServidorPublico', formRequest.idServidorPublico);
    formDataReporte.append('idPersona', formRequest.idPersona);
    
    formDataReporte.append('idOrigen', formRequest.idOrigen);
    formDataReporte.append('idTipoAtencion', formRequest.idTipoAtencion);
    formDataReporte.append('idEstadoAtencion', formRequest.idEstadoAtencion);
    formDataReporte.append('idRegimenLaboral', formRequest.idRegimenLaboral);
    if (formRequest.idAccion)
      formDataReporte.append('idAccion', formRequest.idAccion);
    formDataReporte.append('idMotivoAccion', formRequest.idMotivoAccion);
    if (formRequest.idGrupoAccion)
      formDataReporte.append('idGrupoAccion', formRequest.idGrupoAccion);

    formDataReporte.append('codigoPlaza', formRequest.codigoPlaza);
    formDataReporte.append('itemPlaza', formRequest.idItemPlaza);
    formDataReporte.append('anio', formRequest.anio);
    formDataReporte.append('fechaAtencionReporte', this.datepipe.transform(formRequest.fechaAtencionReporte, 'dd/MM/yyyy'));
    formDataReporte.append('fechaRegistroAtencion', this.now.toDateString());
    formDataReporte.append('idEstadoAtencion', formRequest.idEstadoAtencion);
    if (this.idAtencionReporte == 0) {
      formDataReporte.append('usuarioCreacion', this.passport.numeroDocumento);
    } else {
      formDataReporte.append('usuarioModificacion', this.passport.numeroDocumento);
    }
    if (formRequest.observaciones) {
      formDataReporte.append('observaciones', formRequest.observaciones);
    }

    //PlazaDetalleAtencion
    if(formRequest.idPlazaDetalleAtencion)
      formDataReporte.append('plazaDetalleAtencion.idPlazaDetalleAtencion', formRequest.idPlazaDetalleAtencion);
    formDataReporte.append('plazaDetalleAtencion.codigoPlaza', formRequest.plazaDetalleAtencion.codigoPlaza);
    formDataReporte.append('plazaDetalleAtencion.itemPlaza', formRequest.plazaDetalleAtencion.itemPlaza);
    formDataReporte.append('plazaDetalleAtencion.idEstadoPlaza', formRequest.plazaDetalleAtencion.idEstadoPlaza);
    formDataReporte.append('plazaDetalleAtencion.vigenciaInicioPlaza', this.datepipe.transform(formRequest.plazaDetalleAtencion.vigenciaInicioPlaza, 'dd/MM/yyyy'));
    if (formRequest.plazaDetalleAtencion.vigenciaFinPlaza && isNaN(Date.parse(formRequest.plazaDetalleAtencion.vigenciaFinPlaza))) {
      formDataReporte.append('plazaDetalleAtencion.vigenciaFinPlaza', this.datepipe.transform(formRequest.plazaDetalleAtencion.vigenciaFinPlaza, 'dd/MM/yyyy'));
    }
    formDataReporte.append('plazaDetalleAtencion.idRegimenLaboral', formRequest.plazaDetalleAtencion.idRegimenLaboral);
    formDataReporte.append('plazaDetalleAtencion.idCentroTrabajo', formRequest.plazaDetalleAtencion.idCentroTrabajo);
    formDataReporte.append('plazaDetalleAtencion.idCondicion', formRequest.plazaDetalleAtencion.idCondicionLaboral);
    formDataReporte.append('plazaDetalleAtencion.idJornadaLaboral', formRequest.plazaDetalleAtencion.idJornadaLaboral);
    formDataReporte.append('plazaDetalleAtencion.idCategoriaRemunerativa', formRequest.plazaDetalleAtencion.idCategoriaRemunerativa);
    formDataReporte.append('plazaDetalleAtencion.idTipoCargo', formRequest.plazaDetalleAtencion.idTipoCargo);
    formDataReporte.append('plazaDetalleAtencion.idCargo', formRequest.plazaDetalleAtencion.idCargo);
    formDataReporte.append('plazaDetalleAtencion.idTipoPlaza', formRequest.plazaDetalleAtencion.idTipoPlaza);
    formDataReporte.append('plazaDetalleAtencion.idAreaDesempenioLaboral', formRequest.plazaDetalleAtencion.idAreaDesempenioLaboral);
    if (this.idAtencionReporte == 0) {
      formDataReporte.append('plazaDetalleAtencion.usuarioCreacion', this.passport.numeroDocumento);
    } else {
      formDataReporte.append('plazaDetalleAtencion.usuarioModificacion', this.passport.numeroDocumento);
    }

    //ServidorPublicoDetalleAtencion
    if(formRequest.idServidorPublicoDetalleAtencion)
      formDataReporte.append('servidorPublicoDetalleAtencion.idServidorPublicoDetalleAtencion', formRequest.idServidorPublicoDetalleAtencion);
    formDataReporte.append('servidorPublicoDetalleAtencion.idServidorPublico', formRequest.servidorPublicoDetalleAtencion.idServidorPublico);
    formDataReporte.append('servidorPublicoDetalleAtencion.idPersona', formRequest.servidorPublicoDetalleAtencion.idPersona);
    formDataReporte.append('servidorPublicoDetalleAtencion.idRegimenLaboral', formRequest.servidorPublicoDetalleAtencion.idRegimenLaboral);
    formDataReporte.append('servidorPublicoDetalleAtencion.idSituacionLaboral', formRequest.servidorPublicoDetalleAtencion.idSituacionLaboral);
    formDataReporte.append('servidorPublicoDetalleAtencion.idCondicionLaboral', formRequest.servidorPublicoDetalleAtencion.idCondicionLaboral);
    formDataReporte.append('servidorPublicoDetalleAtencion.idCargo', formRequest.servidorPublicoDetalleAtencion.idCargo);
    formDataReporte.append('servidorPublicoDetalleAtencion.idJornadaLaboral', formRequest.servidorPublicoDetalleAtencion.idJornadaLaboral);
    formDataReporte.append('servidorPublicoDetalleAtencion.idCategoriaRemunerativa', formRequest.servidorPublicoDetalleAtencion.idCategoriaRemunerativa);
    formDataReporte.append('servidorPublicoDetalleAtencion.idCentroTrabajo', formRequest.servidorPublicoDetalleAtencion.idCentroTrabajo);
    formDataReporte.append('servidorPublicoDetalleAtencion.codigoServidorPublico', formRequest.servidorPublicoDetalleAtencion.codigoServidorPublico);
    formDataReporte.append('servidorPublicoDetalleAtencion.codigoPlaza', formRequest.servidorPublicoDetalleAtencion.codigoPlaza);
    formDataReporte.append('servidorPublicoDetalleAtencion.itemPlaza', formRequest.servidorPublicoDetalleAtencion.itemPlaza);
    formDataReporte.append('plazaDetalleAtencion.idAreaDesempenioLaboral', formRequest.plazaDetalleAtencion.idAreaDesempenioLaboral);
    if (this.idAtencionReporte == 0) {
      formDataReporte.append('servidorPublicoDetalleAtencion.usuarioCreacion', this.passport.numeroDocumento);
    } else {
      formDataReporte.append('servidorPublicoDetalleAtencion.usuarioModificacion', this.passport.numeroDocumento);
    }

    //DocumentoSustento
    for (let i = 0; i < formRequest.documentoSustento.length; i++) {
      if (formRequest.documentoSustento[i].idDocumentoSustento) {
        formDataReporte.append('documentoSustento[' + i + '].idDocumentoSustento', formRequest.documentoSustento[i].idDocumentoSustento);
      }
      if (formRequest.documentoSustento[i].idAtencionReporte) {
        formDataReporte.append('documentoSustento[' + i + '].idAtencionReporte', formRequest.documentoSustento[i].idAtencionReporte);
      }
      formDataReporte.append('documentoSustento[' + i + '].idTipoDocumentoSustento', formRequest.documentoSustento[i].idTipoDocumentoSustento);
      formDataReporte.append('documentoSustento[' + i + '].idTipoFormatoSustento', formRequest.documentoSustento[i].idTipoFormatoSustento);
      if (formRequest.documentoSustento[i].numeroDocumentoSustento) {
        formDataReporte.append('documentoSustento[' + i + '].numeroDocumentoSustento', formRequest.documentoSustento[i].numeroDocumentoSustento);
      }
      if (formRequest.documentoSustento[i].entidadEmisora) {
        formDataReporte.append('documentoSustento[' + i + '].entidadEmisora', formRequest.documentoSustento[i].entidadEmisora);
      }
      formDataReporte.append('documentoSustento[' + i + '].fechaEmision', this.datepipe.transform(formRequest.documentoSustento[i].fechaEmision, 'dd/MM/yyyy'));
      formDataReporte.append('documentoSustento[' + i + '].numeroFolios', formRequest.documentoSustento[i].numeroFolios);
      if (formRequest.documentoSustento[i].sumilla) {
        formDataReporte.append('documentoSustento[' + i + '].sumilla', formRequest.documentoSustento[i].sumilla);
      }
      if (formRequest.documentoSustento[i].codigoDocumentoSustento) {
        formDataReporte.append('documentoSustento[' + i + '].codigoDocumentoSustento', formRequest.documentoSustento[i].codigoDocumentoSustento);
      }
      // formDataReporte.append('documentoSustento[' + i + '].vistoProyecto', formRequest.documentoSustento[i].vistoProyecto);
      formDataReporte.append('documentoSustento[' + i + '].fechaRegistro', this.datepipe.transform(formRequest.documentoSustento[i].fechaRegistro, 'dd/MM/yyyy'));
      if (formRequest.documentoSustento[i].eliminado) {
        formDataReporte.append('documentoSustento[' + i + '].eliminado', formRequest.documentoSustento[i].eliminado);
      }
      formDataReporte.append('documentoSustento[' + i + '].adjunto', formRequest.documentoSustento[i].plazoDescargo);
      if (formRequest.documentoSustento[i].idDocumentoSustento == 0) {
        formDataReporte.append('documentoSustento[' + i + '].usuarioCreacion', this.passport.numeroDocumento);
      } else {
        formDataReporte.append('documentoSustento[' + i + '].usuarioModificacion', this.passport.numeroDocumento);
      }
    }
    return formDataReporte;
  }

  handleGuardar(): void {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?', () => {
      if (!this.form.valid) {      
        this.dataService.Message().msgWarning('COMPLETAR LOS DATOS REQUERIDOS');
        return;
      }

    this.dataService.Spinner().show('sp6');
    this.form.get('idEstadoAtencion').setValue(0);

    if (this.idAtencionReporte == 0) {
      this.dataService.OtrasFuncionalidades().postAtencionReporte(this.GetFormData()).pipe(
        catchError((err) => { return throwError(err)}),
        finalize(() => {
            this.dataService.Spinner().hide('sp6');
        })
        ).subscribe(
        (response) => {
          if(response)
          {
            this.form.get('idAtencionReporte').setValue(response);
  
            if (this.isObs) {
              this.dialogRefPreview = this.materialDialog.open(ObservarComponent, {
                panelClass: 'minedu-observar',
                disableClose: true,
                data: {
                    idAtencionReporte: this.form.get('idAtencionReporte').value
                }
              });
              
              this.dialogRef.afterClosed()
              .subscribe((response: any) => {
                if (!response) {
                return;
                }
  
                this.dataService.SnackBar().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA.", 'Cerrar'); 
                this.handleCancelar();
            });
            }else{
              this.dataService.SnackBar().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA.", 'Cerrar'); 
              this.handleCancelar();
            }
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }else{
      
      this.dataService.OtrasFuncionalidades().putAtencionReporte(this.GetFormData()).pipe(
        catchError((err) => { return throwError(err)}),
        finalize(() => {
            this.dataService.Spinner().hide('sp6');
        })
        ).subscribe(
        (response) => {
          if(response)
          {
            this.form.get('idAtencionReporte').setValue(response);
  
            if (this.isObs) {
              this.dialogRefPreview = this.materialDialog.open(ObservarComponent, {
                panelClass: 'minedu-observar',
                disableClose: true,
                data: {
                    idAtencionReporte: this.form.get('idAtencionReporte').value
                }
              });
              
              this.dialogRef.afterClosed()
              .subscribe((response: any) => {
                if (!response) {
                return;
                }
  
                this.dataService.SnackBar().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA.", 'Cerrar'); 
                this.handleCancelar();
            });
            }else{
              this.dataService.SnackBar().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA.", 'Cerrar'); 
              this.handleCancelar();
            }
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }

    }, () => {});
  }

  handleObservar(): void {
    this.isObs = true;
    this.handleGuardar();
  }

  handleAtender(): void {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?', () => {
      if (!this.form.valid) {      
        this.dataService.Message().msgWarning('COMPLETAR LOS DATOS REQUERIDOS');
        return;
      }

      this.dataService.Spinner().show("sp6");      
      this.form.get('idEstadoAtencion').setValue(1);


      
      if (this.idAtencionReporte == 0) {
        this.dataService.OtrasFuncionalidades().postAtencionReporte(this.GetFormData()).pipe(
          catchError((err) => { return throwError(err)}),
          finalize(() => {
              this.dataService.Spinner().hide('sp6');
          })
          ).subscribe(
          (response) => {
            if(response)
            {
              this.dataService.SnackBar().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA.", 'Cerrar'); 
              this.handleCancelar();
            }
          },
          (error) => {
            console.log(error);
          }
        );
      }else{
        this.dataService.OtrasFuncionalidades().putAtencionReporte(this.GetFormData()).pipe(
          catchError((err) => { return throwError(err)}),
          finalize(() => {
              this.dataService.Spinner().hide('sp6');
          })
          ).subscribe(
          (response) => {
            if(response)
            {
              this.dataService.SnackBar().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA.", 'Cerrar'); 
              this.handleCancelar();
            }
          },
          (error) => {
            console.log(error);
          }
        );

      }

  
    }, () => {});
  }
  
  handleLimpiar(): void {
    this.form.patchValue({ 
      fechaReporte: null,
      observaciones: null,
      sustentatorio: new DatosDocumentoSustento(),
    });
    
    this.fileComponent.forEach(c => c.eliminarDocumento());
  }
  
  handleCancelar(): void {
      this.router.navigate(['ayni/personal/acciones/otrasacciones/abandonocargootros']);
  }
  
  @ViewChildren(SingleFileInputComponent)
  fileComponent: QueryList<SingleFileInputComponent>
  handleLimpiarSustento(): void {
    this.form.patchValue({
      sustentatorio: new DatosDocumentoSustento()
    });
    this.fileComponent.forEach(c => c.eliminarDocumento());
  }

  handleLimpiarServidorPublico(): void {
    this.form.patchValue({
      plazaDetalleAtencion: null,
      servidorPublicoDetalleAtencion: null,
      codigoPlaza: null,
      idCentroTrabajo: null,
      idDre: null,
      idUgel: null,
      idServidorPublico: null,
      idItemPlaza: null,
      idPersona: null,
      numeroDocumentoIdentidad: null
    });
    this.datosPersonales = new DatosPersonales();
    this.datosLaborales = new DatosLaborales();
  }

  handleEliminarSustento(row: any, i: number) {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR LA INFORMACIÓN?', () => {
      this.datosDocumentoSustento = this.datosDocumentoSustento.filter((value)=>{
        return value.numeroRegistro != row.numeroRegistro;
      });

      var idRow = 0
      this.datosDocumentoSustento.forEach(element => {
        element.numeroRegistro = idRow + 1;
        idRow++;
      });

      this.dataSource.data = this.datosDocumentoSustento;

      if (row.idDocumentoSustento > 0) {
        const docSust = this.form.controls.documentoSustento as FormArray;
        var tmpDocSust = docSust.value[i];
        tmpDocSust.eliminado = true;
        docSust.removeAt(i);
        docSust.push(this.getFormSustentatorio(tmpDocSust));
      }else{
        const docSust = this.form.controls.documentoSustento as FormArray;
        docSust.removeAt(i);
      }
    }, () => {});
  }

  handleAgregarSustento(){
    
    this.form.get('sustentatorio.idAtencionReporte').setValue(this.form.get('idAtencionReporte').value);
    this.form.get('sustentatorio.fechaRegistro').setValue(this.now);
    this.form.get('sustentatorio.numeroRegistro').setValue(this.datosDocumentoSustento.length + 1);

    if (this.validarSustentatorio()){
      const sForm = this.form.get('sustentatorio').value;

      this.datosDocumentoSustento.push({
        idReporte: 0,
        idAtencionReporte: sForm.idAtencionReporte,
        numeroRegistro: sForm.numeroRegistro,
        idTipoDocumentoSustento: sForm.idTipoDocumentoSustento,
        tipoDocumentoSustento: sForm.tipoDocumentoSustento,
        numeroDocumentoSustento: sForm.numeroDocumentoSustento,
        fechaEmision: sForm.fechaEmision,
        entidadEmisora: sForm.entidadEmisora,
        sumilla: sForm.sumilla,
        idTipoFormatoSustento: sForm.idTipoFormatoSustento,
        tipoFormatoSustento: sForm.tipoFormatoSustento,
        numeroFolios: sForm.numeroFolios,
        fechaRegistro: sForm.fechaRegistro,
        plazoDescargo: sForm.plazoDescargo,
        eliminado: true
      });
      
      this.dataSource.data = this.datosDocumentoSustento;

      const docSust = this.form.controls.documentoSustento as FormArray;
      docSust.push(this.getFormSustentatorio(sForm));
      this.handleLimpiarSustento();
    }    
  }

  handleInformacionSustento(row: any){
    this.dialogRefPreview = this.materialDialog.open(SustentoInfoComponent, {
      panelClass: 'minedu-sustento-info',
      disableClose: true,
      data: {
          documentoSustento: row
      }
    });
  }
  
  handleExportarSustento(row: any){
    this.dataService.Spinner().show('sp6');
    if (row.codigoDocumentoSustento) {
      this.dataService.Documento().descargar(row.codigoDocumentoSustento)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Util().msgWarning(error.error.messages[0]);
          return of(null);
        }),
        finalize(() => this.dataService.Spinner().hide('sp6'))
      ).subscribe(response => {
          if (response) {
              this.handlePreview(response, row.codigoDocumentoSustento);
          } else {
              this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL INFORME ESCALAFONARIO."', () => {
              });
          }
      });
    }
    else{
      this.dataService.Spinner().hide('sp6');
      this.handlePreview(row.plazoDescargo, 'Documento Sustento Temporal');
    }
  }
  
  handleAdjunto(file) {
    if (file === null)
      return;
      
    this.form.get('sustentatorio.plazoDescargo').setValue(file[0]);
  }

  handlePreview(file: any, codigoAdjuntoSustento: string) {
    this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: 'Documento de Sustento',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });
  };

  getTotalDataSource(): number{
    return this.datosDocumentoSustento.length;
  }

  getFormSustentatorio(sustento: DatosDocumentoSustento){
    return this.formBuilder.group(sustento);
  }

  validarSustentatorio(): boolean{
    let isValidateForm = true;
    if (this.form.get('sustentatorio.idTipoDocumentoSustento').value < 1)
    {
      this.form.get('sustentatorio.idTipoDocumentoSustento').markAllAsTouched();
      this.form.get('sustentatorio.idTipoDocumentoSustento').setErrors({'incorrect': true});
      isValidateForm = false;
    }

    if (!this.form.get('sustentatorio.numeroDocumentoSustento').value)
    {      
      this.form.get('sustentatorio.numeroDocumentoSustento').markAllAsTouched();
      this.form.get('sustentatorio.numeroDocumentoSustento').setErrors({'incorrect': true});
      isValidateForm = false;
    }

    if (!this.form.get('sustentatorio.fechaEmision').value)
    {      
      this.form.get('sustentatorio.fechaEmision').markAllAsTouched();
      this.form.get('sustentatorio.fechaEmision').setErrors({'incorrect': true});
      isValidateForm = false;
    }

    if (!this.form.get('sustentatorio.numeroFolios').value)
    {      
      this.form.get('sustentatorio.numeroFolios').markAllAsTouched();
      this.form.get('sustentatorio.numeroFolios').setErrors({'incorrect': true});
      isValidateForm = false;
    }

    if (this.form.get('sustentatorio.idTipoFormatoSustento').value < 1)
    {
      this.form.get('sustentatorio.idTipoFormatoSustento').markAllAsTouched();
      this.form.get('sustentatorio.idTipoFormatoSustento').setErrors({'incorrect': true});
      isValidateForm = false;
    }

    if (!this.form.get('sustentatorio.plazoDescargo').value)
    {
      this.form.get('sustentatorio.plazoDescargo').markAllAsTouched();
      this.form.get('sustentatorio.plazoDescargo').setErrors({'incorrect': true});
      isValidateForm = false;
    }

    return isValidateForm;
  }
}
