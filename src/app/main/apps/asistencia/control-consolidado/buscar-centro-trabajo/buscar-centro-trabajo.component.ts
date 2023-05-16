import { Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, Inject, OnDestroy } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, of, Observable, Subject, Subscription } from 'rxjs';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ASISTENCIA_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PassportModel } from 'app/core/model/passport-model';
import {  TablaTipoCentroTrabajo } from 'app/core/model/types';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SharedService } from 'app/core/shared/shared.service';
import { TablaNivelInstancia } from '../../control-asistencia/_utils/enum';

@Component({
  selector: 'minedu-buscar-centro-trabajo',
  templateUrl: './buscar-centro-trabajo.component.html',
  styleUrls: ['./buscar-centro-trabajo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BuscarCentroTrabajoComponent implements OnInit, OnDestroy, AfterViewInit {

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

  filtro = {
      idNivelInstancia: null,
      idInstancia: null,
      idSubinstancia: null,
      idTipoCentroTrabajo: null,
      institucionEducativa: null
  };

  private passport: PassportModel = { idNivelInstancia: null, idEntidad: null, usuario: null };

  ocultarInstancia = false;
  ocultarSubinstancia = false;
  ocultarTipoCentroTrabajo = false;
  ocultarInstitucionesEducativas = false;

  tieneEstructuraOrganica = null;

  displayedColumns: string[] = ['index', 'idCentroTrabajo', 'codigoCentroTrabajo', 'id', 'centroTrabajo', 'instancia', 'subinstancia', 'idTipoCentroTrabajo', 'tipoCentroTrabajo'];

  dataSource: CentroTrabajoDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild('paginatorCentroTrabajo', { static: true }) paginator: MatPaginator;

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
      this.action = this.data.action;
      this.dialogTitle = 'Búsqueda de centro de trabajo';
      this.buildForm();
      this.handleResponsive();
      this.buildData();
      this.dataSource = new CentroTrabajoDataSource(this.dataService);
      this.paginator.showFirstLastButtons = true;
      this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
      this.paginator._intl.nextPageLabel = 'Siguiente página';
      this.paginator._intl.previousPageLabel = 'Página anterior';
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última página';
      this.loadInstancia(true);

  }

  handleResponsive(): void {
      this.isMobile = this.getIsMobile();
      window.onresize = () => {
          this.isMobile = this.getIsMobile();
      };
  }

  buildForm() {
      this.form = this.formBuilder.group({
          idNivelInstancia: [null],
          idInstancia: [null],
          idSubinstancia: [null],
          idTipoCentroTrabajo: [null],
          institucionEducativa: [null]
      });     

      this.form.get('idInstancia').valueChanges.subscribe(value => {
          let idNivelInstancia = null;
          let idInstancia = null;
          this.subinstancias = [];
          this.tiposCentroTrabajo = [];
         
          this.form.patchValue({ idSubinstancia: '-1', idTipoCentroTrabajo: '-1' });
        
          if (value && value !== "-1") {
           
            if(parseInt(value.split('-')[0]) == TablaNivelInstancia.MINEDU)
            {
              console.log(value);
              this.ocultarSubinstancia = true;
              this.loadTipoCentroTrabajo(parseInt(value.split('-')[0]),true);
            }
            else {
              if(parseInt(value.split('-')[0]) == TablaNivelInstancia.DRE)
              {
                console.log(value);
                this.loadSubinstancia(parseInt(value.split('-')[1]),true);
                this.loadTipoCentroTrabajo(parseInt(value.split('-')[0]),true);
              }
            }        
          
          }
       
      });


      this.form.get('idSubinstancia').valueChanges.subscribe(value => {
        if(value){
          console.log(value);
        
          this.tiposCentroTrabajo = [];
         
          this.form.patchValue({ idTipoCentroTrabajo: '-1' });
        
          if (value && value !== "-1") {
           
            if(parseInt(value.split('-')[0]) == TablaNivelInstancia.DRE)
            {
              console.log(value);
          
              this.loadTipoCentroTrabajo(parseInt(value.split('-')[0]),true);
            }
            else {
              if(parseInt(value.split('-')[0]) == TablaNivelInstancia.UGEL)
              {
                console.log(value);
                
                this.loadTipoCentroTrabajo(parseInt(value.split('-')[0]),true);
              }
            }        
          
          }
        }
    });
   

    this.form.get('idTipoCentroTrabajo').valueChanges.subscribe(value => {
      if(value){
        console.log(value);
        if (value && value !== "-1") {
         
          if(value == TablaTipoCentroTrabajo.Minedu)
          {
            console.log(value);
            this.ocultarInstitucionesEducativas = true;
        
          }
                   
          if(value == TablaTipoCentroTrabajo.SedeAdministrativaDRE)
          {
              console.log(value);
              this.ocultarInstitucionesEducativas = true;
          }

                     
          if(value == TablaTipoCentroTrabajo.InstitucionEducativaDRE)
          {
              console.log(value);
              this.ocultarInstitucionesEducativas = false;
          }

                     
          if(value == TablaTipoCentroTrabajo.InstitutoSuperiorDRE)
          {
              console.log(value);
              this.ocultarInstitucionesEducativas = false;
          }
                     
          if(value == TablaTipoCentroTrabajo.SedeAdministrativaUGEL)
          {
              console.log(value);
              this.ocultarInstitucionesEducativas = true;
          }

                     
          if(value == TablaTipoCentroTrabajo.InstitucionEducativaUgel)
          {
              console.log(value);
              this.ocultarInstitucionesEducativas = false;
          }
          if(value == TablaTipoCentroTrabajo.InstitutoSuperiorUgel)
          {
              console.log(value);
              this.ocultarInstitucionesEducativas = false;
          }              
        
        }
      }
  });

     
  }



  buildData() {
     
  }

  default() {
      this.form.patchValue({
          idInstancia: '-1', idSubinstancia: '-1', idTipoCentroTrabajo: '-1'
      });

      this.form.controls['institucionEducativa'].reset();
  }

  ngAfterViewInit() {
      this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
  }

  loadData(pageIndex, pageSize) {
      this.dataSource.load(this.filtro, pageIndex, pageSize);
  }

  ngOnDestroy(): void {
  }

  loadInstancia(activo) {
      this.dataService.Asistencia().getInstancia(activo).pipe(
          catchError(() => of([])),
          map((response: any) => response)
      ).subscribe(response => {
          if (response && response.result) {
              this.instancias = response.data;
              this.form.controls['idInstancia'].setValue('-1');
          }
          else {
            this.instancias = [];
          }
      });
  
  }

  loadSubinstancia(idInstancia, activo) {
    if (!idInstancia) {
      this.subinstancias = [];
      this.form.patchValue({ idSubInstancia: "-1" });
      return;
    }
      this.dataService.Asistencia().getSubinstancia(idInstancia, activo).pipe(
          catchError(() => of([])),
          map((response: any) => response)
      ).subscribe(response => {
          if (response && response.result) {
              this.subinstancias = response.data;
              this.form.controls['idSubinstancia'].setValue('-1');
          }
      });

  }

  loadTipoCentroTrabajo(idNivelInstancia, activo) {

      this.dataService.Asistencia().getTipoCentroTrabajo(idNivelInstancia, activo).pipe(
          catchError(() => of([])),
          map((response: any) => response)
      ).subscribe(response => {
          if (response && response.result) {
              this.tiposCentroTrabajo = response.data;
              if (this.tiposCentroTrabajo.length === 1) {
                  this.form.controls['idTipoCentroTrabajo'].setValue(this.tiposCentroTrabajo[0].idTipoCentroTrabajo);
                  this.form.controls['idTipoCentroTrabajo'].disable();
              } else {
                  this.form.controls['idTipoCentroTrabajo'].setValue('-1');
                  this.form.controls['idTipoCentroTrabajo'].enable();
              }
          }
      });
  }

  cancelar() {
      this.resetFiltro();
      this.matDialogRef.close();
  }

  buscar() {
      this.setFiltro();
      if (this.form.value.idInstancia === '-1') {
          this.dataService.Message().msgWarning('Debe ingresar al menos un criterio de búsqueda.', () => { });
          return;
      }

      this.dataSource.load(this.filtro, (this.paginator.pageIndex + 1),  this.paginator.pageSize);
  }   

  setFiltro() {
      const data = this.form.getRawValue();
      this.resetFiltroBuscar();

      if (data.idInstancia !== null && data.idInstancia !== '-1') {
          this.filtro.idNivelInstancia = parseInt(data.idInstancia.split('-')[0]);
          this.filtro.idInstancia = parseInt(data.idInstancia.split('-')[1]);
      }

      if (data.idSubinstancia !== null && data.idSubinstancia !== '-1') {
          this.filtro.idNivelInstancia = parseInt(data.idSubinstancia.split('-')[0]);
          this.filtro.idSubinstancia = parseInt(data.idSubinstancia.split('-')[1]);
      }

      if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
          this.filtro.idTipoCentroTrabajo = data.idTipoCentroTrabajo;
      }

      switch (this.passport.idNivelInstancia) {
          case TablaNivelInstancia.MINEDU:
          case TablaNivelInstancia.DRE: {
              this.filtro.idInstancia = this.filtro.idInstancia ? this.filtro.idInstancia : this.passport.idEntidad;
              break;
          }
          case TablaNivelInstancia.UGEL: {
              if (data.idSubinstancia === null) {
                  this.filtro.idNivelInstancia = this.passport.idNivelInstancia;
                  this.filtro.idSubinstancia = this.passport.idEntidad;
              }
              break;
          }
      }

      this.filtro.institucionEducativa = data.institucionEducativa ? data.institucionEducativa : null;
  }

  onSelect(selected: any): void {
      this.selection.clear();
      this.selection.toggle(selected);
      // this.dataShared.sendDataSharedCentroTrabajo({ registro: selected });
      this.matDialogRef.close({ centroTrabajo: selected });
  }

  mostrar(idNivelInstancia) {
    

      switch (idNivelInstancia) {
          case TablaNivelInstancia.MINEDU: {
              this.ocultarInstancia = true;
              break;
          }
          case TablaNivelInstancia.DRE: {
              this.ocultarSubinstancia = true;
              break;
          }
          case TablaNivelInstancia.UGEL: {
              this.ocultarTipoCentroTrabajo = true;
              break;
          }
      }
  }


  resetFiltro() {
      this.form.clearValidators();
      this.default();
  }

  resetFiltroBuscar() {
      this.filtro = {
          idNivelInstancia: null,
          idInstancia: null,
          idSubinstancia: null,
          idTipoCentroTrabajo: null,
          institucionEducativa: null
      };
  }
}

export class CentroTrabajoDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  public _totalRows = 0;

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService.Asistencia().buscarCentroTrabajo(data, pageIndex, pageSize).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response && response.result) {
        this._totalRows = (response.data[0] || [{ total: 0 }]).total;
        this._dataChange.next(response.data);
      } else {
        this._totalRows = 0;
        this._dataChange.next([]);
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
    return this._totalRows;
  }
  get data(): any {
    return this._dataChange.value || [];
  }
}
