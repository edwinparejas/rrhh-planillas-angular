import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SingleFileInputComponent } from 'app/main/apps/components/single-file-input/single-file-input.component';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { TablaSeccion, TablaTipoSeccion } from 'app/core/model/types';
import { HttpErrorResponse } from '@angular/common/http';
import { SingleFileInputTempComponent } from 'app/main/apps/components/single-file-input-temp/single-file-input-temp.component';
import { VerInformacionSustentoComponent } from '../ver-informacion-sustento/ver-informacion-sustento.component';
import { ModalDiferenciaPlazaComponent } from '../modal-diferencia-plaza/modal-diferencia-plaza.component';
import { MESSAGE_GESTION } from '../../models/vinculacion.model';



@Component({
  selector: 'minedu-generar-proyecto',
  templateUrl: './generar-proyecto.component.html',
  styleUrls: ['./generar-proyecto.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class GenerarProyectoComponent implements OnInit, AfterViewInit {
  ELEMENTOS_TEMP_DATAGRID: tblGridAccGrab[] = [];
  CONSIDERANDO_TEMP_DATAGRID: tblGridConGrab[] = []; 
  working: false;
  verInformacion: boolean = false;
  form: FormGroup;
  tiposDeResolucion: any[] = [];
  tiposDocumentoSustento: any[] = [];
  tiposFormatoSustento: any[] = [];
  maximo: number = 8;
  formCons: FormGroup;
  formProyecto: FormGroup;
  row: number;
  private _loadingChange = new BehaviorSubject<boolean>(false);
  loading = this._loadingChange.asObservable();
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  idProceso: number;
  paginatorPageSize = 3;
  paginatorPageIndex = 1;
  seleccionado: any = null;
  selectedTabIndex = 0;
  seccion = "";
  tipoSeccion = "";
  sustentos: any[] = [];
  conteo = 0;
  conVistoProyecto: boolean = false;
  workingAdd = false;
  // fileComponent: QueryList<SingleFileInputComponent>
  dialogRef: any;

  nowDate = new Date();

  conDiferencia: boolean = false;

  idRolPassport: number = 1;

  propuesta = {
      propuestasAdecuacion: [],
      usuarioCreacion: null,
      codigoTipoDocumentoIdentidad: null,
      numeroDocumentoIdentidad: null
  };
  displayedColumns: string[] = [
      'index',
      'tipoDocumentoSustento',
      'numeroDocumentoSustento',
      'fechaEmision',
      'tipoFormatoSustento',
      'numeroFolios',
      'fechaRegistro',      
      'detallevisto',      
      'opciones'
  ];
  selectedTipoDoc = 0;
  comboLists = {
      listTipoDocumento: [],
      listTipoResolucion: [],
      listTipoFormato: [],
  }

  // cabeceraAccion = {};
  cabeceraAccion = {
    regimen_laboral: {
      abreviaturaRegimenLaboral: ''
    },
    grupo_accion: {
      descripcion_grupo_accion: ''
    },
    accion: {
      descripcion_accion: ''
    },
    motivo_accion: {
      descripcion_motivo_accion: ''
    },
    mandato_judicial:'',
    descripcion_accion:'',
    descripcion_motivo_accion:'',
    idDre: 0,
    idUgel: 0
  }

  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  private _unsubscribeAll: Subject<any>;
  private sharedSubscription: Subscription;


  constructor(
    public matDialogRef: MatDialogRef<GenerarProyectoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dataShared: SharedService,
    private materialDialog: MatDialog
  ) { }

  ngAfterViewInit() {}
  @ViewChildren(SingleFileInputTempComponent)
    fileComponent: QueryList<SingleFileInputTempComponent>;
    limpiarProyecto() {
        this.form.controls['idTipoFormato'].reset();
        this.form.controls['mostrarVistoProyecto'].reset();
        this.form.controls['idTipoDocumento'].reset();
        this.form.controls['numeroDocumentoSustento'].reset();
        this.form.controls['numeroFolios'].reset();
        this.form.controls['sumilla'].reset();
        this.form.controls['codigoAdjuntoSustento'].reset();
        this.form.controls['entidadEmisora'].reset();
        this.form.controls['fechaEmision'].reset();
        this.form.controls['adjuntarDocumento'].reset();

        this.fileComponent.forEach((c) => c.eliminarDocumento());

        var pruebaDocumento = this.form.value.adjuntarDocumento;
        
    }

  ngOnInit(): void {

    this.cabeceraAccion = {
      regimen_laboral: {
        abreviaturaRegimenLaboral: ''
      },
      grupo_accion: {
        descripcion_grupo_accion: ''
      },
      accion: {
        descripcion_accion: ''
      },
      motivo_accion: {
        descripcion_motivo_accion: ''
      },
      mandato_judicial:'',
      descripcion_accion:'',
      descripcion_motivo_accion:'',
      idDre: 0,
      idUgel: 0
    }

    this.seccion = TablaSeccion.SECCION;
    this.tipoSeccion = TablaTipoSeccion.PARRAFO;

    this.llenar();
    this.buildForm();
    this.loadTipoDocumentoSustento();
    this.loadTipoResolucion();
    this.loadTipoFormato();

  }

  ngOnDestroy(): void { 
  }

  llenar = () => {
    debugger;
    this.cabeceraAccion = this.data.datosAccion;
    console.log('this.cabeceraAccion => ', this.cabeceraAccion);
  } 

  multipleRegimen: string = "";
  multipleGrupoAccion: string = "";
  multipleAccion: string = "";
  multipleMotivo: string = "";

  codigoRegimenLaboral: number;
  codigoGrupoAccion: number;
  codigoAccion: number;
  codigoMotivoAccion: number;

  codigoUgel: string;
  codigoDre: string;

  esProyectoIndividual: boolean;


  buildForm(): void {

      
      this.form = this.formBuilder.group({
          idTipoResolucion: [-1, null],
          mostrarVistoProyecto: [null, Validators.required],
          numeroDocumentoSustento: [null, Validators.required],
          numeroFolios: [null, Validators.compose([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.maxLength(3)])],
          sumilla: [null, [ Validators.maxLength(400)]],
          codigoAdjuntoSustento: [null], //Validators.required
          entidadEmisora: [null, [ Validators.maxLength(400)]],
          fechaEmision: [null, Validators.required],
          usuarioCreacion: [null], //Validators.required
          idTipoDocumento: [null, Validators.required],
          idTipoFormato: [null,  Validators.required],
          adjuntarDocumento: [null]
      });

      this.form.get("numeroFolios").valueChanges.subscribe(value => {
        if (value && value.slice(0, 1) == "0") 
          this.form.patchValue({ numeroFolios: value.replace(/^0+/, '') });
      });

      this.formCons = this.formBuilder.group({
          idSeccion: [2],
          idTipoSeccion: [1],
          seccion: [null],
          TipoSeccion: [null],
          considerando: [null],
          sangria: [null],
      });

      this.formProyecto = this.formBuilder.group({});
      this.dataSource = new MatTableDataSource([]);
      // this.initialize();
  }

  handleAgregar() {

    if (!this.form.valid) {           
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }

    const usuario = this.dataService.Storage().getPassportUserData();
    const form = this.form.value;
    const documentoSustento = this.comboLists.listTipoDocumento.find(d => d.id_catalogo_item == form.idTipoDocumento);
    const formatoSustento = this.comboLists.listTipoFormato.find(d => d.id_catalogo_item== form.idTipoFormato);
    console.log("form", form);

    let item: tblGridAccGrab = {
      tipoDocumentoSustento: documentoSustento.descripcion_catalogo_item,
      tipoFormatoSustento: formatoSustento.descripcion_catalogo_item,
      idDocumentoSustento: 0,
      idAccionGrabada: 0, /*este item se llenara el backend despues de guardar la accion grabada*/
      idTipoResolucion: 0 /*este item se llenara al final cuando se envie la lista final, ya que es 1 resolucion por el bloque*/,
      idTipoDocumentoSustento:
          this.form.value.idTipoDocumento,
      idTipoFormatoSustento: this.form.value.idTipoFormato,
      numeroDocumentoSustento:
          this.form.value.numeroDocumentoSustento,
      entidadEmisora: this.form.value.entidadEmisora,
      fechaEmision: this.form.value.fechaEmision,
      numeroFolios: Number(this.form.value.numeroFolios),
      sumilla:  this.form.value.sumilla == null ? "" : this.form.value.sumilla,
      codigoDocumentoSustento: "", //this.form.value.adjuntarDocumento,
      vistoProyecto:
          this.form.value.mostrarVistoProyecto == "1" ? true : false,
      DetallevistoProyecto:
          this.form.value.mostrarVistoProyecto == "1" ? "SI" : "NO",
      activo: true,
      fechaCreacion: new Date(),
      usuarioCreacion: usuario.NOMBRES_USUARIO,
      ipCreacion: "",
      fechaModificacion: new Date(),
      archivoSustento: this.form.value.adjuntarDocumento == null ? "0" : this.form.value.adjuntarDocumento,
      nombreArchivoSustento: this.form.value.adjuntarDocumento == null ? "0" : this.form.value.adjuntarDocumento.name

    };

    // form.tipoDocumento = documentoSustento.descripcion_catalogo_item;
    // form.tipoFormato = formatoSustento.descripcion_catalogo_item;

    this.sustentos.push(item);
    this.ELEMENTOS_TEMP_DATAGRID.push(item);
    this.dataSource = new MatTableDataSource(this.sustentos);
    this.workingAdd = false;
    this.limpiarProyecto();
    
  }

  cleanSections() {
      this.form.controls['idTipoFormato'].reset();
      this.form.controls['mostrarVistoProyecto'].reset();
      this.form.controls['idTipoDocumento'].reset();
      this.form.controls['numeroDocumentoSustento'].reset();
      this.form.controls['numeroFolios'].reset();
      this.form.controls['sumilla'].reset();
      this.form.controls['codigoAdjuntoSustento'].reset();
      this.form.controls['entidadEmisora'].reset();
      this.form.controls['fechaEmision'].reset();
      this.form.controls['adjuntarDocumento'].reset();
      this.fileComponent.forEach(c => c.eliminarDocumento());
      this.form.reset();

  }

  handleEliminar(row, index) {
    console.log("eliminar", row, index)
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE ELIMINAR EL DOCUMENTO DE SUSTENTO?', () => {
        this.sustentos.splice(index, 1);
        this.ELEMENTOS_TEMP_DATAGRID.splice(index, 1);
        this.dataSource = new MatTableDataSource(this.sustentos);
    }, () => { });
  }

  handleCancel = () => {
    this.matDialogRef.close();
  }

  handleSelectTab = (e) => {

    this.selectedTabIndex = e.index;
    // this.buscarPlazas();
  }

  handleGenerarProyecto = () => {
    
    const total = this.ELEMENTOS_TEMP_DATAGRID.length;

    if(this.form.value.idTipoResolucion == null) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }

    if (total == 0) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M124);
      return;
    }

    this.conteo = 0;
    this.conVistoProyecto = false;

    while(this.conteo < total) {
      const vistoProyecto = this.sustentos[this.conteo].vistoProyecto;
      if(vistoProyecto){
        this.conVistoProyecto = true;
        this.conteo = total;
      } else {
        this.conteo ++;
      }
    }
    
    if(this.conVistoProyecto == false) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M124);
      return;
    }

    
    
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GENERAR EL PROYECTO?', () => { 
      const form = this.form.value;
      const usuario = this.dataService.Storage().getPassportUserData();    
      debugger;
      this.dataService.Spinner().show("sp6");

      const data = {
        id_gestion_vinculacion: 0,
        oProyectoResolucion: {
          idTipoResolucion: form.idTipoResolucion,
          CodigoTipoResolucion: form.idTipoResolucion,
          usuarioCreacion: usuario.NOMBRES_USUARIO,
          documentosSustento: this.ELEMENTOS_TEMP_DATAGRID,
          codigoSistema: 4,//,this.CODIGO_SISTEMA,
          // listaIdAccionesGrabadas: accionesGrabadasIds,
          codigoTipoDocumentoIdentidad: this.propuesta.codigoTipoDocumentoIdentidad,
          numeroDocumentoIdentidad: this.propuesta.numeroDocumentoIdentidad,
          detalleConsiderando: this.CONSIDERANDO_TEMP_DATAGRID
        }

      }

      

        //---------- SE EJECUTA CUANDO SE INVOCA DESDE LA BANDEJA Y LA VINCULACION YA FUE CREADA --------------
      if (this.data.idGestionVinculacion != null && this.data.idGestionVinculacion > 0) {
        this.dataService.Spinner().show("sp6");
        //-- Validar si cuenta cuenta con diferencia en la data de plaza  
      this.dataService.AccionesVinculacion().getDiferencia(this.data.idGestionVinculacion).pipe(
        catchError(() => of(null))
      ).subscribe(response => {
        if (response) {          
          this.conDiferencia = response.validar_diferencia;

          if(this.conDiferencia) {
            this.dataService.Spinner().hide("sp6");
            let dialogRef = this.materialDialog.open(ModalDiferenciaPlazaComponent, {
              panelClass: 'Minedu-modal-diferencia-plaza-dialog',
                disableClose: true,        
                data: {
                  id_gestion_vinculacion: this.data.idGestionVinculacion,
                  enProceso : this.data.enProceso
                }
            });
            dialogRef.afterClosed().subscribe(data=>{
              debugger;
              console.log("data retorna de modal diferencia ",data);
              if(data.observar){
                this.matDialogRef.close();
              }               
            })
    
          } else {

            this.dataService.Spinner().show("sp6");
            data.id_gestion_vinculacion = this.data.idGestionVinculacion;
            this.GenerarProyecto(data);
    
          }

        } else {
          this.dataService.Message().msgWarning('"DATOS NO ENCONTRADOS PARA LA PLAZA INGRESADA."', () => { });
        }
      });

      return;

      } else {

      const dataVinculacionProyecto = {        
        oProyectoResolucion: {
          idTipoResolucion: form.idTipoResolucion,
          CodigoTipoResolucion: form.idTipoResolucion,
          usuarioCreacion: usuario.NOMBRES_USUARIO,
          documentosSustento: this.ELEMENTOS_TEMP_DATAGRID,
          codigoSistema: 4,//,this.CODIGO_SISTEMA,
          // listaIdAccionesGrabadas: accionesGrabadasIds,
          codigoTipoDocumentoIdentidad: this.propuesta.codigoTipoDocumentoIdentidad,
          numeroDocumentoIdentidad: this.propuesta.numeroDocumentoIdentidad,
          detalleConsiderando: this.CONSIDERANDO_TEMP_DATAGRID
        }
        
      }

      this.GenerarVinculacionProyecto(this.data.formDataVinculacion,dataVinculacionProyecto);
        //------------------- SE EJECUTA CUANDO SE DA CLICK AL CREAR LA VINCULACION ------------------------
        /*
      this.dataService.AccionesVinculacion().guardarNuevaGestionVinculacion(this.data.formDataVinculacion).subscribe(
        (responseIdVinculacion) => {
          this.dataService.Spinner().show("sp6");
          debugger 
          data.id_gestion_vinculacion = parseInt(responseIdVinculacion.toString())
          console.log("data proyecto resolucion", data)
          const formData = new FormData();
          this.appendFormData(formData, data, "");
          this.GenerarProyecto(data);          

        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6");
        }
      )  
      */

      }      
      
    });
    
  }

  GenerarProyecto(data){

    this.dataService.Spinner().show("sp6");

    const formData = new FormData();
        this.appendFormData(formData, data, "");

        this.dataService.AccionesVinculacion()
          .generarProyectoResolucionVinculacion(formData)
          .pipe(
            catchError((error) => {
              this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
                this.dataService.Spinner().hide("sp6");
                return of(null);
            }),
            finalize(() => { })
        )
          .subscribe((response: any) => {
              console.log("response mensaje de confirmacion", response)
              if (response != null) {                  
                    // this.dataService.Message().msgSuccess('Proyecto Generado Correctamente.', () => { this.handleCancelar({ reload: true }); });
                    this.dataService.Spinner().hide("sp6");
                    this.dataService.Message().msgAutoCloseSuccessNoButton('"PROYECTO GENERADO CORRECTAMENTE"', 3000, () => {
                      this.matDialogRef.close();
                      this.router.navigate(['ayni/personal/acciones/vinculacion']);
                    });                                   
              }                 
             
            },
            (error: HttpErrorResponse) => {                    
              this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
              this.dataService.Spinner().hide("sp6");
              console.log(error);
            }
            
            );
  }

  GenerarVinculacionProyecto(formData, data){

    this.dataService.Spinner().show("sp6");

    /*
    formData.append('oProyectoResolucion.idTipoResolucion', data.oProyectoResolucion.idTipoResolucion );
    formData.append('oProyectoResolucion.usuarioCreacion', data.oProyectoResolucion.usuarioCreacion );
    formData.append('oProyectoResolucion.documentosSustento', this.ELEMENTOS_TEMP_DATAGRID );
    formData.append('oProyectoResolucion.codigoSistema', data.oProyectoResolucion.codigoSistema );
    formData.append('oProyectoResolucion.codigoTipoDocumentoIdentidad', data.oProyectoResolucion.codigoTipoDocumentoIdentidad );
    formData.append('oProyectoResolucion.numeroDocumentoIdentidad', data.oProyectoResolucion.numeroDocumentoIdentidad );
    formData.append('oProyectoResolucion.detalleConsiderando', data.oProyectoResolucion.detalleConsiderando );
*/
    this.appendFormData(formData, data, "");
  
        this.dataService.AccionesVinculacion()
          .gestionVinculacionConProyecto(formData)
          .pipe(
            catchError((error) => {
              this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
                this.dataService.Spinner().hide("sp6");
                return of(null);
            }),
            finalize(() => { })
        )
          .subscribe((response: any) => {
              console.log("response mensaje de confirmacion", response)
              if (response != null) {                  
                    // this.dataService.Message().msgSuccess('Proyecto Generado Correctamente.', () => { this.handleCancelar({ reload: true }); });
                    this.dataService.Spinner().hide("sp6");
                    this.dataService.Message().msgAutoCloseSuccessNoButton('"PROYECTO GENERADO CORRECTAMENTE"', 3000, () => {
                      this.matDialogRef.close();
                      this.router.navigate(['ayni/personal/acciones/vinculacion']);
                    });                                   
              }                 
             
            },
            (error: HttpErrorResponse) => {                    
              this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
              this.dataService.Spinner().hide("sp6");
              console.log(error);
            }
            
            );
  }
  
  convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-')
  }
  

  appendFormData(formData, data, rootName) {            
    let root = rootName || "";
    if (data instanceof File) {
        formData.append(root, data);
    } else if (data instanceof Date) {
        formData.append(root, this.convertDate(data));
    } else if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            this.appendFormData(formData, data[i], root + "[" + i + "]");
        }
    } else if (typeof data === "object" && data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (root === "") {
                    this.appendFormData(formData, data[key], key);
                } else {
                    this.appendFormData(
                        formData,
                        data[key],
                        root + "." + key
                    );
                }
            }
        }
    } else {
        if (data !== null && typeof data !== "undefined") {
            formData.append(root, data);
        }
    }
}


  handleCancelar = (data?: any) => {
    this.matDialogRef.close(data);
  }

  adjunto = (FILE) => {
      // console.log("adjunto", pIdDocumento)
      // this.form.patchValue({ codigoAdjuntoSustento: pIdDocumento });
      if (FILE != null || FILE != undefined) {
        this.form.patchValue({ adjuntarDocumento: FILE.file });
    } else this.form.patchValue({ adjuntarDocumento: null });
  }

  agregarConsiderandoAGrillaTemporal = () => {
    if (this.formCons.valid) {

        const usuario = this.dataService.Storage().getPassportUserData();
        let item: tblGridConGrab = {
            seccion: this.seccion.toUpperCase(),
            tipoSeccion: this.tipoSeccion.toUpperCase(),
            idSeccion: 1,
            idtipoSeccion: 1,
            considerando: this.formCons.value.considerando,
            sangria: true,
            activo: true,
            fechaCreacion: new Date(),
            usuarioCreacion: usuario.NOMBRES_USUARIO,
            ipCreacion: "",
            fechaModificacion: new Date(),
        };
        console.log("seccion", item);
        this.CONSIDERANDO_TEMP_DATAGRID.push(item);
        this.limpiarConsiderando();
    }
    else {
        this.dataService.Message()
            .msgWarning('.', () => { });
        return;
    }

  }
  limpiarConsiderando() {
      this.formCons.controls['considerando'].reset();

  };
  quitarElementoConsiderandoDeGrillaTemporal(index) {
      this.CONSIDERANDO_TEMP_DATAGRID.splice(index, 1);
  }

  loadTipoDocumentoSustento = () => {
    let request = {
      codigoCatalogo: 20
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        const data = response.map((x) => ({
          ...x,
          value: x.id_catalogo_item,
          label: `${x.descripcion_catalogo_item}`,
        }));
        this.comboLists.listTipoDocumento = data;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  /*
  loadTipoResolucion = () => {
    let request = {
      codigoCatalogo: 4
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        const data = response.map((x) => ({
          ...x,
          value: x.id_catalogo_item,
          label: `${x.descripcion_catalogo_item}`,
        }));
        this.comboLists.listTipoResolucion = data;

        console.log('tiposResolucion => ', data);
        console.log('tiposResolucion 2=> ', this.comboLists.listTipoResolucion);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }*/

  loadTipoResolucion = async () => {

    const request = {
      idDre: this.cabeceraAccion.idDre,
      idUgel: this.cabeceraAccion.idUgel
    };

    var response = await this.dataService.AccionesVinculacion().getCatalogoTipoResolucion(request).toPromise();
    if (response) {
      const data = response.map((x) => ({
        ...x,
        value: x.id_catalogo_item,
        label: `${x.descripcion_catalogo_item}`,
      }));
      this.comboLists.listTipoResolucion = data;

      this.comboLists.listTipoResolucion.unshift({
        codigo_catalogo_item: -1,
        descripcion_catalogo_item: '--SELECCIONE--'
      })

    }
  }

  

  loadTipoFormato = () => {
    let request = {
      codigoCatalogo: 33
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        const data = response.map((x) => ({
          ...x,
          value: x.id_catalogo_item,
          label: `${x.descripcion_catalogo_item}`,
        }));
        this.comboLists.listTipoFormato = data;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  handleMostrarAdjunto(fileTEMP) {
    console.log("Mostrar pdf", fileTEMP);
    this.handlePreview(fileTEMP, fileTEMP.name);
  }

  handlePreview(file: any, codigoAdjuntoAdjunto: string) {
    console.log("mostrar pDF 2", file)
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: "modal-viewer-form-dialog",
        disableClose: true,
        data: {
            modal: {
                icon: "remove_red_eye",
                title: "Accion Grabada",
                file: file,
                fileName: codigoAdjuntoAdjunto,
            },
        },
    });

    this.dialogRef.afterClosed().subscribe((response: any) => {
        if (!response) {
            console.log('close modal', response);
        }
    });
  }

  handleVerInfoDocSustento(row) {
    this.dialogRef = this.materialDialog.open(VerInformacionSustentoComponent, {
      panelClass: 'modal-ver-informacion-dialog',
      disableClose: true,
      data: {
        info: row
      }
    })
  }

  handleAdjunto = (data) => {

  }
  agregarAGrillaTemporal = () => {
    // if (this.form.valid) {
    //   const usuario = this.dataService.Storage().getPassportUserData();
    //   let item: tblGridAccGrab = {
    //     tipoDocumentoSustento: this.tiposDocumentoSustento.filter(
    //         (ds) =>
    //             ds.idCatalogoItem ==
    //             this.form.value.idTipoDocumentoSustento
    //     )[0].descripcionCatalogoItem,
    //     tipoFormatoSustento: this.tiposFormatoSustento.filter(
    //         (ts) =>
    //             ts.idCatalogoItem ==
    //             this.form.value.idTipoFormatoSustento
    //     )[0].descripcionCatalogoItem,
    //     idDocumentoSustento: 0,
    //     idAccionGrabada: 0, //this.ACCIONES_GRABADAS_IDS[0].idAccionGrabada, --DEBE RECUPERAR EN EL BACK AL GUARDAR
    //     idTipoResolucion: 0 /*este item se llenara al final cuando se envie la lista final, ya que es 1 resolucion por el bloque*/,
    //     idTipoDocumentoSustento:
    //         this.form.value.idTipoDocumentoSustento,
    //     idTipoFormatoSustento: this.form.value.idTipoFormatoSustento,
    //     numeroDocumentoSustento:
    //         this.form.value.numeroDocumentoSustento,
    //     entidadEmisora: this.form.value.entidadEmisora,
    //     fechaEmision: this.form.value.fechaEmision,
    //     numeroFolios: this.form.value.numeroFolios,
    //     sumilla: this.form.value.sumilla,
    //     codigoDocumentoSustento: "", //this.form.value.adjuntarDocumento,
    //     vistoProyecto:
    //         this.form.value.vistoDeProyecto == "1" ? true : false,
    //     activo: true,
    //     fechaCreacion: new Date(),
    //     usuarioCreacion: usuario.NOMBRES_USUARIO,
    //     ipCreacion: "",
    //     fechaModificacion: new Date(),
    //     archivoSustento: this.form.value.adjuntarDocumento,
    //     nombreArchivoSustento: this.form.value.adjuntarDocumento.name,
    //   };
    //   this.ELEMENTOS_TEMP_DATAGRID.push(item);
    //   console.log('ELEMENTOS 25/02/2022', this.ELEMENTOS_TEMP_DATAGRID);
    //   this.limpiar();
    // } else {
    //   this.dataService
    //       .Message()
    //       .msgWarning(
    //           "DEBE INGRESAR TODOS LOS CAMPOS OBLIGATORIOS.",
    //           () => {}
    //       );
    //   return;
    // }
    
  }
  guardarDocumentoSustentoYGenerarProyectoResolucion = () => {

  }
}



export interface tblGridAccGrab {

  tipoDocumentoSustento: string,
  tipoFormatoSustento: string,

  idTipoResolucion: number,
  idDocumentoSustento: number,
  idAccionGrabada: number,
  idTipoDocumentoSustento: number,
  idTipoFormatoSustento: number,
  numeroDocumentoSustento: string,
  entidadEmisora: string,
  fechaEmision: Date,
  numeroFolios: number,
  sumilla: string,
  codigoDocumentoSustento: string,
  vistoProyecto: boolean,
  DetallevistoProyecto: string,
  activo: boolean,
  fechaCreacion: Date,
  usuarioCreacion: string,
  ipCreacion: string,
  fechaModificacion?: Date,
  usuarioModificacion?: string,
  ipModificacion?: string

  archivoSustento: File;
  nombreArchivoSustento: string;
}

export interface tblGridConGrab {

  seccion: string,
  tipoSeccion: string,
  idSeccion: number,
  idtipoSeccion: number,
  considerando: string,
  sangria: boolean,
  activo: boolean,
  fechaCreacion: Date,
  usuarioCreacion: string,
  ipCreacion: string,
  fechaModificacion?: Date,
  usuarioModificacion?: string,
  ipModificacion?: string
}