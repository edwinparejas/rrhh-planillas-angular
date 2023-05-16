import { AfterViewInit, Component, Inject, LOCALE_ID, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { saveAs } from "file-saver";
import { MatDialog } from '@angular/material/dialog';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { RegistroPostulanteEncargaturaComponent } from '../components/registro-postulante-encargatura/registro-postulante-encargatura.component';
import { InformacionPostulanteEncargaturaComponent } from '../components/informacion-postulante-encargatura/informacion-postulante-encargatura.component';
import { ModificarPostulanteEncargaturaComponent } from '../components/modificar-postulante-encargatura/modificar-postulante-encargatura.component';
import { EstadoPostulacionEnum, EstadoValidacionPlazaEnum, EtapaEnum, TipoDocumentoIdentidadEnum } from "../_utils/constants";
import { ENCARGATURA_MESSAGE } from "../_utils/message";
import { ControlesActivosPostulante } from "../interfaces/encargatura.interface";
import { formatDate } from '@angular/common';
import { BuscadorServidorPublicoComponent } from "../components/buscador-servidor-publico/buscador-servidor-publico.component";
import { CabeceraDesarrolloProcesoEncargaturaComponent } from "../components/cabecera-desarrollo-proceso-encargatura/cabecera-desarrollo-proceso-encargatura.component";
import { EntidadSedeService } from "../Services/entidad-sede.service";
@Component({
    selector: 'minedu-encargatura-bandeja-postulante',
    templateUrl: './encargatura-bandeja-postulante.component.html',
    styleUrls: ['./encargatura-bandeja-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaBandejaPostulanteComponent implements OnInit, AfterViewInit {
    loading = false;
    export = false;
    form: FormGroup;

    idEtapaProceso: number;
    idDesarrolloProceso: number;
    codigoEtapa: number;
    codigoDescripcionMaestroProceso: number;

    defCodigoPlaza: string;
    etapaEnum = EtapaEnum;
    estadoPostulacionEnum = EstadoPostulacionEnum;
    now = new Date();
    comboLists = {
        listTipoDocumento: [],
        listEstado: [],
    };
    dialogRef: any;
    displayedColumns: string[];
    dataSource: PostulanteDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    showAprobado = false;
    selection: SelectionModel<any> | null;
    maxLengthnumeroDocumentoIdentidad: number;
    @ViewChild('CabeceraDesarrolloProcesoEncargatura') CabeceraDesarrolloProcesoEncargaturaComponent: CabeceraDesarrolloProcesoEncargaturaComponent;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    request = {
        idEtapaProceso: 0,
        idDesarrolloProceso: 0,
        codigoEtapa: 0,
        codigoTipoDocumentoIdentidad: null,
        numDocumento: null,
        numExpediente: null,
        codigoEstadoPostulacion: null,
        butonAccion:false
    };
    roles = {
        directorGI: 'AYNI_041',
        comiteSeleccionEncargatura: 'AYNI_042'
    };
    currentSession: SecurityModel = new SecurityModel();
    controlesActivos:ControlesActivosPostulante = {
        btnAprobarPostulantes: false,
        btnEditarPostulante: false,
        btnEliminarPostulante: false,
        btnNuevoPostulante: false,
        btnSolicitarInformeEscalafonario: false,
        btnExportar: false
    }
    isMobile = false;
    codigoEstadoValidacionPlaza: any;
    EstadoValidacionPlaza=EstadoValidacionPlazaEnum.Publicado;
    EstadoPostulacionRegistrado=EstadoPostulacionEnum.Registrado;
    EstadoPostulacionAprobado=EstadoPostulacionEnum.Aprobado;
    EstadoPostulacionEliminado=EstadoPostulacionEnum.Eliminado;
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
        @Inject(LOCALE_ID) private locale: string,
        private entidadSedeService: EntidadSedeService
    ) {
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.idDesarrolloProceso = parseInt(this.route.snapshot.params.desa);
        this.codigoEtapa = parseInt(this.route.snapshot.params.etapa);
        this.codigoDescripcionMaestroProceso = parseInt(this.route.snapshot.params.proceso);
        this.defCodigoPlaza = this.codigoEtapa == this.etapaEnum.EvaluacionRegular ? "Código Plaza a postular" : "Código Plaza a ratificar"
    }

    ngOnInit(): void {
        setTimeout(() => this.buildShared());
        this.initializeComponent();        
        
    }
    
    private async initializeComponent() {
        this.setDisplayedColumns();
        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();
        
        this.handleResponsive();
        this.buildSeguridad();
        this.loadCombos();
        this.dataSource = new PostulanteDataSource(this.dataService);
        this.resetForm();
        this.searchPostulanteEncargatura(true);
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

        this.validarPostulacionesAprobadas();
    }
    
    private async getDreUgelData() {
        this.currentSession.codigoTipoSede=this.entidadSedeService.entidadSede.codigoTipoSede;
        this.currentSession.codigoSede=this.entidadSedeService.entidadSede.codigoSede;
    }

    setDisplayedColumns() {
        if (this.codigoEtapa == this.etapaEnum.EvaluacionRegular) {
            this.displayedColumns = [
                "rowNum",
                "documento",
                "nombreCompleto",
                "numeroExpediente",
                "codigoPlaza",
                "cargo",
                "centroTrabajo",
                "modalidad",
                "tipoPlaza",
                "estado",
                "tipoRegistro",
                "acciones"
            ];
        } else {
            this.displayedColumns = [
                "rowNum",
                "documento",
                "nombreCompleto",
                "numeroExpediente",
                "codigoPlaza",
                "cargo",
                "centroTrabajo",
                "modalidad",
                "tipoPlaza",
                "estado",
                "acciones"
            ];
        }
    };

    buildSeguridad() {
        const data = { 
            idEtapaProceso:this.idEtapaProceso, 
            codTipoSede:this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }

        this.dataService.Encargatura().getAccesoUsuarioPostulacion(data).pipe(catchError((e) => of([e])),
        finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                this.controlesActivos = { 
                    btnAprobarPostulantes:response.aprobarPostulantes,
                    btnNuevoPostulante:response.nuevoPostulante, 
                    btnEditarPostulante:response.editarPostulante, 
                    btnEliminarPostulante: response.eliminarPostulante,
                    btnSolicitarInformeEscalafonario:response.solicitarInformeEscalafonario,
                    btnExportar:true, 
                }; 
            }
        });       
    };

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.searchPostulanteEncargatura(false,false))).subscribe();
    }

    buildShared() {
        this.sharedService.setSharedTitle('Postulantes');
        this.sharedService.setSharedBreadcrumb('Proceso de Encargatura / Postulantes');
    }

    handleGoAscenso() {
        this.router.navigate(['../../../../../'], {
            relativeTo: this.route
        });
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idTipoDocumento: [null],
            numDocumento: [null],
            numExpediente: [null],
            idEstado: [null],
        });
        this.form.get("numDocumento").disable();
    }

    handleLimpiar(): void {
        this.resetForm();
        this.searchPostulanteEncargatura(true,true);
    }

    handleBuscar(): void {   
        if(this.form.valid==false)
        {
            let mensajes="";
            if (this.form.controls.numDocumento.valid == false) {
                let mensajeNumDocumento=(this.form.get("idTipoDocumento").value === TipoDocumentoIdentidadEnum.DNI ? ENCARGATURA_MESSAGE.M34 : ENCARGATURA_MESSAGE.M116);
                mensajes=(mensajes.length==0?mensajeNumDocumento:mensajes+", "+mensajeNumDocumento);                
            }
            this.dataService.Message().msgWarning(mensajes, () => { });
            return;
        }    
        this.searchPostulanteEncargatura(true,true);
    }

    handleViewRegistrarPostulante() {
        this.dialogRef = this.materialDialog.open(RegistroPostulanteEncargaturaComponent, {
            panelClass: 'minedu-registro-postulante-encargatura',
            width: '1040px',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idDesarrolloProceso: this.idDesarrolloProceso,
                codigoEtapa: this.codigoEtapa,
                codigoDescripcionMaestroProceso: this.codigoDescripcionMaestroProceso,
                currentSession:this.currentSession,
                idRegimenLaboral:this.CabeceraDesarrolloProcesoEncargaturaComponent.desarrolloProcesoEncargatura.idRegimenLaboral
            }
        });
        this.dialogRef.afterClosed().subscribe(() => {
            this.searchPostulanteEncargatura(true);
        });
    }

    handleSolicitarInformeEscalafonario(){

    }

    handleViewInformacionPostulante(row: any) {
        this.dialogRef = this.materialDialog.open(InformacionPostulanteEncargaturaComponent, {
            panelClass: 'minedu-informacion-postulante-encargatura',
            width: '1040px',
            disableClose: true,
            data: {
                idPostulacion: row.idPostulacion,
                idPlazaEncargaturaDetalle: row.idPlazaEncargaturaDetalle,
                codigoEtapa: this.codigoEtapa
            }
        });
    }

    handleViewModificarPostulante(row: any) {
        this.dialogRef = this.materialDialog.open(ModificarPostulanteEncargaturaComponent, {
            panelClass: 'minedu-modificar-postulante-encargatura',
            width: '1040px',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idDesarrolloProceso: this.idDesarrolloProceso,
                idPostulacion: row.idPostulacion,
                idPlazaEncargaturaDetalle: row.idPlazaEncargaturaDetalle,
                codigoEtapa: this.codigoEtapa,
                currentSession:this.currentSession
            }
        });
        this.dialogRef.afterClosed().subscribe(() => {
            this.searchPostulanteEncargatura(true);
        });
    }

    handleEliminar(row: any) {
        const request = {
            idPostulacion: row.idPostulacion,
            idDesarrolloProceso: this.idDesarrolloProceso,
            idServidorPublico:row.idServidorPublico,
            idPersona:row.idPersona,
            codigoEtapa: this.codigoEtapa,
            UsuarioModificacion:this.currentSession.nombreUsuario
        };
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR LA INFORMACIÓN?', () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().getEliminarPostulanteEncargatura(request).pipe(catchError((e) => of(e)), finalize(() => {
                this.dataService.Spinner().hide("sp6")
                this.loading = false;
            })).subscribe(result => {
                if (result == 1) {
                    this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000, () => { });
                    this.searchPostulanteEncargatura(true);
                } else {
                    this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                }
            });
        }, () => { });
    }

    handleAprobar(): void {

        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            codigoDescripcionMaestroProceso: this.codigoDescripcionMaestroProceso,
            UsuarioModificacion:this.currentSession.nombreUsuario
        };
        
        this.loading = true;

        this.dataService.Encargatura().Validarexistepostulacionesregistrados(request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((result: any) => {
            if(!result){
                this.dataService.Message().msgError(ENCARGATURA_MESSAGE.M224, () => { });
            }
            else{
                this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA APROBAR EL LISTADO DE POSTULANTES?', () => {
                    
                    this.dataService.Spinner().show("sp6");
                    this.dataService.Encargatura().getAprobarPostulanteEncargatura(request).pipe(catchError((error) => {
                        this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.loading = false;
                    })).subscribe((result: any) => {
                        if (result !== null) {
                            if (result === true) {
                                this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000,() => { });
                                this.searchPostulanteEncargatura(true);
                                this.validarPostulacionesAprobadas();
                            } else {
                                this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                            }
                        }
                    });
                }, () => { });
            }
        });

        
    }

    validarPostulacionesAprobadas(){
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso
        };        
        
        this.loading = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().ValidarExistePostulacionesAprobadas(request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((result: any) => {
            this.showAprobado=result;
        });
        
    }

    handleExportar() {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => { });
            return;
        }
        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().exportPostulanteEncargatura(this.request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.export = false;
        })).subscribe((response: any) => {
            if (response) {
                var dateString = formatDate(Date.now(),'yyyy-MM-dd',this.locale);
                saveAs(response, "PostulanteEncargatura-"+dateString+".xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"', () => { });
            }
        });
    }

    resetForm() {
        this.form.reset();  
        this.form.get('idTipoDocumento').setValue('-1');
        this.form.get('idEstado').setValue('-1');
        this.form.get("numDocumento").disable();
    }

    setRequest(butonAccion: boolean = false) {
        const idEtapaProceso = this.idEtapaProceso;
        const idDesarrolloProceso = this.idDesarrolloProceso;
        const codigoEtapa = this.codigoEtapa;
        const codigoTipoDocumentoIdentidad = Number(this.form.get("idTipoDocumento").value);
        const numDocumento = this.form.get("numDocumento").value;
        const numExpediente = this.form.get("numExpediente").value;
        const codigoEstadoPostulacion = Number(this.form.get("idEstado").value);

        this.request = {
            idEtapaProceso: idEtapaProceso,
            idDesarrolloProceso: idDesarrolloProceso,
            codigoEtapa: codigoEtapa,
            codigoTipoDocumentoIdentidad: codigoTipoDocumentoIdentidad > -1 ? codigoTipoDocumentoIdentidad : null,
            numDocumento: numDocumento,
            numExpediente: numExpediente,
            codigoEstadoPostulacion: codigoEstadoPostulacion > -1 ? codigoEstadoPostulacion : null,
            butonAccion: butonAccion
        };
    }

    searchPostulanteEncargatura(firstTime: boolean = false,butonAccion: boolean = false) {
        this.validarPostulacionesAprobadas();
        this.setRequest(butonAccion);
        if (firstTime) {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
    }

    loadCombos = () => {
        this.loadPlazaEncargatura();
        this.loadTipoDocumento();
        this.loadEstado();
    };

    loadPlazaEncargatura() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso
        }
        this.dataService.Encargatura().getPlazaEncargatura(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.codigoEstadoValidacionPlaza=result.codigoEstadoValidacionPlaza;
            }
        });
    };

    loadTipoDocumento() {
        this.dataService.Encargatura().getComboTipoDocumento().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listTipoDocumento = result.map((x) => ({
                    ...x,
                    value: x.idTipoDocumento,
                    label: x.descripcionTipoDocumento
                }));
            }
        });
    };

    loadEstado() {
        this.dataService.Encargatura().getComboEstadoPostulante().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listEstado = result.map((x) => ({
                    ...x,
                    value: x.idEstadoPostulante,
                    label: x.descripcionEstadoPostulante
                }));
            }
        });
    };

    irPostulante(){        
        this.router.navigate(['../../../../../postulantes/' + this.codigoDescripcionMaestroProceso + '/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso], {
            relativeTo: this.route
        });
    };

    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get("numDocumento").setValue("");
        this.maxLengthnumeroDocumentoIdentidad =
            tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
        
        if(tipoDocumento===null || 
           tipoDocumento===undefined || 
           tipoDocumento<=0)this.form.get("numDocumento").disable();
        else this.form.get("numDocumento").enable();

        this.form
            .get("numDocumento")
            .setValidators([
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),
                Validators.minLength(this.maxLengthnumeroDocumentoIdentidad),
            ]);
    };

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    };

    validatexto(){
        if(this.maxLengthnumeroDocumentoIdentidad==8)
        if(!Number( this.form.get("numDocumento").value))
        this.form.get("numDocumento").setValue("");
    };    

    validaNumerosyLetras = (event) => {
    
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        var key = event.keyCode || event.which,
        tecla = String.fromCharCode(key).toLowerCase(),
        letras = " 0123456789áéíóúabcdefghijklmnñopqrstuvwxyz",
        especiales = [8, 37, 39, 46],
        tecla_especial = false;

        for (var i in especiales) {
        if (key == especiales[i]) {
            tecla_especial = true;
            break;
        }
        }

        if (letras.indexOf(tecla) == -1 && !tecla_especial) {
        return false;
        }
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
            this.form.get("idTipoDocumento").setValue(servidorPublico.codigoTipoDocumentoIdentidad);
            this.selectTipoDocumento(servidorPublico.codigoTipoDocumentoIdentidad);
            this.form.get("numDocumento").setValue(servidorPublico.numeroDocumentoIdentidad);
        });
    };
}

export class PostulanteDataSource extends DataSource<any> {
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
        this.dataService.Encargatura().searchPostulanteEncargaturaPaginado(data, pageIndex, pageSize).pipe(catchError((error) => {
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