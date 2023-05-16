import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { EstadoValidacionPlazaEnum, SituacionValidacionEnum, TipoFormatoPlazaEnum } from '../_utils/constants';
import { ENCARGATURA_MESSAGE } from '../_utils/message';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { ControlesActivos } from '../interfaces/encargatura.interface';
import { MatDialog } from '@angular/material/dialog';
import { CabeceraDesarrolloProcesoEncargaturaComponent } from '../components/cabecera-desarrollo-proceso-encargatura/cabecera-desarrollo-proceso-encargatura.component';
import { BusquedaPlazaComponent } from '../components/busqueda-plaza/busqueda-plaza.component';
import { BuscarCentroTrabajoComponent } from '../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { TablaTipoOperacion } from '../models/encargatura.model';
import { PestanaPlazaEncargaturaComponent } from '../components/pestana-plaza-encargatura/pestana-plaza-encargatura.component';
import { EntidadSedeService } from '../Services/entidad-sede.service';

@Component({
    selector: 'minedu-encargatura-bandeja-plaza',
    templateUrl: './encargatura-bandeja-plaza.component.html',
    styleUrls: ['./encargatura-bandeja-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaBandejaPlazaComponent implements OnInit {
    form: FormGroup;
    
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    codigoEtapa: number;
    codigoMaestroProceso: number;

    selectedTabIndex: number;
    codigoSituacionValidacion: SituacionValidacionEnum;
    estadoValidacionPlazaEnum = EstadoValidacionPlazaEnum;
    plazaEncargatura: any;
    fechaCorte = new Date();
    loading = false;
    //visible = false;
    comboLists = {
        listResultadoFinal: []
    };
    dialogRef: any;
    currentSession: SecurityModel = new SecurityModel();    
    passport={
        idNivelInstancia: null,        
        idEntidadSede: null, 
        idRolPassport: null
    }
    controlesActivos:ControlesActivos = {
        btnIncorporarPlazas: false,
        btnPlazasConvocar:false,
        btnPlazasObservadas:false,    
        btnFinalizarValidacionPlazas:false,
        btnPlazasDesiertasCD:false,
        btnPublicarPlazas:false,
        btnAperturarPlazas:false,
        btnVerPlazasPDF:false, 
        btnExportar:false, 
    }
    request = {
        idDesarrolloProceso: 0,
        idEtapaProceso: 0,
        codigoModular: null,
        codigoPlaza: null,
        codigoSituacionValidacion: null,
        codigoResultadoFinal: null,
        selectedTabIndex: 0,
        butonAccion:false,
        CodigoTipoSede:""
    };
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

    @ViewChild('CabeceraDesarrolloProcesoEncargatura') CabeceraDesarrolloProcesoEncargaturaComponent: CabeceraDesarrolloProcesoEncargaturaComponent;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,  
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private entidadSedeService: EntidadSedeService
    ) {
        this.codigoEtapa = Number(this.route.snapshot.params.etapa);
        this.codigoMaestroProceso = Number(this.route.snapshot.params.proceso);

        this.idEtapaProceso = Number(this.route.snapshot.params.id);
        this.idDesarrolloProceso = Number(this.route.snapshot.params.desa);
        
        this.codigoSituacionValidacion = SituacionValidacionEnum.PrePublicada;
        this.selectedTabIndex = 0;
    }

    ngOnInit() {
        setTimeout(() => this.buildShared());
        this.initializeComponent();        
        this.setRequest(false);
    }
    
    private async initializeComponent() {
        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();
        this.handleResponsive();
        this.buildSeguridad();
        this.resetForm();        
        this.loadResultadoFinal();
        this.loadPlazaEncargatura();
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

    handleGoAscenso() {
        this.router.navigate(['../../../../../'], {
            relativeTo: this.route
        });
    }

    buildShared() {
        this.sharedService.setSharedTitle('Plazas');
        this.sharedService.setSharedBreadcrumb('Proceso de Encargatura / Plazas');
    }

    buildForm() {
        this.form = this.formBuilder.group({
            codigoModular: [null],
            codigoPlaza: [null],
            codigoResultadoFinal: [null]
        });
    }

    buildSeguridad() {
        const data = {
            idEtapaProceso:this.idEtapaProceso, 
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol: this.currentSession.codigoRol
        }
        this.dataService.Encargatura().getAccesoUsuarioPlaza(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                
                this.controlesActivos = { 
                    btnIncorporarPlazas: response.incorporarPlazas,
                    btnPlazasConvocar:response.plazasConvocar,
                    btnPlazasObservadas:response.plazasObservadas,    
                    btnFinalizarValidacionPlazas:response.finalizarValidacionPlazas,
                    btnPlazasDesiertasCD:response.plazasDesiertasCD,
                    btnPublicarPlazas:response.publicarPlazas,
                    btnAperturarPlazas:response.aperturarPlazas,                    
                    btnVerPlazasPDF:true, 
                    btnExportar:true, 
                 }; 
            }
        });  
    }

    handleLimpiar() {
        this.resetForm();
    }

    handleBuscar() {
        if(this.form.valid==false)
        {
            let mensajes="";
            if (this.form.controls.codigoModular.valid == false) {
                mensajes=(mensajes.length==0?mensajes+ENCARGATURA_MESSAGE.M38:mensajes+", "+ENCARGATURA_MESSAGE.M38);                
            }
            if (this.form.controls.codigoPlaza.valid == false) {
                mensajes=(mensajes.length==0?mensajes+ENCARGATURA_MESSAGE.M64:mensajes+", "+ENCARGATURA_MESSAGE.M64);                 
            }
            this.dataService.Message().msgWarning(mensajes, () => { });
            return;
        }
       this.setRequest(true);
    }

    handleSelectTab(e) {
        this.setTabIndex(e.index);
    }

    resetForm() {
        this.form.reset();
        this.setRequest(false);
    }

    loadResultadoFinal() {
        this.dataService.Encargatura().getComboResultadoFinal().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listResultadoFinal = result.map((x) => ({
                    ...x,
                    value: x.codigoResultadoFinal,
                    label: x.descripcionResultadoFinal
                }));
            }
        });
    }

    loadPlazaEncargatura(reloadOnlyChild = false) {
        const request = {
            IdEtapaProceso: this.idEtapaProceso,
            IdDesarrolloProceso: this.idDesarrolloProceso,
            CodigoTipoSede:this.currentSession.codigoTipoSede
        }
        debugger
        this.loading = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().getPlazaEncargatura(request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false; 
        })).subscribe((result: any) => {
            if (result) {
                if(result.codigoEtapa>0){
                    this.plazaEncargatura = {
                        idPlazaEncargatura: result.idPlazaEncargatura,
                        idEtapaProceso: result.idEtapaProceso,
                        fechaPublicacion: result.fechaPublicacion,
                        idDesarrolloProceso: result.idDesarrolloProceso,
                        idAlcanceProceso: result.idAlcanceProceso,
                        codigoEstadoValidacionPlaza: result.codigoEstadoValidacionPlaza,
                        descripcionEstadoValidacionPlaza: result.descripcionEstadoValidacionPlaza,
                        codigoEtapa: result.codigoEtapa,
                        descripcionCodigoEtapa: result.descripcionCodigoEtapa,
                        codigoDescripcionMaestroProceso: result.codigoDescripcionMaestroProceso,
                        descripcionMaestroProceso: result.descripcionMaestroProceso,
                        UsuarioModificacion:this.currentSession.nombreUsuario,
                        CodigoSede:this.currentSession.codigoSede,
                        FechaInicioNacional:result.fechaInicioNacional,
                        FechaFinNacional:result.fechaFinNacional
                    }
                }
            }
            console.log("loadPlazaEncargatura", !!this.plazaEncargatura);
            //this.visible = result ? true: false;
        });
    }

    setTabIndex(index: number) {
        this.selectedTabIndex = index;
        switch (index) {
            case 0:
                this.codigoSituacionValidacion = SituacionValidacionEnum.PrePublicada;
                break;
            case 1:
                this.codigoSituacionValidacion = SituacionValidacionEnum.AConvocar;
                break;
            case 2:
                this.codigoSituacionValidacion = SituacionValidacionEnum.Observada;
                break;
            case 3:
                this.codigoSituacionValidacion = SituacionValidacionEnum.AConvocar;
                break;
            default:
                break;
        }
        this.setRequest(false);
    }

    setRequest(butonAccion:boolean) {
        
        const idDesarrolloProceso = this.idDesarrolloProceso;
        const idEtapaProceso = this.idEtapaProceso;
        const codigoSituacionValidacion = this.codigoSituacionValidacion;
        const codigoModular = this.form.get("codigoModular").value;
        const codigoPlaza = this.form.get("codigoPlaza").value;
        const codigoResultadoFinal = this.selectedTabIndex == 3 ? this.form.get("codigoResultadoFinal").value : -1;
        const selectedTabIndex = this.selectedTabIndex;

        this.request = {
            idDesarrolloProceso: idDesarrolloProceso,
            idEtapaProceso: idEtapaProceso,
            codigoSituacionValidacion: codigoSituacionValidacion > -1 ? codigoSituacionValidacion : null,
            codigoModular: codigoModular,
            codigoPlaza: codigoPlaza,
            codigoResultadoFinal: codigoResultadoFinal > -1 ? codigoResultadoFinal : null,
            selectedTabIndex: selectedTabIndex,
            butonAccion: butonAccion,
            CodigoTipoSede:this.currentSession.codigoTipoSede
        };
    }

    irPlaza(){
        window.location.reload();
    }
    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1300px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                    //idTipoOperacion: 0,//TablaTipoOperacion.REGISTRAR,
                    //registrado: false,
                    // centrosTrabajos: data,
                    codigoSede: this.currentSession.codigoSede,
                    idEtapaProceso: this.idEtapaProceso,
                    currentSession:this.currentSession
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response:any) => {
            const codigoCentroTrabajo = response?.centroTrabajo?.codigo_centro_trabajo;
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