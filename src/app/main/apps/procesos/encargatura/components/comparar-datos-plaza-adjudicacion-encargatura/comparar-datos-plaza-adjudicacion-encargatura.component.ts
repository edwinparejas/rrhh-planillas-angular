import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Component({
    selector: "minedu-comparar-datos-plaza-adjudicacion-encargatura",
    templateUrl: "./comparar-datos-plaza-adjudicacion-encargatura.component.html",
    styleUrls: ["./comparar-datos-plaza-adjudicacion-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CompararDatosPlazaAdjudicacionEncargaturaComponent implements OnInit {
    
    @Input() idPlazaEncargaturaDetalle : number;
    @Input() currentSession: SecurityModel = new SecurityModel();
    @Output() handleEvent = new EventEmitter<object>();    
    dataSource: DatosPlazaDataSource | null;
    DataPlazaDetalle:[];
    loading = false;
    
    isMobile = false;

    displayedColumns: string[] =["row","descripcion","datoOriginal","datoActualizado"];
    getIsMobile(): boolean {
            const w = document.documentElement.clientWidth;
            const breakpoint = 992;
            if (w < breakpoint) {
                return true;
            } else {
                return false;
            }
        }
    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        
        this.dataSource = new DatosPlazaDataSource(this.dataService);
        const request={
            idPlazaEncargaturaDetalle:this.idPlazaEncargaturaDetalle
        };
        this.dataSource.load(request, 1, 10, true);
        
        this.handleResponsive();
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }
    handleSave(){
        const request = {
            idPlazaEncargaturaDetalle: this.idPlazaEncargaturaDetalle,
            UsuarioModificacion:this.currentSession.nombreUsuario,
            CodigoModular:this.currentSession.codigoSede
        };

        this.loading = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().ActualizarDatosPlaza(request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"ERROR DE CONEXION"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe(result => {
            if(result!=null){
                if(result.actualizo){
                    this.handleEvent.emit({event:'actualizo', mensaje: "LOS DATOS DE LA PLAZA"});
                }
                else{
                    this.handleEvent.emit({event:'error', mensaje: result.messageError});
                }
            }
        });
    }
    sendCancel() {
        this.handleEvent.emit({event:'cancel', mensaje: ''});
    }   
}
export class DatosPlazaDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;
    public diferentes=0;
    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime = false): void {
        this._loadingChange.next(false);
        if (!firstTime) {
            this.dataService.Spinner().show("sp6");
        }
        console.log(data);
        this.dataService.Encargatura().DatosPlaza(data).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this._loadingChange.next(false);
        })).subscribe((result: any) => {
            console.log(result);
            this._dataChange.next(result || []);
            this.totalRegistros = (result || []).length;
            if((this.totalRegistros||0)>0){
                this.diferentes = (result.filter(x=>x.diferente==true)||[]).length;
                console.log(this.diferentes);
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

    get mostrarActualizar(): boolean {
        return this.diferentes>0;
    }
}