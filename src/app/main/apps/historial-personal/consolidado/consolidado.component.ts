import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { StorageService } from 'app/core/data/services/storage.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaPermisos } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';


import * as moment from 'moment';
import { isNull } from 'lodash';
import { CentroTrabajoModel, MESSAGE_GESTION, TablaEquivalenciaSede } from '../models/historial-personla.model';
import { InformacionVinculacionComponent } from '../components/informacion-vinculacion/informacion-vinculacion.component';
import { InformacionVacacionesComponent } from '../components/informacion-vacaciones/informacion-vacaciones.component';
import { InformacionSancionesComponent } from '../components/informacion-sanciones/informacion-sanciones.component';
import { InformacionLicenciasComponent } from '../components/informacion-licencias/informacion-licencias.component';
import { InformacionDesplazamientoComponent } from '../components/informacion-desplazamiento/informacion-desplazamiento.component';
import { InformacionBeneficiosComponent } from '../components/informacion-beneficios/informacion-beneficios.component';
import { InformacionAscensoComponent } from '../components/informacion-ascenso/informacion-ascenso.component';
import { InformacionDesvinculacionComponent } from '../components/informacion-desvinculacion/informacion-desvinculacion.component';
import { DocumentViewerComponent } from '../../components/document-viewer/document-viewer.component';
import { HistorialNexusComponent } from '../components/historial-nexus/historial-nexus.component';

@Component({ 
  selector: 'minedu-consolidado',
  templateUrl: './consolidado.component.html',
  styleUrls: ['./consolidado.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ConsolidadoComponent implements OnInit, OnDestroy, AfterViewInit {
  
  centroTrabajo: CentroTrabajoModel = null;

  passportModular={
    idNivelInstancia: null,        
    idEntidadSede: null, 
    idRolPassport: null
  }

  Nombre_Usuario = "";
  idDre = 0
  idUgel = 0
  codigoTipoSede = "";

  form: FormGroup;
  formExportar: any = {};
  loading: false;
  
  export = false;

  entidad = false;

  es_nexus = false;
    
  dialogRef: any;

  idCentroTrabajo = 0;
  idRegimenLaboral = 0;
  idCondicionLaboral = 0;
  idSituacionLaboral = 0;
  idServidorPublico = 0;
  
  pageSize = 10;

  private currentSession: SecurityModel = new SecurityModel();
  private passport: SecurityModel = new SecurityModel();
  dataUserLoginModel: any;
  dataConsolidadoCabecera: any;
  dataInformacionHistorial: any;

  hasAccessPage: boolean;

  displayedColumns: string[] = [
    'nro',
    'grupo_accion',
    'accion',
    'motivo_accion',
    'sub_instancia',
    'centro_trabajo',
    'fecha_inicio',
    'fecha_fin',
    'resolucion',
    'f_resolucion',
    'acciones'
  ];
  

  dataSource: ConsolidadoDataSource | null;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private sharedService: SharedService,
    private materialDialog: MatDialog,
    private storageService: StorageService
  ) {}
  
  ngOnInit(): void {
    setTimeout(_ => this.buildShared());

    this.buildForm();
    this.buildPassport();
            
    this.dataSource = new ConsolidadoDataSource(this.dataService);
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
    
    // Obtener datos cabecera

    

    this.idServidorPublico = parseInt(this.route.snapshot.paramMap.get('id_servidor_publico')) ;
    
    this.entidadPassport();
    this.obtenerCodigoDreUgelLogeado();  
    this.loadConsolidadoCabecera();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({      
      idServidorPublico: [-1],
      idDre: [null],
      idUgel: [null]
    });
   
  }

  loadConsolidadoCabecera(): void {    
    
    const request = {
      idServidorPublico: this.idServidorPublico
      
    };
    this.dataService.PersonalHistorial().getConsolidadoCabecera(request).subscribe(
      (response) => {
        
        this.dataConsolidadoCabecera = response;

        this.es_nexus = response.historial_nexus;
        
      }, 
      (error: HttpErrorResponse) => {
      }
    )
  }

  entidadPassport(){
    this.dataService.AccionesVinculacion().entidadPassport(this.passport.codigoSede).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response.length > 0){
        if (response.length > 1)
          response = response.filter(x => x.idNivelInstancia <= 3);
          console.log("entidadPassport: ",response);
        if (response.length == 1 && response[0].idNivelInstancia == 3)
        this.passport.codigoTipoSede = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;

        this.centroTrabajo = response[0];
        this.idDre = this.centroTrabajo?.idDre;
        this.idUgel = this.centroTrabajo?.idUgel;
        this.codigoTipoSede = this.passport.codigoTipoSede;        
      }else{
        this.centroTrabajo = null;
      }
    });
  }

  

  buildShared() {
    console.log('buildShared');
    // this.sharedService.setSharedBreadcrumb("Gestionar Acciones de vinculación");
    // this.sharedService.setSharedTitle("Gestionar vinculación");
  }

  buildPassport() {
    debugger
    this.passport = this.dataService.Storage().getInformacionUsuario();    
    const usuario = this.dataService.Storage().getPassportUserData();
    this.Nombre_Usuario = usuario.NOMBRES_USUARIO;
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    console.log("this.passport", this.passport);
    console.log("usuario =>", usuario);
    console.log("rolSelected =>", rolSelected);
  }

  buildSeguridad = () => {
    debugger   

    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    
    console.log("session", this.currentSession);
  }

  

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
    this.paginator.page
      .pipe(
        tap(() => this.loadGrid())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
        ? this.selection.clear()
        : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row): string {
    if (!row) {      
        return `${this.isAllSelected() ? "select" : "deselect"} all`;               
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }

  
  obtenerCodigoDreUgelLogeado(): void {
    debugger;    
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    const sedeSeleccionado = rolSelected.CODIGO_SEDE;
    const request = {
      codigoEntidadSede: sedeSeleccionado
    };
    this.dataService.AccionesVinculacion().getCodigoDreUgel(request).subscribe(
      (response) => {
        console.log('obtenerCodigoDreUgelLogeado() =>', response);
        this.dataUserLoginModel = response;
        this.idUgel = response.idUgel;
        this.idDre = response.idDre;
        if (this.dataUserLoginModel == null) {
          this.dataService
            .Message()
            .msgWarning(
              '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
              () => { }
            );
        } 
        else {
          this.handleGrid();
        }
      }, 
      (error: HttpErrorResponse) => {
      }
    )
  }

  handleGrid() {
debugger;
    const form = this.form.value;
    
    form.idServidorPublico = this.idServidorPublico;     

    console.log('handleBuscar()', form);

    this.loadGrid();

  }

  loadGrid(){    


    this.pageSize = this.paginator.pageSize;

    if(this.pageSize ==  null) {
      this.pageSize = 10;
    }

    this.dataSource.load(this.form.value, (this.paginator.pageIndex + 1), this.pageSize);
    
  }  
 
  handleVerPdfDocumentoResolucion(row) {

    if(row.codigo_documento_resolucion == "0") {
      this.dataService.Message().msgWarning('"NO SE PUEDE VISUALIZAR LA RESOLUCIÓN, DEBIDO A QUE NO SE CUENTA CON EL ARCHIVO PDF EN EL SISTEMA."', () => {
      });
      return;
    }

    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(row.codigo_documento_resolucion)
        .pipe(
            catchError((e) => {
                return of(e);
            }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                this.handlePreviewS1(response, row.codigo_documento_resolucion, "Documento Resolución");
            } else {
                this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO.', () => {
                });
            }
        });
  }

  handlePreviewS1(file: any, codigoAdjuntoSustento: string, titulo: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: titulo,
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });
    this.dialogRef.afterClosed()
    .subscribe((response: any) => {
        if (!response) {
            return;
        }
    });
  };

  handleCancelar () {   
      this.router.navigate(['ayni/personal/historialpersonal']);
  }

  VerConsolidado(){

    let viewModel = {
      idServidorPublico: this.idServidorPublico
    }
    
    this.dataService.PersonalHistorial().generarHistorialPDF(viewModel).pipe(
      catchError((e) => of(e)),
      finalize(() => {
      })
    ).subscribe(response => {      
        console.log('historial pdf', response);
        this.handleVerPdfHistorial(response.error.text);          
    });   

    
  }

  VerHistorialNexus(){

    let dialogRef = this.materialDialog.open(HistorialNexusComponent, {
      panelClass: 'Minedu-historial-nexus',
        disableClose: true,
        data: {
          historial: this.dataConsolidadoCabecera
        }
    });
    dialogRef.afterClosed()
    .subscribe((response: any) => {
      if (!response) {
        return;
      }
      console.log(response);
    });
    
  }


  handleVerPdfHistorial(codigo_documento) {
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(codigo_documento)
        .pipe(
            catchError((e) => {
                return of(e);
            }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                this.handlePreviewS1(response, codigo_documento, "Documento Historial - PDF");
            } else {
                this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO.', () => {
                });
            }
        });
  }

  
    
  handleInformacion(row) {

    const request = {
      idPersonalHistorial: row.id_historial_personal,
      idGrupoAccion: row.id_grupo_accion
      
    };
    this.dataService.PersonalHistorial().getdetalleValorHistorial(request).subscribe(
      (response) => {
        
        this.dataInformacionHistorial = response;

        // vinculación
        if(row.id_grupo_accion == 12) {

          let dialogRef = this.materialDialog.open(InformacionVinculacionComponent, {
            panelClass: 'Minedu-informacion-vinculacion',
              disableClose: true,
              data: {
                historial: this.dataInformacionHistorial
              }
          });
          dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log(response);
          });

        }

        // vacaciones
        if(row.id_grupo_accion == 11) {

          let dialogRef = this.materialDialog.open(InformacionVacacionesComponent, {
            panelClass: 'Minedu-informacion-vacaciones',
              disableClose: true,
              data: {
                historial: this.dataInformacionHistorial
              }
          });
          dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log(response);
          });

        }

        // sancion        
        if(row.id_grupo_accion == 10) {

          let dialogRef = this.materialDialog.open(InformacionSancionesComponent, {
            panelClass: 'Minedu-informacion-sanciones',
              disableClose: true,
              data: {
                historial: this.dataInformacionHistorial
              }
          });
          dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log(response);
          });

        }

        // licencias
        if(row.id_grupo_accion == 8) {

          let dialogRef = this.materialDialog.open(InformacionLicenciasComponent, {
            panelClass: 'Minedu-informacion-licencias',
              disableClose: true,
              data: {
                historial: this.dataInformacionHistorial
              }
          });
          dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log(response);
          });

        }

        // desvinculacion
        if(row.id_grupo_accion == 6) {

          let dialogRef = this.materialDialog.open(InformacionDesvinculacionComponent, {
            panelClass: 'Minedu-informacion-desvinculacion',
              disableClose: true,
              data: {
                historial: this.dataInformacionHistorial
              }
          });
          dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log(response);
          });

        }

        // desplazamiento
        if(row.id_grupo_accion == 5) {

          let dialogRef = this.materialDialog.open(InformacionDesplazamientoComponent, {
            panelClass: 'Minedu-informacion-desplazamiento',
              disableClose: true,
              data: {
                historial: this.dataInformacionHistorial
              }
          });
          dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log(response);
          });

        }

        // beneficios
        if(row.id_grupo_accion == 3) {

          let dialogRef = this.materialDialog.open(InformacionBeneficiosComponent, {
            panelClass: 'Minedu-informacion-beneficios',
              disableClose: true,
              data: {
                historial: this.dataInformacionHistorial
              }
          });
          dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log(response);
          });

        }

        // Ascenso
        if(row.id_grupo_accion == 2) {

          let dialogRef = this.materialDialog.open(InformacionAscensoComponent, {
            panelClass: 'Minedu-informacion-ascenso',
              disableClose: true,
              data: {
                historial: this.dataInformacionHistorial
              }
          });
          dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log(response);
          });

        }        
        
      }, 
      (error: HttpErrorResponse) => {
      }
    )


    
  }

}

export class ConsolidadoDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    debugger
    console.log('data pagination', data);
    
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;

    this._loadingChange.next(true);
    this.dataService.PersonalHistorial().getConsolidadoPaginado(data).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response) {
        console.log('response is true'); 
        this._totalRows = (response[0] || [{ total: 0 }]).total;
        this._dataChange.next(response || []);

        if ((response || []).length === 0) {
            this.dataService.Message().msgWarning(MESSAGE_GESTION.M09);
        }

      } else {
        console.log('response is false');
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