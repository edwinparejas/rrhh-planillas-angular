import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, Input, OnInit, Output, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
//import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { PASSPORT_MESSAGE } from "app/core/model/message";
import { SecurityModel } from "app/core/model/security/security.model";
import { MISSING_TOKEN, ResultadoOperacionEnum } from "app/core/model/types";
import { SharedService } from "app/core/shared/shared.service";
import { descargarExcel } from "app/core/utility/functions";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { ModalInformacionPlazaComponent } from "../../contrataciondirecta/bandeja-incorporacion-plazas/modal-informacion-plaza/modal-informacion-plaza.component";
import { EstadoPlazaIncorporarEnum, RegimenLaboralEnum, TipoFormatoPlazaEnum, TipoProcesoPlazaEnum, PassportTipoSede, MensajesSolicitud } from "../../_utils/constants";
import { BuscarCentroTrabajoComponent } from "../buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BusquedaPlazaComponent } from "../busqueda-plaza/busqueda-plaza.component";
import { criterioBusqueda } from '../../models/criterioBusqueda.model';
import { NivelInstanciaCodigoEnum } from "../../models/contratacion.model";
import { Console } from "console";
import { TablaRolPassport } from '../../../contratacion-30493/_utils/constants';
import { bandejaIncorporacion } from '../../models/bandejaIncorporacion';

@Component({
    selector: "minedu-bandeja-incorporar-plaza",
    templateUrl: "./bandeja-incorporar-plaza.component.html",
    styleUrls: ["./bandeja-incorporar-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaIncorporarPlazaComponent implements OnInit {

    @Input() idProcesoEtapa: number;
    @Input() dataConsolidada: any;

    isSeleccionadoTodosIncorporados:boolean=false;
    filaSeleccionadasIncorporar:any[]=[];
    filaNoSeleccionadas:any[]=[];
    selectionPlazasGeneradas = new SelectionModel<any>(true, []);
    //selectionPlazasIncorporar = new SelectionModel<any>(true, []);

    fragmentoUrlRetornar: string;
    fragmentoUrlRetornarTexto:string;
    fragmentoUrlRetornarComplemento: any;
    fragmentoUrlRetornarComplementoTexto:string;
    textosConcatenadosConGuion:string;
    @Output() resultado:any;
    
    instancias: any[];
    subinstancias: any[];

    form: FormGroup;
    dialogRef: any;
    estadoPlaza = 0;
    becario: string;
    working = false;
    isMobile = false;
    totalregistro = 0;
    selectedTabIndex = 0;
    idEtapaProceso: number;
    anio: number;
    idRegimenLaboral: number;
    comandoActualizarMetaDataPlaza: string;
    idFlujoEstado: number;
    codSedeCabecera:string; // added
    codigoCentroTrabajoMaestro:string;
    idEstadoDesarrollo: number;
    plazaFiltroSeleccionado: any;
    paginatorPlazasGeneradasPageIndex = 0;
    paginatorPlazasGeneradasPageSize = 10;
    @ViewChild("paginatorPlazasGeneradas", { static: true }) paginatorPlazasGeneradas: MatPaginator;
    centroTrabajoFiltroSeleccionado: any;
    dataSourcePlazasGeneradas: PlazasContratacionPlazasGeneradasDataSource | null;
    
    displayedColumnsPlazasGeneradas: string[] = null
    request = {
        idPlaza: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idEtapaProceso: null,
        codigoCentroTrabajoMaestro: null,
        idInstancia:null,
        idSubInstancia:null,
	idRegimen: null,
	anio: null
    };

    currentSession: SecurityModel = new SecurityModel();

    data: any = {
        idEtapaProceso : null,
        codigoCentroTrabajoMaestro: null,
        idSituacionValidacion:null,
    }

    // data: any = {
    //     idEtapaProceso : 6,
    //     codigoCentroTrabajoMaestro: '000000',
    //     idSituacionValidacion:15,
    // }
    modelBandejaIncorporacion:bandejaIncorporacion = new bandejaIncorporacion();
    modelCriterioBusqueda:criterioBusqueda = new criterioBusqueda();
    buscarPaginador:boolean=false;
    esBecario?:boolean;
    ocultarInstancia:boolean = true;
    ocultarSubInstancia:boolean = true;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        //public matDialogRef: MatDialogRef<BandejaIncorporarPlazaComponent>,
        //@Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private dataService: DataService,
        private sharedService: SharedService
    ) { }

    ngOnInit(): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
	this.configurarInstanciaSubInstancia();
        this.idEtapaProceso = +this.route.snapshot.params.id;//this.data.idEtapaProceso;
        this.idRegimenLaboral = + this.route.snapshot.paramMap.get('idRegimen');
        this.codigoCentroTrabajoMaestro = this.route.snapshot.paramMap.get('codigoCentroTrabajoMaestro');
        this.idEstadoDesarrollo = +this.route.snapshot.paramMap.get('idEstadoDesarrollo');
        this.fragmentoUrlRetornar = decodeURI(this.route.snapshot.paramMap.get('fragmentoUrlRetornar'));
        this.fragmentoUrlRetornarComplemento =  this.route.snapshot.paramMap.get('fragmentoUrlRetornarComplemento');
        this.textosConcatenadosConGuion = decodeURI(this.route.snapshot.paramMap.get('textosConcatenadosConGuion'));
        this.esBecario = this.route.snapshot.paramMap.get('esBecario') == null ? null:this.toBoolean(this.route.snapshot.paramMap.get('esBecario'));
        this.buildForm();
        this.handleResponsive();
        this.ocultarBreadCrumOriginal();
        this.codSedeCabecera = this.codigoCentroTrabajoMaestro;//'000000';  //verificar
	this.modelBandejaIncorporacion.setUpColumnas(this.currentSession.codigoTipoSede);
        this.buildGrids();

        setTimeout((_) => this.buildShared());
        this.loadInstancia(true);
        this.procesarTextosConcatenadosCabecera(this.textosConcatenadosConGuion);
	this.comandoActualizarMetaDataPlaza 
	                 = this.route.snapshot.paramMap.get('commandoMetaData'); 
	this.idFlujoEstado =
	                + this.route.snapshot.paramMap.get('idFlujoEstado'); 
    }

    configurarInstanciaSubInstancia = () => {
	if(
	    this.currentSession.codigoRol == TablaRolPassport.RESPONSABLE_PERSONAL_DRE
	    && this.currentSession.codigoTipoSede == PassportTipoSede.DRE
	){
	    this.ocultarInstancia = false
	}

	if(
	   this.currentSession.codigoRol == TablaRolPassport.RESPONSABLE_PERSONAL_UGEL
	    && this.currentSession.codigoTipoSede == PassportTipoSede.UGEL
	){
	    this.ocultarInstancia = false;
	    this.ocultarSubInstancia = false;
	}
    }

    procesarTextosConcatenadosCabecera(textosConcatenadosConGuion:string){
        if(textosConcatenadosConGuion.trim().length>0){
            let arregloTituloCabecera = textosConcatenadosConGuion.split("-");
            try{
                this.fragmentoUrlRetornarTexto = arregloTituloCabecera[0];
            }catch(e){
                this.fragmentoUrlRetornarTexto = '';
            }
            try{
                this.fragmentoUrlRetornarComplementoTexto = arregloTituloCabecera[1];
            }catch(e){
                this.fragmentoUrlRetornarComplementoTexto = '';
            }
        }
    }

    toBoolean = (value: string | number | boolean): boolean => [true, 'true', 'True', 'TRUE', '1', 1].includes(value);
    ngAfterViewInit() {
	this.paginatorPlazasGeneradas.page.pipe(tap(() => {
	    this.buscarPaginador = true;
	    this.handleBuscar();
	})).subscribe();
	this.modelCriterioBusqueda.asignarActivoSubInstancia(true);
    }

    
    setUpColumnas=()=>{
	//this.displayedColumnsPlazasGeneradas=this.modelBandejaIncorporacion.setUpColumnas(this.currentSession.codigoTipoSede);
    }
    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoCentroTrabajo: [null],
            codigoPlaza: [null],
            idInstancia: [null],
            idSubinstancia: [null],
        });

        this.form.get("idInstancia").valueChanges.subscribe((value) => {
            let idNivelInstancia = null;
            let idInstancia = null;
            // this.subinstancias = [];
            // this.tiposCentroTrabajo = [];

            if (value === "-1") {
                return;
            }

            if (this.instancias.length !== 0 && value !== null && value !== undefined) {
                const data = this.instancias.find((x) => x.id_instancia === value);
                idNivelInstancia = parseInt(value.split("-")[0]);
                idInstancia = data.id;
            }

            this.form.patchValue({idSubinstancia: "-1",idTipoCentroTrabajo: "-1"});

            switch (idNivelInstancia) {
                case NivelInstanciaCodigoEnum.MINEDU: {
                    if (value) { }
                    break;
                }
                case NivelInstanciaCodigoEnum.DRE: {
                    if (value) {
                        this.loadSubInstancia(idInstancia, true);
                    }
                    break;
                }
            }
        });
        setTimeout((_) =>{
        this.dataService
            .Contrataciones()
            .obtenerCabeceraEtapaProcesoById(this.idEtapaProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            ).subscribe((response: any) => {
                if (response) {
                  this.anio = response.anio;
                  this.handleBuscar();
                }
            });
        });
    }

    verColumnaRol = ():boolean =>{
	if(
	    this.currentSession.codigoRol ==TablaRolPassport.RESPONSABLE_PERSONAL_UGEL
		|| this.currentSession.codigoRol ==PassportTipoSede.UGEL
	){
	    return true;
	}
	return false;
    }

    loadInstancia = (activo) => {
        this.dataService.Contrataciones().getComboInstancia(activo).pipe(
            catchError(() => of([])),
            map((response: any) => response)
        )
        .subscribe((instancias) => {
            if (instancias) {
                this.instancias = instancias;
                this.form.controls["idInstancia"].setValue("-1");
            }
        });
    };
    loadSubInstancia = (idInstancia, activo) => {
        this.dataService.Contrataciones().getComboSubinstancia(idInstancia, activo).pipe(
            catchError(() => of([])),
            map((response: any) => response)
        )
        .subscribe((subinstancias) => {
            if (subinstancias) {
                this.subinstancias = subinstancias;
                this.form.controls["idSubinstancia"].setValue("-1");
		this.modelCriterioBusqueda.asignarActivoSubInstancia(false);
            }
        });
    };
    buildGrids(): void {
        this.dataSourcePlazasGeneradas = new PlazasContratacionPlazasGeneradasDataSource(this.dataService);
        this.buildPaginators(this.paginatorPlazasGeneradas);
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
    }

    ocultarBreadCrumOriginal(){
        // Ocultar BreadCrum Original
        let div = document.getElementsByClassName('bread-original');
        for(let i = 0; i < div.length; i++) {
            const dv = div[i] as HTMLElement;
            dv.style.display = "none";
        }
        // ************* INICIO: INYECTANDO JAVASCRIPT **************
        //div[0].style.display='none';
    }
    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Única");
        this.sharedService.setSharedTitle("Pre Publicación de Plazas");
    }

    checkboxLabelPlazasGeneradas(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasGeneradas() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasGeneradas.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    masterTogglePlazasGeneradas = () => {
        this.isAllSelectedPlazasGeneradas() ? this.selectionPlazasGeneradas.clear() : this.dataSourcePlazasGeneradas.data.forEach((row) =>
            this.selectionPlazasGeneradas.select(row)
        );
    };

    masterTogglePlazasIncorporar = ({checked}) => {
        this.isSeleccionadoTodosIncorporados = checked;
        this.filaSeleccionadasIncorporar= [];
        this.filaNoSeleccionadas = [];
        };
    
    selectedRowIncorporar = (row) => {
	this.selectionPlazasGeneradas.toggle(row);
	if (!this.isSeleccionadoTodosIncorporados) {
	    var existeFila = this.filaSeleccionadasIncorporar?.some(x => x.idPlaza == row.idPlaza);
	    if(existeFila){
		this.filaSeleccionadasIncorporar = this.filaSeleccionadasIncorporar?.filter(x => x.idPlaza != row.idPlaza);
	    }else{
        // debugger;
		this.filaSeleccionadasIncorporar.push(row);
	    }
	}

        if (this.isSeleccionadoTodosIncorporados) {
	    var existeFila = this.filaNoSeleccionadas?.some(x => x.idPlaza == row.idPlaza);
	    if(existeFila){
		this.filaNoSeleccionadas = this.filaNoSeleccionadas?.filter(x => x.idPlaza != row.idPlaza);
	    }else{
        // debugger;
		this.filaNoSeleccionadas.push(row);
	    }
        }
    };

    verificaSeleccionIncorporar = (row):boolean =>{
      if(!this.isSeleccionadoTodosIncorporados) {
        let estaSeleccioando =	this.filaSeleccionadasIncorporar
        .some(fila => 
              fila.idPlaza 
              == row.idPlaza);
              return estaSeleccioando || this.isSeleccionadoTodosIncorporados;
      }

      if(this.isSeleccionadoTodosIncorporados) {
        let estaSeleccioando = this.filaNoSeleccionadas
        .some(fila => 
              fila.idPlaza 
              == row.idPlaza);
              return !estaSeleccioando;
      }
    }

    isAllSelectedPlazasGeneradas = () => {
        const numSelected = this.selectionPlazasGeneradas.selected.length;
        const numRows = this.dataSourcePlazasGeneradas.data.length;
        return numSelected === numRows;
    };

    handleBuscar = () => {
        this.buscarPlazasContratacionIncorporadas();
    }

    buscarPlazasContratacionIncorporadas = () => {
        this.setRequest();
        
        if (this.request.codigoPlaza) {
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(this.request.codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (this.request.codigoCentroTrabajo) {
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(this.request.codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }

        this.buscarPlazasContratacion();
    };

    setRequest(): void {
        const formulario = this.form.getRawValue();

        let idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.idPlaza : null;
        let codigoPlaza = formulario.codigoPlaza == ''?null:formulario.codigoPlaza;
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo == ''?null:formulario.codigoCentroTrabajo;
        
        let partesInstancia = formulario.idInstancia && formulario.idInstancia !== "-1" ? formulario.idInstancia.split("-") : [];
        let partesSubInstancia = formulario.idSubinstancia && formulario.idSubinstancia !== "-1" ? formulario.idSubinstancia.split("-") : [];
        let idInstancia = partesInstancia[1] ? parseInt(partesInstancia[1]) : partesInstancia[1];
        let idSubInstancia = partesSubInstancia[1] ? parseInt(partesSubInstancia[1]) : partesSubInstancia[1];

	if(codigoPlaza!=null)
	    codigoPlaza = codigoPlaza.toUpperCase();
	
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idPlaza: idPlaza,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo,
            codigoCentroTrabajoMaestro: this.codigoCentroTrabajoMaestro,
            idInstancia : idInstancia,
            idSubInstancia: idSubInstancia,
	    idRegimen : this.idRegimenLaboral,
            anio : this.anio
        };
    }

    buscarPlazasContratacion = () => {
	this.selectionPlazasGeneradas = new SelectionModel<any>(true, []);
	if(!this.buscarPaginador) this.paginatorPlazasGeneradas.firstPage();
	this.dataSourcePlazasGeneradas.load(this.request, this.paginatorPlazasGeneradas.pageIndex + 1, this.paginatorPlazasGeneradas.pageSize);
	this.buscarPaginador=false;
    };

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                disableClose: true,
		width: "1300px",
                data: {
                    action: "requerimiento",
                    idEtapaProceso: this.idEtapaProceso,
                    codigoSede : this.codSedeCabecera
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
                this.centroTrabajoFiltroSeleccionado = { ...result.centroTrabajo };
            }
        });
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "1300px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
		idRegimenLaboral:this.idRegimenLaboral,
		idEtapaProceso: this.idEtapaProceso,
		codigoCentroTrabajo: this.codSedeCabecera,
                esIncorporacion:true,
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }

    handleIncorporarPlazas = () => {
      //this.firstTime = true;
      // debugger;
      //let seleccionados = this.selectionPlazasGeneradas.selected || [];
      if ((this.filaSeleccionadasIncorporar||[])?.length == 0
          && !this.isSeleccionadoTodosIncorporados) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {});
            return;
          }
          if(this.isSeleccionadoTodosIncorporados) {
            this.filaSeleccionadasIncorporar = (this.dataSourcePlazasGeneradas.data||[])
            .filter(x => {
              return !this.filaNoSeleccionadas
              .some(f => f.idPlaza == x.idPlaza);
            });
          }
          let seleccionados = this.filaSeleccionadasIncorporar;

          const request = this.data.idSituacionValidacion == undefined ? {
            idEtapaProceso: this.idEtapaProceso,
            plazas: seleccionados.map((p) => {
              return {
                idPlaza: p.idPlaza,
                idCentroTrabajo: p.idCentroTrabajo
              }
            }),
            usuarioModificacion: "ADMIN",
            codigoCentroTrabajoMaestro : this.codigoCentroTrabajoMaestro=='000000'?'000000':this.codigoCentroTrabajoMaestro,
            esBecario:this.esBecario,
            comandoActualizarMetaDataPlaza:this.comandoActualizarMetaDataPlaza,
            idFlujoEstado:this.idFlujoEstado,
            idEstadoDesarrollo:this.idEstadoDesarrollo
          } : {
            idEtapaProceso: this.idEtapaProceso,
            plazas: seleccionados.map((p) => {
              return {
                idPlaza: p.idPlaza,
                idCentroTrabajo: p.idCentroTrabajo
              }
            }),
            usuarioModificacion: "ADMIN",
            idSituacionValidacion:this.data.idSituacionValidacion,
            codigoCentroTrabajoMaestro : this.codigoCentroTrabajoMaestro=='000000'?'000000':this.codigoCentroTrabajoMaestro,
            esBecario:this.esBecario,
            comandoActualizarMetaDataPlaza:this.comandoActualizarMetaDataPlaza,
            idFlujoEstado:this.idFlujoEstado,
            idEstadoDesarrollo:this.idEstadoDesarrollo
          };

          this.dataService
          .Message()
          .msgConfirm('¿ESTA SEGURO QUE DESEA INCORPORAR LAS PLAZAS SELECCIONADAS AL PROCESO?',
                      () => {
                        this.dataService.Spinner().show("sp6");
                        this.dataService
                        .Contrataciones()
                        .registrarPlazasIncorporarContratacionDirecta(request)
                        .pipe(
                          catchError((e) => of(null)),
                            finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                          })
                        ).subscribe((response: any) => {
                          if (response.totalPlazasIncorporadas > 0) {
                            this.handleCancelar(seleccionados);
                            if (response.totalPlazasNoIncorporadas > 0){
                              this.dataService 
                              .Message()
                              .msgWarning('"NO SE AGREGARON '+ response.totalPlazasNoIncorporadas +' PLAZA(S) PORQUE NO CUMPLE CON LAS REGLAS DEL PROCESO."', () => {                        
                                this.dataService 
                                .Message()
                                .msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {                        
                                  this.handleRetornar()
                                });
                              }); 
                            }else{
                              this.dataService 
                              .Message()
                              .msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {                        
                                this.handleRetornar()
                              });    
                            }
                          } else {
                            this.dataService.Message().msgAutoCloseWarningNoButton('"NO SE INCORPORÓ CORRECTAMENTE LAS PLAZAS SELECCIONADAS."',3000, () => {});
                          }
                        });
                      }
                     );
    };

    informacionPlazaView = (id: number) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPlazaComponent, {
            panelClass: "modal-informacion-plaza-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idPlaza: id,
                anio: this.anio
            },
        });
    }

    handleExportarPlazasGeneradas = () => {
        if (this.dataSourcePlazasGeneradas.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }
        // debugger;
        let partesInstancia = this.form.get("idInstancia").value && this.form.get("idInstancia").value !== "-1" ? this.form.get("idInstancia").value.split("-") : [];
        let partesSubInstancia = this.form.get("idSubinstancia").value && this.form.get("idSubinstancia").value !== "-1" ? this.form.get("idSubinstancia").value.split("-") : [];
        let idInstancia = partesInstancia[1] ? parseInt(partesInstancia[1]) : partesInstancia[1];
        let idSubInstancia = partesSubInstancia[1] ? parseInt(partesSubInstancia[1]) : partesSubInstancia[1];
        this.setRequest();
        let requestExport: any = { 
            codigoRegimen: this.idRegimenLaboral,
            tipoProceso: TipoProcesoPlazaEnum.SIN_PROCESO, 
            estadoPlaza: EstadoPlazaIncorporarEnum.APROBADO,
	    codigoCentroTrabajoMaestro: this.codigoCentroTrabajoMaestro,
	    idEtapaProceso:+this.route.snapshot.params.id,
	    codigoTipoSede:this.currentSession.codigoTipoSede,
            idInstancia:idInstancia,
            idSubInstancia: idSubInstancia,
            anio: this.anio,
            idPlaza: this.request.idPlaza,
            codigoPlaza: this.request.codigoPlaza,
            idCentroTrabajo:this.request.idCentroTrabajo,
            codigoCentroTrabajo:this.request.codigoCentroTrabajo,
        };

        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        try{
            var nombreExportar:string = "Incorporacion de Plazas - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = "Incorporacion de Plazas" + ".xlsx";
        }
        // ************************************************************************************************

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelPlazasIncorporar(requestExport).pipe(catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                // descargarExcel(response.file, "Incorporacion de Plazas.xlsx");
                descargarExcel(response.file, nombreExportar);
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA SU EXPORTACIÓN."', () => {});
            }
        });
    }

    handleCancelar(data?: any) {
       console.log("cerrare ventana y devolver valores");
        /*
        if (data) {
            this.matDialogRef.close({ plazas: data });
        } else {
            data = "0";
            this.matDialogRef.close();
        }  */      
    }

    handleLimpiar(): void {
	if(this.centroTrabajoFiltroSeleccionado)
	    this.centroTrabajoFiltroSeleccionado.id_centro_trabajo = null;
	this.plazaFiltroSeleccionado = null;
        this.resetForm();
	this.modelCriterioBusqueda.asignarActivoSubInstancia(true);

    this.handleBuscar();
    }

    handleRetornar = () => {
        // this.router.navigate(["../../"], { relativeTo: this.route });
        if (this.fragmentoUrlRetornarComplemento == null)
        this.router.navigate([
            "ayni",
            "personal",
            "procesospersonal",
            "procesos",
            "contratacion",
            this.fragmentoUrlRetornar,
            this.idEtapaProceso.toString(),
        ]);
        if (this.fragmentoUrlRetornarComplemento != null)
        this.router.navigate([
            "ayni",
            "personal",
            "procesospersonal",
            "procesos",
            "contratacion",
            this.fragmentoUrlRetornar,
            this.fragmentoUrlRetornarComplemento,
            this.idEtapaProceso.toString(),
        ]);

    };

    resetForm = () => {
        this.form.reset();
    };

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
            console.log("Mobile activado? :", this.isMobile);
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        console.log("Redimension ventana cliente:", w);
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

  

}

export class PlazasContratacionPlazasGeneradasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    private registrosRecuperados= 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Contrataciones().postBuscarPlazasPublicadasPaginadoDirecta(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe(response => {
                if (response) {
                    this._dataChange.next(response || []);
                    this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_registros;
                    this.registrosRecuperados = response?.length;
                } else {
                    let r = response[0];
                    if (r.status == ResultadoOperacionEnum.InternalServerError) {
                        this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                    } else if (r.status == ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(r.message, () => { });
                    } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                    } else {
                        this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                    }
                }

                if ((response || []).length === 0) {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
                            () => {}
                        );
                }
            });
        }
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalregistro;
    }

    get dataRegistrosRecuperados(): any {
        return this.registrosRecuperados;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}
