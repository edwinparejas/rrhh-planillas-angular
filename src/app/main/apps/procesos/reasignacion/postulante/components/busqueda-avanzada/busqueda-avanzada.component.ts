import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { OpcionFiltro, ResultadoOperacionEnum } from '../../../models/reasignacion.model';
import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { TablaPermisos } from 'app/core/model/types';
import { SecurityModel } from 'app/core/model/security/security.model';
import { tipoDocumento } from '../../../../../asistencia/consolidado-aprobacion/utils/constant';

@Component({
  selector: 'minedu-busqueda-avanzada',
  templateUrl: './busqueda-avanzada.component.html',
  styleUrls: ['./busqueda-avanzada.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BusquedaAvanzadaComponent implements OnInit {

  dataSource: ServidorPublicoDataSource | null;
  form: FormGroup;
  lading: false;
  export = false;
  encontrado = false;
  isMobile = false;
  opcionFiltro: OpcionFiltro = new OpcionFiltro();
  currentSession: SecurityModel = new SecurityModel();
  selection = new SelectionModel<any>(true, []);
  seleccionado: any = null;

  displayedColumns: string[] = [
    'select',
    'documento',
    'apellido_nombre',
    'fecha_nacimiento',
    'iged',
    'centro_trabajo',
    'regimen_laboral',
    'condicion_laboral',
    'estado_actual'
  ];

  comboLists = {
    listTipoDocumento: [],
  }

  request = {
    tipo_documeno: '',
    numero_documento: '',
    primer_apellido: '',
    segundo_apellido: '',
    nombres: ''
  }
  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false
  };

  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
      return true;
    } else {
      return false;
    }
  }

  constructor(
    public matDialogRef: MatDialogRef<BusquedaAvanzadaComponent>,
    private dataService: DataService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.handleResponsive();
    this.buildSeguridad();
    this.loadTipoDocumento();
    this.dataSource = new ServidorPublicoDataSource(this.dataService);
    this.buscarServidorPublico(true);
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }

  buildSeguridad = () => {
    /*
    this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
    this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
    this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoEnviar = true;
    */
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }


  buildForm(): void {
    this.form = this.formBuilder.group({
      tipo_documento: null,
      numero_documento: null,
      primer_apellido: null,
      segundo_apellido: null,
      nombres: null
    });
  }

  setRequest(): void {
    this.request = {
      tipo_documeno: this.form.get('tipo_documento').value,
      numero_documento: this.form.get('numero_documento').value,
      primer_apellido: this.form.get('primer_apellido').value,
      segundo_apellido: this.form.get('segundo_apellido').value,
      nombres: this.form.get('nombres').value
    };
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    
  }

  resetForm = () => {
    this.form.reset();
    this.form.get('tipo_documento').setValue("");
    this.form.get('numero_documento').setValue("");
    this.form.get('primer_apellido').setValue("");
    this.form.get('segundo_apellido').setValue("");
    this.form.get('nombres').setValue("");
  }
  /*Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara.*/
  masterToggle = () => {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
  /*Si el número de elementos seleccionados coincide con el número total de filas.*/
  isAllSelected = (): boolean => {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  /* La etiqueta de la casilla de verificación en la fila pasada */
  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.registro + 1}`;
  }

  handleLimpiar(): void {
    this.resetForm();
  }

  loadTipoDocumento = () => {
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
  anchoDocumento = (event) => {
    switch (event.value) {
      case "D.N.I.":
        this.form.get('numero_documento').setValue("");
        document.getElementById('numero_documento').setAttribute("maxlength", "8");
        break;
      case "PASAPORTE":
        this.form.get('numero_documento').setValue("");
        document.getElementById('numero_documento').setAttribute("maxlength", "12");
        break;
      case "CARNET DE EXTRANJERIA":
        this.form.get('numero_documento').setValue("");
        document.getElementById('numero_documento').setAttribute("maxlength", "15");
        break;
    }
  }


  handleSelect = () => {
    let select: any = this.selection.selected[0];
    if (select.length === 1) {
      console.log(this.selection.selected);
      console.log(select.length);
      console.log(select);
      console.log(select.tipo_documento);
      console.log(select.numero_documento);
      // this.matDialogRef.close({ servidorPublico: this.seleccionado });
    } else if (select.length === 0) {
      this.dataService.Message().msgWarning('No a seleccionado ningun registro.', () => { });
      return
    } else if (select.length > 1) {
      this.dataService.Message().msgWarning('Debe de seleccionar un solo registro.', () => { });
      return
    }
  }

  handleCancel = () => {
    this.matDialogRef.close({
      encontrado: this.encontrado
    });
  }

  handleBuscar(): void {
    this.buscarServidorPublico(false);
  }

  buscarServidorPublico = (fistTime: boolean = false) => {
    this.setRequest();
    if (fistTime) {
      this.dataSource.load(this.request, true);
    } else {
      this.dataSource.load(
        this.request, false
      );
    }
    this.dataSource.load(this.request);
  }

}

export class ServidorPublicoDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, firsTime = false): void {
    this._loadingChange.next(false);
    if (!firsTime) this.dataService.Spinner().show('sp6');
    this.dataService
      .Reasignaciones()
      .getListarServidoresPublico(data)
      .pipe(
        catchError(() => of()),
        finalize(() => {
          this._loadingChange.next(false);
          if (!firsTime) this.dataService.Spinner().hide('sp6');
        })
      )
      .subscribe((response: any) => {
        if (response) {
          this._dataChange.next(response);
          // this._loadingChange.next(false)

          // this.totalregistro = (response.length === 0) ? 0 : response.data[0].totalRegistro;
          if (response.length === 0) {
            this.dataService
              .Message()
              .msgWarning(
                'No se encontró información de la(s) servidor(es) para los criterios de búsqueda ingresados.',
                () => { });
          };
        }
        else if (response === ResultadoOperacionEnum.NotFound) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
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
  get dataTotal(): any {
    return this.totalregistro;
  }
  get data(): any {
    return this._dataChange.value || [];
  }
}