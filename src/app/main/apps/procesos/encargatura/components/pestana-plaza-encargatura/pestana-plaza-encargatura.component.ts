import { AfterViewInit, Component, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from "@minedu/animations/animations";
import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { DataService } from '../../../../../../core/data/data.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { saveAs } from "file-saver";
import { MatDialog } from '@angular/material/dialog';
import { InformacionPlazaEncargaturaComponent } from '../informacion-plaza-encargatura/informacion-plaza-encargatura.component';
import { RegistroDocumentoSustentoEncargaturaComponent } from '../registro-documento-sustento-encargatura/registro-documento-sustento-encargatura.component';
import { MotivoNoPublicacionPlazaEncargaturaComponent } from '../motivo-no-publicacion-plaza-encargatura/motivo-no-publicacion-plaza-encargatura.component';
import { EstadoResultadoFinalEnum, EstadoValidacionPlazaEnum, EtapaEnum, SituacionValidacionEnum } from '../../_utils/constants';
import { RegistroIncorporarPlazaEncargaturaComponent } from '../registro-incorporar-plaza-encargatura/registro-incorporar-plaza-encargatura.component';
import { ENCARGATURA_MESSAGE } from '../../_utils/message';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { SecurityModel } from 'app/core/model/security/security.model';

@Component({
    selector: "minedu-pestana-plaza-encargatura",
    templateUrl: "./pestana-plaza-encargatura.component.html",
    styleUrls: ["./pestana-plaza-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PestanaPlazaEncargaturaComponent implements OnInit, AfterViewInit, OnChanges {
    loading = false;
    export = false;
    displayedColumns: string[];
    dataSource: PlazaEncargaturaDataSource | null;
    selection = new SelectionModel<any>(true, []);
    desSelection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    totalSelected=false;

    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    
    @Input() selectedTabIndex: number;
    @Input() plazaEncargatura: any;
    @Input() controlesActivos: any;
    @Input() request: any;
    @Input() codigoMaestroProceso: number;
    @Input() codigoEtapa: number;
    @Input() idEtapaProceso: number;
    @Input() idDesarrolloProceso: number;
    @Input() currentSession:  SecurityModel = new SecurityModel(); 

    @Output() onChangePlazaEncargatura: EventEmitter<boolean>;
    @Output() onChangeTabIndex: EventEmitter<number>;

    dialogRef: any;
    fechaMigrada = new Date();


    situacionValidacionEnum = SituacionValidacionEnum;
    EstadoResultadoFinalEnum = EstadoResultadoFinalEnum;
    editable = false;
    especial = false;

    visibleIncorporarPlazas = false;
    visibleFechaCorte = false;
    visibleMigrarPlaza = false;
    visibleFechaMigrada = false;
    visiblePlazasConvocar = false;
    visiblePlazasObservadas = false;
    visibleExportar = false;
    visibleVerObservacion = false;

    nombreUsuario: string;
    tituloExportarExcel:string;
    tituloTotalPlazas:string;
    tituloTotalPlazasSeleccionadas:string="Plazas Seleccionadas";
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
        private dataService: DataService, 
        private materialDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        @Inject(LOCALE_ID) private locale: string
    ) {
        this.onChangePlazaEncargatura = new EventEmitter();
        this.onChangeTabIndex = new EventEmitter();
        this.dataSource = new PlazaEncargaturaDataSource(this.dataService);
    }

    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.searchPlazaEncargatura(false))).subscribe();
    }

    ngOnChanges(): void {        
        this.initializeComponent();
        this.searchPlazaEncargatura(true);
    }

    ngOnInit(): void {
        
        this.setDisplayedColumns();
        this.handleResponsive();

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

    initializeComponent() {
        this.visibleIncorporarPlazas = false;
        this.visibleFechaCorte = false;
        this.visibleMigrarPlaza = false;
        this.visibleFechaMigrada = false;
        this.visiblePlazasConvocar = false;
        this.visiblePlazasObservadas = false;
        this.visibleVerObservacion = false;
        this.visibleExportar = !!this.plazaEncargatura;
        // this.nombreUsuario=this.plazaEncargatura?.UsuarioModificacion;
        console.log(this.plazaEncargatura);
        this.editable = (!!this.plazaEncargatura
            && this.plazaEncargatura.codigoEstadoValidacionPlaza != EstadoValidacionPlazaEnum.Publicado 
            && this.plazaEncargatura.codigoEstadoValidacionPlaza != EstadoValidacionPlazaEnum.Validado
            && this.plazaEncargatura.codigoEstadoValidacionPlaza != EstadoValidacionPlazaEnum.Aprobado);
        this.especial = (this.codigoEtapa == EtapaEnum.EvaluacionExcepcional);
        switch (this.selectedTabIndex) {
            case 0:
                // izquierda
                this.visibleIncorporarPlazas = !this.especial && this.editable;
                this.visibleFechaCorte = !this.especial;
                this.visibleMigrarPlaza = this.especial && !this.plazaEncargatura && !this.editable;
                this.visibleFechaMigrada = this.especial && this.plazaEncargatura;
                // derecha
                this.visiblePlazasConvocar = this.visiblePlazasObservadas = this.editable;
                this.tituloTotalPlazas="Total Plazas Pre Publicadas";
                this.tituloExportarExcel="PrePublicadas";
                break;
            case 1:
                this.visiblePlazasObservadas = this.editable;
                this.tituloTotalPlazas="Total Plazas a Convocar";
                this.tituloExportarExcel="AConvocar";
                break;
            case 2:
                this.visiblePlazasConvocar = this.editable;
                this.visibleVerObservacion = true;
                this.tituloTotalPlazas="Total Plazas Observadas";
                this.tituloExportarExcel="Observadas";
                break;
            case 3:
                this.tituloTotalPlazas="Total Plazas";
                this.tituloExportarExcel="Final";
                break;
            default:
                break;
        }

        
        this.visibleIncorporarPlazas=(this.controlesActivos.btnIncorporarPlazas==false?false:this.visibleIncorporarPlazas);
        this.visibleMigrarPlaza=(this.controlesActivos.btnPlazasDesiertasCD==false?false:this.visibleMigrarPlaza);
        this.visiblePlazasConvocar=(this.controlesActivos.btnPlazasConvocar==false?false:this.visiblePlazasConvocar);
        this.visiblePlazasObservadas=(this.controlesActivos.btnPlazasObservadas==false?false:this.visiblePlazasObservadas);
        this.visibleExportar=(this.controlesActivos.btnExportar==false?false:this.visibleExportar);

        console.log(this.visibleIncorporarPlazas);
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    handleEliminar(row: any) {
        const request = {
            idPlazaEncargaturaDetalle: row.idPlazaEncargaturaDetalle,            
            UsuarioModificacion:this.currentSession.nombreUsuario
        };
        this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE DESEA ELIMINAR LA PLAZA?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().deletePlazaEncargatura(request).pipe(catchError(() => of([])), finalize(() => {
                
                this.dataService.Spinner().hide("sp6");
            })).subscribe((result: any) => {
                if (result > 0) {
                    this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000, () => { });
                    this.searchPlazaEncargatura(true);
                } else {
                    this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN"', () => { });
                }
            });
        }, () => { });
    }

    handleViewInfo(row: any) {
        this.dialogRef = this.materialDialog.open(InformacionPlazaEncargaturaComponent, {
            panelClass: 'minedu-informacion-plaza-encargatura',
            width: '900px',
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
                idPlazaEncargaturaDetalle: row.idPlazaEncargaturaDetalle,
            }
        });
    }

    handleExportar() {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR"', () => { });
            return;
        }
        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().exportPlazaEncargatura(this.request).pipe(catchError(() => of([])), finalize(() => {
            
            this.dataService.Spinner().hide("sp6");
            this.export = false;
        })).subscribe((response: any) => {
            if (response) {
                var dateString = formatDate(Date.now(),'yyyy-MM-dd',this.locale);
                saveAs(response, "PlazaEncargatura-"+this.tituloExportarExcel+"-"+dateString+".xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"', () => { });
            }
        });
    }

    handleConvocarPlazas() {
        if (!this.totalSelected && this.selection.selected.length == 0) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M91, () => { });
            return;
        }

        this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.M75, () => {
            const request = {
                ...this.request,
                totalSeleccionado:this.totalSelected,
                listaPlazaEncargaturaSeleccionado: this.selection.selected,
                listaPlazaEncargaturaDeselecionado: this.desSelection.selected,
                UsuarioModificacion:this.currentSession.nombreUsuario
            };
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().convokePlazaEncargatura(request).pipe(catchError((error) => {
                
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => { });
                        this.onChangeTabIndex.emit(1);
                    } else {
                        this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                    }
                }
            });
        }, () => { });
    }

    handleObservar() {
        if (!this.totalSelected && this.selection.selected.length == 0) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M91, () => { });
            return;
        }
        this.dialogRef = this.materialDialog.open(RegistroDocumentoSustentoEncargaturaComponent, {
            panelClass: 'minedu-registro-documento-sustento-encargatura',
            width: '1080px',
            disableClose: true,
            data: {
                requestParam:this.request,
                totalSelected:this.totalSelected,
                listaPlazaEncargatura: this.selection.selected,
                listaPlazaEncargaturaDesSeleccion: this.desSelection.selected,
                nombreUsuario:this.currentSession.nombreUsuario
            }
        });
        this.dialogRef.afterClosed().subscribe((result) => {
            if (result.event == 'Save') {
                this.onChangeTabIndex.emit(2);
            }
        });
    }

    handleIncorporarPlazas() {
        this.router.navigate(['../../../../../incoporarPlazas/' + this.codigoMaestroProceso + '/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }

    handleMigrarPlazasDesiertas() {
        
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA MIGRAR PLAZAS DESIERTAS - ETAPA I?', () => {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
                idDesarrolloProceso: this.idDesarrolloProceso,                
                usuarioCreacion:this.currentSession.nombreUsuario
            };
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().migratePlazaEncargatura(request).pipe(catchError((error) => {
                
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.OPERACION_SUCCESS,3000, () => { });
                        this.onChangePlazaEncargatura.emit(true);
                    } else {
                        this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                    }
                }
            });
        }, () => { });
    }

    handleMigrarPlazasDesiertasEtapaIyII() {
        
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA MIGRAR PLAZAS DESIERTAS - ETAPA I y II ?', () => {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
                idDesarrolloProceso: this.idDesarrolloProceso,                
                usuarioCreacion:this.currentSession.nombreUsuario
            };
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().migratePlazaEncargaturaEtapaIyII(request).pipe(catchError((error) => {
                
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.OPERACION_SUCCESS,3000, () => { });
                        this.onChangePlazaEncargatura.emit(true);
                    } else {
                        this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                    }
                }
            });
        }, () => { });
    }

    handleMigrarPlazasDesiertasEtapaIII() {
        
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA MIGRAR PLAZAS DESIERTAS - ETAPA III ?', () => {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
                idDesarrolloProceso: this.idDesarrolloProceso,                
                usuarioCreacion:this.currentSession.nombreUsuario
            };
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().migratePlazaEncargaturaEtapaIII(request).pipe(catchError((error) => {
                
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.OPERACION_SUCCESS,3000, () => { });
                        this.onChangePlazaEncargatura.emit(true);
                    } else {
                        this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                    }
                }
            });
        }, () => { });
    }

    setDisplayedColumns() {
        if (this.selectedTabIndex == 3) {
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
                "estado",
                "acciones"
            ];
        } 
        else if (this.selectedTabIndex == 2) {
            this.displayedColumns = [
                "idPlazaEncargaturaDetalle",
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
                "motivo",
                "acciones"
            ];
        } else {
            this.displayedColumns = [
                "idPlazaEncargaturaDetalle",
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
                "acciones"
            ];
        }
    }


    masterToggle(event) { 
        if(this.totalSelected){
            this.totalSelected=false;
            if(event.source.checked){
                event.source.checked=false;
            }
        }else{
            this.totalSelected=true;
        }
        this.selection.clear();
        this.desSelection.clear();
         return this.totalSelected;
    }

    selectionTotalChecked(){
        return (this.totalSelected && !this.desSelection.hasValue());
    }

    selectionIndeterminate(){
        return ((this.totalSelected && this.desSelection.hasValue())||
                (!this.totalSelected && this.selection.hasValue()));
    }

    selectionToggle(row){
        let salida=false;
        if(this.totalSelected){
            const data =this.desSelection.selected;
            let info= data.find(x => x.idPlazaEncargaturaDetalle == row.idPlazaEncargaturaDetalle);
            if(info){
                this.desSelection.deselect(row);
                salida=true;                
            }
            else{
                this.desSelection.select(row);
                let resta=((this.dataSource?.dataTotal||0)-(this.desSelection?.selected.length||0));
                if(resta==0){
                    if(this.totalSelected){
                        this.totalSelected=false;
                    }else{
                        this.totalSelected=true;
                    }
                    this.selection.clear();
                    this.desSelection.clear();
                }
            }
        }
        else{    
            const data =this.selection.selected;
            let info= data.find(x => x.idPlazaEncargaturaDetalle == row.idPlazaEncargaturaDetalle);        
            if(info){
                this.selection.deselect(row);
            }
            else{
                this.selection.select(row);
                let resta=((this.dataSource?.dataTotal||0)-(this.selection?.selected.length||0));
                if(resta==0){
                    if(this.totalSelected){
                        this.totalSelected=false;
                    }else{
                        this.totalSelected=true;
                    }
                    this.selection.clear();
                    this.desSelection.clear();
                }
                salida=true;
            }
        }
        return salida;
    }

    selectionChecked(row){
        let salida=false;
        if(this.totalSelected){
            const data =this.desSelection.selected;
            let info= data.find(x => x.idPlazaEncargaturaDetalle == row.idPlazaEncargaturaDetalle);
            if(info){
            }
            else{                
                salida=true;                
            }
        }
        else{
            const data =this.selection.selected;
            let info= data.find(x => x.idPlazaEncargaturaDetalle == row.idPlazaEncargaturaDetalle);        
            if(info){
                salida=true;
            }
            else{               
                
            }
        }   
        return salida;     
    }

    searchPlazaEncargatura(firstTime: boolean = false) {
        if (this.selectedTabIndex != this.request.selectedTabIndex) {
            return;
        }
        
        if (firstTime) {
            this.selection = new SelectionModel<any>(true, []);
            this.desSelection = new SelectionModel<any>(true, []);
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
        this.initializeComponent();        
    }
}

export class PlazaEncargaturaDataSource extends DataSource<any> {
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
        this.dataService.Encargatura().searchPlazaEncargaturaPaginado(data, pageIndex, pageSize).pipe(catchError((error) => {
            
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