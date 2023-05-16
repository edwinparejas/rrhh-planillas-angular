import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { forkJoin, of } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import { MESSAGE_CUADRO_30512 } from "../../../util/messages";
import {
    PlanDetalleFiltroFormModel,
    PlanDetalleFiltroModel,
} from "../../interfaces/plan-estudios.store.model";

@Component({
    selector: "minedu-form-buscar-plan-detalle",
    templateUrl: "./form-buscar-plan-detalle.component.html",
    styleUrls: ["./form-buscar-plan-detalle.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class FormBuscarPlanDetalleComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    @Output() buscarEvent: EventEmitter<any> = new EventEmitter();
    @Input() state: PlanDetalleFiltroModel;
    form: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {}

    ngAfterViewInit(): void {
        //throw new Error("Method not implemented.");
    }
    ngOnDestroy(): void {
        this.state = null;
    }

    ngOnInit(): void {
        this.buildForm();
        this.loadForm().subscribe((r) => {
            this.handleBuscarFirst();
        });
    }

    private buildForm = () => {
        const form = this.state.formModel;
        this.form = this.formBuilder.group(form);
    };

    private loadForm = () => {
        this.setLoadingAll(true);
        return forkJoin([
            this.dataService
                .CuadroHoras30512Service()
                .getComboCarreraProgramaEstudio(),
            this.dataService.CuadroHoras30512Service().getComboCiclos(),
            this.dataService
                .CuadroHoras30512Service()
                .getComboAreasCursoModulo(),
            this.dataService
                .CuadroHoras30512Service()
                .getComboComponentesCurricular(0),
            this.dataService
                .CuadroHoras30512Service()
                .getComboFormacionesProfesional(0),
        ]).pipe(
            map((resp) => {
                this.setComboCarreras(resp[0]);
                this.setComboCiclos(resp[1]);
                this.setComboCursos(resp[2]);
                this.setComboComponentes(resp[3]);
                this.setComboFormaciones(resp[4]);
                this.setLoading(false);
            }),
            catchError(() => {
                return of([]);
            }),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        );
    };

    private setLoading = (isLoading: boolean) => {
        this.state.isLoading = isLoading;
    };
    private setLoadingAll = (isLoading: boolean) => {
        this.state.isLoading = isLoading;
        this.state.filterLists.carrerasProgramas.loading = isLoading;
        this.state.filterLists.ciclos.loading = isLoading;
        this.state.filterLists.componentesCurricular.loading = isLoading;
        this.state.filterLists.formacionesAcademico.loading = isLoading;
        this.state.filterLists.cursosModulo.loading = isLoading;
    };

    private setComboCarreras = (list: any) => {
        this.state.filterLists.carrerasProgramas.list = list.map((x) => ({
            ...x,
            value: x.idCatalogoItem,
            label: `${x.descripcionCatalogoItem}`,
        }));
        this.state.filterLists.carrerasProgramas.loading = false;
    };

    private setComboCiclos = (list: any) => {
        this.state.filterLists.ciclos.list = list.map((x) => ({
            ...x,
            value: x.idCatalogoItem,
            label: `${x.descripcionCatalogoItem}`,
        }));
        this.state.filterLists.ciclos.loading = false;
    };

    private setComboCursos = (list: any) => {
        this.state.filterLists.cursosModulo.list = list.map((x) => ({
            ...x,
            value: x.idAreaCursoModulo,
            label: `${x.descripcionAreaCursoModulo}`,
        }));
        this.state.filterLists.cursosModulo.loading = false;
    };

    private setComboComponentes = (list: any) => {
        this.state.filterLists.componentesCurricular.list = list.map((x) => ({
            ...x,
            value: x.idAreaComponenteCurricular,
            label: `${x.descripcionAreaComponente}`,
        }));
        this.state.filterLists.componentesCurricular.loading = false;
    };

    private setComboFormaciones = (list: any) => {
        this.state.filterLists.formacionesAcademico.list = list.map((x) => ({
            ...x,
            value: x.idFormacionProfesional,
            label: `${x.descripcionFormacionProfesional}`,
        }));
        this.state.filterLists.formacionesAcademico.loading = false;
    };

    handleLimpiar = () => {
        const form = new PlanDetalleFiltroFormModel();
        this.form.patchValue({
            idAreaComponenteCurricular: form.idAreaComponenteCurricular,
            idCarreraProgramaEstudios: form.idCarreraProgramaEstudios,
            idCiclo: form.idCiclo,
            idCursoModulo: form.idCursoModulo,
            idFormacionProfesional: form.idFormacionProfesional,
        });
        this.state.formModel = form;
        this.handleBuscarFirst();
    };

    handleBuscar = () => {
        if (this.validateBuscar()) {
            this.state.formModel = this.form.value;
            this.buscarEvent.emit({ form: this.state.formModel });
        }
    };

    private validateBuscar = (): boolean => {
        const form = this.form.value;
        if (
            (form.idAreaComponenteCurricular == null ||
                form.idAreaComponenteCurricular == undefined) &&
            (form.idCarreraProgramaEstudios == null ||
                form.idCarreraProgramaEstudios == undefined) &&
            (form.idCiclo == null || form.idCiclo == undefined) &&
            (form.idCursoModulo == null || form.idCursoModulo == undefined) &&
            (form.idFormacionProfesional == null ||
                form.idFormacionProfesional == undefined)
        ) {
            this.dataService
                .Message()
                .msgWarning(MESSAGE_CUADRO_30512.M06, () => {});
            return false;
        }
        return true;
    };

    private handleBuscarFirst = () => {
        const form = {
            idAreaComponenteCurricular: "-1",
            idCarreraProgramaEstudios: "-1",
            idCiclo: "-1",
            idCursoModulo: "-1",
            idFormacionProfesional: "-1",
        };
        this.buscarEvent.emit({ form: form });
    };
}
