import { SelectionModel } from '@angular/cdk/collections';
import { HttpParams } from '@angular/common/http';
import { AfterContentInit, AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaPermisos } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BuscarCentroTrabajoComponent } from '../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BuscarPersonaComponent } from '../components/buscar-persona/buscar-persona.component';
import { BusquedaPlazaComponent } from '../components/busqueda-plaza/busqueda-plaza.component';
import { GenerarProyectoComponent } from '../components/generar-proyecto/generar-proyecto.component';
import { CentroTrabajoEnum, RegimenLaboralEnum, TipoFormatoPlazaEnum } from '../_utils/constants';
import { BeneficioDataSource } from './DataSource/BeneficioDataSource';

@Component({
  selector: 'minedu-bandeja-beneficio',
  templateUrl: './bandeja-beneficio.component.html',
  styleUrls: ['./bandeja-beneficio.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BandejaBeneficioComponent implements OnInit, AfterContentInit  {

  constructor(
    private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog
  ) { }
/**
 * Sección Básica
 */
    /**
     * Variables */
    
    form: FormGroup;
    loading=  true;
    isMobile = false;
    currentSession: SecurityModel = new SecurityModel();
    hasAccessPage: boolean;
    permisoSession={
        agregar:false,
        modificar:false,
        eliminar:false,
        exportar:false
    }
    request:HttpParams;
    //  = {
    //     anio: null,
    //     idRegimenLaboral: null,
    //     idAccion: null,
    //     idMotivoAccion: null,
    //     mandatoJudicial: null,
    //     idTipoDocumentoIdentidad: null,
    //     numeroDocumentoIdentidad: null,
    //     codigoPlaza:null,
    //     idCategoriaRemunerativa:null,
    //     codigoModular:null,
    //     idEstado:null,
    //     codigoRol:null,
    //     codigoSede:null,
    //     codigoTipoSede:null,
    //   };
      requestExportar :HttpParams;
    //   = {
    //     anio: null,
    //     idRegimenLaboral: null,
    //     idAccion: null,
    //     idMotivoAccion: null,
    //     mandatoJudicial: null,
    //     idTipoDocumentoIdentidad: null,
    //     numeroDocumentoIdentidad: null,
    //     codigoPlaza:null,
    //     idCategoriaRemunerativa:null,
    //     codigoModular:null,
    //     idEstado:null,
    //     codigoRol:null,
    //     codigoSede:null,
    //     codigoTipoSede:null,
    //   };
      panelOpenState:boolean = false;
    /**
     * Métodos */
  ngOnInit() {
    setTimeout(() => this.buildShared());
    this.buildSeguridad();
    this.buildGrid();
    this.buildForm();
    this.handleResponsive();
    this.resetForm();
    this.initializeComponent();
    if (this.hasAccessPage) {
        this.loadCombos();
        this.loadTable(true);
    }else{
        this.dataService.Message().msgInfo(
            "NO CUENTA CON PERMISOS REQUERIDOS", () => {
            this.handleHome();
        });
    }
  }
  buildShared() {
    this.sharedService.setSharedTitle('Acción de personal: Beneficios');
    this.sharedService.setSharedBreadcrumb('Accion Beneficio');
}
buildForm() {
    this.form = this.formBuilder.group({
        codigoRol :[null],
        codigoSede :[null],
        codigoTipoSede :[null],
        anio: [null, Validators.required],
        idRegimenLaboral: [null],
        idAccion:[null],
        idMotivoAccion:[null],
        mandatoJudicial:[null],
        idTipoDocumentoIdentidad:[null],
        tipoDocumentoIdentidad:[null],
        numeroDocumentoIdentidad:[null],
        codigoPlaza:[null],
        paginaActual:[null],
        tamanioPagina:[null],
        codigoCentroTrabajo:[null],
        idCategoriaRemunerativa:[null],
        codigoModular:[null],
        idEstado:[null],
        
    });
    this.form.patchValue({
        codigoRol: this.currentSession.codigoRol,
        codigoSede: this.currentSession.codigoSede,
        codigoTipoSede: this.currentSession.codigoTipoSede,
      });
}
handleResponsive() {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
        this.isMobile = this.getIsMobile();
    };
}
buildSeguridad() {
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    console.log('this.currentSession',this.currentSession);
    
   
    this.hasAccessPage = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Acceder);

    this.permisoSession.agregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
    this.permisoSession.modificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
    this.permisoSession.eliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisoSession.exportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Exportar);
    // if (!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar && !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar && !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar) {
    //   this.hasAccessPage = false;
    // }
    // else {
    //   this.hasAccessPage = true;
    // }
    if(this.hasAccessPage)
    {
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'codigoRol',this.currentSession.codigoRol);
        this.dataService.Beneficios().getAccesoUsuario(queryParam).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.hasAccessPage=result.acceso;
            }
        });
    }
    };
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    loadCombos() {
        this.loadAnio();
        this.loadRegimenLaboral();
        this.loadMandatoJudicial();
        this.loadTipoDocumentoIdentidad();
        this.loadCategoriaRemunerativa();
        this.loadEstado();
    };


    addParam(queryParam:HttpParams,param,value){
        if(value)
            queryParam = queryParam.set(param, value);
        return queryParam
    }
      setRequest = () => {
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'anio',this.form.get('anio').value.getFullYear());
        queryParam = this.addParam(queryParam,'idRegimenLaboral', this.getValueOrNullFromCero(this.form.get('idRegimenLaboral').value));

        
        queryParam = this.addParam(queryParam,'idAccion', this.getValueOrNullFromCero(this.form.get('idAccion').value));
        queryParam = this.addParam(queryParam,'idMotivoAccion', this.getValueOrNullFromCero(this.form.get('idMotivoAccion').value));
        queryParam = this.addParam(queryParam,'mandatoJudicial', this.getValueOrNullFromCero(this.form.get('mandatoJudicial').value));
        queryParam = this.addParam(queryParam,'idTipoDocumentoIdentidad', this.getValueOrNullFromCero(this.form.get('idTipoDocumentoIdentidad').value));
        queryParam = this.addParam(queryParam,'numeroDocumentoIdentidad', this.getValueOrNullFromEmpy(this.form.get('numeroDocumentoIdentidad').value));
        queryParam = this.addParam(queryParam,'codigoPlaza', this.getValueOrNullFromEmpy(this.form.get('codigoPlaza').value));
        queryParam = this.addParam(queryParam,'idCategoriaRemunerativa', this.getValueOrNullFromCero(this.form.get('idCategoriaRemunerativa').value));
        queryParam = this.addParam(queryParam,'codigoModular', this.getValueOrNullFromEmpy(this.form.get('codigoModular').value));
        queryParam = this.addParam(queryParam,'idEstado', this.getValueOrNullFromCero(this.form.get('idEstado').value));
        
        queryParam = this.addParam(queryParam,'codigoRol', this.currentSession.codigoRol);
        queryParam = this.addParam(queryParam,'codigoSede', this.currentSession.codigoSede);
        queryParam = this.addParam(queryParam,'codigoTipoSede', this.currentSession.codigoTipoSede);
        this.request = queryParam;
      }
      getValueOrNullFromCero(value){
        return value==0?null:value;
      }
      getValueOrNullFromEmpy(value){
        return value==""?null:value;
      }
    initializeComponent() {
    }
    buildGrid() {
        
        this.dataSource = new BeneficioDataSource(this.dataService, this.paginator);
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
      }
ngAfterContentInit() {
    // setTimeout(() => {
         this.paginator.page.pipe(tap(() => this.loadTable())).subscribe();
    // });
}
/**
 * Sección Críterios de búsqueda
 */
    /**
     * Variables */
 now = new Date();
 maxLengthnumeroDocumentoIdentidad: number;
 dialogRef: any;
 comboLists = {
     listAnio: [],
     listRegimenLaboral: [],
     listAccion: [],
     listMotivoAccion:[],
     listMandatoJudicial:[],
     listTipoDocumentoIdentidad:[],
     listCategoriaRemunerativa:[],
     listEstado:[]
 };
 
/**
     * Métodos HTML*/
 resetFormRegimenLaboral() {
    this.form.controls['idAccion'].setValue(0);
    this.form.controls['idMotivoAccion'].setValue(0);
    this.comboLists.listAccion = [];
    this.comboLists.listMotivoAccion = [];
}
resetFormAccion() {
    this.form.controls['idMotivoAccion'].setValue(0);
    this.comboLists.listMotivoAccion = [];
}
 handleLimpiar(): void {
    this.resetForm();
}

handleBuscar(): void {
    this.loadTable(false);
}
selectRegimenLaboral(idRegimenLaboral) {
    this.resetFormRegimenLaboral();
    this.loadAccion(idRegimenLaboral);
  }
selectAccion(idAccion){
    this.resetFormAccion();
    this.loadMotivoAccion(this.form.get('idRegimenLaboral').value,idAccion);
}

    selectTipoDocumento(tipoDocumento: number) : void{
        this.form.patchValue({
            numeroDocumentoIdentidad: ''
          });
      }
    onKeyPressNumeroDocumento(e: any): boolean {
        let _idTipoDocumento  = this.form.get('idTipoDocumentoIdentidad').value;
        let tipoDocumentoSelect = this.comboLists.listTipoDocumentoIdentidad.find(m => m.value == _idTipoDocumento);
        if (tipoDocumentoSelect.value == 1) {
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
      buscarPersona(event) {
        event.preventDefault();
        this.dialogRef = this.materialDialog.open(BuscarPersonaComponent, {
          panelClass: 'buscar-persona-dialog',
          width: "1900px",
          disableClose: true,
          data: {
            esProceso: false,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
          }
        });
    
        this.dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log('persona selected - close => ', response);
            this.form.patchValue({ 
              numeroDocumentoIdentidad: response.numeroDocumentoIdentidad,
              idTipoDocumentoIdentidad: response.idTipoDocumentoIdentidad
            });
            // this.plaza = response;
          });
      }
      busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "1900px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
                //idEtapaProceso : this.idEtapaProceso,
		idRegimenLaboral: RegimenLaboralEnum.LEY_30328,
		codigoCentroTrabajo: CentroTrabajoEnum.MINEDU
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                console.log("resultado busqueda plazas", result);
                // this.form.get("codigoPlaza").setValue(result.plaza.codigo_plaza.trim());
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                //this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }
    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
            panelClass: "buscar-centro-trabajo-dialog",
            width: "1900px",
            disableClose: true,
            data: {
                action: "busqueda",
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                console.log("resultado busqueda centro trabajo", result);
                // this.form.get("codigoPlaza").setValue(result.plaza.codigo_plaza.trim());
                this.form.get("codigoModular").setValue(result.centroTrabajo.codigoModular.trim());
                //this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    };
/**
     * Métodos Internos*/
resetForm() {
    this.form.reset();      
    this.form.get('anio').setValue(new Date());
    this.form.controls['idRegimenLaboral'].setValue(0);
    this.form.controls['idAccion'].setValue(0);
    this.form.controls['idMotivoAccion'].setValue(0);
    this.form.controls['mandatoJudicial'].setValue(0);
    this.form.controls['idTipoDocumentoIdentidad'].setValue(0);
    this.form.controls['idEstado'].setValue(0);
    
    this.form.controls['idCategoriaRemunerativa'].setValue(0);
    this.form.controls['codigoPlaza'].setValue("");
    this.form.controls['codigoModular'].setValue("");

    this.comboLists.listAccion = [];
    this.comboLists.listMotivoAccion = [];
    this.form.patchValue({
        codigoRol: this.currentSession.codigoRol,
        codigoSede: this.currentSession.codigoSede,
        codigoTipoSede: this.currentSession.codigoTipoSede,
      });
}
loadAnio() {
    // const request = {
    //     codigoTipoSede: this.currentSession.codigoTipoSede,
    //     codigoSede: this.currentSession.codigoSede
    // }
    // this.dataService.Beneficios().getComboAnio(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
    //     if (result) {
    //         this.comboLists.listAnio = result.map((x) => ({
    //             ...x,
    //             value: x.idAnio,
    //             label: x.descripcionAnio
    //         }));
    //     }
    // });
}
loadMandatoJudicial() { 
    this.dataService.Beneficios().getComboMandatoJudicial().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            var index = 0;
            result.splice(index, 0,
                {
                    mandatoJudicial: 0,
                    descripcionMandatoJudicial:"TODOS"
                });
            this.comboLists.listMandatoJudicial = result.map((x) => ({
                ...x,
                value: x.mandatoJudicial,
                label: x.descripcionMandatoJudicial
            }));
        }
    });
}
loadCategoriaRemunerativa() {
    this.dataService.Beneficios().getComboCategoriaRemunerativa().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            var index = 0;
            result.splice(index, 0,
                {
                    idCategoriaRemunerativa: 0,
                    descripcionCategoriaRemunerativa:"TODOS"
                });
            this.comboLists.listCategoriaRemunerativa = result.map((x) => ({
                ...x,
                value: x.idCategoriaRemunerativa,
                label: x.descripcionCategoriaRemunerativa
            }));
        }
    });
}

loadEstado() {
    this.dataService.Beneficios().getComboEstado().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            var index = 0;
            result.splice(index, 0,
                {
                idEstado: 0,
                descripcionEstado:"TODOS"
                });
            this.comboLists.listEstado = result.map((x) => ({
                ...x,
                value: x.idEstado,
                label: x.descripcionEstado
            }));
        }
    });
}
loadRegimenLaboral() {
    var codigoRol = this.form.get('codigoRol').value;
    var codigoSede = this.form.get('codigoSede').value;
    var codigoTipoSede = this.form.get('codigoTipoSede').value;
    
    

    this.dataService.Beneficios().getComboRegimenLaboral(codigoRol,codigoSede,codigoTipoSede).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            var index = 0;
            result.splice(index, 0,
                {
                idRegimenLaboral: 0,
                descripcionRegimenLaboral:"TODOS"
                });
            this.comboLists.listRegimenLaboral = result.map((x) => ({
                ...x,
                value: x.idRegimenLaboral,
                label: x.descripcionRegimenLaboral
            }));
        }
    });
}
loadAccion(idRegimenLaboral) {
    var codigoRol = this.form.get('codigoRol').value;
    var codigoSede = this.form.get('codigoSede').value;
    var codigoTipoSede = this.form.get('codigoTipoSede').value;
    this.dataService.Beneficios().getComboAccion(codigoRol,codigoSede,codigoTipoSede,idRegimenLaboral).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            var index = 0;
            result.splice(index, 0,
                {
                    idAccion: 0,
                    descripcionAccion:"TODOS"
                });
            this.comboLists.listAccion = result.map((x) => ({
                ...x,
                value: x.idAccion,
                label: x.descripcionAccion
            }));
        }
    });
}

loadMotivoAccion(idRegimenLaboral,idAccion) {
    var codigoRol = this.form.get('codigoRol').value;
    var codigoSede = this.form.get('codigoSede').value;
    var codigoTipoSede = this.form.get('codigoTipoSede').value;
    this.dataService.Beneficios().getComboMotivoAccion(codigoRol,codigoSede,codigoTipoSede,idRegimenLaboral,idAccion).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            var index = 0;
            result.splice(index, 0,
                {
                    idMotivoAccion: 0,
                    descripcionMotivoAccion:"TODOS"
                });
            this.comboLists.listMotivoAccion = result.map((x) => ({
                ...x,
                value: x.idMotivoAccion,
                label: x.descripcionMotivoAccion
            }));
        }
    });
}
loadTipoDocumentoIdentidad = () => {
    this.dataService
        .Beneficios()
        .getComboTipoDocumentoIdentidad()
        .pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((result: any) => {
            if (result) {
                var index = 0;
                result.splice(index, 0,
                    {
                        idTipoDocumentoIdentidad: 0,
                        descripcionTipoDocumentoIdentidad:"TODOS"
                    });
                this.comboLists.listTipoDocumentoIdentidad = result.map((x) => ({
                    ...x,
                    value: x.idTipoDocumentoIdentidad,
                    label: x.descripcionTipoDocumentoIdentidad
                }));
                
            }
        });
};
/**
     * Métodos Integración API*/
loadTable = (fistTime: boolean = false) => {
    this.setRequest();
    this.requestExportar = this.request;
    if (fistTime) {
      this.dataSource.load(this.request, 1, 10,fistTime);
    }
    else {
    this.dataSource.load(
        this.request,
        this.paginator.pageIndex + 1,
        this.paginator.pageSize,
        fistTime
      );
    }
  }
/**
 * Sección Bandeja
 */
    /**
     * Variables */
     dataSource: BeneficioDataSource | null;
     displayedColumns: string[] = [
        "select",
        "descripcionRegimenLaboral",
        "descripcionAccion",
        "descripcionMotivoAccion",
        "mandatoJudicial",
        "numeroDocumentoIdentidad",
        "nombres",
        "fechaBeneficio",
        "fechaFin",
        "codigoPlaza",
        "estado",
        "acciones",
    ];
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild("paginator", { static: true }) 
    paginator: MatPaginator;
    isDisabled = false;
    selectionFila = new SelectionModel<any>(true, []);
/**
     * Métodos HTML*/
 masterToggle() {
    if (this.isAllSelectedFila()) {
      if (!this.isDisabled) {
        this.selectionFila.clear();
      }
    } else {
      this.dataSource.data.forEach(row => {
        if (!row.isDisabled) {
          this.selectionFila.select(row);
        }
      });
    }
  }
  isAllSelectedFila() {
    const numSelected = this.selectionFila.selected.length;
    const data = this.dataSource.data;
    const numRows = data.filter(row => !row.bloquear).length;
    return numSelected === numRows;
  }
  selectedGrid(row) {
    console.log(row);
    if (!this.isDisabled)
      console.log("disable",row);
      this.selectionFila.toggle(row);
  }
  handleNuevo() {
    this.router.navigate(['ayni/personal/acciones/beneficios/registro'])
 }
 
handleVer(row){
    
    console.log('row',row);
    this.router.navigate(['ayni/personal/acciones/beneficios/ver/'+row.idDetalleGestionBeneficio+'/'+1]);

}
handleEditar(row){
    
    console.log('row',row);
    this.router.navigate(['ayni/personal/acciones/beneficios/editar/'+row.idDetalleGestionBeneficio]);
}
handleVerProyecto(row) {
    console.log("visualizar", row.documentoProyectoResolucion)
    //var registro1 = "4/02817822-49d1-ec11-b81b-0050569005a4"
    console.log("pdf", row);
    const codigoDocumentoReferencia = row.documentoProyectoResolucion;
    if (codigoDocumentoReferencia === null) {
        this.dataService
            .Util()
            .msgWarning(
                "La accion grabada no tiene documento adjunto.",
                () => { }
            );
        return true;
    }

    this.dataService.Spinner().show("sp6");
    this.dataService
        .Documento()
        .descargar(codigoDocumentoReferencia)
        .pipe(
            catchError((e) => of(null)),
            finalize(() => this.dataService.Spinner().hide("sp6"))
        )
        .subscribe(
            (data) => {
                const nombreArchivo = row.documentoProyectoResolucion + ".pdf";
                this.handlePreview(data, nombreArchivo);
                //saveAs(data, nombreArchivo);
            },
            (error) => {
                this.dataService
                    .Util()
                    .msgWarning(
                        "No se encontro el documento de sustento",
                        () => { }
                    );
            }
        );
}
handleGenerarProyecto(row){
    let regimenLaboralTexto = row.descripcionRegimenLaboral;
    let grupoAccionTexto = 'BENEFICIOS';
    let accionTexto = row.descripcionAccion;
    let motivoAccionTexto = row.descripcionMotivoAccion;
    // let mandatoJudicial = this.form.get('mandatoJudicial').value;
    // let codigoSede =  this.form.get('codigoSede').value;
    // let codigoTipoSede =  this.form.get('codigoTipoSede').value;
    
    this.dialogRef = this.materialDialog.open(GenerarProyectoComponent, {
      panelClass: 'modal-generar-proyecto-resolucion-form-dialog',
      disableClose: true,
      data: {
        title: "Generar proyecto de resolución",
        datosAccion: {
            regimen_laboral: regimenLaboralTexto,
            grupo_accion: grupoAccionTexto,
            accion: accionTexto,
            motivo_accion: motivoAccionTexto
        },
        idBeneficio:row.idDetalleGestionBeneficio,
        operacion:3
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        console.log('close => ', response);
        if (!response) {
          return;
        }
        row.documentoProyectoResolucion = response.documentoProyectoResolucion;
        this.handleVerProyecto(row);
        // this.form.patchValue({ 
        //     retornar: true
        // });
        // this.plaza = response;
      });
}
handlePreview(file: any, codigoAdjuntoAdjunto: string) {
    console.log("mostrar pDF 2", file)
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: "modal-viewer-form-dialog",
        disableClose: true,
        data: {
            modal: {
                icon: "remove_red_eye",
                title: "Proyecto Resolución",
                file: file,
                fileName: codigoAdjuntoAdjunto,
            },
        },
    });
}
handleAnular(row){
    console.log('row',row);
    this.router.navigate(['ayni/personal/acciones/beneficios/eliminar/'+row.idDetalleGestionBeneficio]);
}
handleEnviarAccionesGrabadas() {
    var listIDRegistros = [];
    var cancelarEnvio = false;
    this.selectionFila.selected.forEach(element => {
        if(element.estado!="REGISTRADO" && element.estado!="AUTORIZADO")
        {
            cancelarEnvio = true;
        }else{
            listIDRegistros.push(element.idDetalleGestionBeneficio);
        }
    });
    if(cancelarEnvio)
    {
        console.log("cancelarEnvio:",cancelarEnvio);
        this.dataService.Message().msgAutoCloseWarning("SOLO SE PUEDEN ENVIAR A ACCIONES GRABADAS LOS BENEFICIOS EN ESTADO REGISTRADO O AUTORIZADO", 3000, () => {
            
        });
        return;
    }
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ENVIAR A ACCIONES GRABADAS.?', () => {
        
        const usuario = this.dataService.Storage().getPassportUserData();
        
        var dataBeneficio = {
            idRegistros:listIDRegistros,
            fechaCreacion: new Date(),
            usuarioCreacion: usuario.NUMERO_DOCUMENTO,
            ipCreacion:":1",
        }
        this.dataService.Beneficios()
            .enviarAccionesGrabadas(dataBeneficio)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                console.log('Acciones Grabadas', response);
                if (response) {
                    this.dataService.Message().msgSuccess('"SE ENVIÓ CORRECTAMENTE A ACCIONES GRABADAS."', () => {
                        this.dataSource.load(this.request, 1, 10);
                    });
                }
            });
    }, () => { });
}
 handleExportar() {

    if (this.dataSource.data.length === 0) {
        this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => { });
        return;
    }
    this.dataSource.exportar(this.requestExportar);
}
handleHome = () => { 
    this.router.navigate(
        ['/ayni/personal/inicio'], 
        { relativeTo: this.route }
    ); 
}
}
