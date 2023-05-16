import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'servidorpublico-modal-reportes',
  templateUrl: './modal-reportes.component.html',
  styleUrls: ['./modal-reportes.component.scss']
})
export class ModalReportesComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router,) { }

  ngOnInit(): void {
  }

 volver(){
  this.router.navigate(['../../../'], { relativeTo: this.route });
 }
 irAnexo(num){
  this.router.navigate(['reportes-anexo/'+num], { relativeTo: this.route });
}

}
