import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { RechazarPlazasComponent } from '../rechazar-plazas/rechazar-plazas.component';

@Component({
  selector: 'minedu-plazas-convocar',
  templateUrl: './plazas-convocar.component.html',
  styleUrls: ['./plazas-convocar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class PlazasConvocarComponent implements OnInit {
  form: FormGroup;

  request = {
    idCodigoModular: '',
    idCodigoPlaza: ''
  };

  displayedColumns: string[] = [
    'registro',
    'codigo_modular',
    'centro_trabajo',
    'modalidad',
    'nivel_educativo',
    'tipo_gestion',
    'codigo_plazas',
    'cargo',
    'area_curricular',
    'tipo_plaza',
    'vigencia_inicio',
    'vigencia_fin',
    'acciones'
  ];
  dialogRef: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  isMobile = false;
  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
      return true;
    } else {
      return false;
    }
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      idCodigoModular: null,
      idCodigoPlaza: null
    });
  }

  handleRetornar(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  dialogRechazarPlazas = () => {
    this.dialogRef = this.materialDialog.open(RechazarPlazasComponent, {

        panelClass: 'minedu-rechazar-plazas-dialog',
        width: '50%',
        disableClose: true,
        data: {
            action: 'busqueda'
        },
    });
}

}
