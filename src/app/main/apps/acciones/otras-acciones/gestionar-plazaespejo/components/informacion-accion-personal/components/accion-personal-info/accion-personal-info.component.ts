import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'minedu-accion-personal-info',
    templateUrl: './accion-personal-info.component.html',
    styleUrls: ['./accion-personal-info.component.scss']
})
export class AccionPersonalInfoComponent implements OnInit {
    @Input('accionPersonal')
    accionPersonal: any;
    
    constructor() { }

    ngOnInit(): void {
    }

}
