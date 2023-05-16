import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { saveAs } from "file-saver";

@Component({
  selector: 'minedu-modal-comites-generados',
  templateUrl: './modal-comites-generados.component.html',
  styleUrls: ['./modal-comites-generados.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ModalComitesGeneradosComponent implements OnInit {

  selection = new SelectionModel<any>(false, []);
  dataSource: any;
  working: boolean = false;

  modal = {
    icon: "",
    title: "",
    origin: ""
  }

  displayedColumns: string[] = [
    'registro',
    'fechaCreacion',
    'acciones'
  ];

  constructor(public matDialogRef: MatDialogRef<ModalComitesGeneradosComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.modal = this.data.modal;
    var idProceso = this.data.idProceso;
    var idAlcanceProceso = this.data.idAlcanceProceso;

    /*if (this.modal.origin === 'aprobacion')
      this.dataService.GestionProcesos().getDocumentosComision(idProceso, idAlcanceProceso).pipe(
        catchError(() => { return of(null); }),
      ).subscribe(response => {
        this.dataSource = response
      });      

    if (this.modal.origin === 'proyecto')
      this.dataService.GestionProcesos().getDocumentosProyectoComite(idProceso, idAlcanceProceso).pipe(
        catchError(() => { return of(null); }),
      ).subscribe(response => {
        this.dataSource = response
      });*/

  }

  btnCancelar() {
    this.matDialogRef.close();
  }

  btnDescarga(row) {
    this.dataService.Documento().descargar(row.codigoDocumentoGenerado).pipe(
      catchError((e) => of(null)),
      finalize(() => this.dataService.Spinner().hide("sp6"))
    ).subscribe(response => {
      if (response) {
        saveAs(response, "Miembros_Comite.pdf");
      } else {
        this.dataService.Message().msgWarning('"NO SE PUDO DESCARGAR EL DOCUMENTO ADJUNTO"', () => { });
      }
    });

  }

}

