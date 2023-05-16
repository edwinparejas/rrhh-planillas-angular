import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { InformacionPlazaEncargaturaComponent } from "../components/informacion-plaza-encargatura/informacion-plaza-encargatura.component";
import { MotivoNoPublicacionPlazaEncargaturaComponent } from "../components/motivo-no-publicacion-plaza-encargatura/motivo-no-publicacion-plaza-encargatura.component";
import { EstadoConsolidadoEnum, SituacionValidacionEnum, TipoFormatoPlazaEnum } from "../_utils/constants";
import { ENCARGATURA_MESSAGE } from "../_utils/message";
import { saveAs } from "file-saver";
import { RegistroRechazoConsolidadoPlazaEncargaturaComponent } from "../components/registro-rechazo-consolidado-plaza-encargatura/registro-rechazo-consolidado-plaza-encargatura.component";
import { SecurityModel } from "app/core/model/security/security.model";
import { BuscarCentroTrabajoComponent } from "../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BusquedaPlazaComponent } from "../components/busqueda-plaza/busqueda-plaza.component";
import { CabeceraDesarrolloProcesoEncargaturaComponent } from "../components/cabecera-desarrollo-proceso-encargatura/cabecera-desarrollo-proceso-encargatura.component";
import { EntidadSedeService } from "../Services/entidad-sede.service";

@Component({
    selector: 'minedu-encargatura-bandeja-aprobacion-plaza',
    templateUrl: './encargatura-bandeja-aprobacion-plaza.component.html',
    styleUrls: ['./encargatura-bandeja-aprobacion-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaBandejaAprobacionPlazaComponent implements OnInit, AfterViewInit {
    form: FormGroup;

    idEtapaProceso: number;
    idDesarrolloProceso: number;
    idConsolidadoPlaza: number;
    
    selectedTabIndex: number;
    codigoSituacionValidacion: SituacionValidacionEnum;

    displayedColumns : string[];
    /*[
        "rowNum",
        "codigoModular",
        "centroTrabajo",
        "modalidad",
        "nivelEducativo",
        "tipoGestion",
        "codigoPlaza",
        "cargo",
        "especialidad",
        "tipoPlaza",
        "vigenciaInicio",
        "vigenciaFin",
        //"motivoObservacion",
        "acciones"
    ];*/
    dataSource: PlazaEncargaturaDetalleDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    @ViewChild('CabeceraDesarrolloProcesoEncargatura') CabeceraDesarrolloProcesoEncargaturaComponent: CabeceraDesarrolloProcesoEncargaturaComponent;
    loading = false;
    export = false;

    dialogRef: any;
    request = {
        idDesarrolloProceso: null,
        idEtapaProceso: null,
        codigoModular: null,
        codigoPlaza: null,
        codigoSituacionValidacion: null,
        codigoResultadoFinal: null,
        selectedTabIndex: 0,
        butonAccion:false
    };

    consolidadoPlaza: any;
    visibleAprobarRechazar = false;

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
    currentSession: SecurityModel = new SecurityModel();    
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
        this.idConsolidadoPlaza = parseInt(this.route.snapshot.params.cons);

        this.codigoSituacionValidacion = SituacionValidacionEnum.AConvocar;
        this.selectedTabIndex = 0;
    }

    ngOnInit() {
        
        this.initializeComponent();
        
    }
    
    private async initializeComponent() {

        this.dataSource = new PlazaEncargaturaDetalleDataSource(this.dataService);
        this.setDisplayedColumns();
        setTimeout(() => this.buildShared());
        this.buildForm();
        this.handleResponsive();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();   
       
        this.resetForm();
        this.loadConsolidadoPlaza();
        this.setVisibleAprobarRechazar();
        this.setRequest(false);
        this.searchPlazaEncargaturaDetalle(true);
    }
    
    private setVisibleAprobarRechazar(){
        this.visibleAprobarRechazar = (this.consolidadoPlaza != null && this.consolidadoPlaza.codigoEstadoConsolidado == EstadoConsolidadoEnum.Validado)
    }
    private getDreUgelData() {
        this.currentSession.codigoSede=this.entidadSedeService.entidadSede.codigoSede;
        this.currentSession.codigoTipoSede=this.entidadSedeService.entidadSede.codigoTipoSede;
    }

    setDisplayedColumns(){

        if(this.selectedTabIndex == 0){
            this.displayedColumns = [
                "rowNum",
                "codigoModular",
                "centroTrabajo",
                "modalidad",
                "nivelEducativo",
                "tipoGestion",
                "codigoPlaza",
                "cargo",
                "especialidad",
                "tipoPlaza",
                "vigenciaInicio",
                "vigenciaFin",
                //"motivoObservacion",
                "acciones"
            ];
        }
        else{
            this.displayedColumns = [
                "rowNum",
                "codigoModular",
                "centroTrabajo",
                "modalidad",
                "nivelEducativo",
                "tipoGestion",
                "codigoPlaza",
                "cargo",
                "especialidad",
                "tipoPlaza",
                "vigenciaInicio",
                "vigenciaFin",
                "motivoObservacion",
                "acciones"
            ];
        }
        
    }

    ngAfterViewInit() {        
        this.paginator.page.pipe(tap(() => this.searchPlazaEncargaturaDetalle())).subscribe();
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }
    handleGoAscenso() {
        this.router.navigate(['../../../../' + this.idEtapaProceso], {
            relativeTo: this.route
        });
    }

    buildShared() {
        this.sharedService.setSharedTitle('Consolidado de plazas');
        this.sharedService.setSharedBreadcrumb('Proceso de Encargatura / Listado de Plazas');
    }

    buildForm() {
        this.form = this.formBuilder.group({
            codigoModular: [null],
            codigoPlaza: [null]
        });
    }

    resetForm() {
        this.form.reset();
    }

    handleLimpiar() {        
        this.resetForm();
        this.setRequest(false);
        this.searchPlazaEncargaturaDetalle(false);
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
                   
        this.searchPlazaEncargaturaDetalle(false);
    }

    loadConsolidadoPlaza() {
        const request = {
            idConsolidadoPlaza: this.idConsolidadoPlaza
        }
        this.loading = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().getConsolidadoPlazaEncargatura(request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false; 
        })).subscribe((result: any) => {
            if (result) {
                this.consolidadoPlaza = {
                    idConsolidadoPlaza: result.idConsolidadoPlaza,
                    fechaValidacion: result.fechaValidacion,
                    fechaAprobacion: result.fechaAprobacion,
                    fechaRechazo: result.fechaRechazo,
                    detalleMotivoRechazo: result.detalleMotivoRechazo,
                    codigoAprobacion: result.codigoAprobacion,
                    codigoEstadoConsolidado: result.codigoEstadoConsolidado,
                    descripcionEstadoConsolidado: result.descripcionEstadoConsolidado
                };
                this.setVisibleAprobarRechazar();
            }
        });
    }

    handleSelectTab(e: any) {
        this.selectedTabIndex = e.index;
        switch (e.index) {
            case 0:
                this.codigoSituacionValidacion = SituacionValidacionEnum.AConvocar;
                break;
            case 1:
                this.codigoSituacionValidacion = SituacionValidacionEnum.Observada;
                break;
            default:
                break;
        }
        this.setDisplayedColumns();
        this.setRequest(false);
        this.searchPlazaEncargaturaDetalle(false)
    }
    
    handleViewInfo(row: any) {
        this.dialogRef = this.materialDialog.open(InformacionPlazaEncargaturaComponent, {
            panelClass: 'minedu-informacion-plaza-encargatura',
            width: '1080px',
            disableClose: true,
            data: {
                idPlazaEncargaturaDetalle: row.idPlazaEncargaturaDetalle
            }
        });
    }

    handleViewMotivoNoPublicacion(row: any) {
        this.dialogRef = this.materialDialog.open(MotivoNoPublicacionPlazaEncargaturaComponent, {
            panelClass: 'minedu-motivo-no-publicacion-plaza-encargatura',
            width: '1080px',
            disableClose: true,
            data: {
                idPlazaEncargaturaDetalle: row.idPlazaEncargaturaDetalle
            }
        });
    }

    handleExportar() {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => { });
            return;
        }
        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().exportPlazaEncargatura(this.request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.export = false;
        })).subscribe((response: any) => {
            if (response) {
                saveAs(response, "PlazaEncargatura.xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
            } else {
                this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M09, () => { });
            }
        });
    }

    handleAprobarPlazas() {
        var user=this.dataService.Storage().getPassportUserData();
        this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.M72, () => {
            const request = {
                idConsolidadoPlaza: this.idConsolidadoPlaza,
                usuarioModificacion:this.currentSession.nombreUsuario,
                numeroDocumento:this.currentSession.numeroDocumento,
                tipoNumeroDocumento:this.currentSession.tipoNumeroDocumento,
                solicitante:this.currentSession.nombreCompleto,
                codigoCentroTrabajo:this.currentSession.codigoSede,
                codigoRol:this.currentSession.codigoRol,
                primerApellidoAprobador:user.APELLIDO_PATERNO,
                segundoApellidoAprobador:user.APELLIDO_MATERNO,
                nombresAprobador:user.NOMBRES_USUARIO

            }
            this.loading = true;
            this.dataService.Spinner().show('sp6');
            this.dataService.Encargatura().approveConsolidadoPlazaEncargatura(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => { });
                        this.handleGoAscenso();
                    } else {
                        this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                    }
                }
            })
        }, () => { });
    }

    handleRechazarPlazas() {
        this.dialogRef = this.materialDialog.open(RegistroRechazoConsolidadoPlazaEncargaturaComponent, {
            panelClass: 'minedu-registro-rechazo-consolidado-plaza-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idConsolidadoPlaza: this.idConsolidadoPlaza,
                currentSession:this.currentSession
            }
        });
        this.dialogRef.afterClosed().subscribe((result) => {
            if (result.event == 'Save') {
                this.handleGoAscenso();
            }
        });
    }

    setRequest(butonAccion:boolean) {

        const idDesarrolloProceso = this.idDesarrolloProceso;
        const idEtapaProceso = this.idEtapaProceso;
        const codigoSituacionValidacion = this.codigoSituacionValidacion;
        const codigoModular = this.form.get("codigoModular").value;
        const codigoPlaza = this.form.get("codigoPlaza").value;      
        let selectedTabIndex = this.selectedTabIndex;
        if(this.selectedTabIndex === 1)
            selectedTabIndex=2

        this.request = {
            idDesarrolloProceso: idDesarrolloProceso,
            idEtapaProceso: idEtapaProceso,
            codigoSituacionValidacion: codigoSituacionValidacion > -1 ? codigoSituacionValidacion : null,
            codigoModular: codigoModular,
            codigoPlaza: codigoPlaza,
            codigoResultadoFinal: null,
            selectedTabIndex: selectedTabIndex,
            butonAccion: butonAccion
        };
    }

    searchPlazaEncargaturaDetalle(firstTime: boolean = false) {
        //this.setRequest();
        if (firstTime) {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
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

export class PlazaEncargaturaDetalleDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {

        this._loadingChange.next(false);
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().searchPlazaEncargaturaPaginado(data, pageIndex, pageSize).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this._loadingChange.next(false);
        })).subscribe((result: any) => {
            this._dataChange.next(result || []);
            this.totalRegistros = (result || []).length === 0 ? 0 : result[0].totalRegistros;
            if ((result || []).length === 0) {
                this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M09, () => { });
            }
        });
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalRegistros;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}