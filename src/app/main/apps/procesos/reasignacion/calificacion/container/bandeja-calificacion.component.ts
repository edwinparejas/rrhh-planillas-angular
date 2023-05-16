import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ResultadoOperacionEnum } from 'app/core/model/types';
import { ReasignacionesModel } from "../../models/reasignaciones.model";
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { isArray } from 'lodash';
import { catchError, finalize } from 'rxjs/operators';
import { MENSAJES, TablaTipoDocumentoIdentidad } from '../../_utils/constants';
import { EtapaResponseModel, OpcionFiltro, MaestroPermisoCalificacionModel } from '../../models/reasignacion.model';
import { EstadoValidacionPlazaEnum, EtapaFaseEnum, RegimenLaboralEnum, TipoFormatoPlazaEnum, CodigoCentroTrabajoMaestroEnum } from '../../_utils/constants';
import { CalificacionFinalComponent } from '../components/calificacion-otras/calificacion-otras.component';
import { BuscarServidorPublicoComponent} from '../../components/buscar-servidor-publico/buscar-servidor-publico.component';
import { BuscarPlazaComponent} from '../../components/buscar-plaza/buscar-plaza.component';


@Component({
    selector: 'minedu-bandeja-calificacion',
    templateUrl: './bandeja-calificacion.component.html',
    styleUrls: ['./bandeja-calificacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaCalificacionComponent implements OnInit {
    proceso: ReasignacionesModel; 
    codSedeCabecera:string; 
    descripcionEstadoValidacionPLaza: any;
    codigoEstadoValidacionPLaza: any;
    btnBuscar: Subject<void> = new Subject<void>();
    working = false;
    etapaFase = EtapaFaseEnum;
    disableBrake = false;
    selection = new SelectionModel<any>(true, []);
    etapaResponse: EtapaResponseModel;
    regimenLaboral = RegimenLaboralEnum;
    currentSession: SecurityModel = new SecurityModel();
    idEtapaProceso: number;
    idAlcanceProceso: number;
    form: FormGroup;
    permisoCalificacion: MaestroPermisoCalificacionModel;
    comboLists = {
        listTipoDocumento: [],
        listCausal: [],
        listEtapaPostulante: [],
        listEstadoCalificacion: [],
    };
    selectedTabIndex = 0;
    desactivarDocumentoIdentidad:boolean = true;
    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    dialogRef: any;
    idServidorPublicoSelected: number;
    @ViewChild(CalificacionFinalComponent) private calificacionFinalComponent: CalificacionFinalComponent;
    request = {
        idEtapaProceso: null,
        numeroDocumentoIdentidad: null,
        idTipoDocumentoIdentidad: null,
        codigoPlaza: null,
        idCausal: null,
        idEtapaPostulacion: null,
        idEstadoCalificacion: null,
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog,

    ) { }

    ngOnInit(): void {
        setTimeout(_ => this.buildShared());
        this.idEtapaProceso = parseInt(this.route.snapshot.params.paramIdEtapaProceso);
        this.idAlcanceProceso = parseInt(this.route.snapshot.params.paramIdAlcanceProceso);
        this.obtenerCabeceraProcesoEtapa();
        this.buildForm();
        this.buildSeguridad();
        this.loadTipodocumento();
        this.loadCausal();
        this.loadEtapaPostulante();
        this.loadEstadosCalificacion();
        this.handleLimpiar();
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            numeroDocumentoIdentidad: [null],
            idTipoDocumentoIdentidad: [null],
            codigoPlaza: [null],
            numeroExpediente: [null],
            idCausal: [null],
            idEtapaPostulacion: [null],
            idEstadoCalificacion: [null],
        });
    }

    onTabChanged= (event) => {
        this.selectedTabIndex = event.index;
    }

    setRequest = () => {
        this.request = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
            codigoPlaza: this.form.get('codigoPlaza').value,
            idCausal: this.form.get('idCausal').value,
            idEtapaPostulacion:  this.form.get('idEtapaPostulacion').value,
            idEstadoCalificacion: this.form.get('idEstadoCalificacion').value,
        };
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Reasignación / Calificaciones");
        this.sharedService.setSharedTitle("Desarrollo de Reasignación");
    }

    handleSelectTab = (e) => {
        this.selectedTabIndex = e.index;
        this.handleBuscar();
    }

    getMaestroPermisoCalificacion = () => {
        const codigoRol = this.dataService.Storage().getPassportRolSelected().CODIGO_ROL;
        const data = {
            codigoRolPassport: codigoRol,
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idTipoSede: this.dataService.Storage().getPassportRolSelected().ID_TIPO_SEDE 
        };
        this.dataService
            .Reasignaciones()
            .getMaestroPermisoCalificacion(data)
            .pipe(
               catchError((e) => { return  this.configCatch(e); }),
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
                if((e.messages[0]).indexOf(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD)!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError(MENSAJES.MENSAJE_ERROR_SERVIDOR, () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }

    obtenerCabeceraProcesoEtapa = () => {
        this.dataService
            .Reasignaciones()
            .getDatosProcesoEtapaById(this.idEtapaProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                this.proceso = response;    
                this.obtenerEstadoDesarrolloEtapa();
                this.obtenerEstadovalidacionPlaza();          
            });
    };

    obtenerEstadoDesarrolloEtapa = () => {
        this.dataService
            .Reasignaciones()
            .obtenerEstadoDesarrolloEtapaProceso(this.idEtapaProceso, this.idAlcanceProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.proceso.estadoProceso = response.estadoDesarrollo;
                    this.proceso.idDesarrolloProceso = response.idDesarrolloProceso;
                    this.getMaestroPermisoCalificacion();  
                }
            });
    };
    
    obtenerEstadovalidacionPlaza(): void {
        const data = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso
        };
        this.dataService.Reasignaciones()
          .getValidarPlaza(data)
          .pipe(
            catchError(() => of([])),
            finalize(() => {
            })
          )
          .subscribe((response: any) => {
            if (response) {
              if ((response || []).length === 0) {
                this.proceso.estadoValidacionPlaza =  'PENDIENTE';
                this.proceso.codigoEstadoValidacionPlaza = EstadoValidacionPlazaEnum.PENDIENTE;
              } else {
                 let responseEstadoValidacionPlaza = response[0];
                 this.proceso.estadoValidacionPlaza =  responseEstadoValidacionPlaza.descripcionEstadoValidacionPlaza;
                 this.proceso.codigoEstadoValidacionPlaza = responseEstadoValidacionPlaza.codigoEstadoValidacionPlaza;
              }
            }
          });
    }
    
    loadTipodocumento = () => {
        this.dataService.Reasignaciones()
            .getComboTipodocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.id,
                        label: `${x.descripcion}`,
                    }));
                    this.comboLists.listTipoDocumento = data;
                    this.comboLists.listTipoDocumento.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }

    lengthDocumento(event): void {
        const idTipoDocumentoIdentidad = this.form.get("idTipoDocumentoIdentidad").value;
        const tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(pred => pred.value === idTipoDocumentoIdentidad);
    
        switch (tipoDocumentoIdentidad?.codigo) {
    
        case TablaTipoDocumentoIdentidad.DNI:
            this.form.get('numeroDocumentoIdentidad').setValue("");
            document.getElementById('numeroDocumentoIdentidad').setAttribute("maxlength", "8");
            this.form.controls['numeroDocumentoIdentidad'].enable();
            this.desactivarDocumentoIdentidad = false;
            break;
    
        case TablaTipoDocumentoIdentidad.PASAPORTE:
            this.form.get('numeroDocumentoIdentidad').setValue("");
            document.getElementById('numeroDocumentoIdentidad').setAttribute("maxlength", "12");
            this.form.controls['numeroDocumentoIdentidad'].enable();
            this.desactivarDocumentoIdentidad = false;
            break;
    
        case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
            this.form.get('numeroDocumentoIdentidad').setValue("");
            document.getElementById('numeroDocumentoIdentidad').setAttribute("maxlength", "15");
            this.form.controls['numeroDocumentoIdentidad'].enable();
            this.desactivarDocumentoIdentidad = false;
            break;
          default:
            this.form.get('numeroDocumentoIdentidad').setValue("");
            // document.getElementById('numeroDocumentoIdentidad').setAttribute("maxlength", "8");
            this.form.controls['numeroDocumentoIdentidad'].disable();
            this.desactivarDocumentoIdentidad = true;
            break;
        }
    }
    
    onKeyOnlyNumbers(e) {
    const idTipoDocumentoIdentidad = this.form.get("idTipoDocumentoIdentidad").value;
    let permiteIngreso = true;
    const tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(pred => pred.value === idTipoDocumentoIdentidad);

        switch (tipoDocumentoIdentidad?.codigo) {
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

    loadCausal = () => {
        this.dataService.Reasignaciones()
            .getComboCausal()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.id,
                        label: `${x.descripcion}`,
                    }));
                    this.comboLists.listCausal = data;
                    this.comboLists.listCausal.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }

    loadEtapaPostulante = () => {
        this.dataService.Reasignaciones()
          .getComboEtapaPostulante()
          .pipe(
            catchError(() => of([])),
            finalize(() => { })
          )
          .subscribe((response: any) => {
            if (response) {
              const data = response.map((x) => ({
                ...x,
                value: x.id,
                label: `${x.descripcion}`,
              }));
              this.comboLists.listEtapaPostulante = data;
              this.comboLists.listEtapaPostulante.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
            }
          });
    }

    loadEstadosCalificacion = () => {
        this.dataService.Reasignaciones()
            .getComboEstadosCalificacion()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listEstadoCalificacion = data;
                    this.comboLists.listEstadoCalificacion.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }
    //#endregion

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    handleRetornar = () => {
        this.router.navigate(['../../../'], { relativeTo: this.route });
    }

    handleLimpiar = () => {
        this.form.reset();
        this.form.get('idTipoDocumentoIdentidad').setValue(null);
        this.form.get('idCausal').setValue(null);
        this.form.get('idEtapaPostulacion').setValue(null);
        this.form.get('idEstadoCalificacion').setValue(null);
        this.form.controls['numeroDocumentoIdentidad'].disable();
        this.desactivarDocumentoIdentidad = true;
    }
    
    handleRefrescar = (event) => {
        this.setRequest();
        this.dataService.Spinner().show("sp6");
        this.working = true;
        this.btnBuscar.next();
    }

    handleBuscar = () => {
        this.setRequest();
        this.dataService.Spinner().show("sp6");
        this.working = true;
        this.btnBuscar.next();
        // switch (this.selectedTabIndex) {
        //     case 0:
        //         this.calificacionFinalComponent.actualizarLista(this.request);
        //         break;

        //     case 1:
        //         this.calificacionFinalComponent.actualizarLista(this.request);
        //         break;

        //     default:
        //         break;
        // }
    }


    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(
            BuscarPlazaComponent,
            {
                panelClass: 'buscar-plaza-dialog',
                width: '980px',
                disableClose: true,
                data: {
                    action: 'busqueda',
                    tipoFormato: TipoFormatoPlazaEnum.GENERAL
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const plaza = resp.plazaSelected;
                this.form
                    .get('codigoPlaza')
                    .setValue(plaza.codigoPlaza.trim());

            }

        });
    }

    busquedaPlazaDialog = ($event) => {
        this.dialogRef = this.materialDialog.open(BuscarPlazaComponent,
            {
                panelClass: 'buscar-plaza-form',
                disableClose: true,
                data: {
                    action: 'busqueda',
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                this.form.get('codigoPlaza').setValue(resp.codigoPlaza);
            }
        });
    };

    busquedaServidorPublicoDialog = () =>{
        const form = this.form.value;
        if(form.idTipoDocumentoIdentidad != null){
            const tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(pred => pred.id === form.idTipoDocumentoIdentidad);
            const idTipoDocumentoIdentidad = tipoDocumentoIdentidad.codigo;
            const numeroDocumentoIdentidad = form.numeroDocumentoIdentidad;
        
            this.dialogRef = this.materialDialog.open(BuscarServidorPublicoComponent,
                {
                    panelClass: 'buscar-servidor-publico',
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
                this.form.patchValue({ idTipoDocumentoIdentidad: resp.idTipoDocumentoIdentidad });
                this.form.patchValue({ numeroDocumentoIdentidad: resp.numeroDocumentoIdentidad });
            });
        }
    }

    handleCafilicarAutomatica = () => {
        const request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            usuarioRegistro: this.currentSession.numeroDocumento
        };

        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Message().msgConfirm('¿Está seguro de que desea calificar automáticamente?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Reasignaciones().calificarAutomatica(request).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                })
            ).subscribe(response => {
                if (response && response.result) {
                    this.dataService.Message().msgInfo(resultMessage, () => { });
                    this.handleBuscar();
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al calcular automáticamente.', () => { });
                }
            });
        }, (error) => { });
    }

    handlePublicarCalificacion = () => {
        const request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            usuarioRegistro: this.currentSession.numeroDocumento
        };

        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Message().msgConfirm('¿Está seguro de que desea publicar la lista?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Reasignaciones().publicarCalificacion(request).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                })
            ).subscribe(response => {
                if (response && response.result) {
                    this.dataService.Message().msgInfo(resultMessage, () => { });
                    this.handleBuscar();
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al publicar calificaciones.', () => { });
                }
            });
        }, (error) => { });
    }

}