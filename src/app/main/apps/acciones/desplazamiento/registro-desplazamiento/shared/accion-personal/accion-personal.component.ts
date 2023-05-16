import { ChangeDetectorRef, Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { IPassportRol } from '../../../models/passport.interface';
import { RegistrarDesplazamientoService } from '../../services/registrar-desplazamiento.service';

@Component({
    selector: 'minedu-accion-personal',
    templateUrl: './accion-personal.component.html',
    styleUrls: ['./accion-personal.component.scss']
})
export class AccionPersonalComponent implements OnInit, AfterViewInit {


    @Input('parentForm')
    public parentForm: FormGroup;


    @Input('accionPersonalItem')
    accionPersonalItem: any = null;


    //combos
    regimenLaboralList: any[];
    tipoDocumentoList: any[];
    grupoAccionList: any[];
    accionList: any[];
    motivoAccionList: any[];

    private passportRolData: IPassportRol;
    private esModificar = false;

    constructor(
        private cd: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private registrarDesplazamientoService: RegistrarDesplazamientoService
    ) { }


    ngAfterViewInit(): void {

    }

    ngOnInit(): void {
        this.cargarTodo();
    }

    set form(form: FormGroup) {
        this.parentForm?.setControl("accionPersonal", form);
    }

    get form() {
        return this.parentForm?.controls["accionPersonal"] as FormGroup;
    }


    

    private async getAccionPersonaItem() {

        this.registrarDesplazamientoService.accionPersonalItem$.subscribe(async (item: any) => {
            if (!item) return;
            this.esModificar = true;
            this.form.controls["idRegimenLaboral"].setValue(item?.idRegimenLaboral);
            await this.grupoAccion(item?.idRegimenLaboral);

            this.form.controls["idGrupoAccion"].setValue(item?.idGrupoAccion);
            await this.accion(item?.idGrupoAccion);

            this.form.controls["idAccion"].setValue(item?.idAccion);
            await this.motivoAccion(item?.idAccion);

            this.form.controls["idMotivoAccion"].setValue(item?.idMotivoAccion);
            await this.motivoAccionId(item?.idMotivoAccion);

            this.form.controls["porMandatoJudicial"].setValue(item?.esMandatoJudicial == 1 ? true : false);
            this.form.controls["porProceso"].setValue(item?.esPorProceso);

            this.form.controls["idRegimenLaboral"].disable();
            this.form.controls["idGrupoAccion"].disable();
            this.form.controls["idAccion"].disable();
            this.form.controls["idMotivoAccion"].disable();
            this.form.controls["porMandatoJudicial"].disable();
            this.form.controls["porProceso"].disable();
        });


    }

    private buildForm() {
        this.form?.controls["idGrupoAccion"].disable();
        this.form?.controls["idAccion"].disable();
        this.form?.controls["idMotivoAccion"].disable();
        this.form?.controls["porMandatoJudicial"].disable();
        this.form?.controls["porProceso"].disable();
    }

    private async cargarTodo() {

        this.buildForm();
        await this.setIdsRolCentroTrabajo();
        await this.loadRegimenLaboral();
        this.getAccionPersonaItem();
    }

    private get currentSession() {
        return this.dataService.Storage().getInformacionUsuario();
    }

    private async setIdsRolCentroTrabajo() {
        const codigoRolPassport = this.currentSession.codigoRol;
        const codigoSede = this.currentSession.codigoSede;
        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getRolCentroTrabajo(codigoRolPassport, codigoSede)
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            )
            .toPromise();

        if (isSuccess && response) {
            this.passportRolData = {
                idRolPassport: response?.rolPassport?.idRolPassport,
                idNivelInstancia: response?.centroTrabajo?.idNivelInstancia
            }
        }
    }

    private async loadRegimenLaboral() {
        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getComboRegimenLaboral(this.passportRolData.idRolPassport, this.passportRolData.idNivelInstancia, true)
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of([]);
                }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response?.map((x) => ({
                ...x,
                value: x.idRegimenLaboral,
                label: `${x.descripcionRegimenLaboral}`,
            }));

            this.regimenLaboralList = data;
        }
    }

    private async loadGrupoAccion(idRegimen: number) {
        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getComboGrupoAccion(idRegimen, this.passportRolData.idRolPassport, this.passportRolData.idNivelInstancia, true)
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of([]);
                }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idGrupoAccion,
                label: `${x.descripcionGrupoAccion}`,
            }));
            this.grupoAccionList = data;
            this.form?.controls['idGrupoAccion'].enable();
        }
    }

    private async loadAccion(idGrupoAccion: number) {
        const idRegimenLaboral = this.form?.controls["idRegimenLaboral"].value;

        if (!idGrupoAccion || !idRegimenLaboral) return;

        let isSuccess = true;
        var response = await this.dataService.AccionesPersonal()
            .getComboAccion(idGrupoAccion, this.passportRolData.idRolPassport, this.passportRolData.idNivelInstancia, idRegimenLaboral, true)
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of([]);
                }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idAccion,
                label: `${x.descripcionAccion}`,
            }));
            this.accionList = data;
            this.form?.controls['idAccion'].enable();
        }
    }

    private async getMotivoAccion() {

        const idRegimenLaboral = this.form?.controls["idRegimenLaboral"].value;
        const idGrupoAccion = this.form?.controls["idGrupoAccion"].value;
        const idAccion = this.form?.controls["idAccion"].value;

        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getMotivoAccion(idAccion, this.passportRolData.idRolPassport, this.passportRolData.idNivelInstancia, idRegimenLaboral, idGrupoAccion, true)
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of([])
                }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            if (response) {
                const data = response.map((x) => ({
                    ...x,
                    value: x.idMotivoAccion,
                    label: `${x.descripcionMotivoAccion}`,
                }));
                this.motivoAccionList = data;
                this.form?.controls['idMotivoAccion'].enable();
            }
        }
    }

    private limpiarSwitches() {
        if (this.esModificar) return;

        this.form?.controls["porMandatoJudicial"].reset();
        this.form?.controls["porProceso"].reset();
        this.form?.controls["porMandatoJudicial"].disable();
        this.form?.controls["porProceso"].disable();
        this.form?.controls["porProceso"].setValue(false);


    }

    private limpiarPorMotivoAccion() {
        this.limpiarSwitches();
        this.limpiarFormularios();
    }

    limpiarFormularios(evento = null) {
        if (this.esModificar) return;

        (this.parentForm.controls["datosPersonales"] as FormGroup).reset();
        (this.parentForm.controls["adjudicacionPersona"] as FormGroup).reset();
        (this.parentForm.controls["plazaOrigen"] as FormGroup).reset();
        (this.parentForm.controls["plazaDestino"] as FormGroup).reset();
    }


    async grupoAccion(idRegimen: number) {
        this.limpiarPorMotivoAccion();
        this.form?.controls['idGrupoAccion'].setValue(null);
        this.form?.controls['idAccion'].setValue(null);
        this.form?.controls['idMotivoAccion'].setValue(null);

        if (idRegimen === null) {
            this.form?.controls['idGrupoAccion'].disable();
            this.form?.controls['idAccion'].disable();
            this.form?.controls['idMotivoAccion'].disable();
            return;
        }
        await this.loadGrupoAccion(idRegimen);
    }

    async accion(idGrupoAccion) {
        this.limpiarPorMotivoAccion();
        this.form?.controls['idAccion'].setValue(null);
        this.form?.controls['idMotivoAccion'].setValue(null);

        if (idGrupoAccion === null) {
            this.form?.controls['idAccion'].disable();
            this.form?.controls['idMotivoAccion'].disable();
            return;
        }

        await this.loadAccion(idGrupoAccion);
    }

    async motivoAccion(idAccion) {
        this.limpiarPorMotivoAccion();
        this.form?.controls['idMotivoAccion'].setValue(null);

        if (idAccion === null) {
            this.form?.controls['idMotivoAccion'].disable();
            return;
        }
        //grabando estado de la accion en el service
        await this.getMotivoAccion();
    }

    motivoAccionId(data) {
        this.limpiarPorMotivoAccion();
        if (data === null) {
            return;
        }

        const idRegimenLaboral = this.form?.controls["idRegimenLaboral"].value;
        const regimenLaboral = this.regimenLaboralList.find(x => x.idRegimenLaboral == idRegimenLaboral);
        if (regimenLaboral) this.form?.controls['strRegimenLaboral'].setValue(regimenLaboral.abreviaturaRegimenLaboral);

        const idGrupoAccion = this.form?.controls["idGrupoAccion"].value;
        const grupoAccion = this.grupoAccionList.find(x => x.idGrupoAccion == idGrupoAccion);
        if (grupoAccion) this.form?.controls['strGrupoAccion'].setValue(grupoAccion.descripcionGrupoAccion);

        const idAccion = this.form?.controls["idAccion"].value;
        const accion = this.accionList.find(x => x.idAccion == idAccion);
        if (accion) {
            this.form?.controls['strAccion'].setValue(accion.descripcionAccion);

        }

        const oMotivoAccion = this.motivoAccionList.find(item => item.value === data);
        if (oMotivoAccion) this.form?.controls['strMotivoAccion'].setValue(oMotivoAccion.descripcionMotivoAccion);

        this.limpiarSwitches();

        if (!this.esModificar && oMotivoAccion?.esProceso) {
            this.form?.controls["porProceso"].enable();
            this.form?.controls["porProceso"].setValue(true);
        }

        if (oMotivoAccion?.esMandatoJudicial) {
            this.form?.controls["porMandatoJudicial"].enable();
            this.form?.controls["porMandatoJudicial"].setValue(false);
        }
    }
}
