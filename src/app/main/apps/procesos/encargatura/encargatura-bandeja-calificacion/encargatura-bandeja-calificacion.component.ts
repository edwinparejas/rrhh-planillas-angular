import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../@minedu/animations/animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../../../../core/data/data.service';
import {SharedService} from '../../../../../core/shared/shared.service';
import {EtapaEnum, ResultadoCalificacionEnum, TipoDocumentoIdentidadEnum, TipoFormatoPlazaEnum} from '../_utils/constants';
import {PestanaCalificacionEncargaturaComponent} from '../components/pestana-calificacion-encargatura/pestana-calificacion-encargatura.component';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ControlesActivosCalificacion } from '../interfaces/encargatura.interface';
import { BuscadorServidorPublicoComponent } from '../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { MatDialog } from '@angular/material/dialog';
import { BuscarCentroTrabajoComponent } from '../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BusquedaPlazaComponent } from '../components/busqueda-plaza/busqueda-plaza.component';
import { CabeceraDesarrolloProcesoEncargaturaComponent } from '../components/cabecera-desarrollo-proceso-encargatura/cabecera-desarrollo-proceso-encargatura.component';
import { TablaTipoOperacion } from '../models/encargatura.model';
import { EntidadSedeService } from '../Services/entidad-sede.service';

@Component({
    selector: 'minedu-encargatura-bandeja-calificacion',
    templateUrl: './encargatura-bandeja-calificacion.component.html',
    styleUrls: ['./encargatura-bandeja-calificacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaBandejaCalificacionComponent implements OnInit {
    form: FormGroup;
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    codigoEtapa: number;
    codigoResultadoCalificacion: number;
    etapaEnum = EtapaEnum;
    @ViewChild('pestanaResultadoPreliminar')  pestanaResultadoPreliminarComponent: PestanaCalificacionEncargaturaComponent;
    @ViewChild('pestanaResultadoFinal')  pestanaResultadoFinalComponent: PestanaCalificacionEncargaturaComponent;
    @ViewChild('CabeceraDesarrolloProcesoEncargatura') CabeceraDesarrolloProcesoEncargaturaComponent: CabeceraDesarrolloProcesoEncargaturaComponent;
    selectedTabIndex: number;
    loading: boolean;
    now = new Date();
    comboLists = {
        listTipoDocumento: [],
        listEstado: []
    };
    label = {
        resultadoPreliminar: 'Resultado Preliminar',
        resultadoFinal: 'Resultado Final'
    };
    currentSession: SecurityModel = new SecurityModel();     
    passport={
        idNivelInstancia: null,        
        idEntidadSede: null, 
        idRolPassport: null
    } 
    controlesActivos:ControlesActivosCalificacion = {
        btnRealizarEvaluacion: false,
        btnEvaluarCuadroMerito: false,
        btnRealizarCalificacion: false,
        btnObservarPostulante: false,
        btnRegistrarReclamo: false,
        btnGenerarOrdenMerito: false,
        btnPublicarResultados: false,
        btnPublicarResultadoPreliminar: false,
        btnPublicarResultadoFinal: false,
        btnPublicarCuadroPreliminar: false,
        btnPublicarCuadroFinal: false,
        btnExportar: false,
        btnImportarInformeEscalafonarioSolicitados:false
    }
    request = {
        idEtapaProceso: 0,
        idDesarrolloProceso: 0,
        codigoEtapa: 0,
        codigoResultadoCalificacion: 0,
        codigoTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        codigoModular: null,
        codigoPlaza: null,
        codigoEstadoCalificacion: null,
        butonAccion:false
    };
    isMobile = false;
    maxLengthnumeroDocumentoIdentidad: number;
    dialogRef: any;
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
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog,
        private entidadSedeService: EntidadSedeService
    ) {
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.idDesarrolloProceso = parseInt(this.route.snapshot.params.desa);
        this.codigoEtapa = parseInt(this.route.snapshot.params.etapa);
        this.codigoResultadoCalificacion =  ResultadoCalificacionEnum.ResultadoPreliminar;
        this.selectedTabIndex = 0;
        if (this.codigoEtapa == this.etapaEnum.EvaluacionRegular) {
            this.label.resultadoPreliminar = 'Cuadro de Merito Preliminar';
            this.label.resultadoFinal = 'Cuadro de Merito Final';
        }
    }

    ngOnInit(): void {
        setTimeout(() => this.buildShared());
        this.initializeComponent();
    }

    private async initializeComponent() {   
        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();
        
        this.handleResponsive();
        this.buildSeguridad();
        this.loadCombos();
        this.resetForm();
    }
    
    private async getDreUgelData() {
        this.currentSession.codigoSede=this.entidadSedeService.entidadSede.codigoSede;
        this.currentSession.codigoTipoSede=this.entidadSedeService.entidadSede.codigoTipoSede;
    }
    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }
    buildSeguridad() {
        const data = { 
            idEtapaProceso:this.idEtapaProceso, 
            codTipoSede:this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }

        this.dataService.Encargatura().getAccesoUsuarioCalificacion(data).pipe(catchError((e) => of([e])),
        finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                this.controlesActivos = { 

                    btnGenerarOrdenMerito: response.generarOrdenMerito,
                    btnPublicarCuadroPreliminar: response.publicarCuadroPreliminar,
                    btnPublicarCuadroFinal: response.publicarCuadroFinal,        

                    btnPublicarResultadoPreliminar: response.publicarResultadoPreliminar,
                    btnPublicarResultadoFinal: response.publicarResultadoFinal,
                    
                    btnRealizarEvaluacion: response.realizarEvaluacion,
                    btnEvaluarCuadroMerito: response.evaluarCuadroMerito,
                    btnObservarPostulante: response.observarPostulante,
                    btnRegistrarReclamo: response.registrarReclamo,

                    btnRealizarCalificacion: response.realizarCalificacion,
                    btnPublicarResultados: response.publicarResultados,
                    btnExportar:true,

                    btnImportarInformeEscalafonarioSolicitados:response.importarInformeEscalafonarioSolicitados

                }; 
                
            }
            console.log(this.controlesActivos);
        });   
    };
    handleGoAscenso() {
        this.router.navigate(['../../../../'], {
            relativeTo: this.route
        });
    }

    handleLimpiar() {
        this.resetForm();
        this.searchCalificacionEncargatura();
    }

    handleBuscar() {
        this.searchCalificacionEncargatura(true);
    }

    handleSelectTab(e) {
        this.selectedTabIndex = e.index;
        this.setResultadoCalificacion();
        this.searchCalificacionEncargatura();
    }

    buildShared() {
        this.sharedService.setSharedTitle('Calificaciones');
        this.sharedService.setSharedBreadcrumb('Proceso de Encargatura / Calificaciones');
    }

    buildForm() {
        this.form = this.formBuilder.group({
            codigoTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            codigoModular: [null],
            codigoPlaza: [null],
            codigoEstadoCalificacion: [null]
        });
        this.form.get("numeroDocumentoIdentidad").disable();
    }

    resetForm() {
        this.form.reset();        
        this.form.get("codigoTipoDocumentoIdentidad").setValue("-1");
        this.form.get("codigoEstadoCalificacion").setValue("-1");
        this.form.get("numeroDocumentoIdentidad").disable();
    }

    loadCombos() {
        this.loadTipoDocumento();
        this.loadEstado();
    };

    setRequest(butonAccion:boolean=false) {
        const idEtapaProceso = this.idEtapaProceso;
        const idDesarrolloProceso = this.idDesarrolloProceso;
        const codigoEtapa = this.codigoEtapa;
        const codigoResultadoCalificacion = this.codigoResultadoCalificacion;
        const codigoTipoDocumentoIdentidad = Number(this.form.get('codigoTipoDocumentoIdentidad').value);
        const numeroDocumentoIdentidad = this.form.get('numeroDocumentoIdentidad').value;
        const codigoModular = this.form.get('codigoModular').value;
        const codigoPlaza = this.form.get('codigoPlaza').value;
        const codigoEstadoCalificacion = Number(this.form.get('codigoEstadoCalificacion').value);

        this.request = {
            idEtapaProceso: idEtapaProceso,
            idDesarrolloProceso: idDesarrolloProceso,
            codigoEtapa: codigoEtapa,
            codigoResultadoCalificacion: codigoResultadoCalificacion,
            codigoTipoDocumentoIdentidad: codigoTipoDocumentoIdentidad > -1 ? codigoTipoDocumentoIdentidad : null,
            numeroDocumentoIdentidad: numeroDocumentoIdentidad,
            codigoModular: codigoModular,
            codigoPlaza: codigoPlaza,
            codigoEstadoCalificacion: codigoEstadoCalificacion > -1 ? codigoEstadoCalificacion : null,
            butonAccion:butonAccion
        };
    }

    setResultadoCalificacion() {
        if (this.selectedTabIndex == 1) {
            this.codigoResultadoCalificacion = ResultadoCalificacionEnum.ResultadoFinal;
        } else {
            this.codigoResultadoCalificacion = ResultadoCalificacionEnum.ResultadoPreliminar;
        }
    }

    loadTipoDocumento() {
        this.dataService.Encargatura().getComboTipoDocumentoCalificacion().pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.comboLists.listTipoDocumento = result.map((x) => ({
                    ...x,
                    value: x.codigoTipoDocumentoIdentidad,
                    label: x.descripcionTipoDocumentoIdentidad
                }));
            }
        });
    }

    loadEstado() {
        this.dataService.Encargatura().getComboEstadoCalificacion().pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.comboLists.listEstado = result.map((x) => ({
                    ...x,
                    value: x.codigoEstadoCalificacion,
                    label: x.descripcionEstadoCalificacion
                }));
            }
        });
    }

    searchCalificacionEncargatura(butonAccion:boolean=false) {
        this.setRequest(butonAccion);
        switch (this.selectedTabIndex) {
            case 0:
                this.pestanaResultadoPreliminarComponent.updateLista(this.request);
                break;
            case 1:
                this.pestanaResultadoFinalComponent.updateLista(this.request);
                break;
            default:
                break;
        }
    }

    irCalificacion(){
        this.router.navigate(['../../../../calificaciones/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }
    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get("numeroDocumentoIdentidad").setValue("");
        this.maxLengthnumeroDocumentoIdentidad =
            tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
        
        if(tipoDocumento===null || 
           tipoDocumento===undefined || 
           tipoDocumento<=0)this.form.get("numeroDocumentoIdentidad").disable();
        else this.form.get("numeroDocumentoIdentidad").enable();

        this.form
            .get("numeroDocumentoIdentidad")
            .setValidators([
                Validators.minLength(this.maxLengthnumeroDocumentoIdentidad),
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad)
            ]);
    };

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    };
    
    validatexto(){
        if(this.maxLengthnumeroDocumentoIdentidad==8)if(!Number( this.form.get("numeroDocumentoIdentidad").value))this.form.get("numeroDocumentoIdentidad").setValue("");
    };
    
    busquedaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BuscadorServidorPublicoComponent,{
            panelClass: "minedu-buscador-servidor-publico-dialog",
            disableClose: true,
            data: {
                esProceso: false
            }
        });

        this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            if (!response) {
            return;
            }            
            const servidorPublico = response.servidorPublico;
            this.form.get("codigoTipoDocumentoIdentidad").setValue(servidorPublico.codigoTipoDocumentoIdentidad);
            this.selectTipoDocumento(servidorPublico.codigoTipoDocumentoIdentidad);
            this.form.get("numeroDocumentoIdentidad").setValue(servidorPublico.numeroDocumentoIdentidad);
        });
    };
    busquedaCentroTrabajoPersonalizada = () => {
        
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1300px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                    idTipoOperacion: 0,//TablaTipoOperacion.REGISTRAR,
                    registrado: false,
                    // centrosTrabajos: data,
                    currentSession:this.currentSession
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response:any) => {
            const codigoCentroTrabajo = response?.centroTrabajo?.codigoCentroTrabajo;
            if (codigoCentroTrabajo) {
                this.form.get("codigoModular").setValue(codigoCentroTrabajo);
            }
        });

    };
    
    busquedaPlazaPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "1200px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
                currentSession:this.currentSession,
                idEtapaProceso:this.idEtapaProceso,
		        idRegimenLaboral:this.CabeceraDesarrolloProcesoEncargaturaComponent.desarrolloProcesoEncargatura.idRegimenLaboral
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
            }
        });
    };
}