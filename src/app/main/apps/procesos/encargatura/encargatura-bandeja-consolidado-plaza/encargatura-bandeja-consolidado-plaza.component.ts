import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { ENCARGATURA_MESSAGE } from "../_utils/message";
import { saveAs } from "file-saver";
import { MatDialog } from "@angular/material/dialog";
import { MotivoRechazoConsolidadoPlazaEncargaturaComponent } from "../components/motivo-rechazo-consolidado-plaza-encargatura/motivo-rechazo-consolidado-plaza-encargatura.component";
import { EstadoConsolidadoEnum } from "../_utils/constants";
import { EntidadSedeService } from "../Services/entidad-sede.service";


@Component({
    selector: 'minedu-encargatura-bandeja-consolidado-plaza',
    templateUrl: './encargatura-bandeja-consolidado-plaza.component.html',
    styleUrls: ['./encargatura-bandeja-consolidado-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaBandejaConsolidadoPlazaComponent implements OnInit, AfterViewInit {
    idEtapaProceso: number;
    form: FormGroup;
    loading = false;
    export = false;
    comboLists = {
        listInstancia: [],
        listSubinstancia: [],
        listEstadoConsolidado: []
    };
    displayedColumns: string[] = [
        "rowNum",
        "instancia",
        "subinstancia",
        "estado",
        "fechaValidacion",
        "fechaAprobacion",
        "fechaRechazo",
        "acciones"
    ];
    dataSource: ConsolidadoPlazaEncargaturaDataSource | null;
    totalesData= {
        totalRegistros: 0,
        totalValidado: 0,
        totalPendiente: 0,
        totalAprobado:0,
        totalRechazado: 0
    };
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    request = {
        idEtapaProceso: 0,
        idInstancia: 0,
        idSubinstancia: null,
        codigoEstadoConsolidado: null
    };
    dialogRef: any;
    aprobacion: any;
    visibleAprobarMasivo = true;
    visibleGenerarListadoPlazas = true;
    visibleVerListadoPlazas = false;
    estadoConsolidadoEnum = EstadoConsolidadoEnum;
    currentSession: SecurityModel = new SecurityModel();
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
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog,
        private entidadSedeService: EntidadSedeService
    ) {
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
    }

    ngOnInit(): void {
        setTimeout(() => this.buildShared());
        this.initializeComponent();
    }

    private async initializeComponent() {        
        this.buildForm();  
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();      
        this.dataSource = new ConsolidadoPlazaEncargaturaDataSource(this.dataService);

        this.handleResponsive();
        this.loadInstancia();
        this.loadAprobacion();
        this.loadEstadoConsolidado();
        this.buildSeguridad();
        this.resetForm();
    }
    
    private async getDreUgelData() {
        this.currentSession.codigoSede=this.entidadSedeService.entidadSede.codigoSede;
        this.currentSession.codigoTipoSede=this.entidadSedeService.entidadSede.codigoTipoSede;
    }

    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.searchConsolidadoPlazaEncargatura(true))).subscribe();
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    handleGoAscenso() {
        this.router.navigate(['../../../../../bandejas/aprobacionespendientes'], {
            relativeTo: this.route
        });
    }

    buildShared() {
        this.sharedService.setSharedTitle('Consolidado de plazas');
        this.sharedService.setSharedBreadcrumb('Proceso de Encargatura / Consolidado de plazas');
    }

    buildSeguridad() {
        this.visibleAprobarMasivo = this.aprobacion.visibleAprobarMasivo;
        this.visibleGenerarListadoPlazas = this.aprobacion.visibleGenerarListadoPlazas;
        this.visibleVerListadoPlazas = this.aprobacion.visibleVerListadoPlazas;
    };

    buildForm() {
        this.form = this.formBuilder.group({
            idInstancia: [null, Validators.required],
            idSubinstancia: ["-1"],
            codigoEstadoConsolidado: ["-1"]
        });
        this.form.get("idInstancia").valueChanges.subscribe((value) => {
            this.loadSubinstancia();
        });
    }

    resetForm() {
        this.form.get('idSubinstancia').setValue("-1");
        this.form.get('codigoEstadoConsolidado').setValue("-1");
    }

    handleLimpiar() {
        this.resetForm();
        this.searchConsolidadoPlazaEncargatura(true);
    }

    clearFormField(event: any, name: string) {
        this.form.get(name).setValue(null);
        event.stopPropagation();
    }
    
    handleBuscar() {
        this.searchConsolidadoPlazaEncargatura(true);
    }

    loadAprobacion() {
        const request = {
            idEtapaProceso: this.idEtapaProceso
        }
        this.loading = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().getAprobacionConsolidadoPlazaEncargatura(request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false; 
        })).subscribe((result: any) => {
            if (result) {
                this.aprobacion = {
                    visibleAprobarMasivo: result.visibleAprobarMasivo,
                    visibleGenerarListadoPlazas: result.visibleGenerarListadoPlazas,
                    visibleVerListadoPlazas: result.visibleVerListadoPlazas,
                    codigoDocumentoGenerado: result.codigoDocumentoGenerado
                };
                this.buildSeguridad();
            }
        });
    }

    loadInstancia() {
        const request = {
            codigoSede: this.currentSession.codigoSede,
            activo:true
        }
        this.dataService.Encargatura().getComboInstancia(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listInstancia = result.map((x: any) => ({
                    ...x,
                    value: x.id,
                    label: x.descripcionInstancia
                }));
                debugger
                this.form.get("idInstancia").setValue(this.comboLists.listInstancia[0]?.id);
                this.searchConsolidadoPlazaEncargatura(true);
            }
        });
    }

    loadSubinstancia() {
        const request = {
            idInstancia: this.form.get("idInstancia").value,
            activo:true
        }
        this.dataService.Encargatura().getComboSubinstancia(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listSubinstancia = result.map((x: any) => ({
                    ...x,
                    value: x.id,
                    label: x.descripcionSubinstancia
                }));
            }
        });
    }

    loadEstadoConsolidado() {
        this.dataService.Encargatura().getComboEstadoConsolidado().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listEstadoConsolidado = result.map((x: any) => ({
                    ...x,
                    value: x.codigoEstadoConsolidado,
                    label: x.descripcionEstadoConsolidado
                }));
            }
        });
    }

    setRequest() {
        const idEtapaProceso = this.idEtapaProceso;
        const idInstancia = this.form.get("idInstancia").value;
        const idSubinstancia = this.form.get("idSubinstancia").value;
        const codigoEstadoConsolidado = this.form.get("codigoEstadoConsolidado").value;

        this.request = {
            idEtapaProceso: idEtapaProceso,
            idInstancia: idInstancia,
            idSubinstancia: idSubinstancia > -1 ? idSubinstancia : null,
            codigoEstadoConsolidado: codigoEstadoConsolidado > -1 ? codigoEstadoConsolidado : null,
        };
    }

    searchConsolidadoPlazaEncargatura(firstTime: boolean = false) {
        this.setRequest();
        this.loadTotales();
        if (firstTime) {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }        
    }
    
    loadTotales(){
        this.dataService.Encargatura().totalesConsolidadoPlaza(this.request).pipe(catchError(() => {
            this.totalesData = {
                totalRegistros: 0,
                totalValidado: 0,
                totalPendiente: 0,
                totalAprobado:0,
                totalRechazado: 0
            };
            return of(null);
        }), finalize(() => { })).subscribe((result: any) => {
            if (result) {                
                this.totalesData = {
                    totalRegistros: result.totalRegistros,
                    totalValidado: result.totalValidado,
                    totalPendiente: result.totalPendiente,
                    totalAprobado: result.totalAprobado,
                    totalRechazado: result.totalRechazado
                };
            }
            else{
                this.totalesData = {
                    totalRegistros: 0,
                    totalValidado: 0,
                    totalPendiente: 0,
                    totalAprobado:0,
                    totalRechazado: 0
                };
            }
        });
    }
    handleAprobarMasivo() {
        var user=this.dataService.Storage().getPassportUserData();

        this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.M233, () => {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
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
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().bulkApproveConsolidadoPlazaEncargatura(request).pipe(
                catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000,() => { });
                        this.loadAprobacion();
                        this.searchConsolidadoPlazaEncargatura(true);
                    } else {
                        this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M10, () => { });
                    }
                }
            })
        }, () => { });
    }

    handleGenerarListadoPlazas() {
        this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.M112, () => {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
                usuarioModificacion:this.currentSession.nombreUsuario
            }
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().generateConsolidadoPlazaEncargatura(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => { });
                        this.loadAprobacion();
                    } else {
                        this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                    }
                }
            })
        }, () => { });
    }

    handleVerListadoPlazas() {
        this.loading = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().downloadDocumentoPublicado(this.aprobacion.codigoDocumentoGenerado).pipe(catchError((e) => of(e)), finalize(() => {
            this.dataService.Spinner().hide("sp6")
            this.loading = false;
        })).subscribe((result: any) => {
            if (result) {
                saveAs(result, "DocumentoGenerado.pdf");
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO DESCARGAR DOCUMENTO SUSTENTO"', () => { });
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
        this.dataService.Encargatura().exportConsolidadoPlazaEncargaturaEncargatura(this.request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.export = false;
        })).subscribe((response: any) => {
            if (response) {
                saveAs(response, "ConsolidadoPlazas.xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
            } else {
                this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M09, () => { });
            }
        });
    }

    handleGoPlazas(row: any) {
        this.router.navigate(['../../consolidado/aprobacion/' + row.idEtapaProceso + '/' + row.idDesarrolloProceso + '/' + row.idConsolidadoPlaza], {
            relativeTo: this.route
        });
    }

    handleVerMotivoRechazo(row: any) {
        this.dialogRef = this.materialDialog.open(MotivoRechazoConsolidadoPlazaEncargaturaComponent, {
            panelClass: 'minedu-motivo-rechazo-consolidado-plaza-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idPlazaEncargatura: row.idPlazaEncargatura
            }
        });
    }
}

export class ConsolidadoPlazaEncargaturaDataSource extends DataSource<any> {
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
        this.dataService.Encargatura().searchConsolidadoPlazaEncargaturaPaginado(data, pageIndex, pageSize).pipe(catchError(() => of([])), finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide("sp6");
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