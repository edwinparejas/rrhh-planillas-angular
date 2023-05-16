import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';

@Component({
  selector: 'minedu-designacion-plaza-lista',
  templateUrl: './designacion-plaza-lista.component.html',
  styleUrls: ['./designacion-plaza-lista.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class DesignacionPlazaListaComponent implements OnInit {
 
  proceso: any = null;
  form: FormGroup;
  working: boolean = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private materialDialog: MatDialog,
    private sharedService: SharedService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      codigoPlaza: [null],
      codigoModular: [null]     
    });
    
  }

  handleEnviarConsolidado(){


  }
  handleLimpiar(){

  }

  handleBuscar(form){

  }

  buscarCentroTrabajo(event){

  }

  buscarPlaza(event){

  }

  handleRegresar(){
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
