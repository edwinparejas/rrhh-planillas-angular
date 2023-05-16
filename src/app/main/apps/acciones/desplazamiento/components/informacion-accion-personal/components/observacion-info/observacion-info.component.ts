import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'minedu-observacion-info',
    templateUrl: './observacion-info.component.html',
    styleUrls: ['./observacion-info.component.scss']
})
export class ObservacionInfoComponent implements OnInit {
    @Input('accionPersonal')
    accionPersonal: any;
    constructor() { }

    ngOnInit(): void {
    }

}
