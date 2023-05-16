import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { saveAs } from "file-saver";
import { MatDialog } from '@angular/material/dialog';
import { MotivoCancelacionEtapaProcesoEncargaturaComponent } from '../components/motivo-cancelacion-etapa-proceso-encargatura/motivo-cancelacion-etapa-proceso-encargatura.component';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { EstadoEtapaDesarolloEnum, EstadoProcesoEnum } from "../_utils/constants";
import { ENCARGATURA_MESSAGE } from "../_utils/message";
import { Moment } from "moment";
import { MatDatepicker } from "@angular/material/datepicker";
import { fechas } from "../models/fechas.model";
import { CodigoDreUgelService } from "app/main/apps/acciones/pronoei/services/codigo-dre-ugel.service";
import { EntidadSedeService } from "../Services/entidad-sede.service";

@Component({
    selector: 'minedu-encargatura-bandeja-proceso',
    templateUrl: './encargatura-bandeja-proceso.component.html',
    styleUrls: ['./encargatura-bandeja-proceso.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaBandejaProcesoComponent implements OnInit, AfterViewInit {
    form: FormGroup;
    loading: false;
    export = false;
    now = new Date();
    comboLists = {
        listAnio: [],
        listRegimenLaboral: [],
        listProceso: [],
        listEstadoDesarrollo: [],
    };
    displayedColumns: string[] = [
        "rowNum",
        "codigo",
        "regimenLaboral",
        "proceso",
        "numeroConvocatoria",
        "etapa",
        "fechaCreacion",
        "estado",
        "acciones"
    ];
    accesoUsarioData: acceso[];
    dataSource: ProcesoDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    EstadoProcesoEnum=EstadoProcesoEnum;

    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    request = {
        codigoTipoSede: null,
        codigoSede: null,
        codigoRolPassport: null,
        butonAccion:null,
        idAnio: null,
        idRegimenLaboral: null,
        codigoDescripcionMaestroProceso: null,
        codigoEstadoDesarrollo: null
    };
    dialogRef: any;
    currentSession: SecurityModel = new SecurityModel();
    // roles = {
    //     directorGI: 'AYNI_041',
    //     comiteSeleccionEncargatura: 'AYNI_042',
    //     JefeGI: 'AYNI_043'
    // };
    // visibleComiteEncargatura = false;
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
    ) { }

    ngOnInit() {
        this.now=fechas.obtenerFechaMasAnios(this.now,1);
        setTimeout(() => this.buildShared());
        this.initializeComponent();
    }

    private async initializeComponent() {        
        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();
        this.dataSource = new ProcesoDataSource(this.dataService);
        
        this.handleResponsive();
        this.buildSeguridad();
        this.loadCombos();
        this.resetForm();
        this.searchProcesoEncargatura(false,true);        

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
    
    private async getDreUgelData() {
        this.currentSession.codigoSede=this.entidadSedeService.entidadSede.codigoSede;
        this.currentSession.codigoTipoSede=this.entidadSedeService.entidadSede.codigoTipoSede;
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    ngAfterViewInit() {
        this.paginator.page.pipe(tap(() => this.searchProcesoEncargatura())).subscribe();
    }

    buildShared() {
        this.sharedService.setSharedTitle('Desarrollo del Proceso de Encargatura');
        this.sharedService.setSharedBreadcrumb('Proceso de Encargatura');
    }

    buildSeguridad() {
        
        const request = {
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol: this.currentSession.codigoRol
        }
        this.dataService.Encargatura().getAccesoUsuarioDesarrollo(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: acceso[]) => {
            if (result) {
                this.accesoUsarioData=result;
            }
        });
    };

    buildForm() {
        this.form = this.formBuilder.group({
            idAnio: [null, Validators.required],
            idRegimenLaboral: ["-1"],
            codigoDescripcionMaestroProceso: ["-1"],
            codigoEstadoDesarrollo: ["-1"]
        });
        this.form.get("idRegimenLaboral").valueChanges.subscribe((value) => {
            if(value=='-1'){
                this.form.get('codigoDescripcionMaestroProceso').setValue("-1");
            }
        });
    }

    handleLimpiar(): void {
        this.resetForm();
        this.searchProcesoEncargatura(false,true);
    }

    handleBuscar(): void {
        this.searchProcesoEncargatura(true,true);
    }

    handleExportar() {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => { });
            return;
        }
        this.setRequest(false);
        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().exportProcesoEncargatura(this.request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.export = false;
        })).subscribe((response: any) => {
            if (response) {
                saveAs(response.body, response.headers.get("x-file-name"), {
                    type: response.headers.get("content-type")
                });
            } else {
                this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M09, () => { });
            }
        });
    }

    handleGoPlazas(row: any) {
        this.router.navigate(['./plazas/' + row.codigoDescripcionMaestroProceso + '/' + row.codigoEtapa + '/' + row.idEtapaProceso + '/' + row.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }

    handleGoPostulantes(row: any) {
        this.router.navigate(['./postulantes/' + row.codigoDescripcionMaestroProceso + '/' + row.codigoEtapa + '/' + row.idEtapaProceso + '/' + row.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }

    handleGoCalificaciones(row: any) {
        this.router.navigate(['./calificaciones/' + row.codigoEtapa + '/' + row.idEtapaProceso + '/' + row.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }

    handleGoAdjudicacion(row: any) {
        this.router.navigate(['./adjudicacion/' + row.codigoEtapa + '/' + row.idEtapaProceso + '/' + row.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }

    estaCancelado(row: any) {
        return (row.codigoEstadoDesarrollo == EstadoEtapaDesarolloEnum.Cancelado);
    }

    estadoPrePublicacionPlaza(row: any) {
        let existe = this.accesoUsarioData.filter(acceso => acceso.prepublicacionplazas == 1 && acceso.codEtapa==row.codigoEtapa);
        return existe.length>0;
    }
    estadoPlaza(row: any) {
        let existe = this.accesoUsarioData.filter(acceso => acceso.plazas == 1 && acceso.codEtapa==row.codigoEtapa);
        return existe.length>0;
    }
    estadoPostulante(row: any) {
        let existe = this.accesoUsarioData.filter(acceso => acceso.postulantes == 1 && acceso.codEtapa==row.codigoEtapa);
        return existe.length>0;
    }
    estadoCalificacion(row: any) {
        let existe = this.accesoUsarioData.filter(acceso => acceso.calificaciones == 1 && acceso.codEtapa==row.codigoEtapa);
        return existe.length>0;
    }
    estadoAdjudicacion(row: any) {
        let existe = this.accesoUsarioData.filter(acceso => acceso.adjudicacion == 1 && acceso.codEtapa==row.codigoEtapa);
        return existe.length>0;
    }
    handleVerMotivoCancelacion(row: any) {
        this.dialogRef = this.materialDialog.open(MotivoCancelacionEtapaProcesoEncargaturaComponent, {
            panelClass: 'minedu-motivo-cancelacion-etapa-proceso-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idEtapaProceso: row.idEtapaProceso,
                idDesarrolloProceso: row.idDesarrolloProceso
            }
        });
    }

    resetForm() {
        this.form.reset();      
        this.form.get('idAnio').setValue(new Date());
        this.form.get('idRegimenLaboral').setValue("-1");
        this.form.get('codigoDescripcionMaestroProceso').setValue("-1");
        this.form.get('codigoEstadoDesarrollo').setValue("-1");
    }

    clearFormField(event: any, name: string) {
        this.form.get(name).setValue(null);
        event.stopPropagation();
    }

    setRequest(butonAccion:boolean=false) {
        const codigoTipoSede = this.currentSession.codigoTipoSede;
        const codigoSede = this.currentSession.codigoSede;
        const codigoRolPassport = this.currentSession.codigoRol;
        const idAnio = this.form.get("idAnio").value.getFullYear();
        const idRegimenLaboral = this.form.get("idRegimenLaboral").value;
        const codigoDescripcionMaestroProceso = this.form.get("codigoDescripcionMaestroProceso").value;
        const codigoEstadoDesarrollo = this.form.get("codigoEstadoDesarrollo").value;

        this.request = {
            codigoTipoSede: codigoTipoSede,
            codigoSede: codigoSede,
            codigoRolPassport: codigoRolPassport,
            butonAccion: butonAccion,
            idAnio: idAnio > -1 ? idAnio : null,
            idRegimenLaboral: idRegimenLaboral > -1 ? idRegimenLaboral : null,
            codigoDescripcionMaestroProceso: codigoDescripcionMaestroProceso > -1 ? codigoDescripcionMaestroProceso : null,
            codigoEstadoDesarrollo: codigoEstadoDesarrollo > -1 ? codigoEstadoDesarrollo : null
        };
    }

    searchProcesoEncargatura(butonAccion:boolean=false,firstTime: boolean = false) {
        this.setRequest(butonAccion);
        if (firstTime) {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
    }

    loadCombos() {
        this.loadAnio();
        this.loadRegimenLaboral();
        this.loadProceso();
        this.loadEstadoDesarrollo();
    };

    loadAnio() {
        const request = {
            codigoTipoSede: this.currentSession.codigoTipoSede,
            codigoSede: this.currentSession.codigoSede
        }
        this.dataService.Encargatura().getComboAnio(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listAnio = result.map((x) => ({
                    ...x,
                    value: x.idAnio,
                    label: x.descripcionAnio
                }));
            }
        });
    }

    loadRegimenLaboral() {
        const data = {
            idEtapaProceso:0,
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol: this.currentSession.codigoRol
        }
        this.dataService.Encargatura().getComboRegimenLaboral(data).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listRegimenLaboral = result.map((x) => ({
                    ...x,
                    value: x.idRegimenLaboral,
                    label: x.descripcionRegimenLaboral
                }));
            }
        });
    }

    loadProceso() {
        const data = {
            idEtapaProceso:0,
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol: this.currentSession.codigoRol
        }
        this.dataService.Encargatura().getComboDescripcionMaestroProceso(data).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listProceso = result.map((x) => ({
                    ...x,
                    value: x.codigoDescripcionMaestroProceso,
                    label: x.descripcionMaestroProceso
                }));
            }
        });
    }

    loadEstadoDesarrollo() {
        this.dataService.Encargatura().getComboEstadoEtapaDesarrollo().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listEstadoDesarrollo = result.map((x) => ({
                    ...x,
                    value: x.codigoEstadoEtapaDesarrollo,
                    label: x.descripcionEstadoEtapaDesarrollo
                }));
            }
        });
    }

}

export class ProcesoDataSource extends DataSource<any> {
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
        this.dataService.Encargatura().searchProcesoEncargaturaPaginado(data, pageIndex, pageSize).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this._loadingChange.next(false);
        })).subscribe((result: any) => {
            this._dataChange.next(result || []);
            this.totalRegistros = (result || []).length === 0 ? 0 : result[0].totalRegistros;
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

export class acceso {

    codEtapa: number;
    prepublicacionplazas: number;
    plazas: number;
    postulantes: number;
    calificaciones: number;
    adjudicacion: number;
    constructor() {
    }
}