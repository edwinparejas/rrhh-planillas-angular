import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-grilla-vinculacion-vigente',
  templateUrl: './grilla-vinculacion-vigente.component.html',
  styleUrls: ['./grilla-vinculacion-vigente.component.scss'],
  animations: mineduAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class GrillaVinculacionVigenteComponent 
       implements OnInit {
    @Input() dataSourcePlazasVinculadas: any[] = [];
    isMobile = false;
    displayedColumnsPlazas: string[] = [
        "registro",
        "instancia",
        "subInstancia",
        "centroTrabajo",
        "modalidad",
        "nivelEducativo",
        "codigoPlaza",
        "tipoPlaza",
        "regimenLaboral",
        "condicionLaboral",
        "cargo",
        "areaCurricular",
        "jornadaLaboral",
        "fechaInicio",
        "fechaFin",
    ];

    constructor(
	private dataService: DataService,
    ) { }

    ngOnInit(): void {
	this.getIsMobile();
    }

    handleResponsive(): void {
	this.isMobile = this.getIsMobile();
	window.onresize = () => {
	    this.isMobile = this.getIsMobile();
	};
    }

    getIsMobile(): boolean {
	const w = document.documentElement.clientWidth;
	const breakpoint = 992;
	if (w < breakpoint) {
	    return true;
	} else {
	    return false;
	}
    }

    getVinculacionPostulante(numeroDocumentoIdentidad:string) {
	this.dataService.Spinner().hide("sp6");
	this.dataService.Contrataciones()
	.getVinculacionPostulanteByNumeroDocumento(numeroDocumentoIdentidad)
	.pipe(
	    catchError(() => of([])),
	    finalize(() => {
		this.dataService.Spinner().hide("sp6");
	    })).subscribe((response: any) => {
		if (response && response.length != 0) {
		    this.dataSourcePlazasVinculadas = response;
		}
	    });
    }
}
