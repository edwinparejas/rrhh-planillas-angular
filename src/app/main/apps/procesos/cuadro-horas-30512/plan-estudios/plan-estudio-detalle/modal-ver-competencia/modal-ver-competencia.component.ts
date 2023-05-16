import { SelectionModel } from "@angular/cdk/collections";
import {
    AfterViewInit,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { IModalVerCompetencia } from "../../interfaces/plan-estudios.store.interface";

@Component({
    selector: "minedu-modal-ver-competencia",
    templateUrl: "./modal-ver-competencia.component.html",
    styleUrls: ["./modal-ver-competencia.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalVerCompetenciaComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    state: IModalVerCompetencia;
    selection = new SelectionModel<any>(false, []);

    constructor(
        public matDialogRef: MatDialogRef<ModalVerCompetenciaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {}
    ngAfterViewInit(): void {}

    ngOnDestroy(): void {
        this.state = null;
    }

    ngOnInit(): void {
        this.state = this.data.competencia;
        this.loadForm();
    }

    private loadForm = () => {
        this.setLoadingAll(true);
        this.dataService
            .CuadroHoras30512Service()
            .getListaComponentes(this.state.codigos)
            .subscribe(
                (resp) => {
                    this.setLista(resp);
                    this.setLoadingAll(false);
                },
                (error) => {
                    this.dataService.Util().msgWarning(error.error.messages[0]);
                    return of(null);
                }
            );
    };

    private setLoadingAll = (isLoading: boolean) => {
        this.state.grilla.isLoading = isLoading;
        this.state.isLoading = isLoading;
    };

    private setLista = (list: any) => {
        // this.state.grilla.competencias = list.map((x) => ({
        //     codigoCompetenciaNivel: x.codigoCompetenciaNivel,
        //     descripcionCompetenciaNivel: `${x.descripcionCompetenciaNivel}`,
        // }));
        this.state.grilla.competencias = list;
    };

    handleCancelar = (data?: any) => {
        this.matDialogRef.close(data);
    };
}
