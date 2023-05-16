import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { RotacionModel } from 'app/core/model/rotacion.model';
import { SharedService } from 'app/core/shared/shared.service';
import { isArray } from 'lodash';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { BusquedaDocumentoIdentidadComponent } from '../components/busqueda-documento-identidad/busqueda-documento-identidad.component';
import { MaestroPermisoCalificacionModel } from '../models/rotacion.model';
import { TablaEstadosDesarrolloProceso, TablaTipoDocumentoIdentidad } from '../_utils/constants';

@Component({
    selector: 'minedu-bandeja-calificacion',
    templateUrl: './bandeja-calificacion.component.html',
    styleUrls: ['./bandeja-calificacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BandejaCalificacionComponent implements OnInit, OnDestroy, AfterViewInit {

    form: FormGroup;
    proceso: RotacionModel;
    estadoIniciado: boolean = false;
    permisoCalificacion: MaestroPermisoCalificacionModel;

    dialogRef: any;
    working = false;
    maximo: number = 8;

    combo = {
        tiposDocumentoIdentidad: [],
        tiposRotacion: [],
        estadosCalificacion: [],
    };

    request = {
        idEtapaProceso: null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        idTipoRotacion: null,
        idEstadoCalificacion: null,
    };

    /*
      *-------------------------------------------------------------------------------------------------------------
      * VARIABLES GRID POSTULANTES
      *-------------------------------------------------------------------------------------------------------------
      */

    btnBuscar: Subject<void> = new Subject<void>();
    private _unsubscribeAll: Subject<any>;
    constructor(
        private activeRoute: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        setTimeout((_) => { this.buildShared(); this.getCombos(); });
        this.activeRoute.data.subscribe((data) => {
            if (data) {
                this.proceso = data.ProcesoEtapa;
                this.estadoIniciado = TablaEstadosDesarrolloProceso.INICIADO === this.proceso.codigoEstadoProceso;
            }
        });
        this.sharedService.onWorking
            .pipe(
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(working => this.working = working);

        this.buildForm();
        this.getMaestroPermisoCalificacion();
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            idTipoRotacion: [null],
            idEstadoCalificacion: [null],
        });

        this.form.get("idTipoDocumentoIdentidad").valueChanges.subscribe((value) => {
            if (value) {
                this.validarTipoDocumentoIdentidad(value);
            }
        });
    };

    buildShared() {
        this.sharedService.setSharedBreadcrumb('Procesos de rotación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de rotación');
    }


    /*
     *-------------------------------------------------------------------------------------------------------------
     * OPERACIONES GLOBALES
     *-------------------------------------------------------------------------------------------------------------
     */


    private validarTipoDocumentoIdentidad = (value: number) => {
        this.maximo = 8;
        const tipoDocumentoIdentidad = this.combo.tiposDocumentoIdentidad.find(pred => pred.idCatalogoItem === value);
        let validatorNumeroDocumento = null;
        switch (tipoDocumentoIdentidad?.codigoCatalogoItem) {
            case TablaTipoDocumentoIdentidad.DNI:
                this.maximo = 8;
                validatorNumeroDocumento = Validators.compose([
                    Validators.minLength(this.maximo),
                    Validators.maxLength(this.maximo),
                    Validators.pattern("^[0-9]*$"),
                ]);
                break;
            case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
                this.maximo = 12;
                validatorNumeroDocumento = Validators.compose([
                    Validators.minLength(this.maximo),
                    Validators.maxLength(this.maximo),
                    Validators.pattern("^[a-zA-Z0-9]*$"),
                ]);
                break;
            case TablaTipoDocumentoIdentidad.PASAPORTE:
                this.maximo = 12;
                validatorNumeroDocumento = Validators.compose([
                    Validators.minLength(this.maximo),
                    Validators.maxLength(this.maximo),
                    Validators.pattern("^[a-zA-Z0-9]*$"),
                ]);
                break;
            default:
                this.maximo = 8;
                break;
        }

        const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad");

        numeroDocumentoIdentidad.setValidators(validatorNumeroDocumento);
        numeroDocumentoIdentidad.updateValueAndValidity();
        this.form.patchValue({ numeroDocumentoIdentidad: null });
    }

    onKeyOnlyNumbers(e) {
        const idTipoDocumentoIdentidad = this.form.get("idTipoDocumentoIdentidad").value;
        let permiteIngreso = true;
        const tipoDocumentoIdentidad = this.combo.tiposDocumentoIdentidad.find(pred => pred.idCatalogoItem === idTipoDocumentoIdentidad);

        switch (tipoDocumentoIdentidad?.codigoCatalogoItem) {
            case TablaTipoDocumentoIdentidad.DNI:
                if (e.keyCode == 13 || (e.keyCode >= 48 && e.keyCode <= 57)) {
                    permiteIngreso = true;
                } else {
                    permiteIngreso = false;
                }
                break;
            case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
                permiteIngreso = true;
                break;
            case TablaTipoDocumentoIdentidad.PASAPORTE:
                permiteIngreso = true;
                break;
            default:
                permiteIngreso = false;
                break;
        }
        return permiteIngreso;
    }

    private getDataGridCalificaciones = () => {
        this.dataService.Spinner().show('sp6');
        this.working = true;
        this.btnBuscar.next();
    };


    busquedaDocumentoIdentidadDialog = ($event) => {
        const form = this.form.value;
        const idTipoDocumentoIdentidad = form.idTipoDocumentoIdentidad;
        const numeroDocumentoIdentidad = form.numeroDocumentoIdentidad;

        this.dialogRef = this.materialDialog.open(BusquedaDocumentoIdentidadComponent,
            {
                panelClass: 'buscar-documento-identidad',
                disableClose: true,
                data: {
                    idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
                    numeroDocumentoIdentidad: numeroDocumentoIdentidad,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.form.patchValue({ numeroDocumentoIdentidad: resp.numeroDocumentoIdentidad });
        });
    };


    private getCombos = () => {
        forkJoin(
            [
                this.dataService.Rotacion().getTiposDocumentoIdentidad(),
                this.dataService.Rotacion().getTiposRotacion(),
                this.dataService.Rotacion().getEstadosCalificacion()
            ]
        ).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            if (response && response.length === 0) {
                return;
            }
            const tiposDocumentoIdentidad = response[0];
            if (tiposDocumentoIdentidad) {
                tiposDocumentoIdentidad.splice(0, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.combo.tiposDocumentoIdentidad = tiposDocumentoIdentidad;
                this.form.controls['idTipoDocumentoIdentidad'].setValue(this.combo.tiposDocumentoIdentidad[1].idCatalogoItem);
            }

            const tiposRegistro = response[1];
            if (tiposRegistro) {
                tiposRegistro.splice(0, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.combo.tiposRotacion = tiposRegistro;
            }

            const estadosPostulacion = response[2];
            if (estadosPostulacion) {
                estadosPostulacion.splice(0, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.combo.estadosCalificacion = estadosPostulacion;
            }
        });
    }

    onTabChanged = (index) => {

    }

    /*
    *-------------------------------------------------------------------------------------------------------------
    * OPERACIONES ADICIONALES
    *-------------------------------------------------------------------------------------------------------------
    */

    handleRetornar = () => {
        this.router.navigate(['../../../'], { relativeTo: this.activeRoute });
    };

    handleLimpiar = (): void => this.resetForm();


    handleBuscar = (): void => {
        this.getDataGridCalificaciones();
    }

    resetForm = () => {
        this.form.reset();
    };

    private setRequest = () => {
        this.request = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value == 0 ? null : this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            idTipoRotacion: this.form.get('idTipoRotacion').value == 0 ? null : this.form.get('idTipoRotacion').value,
            idEstadoCalificacion: this.form.get('idEstadoCalificacion').value == 0 ? null : this.form.get('idEstadoCalificacion').value,
        };
    };

    getMaestroPermisoCalificacion = () => {
        const getRol = this.dataService.Storage().getPassportRolSelected();
        const data = {
            codigoRolPassport: getRol.CODIGO_ROL,
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            codigoTipoSede: getRol.CODIGO_TIPO_SEDE
        };
        this.dataService
            .Rotacion()
            .getMaestroPermisoCalificacion(data)
            .pipe(
               catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                this.permisoCalificacion = response;
            });
    }
    private configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}
