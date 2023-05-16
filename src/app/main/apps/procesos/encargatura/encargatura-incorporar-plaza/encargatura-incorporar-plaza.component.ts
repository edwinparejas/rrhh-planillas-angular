import {Component, Inject, LOCALE_ID, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '@minedu/animations/animations';
import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import {MatPaginator} from '@angular/material/paginator';
import {catchError, finalize, tap} from 'rxjs/operators';
import { saveAs } from "file-saver";
import { InformacionPlazaComponent } from '../components/informacion-plaza/informacion-plaza.component';
import { ENCARGATURA_MESSAGE } from '../_utils/message';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BuscarCentroTrabajoComponent } from '../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BusquedaPlazaComponent } from '../components/busqueda-plaza/busqueda-plaza.component';
import { TipoFormatoPlazaEnum } from '../_utils/constants';
import { CabeceraDesarrolloProcesoEncargaturaComponent } from '../components/cabecera-desarrollo-proceso-encargatura/cabecera-desarrollo-proceso-encargatura.component';
import { formatDate } from '@angular/common';
import { TablaTipoOperacion } from '../models/encargatura.model';
import { EntidadSedeService } from '../Services/entidad-sede.service';

@Component({
    selector: "minedu-encargatura-incorporar-plaza",
    templateUrl: "./encargatura-incorporar-plaza.component.html",
    styleUrls: ["./encargatura-incorporar-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaIncorporarPlazaComponent implements OnInit {
    
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    codigoEtapa: number;
    codigoMaestroProceso: number;

    form: FormGroup;
    loading = false;
    export = false;
    dataSource: PlazaDataSource | null;
    selection: SelectionModel<any> | null;
    desSelection: SelectionModel<any> | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    nombreUsuario:string;
    CodigoSede:string;
    CodigoTipoSede:string;
    totalSelected=false;
    tituloTotalPlazasSeleccionadas:string="Plazas Seleccionadas";
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    @ViewChild('CabeceraDesarrolloProcesoEncargatura') CabeceraDesarrolloProcesoEncargaturaComponent: CabeceraDesarrolloProcesoEncargaturaComponent;
    request = {
        idEtapaProceso:null,
        idDesarrolloProceso:null,
        codigoModular: null,
        codigoPlaza: null,
        CodigoSede:null, 
        butonAccion:null,
        CodigoTipoSede:null
    };
    displayedColumns: string[] = [
        "idPlaza",
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
    dialogRef: any;
    currentSession: SecurityModel = new SecurityModel();   
    passport={
        idNivelInstancia: null,        
        idEntidadSede: null, 
        idRolPassport: null
    }
    constructor(
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,        
        private route: ActivatedRoute,
        private router: Router,
        @Inject(LOCALE_ID) private locale: string,
        private entidadSedeService: EntidadSedeService
    ) {
        // this.idEtapaProceso = data.idEtapaProceso;
        // this.idDesarrolloProceso = data.idDesarrolloProceso;
        // this.nombreUsuario=data.nombreUsuario;
        // this.CodigoSede=data.CodigoSede;

        this.codigoEtapa = Number(this.route.snapshot.params.etapa);
        this.codigoMaestroProceso = Number(this.route.snapshot.params.proceso);
        this.idEtapaProceso = Number(this.route.snapshot.params.id);
        this.idDesarrolloProceso = Number(this.route.snapshot.params.desa);

    }

    ngOnInit(): void {
        this.dataSource = new PlazaDataSource(this.dataService);
        this.selection = new SelectionModel<any>(true, []);
        this.desSelection = new SelectionModel<any>(true, []);
        this.initializeComponent();
    }

    private async initializeComponent() {
        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();

        this.buildSeguridad();
        this.handleResponsive();
        this.resetForm();
        this.searchPlaza(false,true);

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


    ngAfterViewInit() {
        this.paginator.page.pipe(tap(() => this.searchPlaza())).subscribe();
    }
    buildSeguridad() {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.nombreUsuario=this.currentSession.nombreUsuario;
        this.CodigoSede=this.currentSession.codigoSede;
        this.CodigoTipoSede=this.currentSession.codigoTipoSede;
    }
    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildForm() {
        this.form = this.formBuilder.group({
            codigoModular: [null],
            codigoPlaza: [null]
        });
    }

    handleLimpiar() {
        this.resetForm();        
        this.searchPlaza(false,true);
    }

    handleBuscar() {
        if(!this.form.controls['codigoModular'].valid){
         this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M38, () => { });
         return;
        } 
        
        if(!this.form.controls['codigoPlaza'].valid){
         this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M64, () => { });
         return;
        }
        
        this.searchPlaza(true,true);
    }

    resetForm() {
        this.form.reset();
    }

    busquedaCentroTrabajoPersonalizada = () => {
        
        const currentSession = this.dataService.Storage().getInformacionUsuario();

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
                    currentSession
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

    setRequest(butonAccion:boolean=false) {
        const codigoModular = this.form.get("codigoModular").value;
        const codigoPlaza = this.form.get("codigoPlaza").value;

        this.request = {
            idEtapaProceso : this.idEtapaProceso,
            idDesarrolloProceso:this.idDesarrolloProceso,
            codigoModular: codigoModular,
            codigoPlaza: codigoPlaza,
            CodigoSede: this.CodigoSede,
            butonAccion:butonAccion,
            CodigoTipoSede:this.CodigoTipoSede
        };
    }

    searchPlaza(butonAccion:boolean=false,firstTime: boolean = false) {
        this.setRequest(butonAccion);
        if (firstTime) {
            this.selection = new SelectionModel<any>(true, []);
            this.desSelection = new SelectionModel<any>(true, []);
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize, true);            
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize, false);
        }
    }

    handleExportar() {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }
        this.setRequest(false);
        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().exportPlaza(this.request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.export = false;
        })).subscribe((response: any) => {
            if (response) {
                var dateString = formatDate(Date.now(),'yyyy-MM-dd',this.locale);
                saveAs(response, "PlazaIncorporadas-"+dateString+".xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
            } else {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"', () => {});
            }
        });
    }

    handleViewInfo(row: any) {
        this.materialDialog.open(InformacionPlazaComponent, {
            panelClass: 'minedu-informacion-plaza',
            width: '1080px',
            disableClose: true,
            data: {
                idPlaza: row.idPlaza
            }
        });
    }

    handleSave() {

        /*if (!this.totalSelected && this.selection.selected.length == 0) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M91, () => { });
            return;
        }

        var cantidadSeleccionado=
        (this.totalSelected?
            ((this.dataSource?.dataTotal||0)-(this.desSelection?.selected.length||0))
           :(this.selection?.selected.length)
        );
        const request = {
            ...this.request,
            cantidadSeleccionado:cantidadSeleccionado,
            totalSeleccionado:this.totalSelected,
            listaPlazaEncargaturaSeleccionado: this.selection.selected,
            listaPlazaEncargaturaDeselecionado: this.desSelection.selected,
            UsuarioCreacion:this.nombreUsuario
        };*/

        if (this.selection.selected.length == 0) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M91, () => {});
            return;
        }
        const items: any[] = [];
        this.selection.selected.forEach((x) => {
            const plaza = {
                idPlaza: x.idPlaza
            };
            items.push(plaza);
        });
        const request = {
            ...this.request,
            //idEtapaProceso: this.idEtapaProceso,
            //idDesarrolloProceso: this.idDesarrolloProceso,
            listaPlazaEncargaturaSeleccionado: items,
            UsuarioCreacion:this.nombreUsuario
        };

        this.dataService.Message().msgConfirm('¿ESTA SEGURO QUEDE DESEA INCORPORAR PLAZAS?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().registerPlaza(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {   
                    debugger  
                    if(result.result){
                        if(result.mensaje!=""){
                            this.dataService.Message().msgAutoInfo(result.mensaje, 3000, () => {         
                                this.selection = new SelectionModel<any>(true, []);
                                this.desSelection = new SelectionModel<any>(true, []);
                                this.totalSelected=false;
                                this.searchPlaza(false,true);                   
                            });
                        }
                        else{
                            this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000, () => {                    
                                this.selection = new SelectionModel<any>(true, []);
                                this.desSelection = new SelectionModel<any>(true, []);
                                this.totalSelected=false;
                                this.searchPlaza(false,true);                   
                            });
                        }
                    }               
                    else{                        
                        this.dataService.Message().msgAutoInfo(result.mensaje, 3000, () => {                    
                                this.selection = new SelectionModel<any>(true, []);
                                this.desSelection = new SelectionModel<any>(true, []);
                                this.totalSelected=false;
                                this.searchPlaza(false,true);                   
                        });                        
                    }
                    
                } 
                else {
                    this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => {});
                }
            });
        }, () => {});
    }

    handleCancel() {
        // this.dialogRef.close();
    }
    irPlaza(){
        this.router.navigate(['../../../../../plazas/' + this.codigoMaestroProceso + '/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }
    irIncorporarPlaza(){
        this.router.navigate(['../../../../../incoporarPlazas/' + this.codigoMaestroProceso + '/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }  

    masterToggle() {
        this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => {
            this.selection.select(row);
        });
    }
    isAllSelected() {
        return (this.selection.selected.length == this.dataSource.data.length);
    }
    /*masterToggle(event) { 
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
            let info= data.find(x => x.idPlaza == row.idPlaza);
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
            let info= data.find(x => x.idPlaza == row.idPlaza);        
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
            let info= data.find(x => x.idPlaza == row.idPlaza);
            if(info){
            }
            else{                
                salida=true;                
            }
        }
        else{
            const data =this.selection.selected;
            let info= data.find(x => x.idPlaza == row.idPlaza);        
            if(info){
                salida=true;
            }
            else{               
                
            }
        }   
        return salida;     
    }*/
}

export class PlazaDataSource extends DataSource<any>{
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime = false) : void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        this.dataService.Encargatura().searchPlazaPaginado(data, pageIndex, pageSize).pipe(catchError((error) => {
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