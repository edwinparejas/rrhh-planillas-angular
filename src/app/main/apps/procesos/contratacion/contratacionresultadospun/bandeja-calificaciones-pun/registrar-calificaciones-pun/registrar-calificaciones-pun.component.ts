import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { Form, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { SecurityModel } from '../../../../../../../core/model/security/security.model';
import { SharedService } from '../../../../../../../core/shared/shared.service';
import { MensajesSolicitud, RubroCalificacionEnum, TipoPuntajeEnum } from '../../../_utils/constants';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';

@Component({
    selector: 'minedu-registrar-calificaciones-pun',
    templateUrl: './registrar-calificaciones-pun.component.html',
    styleUrls: ['./registrar-calificaciones-pun.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class RegistrarCalificacionesPUNComponent implements OnInit {

    working = true;
    isMobile = false;
    
    activarDetalleCalificacionCompleto=false;
    modoEdicion = 0;

    form: FormGroup;
    idPersona: number;
    idCalificacion: number;
    idEtapaProceso: number;
    info: any;
    rubro: any;
    rubroCab: any;
    dialogRef: any;
    dtSource: EvaluacionDataSource[] | null = [];
    selection = new SelectionModel<any>(true, []);
    TipoPuntajeEnum = TipoPuntajeEnum;
    displayedColumns: any[];

    displayedColumnsResultadosPUN: string[] = [
        "codigoCriterio",
        "descripcionCriterio",
        "puntajeObtenido"
    ];

    request = {
        idCalificacionDetalle: null,
        idMaestroProcesoCalificacion: null,
        anotaciones: null,
        usuarioModificacion: null,
        rubro:  null,
        puntajeFinal: null
    }

    private passport: SecurityModel = new SecurityModel();

    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        setTimeout((_) => this.buildShared());
        this.idPersona = parseInt(this.route.snapshot.params.idPersona);
        this.idCalificacion = parseInt(this.route.snapshot.params.id);
        this.idEtapaProceso = parseInt(this.route.parent.snapshot.params.id);
        this.modoEdicion = parseInt(this.route.snapshot.params.modoEdicion);
        this.buildForm();
        this.handleResponsive();
        this.obtenerInformación();
    }

    ngAfterViewInit() {
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            anotaciones: [null]
        });
    }

    verificarInicioCumpleCheck(){ // editar calificaiones
        var contador = 0; // caso evaluación de expedientes
        console.log("VerificarInicioCheck - dataSource: ",this.dtSource);

        var verificarActivarDetalleCalificacionCompleto = true; // variable temporal para determinar sis e cumplen todos los requisitos
         if (this.rubro == null || this.rubro.length == 0){
             verificarActivarDetalleCalificacionCompleto = false;
         }
        this.rubro.forEach(rub =>{
            if(rub.idTipoPuntaje == 1){ // tipo pubtaje = cumpledocumento
                if(this.dtSource[contador].data.length == 0){
                    verificarActivarDetalleCalificacionCompleto = false;
                }
                this.dtSource[contador].data.forEach(d => {
                    if(d.cumpleDocumento == false){
                        verificarActivarDetalleCalificacionCompleto = false;
                    }
                });
            }    
            contador++;
        });

        if(this.modoEdicion == 1){
            verificarActivarDetalleCalificacionCompleto = true;
        }
        // ultima verificaion
        /*
        if(!verificarActivarDetalleCalificacionCompleto){
            //verificarActivarDetalleCalificacionCompleto = this.verificarEdicion();
            this.activarDetalleCalificacionCompleto = this.verificarEdicion()
        }*/
        
        this.activarDetalleCalificacionCompleto = verificarActivarDetalleCalificacionCompleto;
    }
    /*verificarEdicion():boolean {
        var contador = 0;
        var verificarActivarDetalleCalificacion = true; // variable temporal para determinar sis e cumplen todos los requisitos
        this.rubro.forEach(rub =>{
            if(rub.idTipoPuntaje == 1){ // tipo pubtaje = cumpledocumento
                debugger;
                this.dtSource[contador+1].data.forEach(d => {
                    if(d.cumpleDocumento == false){
                        verificarActivarDetalleCalificacion = false;
                    }
                });
            }
            contador++;
        });
        // this.activarDetalleCalificacionCompleto = verificarActivarDetalleCalificacion;
        return verificarActivarDetalleCalificacion 
}*/

    changeCumpleCheck(event, dtIndex, rowIndex) {
        // original - cambiar el estado del checkbox
        this.dtSource[dtIndex].data[rowIndex].cumpleDocumento = !this.dtSource[dtIndex].data[rowIndex].cumpleDocumento;



        // Verificar si el checkbox corresponde a los checks de Requerimientos para actualizar visualizacion de detalles de calificacion
        // *****************
        // console.log("Detalles del rubro ", this.rubro);
        // console.log("Datos detalles check :",this.dtSource);
        // console.log("data:",this.rubro[dtIndex])
        // console.log("data:",this.rubro[dtIndex].data.idTipoPuntaje)
        if ( this.rubro[dtIndex-1] != null && this.rubro[dtIndex-1].idTipoPuntaje  == 1){ // !this.activarDetalleCalificacionCompleto ||
            var contador = 0;
            var verificarActivarDetalleCalificacionCompleto = true; // variable temporal para determinar sis e cumplen todos los requisitos
            this.rubro.forEach(rub =>{
                if(rub.idTipoPuntaje == 1){ // tipo pubtaje = cumpledocumento
                    this.dtSource[contador+1].data.forEach(d => {
                        if(d.cumpleDocumento == false){
                            verificarActivarDetalleCalificacionCompleto = false;
                        }
                    });
                }
                contador++;
            });
            this.activarDetalleCalificacionCompleto = verificarActivarDetalleCalificacionCompleto;
        }

    }

    

    changeAcreditaDocumento(event, row, dtIndex, rowIndex) {
        console.log("Datos Checkbox :", row, dtIndex, rowIndex);
        this.dtSource[dtIndex].data[rowIndex].cumpleDocumento = !this.dtSource[dtIndex].data[rowIndex].cumpleDocumento;
        this.calcularPuntajeObtenidoTotal(row, dtIndex, rowIndex);
        // this.calcularPuntajeObtenidoPadre(row, dtIndex, rowIndex);
    }

    changeCantidad(event, row, dtIndex, rowIndex) {
        const html = document.getElementById("cantidad" + dtIndex + rowIndex) as HTMLInputElement;
        this.dtSource[dtIndex].data[rowIndex].cantidadUnidad = parseInt(html.value);
        this.calcularPuntajeObtenidoTotal(row, dtIndex, rowIndex);
    }

    calcularPuntajeObtenidoTotal(row, dtIndex, rowIndex) {
        let puntajeObtenido = 0;
        let puntajeObtenidoText ="0";
        if (this.dtSource[dtIndex].data[rowIndex].cumpleDocumento) {
            if (row.tieneCantidad) {
                let um = this.dtSource[dtIndex].data[rowIndex].puntajeMaximoUnidad == null ? 1 : this.dtSource[dtIndex].data[rowIndex].puntajeMaximoUnidad;
                puntajeObtenido = this.dtSource[dtIndex].data[rowIndex].cantidadUnidad * um;
                puntajeObtenidoText = puntajeObtenido.toFixed(2);

            } else {
                if (!row.tieneSubCriterio)
                puntajeObtenido = this.dtSource[dtIndex].data[rowIndex].puntajeMaximo;
                puntajeObtenidoText = puntajeObtenido.toFixed(2);

            }
        }
        this.dtSource[dtIndex].data[rowIndex].puntajeObtenido = puntajeObtenidoText;//puntajeObtenido;

        this.calcularPuntajeObtenidoPadre(row, dtIndex, rowIndex, puntajeObtenido);
        this.calcularPuntajeTotal();
    }

    calcularPuntajeObtenidoPadre(row, dtIndex, rowIndex, puntajeObtenido) {
        let totalSumaHijos = parseFloat("0"); // inicializar
        let puntajeMaximoPadre = parseFloat("0");
        let puntajeOriginal = parseFloat(row.puntajeObtenido== null ? 0 : row.puntajeObtenido);
        let puntajeMaximoOriginal = parseFloat(row.puntajeMaximo== null ? 0 : row.puntajeMaximo);

        if(puntajeOriginal<0)
        {
            this.dataService.Message().msgAutoCloseWarningNoButton('"NO DEBE INGRESAR NÚMEROS NEGATIVOS."',3000,() => {});
            row.puntajeObtenido = 0;
            return;
        }
        if(row.puntajeMaximo != null && puntajeOriginal>puntajeMaximoOriginal){
            this.dataService.Message().msgAutoCloseWarningNoButton('"LA OPERACIÓN DEL PUNTAJE Y CANTIDAD EXCEDE EL PUNTAJE MÁXIMO PERMITIDO POR CRITERIO DE FILA."',3000,() => {});
            row.puntajeObtenido = 0;
            return;
        }

        if (!row.tieneSubCriterio && row.idCodigoPadre != null){
            this.dtSource[dtIndex].data.forEach(filaCalificacion =>{
                if (filaCalificacion.idMaestroCriterioCalificacion == row.idCodigoPadre && filaCalificacion.tieneSubCriterio){ // buscar las filas padre
                    // console.log("fila padre encontrada",filaCalificacion);
                    puntajeMaximoPadre =  parseFloat(filaCalificacion.puntajeMaximo== null ? 0 : filaCalificacion.puntajeMaximo);
                        this.dtSource[dtIndex].data.forEach(filaHijo=>{ // buscar las filas hijo y sumar sus puntajes
                            if(filaHijo.idCodigoPadre == row.idCodigoPadre && !filaHijo.tieneSubCriterio){
                                // console.log("FilaHijoEncontrada:",filaHijo)

                                if(filaHijo.cumpleDocumento)
                                    totalSumaHijos += parseFloat(filaHijo.puntajeObtenido== null ? 0 : filaHijo.puntajeObtenido);
                            }
                            if((totalSumaHijos>puntajeMaximoPadre)&&puntajeMaximoPadre>0){
                                filaHijo.cumpleDocumento = false;
                                this.dataService.Message().msgAutoCloseWarningNoButton('"SE HA SUPERADO EL PUNTAJE MÁXIMO PERMITIDO POR CRITERIO PRINCIPAL."',3000,() => {});
                                filaHijo.puntajeObtenido = 0;
                                filaHijo.cantidadUnidad = 0;
                                 this.calcularPuntajeObtenidoPadre(row, dtIndex, rowIndex,puntajeObtenido);
                                // this.calcularPuntajeObtenidoTotal(row, dtIndex, rowIndex)
                            }
                        })
                        // console.log("Total de Suma Hijos:",totalSumaHijos);
                        let totalSumaHijosTexto=totalSumaHijos.toFixed(2);
                        filaCalificacion.puntajeObtenido = totalSumaHijosTexto;

                    }
            });
        }
    }

    calcularPuntajeTotal() {
        let total = 0;
        if (this.dtSource.length > 0) {
            this.dtSource.forEach((dt, i) => {
                dt.data.forEach(d => {
                    if (d.codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN && (d.idTipoPuntaje == TipoPuntajeEnum.PUNTAJE || d.idTipoPuntaje == TipoPuntajeEnum.NO_APLICA)) {
                        if(d.tieneSubCriterio==false){
                            total += parseFloat(d.puntajeObtenido == null ? 0 : d.puntajeObtenido);
                        }
                    }
                });
            });
        }
        // this.info.puntajeFinal = total;
        let totalText=total.toFixed(2);
        this.info.puntajeFinal = totalText;
    }

    CalcularPuntajeObtenido(rubro, dtIndex) {
        let puntajeObtenido = 0;
        if (rubro.idTipoPuntaje == TipoPuntajeEnum.PUNTAJE || rubro.idTipoPuntaje == TipoPuntajeEnum.NO_APLICA) {
            let data = this.dtSource[dtIndex].data;
            if (data.length > 0) {
                data.forEach(d => {
                    if(d.tieneSubCriterio==false){
                        puntajeObtenido += parseFloat(d.puntajeObtenido == null ? 0 : d.puntajeObtenido);
                    }
                });
            }
        }
        // return puntajeObtenido.toFixed(1);
        let puntajeObtenidoText = puntajeObtenido.toFixed(2);
        return puntajeObtenidoText;
    }

    CalcularPuntajeObtenidoPUN() {
        let puntajeObtenido = 0;
        if (this.dtSource != null && this.dtSource.length > 0) {
            let data = this.dtSource[0].data;
            if (data.length > 0) {
                data.forEach(d => {
                    if (isNaN(parseFloat(d.puntajePUN))) {
                        puntajeObtenido += 0;
                    } else {
                        puntajeObtenido += parseFloat(d.puntajePUN);
                    }
                });
            }
        }

        let puntajeObtenidoText = puntajeObtenido.toFixed(2);
        return puntajeObtenidoText;
    }


    obtenerInformación = () => {
        var d = {
            idCalificacion: this.idCalificacion
        };
        this.dataService.Contrataciones().getObtenerCalificacion(d).pipe(catchError(() => of([])),
            finalize(() => {
                this.working = false;
                this.verificarInicioCumpleCheck();
            })
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Response Calificaciones: ", this.dtSource);

                this.info = response;
                this.form.get('anotaciones').setValue(this.info.anotacionesCalificacion);
                this.displayedColumns = [];
                this.rubroCab = [];

                this.rubro = this.info.rubro.filter(x => x.codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN);
                this.rubroCab = this.info.rubro.filter(x => x.codigoRubro == RubroCalificacionEnum.RESULTADOS_PUN)[0];
                this.info.rubro.forEach((r, i) => {
                    this.dtSource[i] = new EvaluacionDataSource(this.dataService);
                    let d = {
                        idCalificacionResultadoRubro: r.idCalificacionResultadoRubro,
                        idMaestroRubroCalificacion: r.idMaestroRubroCalificacion
                    }
                    this.displayedColumns[i] = [
                        "codigoCriterio",
                        "descripcionCriterio"
                    ];
                    if (r.idTipoPuntaje == TipoPuntajeEnum.NO_APLICA) {
                        this.displayedColumns[i].push("puntaje");
                    }
                    if (r.idTipoPuntaje == TipoPuntajeEnum.CUMPLE) {
                        this.displayedColumns[i].push("cumpleDocumento");
                    }
                    if (r.idTipoPuntaje == TipoPuntajeEnum.PUNTAJE) {
                        this.displayedColumns[i].push("puntajeMaximo");
                        this.displayedColumns[i].push("descripcionUnidadMedida");
                        this.displayedColumns[i].push("acreditaDocumento");
                        this.displayedColumns[i].push("cantidad");
                        this.displayedColumns[i].push("puntajeObtenido");
                    }
                    // console.log("datasource antes de load: ", this.dtSource);
                    this.dtSource[i].load(d);
                });
                console.log("datasource (datos de cada rubro): ", this.dtSource);
            }
            this.verificarInicioCumpleCheck();
        });
    }

    resetForm = () => {
        this.form.reset();
    };

    setRequest(): void {
        const formulario = this.form.getRawValue();

        let anotaciones = formulario.anotaciones;

        for (let i = 0; i < this.info.rubro.length; i++) {
            this.info.rubro[i].evaluacion = [];
            if (this.info.rubro[i].codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN) {
                this.dtSource[i].data.forEach(d => {
                    if (d.puntajeObtenido != null) {
                        d.puntajeObtenido = parseFloat(d.puntajeObtenido);
                    }
                    this.info.rubro[i].evaluacion.push(d);
                });
            }
        }

        this.request = {
            idCalificacionDetalle: this.info.idCalificacionDetalle,
            idMaestroProcesoCalificacion: this.info.idMaestroProcesoCalificacion,
            anotaciones: anotaciones,
            usuarioModificacion: this.passport.numeroDocumento,
            rubro: this.info.rubro.filter(x => x.codigoRubro != RubroCalificacionEnum.RESULTADOS_PUN),
            puntajeFinal: parseFloat(this.info.puntajeFinal == null ? 0 : this.info.puntajeFinal)
        };
    }

    handleGuardar = () => {
      if(!this.formPostulante.valid) {
        this.dataService.Message().msgWarning('"SELECCIONE LA NACIONALIDAD DEL POSTULANTE."', () => { });
        return;
      }
        this.dataService.Message().msgConfirm(MensajesSolicitud.M02, () => {
            this.dataService.Spinner().show("sp6");
            this.setRequest();
            this.dataService.Contrataciones().postGuardarCalificacion(this.request).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MensajesSolicitud.M07,3000, () => {});
                        // handleRetornar
                        this.router.navigate(["./../../../../"], { relativeTo: this.route });

                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
                    }
                });
        }, () => {});
    }

    handleRetornar = () => {
        this.router.navigate(["./../../../../"], { relativeTo: this.route });
    };

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Resultados de PUN");
        this.sharedService.setSharedTitle("Registrar Calificaciones");
    }

    redondearTresDecimales(number:any):string { // req observaciones
        
        let numero = parseFloat(number == null ? 0 : number)
        var numeroTexto:string = number.toFixed(3);
        return numeroTexto;
    }

    // puntajeMaximoPadre : any;
    // maximaCantidadPadre : any;

    // obtenerPuntajeMaximoGrilla(row : any):string{
    //     if(row.idCodigoPadre == null){
    //         this.puntajeMaximoPadre = null;
    //         this.maximaCantidadPadre = null;
    //     }
    //     if (row.tieneSubCriterio == true){
    //         this.puntajeMaximoPadre = row.puntajeMaximo;
    //         this.maximaCantidadPadre = row.maximaCantidad;
    //         // row.puntajeMaximo = null;
    //         // row.maximaCantidad = null;
    //     }
    //     if(row.puntajeMaximo == null && row.tieneSubCriterio == false && this.puntajeMaximoPadre != null){
    //         console.log(this.puntajeMaximoPadre,row);
    //         row.puntajeMaximo = this.puntajeMaximoPadre;
    //         row.maximaCantidad = 99999; // SI LLEGAMOS A ESTE PUNTO, SIGNIFICA QUE LA DATA ESTA MAL INGRESADA EN LA BD
    //         return row.puntajeMaximoPadre;
    //     }

    //     return row.puntajeMaximo;
    // }

    verificarAcreditaDocumento(row:any){
        // sin
        if (    ((row.puntajeMaximo != null && row.puntajeMaximo != 0) && (!row.tieneSubCriterio && row.idCodigoPadre != null))
            ||  ((row.puntajeMaximo == null ) && (!row.tieneSubCriterio && row.idCodigoPadre != null))
            ||  ((row.puntajeMaximo != null ) && (!row.tieneSubCriterio && row.idCodigoPadre == null))
            )
        {
            return true;
        }
        else {
            return false;
        }

    }
    formPostulante:any;
    handleDataPostulante =(data) => {
      this.formPostulante = data;
    }
}

export class EvaluacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idCalificacion === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Contrataciones().getObtenerCalificacionRubroDetalle(data).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((d: any) => {
                this._dataChange.next(d || []);
                this.totalregistro = (d || []).length === 0 ? 0 : d[0].total_registros;
            });
        }
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalregistro;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}
