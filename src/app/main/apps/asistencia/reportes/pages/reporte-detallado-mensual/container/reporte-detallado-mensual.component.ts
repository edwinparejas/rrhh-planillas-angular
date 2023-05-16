import {
    AfterViewInit,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    Component,
    ViewChild,
} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { Router, ActivatedRoute } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { TakeUntilDestroy } from "@minedu/functions/TakeUntilDestroy";
import { UtilService } from "app/core/data/services/util.service";
import { ReporteDetalladoMensualStore } from "../store/reporte-detallado-mensual.store";
import { CONTROL_RUTAS } from "app/main/apps/asistencia/control-asistencia/_utils/constants";
import { PAGE_ORIGEN } from "../../../_utils/constants";
import { MatPaginator } from "@angular/material/paginator";
import { catchError, finalize, tap } from "rxjs/operators";
import { ASISTENCIA_MESSAGE, SNACKBAR_BUTTON } from "app/core/model/messages-error";
import { of } from "rxjs";
import { saveAs } from 'file-saver';

@Component({
    selector: "app-reporte-detallado-mensual",
    templateUrl: "./reporte-detallado-mensual.component.html",
    styleUrls: ["./reporte-detallado-mensual.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
@TakeUntilDestroy
export class ReporteDetalladoMensualComponent
    implements OnInit, OnDestroy, AfterViewInit {
    filtroGrid(filtroGrid: any) {
        throw new Error("Method not implemented.");
    }
    readonly state$ = this.store.select((s) => s);

    @ViewChild("paginatorReporteDetallado")
    paginator: MatPaginator;
    selection = new SelectionModel<any>(false, []);
    private origen: number = null;
    dataService: any;

    constructor(
        private store: ReporteDetalladoMensualStore,
        private router: Router,
        private route: ActivatedRoute,
        private utilService: UtilService
    ) {
        this.origen = this.route.snapshot.queryParams.origen;
        this.store.reporteDetalladoMensualSource.fechSetFormBusquedaDetallado(
            this.route.snapshot.paramMap.get("id"),
            this.route.snapshot.queryParams.descripcionMes,
            this.route.snapshot.queryParams.anio
        );
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.loadComponentIni();
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
        this.store.reporteDetalladoMensualSource.asyncGridReporteDetallado(
            pageIndex,
            pageSize
        );
    }

    private loadComponentIni = () => {
        this.store.reporteDetalladoMensualSource
            .asyncGridReporteDetalladoCabecera()
            .subscribe((resp) => {
                this.loadData(1, 20);
                this.store.reporteDetalladoMensualSource.asyncGridReporteDetalladoCabeceraSuccess(
                    resp.data[0]
                );
            });
    };

    ngOnDestroy(): void {}

    handleExportar = (): void => {
        //string idControlAsistencia, [FromQuery] string descripcionMes, [FromQuery] string anio)
         this.dataService.Spinner().show("sp6");
          this.dataService.Asistencia().postReporteDetalladoPdf(this.filtroGrid).pipe(
          catchError((e) => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.REPORTE_DETALLADO, SNACKBAR_BUTTON.CLOSE); return of(e); }),
            finalize(() => { this.dataService.Spinner().hide("sp6"); })
          ).subscribe((response: any) => {
              console.log(response);
            if (response) {
              console.log(response)
              saveAs(response, "Reporte_asistencia_detallado.pdf");
            } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
              this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
            }
          });
        
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
        const queryParams = {
            idControlAsistencia: this.route.snapshot.queryParams
                .idControlAsistencia,
            descripcionMes: this.route.snapshot.queryParams.descripcionMes,
            anio: this.route.snapshot.queryParams.anio,
        };

        const url = CONTROL_RUTAS.RUTA_CONSOLIDADO_APROBACION; // + "/bandeja/servidor";

        this.router.navigate([url], { relativeTo: this.route, queryParams });
    };
}
