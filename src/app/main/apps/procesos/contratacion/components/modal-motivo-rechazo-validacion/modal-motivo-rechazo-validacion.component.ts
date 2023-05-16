import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from "@minedu/animations/animations";

@Component({
  selector: 'minedu-modal-motivo-rechazo-validacion',
  templateUrl: './modal-motivo-rechazo-validacion.component.html',
  styleUrls: ['./modal-motivo-rechazo-validacion.component.scss'],
  animations: mineduAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ModalMotivoRechazoValidacionComponent implements OnInit {
    // idPlazaEncargatura: number;
    mensajeMotivoRechazo="";
    detalleMotivoRechazo: any;
    idEtapaProceso:number=0;
    codigoCentroTrabajoMaestro:any="";

    constructor(
        public dialogRef: MatDialogRef<ModalMotivoRechazoValidacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        // this.idPlazaEncargatura = data.idPlazaEncargatura;
        this.mensajeMotivoRechazo = data.mensaje;
        this.idEtapaProceso = data.idEtapaProceso;
        this.codigoCentroTrabajoMaestro = data.codigoCentroTrabajoMaestro;
    }

    ngOnInit(): void {
        this.loadMotivoRechazoPlazaContratacion();
    }

    loadMotivoRechazoPlazaContratacion() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro : this.codigoCentroTrabajoMaestro
        }
        this.dataService.Contrataciones().getMotivoRechazoPlazaContratacion(request).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                console.log("resultado:", result);
                this.mensajeMotivoRechazo = result.detalleMotivoRechazo 
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}
