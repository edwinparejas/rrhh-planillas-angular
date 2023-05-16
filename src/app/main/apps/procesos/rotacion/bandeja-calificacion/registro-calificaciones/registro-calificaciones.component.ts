import { SelectionModel } from '@angular/cdk/collections';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SharedService } from 'app/core/shared/shared.service';
import { isArray } from 'lodash';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MENSAJES } from '../../_utils/constants';
import { EstudiosCapacitacion } from './models/estudios-capacitacion.model';
import { ExperienciaLaboral } from './models/experiencia-laboral.model';
import { RequisitoGeneral } from './models/requisitos-generales.model';
import { UnidadFamiliar } from './models/unidad-familiar.model';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'minedu-registro-calificaciones',
  templateUrl: './registro-calificaciones.component.html',
  styleUrls: ['./registro-calificaciones.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class RegistroCalificacionesComponent implements OnInit {

  form: FormGroup;
  working: boolean = false;

  puntajeTotalUnidadFamiliar: number = 0;
  puntajeTotalExperienciaLaboral: number = 0;
  puntajeTotalEstudiosCapacitacion: number = 0;
  selectedTabIndex: number = 0;
  esRegistrarInformacion: boolean = true;
  esEditarInformacion: boolean = false;
  esDesabilitado: boolean = false;
  tituloModal: string = "Registrar calificaciones";
  buttonClose: string = "CERRAR";
  idCalificacionDetalle: number = 0;

  _TIPO_MODAL_REGISTRAR = 1;
  _TIPO_MODAL_EDITAR = 2;
  _TIPO_MODAL_VERINFO = 3;

  spublico = null;
  plaza = null;
  centroTrabajo = null;
  postulacion = null;

  dialogRef: any;
  //data: any;
  paramIdProceso: any;
  paramIdDesarrolloProceso: any;

  /*
    *-------------------------------------------------------------------------------------------------------------
    * VARIABLES REQUISITOS GENERALES
    *-------------------------------------------------------------------------------------------------------------
    */
  displayedRequisitosGenerales: string[] = [
    'numero',
    'requisitosGenerales',
    'cumple',
  ];
  selectionRequisitosGenerales = new SelectionModel<any>(true, []);

  /*
    *-------------------------------------------------------------------------------------------------------------
    * VARIABLES EXPERIENCIA LABORAL
    *-------------------------------------------------------------------------------------------------------------
    */
  displayedExperienciaLaboral: string[] = [
    'numero',
    'requisitosGenerales',
    'puntajeMaximo',
    'criterioPuntuacion',
    'acreditaDocumento',
    'cantidadCertificados',
    'puntaje',
  ];

  selectionExperienciaLaboral = new SelectionModel<any>(false, []);

  /*
  *-------------------------------------------------------------------------------------------------------------
  * VARIABLES UNIDAD FAMILIAR
  *-------------------------------------------------------------------------------------------------------------
  */
  displayedUnidadFamiliar: string[] = [
    'numero',
    'requisitosGenerales',
    'puntajeMaximo',
    'acreditaDocumento',
    'puntaje',
  ];

  selectionUnidadFamiliar = new SelectionModel<any>(true, []);
  /*
  *-------------------------------------------------------------------------------------------------------------
  * VARIABLES ESTUDIOS Y CAPACITACIONES
  *-------------------------------------------------------------------------------------------------------------
  */
  displayedEstudiosCapacitaciones: string[] = [
    'numero',
    'requisitosGenerales',
    'puntajeMaximo',
    'criterioPuntuacion',
    'acreditaDocumento',
    'cantidadCertificados',
    'puntaje',
  ];

  selectionEstudiosCapacitaciones = new SelectionModel<any>(true, []);

  constructor(
    // public matDialogRef: MatDialogRef<RegistroCalificacionesComponent>,
    // @Inject(MAT_DIALOG_DATA) private data: any,
    // private materialDialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    public globals: GlobalsService,
    private sharedService: SharedService
  ) {
  }

  ngOnInit(): void {    
    setTimeout((_) => {
      //const { tipoModal } = this.data;
      var tipoModal  = +this.route.snapshot.params.idTipoModal;
      this.paramIdProceso  = +this.route.snapshot.params.paramIdProceso;
      this.paramIdDesarrolloProceso  = +this.route.snapshot.params.paramIdDesarrolloProceso;

      if (tipoModal == this._TIPO_MODAL_VERINFO) {
        this.tituloModal = "Ver calificaciones";
        this.buttonClose = "RETORNAR";
        this.esRegistrarInformacion = false;
        this.esDesabilitado = true;
        // this.idCalificacionDetalle = this.data.idCalificacionDetalle;
        this.idCalificacionDetalle = +this.route.snapshot.params.idCalificacionDetalle;
      } else if (tipoModal == this._TIPO_MODAL_EDITAR) {
        this.tituloModal = "Editar calificaciones";
        this.esRegistrarInformacion = false;
        this.esEditarInformacion = true;
        //this.idCalificacionDetalle = this.data.idCalificacionDetalle;
        this.idCalificacionDetalle = +this.route.snapshot.params.idCalificacionDetalle;
      }

      this.GetPustulacion();
      this.buildGrid();
    });
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      requisitosGenerales: this.formBuilder.array([], Validators.compose([])),
      experienciasLaborales: this.formBuilder.array([], Validators.compose([])),
      unidadesFamiliares: this.formBuilder.array([], Validators.compose([])),
      estudiosCapacitaciones: this.formBuilder.array([], Validators.compose([])),
      anotacionesRequisitosGenerales: [null],
      anotacionesExperienciaLaboral: [null],
      anotacionesUnidadFamiliar: [null],
      anotacionesEstudiosCapacitacion: [null],
    });

    if (this.esDesabilitado) {
      this.form.get('anotacionesRequisitosGenerales').disable();
      this.form.get('anotacionesVerificarImpedimentos').disable();
      this.form.get('anotacionesEvaluacionExpediente').disable();
    }
  }

  get requisitosGenerales(): FormArray {
    return this.form.get('requisitosGenerales') as FormArray;
  }

  get experienciasLaborales(): FormArray {

    return this.form.get('experienciasLaborales') as FormArray;
  }

  get unidadesFamiliares(): FormArray {
    return this.form.get('unidadesFamiliares') as FormArray;
  }

  get estudiosCapacitaciones(): FormArray {
    return this.form.get('estudiosCapacitaciones') as FormArray;
  }


  private recalcularExperienciaLaboral = () => {
    let calculado: number = 0;
    let calculadoP3: number = 0;
    let calculadoP3Maximo: number = 0;
    let valorMaximoCodPadre: number = 0;
    this.experienciasLaborales.controls.forEach(formControl => {
      const codigoPadre = formControl.get("codigoCriterio").value;
      const puntaje = formControl.get("puntaje").value;
      let codPadreHijo = "";

      if(codigoPadre == "P3"){
        valorMaximoCodPadre = formControl.get("puntajeMaximo").value;
      }else{
        codPadreHijo = codigoPadre.substring(0, 2);
      }
      
      if(codPadreHijo== "P3"){
        calculadoP3 += parseFloat(puntaje ?? 0)
      }

      calculado += parseFloat(puntaje ?? 0);
    });
    calculadoP3Maximo = (calculadoP3 - valorMaximoCodPadre)
    this.puntajeTotalExperienciaLaboral = calculado - ((calculadoP3Maximo > 0)? calculadoP3Maximo : 0);
  }

  private recalcularUnidadFamiliar = () => {
    let calculado: number = 0;
    this.unidadesFamiliares.controls.forEach(formControl => {
      const puntaje = formControl.get("puntaje").value;
      calculado += parseFloat(puntaje ?? 0);
    });
    this.puntajeTotalUnidadFamiliar = calculado;

  }

  private recalcularCapacitaciones = () => {
    let calculado: number = 0;
    this.estudiosCapacitaciones.controls.forEach(formControl => {
      const puntaje = formControl.get("puntaje").value;
      calculado += parseFloat(puntaje ?? 0);
    });
    this.puntajeTotalEstudiosCapacitacion = calculado;
  }

  private GetPustulacion = () => {    
    //const { idPostulacion, idEtapaProceso } = this.data;
    var idPostulacion = +this.route.snapshot.params.idPostulacion;
    var idEtapaProceso = +this.route.snapshot.params.idEtapaProceso;
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Rotacion()
      .getPostulacionDestino(idPostulacion, idEtapaProceso)
      .pipe(
        catchError((e) => { return this.configCatch(e); }),
        finalize(() => { this.dataService.Spinner().hide('sp6'); })
      ).subscribe((response: any) => {
        if (response) {
          const { postulacion, servidorPublico, plaza } = response;
          this.postulacion = postulacion;
          this.spublico = servidorPublico;
          this.plaza = plaza;
        } else {
          this.dataService.Message().msgWarning('Error al procesar la operación ', () => { });
        }
      });
  }

  onTabChanged = (event: MatTabChangeEvent) => {
    if (event.index > 0) {
      const form = this.form.getRawValue();
      const requisitosGenerales: any[] = form.requisitosGenerales;
      let cumple = true;
      requisitosGenerales.forEach(item => {
        if (!item.acreditaDocumento) {
          cumple = false;
        }
      });
      if (!cumple) {
        this.selectedTabIndex = 0;
        this.dataService.Message().msgWarning('EL SERVIDOR PÚBLICO NO CUMPLE CON LOS REQUISITOS GENERALES, NO SE PODRÁ EVALUAR OTROS CRITERIOS ', () => { });
      }
    }
  }

  private buildGrid() {
    this.dataService.Spinner().show('sp6');
    forkJoin([
      this.dataService.Rotacion().getRequesitosGeneralesGrid(this.idCalificacionDetalle),
      this.dataService.Rotacion().getExperienciaLaboralGrid(this.idCalificacionDetalle),
      this.dataService.Rotacion().getUnidadFamiliarGrid(this.idCalificacionDetalle),
      this.dataService.Rotacion().getEstudiosCapacitacionGrid(this.idCalificacionDetalle)
    ]).pipe(
      catchError((e) => { return this.configCatch(e); }),
      finalize(() => {
        this.dataService.Spinner().hide('sp6');
      })
    ).subscribe((response: any) => {
      if (response && response.length > 0) {
        const requisitosGenerales = response[0];
        if (requisitosGenerales) {
          if (requisitosGenerales.length == 0) {
            this.gridResultMessage();
          } else {
            const fgs = requisitosGenerales.map(RequisitoGeneral.asFormGroup);
            //Si trae resultados, marcar los registros
            if (this.idCalificacionDetalle > 0) {
              fgs.forEach(control => {
                var idMaestroCriterioCalificacion = control.get('idMaestroCriterioCalificacion').value;
                var idMaestroRubroCalificacion = control.get('idMaestroRubroCalificacion').value;
                var result = requisitosGenerales.filter(f =>
                  f.idMaestroCriterioCalificacion == idMaestroCriterioCalificacion &&
                  f.idMaestroRubroCalificacion == idMaestroRubroCalificacion)
                if (result.length > 0) {
                  var item = result[0];
                  if (item.anotacionesCalificacion != null) {
                    this.form.get('anotacionesRequisitosGenerales').setValue(item.anotacionesCalificacion);
                  }
                  control.get('acreditaDocumento').setValue(item.cumpleDocumento);
                  if (item.cumpleDocumento == true) {
                    this.selectionRequisitosGenerales.toggle(control);
                  }
                }
              });
            }
            this.form.setControl('requisitosGenerales', new FormArray(fgs));
          }
        } else {
          this.gridResultMessage(false);
        }

        const experienciasProfesionales = response[1];
        if (experienciasProfesionales) {
          if (experienciasProfesionales.length == 0) {
            this.gridResultMessage();
          } else {
            const fgs = experienciasProfesionales.map(ExperienciaLaboral.asFormGroup);
            //Si trae resultados, marcar los registros
            if (this.idCalificacionDetalle > 0) {
              fgs.forEach(control => {
                var idMaestroCriterioCalificacion = control.get('idMaestroCriterioCalificacion').value;
                var idMaestroRubroCalificacion = control.get('idMaestroRubroCalificacion').value;

                var result = experienciasProfesionales.filter(f =>
                  f.idMaestroCriterioCalificacion == idMaestroCriterioCalificacion &&
                  f.idMaestroRubroCalificacion == idMaestroRubroCalificacion)
                if (result.length > 0) {
                  var item = result[0];

                  var criterioPuntuacionUnidadFam = false;
                  if (item.puntajeObtenido > 0) {
                    criterioPuntuacionUnidadFam = true;
                    control.get('puntaje').setValue(item.puntajeObtenido);
                  }

                  control.get('acreditaDocumento').setValue(item.cumpleDocumento);
                  control.get('acreditaDocumentoSeleccionado').setValue(item.cumpleDocumento);
                  control.get('criterioPuntuacion').setValue(criterioPuntuacionUnidadFam);
                  control.get('criterioPuntuacionSeleccionado').setValue(criterioPuntuacionUnidadFam);
                  control.get('cantidadCertificados').setValue(item.cantidad);

                  if (item.anotacionesCalificacion != null) {
                    this.form.get('anotacionesExperienciaLaboral').setValue(item.anotacionesCalificacion);
                  }

                  if (item.cumpleDocumento == true) {
                    this.selectionExperienciaLaboral.toggle(control);
                  }
                }
              });
            }
            this.form.setControl('experienciasLaborales', new FormArray(fgs));
            this.recalcularExperienciaLaboral();
          }
        } else {
          this.gridResultMessage(false);
        }

        const unidadFamiliar = response[2];
        if (unidadFamiliar) {
          if (unidadFamiliar.length == 0) {
            this.gridResultMessage();
          } else {
            const fgs = unidadFamiliar.map(UnidadFamiliar.asFormGroup);

            //Si trae resultados, marcar los registros
            if (this.idCalificacionDetalle > 0) {
              fgs.forEach(control => {
                var idMaestroCriterioCalificacion = control.get('idMaestroCriterioCalificacion').value;
                var idMaestroRubroCalificacion = control.get('idMaestroRubroCalificacion').value;

                var result = unidadFamiliar.filter(f =>
                  f.idMaestroCriterioCalificacion == idMaestroCriterioCalificacion &&
                  f.idMaestroRubroCalificacion == idMaestroRubroCalificacion)
                if (result.length > 0) {
                  var item = result[0];

                  var criterioPuntuacionUnidadFam = false;
                  if (item.puntajeObtenido > 0) {
                    criterioPuntuacionUnidadFam = true;
                    control.get('puntaje').setValue(item.puntajeObtenido);
                  }

                  control.get('acreditaDocumento').setValue(criterioPuntuacionUnidadFam);
                  control.get('acreditaDocumentoSeleccionado').setValue(criterioPuntuacionUnidadFam);

                  if (item.anotacionesCalificacion != null) {
                    this.form.get('anotacionesUnidadFamiliar').setValue(item.anotacionesCalificacion);
                  }

                  if (item.cumpleDocumento == true) {
                    this.selectionEstudiosCapacitaciones.toggle(control);
                  }
                }
              });
            }
            this.form.setControl('unidadesFamiliares', new FormArray(fgs));
            this.recalcularUnidadFamiliar();
          }
        } else {
          this.gridResultMessage(false);
        }
        const capacitaciones = response[3];
        if (capacitaciones) {
          if (capacitaciones.length == 0) {
            this.gridResultMessage();
          } else {
            const fgs = capacitaciones.map(EstudiosCapacitacion.asFormGroup);
            //Si trae resultados, marcar los registros
            if (this.idCalificacionDetalle > 0) {
              fgs.forEach(control => {
                var idMaestroCriterioCalificacion = control.get('idMaestroCriterioCalificacion').value;
                var idMaestroRubroCalificacion = control.get('idMaestroRubroCalificacion').value;

                var result = capacitaciones.filter(f =>
                  f.idMaestroCriterioCalificacion == idMaestroCriterioCalificacion &&
                  f.idMaestroRubroCalificacion == idMaestroRubroCalificacion)
                if (result.length > 0) {
                  var item = result[0];

                  control.get('acreditaDocumento').setValue(item.cumpleDocumento);
                  control.get('acreditaDocumentoSeleccionado').setValue(item.cumpleDocumento);
                  control.get('cantidadCertificados').setValue(item.cantidad);

                  if (item.anotacionesCalificacion != null) {
                    this.form.get('anotacionesEstudiosCapacitacion').setValue(item.anotacionesCalificacion);
                  }

                  if (item.cumpleDocumento == true) {
                    this.selectionEstudiosCapacitaciones.toggle(control);
                  }
                }
              });
            }
            this.form.setControl('estudiosCapacitaciones', new FormArray(fgs));
            this.recalcularCapacitaciones();
          }
        } else {
          this.gridResultMessage(false);
        }
      }
    });
  }

  handleRetornar = () => {
    
    this.router.navigate(
        ["../../../../../../../../calificacion/" + this.paramIdProceso+'/'+ this.paramIdDesarrolloProceso],{ relativeTo: this.route }
    );    
  };

  /*
  *-------------------------------------------------------------------------------------------------------------
  * OPERACIONES REQUISITOS GENERALES
  *-------------------------------------------------------------------------------------------------------------
  */
  handleAcreditaDocumentoRequisitosGenerales = (event, requisitoGeneral: FormGroup) => {
    if (this.esDesabilitado == true) {
      return;
    }
    this.selectionRequisitosGenerales.toggle(requisitoGeneral);
    const cumple = requisitoGeneral.get("acreditaDocumento").value;
    const acreditaDocumentoSeleccionado = requisitoGeneral.get('acreditaDocumentoSeleccionado');
    const acreditaDocumento = requisitoGeneral.get("acreditaDocumento");
    // acreditaDocumento.setValue(!cumple);
    // acreditaDocumentoSeleccionado.setValue(!cumple);
  }

  /*
  *-------------------------------------------------------------------------------------------------------------
  * OPERACIONES EXPERIENCIA LABORAL
  *-------------------------------------------------------------------------------------------------------------
  */
  handleCriterioPuntuacionExperienciaLaboral = (event, experienciaLaboral: FormGroup) => {
    if (this.esDesabilitado == true) {
      return;
    }
    const idMaestroCriterioCalificacionPadre = experienciaLaboral.get('idMaestroCriterioCalificacionPadre').value;
    const idMaestroCriterioCalificacion = experienciaLaboral.get('idMaestroCriterioCalificacion').value;

    this.experienciasLaborales.controls.forEach(formControl => {
      const idMaestroCriterioCalificacionPadreControl = formControl.get('idMaestroCriterioCalificacionPadre').value;
      const idMaestroCriterioCalificacionControl = formControl.get('idMaestroCriterioCalificacion').value;
      if (idMaestroCriterioCalificacionPadreControl === idMaestroCriterioCalificacionPadre &&
        idMaestroCriterioCalificacionControl !== idMaestroCriterioCalificacion) {
        const puntajeControl = formControl.get('puntaje');
        puntajeControl.setValue(null);
        const criterioPuntuacionSeleccionadoControl = formControl.get('criterioPuntuacionSeleccionado');
        criterioPuntuacionSeleccionadoControl.setValue(false);
        const criterioPuntuacion = formControl.get("criterioPuntuacion");
        criterioPuntuacion.setValue(false);
      }
    });

    const puntaje = experienciaLaboral.get('puntaje');
    const acreditaDocumentoSeleccionado = experienciaLaboral.get('acreditaDocumentoSeleccionado');
    const puntajeMaximo = experienciaLaboral.get('puntajeMaximo').value;
    const acreditaDocumento = experienciaLaboral.get("acreditaDocumento");
    acreditaDocumento.setValue(true);
    puntaje.setValue(puntajeMaximo);
    acreditaDocumentoSeleccionado.setValue(true);
    this.recalcularExperienciaLaboral();
  }


  // handleAcreditaDocumento = (event, experienciaLaboral: FormGroup) => {

  //   const idMaestroCriterioCalificacionPadre = experienciaLaboral.get('idMaestroCriterioCalificacionPadre').value;
  //   const idMaestroCriterioCalificacion = experienciaLaboral.get('idMaestroCriterioCalificacion').value;

  //   this.experienciasLaborales.controls.forEach(formControl => {
  //     const idMaestroCriterioCalificacionPadreControl = formControl.get('idMaestroCriterioCalificacionPadre').value;
  //     const idMaestroCriterioCalificacionControl = formControl.get('idMaestroCriterioCalificacion').value;
  //     if (idMaestroCriterioCalificacionPadreControl === idMaestroCriterioCalificacionPadre &&
  //       idMaestroCriterioCalificacionControl !== idMaestroCriterioCalificacion) {
  //       const puntajeControl = formControl.get('puntaje');
  //       puntajeControl.setValue(null);
  //       const acreditaDocumentoSeleccionadoControl = formControl.get('acreditaDocumentoSeleccionado');
  //       acreditaDocumentoSeleccionadoControl.setValue(false);
  //       const acreditaDocumentoControl = formControl.get("acreditaDocumento");
  //       acreditaDocumentoControl.setValue(false);
  //     }
  //   });

  //   const puntaje = experienciaLaboral.get('puntaje');
  //   const acreditaDocumentoSeleccionado = experienciaLaboral.get('acreditaDocumentoSeleccionado');
  //   const puntajeMaximo = experienciaLaboral.get('puntajeMaximo').value;
  //   const acreditaDocumento = experienciaLaboral.get("acreditaDocumento");
  //   acreditaDocumento.setValue(true);
  //   puntaje.setValue(puntajeMaximo);
  //   acreditaDocumentoSeleccionado.setValue(true);
  //   this.recalcularExperienciaLaboral();
  // }

  handleRecalcularExperienciasLaborales = (event, formControl: FormGroup) => {
    event.stopPropagation();
    this.recalcularExperienciaLaboral();
  }

  handleRecalcularExperienciasLaboralesInput = (event, formControl: FormGroup) => {
    if (this.esDesabilitado == true) {
      return;
    }
    this.selectionEstudiosCapacitaciones.toggle(formControl);
    const tieneSubCriterio = formControl.get("tieneSubCriterio").value;
    const tienePadre = formControl.get("tienePadre").value;
    const esSeleccionExcluyente = formControl.get("esSeleccionExcluyente").value;
    const puntajeMaximo = formControl.get('puntajeMaximo').value;

    if (!tieneSubCriterio && !tienePadre && !esSeleccionExcluyente) {
      if (formControl.get('acreditaDocumentoSeleccionado').value == false) {
        formControl.get('acreditaDocumentoSeleccionado').setValue(true);
        formControl.get('acreditaDocumento').setValue(true);
      } 
    } 

    const cantidadCertificados = formControl.get("cantidadCertificados").value;
    if (cantidadCertificados == "") {
        formControl.get('acreditaDocumentoSeleccionado').setValue(false);
        formControl.get('acreditaDocumento').setValue(false);
        formControl.get('puntaje').setValue(null);
    }
    
    event.stopPropagation();
    this.recalcularExperienciaLaboral();
  }
  /*
    *-------------------------------------------------------------------------------------------------------------
    * OPERACIONES UNIDAD FAMILIAR
    *-------------------------------------------------------------------------------------------------------------
    */

  handleAcreditaDocumentoUnidadFamiliar = (event, unidadFamiliar: FormGroup) => {
    if (this.esDesabilitado == true) {
      return;
    }
    const idMaestroCriterioCalificacionPadre = unidadFamiliar.get('idMaestroCriterioCalificacionPadre').value;
    const idMaestroCriterioCalificacion = unidadFamiliar.get('idMaestroCriterioCalificacion').value;

    this.unidadesFamiliares.controls.forEach(formControl => {
      const idMaestroCriterioCalificacionPadreControl = formControl.get('idMaestroCriterioCalificacionPadre').value;
      const idMaestroCriterioCalificacionControl = formControl.get('idMaestroCriterioCalificacion').value;
      if (idMaestroCriterioCalificacionPadreControl === idMaestroCriterioCalificacionPadre &&
        idMaestroCriterioCalificacionControl !== idMaestroCriterioCalificacion) {
        const puntajeControl = formControl.get('puntaje');
        puntajeControl.setValue(null);
        const acreditaDocumentoSeleccionadoControl = formControl.get('acreditaDocumentoSeleccionado');
        acreditaDocumentoSeleccionadoControl.setValue(false);
        const acreditaDocumentoControl = formControl.get("acreditaDocumento");
        acreditaDocumentoControl.setValue(false);
      }
    });

    const puntaje = unidadFamiliar.get('puntaje');
    const acreditaDocumentoSeleccionado = unidadFamiliar.get('acreditaDocumentoSeleccionado');
    const puntajeMaximo = unidadFamiliar.get('puntajeMaximo').value;
    const acreditaDocumento = unidadFamiliar.get("acreditaDocumento");
    acreditaDocumento.setValue(true);
    puntaje.setValue(puntajeMaximo);
    acreditaDocumentoSeleccionado.setValue(true);
    this.recalcularUnidadFamiliar();
  }

  handleRecalcularUnidadFamiliar = (event, formControl: FormGroup) => {
    this.selectionUnidadFamiliar.toggle(formControl);
    const tieneSubCriterio = formControl.get("tieneSubCriterio").value;
    const tienePadre = formControl.get("tienePadre").value;
    const esSeleccionExcluyente = formControl.get("esSeleccionExcluyente").value;
    if (!tieneSubCriterio && !tienePadre && !esSeleccionExcluyente) {
      const cumple = formControl.get("acreditaDocumento").value;
      const acreditaDocumentoSeleccionado = formControl.get('acreditaDocumentoSeleccionado');
      const acreditaDocumento = formControl.get("acreditaDocumento");
      acreditaDocumento.setValue(!cumple);
      acreditaDocumentoSeleccionado.setValue(!cumple);
    }
    event.stopPropagation();
    this.recalcularUnidadFamiliar();
  }

  handleRecalcularUnidadFamiliarInput = (event, formControl: FormGroup) => {
    if (this.esDesabilitado == true) {
      return;
    }

    this.selectionUnidadFamiliar.toggle(formControl);
    const tieneSubCriterio = formControl.get("tieneSubCriterio").value;
    const tienePadre = formControl.get("tienePadre").value;
    const esSeleccionExcluyente = formControl.get("esSeleccionExcluyente").value;
    const puntajeMaximo = formControl.get('puntajeMaximo').value;

    if (!tieneSubCriterio && !tienePadre && !esSeleccionExcluyente) {
      if (formControl.get('acreditaDocumentoSeleccionado').value == false) {
        formControl.get('acreditaDocumentoSeleccionado').setValue(true);
        formControl.get('acreditaDocumento').setValue(true);
        formControl.get('puntaje').setValue(puntajeMaximo);
        this.selectionUnidadFamiliar.toggle(formControl);
      } else {
        formControl.get('acreditaDocumentoSeleccionado').setValue(false);
        formControl.get('acreditaDocumento').setValue(false);
        formControl.get('puntaje').setValue(null);
        this.selectionUnidadFamiliar.toggle(formControl);
      }
    }

    event.stopPropagation();
    this.recalcularUnidadFamiliar();
  }

  /*
    *-------------------------------------------------------------------------------------------------------------
    * OPERACIONES ESTUDIOS CAPACITACIONES
    *-------------------------------------------------------------------------------------------------------------
    */

  handleRecalcularEstudiosCapacitacion = (event, formControl: FormGroup) => {
    this.selectionEstudiosCapacitaciones.toggle(formControl);
    const tieneSubCriterio = formControl.get("tieneSubCriterio").value;
    const tienePadre = formControl.get("tienePadre").value;
    const esSeleccionExcluyente = formControl.get("esSeleccionExcluyente").value;

    if (!tieneSubCriterio && !tienePadre && !esSeleccionExcluyente) {
      const cumple = formControl.get("acreditaDocumento").value;
      const acreditaDocumentoSeleccionado = formControl.get('acreditaDocumentoSeleccionado');
      const acreditaDocumento = formControl.get("acreditaDocumento");
      acreditaDocumento.setValue(!cumple);
      acreditaDocumentoSeleccionado.setValue(!cumple);
    }
    event.stopPropagation();
    this.recalcularCapacitaciones();
  }

  handleRecalcularEstudiosCapacitacionInput = (event, formControlEstudiosCapacitacion: FormGroup, listaControles = null) => {
    if (this.esDesabilitado == true && listaControles == null) {
      return false;
    }

    this.selectionEstudiosCapacitaciones.toggle(formControlEstudiosCapacitacion);
    const tieneSubCriterio = formControlEstudiosCapacitacion.get("tieneSubCriterio").value;
    const tienePadre = formControlEstudiosCapacitacion.get("tienePadre").value;
    const esSeleccionExcluyente = formControlEstudiosCapacitacion.get("esSeleccionExcluyente").value;

    if (!tieneSubCriterio && !tienePadre && !esSeleccionExcluyente) {
      if (formControlEstudiosCapacitacion.get('acreditaDocumentoSeleccionado').value == false) {
        formControlEstudiosCapacitacion.get('acreditaDocumentoSeleccionado').setValue(true);
        formControlEstudiosCapacitacion.get('acreditaDocumento').setValue(true);
      }
    }

    const cantidadCertificados = formControlEstudiosCapacitacion.get("cantidadCertificados").value;
    if (cantidadCertificados == "") {
      formControlEstudiosCapacitacion.get('acreditaDocumentoSeleccionado').setValue(false);
      formControlEstudiosCapacitacion.get('acreditaDocumento').setValue(false);
      formControlEstudiosCapacitacion.get('puntaje').setValue(null);
    }

    event.stopPropagation();
    this.recalcularCapacitaciones();
  }


  private gridResultMessage = (emptyResult: boolean = true) => {
    if (emptyResult) {
      this.dataService.Message().msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_RESULTADO, () => {
      });
    } else {
      this.dataService.Message().msgWarning('Ocurrieron problemas para los criterios de búsqueda ingresados.', () => { });
    }
  }


  handleRegistrar = () => {
    //const { idPostulacion, idEtapaProceso, idCalificacion, idCalificacionDetalle } = this.data;
    var idPostulacion = +this.route.snapshot.params.idPostulacion;
    var idEtapaProceso = +this.route.snapshot.params.idEtapaProceso;
    var idCalificacion = +this.route.snapshot.params.idCalificacion;
    var idCalificacionDetalle = +this.route.snapshot.params.idCalificacionDetalle;
    
    const form = this.form.getRawValue();
    const estudiosCapacitaciones: any[] = form.estudiosCapacitaciones;
    const experienciasLaborales: any[] = form.experienciasLaborales;
    const unidadesFamiliares: any[] = form.unidadesFamiliares;
    const requisitosGenerales: any[] = form.requisitosGenerales;
    const passport = this.dataService.Storage().getInformacionUsuario();

    var models: any[] = [];
    estudiosCapacitaciones.forEach(item => {
      models.push({
        idMaestroCriterioCalificacion: item.idMaestroCriterioCalificacion,
        idMaestroRubroCalificacion: item.idMaestroRubroCalificacion,
        anotaciones: form.anotacionesEstudiosCapacitacion,
        cantidad: parseInt(item.cantidadCertificados ?? 0),
        cumpleDocumento: item.acreditaDocumento ?? false,
        puntajeObtenido: parseInt(item.puntaje ?? 0),
      });
    });
    experienciasLaborales.forEach(item => {
      models.push({
        idMaestroCriterioCalificacion: item.idMaestroCriterioCalificacion,
        idMaestroRubroCalificacion: item.idMaestroRubroCalificacion,
        anotaciones: form.anotacionesExperienciaLaboral,
        cantidad: parseInt(item.cantidadCertificados ?? 0),
        cumpleDocumento: item.acreditaDocumento ?? false,
        puntajeObtenido: parseInt(item.puntaje ?? 0),
      });
    });
    unidadesFamiliares.forEach(item => {
      models.push({
        idMaestroCriterioCalificacion: item.idMaestroCriterioCalificacion,
        idMaestroRubroCalificacion: item.idMaestroRubroCalificacion,
        anotaciones: form.anotacionesUnidadFamiliar,
        cantidad: 0,
        cumpleDocumento: item.acreditaDocumento ?? false,
        puntajeObtenido: parseInt(item.puntaje ?? 0),
      });
    });
    requisitosGenerales.forEach(item => {
      models.push({
        idMaestroCriterioCalificacion: item.idMaestroCriterioCalificacion,
        idMaestroRubroCalificacion: item.idMaestroRubroCalificacion,
        anotaciones: form.anotacionesRequisitosGenerales,
        cantidad: 0,
        cumpleDocumento: item.acreditaDocumento ?? false,
        puntajeObtenido: parseInt(item.puntaje ?? 0),
      });
    });

    const model = {
      calificaciones: models,
      usuarioCreacion: passport.numeroDocumento,
      idPostulacion: idPostulacion,
      idEtapaProceso: idEtapaProceso,
      idCalificacion: idCalificacion,
      idCalificacionDetalle: idCalificacionDetalle,
      codigoRolPassport: this.dataService.Storage().getPassportRolSelected().CODIGO_ROL
    };

    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA GUARDAR LOS CAMBIOS?', () => {

      this.working = true;
      this.dataService.Spinner().show('sp6');
      this.dataService
        .Rotacion()
        .crearCalificacion(model)
        .pipe(
          catchError((e) => { return this.configCatch(e); }),
          finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
        ).subscribe((response: any) => {
          if (response) {
            this.dataService.Message().msgAutoCloseSuccessNoButton('OPERACIÓN REALIZADA DE FORMA EXITOSA.', 3000, () => { 
              //this.matDialogRef.close({ registrado: true });
              this.handleRetornar();
            });
          }
        });
    }, () => { });

  };
  configCatch(e: any) {
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if (isArray(e.messages)) {
      if ((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD") != -1)
        this.dataService.Util().msgError(e.messages[0], () => { });
      else
        this.dataService.Util().msgWarning(e.messages[0], () => { });

    } else {
      this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e)
  }
}