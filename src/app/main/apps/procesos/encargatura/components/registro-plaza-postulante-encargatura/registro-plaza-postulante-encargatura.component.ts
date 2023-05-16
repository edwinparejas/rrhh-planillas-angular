import {Component, Inject, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import { of} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';

@Component({
    selector: "minedu-registro-plaza-postulante-encargatura",
    templateUrl: "./registro-plaza-postulante-encargatura.component.html",
    styleUrls: ["./registro-plaza-postulante-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroPlazaPostulanteEncargaturaComponent implements OnInit {
    @Input() idEtapaProceso : number;
    @Input() idDesarrolloProceso : number;
    plazaEncargaturaDetalle: any;
    loading = false;
    export = false;
    isMobile = false;
    formPlazaTitulo: FormGroup;
    formPlazaPostular: FormGroup;
    request = {
        idEtapaProceso: 0,
        idDesarrolloProceso: 0,
        codigoPlaza: null
    };
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
        public dialogRef: MatDialogRef<RegistroPlazaPostulanteEncargaturaComponent>,
        private formBuilder: FormBuilder,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        this.handleResponsive();
        this.buildForm();
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildForm() {
        this.formPlazaTitulo = this.formBuilder.group({
            titulo: [null, Validators.required],
            fechaExpedicionTitulo: [null, Validators.required],
            fechaRegistroTitulo: [null, Validators.required]
        });

        this.formPlazaPostular = this.formBuilder.group({
            codigoPlaza: [null, Validators.required]
        });
    }

    setRequest() {
        const idEtapaProceso = this.idEtapaProceso;
        const idDesarrolloProceso = this.idDesarrolloProceso;
        const codigoPlaza = this.formPlazaPostular.get("codigoPlaza").value;
        this.request = {
            idEtapaProceso: idEtapaProceso,
            idDesarrolloProceso: idDesarrolloProceso,
            codigoPlaza: codigoPlaza
        };
    }

    limpiarDataPlaza(){
        this.plazaEncargaturaDetalle = null;
    }
    handleBuscar(): void {     
        if (this.formPlazaPostular.valid == false) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS."', () => { });
            return;
        } 
        this.setRequest();
        this.loading = true;
        this.dataService.Spinner().show('sp6');
        this.dataService.Encargatura().getPlazaEncargaturaDetallePorCodigo(this.request).pipe(catchError(() => of([])), finalize(() => {
            this.loading = false;
            this.dataService.Spinner().hide('sp6');
        })).subscribe((result: any) => {
            if (result) {
                this.plazaEncargaturaDetalle = {
                    idPlazaEncargaturaDetalle: result.idPlazaEncargaturaDetalle,
                    idPlazaEncargatura: result.idPlazaEncargatura,
                    codigoPlaza: result.codigoPlaza,
                    descripcionRegimenLaboral: result.descripcionRegimenLaboral,
                    descripcionCondicion: result.descripcionCondicion,
                    descripcionTipoPlaza: result.descripcionTipoPlaza,
                    descripcionCargo: result.descripcionCargo,
                    descripcionEspecialidad: result.descripcionEspecialidad,
                    descripcionJornadaLaboral: result.descripcionJornadaLaboral,
                    plazaVigenciaInicio: result.plazaVigenciaInicio,
                    plazaVigenciaFin: result.plazaVigenciaFin,
                    motivoVacancia: result.motivoVacancia,
                    codigoModular: result.codigoModular,
                    institucionEducativa: result.institucionEducativa,
                    descripcionUgel: result.descripcionUgel,
                    descripcionDre: result.descripcionDre,
                    abreviaturaModalidadEducativa: result.abreviaturaModalidadEducativa,
                    descripcionNivelEducativo: result.descripcionNivelEducativo,
                    descripcionTipoIEPadron: result.descripcionTipoIEPadron,
                    descripcionTipoGestionInstitucionEducativa: result.descripcionTipoGestionInstitucionEducativa,
                    descripcionDependenciaInstitucionEducativa: result.descripcionDependenciaInstitucionEducativa,
                    descripcionModeloServicio: result.descripcionModeloServicio,
                    descripcionTipoRuralidad: result.descripcionTipoRuralidad,
                    esBilingue: result.esBilingue,
                    esFrontera: result.esFrontera,
                    esVRAEM: result.esVRAEM,
                    descripcionLenguaInstitucionEducativa: result.descripcionLenguaInstitucionEducativa
                }
            } else {
                this.plazaEncargaturaDetalle = null;
                this.formPlazaPostular.reset();
                this.dataService.Message().msgWarning('"LA PLAZA SELECCIONADA NO SE ENCUENTRA PUBLICADA PARA LA ETAPA."', () => { });
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
     
}