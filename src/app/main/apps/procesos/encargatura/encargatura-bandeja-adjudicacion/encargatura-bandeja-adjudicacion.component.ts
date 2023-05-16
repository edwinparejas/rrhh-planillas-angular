import { Component, Inject, LOCALE_ID, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../../core/data/data.service';
import { SharedService } from '../../../../../core/shared/shared.service';
import { EstadoAdjudicacionEnum, EtapaEnum, ResultadoCalificacionEnum, TipoDocumentoIdentidadEnum, TipoFormatoPlazaEnum } from '../_utils/constants';
import { catchError, finalize, tap } from 'rxjs/operators';
import { saveAs } from "file-saver";
import { MatPaginator } from "@angular/material/paginator";
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { RegistroNoAdjudicarPlazaEncargaturaComponent } from '../components/registro-no-adjudicar-plaza-encargatura/registro-no-adjudicar-plaza-encargatura.component';
import { ObservacionAdjudicacionEncargaturaComponent } from '../components/observacion-adjudicacion-encargatura/observacion-adjudicacion-encargatura.component';
import { SubsanarObservacionEncargaturaComponent } from '../components/subsanar-observacion-adjudicacion-encargartura/subsanar-observacion-adjudicacion-encargatura.component';
import { DetalleSubsanacionAdjudicacionEncargaturaComponent } from '../components/detalle-subsanacion-adjudicacion-encargatura/detalle-subsanacion-adjudicacion-encargatura.component';
import { InformacionAdjudicacionEncargaturaComponent } from '../components/informacion-adjudicacion-encargatura/informacion-adjudicacion-encargatura.component';
import { ENCARGATURA_MESSAGE } from '../_utils/message';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ControlesActivosAdjudicacion } from '../interfaces/encargatura.interface';
import { formatDate } from '@angular/common';
import { BuscadorServidorPublicoComponent } from '../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { BuscarCentroTrabajoComponent } from '../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BusquedaPlazaComponent } from '../components/busqueda-plaza/busqueda-plaza.component';
import { CabeceraDesarrolloProcesoEncargaturaComponent } from '../components/cabecera-desarrollo-proceso-encargatura/cabecera-desarrollo-proceso-encargatura.component';
import { TablaTipoOperacion } from '../models/encargatura.model';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { EntidadSedeService } from '../Services/entidad-sede.service';

@Component({
    selector: 'minedu-encargatura-bandeja-adjudicacion',
    templateUrl: './encargatura-bandeja-adjudicacion.component.html',
    styleUrls: ['./encargatura-bandeja-adjudicacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaBandejaAdjudicacionComponent implements OnInit {
    form: FormGroup;
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    codigoEtapa: number;
    export = false;
    selectedTabIndex: number;
    titulo: string;
    loading = false;
    now = new Date();
    dialogRefPreview: any;
    maxLengthnumeroDocumentoIdentidad: number;
    documentoPublicado: any;
    comboLists = {
        listTipoDocumento: [],
        listEstado: []
    };
    roles = {
        directorGI: 'AYNI_041',
        comiteSeleccionEncargatura: 'AYNI_042'
    };
    currentSession: SecurityModel = new SecurityModel();    
    passport={
        idNivelInstancia: null,        
        idEntidadSede: null, 
        idRolPassport: null
    }
    controlesActivos:ControlesActivosAdjudicacion = {
        btnFinalizarAdjudicacion:false,
        btnFinalizarEtapa:false,
        btnAdjudicarPlaza:false,
        btnNoAdjudicarPlaza: false,
        btnSubsanarObservacion:false,
        btnExportar:false,
    }
    showFinalizarAdjudicacion=false;
    showFinalizarEtapa=false;
    dialogRef: any;
    displayedColumns: string[];
    estadoAdjudicacionEnum = EstadoAdjudicacionEnum;
    dataSource: AdjudicacionDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    request = {
        idEtapaProceso: 0,
        idDesarrolloProceso: 0,
        idTipoDocumento: null,
        numDocumento: null,
        codigoModular: null,
        codigoPlaza: null,
        idEstadoAdjudicacion: null,
        butonAccion:false
    };

    isMobile = false;
    totalAdjudicados: number=0;
    totalNoAdjudicados: number=0;
    totalObservados: number=0;
    codigoPlazaTituloApoyo: string="";
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
    }

    ngOnInit(): void {
        setTimeout(() => this.buildShared());
        this.initializeComponent();
    }

    private async initializeComponent() {    
        this.setDisplayedColumns();     
        this.selectedTabIndex = 0;      
        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();
        this.dataSource = new AdjudicacionDataSource(this.dataService);

        this.handleResponsive();
        this.buildSeguridad();
        this.loadCombos();
        this.resetForm();
        this.searchAdjudicacionEncargatura(true);
        this.loadTotales();
        this.loadAdjudicacionFinalizada();
        this.loadFinalizarEtapa();
        this.loadDocumentoPublicado();
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
        
        switch(this.codigoEtapa) { 
            case EtapaEnum.RatificacionCargo: { 
                this.codigoPlazaTituloApoyo=" a ratificar";
                this.titulo="Resultados Finales de Postulantes Aptos";
                break; 
            } 
            case EtapaEnum.PromocionInterna: { 
                this.codigoPlazaTituloApoyo=" adjudicada";
                this.titulo="Cuadro de Merito Final de Postulantes Aptos";
                break; 
            } 
            case EtapaEnum.EvaluacionRegular: { 
                this.codigoPlazaTituloApoyo=" adjudicada";
                this.titulo="Cuadro de Merito Final de Postulantes Aptos";
                break; 
            } 
            default: { 
                this.codigoPlazaTituloApoyo="";
                this.titulo="";
                break; 
            } 
        } 
    }
    
    private async getDreUgelData() {
        this.currentSession.codigoSede=this.entidadSedeService.entidadSede.codigoSede;
        this.currentSession.codigoTipoSede=this.entidadSedeService.entidadSede.codigoTipoSede;
    }
    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.searchAdjudicacionEncargatura(false))).subscribe();
    }
    setDisplayedColumns() {
        if (this.codigoEtapa == EtapaEnum.RatificacionCargo) {
            this.displayedColumns = [
                "rowNum",
                "codigoModular",
                "centroTrabajo",
                "documento",
                "nombreCompleto",
                "codigoPlaza",
                "cargo",
                "tipoPlaza",
                "estado",
                "acciones"
            ];
        } else {
            this.displayedColumns = [
                "rowNum",
                "codigoModular",
                "centroTrabajo",
                "ordenMerito",
                "documento",
                "nombreCompleto",
                "puntajeFinal",
                "codigoPlaza",
                "cargo",
                "tipoPlaza",
                "estado",
                "acciones"
            ];
        }
    };

    loadDocumentoPublicado() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            codigoResultadoCalificacion: 2
        };
        this.dataService.Encargatura().getDocumentoPublicadoCalificacionEncargatura(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.documentoPublicado = {
                    idDocumentoPublicado: result.idDocumentoPublicado,
                    codigoDocumentoGenerado: result.codigoDocumentoGenerado
                }
            }
            else{
                this.documentoPublicado=null;
            }
        });
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    handleGoAscenso() {
        this.router.navigate(['../../../../'], {
            relativeTo: this.route
        });
    }

    handleLimpiar() {
        this.resetForm();
        this.searchAdjudicacionEncargatura(true);
        this.loadTotales();
    }

    handleBuscar() {
        this.searchAdjudicacionEncargatura(true,true);
        this.loadTotales();
    }
    
    buildShared() {
        this.sharedService.setSharedTitle('Adjudicaciones');
        this.sharedService.setSharedBreadcrumb('Proceso de Encargatura / Adjudicaciones');
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idTipoDocumento: [null],
            numDocumento: [null],
            codigoModular: [null],
            codigoPlaza: [null],
            idEstadoAdjudicacion: [null]
        });
        this.form.get("numDocumento").disable();
    }

    resetForm() {
        this.form.reset();
        this.form.get("idTipoDocumento").setValue("-1");
        this.form.get("idEstadoAdjudicacion").setValue("-1");        
        this.form.get("numDocumento").disable();
    }

    loadCombos() {
        this.loadTipoDocumento();
        this.loadEstado();
    };

    setRequest(butonAccion:boolean=false) {
        const idEtapaProceso = this.idEtapaProceso;
        const idDesarrolloProceso = this.idDesarrolloProceso;
        const idTipoDocumento = Number(this.form.get('idTipoDocumento').value);
        const numDocumento = this.form.get('numDocumento').value;
        const codigoModular = this.form.get('codigoModular').value;
        const codigoPlaza = this.form.get('codigoPlaza').value;
        const idEstadoAdjudicacion = Number(this.form.get('idEstadoAdjudicacion').value);

        this.request = {
            idEtapaProceso: idEtapaProceso,
            idDesarrolloProceso: idDesarrolloProceso,
            idTipoDocumento: idTipoDocumento > -1 ? idTipoDocumento : null,
            numDocumento: numDocumento,
            codigoModular: codigoModular,
            codigoPlaza: codigoPlaza,
            idEstadoAdjudicacion: idEstadoAdjudicacion > -1 ? idEstadoAdjudicacion : null,
            butonAccion:butonAccion
        };
    }
    buildSeguridad() {
        const data = { 
            idEtapaProceso:this.idEtapaProceso, 
            codTipoSede:this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }

        this.dataService.Encargatura().getAccesoUsuarioAdjudicacion(data).pipe(catchError((e) => of([e])),
        finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                this.controlesActivos = { 
                    btnAdjudicarPlaza: response.adjudicarPlaza,
                    btnNoAdjudicarPlaza: response.noAdjudicarPlaza,
                    btnSubsanarObservacion: response.subsanarObservacion,
                    btnFinalizarAdjudicacion: response.finalizarAdjudicacion,
                    btnFinalizarEtapa: response.finalizarEtapa,     
                    btnExportar:true
                }; 
                
            }
            console.log(this.controlesActivos);
        });   
    };

    loadAdjudicacionFinalizada() {
        const request={
            idEtapaProceso:this.idEtapaProceso,
            idDesarrolloProceso:this.idDesarrolloProceso
        };
        this.dataService.Encargatura().ValidaAdjudicacionFinalizadaEncargatura(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.showFinalizarAdjudicacion=true;
            }
            else this.showFinalizarAdjudicacion=false;
        });
    }

    loadFinalizarEtapa() {
        const request={
            idEtapaProceso:this.idEtapaProceso,
            idDesarrolloProceso:this.idDesarrolloProceso
        };
        this.dataService.Encargatura().ValidarFinalizarEtapaEncargatura(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            
            if (result) {
                this.showFinalizarEtapa=true;
            }
            else this.showFinalizarEtapa=false;
        });
    }

    loadTotales() {
        const request={
            idEtapaProceso:this.idEtapaProceso,
            idDesarrolloProceso:this.idDesarrolloProceso
        };
        this.dataService.Encargatura().searchTotalesAdjudicacionEncargatura(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.totalAdjudicados=result.totalAdjudicados;
                this.totalNoAdjudicados=result.totalNoAdjudicados;
                this.totalObservados=result.totalObservados;
            }
            else {
                this.totalAdjudicados=0;
                this.totalNoAdjudicados=0;
                this.totalObservados=0;
            }
        });
    }

    loadTipoDocumento() {
        this.dataService.Encargatura().getComboTipoDocumentoAdjudicacionEncargatura().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listTipoDocumento = result.map((x) => ({
                    ...x,
                    value: x.idTipoDocumentoIdentidad,
                    label: x.descripcionTipoDocumentoIdentidad
                }));
            }
        });
    }

    loadEstado() {
        this.dataService.Encargatura().getComboEstadoAdjudicacionEncargartura().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listEstado = result.map((x) => ({
                    ...x,
                    value: x.idEstadoAdjudicacion,
                    label: x.descripcionEstadoAdjudicacion
                }));
            }
        });
    }

    searchAdjudicacionEncargatura(firstTime: boolean = false,butonAccion:boolean=false) {
        this.setRequest(butonAccion);
        if (firstTime) {
            this.dataSource.load(this.request,(this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request,(this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        }
    }

    handleViewInfo(row: any) {
        this.dialogRef = this.materialDialog.open(InformacionAdjudicacionEncargaturaComponent, {
            panelClass: 'minedu-informacion-adjudicacion-encargatura',
            width: '1080px',
            disableClose: true,
            data: {
                idAdjudicacion: row.idAdjudicacion
            }
        });
    }

    handleFinalizarAdjudicacion() {
        this.setRequest();
        const requestAd= {
            ...this.request,
            CodigoEtapa:this.codigoEtapa,
            UsuarioModificacion:this.currentSession.nombreUsuario
        };
        
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().validarfinalizarAdjudicacionEncargatura(requestAd).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe(result => {
                /**/
                if (result !== null) {
                    if(result===true){
                        this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE DESEA FINALIZAR LA ADJUDICACIÓN?', () => {
                            this.loading = true;
                            this.dataService.Spinner().show("sp6");
                            this.dataService.Encargatura().finalizarAdjudicacionEncargatura(requestAd).pipe(catchError((error) => {
                                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                                return of(null);
                            }), finalize(() => {
                                this.dataService.Spinner().hide("sp6");
                                this.loading = false;
                            })).subscribe(result => {
                                if (result !== null) {
                                    if (result === true) {
                                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => { });
                                        this.searchAdjudicacionEncargatura(true);                
                                        this.loadAdjudicacionFinalizada();
                                        this.loadFinalizarEtapa();
                                    } else {
                                        this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                                    }
                                }
                            });
                        }, () => { });
                    }
                }
                /**/
            });
    }

    handleFinalizarEtapa() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            CodigoEtapa:this.codigoEtapa,
            UsuarioModificacion:this.currentSession.nombreUsuario
        };
        this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE DESEA FINALIZAR LA ETAPA?', () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().finalizarEtapaAdjudicacionEncargatura(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe(result => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000,() => { });
                        this.handleGoAscenso();
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                    }
                }
            });
        }, () => { });
    }

    handleExportar() {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => { });
            return;
        }
        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().exportAdjudicacionEncargatura(this.request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.export = false;
        })).subscribe((response: any) => {
            console.log(response);
            if (response) {
                var dateString = formatDate(Date.now(),'yyyy-MM-dd',this.locale);
                saveAs(response, "AdjudicacionEncargatura-"+dateString+".xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"', () => { });
            }
        });
    }
    
    handleViewAdjudicarPlaza(row: any) {       
        this.router.navigate(['../../../../registroadjudicarplaza/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso+ '/' + row.idAdjudicacion+ '/' + row.idPostulacion], {
            relativeTo: this.route
        });
    }

    handleViewNoAdjudicarPlaza(row: any) {
        this.dialogRef = this.materialDialog.open(RegistroNoAdjudicarPlazaEncargaturaComponent, {
            panelClass: 'minedu-registro-no-adjudicar-plaza-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idAdjudicacion: row.idAdjudicacion,
                idDesarrolloProceso: this.idDesarrolloProceso,
                codigoEtapa: this.codigoEtapa,
                idPostulacion: row.idPostulacion,
                currentSession: this.currentSession,
                idServidorPublico: row.idServidorPublico,
                idPersona: row.idPersona
            }
        });
        this.dialogRef.afterClosed().subscribe(() => {
            this.searchAdjudicacionEncargatura(true);
        });
    }

    handleVerObservacion(row: any) {
        this.dialogRef = this.materialDialog.open(ObservacionAdjudicacionEncargaturaComponent, {
            panelClass: 'minedu-observacion-adjudicacion-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idAdjudicacion: row.idAdjudicacion
            }
        });
    }

    handleSubsanarObservacion(row: any) {
        this.dialogRef = this.materialDialog.open(SubsanarObservacionEncargaturaComponent, {
            panelClass: 'minedu-subsanar-observacion-adjudicacion-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idAdjudicacion: row.idAdjudicacion,
                currentSession: this.currentSession                
            }
        });
        this.dialogRef.afterClosed().subscribe(() => {
            this.searchAdjudicacionEncargatura(true);
        });
    }

    handleVerDetalleObservacion(row: any) {
        this.dialogRef = this.materialDialog.open(DetalleSubsanacionAdjudicacionEncargaturaComponent, {
            panelClass: 'minedu-detalle-subsanacion-adjudicacion-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idAdjudicacion: row.idAdjudicacion
            }
        });
    }

    handleVerDocumentoAdjudicacion(row:any){
        const codigoAdjunto = row.codigoDocumentoAdjudicacion;

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE INFORME ESCALAFONARIO."', () => {
            });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(codigoAdjunto)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreview(response, codigoAdjunto);
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL INFORME ESCALAFONARIO."', () => {
                    });
                }
            });
    }

    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Informe escalafonario',
                    file: file,
                    fileName: codigoAdjuntoSustento
                }
            }
        });

        this.dialogRefPreview.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    };
    
    irAdjudicacion(){
        this.router.navigate(['../../../../adjudicacion/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }

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
                Validators.minLength(this.maxLengthnumeroDocumentoIdentidad),
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),
            ]);        
    };

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    };

    validatexto(){
        if(this.maxLengthnumeroDocumentoIdentidad==8)if(!Number( this.form.get("numDocumento").value))this.form.get("numDocumento").setValue("");
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

export class AdjudicacionDataSource extends DataSource<any> {
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
        this.dataService.Encargatura().searchAdjudicacionEncargaturaPaginado(data, pageIndex, pageSize).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this._loadingChange.next(false);
        })).subscribe((result: any) => {
            console.log(result);
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
//fin