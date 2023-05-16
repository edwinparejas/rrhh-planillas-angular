import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { MensajesSolicitud, TipoDocumentoIdentidadEnum } from '../../../_utils/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { InformacionPlazaValidacionComponent } from '../../../validacionplaza/informacion-plaza-validacion/informacion-plaza-validacion.component';

@Component({
    selector: 'minedu-modal-adjudicar-plaza',
    templateUrl: './modal-adjudicar-plaza.component.html',
    styleUrls: ['./modal-adjudicar-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalAdjudicarPlazaComponent implements OnInit {

    minDate: Date = null;
    maxDate: Date = null;

    minDateFin: Date = null;
    maxDateFin: Date = null;  

    adjudicacion: any = {};
    info: any;
    dialogTitle = 'Adjudicar Plaza';
    working = true;
    isMobile = false;
    formGrid: FormGroup;
    ls_grid: FormArray;
    idPersona: number;
    idAdjudicacion: number;
    idEtapaProceso: number;
    dialogRef: any;
    dtSourceAdjudicar: any[] = [];
    displayedColumnsAdjudicar: string[] = [
        "registro",
        "codigoModular",
        "centroTrabajo",
        // "modalidad",
        "nivelEducativo",
        "codigoPlaza",
        "cargo",
        "jornadaLaboral",
        "tipoPlaza",
        "vigenciaInicio",
        "vigenciaFin",
        "acciones"
    ];

    requestAdjudicar = {
        idAdjudicacion: null,
        usuarioCreacion: null,
        idPlazaContratacionDetalle: null,
        inicioContrato: null,
        finContrato: null
    }
    constructor(
        //public matDialogRef: MatDialogRef<ModalAdjudicarPlazaComponent>,
        //@Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private route: ActivatedRoute,
        private materialDialog: MatDialog,
        private router: Router
    ) { 
        //this.info = data;
    }

    ngOnInit(): void {
        let data = this.route.snapshot.params;
        this.info = {id_adjudicacion:parseInt(data.idAdjudicacion)};
	this.idEtapaProceso = data.idEtapaProceso;
        this.buildForm();
        this.obtenerInformacionAdjudicacion();
	this.minDate = new Date(data.anio,0,1);
	this.maxDate = new Date((+data.anio+1), 11, 31);  

    this.minDateFin = new Date(data.anio,0,1);
    this.maxDateFin = new Date((+data.anio+1), 11, 31);  
        console.log("maxdate fin",this.maxDateFin);
        console.log("mindate fin",this.minDateFin);
    }

    buildForm(): void {
        this.formGrid = this.formBuilder.group({ ls_grid: this.formBuilder.array([]) });
    }

    obtenerInformacionAdjudicacion = () => {
        var d = {
            idAdjudicacion: this.info.id_adjudicacion
        };

        this.dataService.Contrataciones().getObtenerInformacionAdjudicacionDesdePostulacion(d).pipe(catchError(() => of([])),
            finalize(() => {
                this.working = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                let dataAdjudicar = [];
                this.adjudicacion = response;
		this.adjudicacion = {
		    ...this.adjudicacion,
		    nacionalidad : this.obtenerNacionalidad(response)
		};

                dataAdjudicar.push(response);
                this.dtSourceAdjudicar = dataAdjudicar;
                this.DataBindAdjudicacion();
            }
        });
    }

    obtenerNacionalidad = (data) => {
	if(data.tipoDocumento == TipoDocumentoIdentidadEnum.DNI && !data.nacionalidad){
	    data.nacionalidad = 'PERUANA';
	}
	return data.nacionalidad;
    }

    DataBindAdjudicacion = () => {
        let filas = this.formBuilder.array([]);
        this.dtSourceAdjudicar.forEach(x => {
            filas.push(this.formBuilder.group({
                ini: [x.vigenciaInicio, Validators.required],
                fin: [x.vigenciaFin, Validators.required]
            }));
        });

        this.formGrid = this.formBuilder.group({
            ls_grid: filas
        });

	let ls_grid:any = this.formGrid.controls.ls_grid;
	ls_grid.controls[0].controls.ini.valueChanges.subscribe(x =>{
	    let fechaInicio = ls_grid.controls[0].controls.ini.value;
	    let fechaFin = ls_grid.controls[0].controls.fin.value;

        //console.log("cambio de fechas",fechaInicio, fechaFin);
        if (fechaInicio){ // validacion fecha fin
            this.minDateFin = fechaInicio;
            let dateFechaInicio = new Date(fechaInicio);
            let dateAnioInicio =  dateFechaInicio.getFullYear();
            this.maxDateFin = new Date((+dateAnioInicio), 11, 31);  
        }

	    if(fechaInicio && fechaFin){
		var diferenciaFechas = fechaFin.getTime() - fechaInicio.getTime();
		var diasTranscurridos = diferenciaFechas / (1000 * 3600 * 24);
		if(diasTranscurridos < 30){
		    ls_grid.controls[0].controls.ini.setValue(null);
		    this.dataService.Message().msgWarning(MensajesSolicitud.M234, () => { });
		}
	    }
	});

	ls_grid.controls[0].controls.fin.valueChanges.subscribe(x => {
	    let fechaInicio = ls_grid.controls[0].controls.ini.value;
	    let fechaFin = ls_grid.controls[0].controls.fin.value;
	    if(fechaInicio && fechaFin){
		var diferenciaFechas = fechaFin.getTime() - fechaInicio.getTime();
		var diasTranscurridos = diferenciaFechas / (1000 * 3600 * 24);
		if(diasTranscurridos < 30){
		    ls_grid.controls[0].controls.fin.setValue(null);
		    this.dataService.Message().msgWarning(MensajesSolicitud.M219, () => { });
		}
	    }
	});
    }

    setRequestAdjudicar(ls_grid: any): void {
        // const dateCurrent = new Date();   
        // const dateInicio:Date = new Date(ls_grid.controls[0].controls.ini.value);
        // const dateFin:Date = new Date(ls_grid.controls[0].controls.fin.value);
        // console.log(dateCurrent," - ", dateInicio ," - ", dateFin);
        // if (dateFin.getFullYear() == dateCurrent.getFullYear())
        
        {
            this.requestAdjudicar = {
                idAdjudicacion: this.info.id_adjudicacion,
                idPlazaContratacionDetalle: this.adjudicacion.id_plaza_contratacion_detalle,
                inicioContrato: ls_grid.controls[0].controls.ini.value,
                finContrato: ls_grid.controls[0].controls.fin.value,
                usuarioCreacion: "ADMIN",
            }
        }
    }

    handleAdjudicarPlaza = () => {
        if (!this.formGrid.valid) {
            this.dataService.Message().msgWarning(MensajesSolicitud.M08, () => { });
            return;
        }
        // vigenciaFin : Date = ls_grid.controls[0].controls.fin.value; 
        // if () {
        //     this.dataService.Message().msgWarning(MensajesSolicitud.M08, () => { });
        //     return;
        // }

        this.dataService.Message().msgConfirm(MensajesSolicitud.M02, () => {
            this.dataService.Spinner().show("sp6");
            this.setRequestAdjudicar(this.formGrid.controls.ls_grid);
            this.dataService.Contrataciones().adjudicarPlazaContratacionDirectaAdjudicaciones(this.requestAdjudicar).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message()
			                .msgAutoCloseSuccessNoButton(MensajesSolicitud.M07,3000, 
								     () => { this.handleRetornar() });
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
                    }
                });
        }, () => {});
    }

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

    handleCancel = (data?: any) => { 
        if (data) {
            //this.matDialogRef.close({ data: data });
        } else {
            //this.matDialogRef.close();
        }
    }

    handleRetornar = () => {
        this.router.navigate(["../../../../"], { relativeTo: this.route });
    };

    handleVerInformacion = (id) =>{
        console.log(id);
        debugger;
        this.dialogRef = this.materialDialog.open(InformacionPlazaValidacionComponent, {
            panelClass: "informacion-validacion-plazas-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idEtapaProceso: +this.idEtapaProceso,
                idPlaza: id
            },
        });
    }

    onChangeEvent(event:any){
        console.log(event)
        let ls_grid:any = this.formGrid.controls.ls_grid;
        console.log(ls_grid.controls[0].controls.ini.value)
    }
}
