import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { DataSource, SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { DataService } from '../../../../../../../core/data/data.service';
import { DecimalPipe } from '@angular/common';
import { CalificacionResponse } from '../../../models/contratacion.model';

@Component({
    selector: 'minedu-criterio-evaluacion',
    templateUrl: './criterio-evaluacion.component.html',
    styleUrls: ['./criterio-evaluacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CriterioEvaluacionComponent implements OnInit {
    dataSource: CriterioEvaluacionPunDataSource | null;
    isMobile = false;
    @Input() data: any[] = [];
    @Input() soloLectura: boolean;
    @Input() puntajeTotalLabel: string = 'PUNTAJE TOTAL: ';
    @Input() puntajeTotal: number = 0;
    @Input() calificacion: CalificacionResponse;
    @Output() calcularEvent: EventEmitter<any> = new EventEmitter<any>();

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    selection = new SelectionModel<any>(true, []);
    displayedColumns: string[] = [
        'registro',
        'descripcion',
        'puntajeMaximo',
        'acreditaDocumento',
        'cantidad',
        'puntaje'
    ];
    constructor(
        private dataService: DataService,
        private decimalPipe: DecimalPipe) { }

    ngOnInit(): void {
        this.dataSource = new CriterioEvaluacionPunDataSource();
        this.handleResponsive();
        this.dataSource.load(this.data, 1, 20);
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    actualizarLista = (data: any[]) => {
        this.data = data;
        this.dataSource.load(this.data, 1, 20);
    }

    calcularPuntajeFinal = (row) => {
        let puntajeFinal = 0;
        let puntajeUnitario = 1;
        let cantidad = 0;
        let isOk = true;
        if (row.cantidad != null) {
            cantidad = +row.cantidad;
        }
        if (row.puntajeUnitario != null) {
            puntajeUnitario = +row.puntajeUnitario;
        }
        if (row.acreditaDocumento === true) {            
            if (row.debeIngresarCantidad === false) {
                puntajeFinal = row.puntajeMaximo;
            } else {
                puntajeUnitario = +row.puntaje;
                puntajeFinal = cantidad * puntajeUnitario;
                if (row.puntajeMaximo != null) {
                    if (puntajeFinal > row.puntajeMaximo) {
                        isOk = false;
                        row.cantidad = null;
                        row.puntajeFinal = null;
                        this.dataService.Message().msgWarning('Puntaje máximo debe ser ' + row.puntajeMaximo, () => { });
                    }
                }
            }
            if (isOk === true) {
                row.puntajeFinal = Math.trunc(puntajeFinal);
            }
        } else {
            row.cantidad = null;
            row.puntajeFinal = null;
        }

        // totalizar subtotales
        let subTotal = 0;
        let idCriterioCalificacionPadre = 0;
        this.data.forEach(element => {
            if (element.tieneSubcriterios === true) {
                idCriterioCalificacionPadre = element.idCriterioCalificacion;
                subTotal = this.getSubTotal(idCriterioCalificacionPadre);
                if (subTotal > element.puntajeMaximo) {
                    isOk = false;
                    element.puntajeFinal = null;
                    this.dataService.Message().msgWarning('Puntaje máximo debe ser ' + element.puntajeMaximo, () => { });
                } else {
                    element.puntajeFinal = Math.trunc(subTotal); // this.decimalPipe.transform(subTotal, '1.2-2')
                }
            }
        });

        let puntajeTotal = 0;
        this.data.forEach(element => {
            if (element.tieneSubcriterios != true) {
                if (element.puntajeFinal != null) {
                    puntajeTotal = puntajeTotal + element.puntajeFinal;
                }
            }
        });
        this.puntajeTotal = puntajeTotal;
        this.calcularEvent.emit();
    }

    getSubTotal = (idCriterioCalificacionPadre: number) => {
        let subTotal = 0;
        let puntajeFinal = 0;
        this.data.forEach(element => {
            if (element.idCriterioCalificacionPadre == idCriterioCalificacionPadre) {
                if (element.puntajeFinal === null) {
                    puntajeFinal = 0;
                }
                subTotal = subTotal + element.puntajeFinal;
            }
        });
        return subTotal;
    }

}

export class CriterioEvaluacionPunDataSource extends DataSource<any>{
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor() {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        // this._dataChange.next(data);
        this._dataChange.next(data || []);
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
