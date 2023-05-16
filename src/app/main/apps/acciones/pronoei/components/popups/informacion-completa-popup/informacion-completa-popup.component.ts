import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../../../../../../core/data/data.service';
import { IPronoeiGetByIdResponse } from '../../../interfaces/pronoei.interface';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { mineduAnimations } from '@minedu/animations/animations';
import { trim } from 'lodash';

@Component({
    selector: 'minedu-informacion-completa-popup',
    templateUrl: './informacion-completa-popup.component.html',
    styleUrls: ['./informacion-completa-popup.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionCompletaPopupComponent implements OnInit {

    form: FormGroup;
    pronoeiData$: Observable<IPronoeiGetByIdResponse> | null;
    pronoeiSubject = new BehaviorSubject<IPronoeiGetByIdResponse>(null);

    constructor(
        public matDialogRef: MatDialogRef<InformacionCompletaPopupComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {
        this.pronoeiData$ = this.pronoeiSubject.asObservable();
    }


    ngOnInit(): void {
        this.formBuilderInit();
        this.getPronoeiPorId();
    }

    

    async getPronoeiPorId() {
        if (this.data.idGestionPronoei) {
            const response = await this.dataService.AccionesVinculacion().getPronoeiPorId(this.data.idGestionPronoei).toPromise();
            if (response) {
                this.form.controls["checkImpedimento"].setValue(response?.checkImpedimento);
                this.pronoeiSubject.next((response as IPronoeiGetByIdResponse));
            }
        }
    }

    formBuilderInit() {
        this.form = this.formBuilder.group({
            checkImpedimento: [false]
        });

        this.form.controls["checkImpedimento"].disable();
    }

    esRegistrado(value: string | number) {
        if (value == null || value == 0 || trim(value as string) == '-') {
            return 'NO REGISTRADO'
        }
        return value;
    }

}
