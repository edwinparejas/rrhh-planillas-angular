import {
    Component,
    OnInit,
    Inject,
    ViewEncapsulation,
    ViewChild,
    AfterViewInit,
} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { BehaviorSubject, of, Observable } from "rxjs";
import {
    SelectionModel,
    DataSource,
    CollectionViewer,
} from "@angular/cdk/collections";
import { FormGroup, FormBuilder } from "@angular/forms";
import { catchError, map, finalize } from "rxjs/operators";
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";

import { DataService } from "app/core/data/data.service";
import { GlobalsService } from "app/core/shared/globals.service";

import {
    TablaEquivalenciaSede,
    TablaTipoCentroTrabajo,
} from "app/core/model/types";
import { SecurityModel } from "app/core/model/security/security.model";
import { CodigoNivelInstancia } from "../../_utils/types-reportes-cap";
import { CentroTrabajoModel } from "app/core/model/centro-trabajo.model";
import { HttpErrorResponse } from "@angular/common/http";
import { MESSAGE_REPORTES_CAP } from "../../_utils/messages";

@Component({
    selector: "minedu-buscar-centro-trabajo",
    templateUrl: "./buscar-centro-trabajo.component.html",
    styleUrls: ["./buscar-centro-trabajo.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BuscarCentroTrabajoComponent
    implements OnInit, AfterViewInit {

    form: FormGroup;
    working = false;
    private passport: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;

    dialogTitle: string;
    action: string;
    codigoNivelInstancia: number = 0;

    dialogRef: any;

    instancias: any[];
    subinstancias: any[];
    tiposCentroTrabajo: any[];
    modalidades: any[] = [];
    nivelesEducativos: any[] = [];

    filtro = {
        codigoNivelInstancia: null,
        idInstancia: null,
        idSubinstancia: null,
        idTipoCentroTrabajo: null,
        institucionEducativa: null,

        idModalidadEducativa: null,
        idNivelEducativo: null
    };

    mostrarInstancia : boolean = false;
    mostrarSubinstancia: boolean = false;
    mostrarTipoCentroTrabajo: boolean = false;
    mostrarModalidadNivelEducativo: boolean = false;
    mostrarInstitucionEducativa: boolean = false;

    tieneEstructuraOrganica = null;
    permiteBuscar: boolean = true;
    private centrosTrabajo: any[] = [];
    displayedColumns: string[] = [
        "index",
        "idCentroTrabajo",
        "codigoCentroTrabajo",
        "anexo",
        "id",
        "centroTrabajo",
        "instancia",
        "subinstancia",
        "idTipoCentroTrabajo",
        "tipoCentroTrabajo",
        "modalidadEducativa",
        "nivelEducativo",
    ];

    dataSource: CentroTrabajoDataSource | null;
    selection = new SelectionModel<any>(false, []);
    //@ViewChild("paginatorCentroTrabajo", { static: true })
    @ViewChild('paginatorCentroTrabajo', { static: true }) paginator: MatPaginator;
    //paginator: MatPaginator;

    constructor(
        public matDialogRef: MatDialogRef<BuscarCentroTrabajoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService
    ) {
        this.permiteBuscar = data.permiteBuscar;
        this.centrosTrabajo = data.centrosTrabajo;
        //this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.action = this.data.action;
        this.centroTrabajo = this.data.centroTrabajo;
        this.dialogTitle = "Búsqueda de centro de trabajo";
        const rol =  this.dataService.Storage().getPassportRolSelected();


        this.buildForm();
        this.buildPassport();
        this.buildData();

        this.dataSource = new CentroTrabajoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }

        setTimeout(() => { this.buildData(); }, 0);

    }

    buildForm() {
        this.form = this.formBuilder.group({
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
      
            if (value && value !== '-1') {
              const instancia = this.instancias.find(pred => pred.idInstancia === value);
              const codigoNivelInstancia = parseInt(value.split("-")[0]);              

              switch (codigoNivelInstancia) {
                case CodigoNivelInstancia.MINEDU: {
                  if (value) {
                    this.mostrarOpciones(true, false, false, false, false);
                  }
                  break;
                }
                case CodigoNivelInstancia.DRE: {
                  if (value) {
                    this.mostrarOpciones(true, true, false, false, false);
                    this.loadSubinstancia(instancia.id, true);
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
      
            if (value && value !== "-1") {
              this.tiposCentroTrabajo = [];
              const subInstancia = this.subinstancias.find(pred => pred.idSubinstancia === value);
              const codigoNivelInstancia = parseInt(subInstancia.idSubinstancia.split("-")[0].toString());
      
              this.mostrarTipoCentroTrabajo = true;
              this.loadTipoCentroTrabajo(codigoNivelInstancia, true);
            }
        });

        this.form.get("idTipoCentroTrabajo").valueChanges.subscribe((value) => {
            this.form.patchValue({ idModalidadEducativa: "-1", idNivelEducativo: "-1", institucionEducativa: '' });
            this.mostrarModalidadNivelEducativo = false;
            this.mostrarInstitucionEducativa = false;

            if (value && value !== "-1") {
                const tipoCentroTrabajo = this.tiposCentroTrabajo.find(pred => pred.idTipoCentroTrabajo === value);
                if (tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.InstitucionEducativaDRE||
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
            }
        });

        this.form.get("idModalidadEducativa").valueChanges.subscribe((value) => {
            this.nivelesEducativos = [];
            this.form.patchValue({ idNivelEducativo: null });
            if (value && value !== "-1") {
                this.getNivelesEducativos(value);
            }
        });
    }
    
    buildPassport() {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        
        if (this.passport.codigoTipoSede === TablaEquivalenciaSede.CODIGO_TIPO_SEDE)
            this.passport.codigoSede = TablaEquivalenciaSede.CODIGO_SEDE;
            
        switch (this.passport.codigoTipoSede) {
            case TablaEquivalenciaSede.CODIGO_TIPO_SEDE_OFICINA: {
                this.codigoNivelInstancia = CodigoNivelInstancia.MINEDU;
                break;
            }
            case TablaEquivalenciaSede.CODIGO_TIPO_SEDE_DRE: {
                this.codigoNivelInstancia = CodigoNivelInstancia.DRE;
                break;
            }
            case TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL: {
                this.codigoNivelInstancia = CodigoNivelInstancia.UGEL;
                break;
            }
        }
    }

    buildData() {
        this.resetearOpciones();
        const rol =  this.dataService.Storage().getPassportRolSelected();
        if (!this.permiteBuscar) {
          this.dataSource.loadData(this.centrosTrabajo);
          return;
        }
    
        switch (this.codigoNivelInstancia) {
          case CodigoNivelInstancia.MINEDU: {
            this.mostrarInstancia = true;
            this.loadInstancia(true);
            break;
          }
          case CodigoNivelInstancia.DRE: {
            if(rol.CODIGO_TIPO_SEDE === TablaEquivalenciaSede.CODIGO_TIPO_INSTITUCION_EDUCATIVA){
              this.mostrarTipoCentroTrabajo = true;
              this.loadTipoCentroTrabajo(CodigoNivelInstancia.UGEL, true);
            }
            else{
              this.mostrarSubinstancia = true;
              this.loadSubinstancia(this.centroTrabajo.idDre, true);
            } ;
            break;
          }
          case CodigoNivelInstancia.UGEL: {
            this.mostrarTipoCentroTrabajo = true;
            this.loadTipoCentroTrabajo(this.codigoNivelInstancia, true);
            break;
          }
        }
    }

    default() {
        this.form.patchValue({
            idInstancia: "-1",
            idSubinstancia: "-1",
            idTipoCentroTrabajo: "-1",

            idModalidadEducativa: "-1",
            idNivelEducativo: "-1"
        });
        this.form.controls["institucionEducativa"].reset();
    }

    ngAfterViewInit() {
        this.paginator.page.subscribe(() => this.loadData());
    }

    loadData() {
        if (!this.filtro) {
            this.dataService
                .Util()
                .msgWarning(
                    "Debe ingresar al menos un criterio de búsqueda.",
                    () => { }
                );
            return;
        }
        this.dataSource.load(
            this.filtro,
            (this.paginator.pageIndex + 1).toString(),
            this.paginator.pageSize.toString()
        );
    }

    ngOnDestroy(): void { }

    loadInstancia(activo) {
        this.dataService
            .ReportesCAP()
            .getInstancias(activo)
            .pipe(
                catchError((e) => of(e)),
                map((response: any) => response)
            )
            .subscribe((response) => {
                if (response) {
                    this.instancias = response;
                }
            });
    }

    loadSubinstancia(idInstancia, activo) {
        this.dataService
            .ReportesCAP()
            .getSubInstancias(idInstancia, activo)
            .pipe(
                catchError((e) => of(e)),
                map((response: any) => response)
            )
            .subscribe((response) => {
                this.subinstancias = [];
                if (response) {
                    this.subinstancias = response;
                }
            });
    }

    loadTipoCentroTrabajo(codigoNivelInstancia, activo) {
        this.dataService
            .ReportesCAP()
            .getTipoCentroTrabajo(codigoNivelInstancia, activo)
            .pipe(
                catchError((e) => of(e)),
                map((response: any) => response)
            )
            .subscribe((response) => {
                if (response) {
                    this.tiposCentroTrabajo = response;
                    if (this.tiposCentroTrabajo.length === 1) {
                        this.form.controls["idTipoCentroTrabajo"].setValue(this.tiposCentroTrabajo[0].idTipoCentroTrabajo);
                        this.form.controls["idTipoCentroTrabajo"].disable();
                    } else {
                        this.form.controls["idTipoCentroTrabajo"].setValue("-1");
                        this.form.controls["idTipoCentroTrabajo"].enable();
                    }
                }
            });
    }

    private getModalidadesEducativas() {
        this.dataService.Spinner().show("sp6")
        this.dataService.ReportesCAP().getModalidadesEducativas(1, true)
            .pipe(
                catchError((e) => { return of(e); }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                this.modalidades = [];
                if (response) {
                    this.modalidades = response;
                }
            });
    }

    private getNivelesEducativos(idModalidadEducativa) {
        if (!idModalidadEducativa)
            return;
        this.dataService.Spinner().show("sp6")
        this.dataService.ReportesCAP().getNivelesEducativos(idModalidadEducativa)
            .pipe(
                catchError((e) => { return of(e); }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                this.nivelesEducativos = [];
                if (response) {
                    this.nivelesEducativos = response;
                }
            });
    }

    limpiar(){
        this.resetFiltro();
        this.mostrarModalidadNivelEducativo = true;
        this.mostrarInstitucionEducativa = true;
        this.buildData();
    }

    buscar() {
        this.setFiltro();
        // if (this.form.value.idInstancia === '-1') {
        if (this.filtro.idInstancia === "-1") {
            this.dataService
                .Util()
                .msgWarning(
                    MESSAGE_REPORTES_CAP.M01,
                    () => { }
                );
            return;
        }
        this.dataSource.load(
            this.filtro,
            this.paginator.pageIndex + 1,
            this.globals.paginatorPageSize
        );
    }

    setFiltro() {
        const data = this.form.getRawValue();
        const rol =  this.dataService.Storage().getPassportRolSelected();

        this.resetFiltroBuscar();
        if (data.idInstancia !== null && data.idInstancia !== "-1") {
            this.filtro.codigoNivelInstancia = parseInt(
                data.idInstancia.split("-")[0]
            );
            this.filtro.idInstancia = parseInt(data.idInstancia.split("-")[1]);
        } else {
            this.filtro.codigoNivelInstancia = this.codigoNivelInstancia;
        }

        if (data.idSubinstancia !== null && data.idSubinstancia !== "-1") {
            this.filtro.codigoNivelInstancia = parseInt(
                data.idSubinstancia.split("-")[0]
            );
            this.filtro.idSubinstancia = parseInt(
                data.idSubinstancia.split("-")[1]
            );
        } else {
            if (this.filtro.codigoNivelInstancia !== CodigoNivelInstancia.MINEDU) {
                switch ( this.codigoNivelInstancia ) {
                    case CodigoNivelInstancia.DRE: {
                        if(rol.CODIGO_TIPO_SEDE === TablaEquivalenciaSede.CODIGO_TIPO_INSTITUCION_EDUCATIVA){
                            this.filtro.idInstancia =  this.centroTrabajo.idDre;
                            this.filtro.codigoNivelInstancia = parseInt(CodigoNivelInstancia.UGEL.toString());
                            this.filtro.idSubinstancia = this.centroTrabajo.idUgel;
                        }
                        else{
                            this.filtro.idInstancia = this.filtro.idInstancia ? this.filtro.idInstancia : this.centroTrabajo.idDre;
                        }                      
                        break;
                    }
                    case CodigoNivelInstancia.UGEL: {
                        if (data.idSubinstancia === null) {
                            this.filtro.codigoNivelInstancia = this.codigoNivelInstancia;
                            this.filtro.idSubinstancia = this.centroTrabajo.idUgel;
                        }
                        break;
                    }
                }
            }
        }

        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
            this.filtro.idTipoCentroTrabajo = data.idTipoCentroTrabajo;
        }

        switch (this.codigoNivelInstancia) {
            case CodigoNivelInstancia.MINEDU:
            case CodigoNivelInstancia.DRE: {
                this.filtro.idInstancia = this.filtro.idInstancia? this.filtro.idInstancia: this.centroTrabajo.idDre;
                break;
            }
            case CodigoNivelInstancia.UGEL: {
                if (data.idSubinstancia === null) {
                    this.filtro.codigoNivelInstancia = this.codigoNivelInstancia;
                    this.filtro.idSubinstancia = this.centroTrabajo.idUgel;
                }
                break;
            }
        }

        this.filtro.institucionEducativa = data.institucionEducativa
            ? data.institucionEducativa
            : null;

        this.filtro.idModalidadEducativa = data.idModalidadEducativa ? data.idModalidadEducativa : null;
        this.filtro.idNivelEducativo = data.idNivelEducativo ? data.idNivelEducativo : null;
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        //this.dataShared.sendDataSharedCentroTrabajo({ registro: selected });
        this.matDialogRef.close(selected);
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
        // this.ocultarInstitucionesEducativas = false;

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
            idInstancia: null,
            idSubinstancia: null,
            idTipoCentroTrabajo: null,
            institucionEducativa: null,
            idModalidadEducativa: null,
            idNivelEducativo: null
        };
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
        this.dataService.Spinner().show("sp6");
        this.dataService
            .ReportesCAP()
            .listarCentroTrabajo(data, pageIndex, pageSize)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.totalregistro = 0;
                    this._dataChange.next([]);
                    this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
                }),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response && (response || []).length > 0) {
                    this.totalregistro = (
                        response[0] || [{ totalRegistro: 0 }]
                    ).totalRegistro;
                    this._dataChange.next(response || []);
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
}
