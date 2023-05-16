import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { PassportTipoSede } from 'app/core/model/types';
import { GlobalsService } from 'app/core/shared/globals.service';
import { isArray } from 'lodash';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
    TablaAccionesPassport, TablaMetodosRotacion,
    TablaRotacionNivelInstancia,
    TablaTipoCentroTrabajo,
} from '../../_utils/constants';

@Component({
    selector: 'minedu-busqueda-centro-trabajo',
    templateUrl: './busqueda-centro-trabajo.component.html',
    styleUrls: ['./busqueda-centro-trabajo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BusquedaCentroTrabajoComponent implements OnInit, OnDestroy, AfterViewInit {

    form: FormGroup;
    working = false;
    private centrosTrabajo: any[] = [];
    permiteBuscar: boolean = true;
    dialogRef: any;

    combo = {
        instancias: [],
        subinstancias: [],
        tiposCentroTrabajo: [],
        modalidades: [],
        nivelesEducativos: []
    };

    filtro = {
        codigoNivelInstancia: null,
        idOtraInstancia: null,
        idInstancia: null,
        idSubinstancia: null,
        idTipoCentroTrabajo: null,
        institucionEducativa: null,

        idModalidadEducativa: null,
        idNivelEducativo: null,
        codigoModularAmbito: null,
    };

    mostrarInstancia: boolean = false;
    mostrarSubinstancia: boolean = false;
    mostrarTipoCentroTrabajo: boolean = false;
    mostrarModalidadNivelEducativo: boolean = false;
    mostrarInstitucionEducativa: boolean = false;

    tieneEstructuraOrganica = null;

    displayedColumns: string[] = [
        'index',
        'codigoCentroTrabajo',
        'anexoCentroTrabajo',
        'centroTrabajo',
        'instancia',
        'subinstancia',
        'tipoCentroTrabajo',
        'modalidadEducativa',
        'nivelEducativo'];

    dataSource: CentroTrabajoDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild('paginatorCentroTrabajo', { static: true }) paginator: MatPaginator;

    constructor(
        public matDialogRef: MatDialogRef<BusquedaCentroTrabajoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService,
    ) {
        this.permiteBuscar = this.data.permiteBuscar;
        this.centrosTrabajo = this.data.centrosTrabajo;
    }

    ngOnInit(): void {
        this.buildForm();
        console.log('data',this.data)
        const rol =  this.dataService.Storage().getPassportRolSelected();
        console.log('ROL', rol)
        this.dataSource = new CentroTrabajoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        setTimeout(() => {
            this.buildData();
        }, 0);
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idNivelInstancia: [null],
            idInstancia: [null],
            idSubinstancia: [null],
            idTipoCentroTrabajo: [null],
            institucionEducativa: [null],
            idModalidadEducativa: [null],
            idNivelEducativo: [null]
        });

        this.form.get('idInstancia').valueChanges.subscribe(value => {
            this.form.patchValue({ idSubinstancia: '-1', idTipoCentroTrabajo: '-1' });
            this.mostrarSubinstancia = false;
            console.log('idInstancia', value);
            if (value && value !== '-1') {
                const instancia = this.combo.instancias.find(pred => pred.id === value);
                const codigoNivelInstancia = instancia?.idNivelSede;
                console.log('codigoNivelInstancia', codigoNivelInstancia);
                switch (codigoNivelInstancia) {
                    case TablaRotacionNivelInstancia.MINEDU: {
                        if (value) {
                            this.mostrarOpciones(true, false, true, false, false);
                            // this.loadTipoCentroTrabajo(codigoNivelInstancia);
                        }
                        break;
                    }
                    case TablaRotacionNivelInstancia.DRE: {
                        if (value) {
                            this.mostrarOpciones(false, true, false, false, false);
                            this.loadSubinstancia(instancia.idInstancia);
                            this.mostrarInstanciaSeleccionada(codigoNivelInstancia);
                        }
                        break;
                    }
                }
            }
        });


        this.form.get('idSubinstancia').valueChanges.subscribe(value => {
            this.form.patchValue({ idTipoCentroTrabajo: '-1' });
            this.mostrarTipoCentroTrabajo = false;
            this.mostrarModalidadNivelEducativo = false;
            this.mostrarInstitucionEducativa = false;

            if (value && value !== '-1') {
                this.combo.tiposCentroTrabajo = [];
                const subInstancia = this.combo.subinstancias.find(pred => pred.id === value);
                const codigoNivelInstancia = subInstancia.idNivelSede;

                switch (codigoNivelInstancia) {
                    case TablaRotacionNivelInstancia.DRE: {
                        if (value) {
                            this.mostrarTipoCentroTrabajo = true;
                            this.loadTipoCentroTrabajo(codigoNivelInstancia);
                        }
                        break;
                    }
                    case TablaRotacionNivelInstancia.UGEL: {
                        if (value) {
                            this.mostrarTipoCentroTrabajo = true;
                            this.loadTipoCentroTrabajo(codigoNivelInstancia);
                        }
                        break;
                    }
                }
            }
        });

        this.form.get('idTipoCentroTrabajo').valueChanges.subscribe(value => {
            this.form.patchValue({ idModalidadEducativa: '-1', idNivelEducativo: '-1', institucionEducativa: '' });
            this.mostrarModalidadNivelEducativo = false;
            this.mostrarInstitucionEducativa = false;

            console.log('idTipoCentroTrabajo', value);

            if (value && value !== '-1') {
                const tipoCentroTrabajo = this.combo.tiposCentroTrabajo.find(pred => pred.idTipoCentroTrabajo === value);
                console.log('tipoCentroTrabajo', tipoCentroTrabajo);
                if (tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitucionEducativaDRE ||
                    tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitucionEducativaUgel) {
                    this.mostrarInstitucionEducativa = true;
                } else {
                    this.mostrarInstitucionEducativa = false;
                }

                if (tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitucionEducativaDRE ||
                    tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitucionEducativaUgel ||
                    tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitutoSuperiorDRE ||
                    tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitutoSuperiorUgel
                ) {
                    this.mostrarModalidadNivelEducativo = true;
                    this.getModalidadesEducativas();
                } else {
                    this.mostrarModalidadNivelEducativo = false;
                }
            }else{
                this.mostrarInstitucionEducativa = true;
            }
        });

        this.form.get('idModalidadEducativa').valueChanges.subscribe((value) => {
            this.combo.nivelesEducativos = [];
            this.form.patchValue({ idNivelEducativo: null });
            if (value && value !== '-1') {
                this.getNivelesEducativos(value);
            }
        });
    }

    buildData() {
        this.resetearOpciones();
        console.log('this.permiteBuscar', this.permiteBuscar)
        if (!this.permiteBuscar) {
            this.dataSource.loadData(this.centrosTrabajo);
            return;
        }

        const rol =  this.dataService.Storage().getPassportRolSelected();
        let codigoNivelInstancia = 0;

        console.log('getCurrentUser', this.dataService.Storage().getCurrentUser())
        
        if(rol.CODIGO_TIPO_SEDE == PassportTipoSede.DRE){
            codigoNivelInstancia = TablaRotacionNivelInstancia.DRE;
        }else{
            codigoNivelInstancia = parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia);
        }

        console.log('codigoNivelInstancia', codigoNivelInstancia)

        switch (codigoNivelInstancia) {
            case TablaRotacionNivelInstancia.MINEDU: {
                this.mostrarInstancia = true;
                this.loadInstancia();
                break;
            }
            case TablaRotacionNivelInstancia.DRE: {
                this.mostrarSubinstancia = true;
                this.loadSubinstancia(this.dataService.Storage().getCurrentUser().idDre);
                break;
            }
            case TablaRotacionNivelInstancia.UGEL: {
                this.mostrarTipoCentroTrabajo = true;
                this.loadTipoCentroTrabajo(this.dataService.Storage().getCurrentUser().codigoNivelInstancia);
                break;
            }
        }
    }

    default() {
        this.form.patchValue({
            idInstancia: '-1',
            idSubinstancia: '-1',
            idTipoCentroTrabajo: '-1',
            idModalidadEducativa: '-1',
            idNivelEducativo: '-1'
        });
        this.form.controls['institucionEducativa'].reset();
    }

    ngAfterViewInit() {
        this.paginator.page.subscribe(() => {
            if (!this.filtro) {
                this.dataService.Message().msgWarning('"DEBE INGRESAR AL MENOS UN CRITERIO DE BÚSQUEDA."', () => {
                });
                return;
            }
            this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosRotacion.GET_BUSCAR_CENTRO_TRABAJO);
        });
    }

    loadData() {
        this.dataService.Spinner().hide('sp6');
        this.dataSource.load(this.filtro, (this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString());
    }

    ngOnDestroy(): void {
    }

    loadInstancia() {
        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().listarInstancia(true).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            if (response) {
                this.combo.instancias = response;
                // this.form.controls['idInstancia'].setValue(this.combo.instancias[0].id);
            }
        });
    }

    loadSubinstancia(idInstancia) {
        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().listarSubinstancia(idInstancia, true).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            this.combo.subinstancias = [];
            if (response) {
                this.combo.subinstancias = response;
            }
        });
    }

    loadTipoCentroTrabajo(codigoNivelInstancia) {
        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().listarTipoCentroTrabajo(codigoNivelInstancia, true).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            this.combo.tiposCentroTrabajo = [];
            if (response) {
                this.combo.tiposCentroTrabajo = response;
                if (this.combo.tiposCentroTrabajo.length === 1) {
                    this.form.controls['idTipoCentroTrabajo'].setValue(this.combo.tiposCentroTrabajo[0].idTipoCentroTrabajo);
                } else {
                    this.form.controls['idTipoCentroTrabajo'].setValue('-1');
                }
            }
        });
    }

    private getModalidadesEducativas() {
        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().getModalidadEducativa()
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            )
            .subscribe((response) => {
                this.combo.modalidades = [];
                if (response) {
                    this.combo.modalidades = response;
                }
            });
    }

    private getNivelesEducativos(idModalidadEducativa) {
        if (!idModalidadEducativa) {
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().getNivelEducativo(idModalidadEducativa)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            )
            .subscribe((response) => {
                this.combo.nivelesEducativos = [];
                if (response) {
                    this.combo.nivelesEducativos = response;
                }
            });
    }

    limpiar() {
        this.resetFiltro();
        this.buildData();
    }

    buscar() {
        this.setFiltro();
        if (this.filtro.idInstancia === '-1') {
            this.dataService.Message().msgWarning('"DEBE INGRESAR AL MENOS UN CRITERIO DE BÚSQUEDA."', () => {
            });
            return;
        }
        this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosRotacion.CONSULTAR_CENTRO_TRABAJO);
    }

    private handleBuscar() {
        this.dataService.Spinner().hide('sp6');
        this.dataSource.load(this.filtro, this.paginator.pageIndex + 1, this.globals.paginatorPageSize);
    }

    setFiltro() {
        const data = this.form.getRawValue();
        this.resetFiltroBuscar();

        if (parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia) === TablaRotacionNivelInstancia.MINEDU) {
            this.filtro.idOtraInstancia = this.dataService.Storage().getCurrentUser().idEntidadSede;
        }
        if (parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia) === TablaRotacionNivelInstancia.DRE) {
            this.filtro.idInstancia = this.dataService.Storage().getCurrentUser().idDre;
        }
        if (parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia) === TablaRotacionNivelInstancia.UGEL) {
            this.filtro.idInstancia = this.dataService.Storage().getCurrentUser().idDre;
            this.filtro.idSubinstancia = this.dataService.Storage().getCurrentUser().idUgel;
        }
        this.filtro.codigoNivelInstancia = this.dataService.Storage().getCurrentUser().codigoNivelInstancia;


        if (data.idInstancia && data.idInstancia !== '-1') {
            const instancia = this.combo.instancias.find(pred => pred.id === data.idInstancia);
            if (instancia.idNivelSede === TablaRotacionNivelInstancia.MINEDU) {
                this.filtro.idOtraInstancia = instancia?.idInstancia;
                this.filtro.idInstancia = null;
            } else {
                this.filtro.idInstancia = instancia?.idInstancia;
                this.filtro.idOtraInstancia = null;
            }
            this.filtro.codigoNivelInstancia = instancia?.idNivelSede;
        }

        if (data.idSubinstancia && data.idSubinstancia !== '-1') {
            const subInstancia = this.combo.subinstancias.find(pred => pred.id === data.idSubinstancia);
            this.filtro.idInstancia = subInstancia?.idInstancia;
            this.filtro.codigoNivelInstancia = subInstancia?.idNivelSede;
            this.filtro.idSubinstancia = subInstancia?.idSubinstancia;
        }

        if (data.idTipoCentroTrabajo && data.idTipoCentroTrabajo !== '-1') {
            this.filtro.idTipoCentroTrabajo = data.idTipoCentroTrabajo;
        }

        this.filtro.institucionEducativa = data.institucionEducativa;

        this.filtro.idModalidadEducativa = data.idModalidadEducativa ? data.idModalidadEducativa : null;
        this.filtro.idNivelEducativo = data.idNivelEducativo ? data.idNivelEducativo : null;
        if (this.data.codigoModular) {
            this.filtro.codigoModularAmbito = this.data.codigoModular;
        }
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        this.matDialogRef.close(selected);
    }

    mostrarInstanciaSeleccionada(idNivelInstancia) {
        this.resetearOpciones();

        switch (idNivelInstancia) {
            case TablaRotacionNivelInstancia.MINEDU: {
                this.mostrarInstancia = true;
                this.mostrarSubinstancia = true;
                break;
            }
            case TablaRotacionNivelInstancia.DRE: {
                this.mostrarSubinstancia = true;
                break;
            }
            case TablaRotacionNivelInstancia.UGEL: {
                this.mostrarTipoCentroTrabajo = true;
                break;
            }
        }
    }

    mostrarOpciones(
        mostrarInstancia: boolean,
        mostrarSubinstancia: boolean,
        mostrarTipoCentroTrabajo: boolean,
        mostrarModalidadNivelEducativo: boolean,
        mostrarInstitucionEducativa: boolean
    ) {
        this.mostrarInstancia = mostrarInstancia;
        this.mostrarSubinstancia = mostrarSubinstancia;
        this.mostrarTipoCentroTrabajo = mostrarTipoCentroTrabajo;
        this.mostrarModalidadNivelEducativo = mostrarModalidadNivelEducativo;
        this.mostrarInstitucionEducativa = mostrarInstitucionEducativa;
    }

    resetearOpciones() {
        this.mostrarInstancia = false;
        this.mostrarSubinstancia = false;
        this.mostrarTipoCentroTrabajo = false;
        this.mostrarModalidadNivelEducativo = false;
        this.mostrarInstitucionEducativa = false;
    }

    resetFiltro() {
        this.form.clearValidators();
        this.default();
    }

    resetFiltroBuscar() {
        this.filtro = {
            codigoNivelInstancia: null,
            idOtraInstancia: null,
            idInstancia: null,
            idSubinstancia: null,
            idTipoCentroTrabajo: null,
            institucionEducativa: null,
            idModalidadEducativa: null,
            idNivelEducativo: null,
            codigoModularAmbito: null
        };
    }

    handleCancelar() {
        this.matDialogRef.close();
    }

    obtenerClavePublica(operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosRotacion, param?: any) {
        this.dataService.Spinner().show('sp6');
        this.dataService.Passport().boot().pipe(
            catchError((e) => { return  this.configCatch(e);        }),
        ).subscribe((response: any) => {
            if (response) {
                const { Token } = response;
                this.confirmarOperacion(Token, operacion, requiredLogin, method, param);
            } else {
                this.dataService.Spinner().hide('sp6');
                if (!requiredLogin) {
                    this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
                    });
                } else {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => {
                        this.dataService.Storage().passportUILogin();
                    });
                }
                return;
            }
        });
    }

    confirmarOperacion(token: any, operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosRotacion, parametro?: any) {
        const parametroPermiso = this.dataService.Storage().getParamAccion(operacion);
        if (!parametroPermiso) {
            this.dataService.Spinner().hide('sp6');
            this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
            });
            return;
        }
        const param = this.dataService.Cifrado().PassportEncode(token, parametroPermiso);
        this.dataService.Passport().getAutorizacion(param).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
            })
        ).subscribe(response => {
            if (response && !response.HasErrors) {
                const data = response.Data[0];
                if (data.ESTA_AUTORIZADO) {
                    switch (method) {
                        case TablaMetodosRotacion.GET_BUSCAR_CENTRO_TRABAJO: {
                            this.loadData();
                            break;
                        }
                        case TablaMetodosRotacion.CONSULTAR_CENTRO_TRABAJO: {
                            this.handleBuscar();
                            break;
                        }
                    }
                } else {
                    this.dataService.Spinner().hide('sp6');
                    if (!requiredLogin) {
                        this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
                        });
                    } else {
                        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                    }
                    return;
                }
            } else {
                this.dataService.Spinner().hide('sp6');
                this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => {
                    this.dataService.Storage().passportUILogin();
                });
            }
        });
    }
    configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
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

export class CentroTrabajoDataSource extends DataSource<any> {

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    loadData(data: any[]) {
        this._loadingChange.next(false);
        if (data.length > 0) {
            this.totalregistro = (data[0] || [{ total: 0 }]).total;
            this._dataChange.next(data);
        } else {
            this.totalregistro = 0;
            this._dataChange.next([]);
        }
    }

    load(data: any, pageIndex, pageSize) {
        this._loadingChange.next(true);
        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().getListCentroTrabajo(data, pageIndex, pageSize).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this._loadingChange.next(false);
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe((response: any) => {
            if (response && (response || []).length > 0) {
                this.totalregistro = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
                this._dataChange.next(response || []);
            } else {
                this.totalregistro = 0;
                this._dataChange.next([]);
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {
                });
            }
        });
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get data(): any {
        return this._dataChange.value || [];
    }
    configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
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