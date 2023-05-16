import {
    Component,
    OnInit,
    ViewEncapsulation,
    OnDestroy,
    AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of, Subject } from 'rxjs';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'app/core/shared/shared.service';
import { RotacionModel } from 'app/core/model/rotacion.model';
import { BusquedaPlazaComponent } from '../components/busqueda-plaza/busqueda-plaza.component';
import { BusquedaCentroTrabajoComponent } from '../components/busqueda-centro-trabajo/busqueda-centro-trabajo.component';
import { InformacionPlazaRotacionComponent } from '../components/informacion-plaza-rotacion/informacion-plaza-rotacion.component';
import { mineduAnimations } from '@minedu/animations/animations';
import { MENSAJES, TablaRolPassport } from '../_utils/constants';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { descargarExcel, s2ab } from 'app/core/utility/functions';
import { MaestroPermisoPlazaModel } from '../models/rotacion.model';
import { isArray } from 'lodash';
import { BusquedaCentrosTrabajoComponent } from '../components/busqueda-centros-trabajo/busqueda-centros-trabajo.component';
import {EstadoValidacionPlaza} from '../_utils/constants';
import { ModalDocumentosPublicadosComponent } from './modal-documentos-publicados/modal-documentos-publicados.component';

@Component({
    selector: 'minedu-bandeja-rotacion-plazas',
    templateUrl: './bandeja-plaza.component.html',
    styleUrls: ['./bandeja-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaRotacionPlazaComponent implements OnInit, OnDestroy, AfterViewInit {

    form: FormGroup;
    proceso: RotacionModel;
    plazaRotacion: any = null;
    listResultadoFinal: any[] = [];
    resultadoFinalVisible: boolean = false;
    esRolMonitor: boolean = false;
    btnBuscar: Subject<void> = new Subject<void>();
    resumenPlazasRotacion: any[] = [];
    dialogRef: any;
    working = false;
    esPublicar: boolean = false;
    estadoValidacionPlaza= EstadoValidacionPlaza;
    permisoPlazaModel: MaestroPermisoPlazaModel;
    codigoCentroTrabajo: string;
    

    request = {
        codigoPlaza: null,
        codigoModular: null,
    };

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
        setTimeout((_) => this.buildShared());
        this.activeRoute.data.subscribe((data) => {   
            if (data) {               
                this.proceso = data.ProcesoEtapa;
            }
        });
        this.codigoCentroTrabajo = this.proceso.codigoCentroTrabajo;
        this.sharedService.onWorking
            .pipe(
                
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(working => this.working = working);
           
        this.sharedService.onDataSharedRotacion
            .pipe(
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(rotacion => {
                this.plazaRotacion = rotacion
                this.getPlazaRotacionResumen();
                
            });

        this.esRolMonitor = this.dataService.Storage().getPassportRolSelected().CODIGO_ROL === TablaRolPassport.MONITOR;
        this.buildForm();
        this.resetForm();
        this.loadCombo();        
        this.getMaestroPermisoPlaza();        
    }


    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            idEstadoResultadoFinal: [null],
            codigoModular: [null],
            anexoCentroTrabajo: [null],
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
    onTabChanged($event) {
        const index = $event.index;
        if (index === 3) {
            this.resultadoFinalVisible = true;
        } else {
            this.resultadoFinalVisible = false;
        }
    }

    handleListadoPlazasPrepublicadas = () => {
        const request = {
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value,
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .pdfPlazaRotacionPrePublicadas(request)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.handlePreview(response, "PLAZAS PRE-PUBLICADAS.pdf");
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"',
                            () => {
                            }
                        );
                }
            });
    };

    handleVerListadoPlazasPublicas = () => {

        this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent, {
            panelClass: 'minedu-modal-documentos-publicados',
            disableClose: true,
            data: {                
                dialogTitle:"Listado de plazas",
                idDesarrolloProceso: this.proceso.idDesarrolloProceso
            }
        });
    }

    handleListadoPlazas = () => {
        const request = {
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value,
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .pdfPlazaRotacionPublicadas(request)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.handlePreview(response, "PLAZAS PUBLICADAS.pdf");
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"',
                            () => {
                            }
                        );
                }
            });
    };

    private handlePreview(document: any, nombreAdjuntoSustento: string) {
        let file = new Blob([s2ab(atob(document))], { type: 'application/pdf' });
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Reporte de plazas',
                    file: file,
                    fileName: nombreAdjuntoSustento
                }
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                descargarExcel(document, "PLAZAS PUBLICADAS.pdf");
            });
    }

    handlePublicarPlazas = () => {
        const data = {
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idPlazaRotacion: this.plazaRotacion.idPlazaRotacion,
            centroTrabajo: this.codigoCentroTrabajo,
            idEtapaProceso: this.proceso.idEtapaProceso               
        };
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA PUBLICAR LAS PLAZAS? </b><br/>  Al publicar las plazas, se generara el listado de las plazas en formato .PDF", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Rotacion()
                .publicarPlazasRotacion(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { 
                            this.handleBuscar();
                        });
                    } else {
                        this.dataService.Message().msgWarning('"ERROR AL PUBLICAR LAS PLAZAS, VERIFIQUE QUE NO EXISTA REGISTROS EN LA PESTAÑA "PLAZAS PREPUBLICADAS"" ', () => { });
                    }
                });
        }, () => { });
    };


    handleAperturarPublicacion = () => {
        const data = {
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idPlazaRotacion: this.plazaRotacion.idPlazaRotacion,
        };
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA APERTURAR LA PUBLICACION DE LAS PLAZAS? </b>", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Rotacion()
                .aperturarPublicacionPlazasRotacion(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {                    
                    if (response) {
                        if(response > 0) {
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { 
                                this.handleBuscar();
                            });
                        } else if (!response.ok) {
                            this.dataService.Message().msgWarning(response.error.messages[0], () => { });
                        }
                    } else {
                        this.dataService.Message().msgWarning('"ERROR AL APERTURAR PUBLICACIÓN, VERIFIQUE QUE NO EXISTA REGISTROS EN LA PESTAÑA "PLAZAS ROTACIÓN"" ', () => { });
                    }
                });
        }, () => { });
    };


    loadCombo = () => {
        this.dataService
            .Rotacion()
            .getComboResultadosFinales()
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                })
            ).subscribe((response) => {
                if (response) {
                    response.splice(0, 0, {
                        idCatalogoItem: 0,
                        codigoCatalogoItem: 0,
                        abreviaturaCatalogoItem: 'TODOS',
                        descripcionCatalogoItem: 'TODOS',
                    });
                    this.listResultadoFinal = response.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                }
            });
    };
    /*
    *-------------------------------------------------------------------------------------------------------------
    * OPERACIONES ADICIONALES
    *-------------------------------------------------------------------------------------------------------------     
    */

    handleRetornar = () => {
        this.router.navigate(['../../../'], { relativeTo: this.activeRoute });
    };

    handleLimpiar(): void {
        this.resetForm();
    }


    handleBuscar(): void {
        this.dataService.Spinner().show('sp6');
        this.working = true;
        this.btnBuscar.next();
        this.getPlazaRotacionResumen();
    }

    busquedaPlazas = () => {

    };

    busquedaPlazasDialog = ($event) => {
        this.dialogRef = this.materialDialog.open(
            BusquedaPlazaComponent,
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

    buscarCentroTrabajoDialog(event) {
        const codigoCentroTrabajo = this.form.get('codigoModular').value;
        if (codigoCentroTrabajo) {
            this.busquedaCentroTrabajo(event);
            return;
        }
        this.handleCentroTrabajoDialog([]);
    }

    busquedaCentroTrabajo(event) {
        event.preventDefault();
        const codigoCentroTrabajo = this.form.get('codigoModular').value;

        if (!codigoCentroTrabajo) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR UN CÓDIGO MODULAR PARA REALIZAR LA BÚSQUEDA."', () => {
            });
            return;
        }
        if (codigoCentroTrabajo.length < 6 || codigoCentroTrabajo.length > 7) {
            this.dataService.Message().msgWarning('"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON (6 a 7) DÍGITOS."', () => {
            });
            return;
        }

        const data = {
            codigoCentroTrabajo: codigoCentroTrabajo.trim(),
            codigoNivelInstancia: parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia)
        };

        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().getListCentroTrabajo(data, 1, 10).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe((response: any) => {
            if (response) {
                const data: any[] = response;
                if (data.length === 1) {
                    this.setCentroTrabajo(data[0]);
                    ;
                } else if (data.length > 1) {
                    this.handleCentroTrabajoDialog(data);
                    this.dataService.Message().msgAutoInfo('"SE ENCONTRÓ MÁS DE UN REGISTRO PARA EL CÓDIGO MODULAR INGRESADO, SELECCIONE UN REGISTRO"', 3000, () => {
                    });
                } else {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS"', () => {
                    });
                }
            } else {
                this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL BUSCAR EL CENTRO DE TRABAJO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => {
                });
            }
        });
    }

    private handleCentroTrabajoDialog(registros: any[]) {
        this.dialogRef = this.materialDialog.open(
            BusquedaCentroTrabajoComponent,
            {
                panelClass: 'buscar-centro-trabajo-form',
                width: '1300px',
                disableClose: true,
                data: {
                    registrado: false,
                    centrosTrabajo: registros,
                    permiteBuscar: registros.length === 0
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response) => {
            if (!response) {
                return;
            }
            this.setCentroTrabajo(response);
        });
    }

    private setCentroTrabajo = (data) => {
        this.form.patchValue({ codigoModular: data.codigoCentroTrabajo, anexoCentroTrabajo: data.anexoCentroTrabajo });
    };

    verInformacionPlaza = (row) => {
        this.dialogRef = this.materialDialog.open(
            InformacionPlazaRotacionComponent,
            {
                panelClass: 'minedu-ver-informacion-plaza-rotacion-dialog',
                width: '980px',
                disableClose: true,
                data: {
                    action: 'busqueda',
                    dataKey: row,
                },
            }
        );
    };


    resetForm = () => {
        this.form.reset();
    };

    getPlazaRotacionResumen = () => {
        if (this.plazaRotacion == null) return;
        this.dataService
            .Rotacion()
            .getPlazaRotacionResumen(this.plazaRotacion.idPlazaRotacion, this.codigoCentroTrabajo)      
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {               
                if (response) {
                    this.resumenPlazasRotacion = response;
                    const plazasRotacion = this.resumenPlazasRotacion.find(x => x.codigoSituacionValidacion == 1)
                    const plazasResumen = this.resumenPlazasRotacion.find(x => x.codigoSituacionValidacion == 2)

                    let plazasPrepublicadas = 0;
                    let resultadoFinal = 0
                    if (plazasRotacion != null) plazasPrepublicadas = plazasRotacion.cantidadPlazas;  
                    if (plazasResumen != null) resultadoFinal = plazasResumen.cantidadPlazas;   
                    this.esPublicar = false;
                    if (plazasPrepublicadas == 0 && resultadoFinal >= 1) {
                        
                        this.esPublicar = true;
                    }
                }
               
            });
    }

    getMaestroPermisoPlaza = () => {
        const codigoRol = this.dataService.Storage().getPassportRolSelected().CODIGO_ROL;
        const data = {
            codigoRolPassport: codigoRol,
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idTipoSede: 1 // TODO: reemplazar
        };
        this.dataService
            .Rotacion()
            .getMaestroPermisoPlaza(data)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                this.permisoPlazaModel = response;
            });        
    }

    private configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf('"HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD"')!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}




