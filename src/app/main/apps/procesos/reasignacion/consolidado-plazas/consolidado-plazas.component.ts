import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { OpcionFiltro } from 'app/main/apps/licencias/models/licencia.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TablaPermisos } from 'app/core/model/types';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'minedu-consolidado-plazas',
  templateUrl: './consolidado-plazas.component.html',
  styleUrls: ['./consolidado-plazas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ConsolidadoPlazasComponent implements OnInit {
  form: FormGroup;
  lading: false;
  opcionFiltro: OpcionFiltro = new OpcionFiltro();
  selection = new SelectionModel<any>(true, []);
  currentSession: SecurityModel = new SecurityModel();

  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false
  };

  comboLists = {
    listInstancia: [],
    listSubInstancia: [],
    listEstado: [],
  };

  request = {
    idInstancia: '',
    idSubInstancia: '',
    idEstado: ''
  };

  displayedColumns: string[] = [
    'registro',
    'instancia',
    'sub_instancia',
    'estado',
    'fecha_validacion',
    'fecha_aprobacion',
    'fecha_rechazo',
    'acciones'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadInstancia();
    this.loadSubInstancia();
    this.loadEstado();
  }

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

  setRequest = () => {
    this.request = {
      idInstancia: this.form.get('idInstancia').value,
      idSubInstancia: this.form.get('idSubInstancia').value,
      idEstado: this.form.get('idEstado').value
    }
  }

  resetReform = () => { 
    this.form.reset();
    this.form.get('idInstancia').setValue("");
    this.form.get('idSubInstancia').setValue("");
    this.form.get('idEstado').setValue("");
  }

  handleLimpiar() : void{
    this.resetReform();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      idInstancia: [null],
      idSubInstancia: [null],
      idEstado: null
    });
  }
  buildSeguridad = () => {
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  loadInstancia = () => {
    this.dataService.Reasignaciones()
      .getComboInstancia()
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
          this.comboLists.listInstancia = data;
          this.comboLists.listInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  }

  loadSubInstancia = () => {
    this.dataService.Reasignaciones()
      .getComboSubInstancia()
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
          this.comboLists.listSubInstancia = data;
          this.comboLists.listSubInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  }

  loadEstado = () => {
    this.dataService.Reasignaciones()
      .getComboEstado()
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
          this.comboLists.listEstado = data;
          this.comboLists.listEstado.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  }

  handleRetornar(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
