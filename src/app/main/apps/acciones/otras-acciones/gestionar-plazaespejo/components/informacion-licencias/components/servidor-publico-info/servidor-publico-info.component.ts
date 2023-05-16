import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'minedu-servidor-publico-info',
    templateUrl: './servidor-publico-info.component.html',
    styleUrls: ['./servidor-publico-info.component.scss']
})
export class ServidorPublicoInfoComponent implements OnInit {
    @Input("licencia")
    licencia: any;
    
    constructor() { }

    ngOnInit(): void {
    }

}
