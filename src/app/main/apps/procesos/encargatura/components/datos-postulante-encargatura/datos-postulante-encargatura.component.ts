import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Component({
    selector: "minedu-datos-postulante-encargatura",
    templateUrl: "./datos-postulante-encargatura.component.html",
    styleUrls: ["./datos-postulante-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class DatosPostulanteEncargaturaComponent implements OnInit {
    @Input() idPostulacion : number;
    @Input() TituloSeccion:string="Servidor Público";
    datosPostulanteEncargatura: any;
    
    constructor(private dataService: DataService) {}
    
    ngOnInit(): void {
        this.loadPostulante();
    }

    loadPostulante() {
        this.dataService.Encargatura().getDatosPostulanteEncargatura(this.idPostulacion).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.datosPostulanteEncargatura = {
                    idPostulacion: result.idPostulacion,
                    numeroExpediente: result.numeroExpediente,
                    fechaExpediente: result.fechaExpediente,
                    idServidorPublico: result.idServidorPublico,
                    fechaInicioVinculacion: result.fechaInicioVinculacion,
                    fechaFinVinculacion: result.fechaFinVinculacion,
                    numeroDocumentoIdentidad: result.numeroDocumentoIdentidad,
                    primerApellido: result.primerApellido,
                    segundoApellido: result.segundoApellido,
                    nombres: result.nombres,
                    idPlaza: result.idPlaza,
                    codigoPlaza: result.codigoPlaza,
                    idTipoPlaza: result.idTipoPlaza,
                    descripcionTipoPlaza: result.descripcionTipoPlaza,
                    idCargo: result.idCargo,
                    descripcionCargo: result.descripcionCargo,
                    codigoModular: result.codigoModular,
                    institucionEducativa: result.institucionEducativa,
                    idRegimenLaboral: result.idRegimenLaboral,
                    descripcionRegimenLaboral: result.descripcionRegimenLaboral,
                    idCategoriaRemunerativa: result.idCategoriaRemunerativa,
                    descripcionCategoriaRemunerativa: result.descripcionCategoriaRemunerativa,
                    idUgel: result.idUgel,
                    descripcionUgel: result.descripcionUgel,
                    idDre: result.idDre,
                    descripcionDre: result.descripcionDre,
                    codigoCondicionLaboral: result.codigoCondicionLaboral,
                    descripcionCondicionLaboral: result.descripcionCondicionLaboral,
                    codigoSituacionLaboral: result.codigoSituacionLaboral,
                    descripcionSituacionLaboral: result.descripcionSituacionLaboral,
                    codigoGenero: result.codigoGenero,
                    descripcionGenero: result.descripcionGenero
                }
            }
        });
    }
} 