import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-informacion-postulante-calificacion',
  templateUrl: './informacion-postulante-calificacion.component.html',
  styleUrls: ['./informacion-postulante-calificacion.component.scss']
})
export class InformacionPostulanteCalificacionComponent implements OnInit {
    @Input() idPersona: number;
    Response: any;

    constructor(
        private dataService: DataService,
        public matDialogRef:MatDialogRef<InformacionPostulanteCalificacionComponent>
    ) {}

    ngOnInit(): void {
        this.obtenerInformacion();
    }

    obtenerInformacion = () => {
        var d = {
            idPersona: this.idPersona
        };

        this.dataService.Reasignaciones().getObtenerInformacionPostulante(d).pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((d: any) => {
            if (d) {
                this.Response = {
                    documento: d.documentoIdentidad,
                    numeroDocumento: d.documentoIdentidad,
                    primerApellido: d.primerApellido,
                    segundoApellido: d.segundoApellido,
                    nombres: d.nombres,
                    nacionalidad: d.nacionalidad,
                    fechaNacimiento: d.fechaNacimiento,
                    sexo: d.sexo
                };
                console.log(this.Response);
                this.calcularEdad();
            }
        });
    }

    calcularEdad() {
        console.log("FECHA NACIMIENTO : ", this.Response.fechaNacimiento)
        const fechaNacimiento = this.Response.fechaNacimiento.split("/");
        const fecha = fechaNacimiento[1] + "/" + fechaNacimiento[0] + "/" + fechaNacimiento[2];
        var hoy = new Date();
        var cumpleanos = new Date(fecha);
        var edad = hoy.getFullYear() - cumpleanos.getFullYear();
        var m = hoy.getMonth() - cumpleanos.getMonth();

        if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
            edad--;
        }

        this.Response.edad = edad;
    }
}
