import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../../../../core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { EtapaEnum, TipoPuntajeEnum } from '../_utils/constants';
import { ENCARGATURA_MESSAGE } from '../_utils/message';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EntidadSedeService } from '../Services/entidad-sede.service';

@Component({
    selector: "minedu-encargatura-registro-requisitos-condiciones-calificacion",
    templateUrl: "./encargatura-registro-requisitos-condiciones-calificacion.component.html",
    styleUrls: ["./encargatura-registro-requisitos-condiciones-calificacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaRegistroRequisitosCondicionesCalificacionComponent implements OnInit {
    
    idEtapaProceso: number;
    idDesarrolloProceso:number;    
    codigoEtapa: number;
    idCalificacion: number;
    idPostulacion: number;
    form: FormGroup;
    loading = false;
    rubrosCalificacion: any[];
    criteriosCalificacion: any[];
    TituloSeccion:string="Datos del postulante";
    currentSession: SecurityModel = new SecurityModel(); 
    anotacionesNG="";
    displayedColumnsCumple: string[] = [
        'codigoCriterio',
        'descripcionCriterio',
        'cumpleDocumento'
    ];
    displayedColumnsPuntaje: string[] = [
        'codigoCriterio',
        'descripcionCriterio',
        'puntajeMaximo',
        'puntajeUnidad',
        'acreditaDocument',
        // 'sustento',
        'cantidadCertificad',
        'puntajeObtenido'
    ];
    request = {
        idCalificacion: null,
        listaRubroCalificacion: [],
        listaCriterioCalificacion: [],
        codigoEtapa:null,
        anotacionesCalificacion: null,
        UsuarioModificacion:null
    }
    tipoPuntajeEnum = TipoPuntajeEnum;
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
        private formBuilder: FormBuilder,
        private dataService: DataService,   
        private route: ActivatedRoute,
        private router: Router,
        private entidadSedeService: EntidadSedeService
    ) {
        // this.idCalificacion = data.idCalificacion;
        // this.idPostulacion = data.idPostulacion;
        // this.currentSession = data.currentSession;
        // this.idDesarrolloProceso = data.idDesarrolloProceso;

        this.codigoEtapa = parseInt(this.route.snapshot.params.etapa);
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.idDesarrolloProceso = parseInt(this.route.snapshot.params.desa);
        this.idCalificacion = parseInt(this.route.snapshot.params.idCalificacion);
        this.idPostulacion = parseInt(this.route.snapshot.params.idPostulacion);
    }

    ngOnInit(): void {
        this.initializeComponent();
    }
    
    private async initializeComponent() {        
        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();

        this.buildSeguridad();
        this.loadCalificacion();
        this.loadRubrosCalificacion();
    }
    
    private async getDreUgelData() {
        this.currentSession.codigoSede=this.entidadSedeService.entidadSede.codigoSede;
        this.currentSession.codigoTipoSede=this.entidadSedeService.entidadSede.codigoTipoSede;
    }

    isTrueSet(value: any) {
        return Boolean(value);
    }

    buildForm() {
        this.form = this.formBuilder.group({
            anotacionesCalificacion: [null, [Validators.maxLength(4000)]]
        });
    }

    buildSeguridad() {
        
    }

    loadCalificacion() {
        this.dataService.Encargatura().getCalificacion(this.idCalificacion).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.form.patchValue({
                    anotacionesCalificacion: result.anotacionesCalificacion
                });
                this.anotacionesNG=result.anotacionesCalificacion;

            }
        });
    }

    loadRubrosCalificacion() {
        const request = {
            idCalificacion: this.idCalificacion,
            idPostulacion: this.idPostulacion,
            codigoEtapa: this.codigoEtapa,
            idDesarrolloProceso:this.idDesarrolloProceso,
            codigoTipoSede:this.currentSession.codigoTipoSede,
            codigoRolPassport:this.currentSession.codigoRol,


        };
        this.dataService.Encargatura().getRubrosCalificacion(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.rubrosCalificacion = result.map((x: any) => ({
                    idMaestroRubroCalificacion: x.idMaestroRubroCalificacion,
                    descripcionRubroCalificacion: x.descripcionRubroCalificacion,
                    puntajeMaximoRubro: x.puntajeMaximoRubro,
                    codigoTipoRubro: x.codigoTipoRubro,
                    codigoTipoPuntaje: x.codigoTipoPuntaje,
                    puntajeTotalRubro: x.puntajeTotalRubro,
                    listaMaestroCriterioCalificacion: x.listaMaestroCriterioCalificacion.map((y) => ({
                        idMaestroRubroCalificacion: y.idMaestroRubroCalificacion,
                        idMaestroCriterioCalificacion: y.idMaestroCriterioCalificacion,
                        codigoCriterio: y.codigoCriterio,
                        descripcionCriterio: y.descripcionCriterio,
                        idCodigoPadre: y.idCodigoPadre,
                        tieneSubCriterio: y.tieneSubCriterio,
                        tieneCantidad: y.tieneCantidad,
                        validaEscala: y.validaEscala,
                        puntajeMaximo: y.puntajeMaximo,
                        puntajeMaximoUnidad: y.puntajeMaximoUnidad,
                        esSeleccionExcluyente: y.esSeleccionExcluyente,
                        cumpleDocumento:  (y.iniciado==true?
                            y.cumpleDocumento:
                            (y.validaEscala==true?
                                (y.marcarEscala==true?
                                    true:
                                    false)
                                :true)),
                        cantidadUnidad: y.cantidadUnidad,
                        acreditaDocument: y.acreditaDocument,
                        puntajeObtenido: y.puntajeObtenido,
                        esPuntajeTotalRubro: y.esPuntajeTotalRubro,
                        marcarEscala: y.marcarEscala,
                        iniciado: y.iniciado
                    }))
                }));
            }
        });
    }

    changePuntajeCheck(event, row, j, i) {
        if (event.checked == false) {
            this.rubrosCalificacion[j].listaMaestroCriterioCalificacion[i].puntajeObtenido = 0;
        }
        this.rubrosCalificacion[j].listaMaestroCriterioCalificacion[i].acreditaDocument = event.checked;
        if((row.puntajeMaximoUnidad || 0)==0){
            this.rubrosCalificacion[j].listaMaestroCriterioCalificacion[i].puntajeObtenido = row.puntajeMaximo;
        }        
        this.calcularPuntajeFinal(row, j, i);
    }

    changePuntajeRadio(row, j, i) {
        this.rubrosCalificacion[j].listaMaestroCriterioCalificacion.forEach((x) => {
            if (x.idCodigoPadre == row.idCodigoPadre) {
                x.acreditaDocument = false;
                x.puntajeObtenido = 0;
            }
        });
        this.rubrosCalificacion[j].listaMaestroCriterioCalificacion[i].acreditaDocument = true;
        this.rubrosCalificacion[j].listaMaestroCriterioCalificacion[i].puntajeObtenido = row.puntajeMaximo;
        this.calcularPuntajeFinal(row, j, i);
    }

    calcularPuntajeObtenido(row, j, i) {
        let puntajeObtenido = 0;
        puntajeObtenido = row.puntajeMaximoUnidad * row.cantidadUnidad;
        this.rubrosCalificacion[j].listaMaestroCriterioCalificacion[i].puntajeObtenido = puntajeObtenido;
        this.calcularPuntajeFinal(row, j, i);
    }

    calcularPuntajeFinal(row, j, i) {
        if (row.puntajeObtenido > row.puntajeMaximo) {
            this.dataService.Message().msgWarning('"PUNTAJE MÁXIMOP DEBE SER ' + row.puntajeMaximo+'"', () => { });
            this.rubrosCalificacion[j].listaMaestroCriterioCalificacion[i].puntajeObtenido = 0;
        }
        let puntajeObtenido = 0;
        let puntajeTotalRubro = 0;
        this.rubrosCalificacion[j].listaMaestroCriterioCalificacion.forEach((x) => {
            if (x.idCodigoPadre == row.idCodigoPadre) {
                puntajeObtenido += parseInt(x.puntajeObtenido || 0);
            }
        });
        this.rubrosCalificacion[j].listaMaestroCriterioCalificacion.forEach((x) => {
            if (x.idMaestroCriterioCalificacion == row.idCodigoPadre) {
                x.puntajeObtenido = puntajeObtenido;
            }
        });
        this.rubrosCalificacion[j].listaMaestroCriterioCalificacion.forEach((x) => {
            if (x.idCodigoPadre == null && !x.esPuntajeTotalRubro) {
                puntajeTotalRubro += parseInt(x.puntajeObtenido || 0);
            }
        });
        this.rubrosCalificacion[j].puntajeTotalRubro = puntajeTotalRubro;
    }

    setRequest() {
        const anotacionesCalificacion = this.form.get('anotacionesCalificacion').value;

        this.criteriosCalificacion = [];

        this.rubrosCalificacion.forEach((x) => {
            x.listaMaestroCriterioCalificacion.forEach((y) => {
                if (!y.esPuntajeTotalRubro) {
                    this.criteriosCalificacion.push({
                        idMaestroRubroCalificacion: y.idMaestroRubroCalificacion,
                        idMaestroCriterioCalificacion: y.idMaestroCriterioCalificacion,
                        cumpleDocumento: y.cumpleDocumento,
                        cantidadUnidad: parseInt(y.cantidadUnidad || 0),
                        puntajeObtenido: parseInt(y.puntajeObtenido || 0),
                    });
                }
            });
        });

        this.request = {
            idCalificacion: this.idCalificacion,
            listaRubroCalificacion: this.rubrosCalificacion,
            listaCriterioCalificacion: this.criteriosCalificacion,
            codigoEtapa:this.codigoEtapa,
            anotacionesCalificacion: anotacionesCalificacion,
            UsuarioModificacion:this.currentSession.nombreUsuario
        }
    }

    handleSave() {
        this.setRequest();
        this.dataService.Message().msgConfirm('¿ESTA SEGURO DE QUE DESEA GUARDAR LA INFORMACIÓN DE LA CALIFICACIÓN?', () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().registerCalificacionEncargatura(this.request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe(result => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000,() => { 
                            this.irCalificacion();
                        });
                        // this.dialogRef.close({event:'Save'});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFOMRACIÓN."', () => { });
                    }
                }
            });
        }, () => { });
    }

    handleCancel() {
        this.irCalificacion();
    }

    validarEscala(event,row:any,i,rubro){        
        if(row.validaEscala){            
            const data = {
                idPostulacion: this.idPostulacion,
                idMaestroCriterioCalificacion: row.idMaestroCriterioCalificacion
            };
            this.dataService.Encargatura().validaescala(data).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {            
                if (!result) {
                    this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M156, () => { });
                    rubro['listaMaestroCriterioCalificacion'][i].cumpleDocumento=false;
                    event.source.checked=false;
                }
            });
        }
    }

    irCalificacion(){
        this.router.navigate(['../../../../../../calificaciones/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }
    
    irRequisitosyCondiciones(){        
        this.router.navigate(['../../../../../../requisitosycondiciones/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso+ '/' + this.idCalificacion+ '/' + this.idPostulacion], {
            relativeTo: this.route
        });
    }
}