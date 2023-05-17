import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: "minedu-modal-haberes-descuentos",
    templateUrl: "./modal-haberes-descuentos.component.html",
    styleUrls: ["./modal-haberes-descuentos.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class ModalHaberesDescuentosComponent implements OnInit {
    modal = {
        icon: "",
        title: "",
        origin: "",
    };

    form: FormGroup;

    listas = {
        planillaTipoPago: [
            {
                id: 1,
                descripcion: "Remuneración Mensual",
            },
            {
                id: 2,
                descripcion: "Ocasional",
            },
        ],
        tipoCalculo: [
            {
                id: 1,
                descripcion: "Formula",
            },
            // {
            //     id: 2,
            //     descripcion: "Formula por Situación",
            // },
            {
                id: 3,
                descripcion: "Manual Fijo",
            },
            // {
            //     id: 4,
            //     descripcion: "Manual Variable",
            // },
            {
                id: 5,
                descripcion: "Permite Reg. Manual",
            },
        ],
        ingresoInformacion: [
            {
                id: 1,
                descripcion: "Carga masiva",
            },
        ],
    };

    constructor(
        public matDialogRef: MatDialogRef<ModalHaberesDescuentosComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.modal = this.data.modal;
        this.buildForm();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            regimenLaboral: [null],
            codigo: [null],
            descripcion: [null],
            descripcionCorta: [null],
            verEnBoleta: [null],
            ordenPresentacion: [null],
            tipoConcepto: [null],
            grupoCalculo: [null],
            prioridadCalculo: [null],
            grupoDescuento: [null],
            prioridadDentroGrupoDescuento: [null],
            fechaInicio: [null],
            fechaFin: [null],
            estado: [null],
            planillaTipoPago: [null],
            tipoCalculo: [null],
            ingresoInformacion: [null],
            marcoLegal: [null],
            anotaciones: [null],
            equivalenciaCodigoMCPP: [null],
            equivalenciaDescripcionMCPP: [null],
            equivalenciaCodigoSUNAT: [null],
            equivalenciaDescripcionSUNAT: [null],
            clasificadorGasto: [null],
        });
    }
}
