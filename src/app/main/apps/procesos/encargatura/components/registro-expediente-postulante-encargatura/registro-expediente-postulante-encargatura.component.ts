import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: "minedu-registro-expediente-postulante-encargatura",
    templateUrl: "./registro-expediente-postulante-encargatura.component.html",
    styleUrls: ["./registro-expediente-postulante-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroExpedientePostulanteEncargaturaComponent implements OnInit {
    loading: false;
    export = false;
    isMobile = false;
    form: FormGroup;
    now = new Date();
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    constructor(
        private formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {
        this.handleResponsive();
        this.buildForm();
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildForm() {
        this.form = this.formBuilder.group({
            numeroExpediente: [null, Validators.required],
            fechaExpediente: [null, Validators.required]
        });
    }
}