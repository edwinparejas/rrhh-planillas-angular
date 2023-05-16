import {
    Component,
    OnInit,
    OnDestroy,
    ViewEncapsulation,
    AfterViewInit,
    ViewChild,
} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { Router, ActivatedRoute } from "@angular/router";
import { ReporteConsolidadoMensualStore } from "../store/reporte-consolidado-mensual.store";
import { SelectionModel } from "@angular/cdk/collections";
import { UtilService } from "app/core/data/services/util.service";
import { tap } from "rxjs/operators";
import { TakeUntilDestroy } from "@minedu/functions/TakeUntilDestroy";
import { CONTROL_RUTAS } from "app/main/apps/asistencia/control-asistencia/_utils/constants";
import { PAGE_ORIGEN } from "../../../_utils/constants";
import { MatPaginator } from "@angular/material/paginator";

@Component({
    selector: "app-reporte-consolidado-mensual",
    templateUrl: "./reporte-consolidado-mensual.component.html",
    styleUrls: ["./reporte-consolidado-mensual.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
@TakeUntilDestroy
export class ReporteConsolidadoMensualComponent
    implements OnInit, OnDestroy, AfterViewInit {
    readonly state$ = this.store.select((s) => s);

    @ViewChild("paginatorReporteConsolidado")
    paginator: MatPaginator;
    selection = new SelectionModel<any>(false, []);
    private origen: number = null;

    constructor(
        private store: ReporteConsolidadoMensualStore,
        private router: Router,
        private route: ActivatedRoute,
        private utilService: UtilService
    ) {
        this.origen = this.route.snapshot.queryParams.origen;
        this.store.reporteConsolidadoMensualSource.setFormBusquedaConsolidado(
            this.route.snapshot.paramMap.get("id"),
            this.route.snapshot.queryParams.descripcionMes,
            this.route.snapshot.queryParams.anio
        );
    }

    ngOnInit(): void {      
        setTimeout(() => {
            this.loadData(1, 20);
            this.paginator.showFirstLastButtons = true;
            this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
            this.paginator._intl.nextPageLabel = "Siguiente página";
            this.paginator._intl.previousPageLabel = "Página anterior";
            this.paginator._intl.firstPageLabel = "Primera página";
            this.paginator._intl.lastPageLabel = "Última página";
        });
    }

    ngAfterViewInit() {
        this.paginator.page
            .pipe(
                tap(() =>
                    this.loadData(
                        this.paginator.pageIndex + 1,
                        this.paginator.pageSize
                    )
                )
            )
            .subscribe();
    }

    loadData(pageIndex: number, pageSize: number) {
        this.store.reporteConsolidadoMensualSource.asyncGridReporteConsolidado(
            pageIndex,
            pageSize
        );
    }

    ngOnDestroy(): void {}

    handleExportar = (): void => {
        this.store.reporteConsolidadoMensualSource.asyncDownloadExcel();
    };

    handleRetornar = () => {
        if (this.origen == PAGE_ORIGEN.MENSUAL) {
            this.fetchRetornarMensual();
        }
        if (this.origen == PAGE_ORIGEN.CENTRO_TRABAJO) {
            this.fetchRetornarCentroTrabajo();
        }
        if (this.origen == PAGE_ORIGEN.SERVICOR) {
            this.fetchRetornarServidor();
        }
        if (this.origen == PAGE_ORIGEN.CONSOLIDADO_APROBACION) {
            this.fetchRetornarConsolidadoAprobacion();
        }
    };

    private fetchRetornarMensual = () => {
        this.router.navigateByUrl(CONTROL_RUTAS.RUTA_BANDEJA, {
            relativeTo: this.route,
        });
    };

    private fetchRetornarCentroTrabajo = () => {
        const queryParams = {
            idConsolidadoIged: this.route.snapshot.queryParams
                .idConsolidadoIged,
            descripcionMes: this.route.snapshot.queryParams.descripcionMes,
            anio: this.route.snapshot.queryParams.anio,
        };
        const url = CONTROL_RUTAS.RUTA_CENTRO; // + "/consolidado/centro-trabajo";
        this.router.navigate([url], { relativeTo: this.route, queryParams });
    };

    private fetchRetornarServidor = () => {
        const queryParams = {
            idControlAsistencia: this.route.snapshot.queryParams
                .idControlAsistencia,
            descripcionMes: this.route.snapshot.queryParams.descripcionMes,
            anio: this.route.snapshot.queryParams.anio,
        };

        const url = CONTROL_RUTAS.RUTA_SERVIDOR; // + "/bandeja/servidor";

        this.router.navigate([url], { relativeTo: this.route, queryParams });
    };
    private fetchRetornarConsolidadoAprobacion = () => {
        this.router.navigateByUrl(CONTROL_RUTAS.RUTA_CONSOLIDADO_APROBACION, {
            relativeTo: this.route,
        });
    };
}