import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SharedService } from 'app/core/shared/shared.service';
import { isArray } from 'lodash';
import { of, Subject, forkJoin } from 'rxjs';
import { catchError, filter, finalize, map, takeUntil } from 'rxjs/operators';
import { BusquedaCentroTrabajoComponent } from '../../components/busqueda-centro-trabajo/busqueda-centro-trabajo.component';
import { BusquedaPlazaComponent } from '../../components/busqueda-plaza/busqueda-plaza.component';
import { ActualizarDatosPlazaComponent } from '../actualizar-datos-plaza/actualizar-datos-plaza.component';
import { RegistroPlaza } from './model/registro-plazas';

@Component({
  selector: 'minedu-adjudicar-plaza',
  templateUrl: './adjudicar-plaza.component.html',
  styleUrls: ['./adjudicar-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AdjudicarPlazaComponent implements OnInit, OnDestroy, AfterViewInit {

  spublico = null;
  postulacion = null;
  dialogRef: any;

  paginatorPageSize = 10;
  paginatorPageIndex = 0;

  form: FormGroup;
  working = false;
  workingAgregar = false;

  request = {
    anexoCentroTrabajo: null,
    codigoModular: null,
    codigoPlaza: null,
    idDesarrolloProceso: null,
    codigoPlazaServidorPublico: null,
    idPostulacion: null,
    idCategoriaRemunerativa: null,
    idGrupoOcupacional: null,
    idServidorPublico: null
  };
  private curr = new Date();
  firstNextYearDay = null;

  displayedColumns: string[] = [
    'select',
    'codigoModular',
    'centroTrabajo',
    'modalidad',
    'nivelEducativo',
    'tipoGestion',
    'codigoPlaza',
    'cargo',
    'grupoOcupacional',
    'categoriaRemunerativa',
    'jornadaLaboral',
    'tipoPlaza',
    'motivoVacancia',
    'fechaVigenciaInicio'
  ];


  selectionPlaza = new SelectionModel<any>(false, []);

  private _unsubscribeAll: Subject<any>;
  constructor(
    public matDialogRef: MatDialogRef<AdjudicarPlazaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private materialDialog: MatDialog,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    public globals: GlobalsService,
    private sharedService: SharedService,
  ) { this._unsubscribeAll = new Subject(); }

  ngOnInit(): void {
    this.buildForm();
    setTimeout((_) => {
      this.firstNextYearDay = new Date(this.curr.getTime() + 60 * 60 * 24 * 6 * 1000);

      this.GetPostulacion();
    });
    this.sharedService.onWorking
      .pipe(
        filter(value => {
          return value !== null;
        }),
        takeUntil(this._unsubscribeAll)
      ).subscribe(working => this.working = working);
  }


  buildForm() {
    this.form = this.formBuilder.group({
      codigoModular: [null],
      anexoCentroTrabajo: [null],
      codigoPlaza: [null],
      plazas: this.formBuilder.array([], Validators.compose([])),
    });
  }

  get plazas(): FormArray {
    return this.form.get('plazas') as FormArray;
  }

  default() {
    this.form.controls['anexoCentroTrabajo'].reset();
    this.form.controls['codigoModular'].reset();
    this.form.controls['codigoPlaza'].reset();
  }

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  private GetPostulacion = () => {
    const { idPostulacion, idEtapaProceso } = this.data;
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Rotacion()
      .getInformacionPostulante({ idPostulacion: idPostulacion, idEtapaProceso: idEtapaProceso })
      .pipe(
        catchError((e) => { return this.configCatch(e); }),
        finalize(() => { this.dataService.Spinner().hide('sp6'); })
      ).subscribe((response: any) => {
        if (response) {
          const { postulacion, servidorPublico } = response;
          this.postulacion = postulacion;
          this.spublico = servidorPublico
        } else {
          this.dataService.Message().msgWarning('ERROR AL PROCESAR LA OPERACIÓN.', () => { });
        }
      });
  }

  handleBuscar = () => {
    this.setRequest();
    this.dataService.Spinner().show('sp6');

    this.dataService.Rotacion().getAdjudicacionPlazaGrid(this.request, 1, 10).pipe(
      catchError((e) => { return this.configCatch(e); }),
      finalize(() => {
        this.dataService.Spinner().hide('sp6');
      })
    ).subscribe((response: any) => {
      if (response && (response || []).length > 0) {
        let fgs = response.map(RegistroPlaza.asFormGroup);
        fgs = fgs.map(x => {
          if (x.controls['fechaInicioVigencia'].value != null) {
            x.controls['select'].setValue(true);
          }
          return x;
        })
        this.form.setControl('plazas', new FormArray(fgs));
        this.selectionPlaza = new SelectionModel<any>(false, []);
        //this.form.controls['fechaInicioVigencia'].setValue(new Date(this.curr.getFullYear()+1, 0, 1));
      } else {
        const fgs = [].map(RegistroPlaza.asFormGroup);
        this.form.setControl('plazas', new FormArray(fgs));
        this.selectionPlaza = new SelectionModel<any>(false, []);
        this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {
        });
      }
    });

  };

  handleLimpiar() {
    this.default();
  }
  busquedaPlazas = () => {

  };

  busquedaPlazasDialog = ($event) => {
    this.dialogRef = this.materialDialog.open(
      BusquedaPlazaComponent,
      {
        panelClass: 'buscar-plaza-form',
        disableClose: true,
        data: {
          action: 'busqueda',
        },
      }
    );

    this.dialogRef.afterClosed().subscribe((resp) => {
      if (resp != null) {
        this.form.get('codigoPlaza').setValue(resp.codigoPlaza);
      }
    });
  };

  buscarCentroTrabajoDialog(event) {
    const codigoCentroTrabajo = this.form.get('codigoModular').value;
    if (codigoCentroTrabajo) {
      this.busquedaCentroTrabajo(event);
      return;
    }
    this.handleCentroTrabajoDialog([]);
  }

  busquedaCentroTrabajo(event) {
    event.preventDefault();
    const codigoCentroTrabajo = this.form.get('codigoModular').value;

    if (!codigoCentroTrabajo) {
      this.dataService.Message().msgWarning('"DEBE INGRESAR UN CÓDIGO MODULAR PARA REALIZAR LA BÚSQUEDA."', () => {
      });
      return;
    }
    if (codigoCentroTrabajo.length < 6 || codigoCentroTrabajo.length > 7) {
      this.dataService.Message().msgWarning('"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON (6 a 7) DÍGITOS."', () => {
      });
      return;
    }

    const data = {
      codigoCentroTrabajo: codigoCentroTrabajo.trim(),
      codigoNivelInstancia: parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia)
    };

    this.dataService.Spinner().show('sp6');
    this.dataService.Rotacion().getListCentroTrabajo(data, 1, 10).pipe(
      catchError((e) => { return this.configCatch(e); }),
      finalize(() => {
        this.dataService.Spinner().hide('sp6');
      })
    ).subscribe((response: any) => {
      if (response) {
        const data: any[] = response;
        if (data.length === 1) {
          this.setCentroTrabajo(data[0]);
        } else if (data.length > 1) {
          this.handleCentroTrabajoDialog(data);
          this.dataService.Message().msgAutoInfo('"SE ENCONTRÓ MÁS DE UN REGISTRO PARA EL CÓDIGO MODULAR INGRESADO, SELECCIONE UN REGISTRO"', 3000, () => {
          });
        } else {
          this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS"', () => {
          });
        }
      } else {
        this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL BUSCAR EL CENTRO DE TRABAJO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => {
        });
      }
    });
  }

  private handleCentroTrabajoDialog(registros: any[]) {
    this.dialogRef = this.materialDialog.open(
      BusquedaCentroTrabajoComponent,
      {
        panelClass: 'buscar-centro-trabajo-form',
        width: '1300px',
        disableClose: true,
        data: {
          registrado: false,
          centrosTrabajo: registros,
          permiteBuscar: registros.length === 0
        },
      }
    );

    this.dialogRef.afterClosed().subscribe((response) => {
      if (!response) {
        return;
      }
      this.setCentroTrabajo(response);
    });
  }

  private setCentroTrabajo = (data) => {
    this.form.patchValue({ codigoModular: data.codigoCentroTrabajo, anexoCentroTrabajo: data.anexoCentroTrabajo });
  };

  private setRequest = () => {
    this.request = {
      anexoCentroTrabajo: this.form.get('anexoCentroTrabajo').value,
      codigoPlaza: this.form.get('codigoPlaza').value,
      codigoPlazaServidorPublico: this.spublico.codigoPlaza,
      codigoModular: this.form.get('codigoModular').value,
      idDesarrolloProceso: this.data.idDesarrolloProceso,
      idPostulacion: this.data.idPostulacion,
      idCategoriaRemunerativa: this.spublico.idCategoriaRemunerativa,
      idGrupoOcupacional: this.spublico.idGrupoOcupacional,
      idServidorPublico: this.spublico.idServidorPublico
    };
  };

  handleCancelar(event: boolean = false) {
    this.matDialogRef.close(event);
  }

  handleAdjudicar = () => {
    const selected: any[] = this.selectionPlaza.selected;
    if (selected.length <= 0) {
      this.dataService.Message().msgWarning('"SELECCIONE UN REGISTRO PARA CONTINUAR CON LA OPERACIÓN"', () => {
      });
      return;
    }
    const form = selected[0].value;

    if (!form.fechaInicioVigencia) {
      this.dataService.Message().msgWarning('"INGRESE LA FECHA INICIO DE VIGENCIA DE LA PLAZA A ADJUDICAR"', () => {
      });
      return;
    }

    this.dataService.Spinner().show('sp6');
    this.dataService
      .Rotacion()
      .getValidarActualizacionPlaza({ idPlaza: form.idPlaza, idEtapaProceso: this.data.idEtapaProceso })
      .pipe(
        catchError((e) => {
          const { developerMessage } = e;
          this.dataService.Message().msgWarning(developerMessage, () => { });
          return of(null);
        }),
        finalize(() => { this.dataService.Spinner().hide('sp6'); })
      ).subscribe((response: any) => {
        var tieneDiferencias = (response.listaDiferencia.filter(f => f.esDiferente == true).length > 0);
        if (tieneDiferencias === true) {
          this.handleValidarPlaza(form, response);
        }
        else {
          const { idAdjudicacion, codigoAdjudicacion, idEtapaProceso, idCalificacion, idDesarrolloProceso, idPostulacion } = this.data;
          const data = {
            idAdjudicacion: idAdjudicacion,
            codigoAdjudicacion: codigoAdjudicacion,
            idEtapaProceso: idEtapaProceso,
            idCalificacion: idCalificacion,
            idDesarrolloProceso: idDesarrolloProceso,
            idPostulacion: idPostulacion,
            idPlaza: form.idPlaza,
            idPlazaRotacionDetalle: form.idPlazaRotacionDetalle,
            vigenciaInicioContrato: form.fechaInicioVigencia,
          }

          this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA ADJUDICAR LA PLAZA?", () => {
            this.workingAgregar = true;
            this.dataService.Spinner().show('sp6');
            this.dataService
              .Rotacion()
              .adjudicar(data)
              .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingAgregar = false; })
              ).subscribe((response: any) => {
                if (response) {
                  // this.dataService.Message().msgSuccess('Operación realizada de manera existosa ', () => { });
                  this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                    this.matDialogRef.close({ registrado: true });
                  });

                } else {
                  this.dataService.Message().msgWarning('"ERROR AL PROCESAR LA OPERACIÓN"', () => { });
                }
              });
          }, () => { });
        }
      });
  }

  handleValidarPlaza = (row, response) => {
    this.dialogRef = this.materialDialog.open(
      ActualizarDatosPlazaComponent,
      {
        panelClass: 'minedu-actualizar-datos-plaza',
        width: '1100px',
        disableClose: true,
        data: {
          idAdjudicacion: row.idAdjudicacion,
          idEtapaProceso: this.data.idEtapaProceso,
          idCalificacion: row.idCalificacion,
          idPlaza: row.idPlaza,
          response: response
        },
      }
    );

    this.dialogRef.afterClosed().subscribe((response) => {
      if (!response) {
        return;
      }

      this.handleBuscar();
    });
  }

  private configCatch(e: any) {
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if (isArray(e.messages)) {
      if ((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD") != -1)
        this.dataService.Util().msgError(e.messages[0], () => { });
      else
        this.dataService.Util().msgWarning(e.messages[0], () => { });

    } else {
      this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e)
  }
}