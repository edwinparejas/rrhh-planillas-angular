import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/core/data/data.service';

@Component({
  selector: 'minedu-desarrollo',
  templateUrl: './desarrollo.component.html',
  styleUrls: ['./desarrollo.component.scss']
})
export class DesarrolloComponent implements OnInit {

  constructor(private dataService:DataService) { }

  ngOnInit(): void {
    // this.dataService.Asistencia().getAsistencia({}).pipe(
      
    // ).subscribe(response=>{});
  }

}
