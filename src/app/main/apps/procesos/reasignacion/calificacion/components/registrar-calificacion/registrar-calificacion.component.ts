import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { TipoOperacionEnum } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { isArray } from 'lodash';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MENSAJES } from '../../../_utils/constants';
import { RequisitoGeneral } from './models/requisitos-generales.model';
import { Impedimento } from './models/verificar-impedimentos.model';
import { EvaluacionExpediente } from './models/evaluacion-expediente.model';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'minedu-registrar-calificacion',
  templateUrl: './registrar-calificacion.component.html',
  styleUrls: ['./registrar-calificacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class RegistrarCalificacionComponent implements OnInit {

  form: FormGroup;
  working: boolean = false;
  puntajeTotalEvaluacionExpediente: number = 0;
  selectedTabIndex: number = 0;
  tipoOperacion = TipoOperacionEnum;
  dialogTitle: string;
  spublico = null;
  plaza = null;
  centroTrabajo = null;
  postulacion = null;
  dataModal: any;
  dialogRef: any;
  calificacionesResultados: any = [];
  esDesabilitado = false;
  idCalificacion: number;
  idCalificacionDetalle: number;
  idOperacion: number;
  data: any;
  calificacion = null;

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
    * VARIABLES IMPEDIMENTOS
    *-------------------------------------------------------------------------------------------------------------
    */
    displayedVerificarImpedimentos: string[] = [
        'numero',
        'verificacionImpedimentos',
        'cumple',
      ];
      selectionVerificarImpedimentos = new SelectionModel<any>(true, []);

    /*
    *-------------------------------------------------------------------------------------------------------------
    * VARIABLES EVALUACIÓN DE EXPEDIENTE
    *-------------------------------------------------------------------------------------------------------------
    */
    displayedEvaluacionExpediente: string[] = [
        'numero',
        'criterioEvaluacion',
        'puntajeMaximo',
        'puntajeUnidad',
        'acreditaDocumento',
        'cantidadCertificados',
        'puntaje',
    ];

    selectionEvaluacionExpediente = new SelectionModel<any>(true, []);


  constructor(
    // public matDialogRef: MatDialogRef<RegistroCalificacionesComponent>,
    // @Inject(MAT_DIALOG_DATA) private data: any,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    public globals: GlobalsService,
    private sharedService: SharedService
  ) {
    // this.dataModal = this.data;
  }

  ngOnInit(): void {

    // this.idCalificacion = +this.route.snapshot.params.id;
    // this.idOperacion = +this.route.snapshot.params.id1;
    // this.loadCalificacion();
    // setTimeout((_) => {
    //   this.buildGrid();
    // });
    // this.buildForm();
    // this.configurarDatoInicial();
    this.cargarTodo();
  }

  async cargarTodo(){
    this.idCalificacion = +this.route.snapshot.params.id;
    this.idOperacion = +this.route.snapshot.params.id1;
    this.buildForm();
    await this.loadCalificacion();
    // setTimeout((_) => {
    //   this.buildGrid();
    // });
    await this.buildGrid();
    // this.buildForm();
    this.configurarDatoInicial();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      requisitosGenerales: this.formBuilder.array([], Validators.compose([])),
      verificarImpedimentos: this.formBuilder.array([], Validators.compose([])),
      evaluacionExpediente: this.formBuilder.array([], Validators.compose([])),
      anotacionesRequisitosGenerales: [null],
      anotacionesVerificarImpedimentos: [null],
      anotacionesEvaluacionExpediente: [null],
    });
  }

  configurarDatoInicial = () => {
    if (this.idOperacion === TipoOperacionEnum.Registrar) {
        this.dialogTitle = 'Registrar calificaciones';
    } else if (this.idOperacion === TipoOperacionEnum.Modificar) {
        this.dialogTitle = 'Editar calificaciones';
        // this.GetCalificacionesResultados();
    }else if (this.idOperacion === TipoOperacionEnum.Ver) {
        this.esDesabilitado = true;
        this.dialogTitle = 'Información calificaciones';
        // this.GetCalificacionesResultados();
        this.form.get('anotacionesRequisitosGenerales').disable();
        this.form.get('anotacionesVerificarImpedimentos').disable();
        this.form.get('anotacionesEvaluacionExpediente').disable();
    }
  }
  
  get requisitosGenerales(): FormArray {
    return this.form.get('requisitosGenerales') as FormArray;
  }

  get verificarImpedimentos(): FormArray {
    return this.form.get('verificarImpedimentos') as FormArray;
  }

  get evaluacionExpediente(): FormArray {
    return this.form.get('evaluacionExpediente') as FormArray;
  }

  getTieneValorMaximo=(row)=>{
    if(row.get('puntajeMaximoUnidad').value != null){
        return true;
    }
    if(row.get('puntajeMaximo').value == null){
        return true;
    }
    return false;
  }

  getTienePadre=(row)=>{
    if(row.get('idCodigoPadre').value > 0){
        return true;
    }
    return false;
  }

  getTieneCantidad=(row)=>{
    if(row.get('puntajeMaximo').value > 0){
        return true;
    }
    return false;
  }

  private recalcularEvaluacionExpediente= (listaControles=null) => {
    let calculado: number = 0;
    if(listaControles==null || listaControles==undefined){
        listaControles = this.evaluacionExpediente.controls;
    }
    listaControles.forEach(formControl => {
      const puntaje = formControl.get("puntaje").value;
      calculado += parseFloat(puntaje ?? 0);
    });
    this.puntajeTotalEvaluacionExpediente = calculado; 
  }

  private obtenerControlPorIdCodigoPadre = (idCodigoPadre, listaControles) => {
    let control = null;
    if(listaControles==null || listaControles==undefined){
        listaControles = this.evaluacionExpediente.controls;
    }
    listaControles.forEach(formControl => {
        const idMaestroCriterioCalificacion = formControl.get('idMaestroCriterioCalificacion').value;
        if(idCodigoPadre == idMaestroCriterioCalificacion){
            control = formControl;
        }
    });
    return control;
  }

  loadCalificacion = async () => {
    const data = {
        idCalificacion: this.idCalificacion
    }
    const response = await this.dataService
        .Reasignaciones()
        .getCalificacion(data)
        .pipe(
            catchError(() => of(null)),
            finalize(() => {})
        )
        .toPromise();
        //.subscribe((response: any) => {
            if (response) {
                this.calificacion = response;
                this.GetPostulacion();
                if (this.idOperacion === TipoOperacionEnum.Modificar) {
                    this.GetCalificacionesResultados();
                }else if (this.idOperacion === TipoOperacionEnum.Ver) {
                    this.GetCalificacionesResultados();
                }
            }
       // });
   };

  private GetPostulacion = () => {
    const { idPostulacion, idEtapaProceso } = this.calificacion;
    this.dataService.Spinner().show('sp6');
    this.dataService
        .Reasignaciones()
        .getPostulacion(idPostulacion, idEtapaProceso)
        .pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => { this.dataService.Spinner().hide('sp6'); })
        ).subscribe((response: any) => {
            if (response) {
                const { postulacion, servidorPublico, plaza } = response;
                this.postulacion = postulacion;
                this.spublico = servidorPublico;
                this.plaza = plaza;
            } else {
                this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
            }
        });
  }

  private GetCalificacionesResultados = () => {
     const { idEtapaProceso,idCalificacionDetalle } = this.calificacion;
     const data = {
         idCalificacionDetalle: idCalificacionDetalle,
         idEtapaProceso: idEtapaProceso
     };
         this.dataService
         .Reasignaciones()
         .getCalificacionesResultados(data)
         .pipe(
             catchError((e) => { return  this.configCatch(e);        }),
             finalize(() => { this.dataService.Spinner().hide('sp6'); })
         ).subscribe((response: any) => {
             if (response) {
                 this.calificacionesResultados = response;
             } else {
                 this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
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
    //   if (!cumple) {
    //     this.selectedTabIndex = 0;
    //     this.dataService.Message().msgWarning('EL SERVIDOR PÚBLICO NO CUMPLE CON LOS REQUISITOS GENERALES, NO SE PODRÁ EVALUAR OTROS CRITERIOS ', () => { });
    //   }
    }
  }



  private async buildGrid() {
    let isSuccess = true;
    this.dataService.Spinner().show('sp6');
    const response = await forkJoin([
        this.dataService.Reasignaciones().getRequesitosGeneralesGrid(),
        this.dataService.Reasignaciones().getVerificarImpedimentosGrid(),
        this.dataService.Reasignaciones().getEvaluacionExpedienteGrid()
    ]).pipe(
      catchError((e) => { 
        isSuccess = false;
        return  this.configCatch(e);}),
      finalize(() => {
        this.dataService.Spinner().hide('sp6');
      })
    ).toPromise();
    // .subscribe((response: any) => {
      if (isSuccess && response && response.length > 0) {
        const requisitosGenerales = response[0];
        if (requisitosGenerales) {
          if (requisitosGenerales.length == 0) {
            this.gridResultMessage();
          } else {
            const fgs = requisitosGenerales.map(RequisitoGeneral.asFormGroup);
            //Si trae resultados, marcar los registros
            if(this.calificacionesResultados.length>0){
                fgs.forEach(control=>{
                    var idMaestroCriterioCalificacion = control.get('idMaestroCriterioCalificacion').value;
                    var idMaestroRubroCalificacion = control.get('idMaestroRubroCalificacion').value;
                     var result = this.calificacionesResultados.filter(f=>
                        f.idMaestroCriterioCalificacion==idMaestroCriterioCalificacion &&
                        f.idMaestroRubroCalificacion==idMaestroRubroCalificacion )
                    if(result.length>0){
                        var item = result[0];
                        if(item.anotaciones != null){
                            this.form.get('anotacionesRequisitosGenerales').setValue(item.anotaciones);
                        }   
                        control.get('acreditaDocumento').setValue(item.cumpleDocumento);
                        if(item.cumpleDocumento==true){
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

        const verificarImpedimentos = response[1];
        if (verificarImpedimentos) {
          if (verificarImpedimentos.length == 0) {
            this.gridResultMessage();
          } else {
            const fgs = verificarImpedimentos.map(Impedimento.asFormGroup);
                //Si trae resultados, marcar los registros
                if(this.calificacionesResultados.length>0){
                    fgs.forEach(control=>{  
                        var idMaestroCriterioCalificacion = control.get('idMaestroCriterioCalificacion').value;
                        var idMaestroRubroCalificacion = control.get('idMaestroRubroCalificacion').value;
                            var result = this.calificacionesResultados.filter(f=>
                            f.idMaestroCriterioCalificacion==idMaestroCriterioCalificacion &&
                            f.idMaestroRubroCalificacion==idMaestroRubroCalificacion )
                        if(result.length>0){
                            var item = result[0];
                            if(item.anotaciones != null){
                                this.form.get('anotacionesVerificarImpedimentos').setValue(item.anotaciones);
                            }    
                            control.get('acreditaDocumento').setValue(item.cumpleDocumento);
                            if(item.cumpleDocumento==true){
                                this.selectionVerificarImpedimentos.toggle(control);
                            }
                        }
                    });
                }
            this.form.setControl('verificarImpedimentos', new FormArray(fgs));
          }
        } else {
          this.gridResultMessage(false);
        }

        const evaluacionExpediente = response[2];
        if (evaluacionExpediente) {
          if (evaluacionExpediente.length == 0) {
            this.gridResultMessage();
          } else {
            const fgs = evaluacionExpediente.map(EvaluacionExpediente.asFormGroup);
            //Add al fgs set radiobuttonGroup 
            let arrayIdCodigoPadre = evaluacionExpediente.map(m=>m.idCodigoPadre).filter((v, i, a) => a.indexOf(v) === i);
            arrayIdCodigoPadre.forEach((item)=>{
                if(item!=null){
                    fgs.forEach((formItem)=>{
                        formItem.addControl('acreditaDocumento_'+item, new FormControl(null));
                    });
                }
            });

            //Si trae resultados, marcar los registros
            if(this.calificacionesResultados.length>0){
                var indice = 0;
                fgs.forEach(control=>{
                    var idMaestroCriterioCalificacion = control.get('idMaestroCriterioCalificacion').value;
                    var idMaestroRubroCalificacion = control.get('idMaestroRubroCalificacion').value;
                     var result = this.calificacionesResultados.filter(f=>
                        f.idMaestroCriterioCalificacion==idMaestroCriterioCalificacion &&
                        f.idMaestroRubroCalificacion==idMaestroRubroCalificacion )
                    if(result.length>0){
                        var item = result[0];
                        if(item.anotaciones != null){
                            this.form.get('anotacionesEvaluacionExpediente').setValue(item.anotaciones);
                        }     
                        if(item.puntajeObtenido > 0){
                    
                            if((!this.getTienePadre(control) && !control.get('tieneSubCriterio').value && !this.getTieneValorMaximo(control))){
                                control.get('acreditaDocumento').setValue(item.cumpleDocumento);
                                control.get('acreditaDocumentoSeleccionado').setValue(item.cumpleDocumento);
                                this.handleAcreditaDocumentoEvaluacionExpedienteCheckbox({checked:item.cumpleDocumento}, control);
                            }
                            
                            if((!this.getTienePadre(control) && !control.get('tieneSubCriterio').value && this.getTieneValorMaximo(control))){
                                control.get('acreditaDocumento').setValue(item.cumpleDocumento);
                                control.get('acreditaDocumentoSeleccionado').setValue(item.cumpleDocumento);
                            }

                            if(this.getTienePadre(control) && control.get('esSeleccionExcluyente').value){
                                control.get('acreditaDocumento_'+control.get('idCodigoPadre').value).setValue(indice);
                                this.handleAcreditaDocumentoEvaluacionExpedienteRadioButton({value:indice}, control);
                            }
                            if(control.get('tieneCantidad').value){
                                var cantidad = item.puntajeObtenido/control.get('puntajeMaximoUnidad').value;
                                control.get('cantidadCertificados').setValue(cantidad);
                                this.handleRecalcularEvaluacionExpedienteInput({target:{dataset:{sectionvalue:indice}}},control,fgs);
                            }
                        }
                        
                        if(control.get('tieneCantidad').value && this.esDesabilitado == true){
                            control.get('cantidadCertificados').disable();
                        }
                        control.get('puntaje').disable();
                    }
                    indice++;
                });
            }
            
            this.form.setControl('evaluacionExpediente', new FormArray(fgs));
          }
        } else {
          this.gridResultMessage(false);
        }
      }
    //});
  }

  /*
  *-------------------------------------------------------------------------------------------------------------
  * OPERACIONES REQUISITOS GENERALES
  *-------------------------------------------------------------------------------------------------------------
  */
  handleAcreditaDocumentoRequisitosGenerales = (event, requisitoGeneral: FormGroup) => {
    if(this.esDesabilitado == true){
        return;
    }
    this.selectionRequisitosGenerales.toggle(requisitoGeneral);
    const cumple = requisitoGeneral.get("acreditaDocumento").value;
    const acreditaDocumentoSeleccionado = requisitoGeneral.get('acreditaDocumentoSeleccionado');
    const acreditaDocumento = requisitoGeneral.get("acreditaDocumento");
    acreditaDocumento.setValue(!cumple);
    acreditaDocumentoSeleccionado.setValue(!cumple);
  }

    /*
  *-------------------------------------------------------------------------------------------------------------
  * OPERACIONES VERIFICAR IMPEDIMENTOS
  *-------------------------------------------------------------------------------------------------------------
  */
  handleAcreditaDocumentoVerificarImpedimentos = (event, impedimento: FormGroup) => {
    if(this.esDesabilitado == true){
        return;
    }
    this.selectionVerificarImpedimentos.toggle(impedimento);
    const cumple = impedimento.get("acreditaDocumento").value;
    const acreditaDocumentoSeleccionado = impedimento.get('acreditaDocumentoSeleccionado');
    const acreditaDocumento = impedimento.get("acreditaDocumento");
    acreditaDocumento.setValue(!cumple);
    acreditaDocumentoSeleccionado.setValue(!cumple);
  }

    /*
    *-------------------------------------------------------------------------------------------------------------
    * OPERACIONES EVALUAR EXPEDIENTE
    *-------------------------------------------------------------------------------------------------------------
    */

    handleAcreditaDocumentoEvaluacionExpedienteRadioButton = (event, EvaluacionExpediente: FormGroup) => {
        const tieneCantidad = EvaluacionExpediente.get('tieneCantidad').value;
        if(tieneCantidad == false){
            //No tiene input
            const puntajeMaximo = EvaluacionExpediente.get('puntajeMaximo').value;
            const puntaje = EvaluacionExpediente.get('puntaje');
            puntaje.setValue(puntajeMaximo);
            EvaluacionExpediente.get('acreditaDocumento_'+EvaluacionExpediente.get('idCodigoPadre').value).setValue(event.value);
            //Actualizar los otros valores puntaje en vacio
            this.evaluacionExpediente.controls.forEach(formControl => {
                const tieneCantidad = formControl.get('tieneCantidad').value;
                const validacion = this.getTienePadre(formControl) && formControl.get('esSeleccionExcluyente').value
                if(validacion == true && tieneCantidad == false){
                    //No tiene input
                    const control = formControl.get('acreditaDocumento_'+formControl.get('idCodigoPadre').value);
                    if(control.value!=event.value){
                        const puntaje = formControl.get('puntaje');
                        puntaje.setValue(null);
                        control.setValue(null);
                    }
                }
            });
        }
        this.recalcularEvaluacionExpediente();
    }
    
    handleAcreditaDocumentoEvaluacionExpedienteCheckbox = (event, EvaluacionExpediente: FormGroup)=>{
        const puntaje = EvaluacionExpediente.get('puntaje');
        const puntajeMaximo = EvaluacionExpediente.get('puntajeMaximo').value;
        if(event.checked==true){
            puntaje.setValue(puntajeMaximo);
        }else{
            puntaje.setValue(null);
        }
        this.recalcularEvaluacionExpediente();
    }
    handleAcreditaDocumentoEvaluacionExpedienteCheckboxInput= (event, EvaluacionExpediente: FormGroup)=>{
        const puntaje = EvaluacionExpediente.get('puntaje');
        const cantidadCertificados = EvaluacionExpediente.get('cantidadCertificados');
        EvaluacionExpediente.get('acreditaDocumentoSeleccionado').setValue(event.checked);
        if(event.checked==false){
            puntaje.setValue(null);
            cantidadCertificados.setValue(null);
        }
        this.recalcularEvaluacionExpediente();
    }

    handleRecalcularEvaluacionExpedienteInput = (event, EvaluacionExpediente: FormGroup, listaControles) => {
        if(this.esDesabilitado == true && listaControles == undefined){
            return false;
        }
        const cantidadCertificados = EvaluacionExpediente.get("cantidadCertificados").value;
        const soloCheck = (!this.getTienePadre(EvaluacionExpediente) && !EvaluacionExpediente.get('tieneSubCriterio').value && this.getTieneValorMaximo(EvaluacionExpediente));
        const soloRadio = this.getTienePadre(EvaluacionExpediente) && EvaluacionExpediente.get('esSeleccionExcluyente').value && EvaluacionExpediente.get('tieneCantidad').value;
        if(soloCheck){
            if(EvaluacionExpediente.get('acreditaDocumentoSeleccionado').value == false){
                EvaluacionExpediente.get('acreditaDocumentoSeleccionado').setValue(true);
                EvaluacionExpediente.get('acreditaDocumento').setValue(true);
            }
            const puntajeMaximo = EvaluacionExpediente.get('puntajeMaximo').value;
            const puntajeMaximoUnidad = EvaluacionExpediente.get('puntajeMaximoUnidad').value;
            const puntaje = EvaluacionExpediente.get('puntaje');
            const calculado  = (cantidadCertificados*puntajeMaximoUnidad).toFixed(2);
            if(calculado>puntajeMaximo){
                puntaje.setValue(puntajeMaximo);
            }else{
                puntaje.setValue(calculado);
            }
        }
        else{
            if(soloRadio){
                const puntajeMaximoUnidad = EvaluacionExpediente.get('puntajeMaximoUnidad').value;
                const puntaje = EvaluacionExpediente.get('puntaje');
                const idCodigoPadre = EvaluacionExpediente.get('idCodigoPadre').value;
                const ctrPadre = this.obtenerControlPorIdCodigoPadre(idCodigoPadre,listaControles);
                const puntajeMaximo = ctrPadre.get('puntajeMaximo').value;
                const calculado  = ( (+cantidadCertificados)*puntajeMaximoUnidad ).toFixed(2);
                if(calculado>puntajeMaximo){
                    puntaje.setValue(puntajeMaximo);
                }else{
                    puntaje.setValue(calculado);
                }
                const rowIndex = event.target.dataset.sectionvalue;
                const controlCtr = EvaluacionExpediente.get('acreditaDocumento_'+idCodigoPadre);
                if(controlCtr.value!=rowIndex){
                    controlCtr.setValue(rowIndex);
                }
                
                //Actualizar los otros valores puntaje en vacio
                this.evaluacionExpediente.controls.forEach(formControl => {
                    const tieneCantidad = formControl.get('tieneCantidad').value;
                    const validacion = this.getTienePadre(formControl) && formControl.get('esSeleccionExcluyente').value
                    if(validacion == true && tieneCantidad == true){
                         const padre = formControl.get('idCodigoPadre').value;
                         const control = formControl.get('acreditaDocumento_'+padre);

                        if(control.value!=rowIndex){
                            const cantidadCertificados = formControl.get("cantidadCertificados");
                            const puntaje = formControl.get('puntaje');
                            puntaje.setValue(null);
                            cantidadCertificados.setValue(null);
                        }
                    }
                });
            }
        }
        this.recalcularEvaluacionExpediente(listaControles);    
      }


  private gridResultMessage = (emptyResult: boolean = true) => {
    if (emptyResult) {
      this.dataService.Message().msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA, () => {
      });
    } else {
      this.dataService.Message().msgWarning(MENSAJES.MENSAJE_PROBLEMAS_INFORMACION_CRITERIOS_BUSQUEDA, () => { });
    }
  }

  handleRetornar = () => {
    this.router.navigate(
        ["../../../calificacion/" + this.calificacion?.idEtapaProceso+'/'+ this.calificacion?.idAlcanceProceso],{ relativeTo: this.route }
    );

  };

  handleRegistrar = () => {
    const { idPostulacion, idEtapaProceso, idCalificacion, idCalificacionDetalle } = this.calificacion;
    const form = this.form.getRawValue();
    const requisitosGenerales: any[] = form.requisitosGenerales;
    const verificarImpedimentos: any[] = form.verificarImpedimentos;
    const evaluacionExpediente: any[] = form.evaluacionExpediente;
    const passport = this.dataService.Storage().getInformacionUsuario();

    var models: any[] = [];
    var modelExp: any[] = [];

    var marcoTodosRequisitosGenerales = true ;
    requisitosGenerales.forEach(item => {
      models.push({
        idMaestroCriterioCalificacion: item.idMaestroCriterioCalificacion,
        idMaestroRubroCalificacion: item.idMaestroRubroCalificacion,
        anotaciones: form.anotacionesRequisitosGenerales,
        cantidad: 0,
        cumpleDocumento: item.acreditaDocumento ?? false,
        puntajeObtenido: parseInt(item.puntaje ?? 0),
      });
      if((item.acreditaDocumento ?? false) == false )
      {marcoTodosRequisitosGenerales = false;}
    });

    var marcoTodosVerificarImpedimentos = true;    
    verificarImpedimentos.forEach(item => {
        models.push({
          idMaestroCriterioCalificacion: item.idMaestroCriterioCalificacion,
          idMaestroRubroCalificacion: item.idMaestroRubroCalificacion,
          anotaciones: form.anotacionesVerificarImpedimentos,
          cantidad: 0,
          cumpleDocumento: item.acreditaDocumento ?? false,
          puntajeObtenido: parseInt(item.puntaje ?? 0),
        });
        if((item.acreditaDocumento ?? false) == false )
        {marcoTodosVerificarImpedimentos = false;}
      });

      let seleccionCorrectaEscalaRemunerativa = false;
      evaluacionExpediente.forEach(item => {
        var acreditaDocumento = false;
        if(item.idCodigoPadre != null){
            var nombreComponentePadre = 'acreditaDocumento_'+item.idCodigoPadre;
            acreditaDocumento = item[nombreComponentePadre]!= null ? true:false;
        }else{
            acreditaDocumento = item.acreditaDocumento!= null ? true:false;
        }
        models.push({
          idMaestroCriterioCalificacion: item.idMaestroCriterioCalificacion,
          idMaestroRubroCalificacion: item.idMaestroRubroCalificacion,
          anotaciones: form.anotacionesEvaluacionExpediente,
          cantidad: parseInt(item.cantidadCertificados ?? 0),
          cumpleDocumento: acreditaDocumento,
          puntajeObtenido: +(item.puntaje ?? 0.0),
        });
        if( item.validaEscala === true 
            && item.idCategoriaRemunerativa === this.spublico.idCategoriaRemunerativa 
            && acreditaDocumento === true 
            )
        {
            seleccionCorrectaEscalaRemunerativa = true;
        }
        if(item.validaEscala === false && acreditaDocumento === true ){
            seleccionCorrectaEscalaRemunerativa = true;
        }
        //seleccionCorrectaEscalaRemunerativa = true;//quitar, se agrega para pasar temporalmente.
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

    //Validamos anotaciones

    let mensajeAnotaciones = '';
          let cumpleRequisitosGenerales = true;
          const anotacionesRequisitosGenerales: any = form.anotacionesRequisitosGenerales;
          requisitosGenerales.forEach(item => {
            if (!item.acreditaDocumento) {
                cumpleRequisitosGenerales = false;
            }
          });
        //   if(!cumpleRequisitosGenerales && (anotacionesRequisitosGenerales == null || anotacionesRequisitosGenerales == "")){
        //     mensajeAnotaciones+= '"DEBE INGRESAR LA ANOTACIÓN EN REQUISITOS GENERALES."';
        //     this.dataService.Util().msgWarning(mensajeAnotaciones, () => { });
        //     return;
        //   }

          let cumpleVerificarImpedimentos = true;
          const anotacionesVerificarImpedimentos: any = form.anotacionesVerificarImpedimentos;
          verificarImpedimentos.forEach(item => {
            if (!item.acreditaDocumento) {
                cumpleVerificarImpedimentos = false;
            }
          });
        //   if(!cumpleVerificarImpedimentos && (anotacionesVerificarImpedimentos == null || anotacionesVerificarImpedimentos == "")){
        //     mensajeAnotaciones+= '"DEBE INGRESAR LA ANOTACIÓN EN VERIFICAR IMPEDIMENTOS."';
        //     this.dataService.Util().msgWarning(mensajeAnotaciones, () => { });
        //     return;
        //   }

          const anotacionesEvaluacionExpediente: any = form.anotacionesEvaluacionExpediente;
          if(
            ((!cumpleRequisitosGenerales && (anotacionesRequisitosGenerales == null || anotacionesRequisitosGenerales == "")) 
          && (!cumpleVerificarImpedimentos && (anotacionesVerificarImpedimentos == null || anotacionesVerificarImpedimentos == ""))) 
          && (anotacionesEvaluacionExpediente == null || anotacionesEvaluacionExpediente == "")){
            // mensajeAnotaciones+= '"DEBE INGRESAR LA ANOTACIÓN EN EVALUACIÓN DE EXPEDIENTE."';
            mensajeAnotaciones+= '"DEBE INGRESAR UNA ANOTACIÓN COMO MÍNIMO."';
            this.dataService.Util().msgWarning(mensajeAnotaciones, () => { });
            return;
          }

    
    
     if(seleccionCorrectaEscalaRemunerativa === false
        && marcoTodosRequisitosGenerales === true 
        && marcoTodosVerificarImpedimentos === true ){
         this.dataService.Util().msgWarning('DEBE MARCAR LA ESCALA REMUNERATIVA CORRECTA.', () => { });
     }else{
        this.dataService.Message().msgConfirm(MENSAJES.MENSAJE_CONFIRMACION_PARA_GUARDAR_INFORMACION, () => {
        this.working = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .crearCalificacion(model)
            .pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
            ).subscribe((response: any) => {
            if (response > 0) {
                this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO,MENSAJES.DURACION, () => {});
                this.handleRetornar();
                // this.matDialogRef.close({ registrado: true });
            }else{
                this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
            }
            });
        }, () => { });
    }
  };

  configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD)!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError(MENSAJES.MENSAJE_ERROR_SERVIDOR, () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}