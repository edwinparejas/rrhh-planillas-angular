import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { DatePipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { descargarExcel } from "app/core/utility/functions";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { AtencionInfoComponent } from "./atencion/atencion-info/atencion-info.component";
import { BuscadorPersonaComponent } from "./components/buscador-persona/buscador-persona.component";
import { RegistroInfoComponent } from "./registro/registro-info/registro-info.component";
import { BuscarPlazaComponent } from "./components/buscar-plaza/buscar-plaza.component";
import { BuscarCentroTrabajoComponent } from "./components/buscar-centro-trabajo/buscar-centro-trabajo.component";

@Component({
  selector: 'minedu-abandono-cargo',
  templateUrl: './abandono-cargo.component.html',
  styleUrls: ['./abandono-cargo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})

export class AbandonoCargoComponent implements OnInit {

  form: FormGroup;
  now = new Date();
  untilDate = new Date();
  minDate = new Date((new Date).getFullYear(), 0, 1);
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31);
  comboLists = {
    listAnio: [],
    listMotivoAccion: [],
    listMandatoJudicial: [],
    listEstado: [],
    listTipoDocumento: [],
    listRegimenLaboral: [],
    listTipoCargos: [],
    listCargos: [],
    listDesempenioLaboral: []
  };
  displayedColumns: string[] = [
    'seleccione',
    'numeroSolicitud',
    'fechaRegistro',
    'tipoReporte',
    'codigoPlaza',
    'numeroDocumentoIdentidad',
    'apellidosNombres',
    'fechaReporte',
    'estado',
    'opciones'
  ];
  
  dialogRef: any;
  dataSource: AbandonoCargoDataSource | null;
  dsDirecto: AtencionDirectoDataSource | null;
  selection = new SelectionModel < any > (true, []);
  selectionDirecto = new SelectionModel < any > (true, []);
   @ ViewChild(MatPaginator, {
      static: true
  })
  paginator: MatPaginator;
  @ ViewChild(MatPaginator, {
    static: true
  })
  paginatorDirecto: MatPaginator;
  
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadCombos();
    this.defaultGrid();

    setTimeout(() => {
        this.handleGrid()
       }, 1500);
  }
  
  ngAfterViewInit() {
    this.paginator.page.pipe(tap(() => this.handleGrid())).subscribe();
    this.paginatorDirecto.page.pipe(tap(()=> this.handleGridDirecto())).subscribe();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
        anio: [this.now.getFullYear(), Validators.required],
        anioDt: [this.now],
        idMandatoJudicial: [-1],
        idMotivoAccion: [-1],
        idTipoDocumento: [-1],
        numeroDocumentoIdentidad: [null],
        fechaInicio: [null],
        fechaFin: [null],
        codigoPlaza: [null],
        codigoModular: [null],
        idEstado: [-1],
        idRegimenLaboral: [-1],
        idTipoCargo: [-1],
        idCargo: [-1],
        idAreaDesempenioLaboral: [-1]
    });

    this.form.get("anioDt").valueChanges.subscribe(value => {
        if (value) {
            this.onChangeMinMaxDate();
        }
    });
  }
  
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  
  isAllSelectedDirect(){
    const numSelected = this.selectionDirecto.selected.length;
    const numRows = this.dsDirecto.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
        ? this.selection.clear()
        : this.dataSource.data.forEach((row) => this.selection.select(row));
  }
  
  masterToggleDirect() {
    this.isAllSelected()
        ? this.selectionDirecto.clear()
        : this.dsDirecto.data.forEach((row) => this.selectionDirecto.select(row));
  }

  checkboxLabel(row): string {
    if (!row) {
        return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }
  
  checkboxLabelDirect(row): string {
    if (!row) {
        return `${this.isAllSelectedDirect() ? "select" : "deselect"} all`;
    }
    return `${this.selectionDirecto.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }
  
  buildPaginators(paginator: MatPaginator): void {
    paginator.showFirstLastButtons = true;
    paginator._intl.itemsPerPageLabel = "Registros por página";
    paginator._intl.nextPageLabel = "Siguiente página";
    paginator._intl.previousPageLabel = "Página anterior";
    paginator._intl.firstPageLabel = "Primera página";
    paginator._intl.lastPageLabel = "Última página";
    paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
            return `0 de ${length}`;
        }
        const length2 = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
        return `${startIndex + 1} – ${endIndex} de ${length2}`;
    }
  }
  
  buildPaginatorsDirect(paginatorDirecto: MatPaginator): void {
    paginatorDirecto.showFirstLastButtons = true;
    paginatorDirecto._intl.itemsPerPageLabel = "Registros por página";
    paginatorDirecto._intl.nextPageLabel = "Siguiente página";
    paginatorDirecto._intl.previousPageLabel = "Página anterior";
    paginatorDirecto._intl.firstPageLabel = "Primera página";
    paginatorDirecto._intl.lastPageLabel = "Última página";
    paginatorDirecto._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
            return `0 de ${length}`;
        }
        const length2 = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
        return `${startIndex + 1} – ${endIndex} de ${length2}`;
    }
  }
  
  onChangeMinMaxDate() {
    const anio = new Date(this.form.get('anioDt').value).getFullYear();
    this.minDate = new Date(anio, 0, 1);
    this.untilDate = new Date(anio, 11, 31);
  }

  onKeyDownNumeroDocumento(e: any){
    if(e.key == 'Backspace')
    {
    if(this.form.get('numeroDocumentoIdentidad').value)
    {
        return true;
    }
    }
  }
  
  onKeyUpNumeroDocumento(e: any){
    if(!Number(this.form.get('numeroDocumentoIdentidad').value))
    {
    this.form.get('numeroDocumentoIdentidad').setValue(null);
    }

    if(e.key == 'Enter')
    {
    this.buscarNumeroDocumentoIdentidad();
    }
  }
  
  onKeyPressNumeroDocumento(e: any): boolean {
    let _idTipoDocumento = this.form.get('idTipoDocumento').value;
    let tipoDocumentoSelect = this.comboLists.listTipoDocumento.find(m => m.id_catalogo_item == _idTipoDocumento);
    if (tipoDocumentoSelect.codigo_catalogo_item == 1) {
        //------------ DNI
        const reg = /^\d+$/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
            e.preventDefault();
            return false;
        }
    } else {
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
  
  clearFormField(event: any, name: string) {
    this.form.get(name).setValue(-1);
    event.stopPropagation();
  }
  
  selectRegimenLaboral(event) {
    this.form.get('idAreaDesempenioLaboral').setValue(-1);
    this.form.get('idTipoCargo').setValue(-1);
    this.form.get('idCargo').setValue(-1);
    this.loadComboDesempenio();
    this.loadComboMotivoAccion();
  }
  
  selectAreaDesempenioLaboral(event) {
    this.form.get('idTipoCargo').setValue(-1);
    this.form.get('idCargo').setValue(-1);
    this.loadComboTipoCargo();
  }
  
  selectTipoCargo(event) {
    this.form.get('idCargo').setValue(-1);
    this.loadComboCargo();
  }
  
  loadCombos = () => {
    this.loadComboMandatoJudicial();
    this.loadComboRegimenLaboral();
    this.loadComboCargo();
    this.loadComboTipoDocumento();
    this.loadComboEstado();
    this.loadComboDesempenio();
    this.loadComboMotivoAccion();
    this.loadComboTipoCargo();
  }
  
  loadComboMotivoAccion() {
    let request = {
        codigoAccion: 53,
        codigoGrupoAccion: 13,
        idRegimenLaboral: this.form.get('idRegimenLaboral').value
    }

    this.dataService.OtrasFuncionalidades().getMotivoAccion(request).subscribe(
        (response) => {
        this.comboLists.listMotivoAccion = response;
        this.comboLists.listMotivoAccion.unshift({
          idMotivoAccion: -1,
          descripcionMotivoAccion: '--TODOS--'
        });
    },
        (error: HttpErrorResponse) => {
        console.log(error);
    })
  }
  
  loadComboTipoDocumento() {
    let request = {
        codigoCatalogo: 6,
        Inactivo: false
    }

    this.dataService.OtrasFuncionalidades().getCatalogoItem(request).subscribe(
        (response) => {
        this.comboLists.listTipoDocumento = response;
        this.comboLists.listTipoDocumento.unshift({
            id_catalogo_item: -1,
            descripcion_catalogo_item: '--TODOS--'
        });
    },
        (error: HttpErrorResponse) => {
        console.log(error);
    })
  }
  
  loadComboTipoCargo() {
    let request = {
        codigoCatalogo: 22,
        idAreaDesempenioLaboral: this.form.get('idAreaDesempenioLaboral').value
    }

    this.dataService.OtrasFuncionalidades().getComboTipoCargo(request).subscribe(
        (response) => {
        this.comboLists.listTipoCargos = response;
        this.comboLists.listTipoCargos.unshift({
            id_catalogo_item: -1,
            descripcion_catalogo_item: '--TODOS--'
        });
    },
        (error: HttpErrorResponse) => {
        console.log(error);
    })
  }
  
  loadComboCargo() {
    let request = {
        idTipoCargo: this.form.get('idTipoCargo').value
    }

    this.dataService.OtrasFuncionalidades().getComboCargo(request).subscribe(
        (response) => {
        this.comboLists.listCargos = response;
        this.comboLists.listCargos.unshift({
            idCargo: -1,
            descripcionCargo: '--TODOS--'
        });
    },
        (error: HttpErrorResponse) => {
        console.log(error);
    })
  }
  
  loadComboEstado() {
    let request = {
        codigoCatalogo: 220
    }

    this.dataService.OtrasFuncionalidades().getCatalogoItem(request).subscribe(
        (response) => {
        this.comboLists.listEstado = response;
        this.comboLists.listEstado.unshift({
            id_catalogo_item: -1,
            descripcion_catalogo_item: '--TODOS--'
        });
    },
        (error: HttpErrorResponse) => {
        console.log(error);
    })
  }
  
  loadComboRegimenLaboral() {
    const usuario = this.dataService.Storage().getPassportRolSelected();

    let request = {
        SinFiltro: true,
        codigoRol: usuario.CODIGO_ROL,
        codigoTipoSede: usuario.CODIGO_TIPO_SEDE,
        codigoCentroTrabajo: usuario.CODIGO_SEDE
    }

    this.dataService.OtrasFuncionalidades().getComboRegimenLaboral(request).subscribe(
        (response) => {
        this.comboLists.listRegimenLaboral = response;
        this.comboLists.listRegimenLaboral.unshift({
            idRegimenLaboral: -1,
            descripcionRegimenLaboral: '--TODOS--'
        });
    },
        (error: HttpErrorResponse) => {
        console.log(error);
    });
  }
  
  loadComboDesempenio() {
    let request = {
        idRegimenLaboral: this.form.get('idRegimenLaboral').value
    }

    this.dataService.OtrasFuncionalidades().getComboAreaDesempenio(request).subscribe(
        (response) => {
        this.comboLists.listDesempenioLaboral = response;
        this.comboLists.listDesempenioLaboral.unshift({
            idAreaDesempenioLaboral: -1,
            descripcionAreaDesempenioLaboral: '--TODOS--'
        });
    },
        (error: HttpErrorResponse) => {
        console.log(error);
    });
  }

  loadComboMandatoJudicial() {
    let dataMandatoJudicial = [{
      "idMandatoJudicial": 1,
      "descripcionMandatoJudicial": "SI"
    },{
      "idMandatoJudicial": 0,
      "descripcionMandatoJudicial": "NO"
    }];

    this.comboLists.listMandatoJudicial = dataMandatoJudicial;
    this.comboLists.listMandatoJudicial.unshift({
      idMandatoJudicial: -1,
      descripcionMandatoJudicial: '--TODOS--'
    });
    
  }

  defaultGrid() {
    this.dataSource = new AbandonoCargoDataSource(this.dataService);
    this.dsDirecto = new AtencionDirectoDataSource(this.dataService);
    this.buildPaginators(this.paginator);
    this.buildPaginatorsDirect(this.paginatorDirecto);
  }

  busquedaCodigoPlaza(){ 
    this.dialogRef = this.materialDialog.open(BuscarPlazaComponent,{
    panelClass: 'buscar-plaza-form-dialog',
    disableClose: true,
    data: {
      idRegimenLaboral: this.form.get('idRegimenLaboral').value,
      codigoPlaza: this.form.get('codigoPlaza').value
    }
    });

    this.dialogRef.afterClosed()
    .subscribe((response: any) => {
        if (!response) {
        return;
        }

        this.form.patchValue({
          codigoPlaza: response.codigoPlaza
        });
    });
  }

  busquedaCodigoModular(){ 
    this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent,{
    panelClass: 'buscar-centro-trabajo',
    disableClose: true,
    data: {
      idRegimenLaboral: this.form.get('idRegimenLaboral').value,
      codigoPlaza: this.form.get('codigoPlaza').value
    }
    });

    this.dialogRef.afterClosed()
    .subscribe((response: any) => {
        if (!response) {
        return;
        }

        this.form.patchValue({
          codigoModular: response.centroTrabajo
        });
    });
  }

  buscarNumeroDocumentoIdentidad(){
    if(this.form.get('numeroDocumentoIdentidad').value){
        this.dataService.Spinner().show('sp6');
        this.dataService.OtrasFuncionalidades().getPersonaTransversal(this.form.value, 1, 1).pipe(
        catchError(() => of([])),
        finalize(() => {
            this.dataService.Spinner().hide('sp6');
        })
        ).subscribe((response: any) => {
        let totalregistro = ((response || []).length === 0) ? 0 : response[0].totalRegistro;
        if(totalregistro == 1)
        {
            this.form.patchValue({ 
                numeroDocumentoIdentidad: response[0].numeroDocumentoIdentidad
            });
        }
        else
        {
            let idTipoDoc = this.form.get('idTipoDocumento').value;
            let numDocIde = this.form.get('numeroDocumentoIdentidad').value;
            this.buscarPersonaDialog(idTipoDoc, numDocIde);
        }
        });
    }else{
        let idTipoDoc = this.form.get('idTipoDocumento').value;
        let numDocIde = this.form.get('numeroDocumentoIdentidad').value;
        this.buscarPersonaDialog(idTipoDoc, numDocIde);
    }
  }

  buscarPersonaDialog(idTipoDocumento: number, numeroDocumentoIdentidad: string)
  {
    this.dialogRef = this.materialDialog.open(BuscadorPersonaComponent,{
    panelClass: 'minedu-buscador-persona',
    disableClose: true,
    data: {
        idTipoDocumentoIdentidad: idTipoDocumento,
        numeroDocumentoIdentidad: numeroDocumentoIdentidad
    }
    });

    this.dialogRef.afterClosed()
    .subscribe((response: any) => {
        if (!response) {
        return;
        }

        this.form.patchValue({ 
        idTipoDocumento: response.persona.idTipoDocumentoIdentidad,
        numeroDocumentoIdentidad: response.persona.numeroDocumentoIdentidad
        });
    });
  }

  handleLimpiar(): void {
    this.form.patchValue({
        anio: this.now.getFullYear(),
        anioDt: this.now,
        idMotivoAccion: -1,
        idTipoDocumento: -1,
        numeroDocumentoIdentidad: null,
        fechaInicio: null,
        fechaFin: null,
        codigoPlaza: null,
        idEstado: -1,
        idRegimenLaboral: -1,
        idTipoCargo: -1,
        idCargo: -1
    })
    this.handleGrid();
  }

  handleGrid(autoSearch: boolean = false) {
    const params = this.form.getRawValue();
    params.fechaInicio = this.datePipe.transform(params.fechaInicio, "yyyy-MM-dd");
    params.fechaFin = this.datePipe.transform(params.fechaFin, "yyyy-MM-dd")
    this.dataSource.load(params, (this.paginator.pageIndex + 1), this.paginator.pageSize, autoSearch);
  }

  handleGridDirecto(autoSearch: boolean = false) {
    const params = this.form.getRawValue();
    params.fechaInicio = this.datePipe.transform(params.fechaInicio, "yyyy-MM-dd");
    params.fechaFin = this.datePipe.transform(params.fechaFin, "yyyy-MM-dd")
    this.dsDirecto.load(params, (this.paginatorDirecto.pageIndex + 1), this.paginatorDirecto.pageSize, autoSearch);
  }

  handleInformacionSolicitud(row: any) {
    this.dialogRef = this.materialDialog.open(AtencionInfoComponent, {
        panelClass: 'minedu-reporte-info',
        disableClose: true,
        data: {
            idAtencionReporte: row.idAtencionReporte
        }
    });
  }

  handleInformacionDirecto(row: any) {
    this.dialogRef = this.materialDialog.open(RegistroInfoComponent, {
        panelClass: 'minedu-registro-info',
        disableClose: true,
        data: {
            idAtencionReporte: row.idAtencionReporte
        }
    });
  }

  handleNuevoDirecto() {
    this.router.navigate(['ayni/personal/acciones/otrasacciones/abandonocargootros/nuevo-registro']);
  }

  handleModificar(row: any) {
    this.router.navigate(['ayni/personal/acciones/otrasacciones/abandonocargootros/modificar-atencion/' + row.idAtencionReporte]);
  }

  handleModificarDirecto(row: any) {
    this.router.navigate(['ayni/personal/acciones/otrasacciones/abandonocargootros/modificar-registro/' + row.idAtencionReporte]);
  }

  handleAtender(row: any, i: number) {
    this.router.navigate(['ayni/personal/acciones/otrasacciones/abandonocargootros/atender/' + row.idAtencionReporte]);
  }

  handleEnviarReporteMasivo() {
      //enviar
  }

  handleExportar() {
    this.dataService.Util().msgConfirm('¿Está seguro que desea exportar la información?', () => {
      
      this.dataService.Spinner().show("sp6");
      let request = this.form.getRawValue();

      this.dataService.OtrasFuncionalidades().getExportarAtencionReporteSolicitud(request).pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Util().msgWarning(error.error.messages[0]);
          return of(null);
        }),
        finalize(() => {
            this.dataService.Spinner().hide("sp6");
        })).subscribe((response: any) => {
            if (response) {
              descargarExcel(response, 'atencionSolicitud.xlsx');
            } 
        });
    }, () => {
      return;
    });
  }

  //Send 'acciones grabadas' row x row
  handleReincorporar(row) {
    this.router.navigate(['ayni/personal/acciones/otrasacciones/abandonocargootros/reincorporar-atencion/' + row.idAtencionReporte + '/0']);
  }

  handleReincorporarDirecto(row) {
    this.router.navigate(['ayni/personal/acciones/otrasacciones/abandonocargootros/reincorporar-registro/' + row.idAtencionReporte + '/0']);
  }

  onTabClick(event) {
    if (event.index == 0) {
      this.handleGrid();
    }else{
      this.handleGridDirecto();
    }
  }
}
export class AbandonoCargoDataSource extends DataSource < any > {
  private _dataChange = new BehaviorSubject < any > ([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject < boolean > (false);
  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex: number, pageSize: number, autoSearch: boolean) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    this.dataService.OtrasFuncionalidades().getAtencionReporteSolicitud(data, pageIndex, pageSize).pipe(
        catchError((error: HttpErrorResponse) => {
            if (!autoSearch)
                this.dataService.Util().msgWarning(error.error.messages[0]);
            return of(null);
        }),
        finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide("sp6");
        })).subscribe((response: any) => {
            if (response && (response || []).length > 0) {
                this._totalRows = (response[0] || [{
                            totalRegistro: 0
                        }
                    ]).totalRegistro;
                this._dataChange.next(response || []);
            } else {
                this._totalRows = 0;
                this._dataChange.next([]);
            }
        });
  }
    connect(collectionViewer: CollectionViewer): Observable < any[] | readonly any[] > {
        return this._dataChange.asObservable();
    }
    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }
    get dataTotal(): any {
        return this._totalRows;
    }
    get data(): any {
        return this._dataChange.value || [];
    }
}
export class AtencionDirectoDataSource extends DataSource < any > {
  private _dataChange = new BehaviorSubject < any > ([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject < boolean > (false);
  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex: number, pageSize: number, autoSearch: boolean) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    this.dataService.OtrasFuncionalidades().getAtencionReporteDirecto(data, pageIndex, pageSize).pipe(
        catchError((error: HttpErrorResponse) => {
            if (!autoSearch)
                this.dataService.Util().msgWarning(error.error.messages[0]);
            return of(null);
        }),
        finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide("sp6");
        })).subscribe((response: any) => {
            if (response && (response || []).length > 0) {
                this._totalRows = (response[0] || [{
                            totalRegistro: 0
                        }
                    ]).totalRegistro;
                this._dataChange.next(response || []);
            } else {
                this._totalRows = 0;
                this._dataChange.next([]);
            }
        });
  }
    connect(collectionViewer: CollectionViewer): Observable < any[] | readonly any[] > {
        return this._dataChange.asObservable();
    }
    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }
    get dataTotal(): any {
        return this._totalRows;
    }
    get data(): any {
        return this._dataChange.value || [];
    }
}