import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SecurityModel } from 'app/core/model/security/security.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MESSAGE_GESTION } from '../../_utils/messages';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CodigoCatalogo, CodigoTipoCronograma, CodigoTipoVigencia } from '../../_utils/types-gestion';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

export const YEAR_MODE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'minedu-modal-registrar-vigencia',
  templateUrl: './modal-registrar-vigencia.component.html',
  styleUrls: ['./modal-registrar-vigencia.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
  providers: [
    { provide: DateAdapter,  useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS }
  ]
})
export class ModalRegistrarVigenciaComponent implements OnInit {

  form: FormGroup;
  tiempoMensaje: number = 3000; 
  cantidadLoadings = 0;

  working = false;
  fechaInicioMaxima = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
  fechaInicioMinima = new Date();
  fechaFinMinima = new Date();
  fechaFinMaxima = new Date();
  cronograma: any = null;
  permisoCronograma: any = null;
  codTipoCronograma = CodigoTipoCronograma;
  esNacional = false;
  esResponsableSistema = false;
  esVigenciaConFechas = false;
  tipoVigencia: any[];
  feriados: any[] = [];

  modal = {
    icon: "",
    title: "",
    action: "",
    tipoCronograma: ""
  }

  private passport: SecurityModel;

  constructor(
    public matDialogRef: MatDialogRef<ModalRegistrarVigenciaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.getCombosYCabecera();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idCronogramaDetalle: [null, Validators.required],
      codigoTipoCronograma: [null, Validators.required],
      fechaInicio: [null],
      fechaFin: [null],
      idTipoVigencia: [null],
      cantidadDias: [null],
      duracionMinimaNacional: [null],
      duracionMaximaNacional: [null],
      esFechaParalela: [false],
      usuarioCreacion: [null, Validators.required],
    });

    this.obtenerFeriados();
    this.initialize();
  }

  getCombosYCabecera() {
    forkJoin(
      [
        this.dataService.GestionProcesos().getCatalogoItemXCodigoCatalogo(CodigoCatalogo.TipoVigenca)
      ]
    ).pipe(
      catchError(() => { return of(null); }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      this.tipoVigencia = response[0];
    })
  }

  initialize() {
    this.modal = this.data.modal;
    this.passport = this.data.passport;
    this.cronograma = {...this.data.cronograma};
    this.permisoCronograma = this.data.permisoCronograma;
    this.esNacional = this.permisoCronograma.codigoTipoCronograma === CodigoTipoCronograma.Nacional;
    this.esResponsableSistema = this.cronograma.esResponsableSistema; 
    this.esVigenciaConFechas = this.permisoCronograma.registroVigencia || (this.esNacional && this.esResponsableSistema);
    
    this.form.patchValue({
      idCronogramaDetalle: this.cronograma.idCronogramaDetalle,
      codigoTipoCronograma: this.permisoCronograma.codigoTipoCronograma,
      duracionMinimaNacional: !this.esResponsableSistema ? this.cronograma.duracionMinimaNacional : null,
      duracionMaximaNacional: !this.esResponsableSistema ? this.cronograma.duracionMaximaNacional : null,
      esFechaParalela: this.cronograma.esFechaParalela,
      usuarioCreacion: this.passport.numeroDocumento
    }, { emitEvent: false });

    if (this.modal.action === 'info') return;
    
    this.aplicarValidadores();
    if (this.esVigenciaConFechas){
      this.form.patchValue({ 
        idTipoVigencia: this.esNacional ? this.cronograma.idTipoVigenciaEtapa : this.cronograma.idTipoVigencia
      });
      this.cambiarTipoVigencia();
    }
    this.aplicarReglasVigencia();
  }

  procesarFechas(nombre: string = '') {
    const fechaInicio = this.form.get('fechaInicio').value;
    const fechaFin = this.form.get('fechaFin').value;
    if (!fechaInicio || !fechaFin) { 
      this.form.patchValue({ cantidadDias: null }); return; 
    }
    if ( new Date(fechaInicio) > new Date(fechaFin) && nombre === 'inicio') {
      this.form.patchValue({ fechaFin: null, cantidadDias: null }); return;
    }
    if ( new Date(fechaFin) < new Date(fechaInicio) && nombre === 'fin') {
      this.form.patchValue({ fechaInicio: null, cantidadDias: null }); return;
    }
    this.calcularDiasVigencia();
  }

  cambiarTipoVigencia () {
    if (!this.form.value.idTipoVigencia) return;

    if (this.form.get("fechaInicio").disabled) {
      this.form.get('fechaInicio').enable();
      this.form.get('fechaFin').enable();
    }
    const fechaInicio = this.form.value.fechaInicio;
    if ( !fechaInicio || !this.filtroTipoVigencia(fechaInicio) )
      this.form.patchValue({ fechaInicio: null, cantidadDias: null });

    const fechaFin = this.form.value.fechaFin;
    if ( !fechaFin || !this.filtroTipoVigencia(fechaFin) )
      this.form.patchValue({ fechaFin: null, cantidadDias: null });
  }

  aplicarReglasVigencia() {
    this.fechaInicioMinima = new Date(this.cronograma.vigenciaInicio);
    this.fechaFinMaxima = new Date(this.cronograma.vigenciaTermino);
    if(!this.esNacional && this.cronograma.fechaInicioNacional && this.cronograma.fechaFinNacional){
      this.fechaInicioMinima  = new Date(this.cronograma.fechaInicioNacional);
      this.fechaFinMaxima = new Date(this.cronograma.fechaFinNacional);
    }
    const esFechasConsecuentes = this.esVigenciaConFechas && !this.form.value.esFechaParalela;

    if (esFechasConsecuentes)
      this.aplicarReglasFechasConsecuentes();
    
    if (this.esNacional && this.cronograma.esFechaVacanciaPlazas)
      this.aplicarReglaEsFechaVacanciaPlazas();

    if (this.esVigenciaConFechas && !esFechasConsecuentes)
      this.asignarFechasValidadas();
  }

  aplicarValidadores() {
    if (this.esVigenciaConFechas) {
      this.form.get('idTipoVigencia').setValidators([Validators.required]);
      this.form.get('idTipoVigencia').updateValueAndValidity();

      this.form.get('fechaInicio').setValidators([Validators.required]);
      this.form.get('fechaInicio').updateValueAndValidity();
      this.form.get('fechaInicio').disable();

      this.form.get('fechaFin').setValidators([Validators.required]);
      this.form.get('fechaFin').updateValueAndValidity();
      this.form.get('fechaFin').disable();
      
      if(!this.esNacional){
        if (this.cronograma.duracionMinimaNacional && this.cronograma.duracionMaximaNacional){
          this.form.get('cantidadDias').setValidators([Validators.required, 
            Validators.min(this.cronograma.duracionMinimaNacional), 
            Validators.max(this.cronograma.duracionMaximaNacional)]);
          this.form.get('cantidadDias').updateValueAndValidity();
        }
      }
    } else if (this.permisoCronograma.maximaDuracion && !this.esResponsableSistema) {
      this.form.get('duracionMinimaNacional').setValidators([Validators.required, Validators.max(99), Validators.min(1)]);
      this.form.get('duracionMinimaNacional').updateValueAndValidity();
      this.form.get('duracionMaximaNacional').setValidators([Validators.required, Validators.max(99), Validators.min(1)]);
      this.form.get('duracionMaximaNacional').updateValueAndValidity();
    }
  }

  aplicarReglasFechasConsecuentes(){
    const data = {
      idCronograma: this.cronograma.idCronograma,
      idCronogramaDetalle: this.cronograma.idCronogramaDetalle,
      codigoTipoCronograma: this.permisoCronograma.codigoTipoCronograma
    }
    this.cargarLoading();
    this.dataService.GestionProcesos().obtenerFechaInicioMinima(data).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => this.descargarLoading())
      ).subscribe(fechaMinima => {
        if (fechaMinima) {
          fechaMinima = new Date(fechaMinima);
          this.fechaInicioMinima = fechaMinima > this.fechaInicioMinima ? fechaMinima : this.fechaInicioMinima;
        }
        this.asignarFechasValidadas();
      });
  }

  asignarFechasValidadas () {
    this.fechaInicioMaxima = this.fechaFinMaxima;
    this.fechaFinMinima = this.fechaInicioMinima;
    if (this.esNacional){
      if (this.cronograma.fechaInicioNacional) {
        const fechaInicioNacional = new Date(this.cronograma.fechaInicioNacional);
        this.form.patchValue({
          fechaInicio: fechaInicioNacional >= this.fechaInicioMinima && fechaInicioNacional <= this.fechaFinMaxima ? 
            this.cronograma.fechaInicioNacional : null
        });
      }
      if (this.cronograma.fechaFinNacional) {
        const fechaFinNacional = new Date(this.cronograma.fechaFinNacional);
        this.form.patchValue({
          fechaFin: fechaFinNacional >= this.fechaInicioMinima && fechaFinNacional <= this.fechaFinMaxima ? 
            this.cronograma.fechaFinNacional : null
        });
      }

    } else {
      if (this.cronograma.fechaInicioActividad) {
        const fechaInicioActividad = new Date(this.cronograma.fechaInicioActividad);
        this.form.patchValue({
          fechaInicio: fechaInicioActividad >= this.fechaInicioMinima && fechaInicioActividad <= this.fechaFinMaxima ? 
            this.cronograma.fechaInicioActividad : null
        });
      }
      if (this.cronograma.fechaFinActividad) {
        const fechaFinActividad = new Date(this.cronograma.fechaFinActividad);
        this.form.patchValue({
          fechaFin: fechaFinActividad >= this.fechaInicioMinima && fechaFinActividad <= this.fechaFinMaxima ? 
            this.cronograma.fechaFinActividad : null
        });
      }
    }
    this.procesarFechas();
  }

  aplicarReglaEsFechaVacanciaPlazas() {
    if ( (+this.data.anioProceso) <= new Date().getFullYear() )
      this.fechaInicioMinima = new Date(new Date().setHours(0, 0, 0, 0));
    else 
      this.fechaInicioMinima = new Date(+this.data.anioProceso , 0, 1);
    
    this.fechaFinMaxima = new Date(+this.data.anioProceso + 1 , 11, 31);
  }
  
  cambiarEsFechaParalela (){
    const fechaInicio = this.form.get('fechaInicio').value;
    const fechaFin = this.form.get('fechaFin').value;
    if (this.esNacional) {
      this.cronograma.fechaInicioNacional = fechaInicio;
      this.cronograma.fechaFinNacional = fechaFin;
    } else {
      this.cronograma.fechaInicioActividad = fechaInicio;
      this.cronograma.fechaFinActividad = fechaFin;
    }
    this.aplicarReglasVigencia();
  }

  filtroTipoVigencia = (d: any): boolean => {
    const idTipoVigencia = this.form.get('idTipoVigencia').value;
    if (!this.tipoVigencia || !idTipoVigencia) return true;
    var codigotipoVigencia = this.tipoVigencia.find(x => x.idCatalogoItem === idTipoVigencia).codigoCatalogoItem;

    const date = new Date (d);
    const day = date.getDay();
    
    switch (codigotipoVigencia) {
      case CodigoTipoVigencia.diasHabiles:
        return day !== 0 && day !== 6 &&
            (this.feriados.filter(x=> x.toLocaleDateString() == date.toLocaleDateString() ).length == 0);
      case CodigoTipoVigencia.diasHabilesIncluyendoSabado:
        return day !== 0 &&
            (this.feriados.filter(x=> x.toLocaleDateString() == date.toLocaleDateString() ).length == 0);
      case CodigoTipoVigencia.diasCalendario:
        return true;
      default:
        return true;
    }
  }

  calcularDiasVigencia() {
    const idTipoVigencia = this.form.get('idTipoVigencia').value;
    const fechaInicio = this.form.get('fechaInicio').value;
    const fechaFin = this.form.get('fechaFin').value;
    if(!idTipoVigencia || !fechaInicio || !fechaFin) return;
    const data = {
      idTipoVigencia: idTipoVigencia,
      fechaInicial: fechaInicio,
      fechaFinal: fechaFin
    }
    this.cargarLoading();
    this.dataService.GestionProcesos().calcularDiasVigencia(data).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => this.descargarLoading())
    ).subscribe(cantidadDias => {
      this.form.patchValue({ cantidadDias: null });
      if (cantidadDias <= 0) return;
      
      if (!this.cronograma.duracionMinimaNacional || !this.cronograma.duracionMaximaNacional) {
        this.form.patchValue({ cantidadDias: cantidadDias }); return;
      }

      if (cantidadDias >= this.cronograma.duracionMinimaNacional && cantidadDias <= this.cronograma.duracionMaximaNacional)
        this.form.patchValue({ cantidadDias: cantidadDias });
      else {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_CANTIDAD_DIAS, () => { });
        this.form.patchValue({ fechaFin: null });
      }
    });
  }

  obtenerFeriados() {
    const anioInicio = new Date().getFullYear();
    this.dataService.GestionProcesos().obtenerFeriadosAPartirDeAnioInicio(anioInicio).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(feriados => {
      if (feriados?.length > 0) {
        this.feriados = feriados.map(fecha => {
          return new Date(fecha);
        })
      } 
    });
  }

  validarDuracion() {
    const minima = this.form.get('duracionMinimaNacional');
    if (minima.value && +minima.value) {
      minima.setValue(+minima.value);
      this.form.get('duracionMaximaNacional').setValidators([Validators.required, Validators.min(+minima.value), Validators.max(99)]);
      this.form.get('duracionMaximaNacional').updateValueAndValidity();
    } else
      minima.setValue(null);

    const maxima = this.form.get('duracionMaximaNacional');
    if (maxima.value && +maxima.value) {
      maxima.setValue(+maxima.value);
      this.form.get('duracionMinimaNacional').setValidators([Validators.required, Validators.min(1), Validators.max(+maxima.value)]);
      this.form.get('duracionMinimaNacional').updateValueAndValidity();
    } else
      maxima.setValue(null);
  }

  handleGuardar() {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08, () => { });
      return;
    }
    this.registrarVigencia();
  }
  
  registrarVigencia() {
    const form = this.form.value;

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M02, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.GestionProcesos().registrarVigencia(form).pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          if (response && response > 0) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => {
              this.handleCancelar({ reload: true });
            });
          } 
        });
    }, () => { });
  }
  
  handleModificar() {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08, () => { });
      return;
    }
    
    const minima = this.form.get('duracionMinimaNacional');
    if (minima.value)
      minima.setValue(+minima.value);
    const maxima = this.form.get('duracionMaximaNacional');
    if (maxima.value)
      maxima.setValue(+maxima.value);

    this.modificarVigencia();
  }
  
  modificarVigencia() {
    const form = this.form.value;

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M03, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.GestionProcesos().modificarVigencia(form).pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          if (response && response > 0) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => {
              this.handleCancelar({ reload: true });
            });
          } 
        });
    }, () => { });
  }

  handleCancelar(data?: any) {
    this.matDialogRef.close(data);
  }
  
  cargarLoading() {
    if (this.cantidadLoadings == 0)
      setTimeout(() => { this.dataService.Spinner().show("sp6"); }, 0);
    this.cantidadLoadings++;
  }

  descargarLoading() {
    this.cantidadLoadings--;
    if (this.cantidadLoadings == 0)
      this.dataService.Spinner().hide("sp6");
  }

}
