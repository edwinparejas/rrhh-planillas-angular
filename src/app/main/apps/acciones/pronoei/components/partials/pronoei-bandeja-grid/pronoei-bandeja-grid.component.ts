import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { GestionPronoeiDataSource } from './pronoei-bandeja-grid.datasource';
import { DataService } from '../../../../../../../core/data/data.service';
import { FormFilterValuesService } from '../../../services/form-filter-values.service';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, tap, catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { InformacionCompletaPopupComponent } from '../../popups/informacion-completa-popup/informacion-completa-popup.component';
import { Router } from '@angular/router';
import { GenerarProyectoComponent } from '../../popups/generar-proyecto/generar-proyecto.component';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { PronoeiCatalogoDataService } from '../../../services/pronoei-catalogo-data.service';
import { IMaestroPermisoResponse } from '../../../interfaces/maestro-permiso.interface';

@Component({
  selector: 'minedu-pronoei-bandeja-grid',
  templateUrl: './pronoei-bandeja-grid.component.html',
  styleUrls: ['./pronoei-bandeja-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class PronoeiBandejaGridComponent implements OnInit, OnDestroy, AfterViewInit {


  dataSource: GestionPronoeiDataSource | null;

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  displayedColumns: string[] = [
    'seleccione',
    'accion',
    'documento',
    'apellidos_nombres',
    'codigo_modular',
    'centro_trabajo',
    'zona',
    'fecha_inicio',
    'fecha_fin',
    'estado',
    'situacion_resolucion',
    'acciones'
  ];


  isSelectPricipal = false;

  filters$: Observable<any> | null;

  selection = new SelectionModel<any>(true, []);

  private _unsubscribeAll = new Subject<any>();
  
  maestroPermiso$: Observable<IMaestroPermisoResponse>;

  constructor(
    private materialDialog: MatDialog,
    private dataService: DataService,
    private formFilterValuesService: FormFilterValuesService,
    private pronoeiCatalogoDataService: PronoeiCatalogoDataService,
    private router: Router
  ) {

    this.dataSource = new GestionPronoeiDataSource(this.dataService);
    this.maestroPermiso$ = this.pronoeiCatalogoDataService.maestroPermiso$;
    this.loadFilters();
    // this.selection.selected
  }

  ngOnInit(): void {
    this.setConfPaginator();
    this.filters$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(filter => {
        if (filter) {

          this.loadGrid(filter);
        }
      });


    this.selection.changed
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(x => {
        this.formFilterValuesService.setSelectedRowsSource(x.source.selected);
      })
  }

  ngAfterViewInit(): void {
    this.paginator.page
      .pipe(
        tap(() => this.loadGridInPaginator())
      )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }



  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }


  masterToggle() {

    if (this.isSelectPricipal) {
      this.selection.clear();
      this.isSelectPricipal = false;
    } else {
      this.isAllSelected()
        ? this.selection.clear()
        : this.dataSource.data.forEach(
          (row) => {
            if (row.codigo_estado_vinculacion === 1)
              this.selection.select(row)

            this.isSelectPricipal = true;
          });
    }
  }


  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }


  verInfo(rowValue: any) {
    const dialogRef = this.materialDialog.open(InformacionCompletaPopupComponent,
      {
        //panelClass: "buscar-centro-trabajo-form-dialog",
        width: "1000px",
        disableClose: true,
        data: {
          action: "requerimiento",
          idGestionPronoei: rowValue.idGestionPronoei
        },
      }
    );

    dialogRef.afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result) => {

        if (result != null) {
          console.log(result)
        }
      });
  }

  modificar(rowValue: any) {
    this.router.navigate(['/ayni/personal/acciones/pronoei/modificar/' + rowValue.idGestionPronoei])
  }

  handleNewProject(row: any) {
    var dialog = this.materialDialog.open(GenerarProyectoComponent, {
      panelClass: 'minedu-generar-proyecto-dialog',
      width: '980px',
      disableClose: true,
      data: {
        title: "Generar proyecto de resoluci&oacute;n",
        idGestionPronoei: row.idGestionPronoei,
        esMandatoJudicial: false,
        esSimple: true
      }
    });
    dialog
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        if (response?.isSuccess) {
          this.loadGridInPaginator();
        }
      })
  }


  async descargarResolucion(row) {
    if (row?.documentoProyectoResolucion === null || row?.documentoProyectoResolucion === '00000000-0000-0000-0000-000000000000' ||
      row?.documentoProyectoResolucion === '') {
      this.dataService.Message().msgWarning('No tiene Documento sustento.', () => { });
      return;
    }
    this.dataService.Spinner().show('sp6');
    let isSuccess = true;
    var response = await this.dataService.Documento().descargar(row?.documentoProyectoResolucion)
      .pipe(
        catchError(() => {
          isSuccess = false;
          return of(null)
        }),
        finalize(() => this.dataService.Spinner().hide('sp6'))
      ).toPromise();

    if (isSuccess && response) {
      this.handlePreviewS1(response, row?.documentoProyectoResolucion);
    } else {
      this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO', () => { });
    }
  }

  private handlePreviewS1(file: any, codigoAdjuntoSustento: string) {
   this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: 'Proyecto resolución',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });


}





  
  async handleEliminar(row: any, i: any) {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ELIMINAR EL REGISTRO PRONOEI.?', async () => {
      this.dataService.Spinner().show("sp6");
      let viewModel = {
        idGestionPronoei: row.idGestionPronoei
      }
      const response = await this.dataService
        .AccionesVinculacion()
        .eliminarGestionPronoei(viewModel)
        .pipe(
          finalize(() => this.dataService.Spinner().hide("sp6")),
          catchError((err) => {
            const errorMessage = err.error.messages[0];
            this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
            return of([]);
          })
        )
        .toPromise();

      if (response) {
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA"', 3000, () => {
          this.loadGridInPaginator();
        });
      }
    }, () => { });

  }

  private loadGridInPaginator() {
    const filters = this.formFilterValuesService.filters;
    this.dataSource.load(filters, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  }


  private loadFilters() {
    this.filters$ = this.formFilterValuesService.getBandejaFiltroObservable()
  }

  private loadGrid(filters) {
    this.dataSource.load(filters, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  }

  private setConfPaginator() {
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Registros por página";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";

    this.paginator._intl.getRangeLabel = function (page, pageSize, length) {
      if (length === 0 || pageSize === 0) {
        return '0 de ' + length;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      // If the start index exceeds the list length, do not try and fix the end index to the end.
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return startIndex + 1 + ' - ' + endIndex + ' de ' + length;
    };
  }

}


