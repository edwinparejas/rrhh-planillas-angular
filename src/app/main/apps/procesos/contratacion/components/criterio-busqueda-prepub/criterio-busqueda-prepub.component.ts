import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize, map} from "rxjs/operators";
import { BehaviorSubject, of, Observable } from "rxjs";
import { CollectionViewer, SelectionModel } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { DataSource } from "@angular/cdk/table";
import { NivelInstanciaCodigoEnum } from '../../models/contratacion.model';
import { MatDialog } from "@angular/material/dialog";
import { BuscarCentroTrabajoComponent } from '../buscar-centro-trabajo/buscar-centro-trabajo.component';
import { ActivatedRoute} from "@angular/router";
import { BusquedaPlazaComponent } from '../busqueda-plaza/busqueda-plaza.component';
import { TipoFormatoPlazaEnum } from '../../_utils/constants';
import { SharedService } from 'app/core/shared/shared.service';
import { criterioBusqueda } from '../../models/criterioBusqueda.model';

@Component({
  selector: 'minedu-criterio-busqueda-prepub',
  templateUrl: './criterio-busqueda-prepub.component.html',
  styleUrls: ['./criterio-busqueda-prepub.component.scss']
})
export class CriterioBusquedaPrepubComponent implements OnInit {
  form: FormGroup;
  instancias: any[];
  subinstancias: any[];
  request = {
      idInstancia: null,
      idNivelInstancia: null,
      idSubInstancia: null,
      idNivelSubInstancia: null,
      idPlaza: null,
      codigoPlaza: null,
      idCentroTrabajo: null,
      codigoCentroTrabajo: null,
      idEtapaProceso: null,
  };
  plazaFiltroSeleccionado: any;
  selectionDocentes = new SelectionModel<any>(true, []);
  centroTrabajoFiltroSeleccionado: any;
  firstTime = true;
  dataSourceDocentes: PlazasContratacionDocentesDataSource | null;
  paginatorDocentes: MatPaginator;
  selectionBecarios = new SelectionModel<any>(true, []);
  dataSourceBecarios: PlazasContratacionBecariosDataSource | null;
  paginatorBecarios: MatPaginator;
  idEtapaProceso: number;
  tiposCentroTrabajo: any[];
  dialogRef: any;
  @Output() eventSearch = new EventEmitter<any>();
  @Input() idRigimenLaboral?:number = null;
  constructor(
        private formBuilder: FormBuilder,
	private dataService: DataService,
        private materialDialog: MatDialog,
        private route: ActivatedRoute,
        //private sharedService: SharedService
  ) { }

  ngOnInit(): void {
        this.idEtapaProceso 
	      = parseInt(this.route.snapshot.params.id);
      this.buildForm();
      this.loadInstancia();
  }

  buildForm(): void {
      this.form = this.formBuilder.group({
	  idInstancia: [null],
	  idSubinstancia: [null],
	  codigoPlaza: [null],
	  codigoCentroTrabajo: [null],
      });

      this.form.get("codigoPlaza").valueChanges.subscribe((value) => {
	  if (this.plazaFiltroSeleccionado && this.plazaFiltroSeleccionado.codigo_plaza !== value) {
	      this.plazaFiltroSeleccionado = null;
	  }
      });

      this.form.get("codigoCentroTrabajo").valueChanges.subscribe((value) => {
	  if (this.centroTrabajoFiltroSeleccionado && this.centroTrabajoFiltroSeleccionado.codigo_centro_trabajo !== value) {
	      this.centroTrabajoFiltroSeleccionado = null;
	  }
      });

      this.form.get("idInstancia").valueChanges.subscribe((value) => {
	  let idNivelInstancia = null;
	  let idInstancia = null;
	  this.subinstancias = [];
	  this.tiposCentroTrabajo = [];

	  if (value === "-1") {
	      return;
	  }

	  if (this.instancias.length !== 0 && value !== null && value !== undefined) {
	      const data = this.instancias.find((x) => x.id_instancia === value);
	      idNivelInstancia = parseInt(value.split("-")[0]);
	      idInstancia = data.id;
	  }

	  this.form.patchValue({idSubinstancia: "-1",idTipoCentroTrabajo: "-1"});

	  switch (idNivelInstancia) {
	      case NivelInstanciaCodigoEnum.MINEDU: {
		  if (value) { }
		  break;
	      }
	      case NivelInstanciaCodigoEnum.DRE: {
		  if (value) {
		      this.loadSubInstancia(idInstancia, true);
		  }
		  break;
	      }
	  }
      });

      setTimeout((_) => this.handleBuscar());
  }

  loadSubInstancia = (idInstancia, activo) => {
      this.dataService.Contrataciones().getComboSubinstancia(idInstancia, activo).pipe(
	  catchError(() => of([])),
	      map((response: any) => response)
      )
      .subscribe((subinstancias) => {
	  if (subinstancias) {
	      this.subinstancias = subinstancias;
	      this.form.controls["idSubinstancia"].setValue("-1");
	  }
      });
  };

  buscarPlazasContratacion = () => {
      //this.setRequest();
      //if (this.request.codigoPlaza != null) {
	  //const codigoPlaza: string = this.request.codigoPlaza;
	  //if (codigoPlaza.length < 12) {
	      //this.dataService.Message().msgWarning('"CÓDIGO NO VÁLIDO, DEBE INGRESAR UN CÓDIGO DE PLAZA CON DOCE (12) DÍGITOS."', () => {});
	      //return;
	  //}
      //}
//
      //if (this.request.codigoCentroTrabajo != null) {
	  //const codigoCentroTrabajo: string = this.request.codigoCentroTrabajo;
	  //if (codigoCentroTrabajo.length < 7) {
	      //this.dataService.Message().msgWarning('"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN CÓDIGO CON SIETE (7) DÍGITOS."', () => {} );
	      //return;
	  //}
      //}
      //this.buscarPlazasContratacionDocentes();
      //this.buscarPlazasContratacionBecarios();
      //this.firstTime = false;
  };

  //private buscarPlazasContratacionDocentes = () => {
      //this.selectionDocentes = new SelectionModel<any>(true, []);
      //this.dataSourceDocentes.load(this.request, this.paginatorDocentes.pageIndex + 1, this.paginatorDocentes.pageSize, this.firstTime);
  //};
//
  //private buscarPlazasContratacionBecarios = () => {
      //this.selectionBecarios = new SelectionModel<any>(true, []);
      //this.dataSourceBecarios.load(this.request, this.paginatorBecarios.pageIndex + 1, this.paginatorBecarios.pageSize);
  //};

  setRequest(): void {
      const formulario = this.form.getRawValue();

      let partesInstancia = formulario.idInstancia && formulario.idInstancia !== "-1" ? formulario.idInstancia.split("-") : [];
      let partesSubInstancia = formulario.idSubinstancia && formulario.idSubinstancia !== "-1" ? formulario.idSubinstancia.split("-") : [];
      let idNivelInstancia = partesInstancia[0] ? parseInt(partesInstancia[0]) : partesInstancia[0];
      let idInstancia = partesInstancia[1] ? parseInt(partesInstancia[1]) : partesInstancia[1];
      let idNivelSubInstancia = partesSubInstancia[0] ? parseInt(partesSubInstancia[0]) : partesSubInstancia[0];
      let idSubInstancia = partesSubInstancia[1] ? parseInt(partesSubInstancia[1]) : partesSubInstancia[1];
      let idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.id_plaza : null;
      let codigoPlaza = formulario.codigoPlaza;
      let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
      let codigoCentroTrabajo = formulario.codigoCentroTrabajo;

      this.request = {
	  idEtapaProceso: this.idEtapaProceso,
	  idInstancia: idInstancia,
	  idNivelInstancia: idNivelInstancia,
	  idSubInstancia: idSubInstancia,
	  idNivelSubInstancia: idNivelSubInstancia,
	  idPlaza: idPlaza,
	  codigoPlaza: codigoPlaza,
	  idCentroTrabajo: idCentroTrabajo,
	  codigoCentroTrabajo: codigoCentroTrabajo,
      };
  }

  busquedaCentroTrabajoPersonalizada = () => {
      this.dialogRef = this.materialDialog.open(
	  BuscarCentroTrabajoComponent,
	  {
	      panelClass: "buscar-centro-trabajo-dialog",
	      width: "1300px",
	      disableClose: true,
	      data: {
		  action: "requerimiento",
		  idEtapaProceso : +this.route.snapshot.params.id,
		  codigoSede : '000000'//this.currentSession.codigoSede, // prepublicacion 000000
	      },
	  }
      );

      this.dialogRef.afterClosed().subscribe((result) => {
	  if (result != null) {
	      this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
	      this.centroTrabajoFiltroSeleccionado = {
		  ...result.centroTrabajo,
	      };
	  }
      });
  };
  busquedaPlazaPersonalizada(): void {
      this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
	  panelClass: "buscar-plaza-dialog",
	  width: "1000px",
	  disableClose: true,
	  data: {
	      action: "busqueda",
	      tipoFormato: TipoFormatoPlazaEnum.GENERAL,
	      idEtapaProceso : this.idEtapaProceso,
	      idRegimenLaboral : this.idRigimenLaboral
	  },
      });

      this.dialogRef.afterClosed().subscribe((result) => {
	  if (result != null) {
	      this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
	      this.plazaFiltroSeleccionado = { ...result.plaza };
	  }
      });
  }

  handleLimpiar(): void {
      this.plazaFiltroSeleccionado = null;
      this.centroTrabajoFiltroSeleccionado = null;
      this.resetForm();
  }

  resetForm = () => {
      this.form.reset();
  };

  handleBuscar = () => {
        this.setRequest();
        if (this.request.codigoPlaza) {
            const codigoPlaza: string = this.request.codigoPlaza;
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (this.request.codigoCentroTrabajo) {
            const codigoCentroTrabajo: string = this.request.codigoCentroTrabajo;
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }

      this.eventSearch.emit(this.request);
  };

  loadInstancia = () => {
      this.dataService
      .Contrataciones()
      .getComboInstancia(true)
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
}

export class PlazasContratacionDocentesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    public totalregistroglobal=0;

    constructor(private dataService: DataService) {
	super();
    }

    load(data: any, pageIndex, pageSize, firstTime = false): void {
	this.dataService.Spinner().show("sp6");
	this._loadingChange.next(false);
	if (data.idEtapaProceso === null) {
	    this._loadingChange.next(false);
	    this._dataChange.next([]);
	} else {
	    data.esBecario = false;

	    this.dataService.Contrataciones().buscarPlazasContratacionPaginado(data, pageIndex, pageSize).pipe(
		catchError(() => of([])),
		    finalize(() => {
		    this._loadingChange.next(false);
		    this.dataService.Spinner().hide("sp6");
		})
	    )
	    .subscribe((plazasContratacion: any) => {
		this._dataChange.next(plazasContratacion || []);
		this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
		console.log("DataSource plazasContratacion response: ", plazasContratacion);
		this.totalregistroglobal += this.totalregistro; // *******************

		if (((plazasContratacion || []).length === 0 || this.totalregistroglobal === 0) && !firstTime) {
		    // this.dataService.Message().msgWarning('"NO SE ENCONTRÓ PLAZAS DE CONTRATACIÓN DOCENTE PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
		    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
		}
	    });
	}
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
	return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
	this._dataChange.complete();
	this._loadingChange.complete();
    }

    get dataTotal(): any {
	return this.totalregistro;
    }

    get data(): any {
	return this._dataChange.value || [];
    }   

}

export class PlazasContratacionBecariosDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    public totalregistroglobal=0;


    constructor(private dataService: DataService) {
	super();
    }

    load(data: any, pageIndex, pageSize): void {
	this.dataService.Spinner().show("sp6");
	this._loadingChange.next(false);
	if (data.idEtapaProceso === null) {
	    this._loadingChange.next(false);
	    this._dataChange.next([]);
	} else {
	    data.esBecario = true;

	    this.dataService.Contrataciones().buscarPlazasContratacionPaginado(data, pageIndex, pageSize).pipe(
		catchError(() => of([])),
		    finalize(() => {
		    this._loadingChange.next(false);
		    this.dataService.Spinner().hide("sp6");
		})
	    )
	    .subscribe((plazasContratacion: any) => {
		this._dataChange.next(plazasContratacion || []);
		this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;

		this.totalregistroglobal += this.totalregistro; // *******************

		// if ((plazasContratacion || []).length === 0 || this.totalregistroglobal === 0) {
		//     this.dataService.Message().msgWarning('"NO SE ENCONTRÓ PLAZAS DE BECARIOS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
		// }
	    });
	}
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
	return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
	this._dataChange.complete();
	this._loadingChange.complete();
    }

    get dataTotal(): any {
	return this.totalregistro;
    }

    get data(): any {
	return this._dataChange.value || [];
    }
}
