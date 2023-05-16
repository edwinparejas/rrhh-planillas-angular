import { Component, Inject, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../../core/data/data.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { MatPaginator } from '@angular/material/paginator';
import { ENCARGATURA_MESSAGE } from '../_utils/message';
import { SecurityModel } from 'app/core/model/security/security.model';
import { CompararDatosAdjudicacionEncargaturaComponent } from '../components/comparar-datos-adjudicacion-encargatura/comparar-datos-adjudicacion-encargatura.component';
import { fechas } from '../models/fechas.model';
import { EntidadSedeService } from '../Services/entidad-sede.service';


@Component({
    selector: "minedu-encargatura-registro-adjudicar-plaza",
    templateUrl: "./encargatura-registro-adjudicar-plaza.component.html",
    styleUrls: ["./encargatura-registro-adjudicar-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaRegistroAdjudicarPlazaComponent implements OnInit {
    datosPostulanteEncargatura: any;
    idAdjudicacion: number;
    idPostulacion: number;
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    codigoEtapa: number;
    loading = false;
    now = new Date();
    fechaInicioMax:Date;
    fechaInicioMin:Date;
    fechaFinMax:Date;
    displayedColumns: string[] = [
        'eleccion',
        'rowNum',
        'codigoModular',
        'centroTrabajo',
        'modalidad',
        'nivelEducativo',
        'codigoPlaza',
        'cargo',
        'jornadaLaboral',
        'tipoPlaza',
        'vigenciaInicio',
        'vigenciaFin'
    ];
    dataSource: PLazaAdjudicacionDataSource | null;
    selection = new SelectionModel<any>(false, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    currentSession: SecurityModel = new SecurityModel();    
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    dialogRef: any;
    request = {
        idEtapaProceso: 0,
        idDesarrolloProceso: 0,
        codigoEtapa: 0,
        idPostulacion: 0
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
    constructor(
        private dataService: DataService,
        private materialDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private entidadSedeService: EntidadSedeService
    ) {
        
        this.codigoEtapa = Number(this.route.snapshot.params.etapa);
        this.idEtapaProceso = Number(this.route.snapshot.params.id);
        this.idDesarrolloProceso = Number(this.route.snapshot.params.desa);
        this.idAdjudicacion = Number(this.route.snapshot.params.idAdjudicacion);
        this.idPostulacion = Number(this.route.snapshot.params.idPostulacion);
        
    }
    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.searchAdjudicacionEncargatura(false))).subscribe();
    }

    definirFechaValorMin(valueIni,valueCampo){    
        const fechaValueini=new Date(valueIni);
        const fechavalueCampo=new Date(valueCampo);  
        let fechaEvaluar=new Date();      
        fechaEvaluar=(fechaValueini.getFullYear()>=fechavalueCampo.getFullYear()?
            fechas.obtenerFechaInicioDelAnioIngresado(this.now):
            fechavalueCampo);
        return fechaEvaluar;
    }

    definirFechaValorMax(valueIni,valueCampo){    
        const fechaValueini=new Date(valueIni);
        const fechavalueCampo=new Date(valueCampo);  
        let fechaEvaluar=new Date();      
        fechaEvaluar=(fechaValueini.getFullYear()>=fechavalueCampo.getFullYear()?
            fechas.obtenerFechaFinDelAnioIngresado(fechas.obtenerFechaMasAnios(valueIni,1)):
            fechas.obtenerFechaFinDelAnioIngresado(fechas.obtenerFechaMasAnios(valueCampo,1)));
        return fechaEvaluar;
    }

    definirFechaFin(valueIni,valueCampo){
        const fechaValueini=new Date(valueIni);
        const fechavalueCampo=new Date(valueCampo);  
        let fechaEvaluar=new Date();      
        fechaEvaluar=(fechaValueini>=fechavalueCampo?
                      fechaValueini:
                      fechavalueCampo);
        return fechaEvaluar;
    }

    ngOnInit(): void {        
        this.initializeComponent();
    }

    
    private async initializeComponent() {        
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();

        this.fechaInicioMin=fechas.obtenerFechaInicioDelAnioIngresado(this.now);
        this.fechaInicioMax=fechas.obtenerFechaMasAnios(this.now,1);
        this.fechaInicioMax=fechas.obtenerFechaFinDelAnioIngresado(this.fechaInicioMax);
        this.dataSource = new PLazaAdjudicacionDataSource(this.dataService);
        this.handleResponsive();
        this.buildSeguridad();
        this.loadPostulante();
        this.searchAdjudicacionEncargatura(true);        

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


    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }
    buildSeguridad() {
        
    }
    setRequest() {
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            codigoEtapa: this.codigoEtapa,
            idPostulacion: this.idPostulacion
        }
    }

    loadPostulante() {
        this.dataService.Encargatura().getDatosPostulanteEncargatura(this.idPostulacion).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.datosPostulanteEncargatura = {
                    idPostulacion: result.idPostulacion,
                    numeroExpediente: result.numeroExpediente,
                    fechaExpediente: result.fechaExpediente,
                    idServidorPublico: result.idServidorPublico,
                    idPersona: result.idPersona,
                    fechaInicioVinculacion: result.fechaInicioVinculacion,
                    fechaFinVinculacion: result.fechaFinVinculacion,
                    numeroDocumentoIdentidad: result.numeroDocumentoIdentidad,
                    primerApellido: result.primerApellido,
                    segundoApellido: result.segundoApellido,
                    nombres: result.nombres,
                    idPlaza: result.idPlaza,
                    codigoPlaza: result.codigoPlaza,
                    itemPlaza: result.itemPlaza,
                    idTipoPlaza: result.idTipoPlaza,
                    descripcionTipoPlaza: result.descripcionTipoPlaza,
                    idCargo: result.idCargo,
                    descripcionCargo: result.descripcionCargo,
                    codigoModular: result.codigoModular,
                    institucionEducativa: result.institucionEducativa,
                    idRegimenLaboral: result.idRegimenLaboral,
                    descripcionRegimenLaboral: result.descripcionRegimenLaboral,
                    codigoCondicionLaboral: result.codigoCondicionLaboral,
                    descripcionCondicionLaboral: result.descripcionCondicionLaboral,
                    codigoSituacionLaboral: result.codigoSituacionLaboral,
                    descripcionSituacionLaboral: result.descripcionSituacionLaboral,
                    codigoGenero: result.codigoGenero,
                    idPlazaEncargaturaDetalle: result.idPlazaEncargaturaDetalle,
                    descripcionGenero: result.descripcionGenero
                }
            }
        });
    }

    searchAdjudicacionEncargatura(firstTime: boolean = false) {
        this.setRequest();
        if (firstTime) {
            this.dataSource.load(this.request, this.selection, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request, this.selection, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
    }

    handleSave() {
        if (this.selection.selected.length == 0) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M91, () => { });
            return;
        }
        if (this.selection.selected.length > 1) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M92, () => { });
            return;
        }
        this.dataService.Message().msgConfirm('¿ESTA SEGURO DE QUE DESEA ADJUDICAR LA PLAZA?', () => {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
                idDesarrolloProceso: this.idDesarrolloProceso,
                idAdjudicacion: this.idAdjudicacion,
                idPlazaEncargaturaDetalle: null,
                idServidorPublico:null,
                idPersona:null,
                codigoEtapa:this.codigoEtapa,
                vigenciaInicio: null,
                vigenciaFin: null,
                idPlaza: null,
                codigoPlaza: null,
                itemPlaza:0,
                UsuarioModificacion:this.currentSession.nombreUsuario
            };
            this.selection.selected.forEach((x) => {
                request.idPlazaEncargaturaDetalle = x.idPlazaEncargaturaDetalle;
                request.vigenciaInicio = x.vigenciaInicio;
                request.vigenciaFin = x.vigenciaFin;
                request.idServidorPublico = x.idServidorPublico;
                request.idPersona = x.idPersona;
                request.idPlaza = x.idPlaza;
                request.codigoPlaza = x.codigoPlaza;                
                request.itemPlaza = Number(x.itemPlaza);
            });
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().registrarAdjudicarPlazaAdjudicacionEncargaturaPaginado(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe(result => {
                if (result !== null) {
                    if (result.compara === true) {
                        this.dialogRef = this.materialDialog.open(CompararDatosAdjudicacionEncargaturaComponent, {
                            panelClass: 'minedu-comparar-datos-adjudicacion-encargatura',
                            width: '1040px',
                            disableClose: true,
                            data: {
                                idAdjudicacion: request.idAdjudicacion,
                                idPlazaEncargaturaDetalle: request.idPlazaEncargaturaDetalle,
                                currentSession:this.currentSession
                            }
                        });
                        this.dialogRef.afterClosed().subscribe((result: any) => {
                            debugger
                            if (result.event == 'actualizo') {                              
                                this.dataService.Message().msgAutoInfo('"SE ACTUALIZO '+result.mensaje+', CONTINUAR CON LA ADJUDICACIÓN"',3000, () => { });
                            }
                            if (result.event == 'error') {                              
                                this.dataService.Message().msgWarning('"'+result.mensaje.toUpperCase()+'"');
                            }
                            
                        });
                        
                    } 
                    else if(result.registro===true){
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000,() => { });
                        this.irAdjudicacion();
                    }
                    else {
                        this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                    }
                }
            });
        }, () => { });
    }

    irAdjudicacion(){
        this.router.navigate(['../../../../../../adjudicacion/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }
    irRegistroAdjudicarPlaza(){
        this.router.navigate(['../../../../../../registroadjudicarplaza/'+ this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso+ '/' + this.idAdjudicacion+ '/' + this.idPostulacion], {
            relativeTo: this.route
        });
    }    
}

export class PLazaAdjudicacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, selection: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().searchPlazaAdjudicarAdjudicacionEncargatura(data, pageIndex, pageSize).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this._loadingChange.next(false);
        })).subscribe((result: any) => {
            this._dataChange.next(result || []);
            this.totalRegistros = (result || []).length === 0 ? 0 : result[0].totalRegistros;
            if ((result || []).length === 0) {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE PLAZAS ADJUDICADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
            } 
            
            selection.select(result[0]);
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