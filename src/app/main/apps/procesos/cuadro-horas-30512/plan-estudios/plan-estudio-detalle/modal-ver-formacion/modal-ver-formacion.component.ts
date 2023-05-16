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
import { IModalVerFormacion } from "../../interfaces/plan-estudios.store.interface";

@Component({
    selector: "minedu-modal-ver-formacion",
    templateUrl: "./modal-ver-formacion.component.html",
    styleUrls: ["./modal-ver-formacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalVerFormacionComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    state: IModalVerFormacion;
    selection = new SelectionModel<any>(false, []);

    constructor(
        public matDialogRef: MatDialogRef<ModalVerFormacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {}
    ngOnDestroy(): void {
        this.state = null;
    }

    ngAfterViewInit(): void {}

    ngOnInit(): void {
        this.state = this.data.formacion;
        this.loadForm();
    }

    private loadForm = () => {
        this.setLoadingAll(true);
        this.dataService
            .CuadroHoras30512Service()
            .getListaFormaciones(this.state.codigos)
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

    private setLista = (list: any) => {
        // this.state.grilla.formaciones = list.map((x) => ({
        //     codigoFormacionProfesional: x.codigoFormacionProfesional,
        //     descripcionFormacionProfesional: `${x.descripcionFormacionProfesional}`,
        // }));
        this.state.grilla.formaciones = list;
    };

    private setLoadingAll = (isLoading: boolean) => {
        this.state.grilla.isLoading = isLoading;
        this.state.isLoading = isLoading;
    };

    handleCancelar = (data?: any) => {
        this.matDialogRef.close(data);
    };
}
