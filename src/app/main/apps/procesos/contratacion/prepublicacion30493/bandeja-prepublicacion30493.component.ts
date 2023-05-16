import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionViewer, SelectionModel, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, of, Observable } from "rxjs";
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize, map, tap } from "rxjs/operators";
import { MatPaginator } from '@angular/material/paginator';
import { regimenLaboral } from 'app/main/apps/acciones/desplazamiento/_utils/constants';


@Component({
	selector: 'minedu-bandeja-prepublicacion30493',
	templateUrl: './bandeja-prepublicacion30493.component.html',
	styleUrls: ['./bandeja-prepublicacion30493.component.scss']
})
export class BandejaPrepublicacion30493Component implements OnInit {
    validacionPlaza: string;
    firstTime = true;
    idEtapaProceso: number;
    codSedeCabecera: string = '000000'; // added
    routerLinks:any;
    selectionDocentes = new SelectionModel<any>(true, []);
    dataSourceDocentes: PlazasContratacionDocentesDataSource | null;
    paginatorDocentes: any;
    request:any;
    esInicio:boolean = true;
    regimenLaboralEnum:any = regimenLaboral;
    constructor(
	private route: ActivatedRoute,
	private dataService: DataService,
    ) {
    }

    ngOnInit(): void {
	this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
	this.routerLinks = [
	    {
		routerLink:['/ayni/personal/procesospersonal/procesos/contratacion'],
		text: "Contratación"
	    },
	    {
		routerLink:['/ayni/personal/procesospersonal/procesos/contratacion/prepublicacion30493/',this.idEtapaProceso],
		text: "Prepublicación"
	    }
	];
	this.buildDataSource();
	this.obtenerPlazaContratacion();
    }

    buildDataSource =()=> {
         this.dataSourceDocentes = new PlazasContratacionDocentesDataSource(this.dataService);
    }

    obtenerPlazaContratacion(): void {
        let request = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.codSedeCabecera
        }
        
        this.dataService.Contrataciones()
	    .getObtenerPlazaContratacionPorIdEtapaProceso(request)
	    .pipe(
		catchError((e) => of([e])),
		finalize(() => {})
	    ).subscribe((response: any) => {
		if (response) {
		    if (response.length > 0) {
			this.validacionPlaza = response[0].estadoValidacionPlaza;
		    }
		    else {
			this.validacionPlaza = 'PENDIENTE';
		    }
		}
	    });
    }

    handleSearch = (request:any = null) => {
	if(request != null)
	    this.request = request;
	this.buscarPlazasContratacionDocentes(this.request);
    };

    handPaginator = (paginator:any) => {
	if(!this.paginatorDocentes){
	    this.paginatorDocentes = paginator;
	}
	else{
	    this.paginatorDocentes = paginator;
	    this.buscarPlazasContratacionDocentes(this.request);
	}
    };

    private buscarPlazasContratacionDocentes = (request:any) => {
	let requestNew:any = {
	    ...request,
	    idRegimenLaboral:this.regimenLaboralEnum.LEY_30493
	};

	this.selectionDocentes = new SelectionModel<any>(true, []);
	this.dataSourceDocentes.load(
	    requestNew,
	    this.paginatorDocentes.pageIndex + 1,
	    this.paginatorDocentes.pageSize,
	    this.firstTime
	);
    };
}

export class PlazasContratacionDocentesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    public totalregistroglobal=0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime = false): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            data.esBecario = false;
            
            this.dataService.Contrataciones().buscarPlazasContratacionPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
                console.log("DataSource plazasContratacion response: ", plazasContratacion);
                this.totalregistroglobal += this.totalregistro; // *******************

                if (((plazasContratacion || []).length === 0 || this.totalregistroglobal === 0) && !firstTime) {
                    // this.dataService.Message().msgWarning('"NO SE ENCONTRÓ PLAZAS DE CONTRATACIÓN DOCENTE PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
                }
		
            });
        }
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
