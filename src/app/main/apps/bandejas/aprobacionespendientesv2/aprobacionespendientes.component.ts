import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation, } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "app/core/data/data.service";
import { forkJoin } from "rxjs";
import { SelectionModel, DataSource, CollectionViewer, } from "@angular/cdk/collections";
import { catchError, finalize, takeUntil, filter, find } from "rxjs/operators";
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { mineduAnimations } from "@minedu/animations/animations";
import { GlobalsService } from "app/core/shared/globals.service";
import { StorageService } from "app/core/data/services/storage.service";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MISSING_TOKEN, TablaCodigoSistemas, TablaEquivalenciaSede, TablaNivelInstancia, TablaPermisos } from "app/core/model/types";
import { DatePipe } from "@angular/common";
import { HistorialComponent } from "./historial/historial.component";
import { MotivorechazoComponent } from "./motivorechazo/motivorechazo.component";
import { PASSPORT_MESSAGE } from "app/core/model/message";
import { ActivatedRoute, Router } from '@angular/router';
import { TablaAccionesPassport } from "app/core/model/action-types";
import { TablaFuncionalidad, TablaMetodosAprobados } from "app/core/model/types-aprobaciones";
import { LocalStorageService } from "@minedu/services/secure/local-storage.service";
import { threadId } from "worker_threads";

import { TablaMetodosAdecuacion } from "app/core/model/types-adecuacion";
import { ModalRechazoComponent } from "./Components/modal-rechazo/modal-rechazo.component";

@Component({
    selector: "minedu-aprobacionespendientes",
    templateUrl: "./aprobacionespendientes.component.html",
    styleUrls: ["./aprobacionespendientes.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class AprobacionespendientesComponent implements OnInit, AfterViewInit {
    form: FormGroup;
    mostrarFuncionalidad: boolean = false;
    mostrarInstancia: boolean = false;
    mostrarSubinstancia: boolean = false;
    //minDate: Date = new Date();
    minDate = new Date("July 21, 1980 01:15:00");
    maxDate: Date = new Date();
    datos : any;
    codigoRol : string;
    codigoTipoSede : string;
    tieneRetorno: boolean = false;

    modulos: any[] = [];
    procesos: any[] = [];
    instancias: any[] = [];
    subInstancias: any[] = [];
    estadosAprobadores: any[] = [];
    estadosPermisos: any[] = [];
    objetoFormulario: any = {};

    tienePermisoConsultar: boolean = false;
    tienePermisoAgregar: boolean = false;
    tienePermisoActualizar: boolean = false;
    tienePermisoEliminar: boolean = false;
    tienePermisoExpotar: boolean = false;
    
    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    dialogRef: any;

    data: any = {
        idNivelInstancia: null,
        idOtraInstancia: null,
        idDre: null,
        idUgel: null,
        idRolPassport : null
    };

    saveRequest: any;
    displayedColumns: string[] = [
        "registro",
        "descripcionProcesoAprobacion",
        "nivelAprobacion",
        "instanciaSolicitante",
        "subinstanciaSolicitante",
        "tipoDocumentoSolicitante",
        "numeroDocumentoIdentidadSolicitante",
        "fechaSolicitud",
        "instanciaAprobador",
        "subInstanciaAprobador",
        "fechaAprobacionRechazo",
        "estadoAprobacion",
        "acciones",
    ];

    dataSource: EtapasAprobadoresDataSource | null;
    selection = new SelectionModel<any>(true, []);
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    constructor(
        public globals: GlobalsService,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        public datepipe: DatePipe,
        private storageService: StorageService,
        private router: Router,
        private route: ActivatedRoute,
        private localStorageService: LocalStorageService
    ) {
        this.route.paramMap.subscribe(params => { this.datos = params; });  
        this.form = this.formBuilder.group({
            idModulo: [""],
            modulo: [""],
            idProcesoAprobacion: [""],
            idInstancia: [""],
            idSubinstancia: [""],
            idEstado: [""],
            fechaIni: [""],
            fechaFin: [""],
        });
        this.form.get("fechaIni").valueChanges.subscribe((value) => { if (value) {this.minDate = value; } });
        this.form.get("fechaFin").valueChanges.subscribe((value) => { if (value) {this.maxDate = value; } });
     }

    ngOnInit(): void {
       
  
        this.passport(this.datos);
     
        this.tienePermisoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
        this.tienePermisoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.tienePermisoActualizar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.tienePermisoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.tienePermisoExpotar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Exportar);

        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }

        this.dataSource = new EtapasAprobadoresDataSource(this.dataService, this.globals);
        
    }

    fnRenderCustom(request : any ,codigoTipoSede : string){
        const buscar = this.localStorageService.getItem('search');
        const idNivelInstancia = parseInt(request.idNivelInstancia);
        const idRolPassport = request.idRolPassport;


        if(buscar !== null){
            this.tieneRetorno = true;
            
            const objeto = JSON.parse(buscar);

            if( (idNivelInstancia === TablaNivelInstancia.MINEDU || idNivelInstancia === TablaNivelInstancia.DRE) && objeto.idSubinstancia !== null   ){
                    
                const dataUgel : any ={
                    idRolPassport : idRolPassport,
                    idInstancia: objeto.idInstancia,
                    idSubinstancia : objeto.idSubinstancia,
                    codigoTipoSede : codigoTipoSede           
                };

                forkJoin( [this.dataService.Aprobacion().listarSubInstancias(dataUgel)]
                ).subscribe(async (response: Array<any>) => {
                    this.subInstancias =  await response[0];

                    const request = {
                        idModulo: objeto.idModulo,
                        idProcesoAprobacion: objeto.idFuncionalidad,
                        idInstancia: objeto.idInstancia,
                        idSubinstancia: objeto.idSubinstancia,
                        idEstado: objeto.idEstadoAprobacion === null ? "" : objeto.idEstadoAprobacion,
                        fechaIni: objeto.fechaInicio,
                        fechaFin: objeto.fechaFin
                      };          
                      
                      this.objetoFormulario = request;
                      this.buscar();
                });  
            } 
            else{
                const request = {
                    idModulo: objeto.idModulo,
                    idProcesoAprobacion: objeto.idFuncionalidad,
                    idEstado: objeto.idEstadoAprobacion === null ? "" : objeto.idEstadoAprobacion,
                    fechaIni: objeto.fechaInicio,
                    fechaFin: objeto.fechaFin
                };
                
                this.objetoFormulario = request;
                this.buscar();
            }
        }        
    }



    passport(urlPametros : any) {
        const rol = this.dataService.Storage().getPassportRolSelected();
        const usuario = this.dataService.Storage().getPassportUserData();

       this.codigoRol = rol.CODIGO_ROL;
       this.codigoTipoSede = rol.CODIGO_TIPO_SEDE;

        if (rol.CODIGO_TIPO_SEDE === TablaEquivalenciaSede.CODIGO_TIPO_SEDE)
            rol.CODIGO_SEDE = TablaEquivalenciaSede.CODIGO_SEDE;
      
       this.dataService.Aprobacion().entidadPassport(rol.CODIGO_SEDE).pipe(catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe(async (response: any) => {  
            if (await response) { 
                this.data.idNivelInstancia = await response.idNivelInstancia;
                this.data.idOtraInstancia = await response.idOtraInstancia;
                this.data.idDre = await response.idDre;
                this.data.idUgel = await response.idUgel;
                this.data.idRolPassport = rol.CODIGO_ROL;
                this.storageService.setCurrentSession(this.data);
                this.initControls(this.data ,urlPametros ,rol.CODIGO_TIPO_SEDE);
            }else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
            }
        });
    }

    initControls(request :any , urlPametros :any ,codigoTipoSede : string) {
        const dataDre : any ={
            idRolPassport : request.idRolPassport,
            idDre: request.idDre,
            codigoTipoSede : codigoTipoSede  
        };

        const dataUgel : any ={
            idRolPassport : request.idRolPassport,
            idInstancia: request.idDre ,
            idSubinstancia : request.idUgel, 
            codigoTipoSede : codigoTipoSede           
        };

        forkJoin(
            [this.dataService.Aprobacion().listarSistemas(true),
             this.dataService.Aprobacion().listarEstadosAprobadores(true),
             this.dataService.Aprobacion().listarInstancias(dataDre),
             this.dataService.Aprobacion().listarSubInstancias(dataUgel),
            ]
        ).subscribe(async (response: Array<any>) => {

            this.modulos = await response[0];
            var modulo = this.modulos.find(x => x.codigo === TablaCodigoSistemas.PERSONAL);

            this.form.controls['idModulo'].setValue(modulo.id);
            this.form.controls['modulo'].setValue(modulo.descripcion);
            this.form.controls['modulo'].disable();
            this.listarFuncionalidades(modulo.id); 


            this.estadosAprobadores = await response[1];
            this.instancias = await response[2];
            this.subInstancias =  await response[3];
        
            switch (parseInt(request.idNivelInstancia)) {
                case TablaNivelInstancia.MINEDU: {
                    this.form.controls['idInstancia'].enable();
                    this.form.controls["idSubinstancia"].enable();            
                    break;
                }
                case TablaNivelInstancia.DRE: {                
                    this.form.controls['idInstancia'].disable();
                    this.form.controls["idSubinstancia"].enable();
                    this.form.patchValue({
                        idInstancia : request.idDre
                    });
                    break;
                }
                case TablaNivelInstancia.UGEL: {
                    this.form.controls['idInstancia'].disable();
                    this.form.controls["idSubinstancia"].disable();                   
                    this.form.patchValue({
                        idInstancia : request.idDre,
                        idSubinstancia : request.idUgel
                    });
                    break;
                }
            }

            this.fnRenderCustom(request ,codigoTipoSede);          
        });
         
       
    }

    buscar() {        
        
        this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosAprobados.GET_CONSULTAR_GRID);;
    }


    consultarInformacion() {
        
        const data = this.form.getRawValue();
        const usuario = this.dataService.Storage().getPassportUserData();
        const rol = this.dataService.Storage().getPassportRolSelected();
        let request = {};
        this.datepipe.transform(this.form.value.fechaIni, "yyyy-mm-dd");
        
        if(!this.tieneRetorno){
            request = {
                idModulo: this.form.value.idModulo == "" ? null : this.form.value.idModulo,
                idFuncionalidad: this.form.value.idProcesoAprobacion == "" ? null : this.form.value.idProcesoAprobacion,
                idInstancia: data.idInstancia == "" ? null : data.idInstancia,
                idSubinstancia: this.form.value.idSubinstancia == "" ? null : data.idSubinstancia,
                idEstadoAprobacion: this.form.value.idEstado == "" ? null : this.form.value.idEstado,
                fechaInicio: this.form.value.fechaIni == null ? null : this.datepipe.transform(this.form.value.fechaIni, "yyyy-MM-dd 00:00:00"),
                fechaFin: this.form.value.fechaFin == null ? null : this.datepipe.transform(this.form.value.fechaFin, "yyyy-MM-dd 23:59:00"),
                codigoTipoSedeUsuario: rol.CODIGO_TIPO_SEDE,
                codigoRolPassportUsuario: rol.CODIGO_ROL,
                numeroDocumentoUsuario: usuario.NUMERO_DOCUMENTO,
                paginaActual : this.paginator.pageIndex + 1,
                tamanioPagina : this.paginator.pageSize
            };
        }else{
            
            request = JSON.parse(this.localStorageService.getItem('search'));
            this.localStorageService.removeItem('search');
        } 

        this.saveRequest = request;
        this.dataSource = new EtapasAprobadoresDataSource(this.dataService, this.globals);
        this.dataSource.load(request);
        this.dataService.Spinner().hide("sp6");
        if(this.tieneRetorno)this.form.patchValue(this.objetoFormulario);
    }

    filtros(idAprobacion : number) {
        const data = this.form.getRawValue();
        const usuario = this.dataService.Storage().getPassportUserData();
        const rol = this.dataService.Storage().getPassportRolSelected();

        this.datepipe.transform(this.form.value.fechaIni, "yyyy-mm-dd");
        var request = {
            idModulo: this.form.value.idModulo == "" ? "" : this.form.value.idModulo,
            idFuncionalidad: this.form.value.idProcesoAprobacion == "" ? "" : this.form.value.idProcesoAprobacion,
            idInstancia: data.idInstancia == "" ? "" : data.idInstancia,
            idSubinstancia: this.form.value.idSubinstancia == "" ? "" : this.form.value.idSubinstancia,
            idEstadoAprobacion: this.form.value.idEstado == "" ? "" : this.form.value.idEstado,
            fechaInicio: this.form.value.fechaIni == null ? "" : this.datepipe.transform(this.form.value.fechaIni, "yyyy-MM-dd 00:00:00"),
            fechaFin: this.form.value.fechaFin == null ? "" : this.datepipe.transform(this.form.value.fechaFin, "yyyy-MM-dd 23:59:00"),
            codigoTipoSedeUsuario: rol.CODIGO_TIPO_SEDE,
            codigoRolPassportUsuario: rol.CODIGO_ROL,
            numeroDocumentoUsuario: usuario.NUMERO_DOCUMENTO,
            paginaActual : this.paginator.pageIndex + 1 ,
            tamanioPagina : this.paginator.pageSize,
            idAprobacion :idAprobacion
        };
        return request;
    }

    limpiar() {
        this.form.clearValidators();
        //this.mostrarFuncionalidad = false;
        this.form.patchValue({
            idProcesoAprobacion: '',
            idEstado: '',
            idInstancia: this.data.idDre === 0 ? '' : this.data.idDre,
            idSubinstancia: this.data.idUgel === 0 ? '' : this.data.idUgel
        });
        
        this.form.controls['fechaIni'].reset();
        this.form.controls['fechaFin'].reset();

        this.minDate = new Date("July 21, 1980 01:15:00");
        this.maxDate = new Date();

        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }

        this.dataSource = new EtapasAprobadoresDataSource(this.dataService, this.globals);

    }

    listarFuncionalidades(idModulo) {
        this.dataService.Aprobacion().listarFuncionalidades(idModulo)
            .subscribe((response) => {
                if (response) {
                    this.procesos = response;
                    this.form.patchValue({ idProcesoAprobacion: "", });
                    this.mostrarFuncionalidad = true;
                } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    }

    listarSubInstancias(idInstancia: any) {
       const data : any ={
            idRolPassport : this.data.idRolPassport,
            idInstancia: idInstancia ,
            idSubinstancia : this.data.idUgel,
            codigoTipoSede : this.codigoTipoSede         
        };

            this.dataService.Aprobacion().listarSubInstancias(data)
                .subscribe(async (response) => {
                    if (await response) {
                        this.subInstancias = await response;
                        this.form.patchValue({ idSubinstancia: "", });
                        this.mostrarSubinstancia = true;
                    } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                    }
          });
      
    }

    listarEtapasAprobaciones(idInstancia: any) {
        var data : any ={
            idInstancia: this.data.idDre ,
            idSubinstancia : idInstancia,
            idRolPassport : this.data.idRolPassport
        }
        
        this.dataService.Aprobacion().listarSubInstancias(data).subscribe((response) => {
             if (response) {
                     this.subInstancias = response;
                     this.form.patchValue({
                     idSubinstancia: "",
                   });
                        this.mostrarSubinstancia = true;
               } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
               this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
             }
         });
        
    }

    ngAfterViewInit() {
        this.paginator.page.subscribe(() => this.buscar());
    }

    ver(registro) {
        if (!this.tienePermisoConsultar) {
            this.dataService.Util().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
            return;
        }

        this.dataService.Aprobacion().motivoRechazoEtapaAprobacion(registro.idEtapaAprobacion)
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.materialDialog.open(MotivorechazoComponent, {
                        panelClass: "dialog-motivorechazo",
                        width: "500px",
                        disableClose: true,
                        data: {
                            motivoRechazo: response.data,
                        },
                    });
                } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }

            });
    }
    abrir(registro) {   
        let obj = this.filtros( registro.idAprobacion);
        this.localStorageService.setItem('search', JSON.stringify(this.saveRequest));
        if(registro.link){
            const array = registro.link.split("/")
            const esAdecuacion = array.includes("adecuacion");
            let data = [];
            if(esAdecuacion){
                // array[4] = array[4]+"E";
                array[4] = array[4];
                data=array;
            }
            else{
                //  data = (registro.link+"E").split("/");
                 data = (registro.link).split("/");
            }
            
            this.router.navigate(data);
        }
        
    }

    consulta(registro) {        
      let obj = this.filtros( registro.idAprobacion);
    
      this.router.navigate(["consultaestadoaprobacion" ,obj], {
        relativeTo: this.route,
        skipLocationChange: true
       });

    }

    historial(registro) {
        if (!this.tienePermisoConsultar) {
            this.dataService.Util().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
            return;
        }

        this.dataService.Aprobacion().historialEtapaAprobacion(registro.idAprobacion)
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.materialDialog.open(HistorialComponent, {
                        panelClass: "dialog-historial",
                        width: "800px",
                        disableClose: true,
                        data: {
                            historial: response.data,
                        },
                    });
                } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                }
            });
    }

    exportar() {
        this.obtenerClavePublica(TablaAccionesPassport.Exportar, true, TablaMetodosAprobados.EXPORTAR);;
    }

    exportarAprobaciones(){
        
        if(this.dataSource.totalregistro <= 0) {
            this.dataService.Message().msgWarning("NO EXISTEN DATOS PARA EXPORTAR.", () => { });
            return;
        }

        if (!this.tienePermisoExpotar) {
            this.dataService.Util().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
            return;
        }

        this.dataService
            .Aprobacion().exportarEtapasAprobaciones(this.saveRequest)
            .pipe(
                catchError((error) => {
                    this.dataService.Util().msgWarning("HUBO UN ERROR AL EXPORTAR EL LISTADO.", () => { });
                    return of(null) ;
                }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                 })
            )
            .subscribe((response) => {
                
                const nombreFile: string = "permisoAprobadores.xlsx";
                const blobFile = this.globals.b64toBlob(response.archivo, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                this.dataService.Aprobacion().downloadFile(blobFile, nombreFile);
            });
    }

    mostrarOpciones(instancia, subinstancia) {
        this.mostrarInstancia = instancia;
        this.mostrarSubinstancia = subinstancia;
    }
    mensajeWarning(mensaje: string) {
        this.dataService.Util().msgWarning(mensaje, () => {});
    }

    desaprobarAprobacion(registro:any){
      
      this.dataService.Spinner().show("sp6");
      const CodigoAprobacionAdecuacionRequest : any ={
         codigoProcesoAprobacion : registro.codigoAprobacion,
      };

      if(registro.codigoFuncionalidad === TablaFuncionalidad.ADECUACION_POR_RACIONALIZACION ){
        
        this.dataService.PlazaAdecuacion().validacionCodigoApropacion(CodigoAprobacionAdecuacionRequest).pipe(catchError(() => of([])),
            finalize(() => { 
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe(async (response: any) => {  
            if (await response) { 
               
                var respuestaAdecuacion = await response;
                 if(respuestaAdecuacion.estado === true){
                    this.desaprobar(registro , respuestaAdecuacion.plazaPropuestas);
                 }
                 else{
                    this.dataService.Util().msgWarning(respuestaAdecuacion.message, () => { });
                 }              
               
          } else if (response && response.code === 404) {
            this.dataService.Util().msgWarning(response.message, () => { });
          } else if (response && response.code === 422) {
            this.dataService.Util().msgWarning(response.message, () => { });
          } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
          }
        });

      }
      else{

        this.dataService.PlazaReubicacion().validacionCodigoApropacion(CodigoAprobacionAdecuacionRequest).pipe(catchError(() => of([])),
            finalize(() => { 
                this.dataService.Spinner().hide("sp6");
            })
            )
            .subscribe(async (response: any) => {  
                if (await response) { 
                
                    var respuestaReubicacion = await response;
                    if(respuestaReubicacion.estado === true){
                        this.desaprobar(registro , respuestaReubicacion.plazaPropuestas);
                    }
                    else{
                        this.dataService.Util().msgWarning(respuestaReubicacion.message, () => { });
                    }              
                
            } else if (response && response.code === 404) {
                this.dataService.Util().msgWarning(response.message, () => { });
            } else if (response && response.code === 422) {
                this.dataService.Util().msgWarning(response.message, () => { });
            } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
            }
            });

      }       

    }


    desaprobar(registro:any ,propuesta: any){
        
        this.dialogRef = this.materialDialog.open(ModalRechazoComponent, {
            panelClass: 'modal-rechazo-dialog',
            disableClose: true,
            data: null
          });
      
          this.dialogRef.afterClosed()
            .subscribe((response: any) => {
              if (!response) { return; }
      
              const usuario = this.dataService.Storage().getPassportUserData();
              const rol = this.dataService.Storage().getPassportRolSelected();

            if(registro.codigoFuncionalidad === TablaFuncionalidad.ADECUACION_POR_RACIONALIZACION )
              {
                let data = {
                    idPropuestaAdecuacion: propuesta.idPropuesta,
                    aprobado: false,
                    usuarioCreacion: usuario.NOMBRES_USUARIO,
                    link: "",
                    codigoTipoDocumentoIdentidad: usuario.ID_TIPO_DOCUMENTO_ENUM,
                    numeroDocumentoIdentidad: usuario.NUMERO_DOCUMENTO,
                    motivoRechazo: response.motivoRechazo,
                    idRol: rol.ID_ROL,
                    codigoRol: rol.CODIGO_ROL,
                    codigoSede: rol.CODIGO_SEDE,
                    esAprobado: true
                  }    
                this.obtenerClavePublica(TablaAccionesPassport.Aprobar, true, TablaMetodosAprobados.RECHAZAR_ADECUACION, data);
              }else{
                let data = {
                    idPropuestaReubicacion: propuesta.idPropuesta,
                    aprobado: false,
                    usuarioCreacion: usuario.NOMBRES_USUARIO,
                    link: "",
                    tipoDocumento: usuario.ID_TIPO_DOCUMENTO_ENUM,
                    numeroDocumento: usuario.NUMERO_DOCUMENTO,
                    motivoRechazo: response.motivoRechazo,
                    idRol: rol.ID_ROL,
                    codigoRol: rol.CODIGO_ROL,
                    codigoSede: rol.CODIGO_SEDE,
                    esAprobado: true
                  }    
                this.obtenerClavePublica(TablaAccionesPassport.Aprobar, true, TablaMetodosAprobados.RECHAZAR_REUBICACION, data);
              }
              
            });
    }

    private handleRechazarAdecuacion(parametro:any) {
        this.dataService.PlazaAdecuacion().rechazar(parametro)
          .pipe(
            catchError((e) => { return of(e); }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
          ).subscribe(response => {
            if (response && response.result) {
                this.buscar();
              this.dataService.Message().msgSuccess("SE RECHAZÓ CORRECTAMENTE LA PROPUESTA DE ADECUACIÓN.", () => { });
            } else if (response && (response.code === 422 || response.code === 404)) {
              this.dataService.Message().msgWarning(response.message, () => { });
            } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
              this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
            } else {
              this.dataService.Message().msgWarning('NO SE PUDO RECHAZAR LA PROPUESTA ADECUACIÓN.', () => { });
            }
          });
      }

      private handleRechazarReubicacion(parametro:any) {
        this.dataService.PlazaReubicacion().Rechazar(parametro)
          .pipe(
            catchError((e) => { return of(e); }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
          ).subscribe(response => {
            if (response && response.result) {
                this.buscar();
              this.dataService.Message().msgSuccess("SE RECHAZÓ CORRECTAMENTE LA PROPUESTA DE ADECUACIÓN.", () => { });
            } else if (response && (response.code === 422 || response.code === 404)) {
              this.dataService.Message().msgWarning(response.message, () => { });
            } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
              this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
            } else {
              this.dataService.Message().msgWarning('NO SE PUDO RECHAZAR LA PROPUESTA ADECUACIÓN.', () => { });
            }
          });
      }


    obtenerClavePublica(operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosAprobados, param?: any) {
        
        this.dataService.Spinner().show("sp6");
        this.dataService.Passport().boot().pipe(
          catchError(() => of(null))
        ).subscribe((response: any) => {
          if (response) {
            
            // const d = JSON.parse(response);
            this.confirmarOperacion(response.Token, operacion, requiredLogin, method, param);
          } else {
            this.dataService.Spinner().hide("sp6");
            if (!requiredLogin) { this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => { }); }
            else { this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); }); }
            return;
          }
        });
      }
    
    confirmarOperacion(token: any, operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosAprobados, parametro?: any) {
        
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
            
            if (data.ESTA_AUTORIZADO) {
                
              switch (method) {
                case TablaMetodosAprobados.GET_CONSULTAR_GRID: {
                    
                   this.consultarInformacion();
                   break;
                }
                case TablaMetodosAprobados.EXPORTAR: {
                    
                    this.exportarAprobaciones();
                    break;
                  }
                  case TablaMetodosAprobados.RECHAZAR_ADECUACION: {
                    this.handleRechazarAdecuacion(parametro);
                    break;
                  }
                  case TablaMetodosAprobados.RECHAZAR_REUBICACION: {
                    this.handleRechazarReubicacion(parametro);
                    break;
                  }
              }
            } else {
                
              this.dataService.Spinner().hide("sp6");
              if (!requiredLogin) { this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => { }); }
              else { this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); }); }
              return;
            }
          } else {
            
            this.dataService.Spinner().hide("sp6");
            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); });
          }
        });
    }

}

export class EtapasAprobadoresDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService, private globals: GlobalsService) {
        super();
    }

    load(data: any): void {
        this._loadingChange.next(false);
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Aprobacion()
            .listarEtapasAprobaciones(data)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this._loadingChange.next(false)
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe(async (response: any) => {
                
                if (await response) {
                    console.log(response.data);
                    this._dataChange.next(response || []);
                    this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistro;
                    this.globals.onPanel("panel-aprobacionespendientes");
                    if ((response || []).length === 0) {
                        this.dataService.Message().msgWarning("NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.", () => { });
                    }
                } else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                } else {
                    this._dataChange.next([]);
                    this.totalregistro = 0;
                    this.dataService.Message().msgWarning("NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.",() => { });
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
