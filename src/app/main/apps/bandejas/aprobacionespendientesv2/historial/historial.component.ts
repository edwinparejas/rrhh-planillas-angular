import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { mineduAnimations } from "@minedu/animations/animations";

@Component({
    selector: "minedu-historial",
    templateUrl: "./historial.component.html",
    styleUrls: ["./historial.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class HistorialComponent implements OnInit {
    displayedColumns: string[] = [
        "tipoUsuario",
        "instancia",
        "subInstancia",
        "usuario",
        "rol",
    ];

    historial: Array<any>= [];
    dataSource = new MatTableDataSource();
    constructor(
      @Inject(MAT_DIALOG_DATA) private data: any,
      public matDialogRef: MatDialogRef<HistorialComponent>,
    ) {}

    ngOnInit(): void {
      this.historial = this.data.historial;
      this.dataSource = this.data.historial;
    }

    cancelar() {
      this.matDialogRef.close();
    }
}
