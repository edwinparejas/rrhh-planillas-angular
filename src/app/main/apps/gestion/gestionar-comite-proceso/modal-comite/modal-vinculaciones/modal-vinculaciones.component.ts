import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-modal-vinculaciones',
  templateUrl: './modal-vinculaciones.component.html',
  styleUrls: ['./modal-vinculaciones.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ModalVinculacionesComponent implements OnInit {

  selection = new SelectionModel<any>(false, []);
  dataSource: any;
  form: FormGroup;
  working: boolean = false;

  displayedColumns: string[] = [
    'nro',
    'instancia',
    'subInstancia',
    'centroTrabajo',
    'modalidad',
    'nivelEducativo',
    'codigoPlaza',
    'tipoPlaza',
    'regimenLaboral',
    'condicionLaboral',
    'cargo',
    'areaCurricular',
    'jornadaLaboral',
    'fechaInicio',
    'fechaFin',
  ];

  miembro: any;

  constructor(
    public matDialogRef: MatDialogRef<ModalVinculacionesComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
    this.dataSource = this.data.miembros;
    this.miembro = this.data;
  }

  btnCancelar(data?: any) {
    this.matDialogRef.close(data);
  }

  onSelect(selected: any): void {
    this.selection.clear();
    this.selection.toggle(selected);
    this.matDialogRef.close(selected);
  }

}
