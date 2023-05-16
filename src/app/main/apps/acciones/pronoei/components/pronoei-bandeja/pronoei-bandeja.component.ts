import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, map, catchError, finalize } from 'rxjs/operators';
import { FormFilterValuesService } from '../../services/form-filter-values.service';
import * as moment from "moment";
import { PronoeiCatalogoDataService } from '../../services/pronoei-catalogo-data.service';
import { ICatalogoResponse } from '../../interfaces/catalogo.interface';
import { CodigoDreUgelService } from '../../services/codigo-dre-ugel.service';
import { HttpErrorResponse } from '@angular/common/http';
import { descargarExcel } from 'app/core/utility/functions';
import { RegimenGrupoAccionService } from '../../services/regimen-grupo-accion.service';
import { MESSAGE_GESTION, TipoEstadoPronoeiEnum } from '../../_utils/constants';
import { BuscarPersonaComponent } from '../popups/buscar-persona/buscar-persona.component';
import { BuscarCentroTrabajoComponent } from '../popups/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { IMaestroPermisoResponse } from '../../interfaces/maestro-permiso.interface';

@Component({
    selector: 'minedu-pronoei-bandeja',
    templateUrl: './pronoei-bandeja.component.html',
    styleUrls: ['./pronoei-bandeja.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PronoeiBandejaComponent implements OnInit, OnDestroy, AfterViewInit {

    form: FormGroup;
    tipoDocumentos: any[] = [];
    now = new Date();

    minDate = new Date(this.now.getFullYear(), 0, 1);
    maxDate = new Date(this.now.getFullYear() + 1, 11, 31);

    private _unsubscribeAll: Subject<any>;

    maestroPermiso$: Observable<IMaestroPermisoResponse>;

    comboTipoDocumento$: Observable<ICatalogoResponse[]>;
    comboEstadosPronoei$: Observable<ICatalogoResponse[]>;
    comboTipoZona$: Observable<ICatalogoResponse[]>;
    bandejaPrincipalSelectRows$: Observable<any[]>;

    centroTrabajoFiltroSeleccionado: any;

    dataSource: any | null;
    selection = new SelectionModel<any>(true, []);
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;


    constructor(
        private formFilterValuesService: FormFilterValuesService,
        private router: Router,
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private pronoeiCatalogoDataService: PronoeiCatalogoDataService,
        private dataService: DataService,
        private codigoDreUgelService: CodigoDreUgelService
    ) {
        this._unsubscribeAll = new Subject();
        this.bandejaPrincipalSelectRows$ = this.formFilterValuesService.bandejaPrincipalSelectRows$;
        this.maestroPermiso$ = this.pronoeiCatalogoDataService?.maestroPermiso$;
    }

    ngAfterViewInit(): void {
        
    }
    
    ngOnInit(): void {
        
        this.cargarTodo();
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.pronoeiCatalogoDataService.complete();
        this.codigoDreUgelService.complete();
    }


    private async cargarTodo() {        
        this.buildForm();
        await this.getDreUgelData();
        await this.cargarCombos();
        this.handleBuscar();
    }

    private async getDreUgelData() {
        var entidadSede = await this.codigoDreUgelService.getCodigoDreUgelFromServiceInit();
        const codigos = this.codigoDreUgelService.getCodigoDreUgel();
        const entidadPassport = this.codigoDreUgelService.passportModel;

        const tipoSedeList = ['TS001', 'TS002', 'TS012'];
        if (entidadPassport.CODIGO_ROL == 'AYNI_019' &&
            (!entidadSede || !entidadSede?.codigoTipoSede || !tipoSedeList.includes(entidadSede.codigoTipoSede))) {
            this.router.navigate(['/ayni/personal/inicio']);
            return;
        }

        if (codigos) {

            this.form.controls['idDre'].setValue(codigos.idDre);
            this.form.controls['idUgel'].setValue(codigos.idUgel);
        }
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            anio: [this.minDate],
            accion: [null],
            idDre: [null],
            idUgel: [null],
            tipoDocumentoIdentidad: [-1],
            // numeroDocumentoIdentidad: [null, [Validators.minLength(8), Validators.maxLength(12)]],
            numeroDocumentoIdentidad: [null],
            // codigoModular: [null, [Validators.minLength(6), Validators.maxLength(7)]],
            codigoModular: [null],
            centroTrabajo: [null],
            idZona: [-1],
            fechaInicio: [null],
            fechaFin: [null],
            idEstado: [-1],
        });
        this.form.controls['numeroDocumentoIdentidad'].disable();
        // this.form.controls['fechaFin'].disable();
        this.form.controls['fechaInicio'].valueChanges
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
                this.form.controls['fechaFin'].setValue(null);
                // if (x) {
                //     this.form.controls['fechaFin'].enable();
                // }
            });
        this.form.controls['anio'].valueChanges
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {

                const currentYear = moment(x).year();

                this.minDate = new Date(currentYear, 0, 1);
                this.maxDate = new Date(currentYear, 11, 31);

                this.form.controls['fechaInicio'].setValue(null);
                this.form.controls['fechaFin'].setValue(null);
            });
    }

    buscarCentroTrabajoDialogo() {


        const currentSession = this.dataService.Storage().getInformacionUsuario();
        var dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
            panelClass: 'buscar-centro-trabajo-form-dialog',
            width: "1000px",
            disableClose: true,
            data: {
                action: "requerimiento",
                currentSession: currentSession
            },
        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                const codCentroTrabajo = response?.centroTrabajo?.codigoCentroTrabajo;
                this.form.controls['codigoModular'].setValue(codCentroTrabajo);
            });
    }


    busquedaPersonalizada = () => {
        const idTipoDocumentoIdentidad = this.form.controls["tipoDocumentoIdentidad"].value == -1 ? null : this.form.controls["tipoDocumentoIdentidad"].value;
        const numeroDocumentoIdentidad = this.form.controls["numeroDocumentoIdentidad"].value ?? null;

        var dialogPersonaRef = this.materialDialog.open(
            BuscarPersonaComponent,
            {
                panelClass: "buscar-persona-form-dialog",
                width: "980px",
                disableClose: true,
                data: {
                    action: "busqueda",
                    idTipoDocumentoIdentidad,
                    numeroDocumentoIdentidad
                },
            }
        );
        dialogPersonaRef.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp) => {
                if (resp != null) {
                    const servidorPublico = resp;
                    console.log(servidorPublico);
                    if (servidorPublico?.servidorPublico?.idTipoDocumentoIdentidad &&
                        servidorPublico?.servidorPublico?.numeroDocumentoIdentidad) {
                        this.form.controls["tipoDocumentoIdentidad"].setValue(servidorPublico.servidorPublico.idTipoDocumentoIdentidad);
                        this.form.controls["numeroDocumentoIdentidad"].setValue(servidorPublico.servidorPublico.numeroDocumentoIdentidad);
                        this.form.controls['numeroDocumentoIdentidad'].enable();
                    }
                }
            });
    };



    handleLimpiar() {
        this.form.patchValue({
            anio: this.now,
            tipoDocumentoIdentidad: -1,
            numeroDocumentoIdentidad: null,
            codigoModular: null,
            centroTrabajo: null,
            idZona: -1,
            fechaInicio: null,
            fechaFin: null,
            idEstado: -1,
        });

        this.form.controls["numeroDocumentoIdentidad"].disable();
        this.handleBuscar();
    }


    handleBuscar(searchByButton = false) {
        const anio = moment(this.form.controls["anio"].value).year();
        const _fechaInicio = this.form.controls['fechaInicio'].value ?? null;
        const _fechaFin = this.form.controls['fechaFin'].value ?? null;
        const fechaInicio = _fechaInicio ? moment(_fechaInicio).format('MM-DD-YYYY') : null;
        const fechaFin = _fechaFin ? moment(_fechaFin).format('MM-DD-YYYY') : null;

        const formValue = {
            ...this.form.value,
            fechaInicio,
            fechaFin,
        };
        delete formValue['anio'];
        const filtro = { searchByButton, anio, ...formValue };
        this.formFilterValuesService.setBandejaFiltroObservable(filtro);
    }

    handleNew() {
        this.router.navigate(['ayni/personal/acciones/pronoei/agregar'])
    }

    onKeyPressNumeroDocumento(e: any): boolean {
        const _tipoDocumento = this.form.controls['tipoDocumentoIdentidad'].value;
        if (_tipoDocumento == 1) {
            //------------ DNI
            const reg = /^\d+$/;
            const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
            if (!reg.test(pressedKey)) {
                e.preventDefault();
                return false;
            }
        } else if (_tipoDocumento != -1 && _tipoDocumento != null) {
            //------------ PASAPORTE O CARNET DE EXTRANJERIA
            var inp = String.fromCharCode(e.keyCode);

            if (/[a-zA-Z0-9]/.test(inp)) {
                return true;
            } else {
                e.preventDefault();
                return false;
            }
        }
    }

    onChangeTipoDocumento() {
        const idTipoDocumento = this.form.controls['tipoDocumentoIdentidad'].value;
        this.form.controls['numeroDocumentoIdentidad'].setValue(null);
        if (idTipoDocumento == -1) {
            this.form.controls['numeroDocumentoIdentidad'].disable();
            return;
        }
        this.form.controls['numeroDocumentoIdentidad'].enable();
    }

    async cargarCombos() {
        this.comboTipoDocumento$ = this.pronoeiCatalogoDataService.tipoDocumentoIdentidadInactivo$;
        this.comboEstadosPronoei$ = this.pronoeiCatalogoDataService.estadosPronoeiCatalogo$;
        this.comboTipoZona$ = this.pronoeiCatalogoDataService.zonaActivoCatalogo$;
        await this.pronoeiCatalogoDataService.dataCombosBandejaPrincipalInit();
    }



    async handleExportar() {

        this.dataService.Spinner().show("sp6");

        const anio = moment(this.form.controls["anio"].value).year();
        const formValue = { ...this.form.value };
        delete formValue['anio'];
        const filtro = { anio, ...formValue };
        let isSuccess = true;
        const response = await this.dataService.AccionesVinculacion().getGestionPronoeiExcel(filtro)
            .pipe(
                finalize(() => this.dataService.Spinner().hide("sp6")),
                catchError((err) => {
                    isSuccess = false;
                    const errorMessage = err.error.messages[0];
                    // this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
                    return of([]);
                })
            )
            .toPromise();

        if (isSuccess && response) {
            this.dataService.Spinner().hide("sp6");
            const fecha = moment().format('DDMMYYYY');
            descargarExcel(response, `PRONOEI ${fecha}.xlsx`);
        }

    }

    async enviarAccionesMasivo(arr: any[]) {

        var noRegistrados = arr.some(x => x.codigoEstadoPronoei !== TipoEstadoPronoeiEnum.REGISTRADO)
        if (arr.length == 0) {
            this.dataService.Message().msgWarning(`"${MESSAGE_GESTION.M91}"`, () => { });
            return;
        }
        else if (noRegistrados) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR SOLO REGISTROS CON EL ESTADO \'REGISTRADO\'"', () => { });
            return;
        }

        this.dataService.Message().msgConfirm(MESSAGE_GESTION.M90, async () => {

            const gestionPronoeiIdLista = arr.map((x) => ({ idGestionPronoei: x.idGestionPronoei }));
            const passport = this.codigoDreUgelService.passportModel;
            var accionesGrabadas = {
                // codigoTipoDocumentoIdentidad: '1',
                codigoTipoSede: passport.CODIGO_TIPO_SEDE,
                codigoSede: passport.CODIGO_SEDE,
                gestionPronoeiIdLista
            };
            this.dataService.Spinner().show("sp6");
            const _response = await this.dataService
                .AccionesVinculacion()
                .enviarAccionesGrabadasPronoeiMasivo(accionesGrabadas)
                .pipe(
                    catchError((ex) => {
                        this.dataService.Message().msgWarning('"' + ex?.error?.messages[0]?.toUpperCase() + '"');
                        return of(null);
                    }),
                    finalize(() => { this.dataService.Spinner().hide("sp6"); })
                )

                .toPromise();

            if (_response) {
                this.formFilterValuesService.setSelectedRowsSource([]);
                this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                    this.handleBuscar();
                });
            }


        }, () => { });



    }
}
