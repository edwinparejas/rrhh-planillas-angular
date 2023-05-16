import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { PASSPORT_MESSAGE } from "app/core/model/messages-error";
import { MISSING_TOKEN } from "app/core/model/types";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import {
    MensajesSolicitud,
    TipoFormularioBeneficioEnum,
} from "../../../_utils/constants";
import { generarFormDataUtil } from "../../../_utils/formDataUtil";

@Component({
    selector: "minedu-editar-cts-276",
    templateUrl: "./editar-cts-276.component.html",
    styleUrls: ["./editar-cts-276.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class Editarcts276Component implements OnInit {
    disabled: boolean = true;
    @Input() form: FormGroup;
    constructor(
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {}

    ngOnInit() {
        this.loadImporteBeneficio();
        this.form.get("tiempoServicioOficiales").valueChanges.subscribe((x) => {
            this.loadImporteBeneficio();
        });
        this.form.get("baseCalculo").valueChanges.subscribe((x) => {
            this.loadImporteBeneficio();
        });
        this.form.get("guardar").valueChanges.subscribe((x) => {
            if (x) this.guardar();
        });
        this.form.get("validarGenerarProyecto").valueChanges.subscribe((x) => {
            if (
                x &&
                this.form.get("tipoFormularioBeneficio").value ==
                    TipoFormularioBeneficioEnum.CTS276
            ) {
                if (this.validarGuardar()) {
                    this.form.patchValue({
                        //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
                        generarProyecto: true,
                    });
                }
            }
        });
        this.form
            .get("validarEnviarAccionesGrabadas")
            .valueChanges.subscribe((x) => {
                if (
                    x &&
                    this.form.get("tipoFormularioBeneficio").value ==
                        TipoFormularioBeneficioEnum.CTS276
                ) {
                    this.EnviarAccionesGrabadas();
                }
            });
    }
    /**
     * Métodos HTML*/
    onKeyPressnumeroInformeCalculo(e: any): boolean {
        var inp = String.fromCharCode(e.keyCode);
        if (/[a-zA-Z0-9]/.test(inp)) {
            return true;
        } else {
            e.preventDefault();
            return false;
        }
    }
    handleBuscarInformeCalculo() {}
    selectConInformeCalculo() {}
    onKeyPressBaseCalculo(e: any): boolean {
        const reg = /[0-9]|[.]/;
        const pressedKey = String.fromCharCode(
            !e.charCode ? e.which : e.charCode
        );
        if (!reg.test(pressedKey)) {
            e.preventDefault();
            return false;
        }
    }
    /**
     * Métodos Integración Back*/
    EnviarAccionesGrabadas = () => {
        if (!this.validarGuardar()) return;
        this.form.patchValue({
            //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
            accionesGrabadas: true,
        });
        let mensajeEnviar =
            "LA ACCION POR SENTENCIA JUDICIAL REQUIERE DE AUTORIZACION PARA GENERAR EL PROYECTO DE RESOLUCION ¿ESTÁ SEGURO DE QUE DESEA SOLICITAR AUTORIZACION PARA LA ACCION POR SENTENCIA JUDICIAL?";
        if (!this.form.get("mandatoJudicial").value) {
            mensajeEnviar =
                "¿ESTÁ SEGURO QUE DESEA ENVIAR A ACCIONES GRABADAS?";
        }
        this.dataService.Message().msgConfirm(
            mensajeEnviar,
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Beneficios()
                    .guardarEditarBeneficioCTS276(
                        generarFormDataUtil(this.form.value)
                    )
                    .pipe(
                        catchError((response: HttpErrorResponse) => {
                            this.dataService
                                .Message()
                                .msgWarning(response.error.messages[0]);
                            return of(null);
                        }),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response: any) => {
                        if (response) {
                            this.dataService
                                .Message()
                                .msgAutoCloseSuccessNoButton(
                                    '"OPERACIÓN REALIZADA DE FORMA EXITOSA."',
                                    3000,
                                    () => {
                                        this.form.patchValue({
                                            retornar: true,
                                        });
                                    }
                                );
                        }
                    });
            },
            () => {}
        );
    };
    validarGuardar() {
        if (!this.form.get("motivoBeneficio").value) {
            this.dataService
                .Message()
                .msgAutoCloseWarning(MensajesSolicitud.M33, 3000, () => {});
            return false;
        }
        if (!this.form.get("fechaBeneficio").value) {
            this.dataService
                .Message()
                .msgAutoCloseWarning(MensajesSolicitud.M19, 3000, () => {});
            return false;
        }
        if (!this.form.get("baseCalculo").value) {
            this.dataService
                .Message()
                .msgAutoCloseWarning(MensajesSolicitud.M20, 3000, () => {});
            return false;
        }
        return true;
    }
    guardar() {
        console.log("guardando");
        if (!this.validarGuardar()) return;
        this.dataService.Message().msgConfirm(
            "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?",
            () => {
                this.dataService.Spinner().show("sp6");

                this.dataService
                    .Beneficios()
                    .guardarEditarBeneficioCTS276(
                        generarFormDataUtil(this.form.value)
                    )
                    .pipe(
                        catchError((response: HttpErrorResponse) => {
                            this.dataService
                                .Message()
                                .msgWarning(response.error.messages[0]);
                            return of(null);
                        }),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response: any) => {
                        if (response) {
                            this.dataService
                                .Message()
                                .msgAutoCloseSuccessNoButton(
                                    '"OPERACIÓN REALIZADA DE FORMA EXITOSA."',
                                    3000,
                                    () => {
                                        this.form.patchValue({
                                            retornar: true,
                                        });
                                    }
                                );
                        }
                    });
            },
            () => {}
        );
    }
    /**
     * Métodos Util */

    loadImporteBeneficio() {
        if (this.form.get("tiempoServicioOficiales").value != null) {
            let baseCalculo = parseFloat(this.form.get("baseCalculo").value);
            let factorCalculo = parseInt(this.form.get("factorCalculo").value);
            let aniosTiempoServicio = this.form.get(
                "tiempoServicioOficiales"
            ).value;
            //3 año(s) 1 mes(es) 23 día(s)

            let indexAnio = aniosTiempoServicio.indexOf("año", 0);
            let valorAnio = parseInt(
                aniosTiempoServicio.substring(0, indexAnio).trim(),
                10
            );
            aniosTiempoServicio = aniosTiempoServicio.substring(indexAnio + 6);
            console.log("tiempoServicioOficiales", aniosTiempoServicio);
            let indexMes = aniosTiempoServicio.indexOf("mes", 0);
            let valorMes = parseInt(
                aniosTiempoServicio.substring(0, indexMes).trim(),
                10
            );
            aniosTiempoServicio = aniosTiempoServicio.substring(
                indexAnio + (valorMes < 10) ? 11 : 10
            );
            console.log("tiempoServicioOficiales", aniosTiempoServicio);
            let indexDia = aniosTiempoServicio.indexOf("día", 0);
            let valorDia = parseInt(
                aniosTiempoServicio.substring(0, indexDia).trim(),
                10
            );
            console.log("tiempoServicioOficiales", valorDia);

            let tiempoServicioCalculoAnioTexto = valorAnio + " año(s)"; //this.form.get("aniosTiempoServicio").value.substring(0,9);
            let tiempoServicioCalculoMesTexto = valorMes + " mes(es)"; //this.form.get("aniosTiempoServicio").value.substring(10,19);
            let tiempoServicioCalculoDiaTexto = valorDia + " día(s)"; //this.form.get("aniosTiempoServicio").value.substring(20);

            // let valorAnio = parseInt(this.form.get("aniosTiempoServicio").value.substring(0,2));
            // let valorMes = parseInt(this.form.get("aniosTiempoServicio").value.substring(10,1));
            // let valorDia = parseInt(this.form.get("aniosTiempoServicio").value.substring(20,1));

            let tiempoServicioCalculoAnio = valorAnio * baseCalculo;
            let tiempoServicioCalculoMes = valorMes * (baseCalculo / 12);
            let tiempoServicioCalculoDia =
                valorDia == 0 ? 0 : valorDia * (baseCalculo / 365);

            let factorCalculoformula =
                factorCalculo == 0 ? 1 : factorCalculo / 100;

            let importeBeneficio =
                (tiempoServicioCalculoAnio +
                    tiempoServicioCalculoMes +
                    tiempoServicioCalculoDia) *
                factorCalculoformula;
            importeBeneficio = parseFloat(importeBeneficio.toFixed(2));

            if (importeBeneficio.toString().length > 10) {
                this.dataService
                    .Message()
                    .msgAutoCloseWarning(
                        '"SE HA EXÉDIDO EL LÍMITE DEL IMPORTE DEL BENEFICIO."',
                        3000,
                        () => {
                            this.form.patchValue({
                                baseCalculo: 0,
                            });
                        }
                    );
            } else {
                this.form.patchValue({
                    tiempoServicioCalculoAnio:
                        tiempoServicioCalculoAnio.toFixed(2),
                    tiempoServicioCalculoMes:
                        tiempoServicioCalculoMes.toFixed(2),
                    tiempoServicioCalculoDia:
                        tiempoServicioCalculoDia.toFixed(2),

                    tiempoServicioCalculoAnioTexto:
                        tiempoServicioCalculoAnioTexto,
                    tiempoServicioCalculoMesTexto:
                        tiempoServicioCalculoMesTexto,
                    tiempoServicioCalculoDiaTexto:
                        tiempoServicioCalculoDiaTexto,

                    importeBeneficio: importeBeneficio.toFixed(2),
                });
            }
        }
    }
    
}
