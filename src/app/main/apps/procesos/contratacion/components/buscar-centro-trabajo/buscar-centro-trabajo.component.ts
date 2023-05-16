import {
  Component,
  OnInit,
  Inject,
  ViewEncapsulation,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
import {
  SelectionModel,
  DataSource,
  CollectionViewer,
} from "@angular/cdk/collections";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, map, finalize } from "rxjs/operators";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
//import { NivelInstanciaCodigoEnum, TipoCentroTrabajoCodigoEnum } from 'app/core/model/types';
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { GlobalsService } from "app/core/shared/globals.service";
import { PassportModel } from "app/core/model/passport-model";
import {
  NivelInstanciaCodigoEnum,
  TipoCentroTrabajoCodigoEnum,
} from "../../models/contratacion.model";
import { CentroTrabajoEnum, TablaTipoCentroTrabajo, TablaRolPassport, PassportTipoSede } from '../../_utils/constants';
import { SecurityModel } from 'app/core/model/security/security.model';

@Component({
  selector: "minedu-buscar-centro-trabajo",
  templateUrl: "./buscar-centro-trabajo.component.html",
  styleUrls: ["./buscar-centro-trabajo.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BuscarCentroTrabajoComponent
  implements OnInit, OnDestroy, AfterViewInit {
  private dataSubscription: Subscription;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  private _unsubscribeAll: Subject<any>;
  private sharedSubscription: Subscription;

  form: FormGroup;
  working = false;
  dialogTitle: string;
  action: string;

  dialogRef: any;

  instancias: any[];
  subinstancias: any[];
  tiposCentroTrabajo: any[];
  modalidadesEducativas: any[];
  nivelesEducativos: any[];

  filtro = {
    idNivelInstancia: null,
    idInstancia: null,
    idSubinstancia: null,
    idTipoCentroTrabajo: null,
    institucionEducativa: null,
    idEtapaProceso: null,
    codigoSede: null,
    idModalidadEducativa: null,
    idNivelEducativo: null
  };

  private passport: PassportModel = {
    idNivelInstancia: null,
    idEntidad: null,
    usuario: null,
  };

  ocultarInstancia = false;
  ocultarSubinstancia = false;
  ocultarTipoCentroTrabajo = false;
  ocultarInstitucionesEducativas = false;

  tieneEstructuraOrganica = null;

  displayedColumns: string[] = [
    "index",
    "idCentroTrabajo",
    "codigoCentroTrabajo",
    "anexoCentroTrabajo",
    "id",
    "centroTrabajo",
    "instancia",
    "subinstancia",
    "idTipoCentroTrabajo",
    "tipoCentroTrabajo",
    "modalidadEducativa",
    "nivelEducativo",
  ];

  // codigoSede : string=null;

  dataSource: CentroTrabajoDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild("paginatorCentroTrabajo", { static: true })
  paginator: MatPaginator;
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
  buscarPaginator: boolean = false;
  desactivarIntancia: boolean = false;
  desactivarSubIntancia: boolean = false;

  mostrarInstitucionEducativa: boolean = false;
  mostrarModalidadNivelEducativo: boolean = false;
  currentSession: any = null;

  constructor(
    public matDialogRef: MatDialogRef<BuscarCentroTrabajoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dataShared: SharedService,
    public globals: GlobalsService,
    private materialDialog: MatDialog
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    this.action = this.data.action;
    this.dialogTitle = "Búsqueda de centro de trabajo";

    this.buildForm();
    this.handleResponsive();
    this.buildData();

    this.dataSource = new CentroTrabajoDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Registros por página";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) { return `0 de ${length}`; }
      const length2 = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
      return `${startIndex + 1} – ${endIndex} de ${length2}`;
    }

    this.filtro.idEtapaProceso = this.data.idEtapaProceso;
    this.filtro.codigoSede = this.data.codigoSede;
    //this.desactivarIntancia = this.data.codigoSede == CentroTrabajoEnum.MINEDU;
    this.configurarInstanciaSubInstancia();
    console.log("Datos obtenidos de modulo principal:", this.data)
    this.obtenerInstanciaSubinstanciaDefault();
    this.form.get('idInstancia').setValue(-1);
    this.mostrarInstitucionEducativa = true;
  }
  configurarInstanciaSubInstancia = () => {
    this.desactivarIntancia = true;
    this.desactivarSubIntancia = true;
    this.ocultarInstancia = true;
    this.ocultarSubinstancia = true;
    if (
      this.currentSession.codigoRol == TablaRolPassport.RESPONSABLE_PERSONAL_DRE
      && this.currentSession.codigoTipoSede == PassportTipoSede.DRE
    ) {
      this.desactivarIntancia = false;
      this.ocultarInstancia = false;
    }

    if (
      this.currentSession.codigoRol == TablaRolPassport.RESPONSABLE_PERSONAL_UGEL
      && this.currentSession.codigoTipoSede == PassportTipoSede.UGEL
    ) {
      this.desactivarIntancia = false;
      this.desactivarSubIntancia = false;
      this.ocultarInstancia = false;
      this.ocultarSubinstancia = false;
    }
  }

  obtenerInstanciaSubinstanciaDefault() {
    console.log("codigo Sede", this.data.codigoSede)

    if (this.data.codigoSede != null) {
      this.dataService.Contrataciones().getDefaultValueComboInstanciasByCodSede(this.data.codigoSede).pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
        .subscribe((response: any) => {
          if (response) {
            console.log("Datos de instancia  por codSede response:", response);
            this.form.get("idInstancia").setValue(!response.idInstancia ? '-1' : response.idInstancia);

            if (
              this.currentSession.codigoRol == TablaRolPassport.RESPONSABLE_PERSONAL_UGEL
              && this.currentSession.codigoTipoSede == PassportTipoSede.UGEL
            ) {
              if (response.idSubInstancia)
                this.form.get("idSubinstancia").setValue(this.obtenerIdSubInstancia(response.idSubInstancia));
            }
          }
        });
    }
  }

  obtenerIdSubInstancia = (idSubInstancia: string): string => {
    var ids = idSubInstancia.split('-');
    return `3-${ids[1]}`;
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }

  buildForm = () => {
    this.form = this.formBuilder.group({
      idNivelInstancia: [null],
      idInstancia: [null],
      idSubinstancia: [null],
      idTipoCentroTrabajo: [null],
      institucionEducativa: [null],
      idModalidadEducativa: [null],
      idNivelEducativo: [null],
    });

    this.passport.idNivelInstancia = 1;
    this.passport.idEntidad = 1;

    this.form.get("idInstancia").valueChanges.subscribe((value) => {
      let idNivelInstancia = null;
      let idInstancia = null;

      this.subinstancias = [];
      this.tiposCentroTrabajo = [];

      if (value === "-1" || value == null) {
        switch (this.passport.idNivelInstancia) {
          case NivelInstanciaCodigoEnum.MINEDU: {
            this.mostrarOpciones(true, false, false, false);
            break;
          }
        }
        return;
      }

      if (
        (this.instancias != null && this.instancias.length !== 0) &&
        value !== null &&
        value !== undefined
      ) {
        const data = this.instancias.find(
          (x) => x.id_instancia === value
        );
        idNivelInstancia = parseInt(value.split("-")[0]);
        idInstancia = data.id;
      }

      this.form.patchValue({
        idSubinstancia: "-1",
        idTipoCentroTrabajo: "-1",
      });

      switch (idNivelInstancia) {
        case NivelInstanciaCodigoEnum.MINEDU: {
          if (value) {
            this.mostrarOpciones(true, false, false, false);
            //this.loadTipoCentroTrabajo(idNivelInstancia, true);
          }
          break;
        }
        case NivelInstanciaCodigoEnum.DRE: {
          if (value) {
            this.mostrarOpciones(true, true, false, false);
            this.loadSubinstancia(idInstancia, true);
          }
          break;
        }
      }
    });

    this.form.get("idSubinstancia").valueChanges.subscribe((value) => {
      let idNivelInstancia = null;
      let idSubinstancia = null;

      this.tiposCentroTrabajo = [];

      if (value === "-1") {
        switch (this.passport.idNivelInstancia) {
          case NivelInstanciaCodigoEnum.MINEDU: {
            this.mostrarOpciones(true, true, false, false);
            break;
          }
          case NivelInstanciaCodigoEnum.DRE: {
            this.mostrarOpciones(false, true, false, false);
            break;
          }
        }
        return;
      }
      if (
        this.subinstancias.length !== 0 &&
        value !== null &&
        value !== undefined
      ) {
        const data = this.subinstancias.find(
          (x) => x.id_subinstancia === value
        );
        idNivelInstancia = parseInt(value.split("-")[0].toString());
        idSubinstancia = data.id;
      }

      this.form.patchValue({ idTipoCentroTrabajo: "-1" });

      switch (this.passport.idNivelInstancia) {
        case NivelInstanciaCodigoEnum.MINEDU: {
          if (value) {
            this.mostrarOpciones(true, true, true, false);
            idNivelInstancia = idNivelInstancia | this.form.get('idSubinstancia').value.split('-')[0];
            this.loadTipoCentroTrabajo(idNivelInstancia, true);
          }
          break;
        }
        case NivelInstanciaCodigoEnum.DRE: {
          if (value) {
            this.mostrarOpciones(false, true, true, false);
            this.loadTipoCentroTrabajo(idNivelInstancia, true);
          }
          break;
        }
        case NivelInstanciaCodigoEnum.UGEL: {
          if (value) {
            this.mostrarOpciones(false, false, true, false);
            this.loadTipoCentroTrabajo(idNivelInstancia, true);
          }
          break;
        }
      }
    });

    this.form.get("idTipoCentroTrabajo").valueChanges.subscribe((value) => {
      this.form.patchValue({ idModalidadEducativa: "-1", idNivelEducativo: "-1", institucionEducativa: '' });
      this.mostrarModalidadNivelEducativo = false;
      if (value === "-1") {
        switch (this.passport.idNivelInstancia) {
          case NivelInstanciaCodigoEnum.MINEDU: {
            let codigoTipoSede = this.currentSession.codigoTipoSede;
            if (codigoTipoSede == PassportTipoSede.DRE && this.form.get("idSubinstancia").value == "-1") {
              this.mostrarOpciones(true, true, false, false);
              break;
            }
            this.mostrarOpciones(true, true, true, false);
            break;
          }
          case NivelInstanciaCodigoEnum.DRE: {
            this.mostrarOpciones(false, true, true, false);
            break;
          }
          case NivelInstanciaCodigoEnum.UGEL: {
            this.mostrarOpciones(false, false, true, false);
            break;
          }
        }
        return;
      }

      let idTipoCentroTrabajo = null;
      this.form.controls["institucionEducativa"].setValue("");

      if (
        this.tiposCentroTrabajo.length !== 0 &&
        value !== null &&
        value !== undefined
      ) {
        const data = this.tiposCentroTrabajo.find(
          (x) => x.id_tipo_centrotrabajo == value
        );
        if (data) {
          idTipoCentroTrabajo = data.idTipoCentroTrabajo;
          this.tieneEstructuraOrganica = data.tieneEstructuraOrganica;
        }
      }

      switch (this.passport.idNivelInstancia) {
        case NivelInstanciaCodigoEnum.MINEDU: {
          if (value && value > 0) {
            if (this.tieneEstructuraOrganica === true) {
              if (
                idTipoCentroTrabajo ===
                TipoCentroTrabajoCodigoEnum.Minedu
              ) {
                this.mostrarOpciones(true, false, true, false);
              } else {
                this.mostrarOpciones(true, true, true, false);
              }
            } else {
              var idSubInstancia = this.form.get('idSubinstancia').value;
              if (idSubInstancia != '-1')
                this.mostrarOpciones(true, true, true, true);
              else
                this.mostrarOpciones(true, false, true, true);
            }
          }
          break;
        }
        case NivelInstanciaCodigoEnum.DRE: {
          if (value && value > 0) {
            if (this.tieneEstructuraOrganica === true) {
              this.mostrarOpciones(false, true, true, false);
            } else {
              this.mostrarOpciones(false, true, true, true);
            }
          }
          break;
        }
        case NivelInstanciaCodigoEnum.UGEL: {
          if (value && value > 0) {
            if (this.tieneEstructuraOrganica === true) {
              this.mostrarOpciones(false, false, true, false);
            } else {
              this.mostrarOpciones(false, false, true, true);
            }
          }
          break;
        }
      }
      if (value && value !== "-1") {
        const tipoCentroTrabajo = this.tiposCentroTrabajo.find(pred => pred.id_tipo_centrotrabajo == value);
        if (tipoCentroTrabajo.codigo_tipo_centrotrabajo == TablaTipoCentroTrabajo.InstitucionEducativaDRE ||
          tipoCentroTrabajo.codigo_tipo_centrotrabajo == TablaTipoCentroTrabajo.InstitucionEducativaUgel) {
          this.mostrarInstitucionEducativa = true;
        } else {
          //	    this.mostrarInstitucionEducativa = false;
        }

        if (tipoCentroTrabajo.codigo_tipo_centrotrabajo == TablaTipoCentroTrabajo.InstitucionEducativaDRE ||
          tipoCentroTrabajo.codigo_tipo_centrotrabajo == TablaTipoCentroTrabajo.InstitucionEducativaUgel ||
          tipoCentroTrabajo.codigo_tipo_centrotrabajo == TablaTipoCentroTrabajo.InstitutoSuperiorDRE ||
          tipoCentroTrabajo.codigo_tipo_centrotrabajo == TablaTipoCentroTrabajo.InstitutoSuperiorUgel
        ) {
          this.mostrarModalidadNivelEducativo = true;
          this.loadModalidadesEducativas();
        } else {
          this.mostrarModalidadNivelEducativo = false;
        }
      }
    });
    this.form.get("idModalidadEducativa").valueChanges.subscribe((value) => {
      if (!value || value == "-1") return false;
      this.loadNivelesEducativos(value);
    });
  };

  buildPassport = () => {
    this.passport = {
      idNivelInstancia: 12,
      idEntidad: 1,
      usuario: "admin",
    };
  };

  buildData = () => {
    this.mostrar(this.passport.idNivelInstancia);

    switch (this.passport.idNivelInstancia) {
      case NivelInstanciaCodigoEnum.MINEDU: {
        this.loadInstancia(true);
        break;
      }
      case NivelInstanciaCodigoEnum.DRE: {
        this.loadSubinstancia(this.passport.idEntidad, true);
        break;
      }
      case NivelInstanciaCodigoEnum.UGEL: {
        this.loadTipoCentroTrabajo(
          this.passport.idNivelInstancia,
          true
        );
        break;
      }
    }
  };

  default = () => {
    this.form.patchValue({
      idInstancia: "-1",
      idSubinstancia: "-1",
      idTipoCentroTrabajo: "-1",
      idModalidadEducativa: "-1",
      idNivelEducativo: "-1",
    });

    this.form.controls["institucionEducativa"].reset();
    //this.ocultarSubinstancia = false;
    this.ocultarTipoCentroTrabajo = false;
  };

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.loadData(
        (this.paginator.pageIndex + 1).toString(),
        this.paginator.pageSize.toString()
      );
    }
    );
  }

  loadData = (pageIndex, pageSize) => {
    this.dataSource.load(this.filtro, pageIndex, pageSize);
  };

  ngOnDestroy(): void { }

  loadInstancia = (activo) => {
    this.dataService
      .Contrataciones()
      .getComboInstancia(activo)
      .pipe(
        catchError(() => of([])),
        map((response: any) => response)
      )
      .subscribe((instancias) => {
        if (instancias) {
          this.instancias = instancias;
          this.form.controls["idInstancia"].setValue("-1");
        }
      });
  };

  loadModalidadesEducativas = () => {
    let request = { idModalidadEducativa: null };
    this.dataService
      .Contrataciones()
      .getObtenerModalidadEducativa(request)
      .pipe(
        catchError(() => of([])),
        map((response: any) => response)
      )
      .subscribe((response) => {
        if (response) {
          this.modalidadesEducativas = response;
          this.form.controls["idModalidadEducativa"].setValue("-1");
          this.form.controls["idNivelEducativo"].setValue("-1");
        }
      });
  };

  loadNivelesEducativos = (idModalidadEducativa: number) => {
    let request = { idModalidadEducativa: idModalidadEducativa };
    this.dataService
      .Contrataciones()
      .getObtenerNivelEducativo(request)
      .pipe(
        catchError(() => of([])),
        map((response: any) => response)
      )
      .subscribe((response) => {
        if (response) {
          this.nivelesEducativos = response;
          this.form.controls["idNivelEducativo"].setValue("-1");
        }
      });
  };

  loadSubinstancia = (idInstancia, activo) => {
    this.dataService
      .Contrataciones()
      .getComboSubinstancia(idInstancia, activo)
      .pipe(
        catchError(() => of([])),
        map((response: any) => response)
      )
      .subscribe((subinstancias) => {
        if (subinstancias) {
          this.subinstancias = subinstancias;
          if (!this.form.controls["idSubinstancia"].value)
            this.form.controls["idSubinstancia"].setValue("-1");
        }
      });
  };

  loadTipoCentroTrabajo = (idNivelInstancia, activo) => {
    this.dataService
      .Contrataciones()
      .getTipoCentroTrabajo(idNivelInstancia, activo)
      .pipe(
        catchError(() => of([])),
        map((response: any) => response)
      )
      .subscribe((tiposCentroTrabajo) => {
        if (tiposCentroTrabajo) {
          this.tiposCentroTrabajo = tiposCentroTrabajo;
          if (this.tiposCentroTrabajo.length === 1) {
            this.form.controls["idTipoCentroTrabajo"].setValue(
              this.tiposCentroTrabajo[0].id_tipo_centrotrabajo
            );
            this.form.controls["idTipoCentroTrabajo"].disable();
          } else {
            this.form.controls["idTipoCentroTrabajo"].setValue(
              "-1"
            );
            this.form.controls["idTipoCentroTrabajo"].enable();
          }
        }
      });
  };

  cancelar = () => {
    this.resetFiltro();
    this.matDialogRef.close();
  };

  limpiar = () => {
    let codigoTipoSede = this.currentSession.codigoTipoSede;
    if (codigoTipoSede == PassportTipoSede.MINEDU) {
      this.resetFiltro();
      this.mostrarModalidadNivelEducativo = false;
    } else if (codigoTipoSede == PassportTipoSede.DRE) {
      this.ocultarTipoCentroTrabajo = false;
      this.form.get('idSubinstancia').setValue("-1");
      this.limpiarParcial();
    }else{
      this.limpiarParcial();
    }


    //if (this.data.codigoSede == CentroTrabajoEnum.MINEDU) {
      //this.resetFiltro();
      //this.mostrarModalidadNivelEducativo = false;
    //}
    //else
      //this.limpiarParcial();
    this.dataSource = new CentroTrabajoDataSource(this.dataService);
  };

  limpiarParcial = (): void => {
    this.form.get('idTipoCentroTrabajo').setValue("-1");
    this.form.get('institucionEducativa').setValue(null);
  }
  verificarSeleccionMininaDeCriterio = (): boolean => {
    let idInstancia = this.form.get('idInstancia').value != '-1';
    let idSubinstancia = this.form.get('idSubinstancia').value != '-1';
    let idTipoCentroTrabajo = this.form.get('idTipoCentroTrabajo').value != '-1';
    let idModalidadEducativa = this.form.get('idModalidadEducativa').value != '-1';
    let idNivelEducativo = this.form.get('idNivelEducativo').value != '-1';
    let institucionEducativa = this.form.get('institucionEducativa').value;
    let respuesta = idInstancia ||
      idSubinstancia ||
      idTipoCentroTrabajo ||
      idModalidadEducativa ||
      idNivelEducativo ||
      institucionEducativa;
    return respuesta;
  }
  buscar = () => {
    this.setFiltro();
    if (!this.verificarSeleccionMininaDeCriterio()) {
      this.dataService
        .Message()
        .msgWarning('"DEBE INGRESAR AL MENOS UN CRITERIO DE BÚSQUEDA."', () => { });
      return;
    }

    this.paginator.firstPage();
    this.dataSource.load(
      this.filtro,
      this.paginator.pageIndex + 1,
      this.globals.paginatorPageSize
    );
  };

  setFiltro = () => {
    const data = this.form.getRawValue();
    this.resetFiltroBuscar();

    if (data.idModalidadEducativa != "-1") {
      this.filtro.idModalidadEducativa = data.idModalidadEducativa;
    }

    if (data.idNivelEducativo != "-1") {
      //this.filtro.idNivelEducativo = data.idNivelEducativo;
      this.filtro.idNivelEducativo = this.form.get('idNivelEducativo').value;
    }

    if (data.idInstancia !== null && data.idInstancia !== "-1") {
      this.filtro.idNivelInstancia = parseInt(
        data.idInstancia.split("-")[0]
      );
      this.filtro.idInstancia = parseInt(data.idInstancia.split("-")[1]);
    }

    if (data.idSubinstancia !== null && data.idSubinstancia !== "-1") {
      this.filtro.idNivelInstancia = parseInt(
        data.idSubinstancia.split("-")[0]
      );
      this.filtro.idSubinstancia = parseInt(
        data.idSubinstancia.split("-")[1]
      );
    }

    if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
      this.filtro.idTipoCentroTrabajo = data.idTipoCentroTrabajo;
    }

    switch (this.passport.idNivelInstancia) {
      case NivelInstanciaCodigoEnum.MINEDU:
      case NivelInstanciaCodigoEnum.DRE: {
        this.filtro.idInstancia = this.filtro.idInstancia
          ? this.filtro.idInstancia
          : this.passport.idEntidad;
        break;
      }
      case NivelInstanciaCodigoEnum.UGEL: {
        if (data.idSubinstancia === null) {
          this.filtro.idNivelInstancia =
            this.passport.idNivelInstancia;
          this.filtro.idSubinstancia = this.passport.idEntidad;
        }
        break;
      }
    }

    this.filtro.institucionEducativa = data.institucionEducativa
      ? data.institucionEducativa.toUpperCase()
      : null;
  };

  onSelect(selected: any): void {
    this.selection.clear();
    this.selection.toggle(selected);
    // this.dataShared.sendDataSharedCentroTrabajo({ registro: selected });
    this.matDialogRef.close({ centroTrabajo: selected });
  }

  mostrar = (idNivelInstancia) => {
    this.resetearOpciones();

    switch (idNivelInstancia) {
      case NivelInstanciaCodigoEnum.MINEDU: {
        //this.ocultarInstancia = true;
        break;
      }
      case NivelInstanciaCodigoEnum.DRE: {
        //this.ocultarSubinstancia = true;
        break;
      }
      case NivelInstanciaCodigoEnum.UGEL: {
        this.ocultarTipoCentroTrabajo = true;
        break;
      }
    }
  };

  mostrarOpciones = (
    instancia,
    subinstancia,
    tipoCentroTrabajo,
    institucionEducativa
  ) => {
    //this.ocultarInstancia = instancia;
    //this.ocultarSubinstancia = subinstancia;
    this.ocultarTipoCentroTrabajo = tipoCentroTrabajo;
    this.ocultarInstitucionesEducativas = institucionEducativa;
  };

  resetearOpciones = () => {
    //this.ocultarInstancia = false;
    //this.ocultarSubinstancia = false;
    this.ocultarTipoCentroTrabajo = false;
    this.ocultarInstitucionesEducativas = false;
  };

  resetFiltro = () => {
    this.form.clearValidators();
    this.default();
  };

  resetFiltroBuscar = () => {
    this.filtro = {
      idNivelInstancia: null,
      idInstancia: null,
      idSubinstancia: null,
      idTipoCentroTrabajo: null,
      institucionEducativa: null,
      idEtapaProceso: this.data.idEtapaProceso,
      codigoSede: this.data.codigoSede,
      idModalidadEducativa: null,
      idNivelEducativo: null
    };
  };
}

export class CentroTrabajoDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
    super();
  }

  load = (filtro: any, pageIndex, pageSize) => {
    this._loadingChange.next(false);
    this.dataService.Spinner().show("sp6");
    this.dataService
      .Contrataciones()
      .buscarCentrosTrabajoPaginado(filtro, pageIndex, pageSize)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
          this._loadingChange.next(false)
          this.dataService.Spinner().hide("sp6");
        })
      )
      .subscribe((centrosTrabajo: any) => {
        this._dataChange.next(centrosTrabajo || []);
        this.totalregistro =
          (centrosTrabajo || []).length === 0
            ? 0
            : centrosTrabajo[0].total_registros;
        if ((centrosTrabajo || []).length === 0) {
          this.dataService
            .Message()
            .msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
        }
      });
  };

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
