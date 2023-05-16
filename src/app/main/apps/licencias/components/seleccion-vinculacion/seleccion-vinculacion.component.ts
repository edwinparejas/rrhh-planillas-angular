import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../../../../core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataSource, CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { catchError, finalize } from 'rxjs/operators';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MESSAGE_LICENCIAS } from '../../_utils/messages';

@Component({
    selector: 'minedu-seleccion-vinculacion',
    templateUrl: './seleccion-vinculacion.component.html',
    styleUrls: ['./seleccion-vinculacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class SeleccionVinculacionComponent implements OnInit {
    working = false;
    dataSource: VinculacionDataSource | null;
    selection = new SelectionModel<any>(true, []);
    request: any;
    descripcion: string;
    centroTrabajo: CentroTrabajoModel = null;
    displayedColumns: string[] = [
        'select',
        'instancia',
        'subinstancia',
        'centroTrabajo',
        'modalidadEducativa',
        'nivelEducativo',
        'codigoPlaza',
        'tipoPlaza',
        'regimenLaboral',
        'condicionLaboral',
        'situacionLaboral',
        'cargo',
        'areaCurricular',
        'especialidad',
        'jornadaLaboral',
        'fechaInicio',
        'fechaFin'
    ];

    constructor(
        public matDialogRef: MatDialogRef<SeleccionVinculacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
    ) {
        this.descripcion = 'La persona ' + data.servidorPublico.nombreCompleto + ', cuenta con las siguientes vinculaciones vigentes:';
        this.centroTrabajo = data.centroTrabajo;
    }

    ngOnInit(): void {
        this.working = true;
        this.dataSource = new VinculacionDataSource(this.dataService);
        this.buscarServidorPublico();
    }

    buscarServidorPublico = () => {
        const data = {
            idDre: this.centroTrabajo.idDre,
            idUgel: this.centroTrabajo.idUgel,
            idPersona: this.data.servidorPublico.idPersona
        };
        this.dataSource.load(data);
        this.working = false;
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
    }
    
    selectedRow(row:any) {
        this.selection.clear();
        this.selection.toggle(row);
        return row;
    }
    
    handleSeleccionar() {
        this.matDialogRef.close({ servidorPublico: this.selection.selected[0] });
    }

    handleCancel() {
        this.matDialogRef.close();
    }
}

export class VinculacionDataSource extends DataSource<any>{
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any): void {
        this._loadingChange.next(false);

        if (data.codigoPlaza === null && data.idRegimenLaboral === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Licencias().getVinculaciones(data).pipe(
                catchError((error: HttpErrorResponse) => {
                    this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
                }),
                finalize(() => this._loadingChange.next(false))
            ).subscribe((response: any) => {
                if (response && (response || []).length > 0) {
                  this.totalregistro = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
                  this._dataChange.next(response || []);
                } else {
                  this.totalregistro = 0;
                  this._dataChange.next([]);
                }
            });
        }

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
