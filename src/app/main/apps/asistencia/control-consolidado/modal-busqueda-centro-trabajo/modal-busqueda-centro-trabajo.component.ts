import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";

import { mineduAnimations } from "@minedu/animations/animations";
import { SelectionModel } from "@angular/cdk/collections";
import { FormGroup, FormBuilder } from "@angular/forms";
import { BandejaCentroTrabajoStore } from "../../store/bandeja-centro-trabajo.store";
import {
    BusquedaCentroTrabajoListaModel,
    ModalBusquedaCentroTrabajoModel,
} from "../../store/bandeja-centro-trabajo.model";
import { MatPaginator } from "@angular/material/paginator";
import { tap } from "rxjs/operators";
import { DataService } from "app/core/data/data.service";

@Component({
    selector: "app-modal-busqueda-centro-trabajo",
    templateUrl: "./modal-busqueda-centro-trabajo.component.html",
    styleUrls: ["./modal-busqueda-centro-trabajo.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalBusquedaCentroTrabajoComponent implements OnInit {
    state$: Observable<ModalBusquedaCentroTrabajoModel>;
    bandejaCentroTrabajoStore: BandejaCentroTrabajoStore;
    selection = new SelectionModel<any>(false, []);
    form: FormGroup;
    @ViewChild("paginatorModalBusquedaCentroTrabajo")
    paginator: MatPaginator;

    constructor(
        public matDialogRef: MatDialogRef<ModalBusquedaCentroTrabajoComponent>,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        this.buildForm();
        setTimeout(() => {
            this.paginator.showFirstLastButtons = true;
            this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
            this.paginator._intl.nextPageLabel = "Siguiente página";
            this.paginator._intl.previousPageLabel = "Página anterior";
            this.paginator._intl.firstPageLabel = "Primera página";
            this.paginator._intl.lastPageLabel = "Última página";
        });
    }

    ngAfterViewInit(): void {
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

    loadData(p: number, pp: number) {
        this.bandejaCentroTrabajoStore.modalBusquedaCentroTrabajoSource.asynLoadGrillaModalBusquedaCentroTrabajo(
            undefined,
            p,
            pp
        );
    }

    private buildForm = () => {
        this.state$ = this.bandejaCentroTrabajoStore.select(
            (s) => s.modalBusquedaCentroTrabajoModel
        );

        const request = {
            idDre: null,
            idUgel: null,
        };

        this.form = this.formBuilder.group(request);

        this.form.get("idDre").valueChanges.subscribe((value) => {
            this.form.patchValue({ idUgel: null });
            this.bandejaCentroTrabajoStore.modalBusquedaCentroTrabajoSource.asyncLoadComboUgeles(
                value
            );
        });
    };

    handleLimpiar = () => {
        this.form.clearValidators();
        this.form.reset();
    };

    handleBuscar = () => {
        const form = this.form.value;
        if (form.idDre) {
            const p = this.paginator.pageIndex + 1;
            const pp = this.paginator.pageSize;

            this.bandejaCentroTrabajoStore.modalBusquedaCentroTrabajoSource.asynLoadGrillaModalBusquedaCentroTrabajo(
                this.form.value,
                p,
                pp
            );
        } else {
            this.dataService
                .Message()
                .msgWarning(
                    "Ingrese al menos un criterio de búsqueda.",
                    () => {}
                );
            return;
        }
    };

    handleSelectedRow = (row: BusquedaCentroTrabajoListaModel) => {
        this.selection.clear();
        this.selection.toggle(row);
        return row;
    };
}
