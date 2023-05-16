import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find, tap } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { criterioBusqueda, TipoDocumentoIdentidadEnum } from '../../models/desvinculacion.model';
import { isNull } from 'lodash';

@Component({
    selector: 'minedu-buscar-persona',
    templateUrl: './buscar-persona.component.html',
    styleUrls: ['./buscar-persona.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscarPersonaComponent implements OnInit, AfterViewInit {
    working: false;
    form: FormGroup;
    maxLengthnumeroDocumentoIdentidad: number;
    dataSource: ServidorPublicoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    seleccionado: any = null;
    currentSession: SecurityModel = new SecurityModel();
    comboLists = {
        listTipoDocumento: []
    };

    idRegimenLaboral: number =  null;
    idDre: number =  null;
    idUgel: number =  null;
    idAccion: number =  null;

    request = {
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        primerApellido: null,
        segundoApellido: null,
        nombres: null,
        idRegimenLaboral: null,
        idAccion: null,
        idDre: null,
        idUgel: null
    };

    displayedColumns: string[] = [
        'nro',
        'numeroDocumentoIdentidadCompleto',
        'nombreCompleto',
        'fechaNacimiento',
        'edad',
        'nacionalidad',
        'estadoCivil',
        'estado'
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;

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
        public matDialogRef: MatDialogRef<BuscarPersonaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog) { 

            this.idRegimenLaboral =
            data?.idRegimenLaboral != null
                  ? data?.idRegimenLaboral
                  : -1;

            this.idDre = data?.idDre;
            this.idUgel = data?.idUgel;
            this.idAccion = data?.idAccion;
        }
        
        ngAfterViewInit(): void {
            // this.paginator.page.pipe(tap(() => this.buscarServidorPublico())).subscribe();
     
             this.paginator.page.subscribe(() =>
               this.loadData(
                   (this.paginator.pageIndex + 1).toString(),
                   this.paginator.pageSize.toString()
               )
           );
     
         }




    ngOnInit(): void {
        this.buildForm();
        this.buildSeguridad();
        this.handleResponsive();
        this.loadTipoDocumentoIdentidad();
        this.dataSource = new ServidorPublicoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }

        if(this.data.TipoDocumento > 0) {
            this.form.patchValue({  
                idTipoDocumentoIdentidad: this.data.TipoDocumento,
                numeroDocumentoIdentidad: this.data.NumeroDocumento,
              });

              this.selectTipoDocumento(this.data.TipoDocumento);

              this.form.patchValue({  
                numeroDocumentoIdentidad: this.data.NumeroDocumento               
              });
        }

        
    }

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        console.log("codigos Sede", this.currentSession.idSede, this.currentSession.idTipoSede, this.currentSession.codigoLocalSede, this.currentSession.codigoPadreSede)
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    loadData(pageIndex, pageSize) {
 
        this.dataSource.load(this.request, pageIndex, pageSize);
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            primerApellido: [null],
            segundoApellido: [null],
            nombres: [null],
        });
        
        this.form.get("numeroDocumentoIdentidad").disable();
    }

    loadTipoDocumentoIdentidad = () => {
        
        let request = {
            codigoCatalogo: 6,
            Inactivo: false
          }
        this.dataService.AccionesVinculacion().getCatalogoItem(request).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response) {
                const data = response.map(x => ({
                    ...x,
                    value: x.id_catalogo_item,
                    label: `${x.descripcion_catalogo_item}`
                }));
                this.comboLists.listTipoDocumento = data;
            }
        });

        

    }    

    cargarFiltro(): void {
        this.request = this.form.getRawValue();
        
    }

    buscarServidorPublico = () => {
        this.cargarFiltro();

        this.request.idDre = this.idDre;
        this.request.idUgel = this.idUgel;
        this.request.idRegimenLaboral = this.idRegimenLaboral;
        this.request.idAccion = this.idAccion;

        // ---------------

        if (this.request.numeroDocumentoIdentidad === '') this.request.numeroDocumentoIdentidad = null;       

        if (this.request.idTipoDocumentoIdentidad === null && this.request.numeroDocumentoIdentidad === null && this.request.nombres === null && this.request.primerApellido === null && this.request.segundoApellido === null) {
            this.dataService.Message().msgWarning('"DEBE ESPECIFICAR POR LO MENOS UN CRITERIO DE BÚSQUEDA."', () => { });
            return;
        } 

        if(this.request.idTipoDocumentoIdentidad > 0) {
            let numeroDocumento = ''
            if( !isNull(this.request.numeroDocumentoIdentidad) ) {
                numeroDocumento = this.request.numeroDocumentoIdentidad

                let validacionDocumento = criterioBusqueda.validarNumeroDocumento(this.request.idTipoDocumentoIdentidad, numeroDocumento);
                if (!validacionDocumento.esValido) {
                    this.dataService.Message().msgWarning(validacionDocumento.mensaje);
                    return;
                }
            }
            
        }            
        this.dataSource = new ServidorPublicoDataSource(this.dataService);
        this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
        
    }

    handleLimpiar(): void {
        this.form.reset();
    }

    handleBuscar(): void {
        this.buscarServidorPublico();
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        // this.seleccionado = selected;
        this.matDialogRef.close({ servidorPublico: selected });
    }

    handleSelect = (form) => {
        if (this.seleccionado === null) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR UN REGISTRO."', () => { });
        } else {
            this.matDialogRef.close({ servidorPublico: this.seleccionado });
        }
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get('numeroDocumentoIdentidad').setValue('');
        this.maxLengthnumeroDocumentoIdentidad = tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
        debugger
        if(tipoDocumento===null || 
            tipoDocumento===undefined || 
            tipoDocumento<=0)this.form.get("numeroDocumentoIdentidad").disable();
         else this.form.get("numeroDocumentoIdentidad").enable();

        this.form.get('numeroDocumentoIdentidad').setValidators([ Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad) ]);
    }

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    }

    validaLetras = (event) => {
        var key = event.keyCode || event.which,
          tecla = String.fromCharCode(key).toLowerCase(),
          letras = " áéíóúabcdefghijklmnñopqrstuvwxyz",
          especiales = [8, 37, 39, 46],
          tecla_especial = false;
    
        for (var i in especiales) {
          if (key == especiales[i]) {
            tecla_especial = true;
            break;
          }
        }
    
        if (letras.indexOf(tecla) == -1 && !tecla_especial) {
          return false;
        }
      };

}

export class ServidorPublicoDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);    
        this.dataService.AccionesDesvinculacion().buscarServidorPublicoTransversal(data, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => {
                this._loadingChange.next(false);
                this.dataService.Spinner().hide("sp6");
            })
        ).subscribe((response: any) => {
            this._dataChange.next(response || []);
            this.totalregistro = ((response || []).length === 0) ? 0 : response[0].totalRegistro;
            if ((response || []).length === 0) {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
            }
        });

        this._dataChange.next(data);
        this.totalregistro = 0;
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

