import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, retry, tap } from 'rxjs/operators';
import { CONFIGURACION_PROCESO_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { CatalogoEstadoClasificaionEnum, CatalogoEstadoConsolidadoEnum, CatalogoItemEnumNombramiento } from '../../_utils/constants';
import { parse } from 'path';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'minedu-modal-agregar-observar-postulante',
    templateUrl: './modal-agregar-observar-postulante.component.html',
    styleUrls: ['./modal-agregar-observar-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
  })
  export class ModalAgregarObservarPostulanteComponent implements OnInit, AfterViewInit {

    form: FormGroup;
    working = false;
    isDisabled = false;
    
    modal = {
      icon: "",
      title: "",
      action: "",
      info: null,
      editable: false
    }
    selectedMotivoObservacion = 0;
    comboLists = {
      listMotivoObservacion: [],
    };
    public idCalificacion: number;
    numeroDocumento: string;
   
    private _loadingChange = new BehaviorSubject<boolean>(false);
    loading = this._loadingChange.asObservable();
  
    isMobile = false;
    getIsMobile(): boolean {
      const w = document.documentElement.clientWidth;
      const breakpoint = 992;
      if (w < breakpoint) {
        return true;
      } else {
        return false;
      }
    }
  
    constructor(
      public matDialogRef: MatDialogRef<ModalAgregarObservarPostulanteComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private formBuilder: FormBuilder,
      private dataService: DataService) {
    }
  
    ngOnInit(): void {
      this.buildForm();
      this.passport();

      this.loadMotivoObservacion();
    }
  
    ngAfterViewInit() {
    }

    ngOnDestroy(): void { }

    passport() {        
      const usuario = this.dataService.Storage().getPassportUserData();
      this.numeroDocumento= usuario.NUMERO_DOCUMENTO;
    }
  
    buildForm() {
      this.form = this.formBuilder.group({
        idMotivoObservacion: [null, Validators.required],
        anotacionesObservacion: [null, Validators.required],
      });
      
      this.initialize();
    }
    
    initialize() {
      
      this.modal = this.data.modal;
      let calificacion = this.data.calificacion;
      this.idCalificacion = parseInt(calificacion.idCalificacion);

      if(calificacion.idMotivoObservacion == null){
        this.form = this.formBuilder.group({
          idMotivoObservacion: [null, Validators.required],
          anotacionesObservacion: [null, Validators.required],
        });
      } 
      else{        
        this.form = this.formBuilder.group({
          idMotivoObservacion: [{ value: calificacion.idMotivoObservacion, disabled: false},  [Validators.required]],
          anotacionesObservacion: [{ value: calificacion.anotacionesObservacion, disabled: false }, Validators.required],
        });
      }
    }
  
    handleGrabar() {
      const form = this.form.value;
     
      if (form.anotacionesObservacion.length == 0) {
        this.dataService.Message().msgWarning('Agregue motivo.', () => { });
        return;
      }

      this.grabarSustentarMotivoNoPublicacionPlazas();
      
    }
  
    confirmarOperacionCrear(token: any) {
      const parametroPermisoAgregar = this.dataService.Storage().getParamAccion(TablaProcesosConfiguracionAcciones.Agregar);
      const param = this.dataService.Cifrado().PassportEncode(token, parametroPermisoAgregar);
      this.dataService.Passport().getAutorizacion(param).pipe(
        catchError(() => { this.dataService.SnackBar().msgError(PASSPORT_MESSAGE.BUSCAR_AUTHORIZACION, 'Cerrar'); return of(null) }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe(response => {
          if (response && !response.HasErrors) {
          const data = response.Data[0];
          if (data.ESTA_AUTORIZADO) {
            this.grabarSustentarMotivoNoPublicacionPlazas();
          } else {
            this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
          }
        } else {
          this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        }
      });
    }
  
    grabarSustentarMotivoNoPublicacionPlazas() {
      
      const form = this.form.value;

      let obj = {
        calificacion: {
          idCalificacion: this.idCalificacion,
          codigoEstadoCalificacion: CatalogoEstadoClasificaionEnum.OBSERVADO,
          idMotivoObservacion: form.idMotivoObservacion,
          anotacionesObservacion: form.anotacionesObservacion,
          
          fechaModificacion: new Date(),
          usuarioModificacion: this.numeroDocumento,
          ipModificacion: '',
        }
      };

      this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información.?', () => {
        this.dataService.Spinner().show("sp6");
        this.working = true;
        this.dataService
          .Nombramiento()
          .actualizarMotivoObservacionCalificacion(obj)
          .pipe(
            catchError((e) => of(e)),
            finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
          )
          .subscribe(response => {
            if (response && response > 0) {
              this.dataService.Message().msgSuccess('Operación realizada de forma exitosa.', () => { 
                this.handleCancelar({ reload: true }); 
              });
            } else if (response && (response.status === 400 || response.status === 422 || response.status === 404)) {
              this.dataService.Message().msgWarning(response.error.messages[0], () => { });
            } else {
              this.dataService.Message().msgWarning('No se puede crear la configuración del proceso.', () => { });
            }
          });
      }, () => { });
    }
  
    handleCancelar(data?: any) {
      this.matDialogRef.close(data);
    }

    loadMotivoObservacion= () => {
      this.dataService
          .Nombramiento()
          .getComboCatalogoItem(CatalogoItemEnumNombramiento.MOTIVO_OBSERVACION_CALIFICACION)
          .pipe(
              catchError(() => of([])),
              finalize(() => { })
          )
          .subscribe((response: any) => {
              if (response) {
                  var index=0;
                  response.splice(index,0,
                                  {idCatalogoItem:0,
                                    idCatalogo:0,
                                    descripcionCatalogoItem:"SELECCIONAR"});
                  const data = response.map((x) => ({
                      ...x,
                      value: x.idCatalogoItem,
                      label: `${x.descripcionCatalogoItem}`,
                  }));
                  this.comboLists.listMotivoObservacion = data;
              }
          });
    }
  
  }