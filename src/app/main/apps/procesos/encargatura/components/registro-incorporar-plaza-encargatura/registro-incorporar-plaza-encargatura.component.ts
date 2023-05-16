import {Component, Inject, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../../../../core/data/data.service';
import {MatPaginator} from '@angular/material/paginator';
import {catchError, finalize, tap} from 'rxjs/operators';
import { saveAs } from "file-saver";
import {InformacionPlazaComponent} from '../informacion-plaza/informacion-plaza.component';
import { ENCARGATURA_MESSAGE } from '../../_utils/message';

@Component({
    selector: "minedu-registro-incorporar-plaza-encargatura",
    templateUrl: "./registro-incorporar-plaza-encargatura.component.html",
    styleUrls: ["./registro-incorporar-plaza-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroIncorporarPlazaEncargaturaComponent implements OnInit {
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    form: FormGroup;
    loading = false;
    export = false;
    dataSource: PlazaDataSource | null;
    selection: SelectionModel<any> | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    nombreUsuario:string;
    CodigoSede:string;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    request = {
        idEtapaProceso:null,
        idDesarrolloProceso:null,
        codigoModular: null,
        codigoPlaza: null,
        CodigoSede:null
    };
    displayedColumns: string[] = [
        "idPlaza",
        "codigoModular",
        "centroTrabajo",
        "modalidad",
        "nivelEducativo",
        "tipoGestion",
        "codigoPlaza",
        "cargo",
        "especialidad",
        "tipoPlaza",
        "vigenciaInicio",
        "vigenciaFin",
        "acciones"
    ];
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
        public dialogRef: MatDialogRef<RegistroIncorporarPlazaEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        this.idEtapaProceso = data.idEtapaProceso;
        this.idDesarrolloProceso = data.idDesarrolloProceso;
        this.nombreUsuario=data.nombreUsuario;
        this.CodigoSede=data.CodigoSede;
    }

    ngOnInit(): void {
        this.dataSource = new PlazaDataSource(this.dataService);
        this.selection = new SelectionModel<any>(true, []);
        this.buildForm();
        this.handleResponsive();
        this.resetForm();
        this.searchPlaza(true);
    }

    ngAfterViewInit() {
        this.paginator.page.pipe(tap(() => this.searchPlaza())).subscribe();
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildForm() {
        this.form = this.formBuilder.group({
            codigoModular: [null],
            codigoPlaza: [null]
        });
    }

    handleLimpiar() { 
        this.resetForm();
    }

    handleBuscar() {
        if(this.form.valid==false)
        {
            let mensajes="";
            if (this.form.controls.codigoModular.valid == false) {
                mensajes=(mensajes.length==0?mensajes+ENCARGATURA_MESSAGE.M38:mensajes+", "+ENCARGATURA_MESSAGE.M38);                
            }
            if (this.form.controls.codigoPlaza.valid == false) {
                mensajes=(mensajes.length==0?mensajes+ENCARGATURA_MESSAGE.M64:mensajes+", "+ENCARGATURA_MESSAGE.M64);                 
            }
            this.dataService.Message().msgWarning(mensajes, () => { });
            return;
        }
        this.searchPlaza(true);
    }

    resetForm() {
        this.form.reset();
        this.searchPlaza(false);
    }

    setRequest() {
        const codigoModular = this.form.get("codigoModular").value;
        const codigoPlaza = this.form.get("codigoPlaza").value;

        this.request = {
            idEtapaProceso : this.idEtapaProceso,
            idDesarrolloProceso:this.idDesarrolloProceso,
            codigoModular: codigoModular,
            codigoPlaza: codigoPlaza,
            CodigoSede: this.CodigoSede
        };
    }

    searchPlaza(firstTime: boolean = false) {
        this.setRequest();
        if (firstTime) {
            this.dataSource.load(this.request, 1, 10, true);
        } else {
            this.dataSource.load(this.request, this.paginator.pageIndex, this.paginator.pageSize, false);
        }
    }

    handleExportar() {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }
        this.setRequest();
        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().exportPlaza(this.request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.export = false;
        })).subscribe((response: any) => {
            if (response) {
                saveAs(response, "Plaza.xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"', () => {});
            }
        });
    }

    handleViewInfo(row: any) {
        this.materialDialog.open(InformacionPlazaComponent, {
            panelClass: 'minedu-informacion-plaza',
            width: '1080px',
            disableClose: true,
            data: {
                idPlaza: row.idPlaza
            }
        });
    }

    handleSave() {
        if (this.selection.selected.length == 0) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M91, () => {});
            return;
        }
        const items: any[] = [];
        this.selection.selected.forEach((x) => {
            const plaza = {
                idPlaza: x.idPlaza
            };
            items.push(plaza);
        });
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            listaPlaza: items,
            UsuarioCreacion:this.nombreUsuario
        };
        this.dataService.Message().msgConfirm('¿ESTA SEGURO DE QUE DESEA INCORPORAR PLAZAS?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().registerPlaza(request).pipe(catchError(() => of([])), finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })).subscribe((result: any) => {
                if (result == 1) {
                    this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => {});
                    this.selection = new SelectionModel<any>(true, []);
                    this.searchPlaza(true);
                } else {
                    this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => {});
                }
            });
        }, () => {});
    }

    handleCancel() {
        this.dialogRef.close();
    }
}

export class PlazaDataSource extends DataSource<any>{
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime = false) : void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        this.dataService.Encargatura().searchPlazaPaginado(data, pageIndex, pageSize).pipe(catchError(() => of([])), finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide("sp6");
        })).subscribe((result: any) => {
            this._dataChange.next(result || []);
            this.totalRegistros = (result || []).length === 0 ? 0 : result[0].totalRegistros;
            if ((result || []).length === 0) {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE PROCESOS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
            }
        });
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalRegistros;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}