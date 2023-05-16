import { Component, HostBinding, Input } from '@angular/core';

@Component({
    selector   : 'minedu-nav-horizontal-item',
    templateUrl: './item.component.html',
    styleUrls  : ['./item.component.scss']
})
export class MineduNavHorizontalItemComponent
{
    @HostBinding('class')
    classes = 'nav-item';

    @Input()
    item: any;
 
    constructor()
    {

    }
}
