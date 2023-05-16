import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewInit, ChangeDetectionStrategy, ViewChildren, QueryList } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, retry, tap } from 'rxjs/operators';
import { CONFIGURACION_PROCESO_MESSAGE, DOCUMENTO_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { ModalInformacionDocumentoSustentoComponent } from '../modal-informacion-documento-sustento/modal-informacion-documento-sustento.component';
import { CatalogoEstadoDesarrolloEnum, CatalogoItemEnumNombramiento, CatalogoSituacionValidacionEnum } from '../../_utils/constants';
import { SingleFileInputComponent } from 'app/main/apps/components/single-file-input/single-file-input.component';
import { environment } from 'environments/environment';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'minedu-modal-agregar-motivo-rechazo-plazas',
    templateUrl: './modal-agregar-motivo-rechazo-plazas.component.html',
    styleUrls: ['./modal-agregar-motivo-rechazo-plazas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
  })
  export class ModalAgregarMotivoRechazoPlazasComponent implements OnInit, AfterViewInit {
    @ViewChildren(SingleFileInputComponent)
    fileComponent: QueryList<SingleFileInputComponent>;
    form: FormGroup;
    formDetalle: FormGroup;
    working = false;
    isDisabled = false;
    dialogRef: any;
  
    permisoPassport = {
      buttonCrearProceso: false,
      buttonModificarProceso: false,
      buttonEliminarProceso: false
    }

    numeroDocumento = null;
  
    max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    min = new Date();
  
    modal = {
      icon: "",
      title: "",
      action: "",
      info: null,
      editable: false
    }
  
    public selection: any[];
    sustentos: any[] = [];
    idEtapaProceso: number = null;
    combo = {
      listMotivoObservacion: [],
      listTipoDocumentoSustento: [],
      listTipoFormatoSustento: [],
    };
    numeroConvocatoria: string;
  
    displayedColumns: string[] = [
      'descripcionTipoDocumentoSustento',
      'numeroDocumentoSustento',
      'descripcionTipoFormatoSustento',
      'numeroFolios',
      'fechaEmision',
      'fechaRegistro',
      'acciones'
    ];

    private _loadingChange = new BehaviorSubject<boolean>(false);
    loading = this._loadingChange.asObservable();
    dataSourceDocumentoSustento = [];
  
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
      public matDialogRef: MatDialogRef<ModalAgregarMotivoRechazoPlazasComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private formBuilder: FormBuilder,
      private materialDialog: MatDialog,
      private dataService: DataService) {
    }
  
    ngOnInit(): void {
      this.buildForm();
      this.defaultPermisoPassport();
    
      this.formDetalle.patchValue({ 
        fechaEmision: new Date(),
        fechaRegistro: new Date(),
      });
    }
  
    ngAfterViewInit() {
    }
  
    buildForm() {
      this.form = this.formBuilder.group({
        idMotivoObservacion: [null, Validators.required],
        detalleObservacion: [null, Validators.required],
      });
      //////////////////////
      this.formDetalle = this.formBuilder.group({
        idTipoFormatoSustento: [null, Validators.required],
        idTipoDocumentoSustento: [null, Validators.required],
        codigoDocumentoSustento: ["-"],
        numeroDocumentoSustento: [null, Validators.required],
        entidadEmisora: [""],
        fechaEmision :  [new Date(), Validators.required],
        numeroFolios: [null, Validators.required],
        sumilla: [""],
        codigoAdjuntoSustento: [""],
        fechaRegistro :  [new Date(), Validators.required],
      });
  
      this.initialize();
    }
    
    initialize() {
      this.modal = this.data.modal;
      this.selection = this.data.selection;
      this.idEtapaProceso = this.data.idEtapaProceso;
      
      if (this.modal.action === "create") {

        this.loadMotivoObservacion();
        this.loadTipoDocumentoSustento();
        this.loadTipoFormatoSustento();
      } 
    }
  
    defaultPermisoPassport() {
      this.permisoPassport.buttonCrearProceso = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
      this.permisoPassport.buttonModificarProceso = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
      this.permisoPassport.buttonEliminarProceso = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Eliminar);
   
      const usuario = this.dataService.Storage().getPassportUserData();
      this.numeroDocumento= usuario.NUMERO_DOCUMENTO;
    }
  
    loadMotivoObservacion = () => {
      this.dataService
      .Nombramiento()
        .getComboCatalogoItem(CatalogoItemEnumNombramiento.MOTIVO_OBSERVACION)
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
                })
              );
            this.combo.listMotivoObservacion = data;
          }
        });
    }

    loadTipoDocumentoSustento = () => {
      this.dataService
      .Nombramiento()
        .getComboCatalogoItem(CatalogoItemEnumNombramiento.TIPO_DOCUMENTO_SUSTENTO)
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
                })
              );
            this.combo.listTipoDocumentoSustento = data;
          }
        });
    }

    loadTipoFormatoSustento = () => {
      this.dataService
      .Nombramiento()
        .getComboCatalogoItem(CatalogoItemEnumNombramiento.TIPO_FORMATO_SUSTENTO)
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
                })
              );
            this.combo.listTipoFormatoSustento = data;
          }
        });
    }
    adjunto(pIdDocumento) {
      this.formDetalle.patchValue({ codigoAdjuntoSustento: pIdDocumento });
    }
    handleAgregarDocumentoSustento(){
      const idTipoFormatoSustento = this.formDetalle.value.idTipoFormatoSustento;
      const idTipoDocumentoSustento = this.formDetalle.value.idTipoDocumentoSustento;
      const codigoDocumentoSustento = this.formDetalle.value.codigoDocumentoSustento;
      const numeroDocumentoSustento = this.formDetalle.value.numeroDocumentoSustento;
      const entidadEmisora = this.formDetalle.value.entidadEmisora;
      const fechaEmision = this.formDetalle.value.fechaEmision;
      const numeroFolios = parseInt(this.formDetalle.value.numeroFolios);
      const sumilla = this.formDetalle.value.sumilla;
      
      this.formDetalle.value.codigoAdjuntoSustento = this.formDetalle.value.codigoAdjuntoSustento ? this.formDetalle.value.codigoAdjuntoSustento[0] : this.formDetalle.value.codigoAdjuntoSustento;
      const codigoAdjuntoSustento = this.formDetalle.value.codigoAdjuntoSustento;

      
      if( !idTipoDocumentoSustento || !numeroDocumentoSustento ||
        this.dataSourceDocumentoSustento.filter(x => x.idTipoDocumentoSustento === idTipoDocumentoSustento &&
          x.numeroDocumentoSustento === numeroDocumentoSustento ).length !== 0)
        return;
      
      const row  = {
        idTipoFormatoSustento: idTipoFormatoSustento,
        idTipoDocumentoSustento: idTipoDocumentoSustento,
        descripcionTipoDocumentoSustento: this.combo.listTipoDocumentoSustento.find(x => x.idCatalogoItem === idTipoDocumentoSustento).descripcionCatalogoItem,
        codigoDocumentoSustento: codigoDocumentoSustento,
        numeroDocumentoSustento: numeroDocumentoSustento,
        entidadEmisora: entidadEmisora,
        fechaEmision: fechaEmision,
        numeroFolios: numeroFolios,
        descripcionTipoFormatoSustento: this.combo.listTipoFormatoSustento.find(x => x.idCatalogoItem === idTipoFormatoSustento).descripcionCatalogoItem,
        sumilla: sumilla,
        codigoAdjuntoSustento: codigoAdjuntoSustento,
        fechaRegistro: new Date(),
      }

      if (codigoAdjuntoSustento != null) {
        this.fileComponent.forEach((c) => c.eliminarDocumento());
        this.subirDocumentoAdjunto(codigoAdjuntoSustento,row);
      }else{
        this.dataSourceDocumentoSustento = [...this.dataSourceDocumentoSustento, row];
      }
    }
    subirDocumentoAdjunto(file: any, row:any) {
        if (file) {
            const documento = new FormData();        
            documento.append('codigoSistema', environment.documentoConfig.CODIGO_SISTEMA);
            documento.append('descripcionDocumento', ' ');
            documento.append('codigoUsuarioCreacion', 'Admin'); //Obtener del SSO Passport
            documento.append('archivo', file);

            this.dataService.Spinner().show("sp6");
            this.dataService.Documento().crear(documento).pipe(
                catchError(() => { this.dataService.SnackBar().msgError(DOCUMENTO_MESSAGE.CREAR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
                finalize(() => { this.dataService.Spinner().hide("sp6"); })
            ).subscribe(response => {
                if (response && response.data) {
                    const codigoAdjunto = response.data;
                    row.codigoAdjuntoSustento = codigoAdjunto.codigoDocumento;
                    row.codigoDocumentoSustento = row.codigoAdjuntoSustento;
                    this.dataSourceDocumentoSustento = [...this.dataSourceDocumentoSustento, row];
                    
                } else {
                    this.dataService.Message().msgError('"NO SE PUDO ADJUNTAR DOCUMENTO DE SUSTENTO, SELECCIONE OTRO."', () => { });
                }
            });
        }
    }
    handleEliminarDocumentoSustento(row: any){
      this.dataSourceDocumentoSustento = 
      this.dataSourceDocumentoSustento.filter(x => x.idTipoDocumentoSustento !== row.idTipoDocumentoSustento && 
                                                    x.numeroDocumentoSustento !== row.numeroDocumentoSustento);
    }
  
    handleInformacionDocumentoSustento(row: any){

      this.dialogRef = this.materialDialog.open(ModalInformacionDocumentoSustentoComponent, {
        panelClass: 'modal-proceso-form-dialog',
        disableClose: true,
        data: {
          modal: {
            icon: "save",
            title: "Informacion completa de Documento Sustento",
            action: "informate",
            info: { instancia: 16 },
            editable: true
          },
          documentoSustento: row,
        }
      });

      this.dialogRef.afterClosed()
        .subscribe((response: any) => {
          if (!response) {
            return;
          }
          if (response.reload) { 
          }
        });                                          
    }
 
    handleGrabar() {
     
      if (this.dataSourceDocumentoSustento.length == 0) {
        this.dataService.Message().msgWarning('Agregue al menos un documento.', () => { });
        return;
      }
      // if (!this.form.valid) {
      //   this.dataService.Message().msgWarning('Ingrese los campos obligatorios.', () => { });
      //   return;
      // }
  
      // if (!this.permisoPassport.buttonCrearProceso) {
      //   this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      //   return;
      // }

      this.grabarSustentarMotivoObservacionPlazas();
      return;

      this.dataService.Spinner().show("sp6");
      this.dataService.Passport().boot().pipe(
        catchError(() => of(null))
      ).subscribe((response: any) => {
        if (response) {
          const d = JSON.parse(response);
          this.confirmarOperacionCrear(d.Token);
        } else {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        }
      });
      
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
            this.grabarSustentarMotivoObservacionPlazas();
          } else {
            this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
          }
        } else {
          this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        }
      });
    }
  
    grabarSustentarMotivoObservacionPlazas() {
      
      const form = this.form.value;
      const documentoSustento: any[] = this.dataSourceDocumentoSustento;
      const plazasSeleccionadas: any[] = this.selection;

      let obj = {
        idEtapaProceso: 0,
        
        etapaProceso: {
          idEtapaProceso: this.idEtapaProceso,
          codigoEstadoDesarrollo: CatalogoEstadoDesarrolloEnum.INICIADO,
          fechaModificacion: new Date(),
          usuarioModificacion: this.numeroDocumento,
          ipModificacion: '',
        },

        situacionValidacion: plazasSeleccionadas.map(item => {
          return {
            idPlazaNombramientoDetalle: item.idPlazaNombramientoDetalle,
            codigoSituacionValidacion: CatalogoSituacionValidacionEnum.OBSERVADA,
            idMotivoObservacion: form.idMotivoObservacion,
            detalleObservacion: form.detalleObservacion,

            fechaModificacion: new Date(),
            usuarioModificacion: this.numeroDocumento,
            ipModificacion: '',
          };
        }),

        documentoSustento: documentoSustento.map(item => {
          return {
            idPlazaNombramientoDetalle: 0,
            idTipoFormatoSustento: item.idTipoFormatoSustento,
            idTipoDocumentoSustento: item.idTipoDocumentoSustento,
            codigoDocumentoSustento: "",
            numeroDocumentoSustento: item.numeroDocumentoSustento,
            entidadEmisora: item.entidadEmisora,
            fechaEmision: item.fechaEmision,
            numeroFolios: item.numeroFolios,
            sumilla: item.sumilla,
            codigoAdjuntoSustento: item.codigoAdjuntoSustento,
            activo: true,

            fechaCreacion: item.fechaRegistro,
            usuarioCreacion: this.numeroDocumento,
            ipCreacion: '',
          };
        }),
      };

      this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información.?', () => {
        this.dataService.Spinner().show("sp6");
        this.working = true;
        this.dataService
          .Nombramiento()
          .agregarDocumentoSustentoPlazaNombramiento(obj)
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
  
  }