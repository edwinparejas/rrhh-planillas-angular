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
    selector: "minedu-encargatura-informacion-calificacion",
    templateUrl: "./encargatura-informacion-calificacion.component.html",
    styleUrls: ["./encargatura-informacion-calificacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EncargaturaInformacionCalificacionComponent implements OnInit {
    
    idEtapaProceso: number;
    idDesarrolloProceso:number;    
    idCalificacion: number;
    idPostulacion: number;
    codigoEtapa: number;
    calificacion: any;
    rubrosCalificacion: any[];
    currentSession: SecurityModel = new SecurityModel(); 
    TituloSeccion:string="Datos del postulante";
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
        'sustento',
        'cantidadCertificad',
        'puntajeObtenido'
    ];
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
        private dataService: DataService,
        private route: ActivatedRoute,
        private router: Router,
        private entidadSedeService: EntidadSedeService
    ) {
        this.codigoEtapa = parseInt(this.route.snapshot.params.etapa);
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.idDesarrolloProceso = parseInt(this.route.snapshot.params.desa);
        this.idCalificacion = parseInt(this.route.snapshot.params.idCalificacion);
        this.idPostulacion = parseInt(this.route.snapshot.params.idPostulacion);
        

        this.calificacion = {};
    }

    ngOnInit(): void {
        this.initializeComponent();
    }
    private async initializeComponent() {        
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.getDreUgelData();
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

    loadCalificacion() {
        this.dataService.Encargatura().getCalificacion(this.idCalificacion).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.calificacion = {
                    idCalificacion: result.idCalificacion,
                    descripcionMotivoObservacion: result.descripcionMotivoObservacion,
                    anotacionesObservacion: result.anotacionesObservacion,
                    conReclamo: result.conReclamo,
                    detalleReclamo: result.detalleReclamo,
                    anotacionesCalificacion: result.anotacionesCalificacion
                }
            }
        });
    }

    loadRubrosCalificacion() {
        debugger
        const request = {
            idCalificacion: this.idCalificacion,
            idPostulacion: this.idPostulacion,
            codigoEtapa: this.codigoEtapa,
            idDesarrolloProceso:this.idDesarrolloProceso,
            codigoTipoSede:this.currentSession.codigoTipoSede,
            codigoRolPassport:this.currentSession.codigoRol
        };
        this.dataService.Encargatura().getRubrosCalificacion(request).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.rubrosCalificacion = result.map((x) => ({
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
                        puntajeMaximo: y.puntajeMaximo,
                        puntajeMaximoUnidad: y.puntajeMaximoUnidad,
                        esSeleccionExcluyente: y.esSeleccionExcluyente,
                        cumpleDocumento: y.cumpleDocumento,
                        cantidadUnidad: y.cantidadUnidad,
                        acreditaDocument: y.acreditaDocument,
                        puntajeObtenido: y.puntajeObtenido,
                        esPuntajeTotalRubro: y.esPuntajeTotalRubro
                    }))
                }));
            }
        });
    }

    handleCancel() {
        // this.dialogRef.close();
        this.irCalificacion();
    }

    irCalificacion(){
        this.router.navigate(['../../../../../../calificaciones/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso], {
            relativeTo: this.route
        });
    }
    

    irInformacionCalificacion(){        
        this.router.navigate(['../../../../../../informacioncalificacion/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso+ '/' + this.idCalificacion+ '/' + this.idPostulacion], {
            relativeTo: this.route
        });
    }
}