import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[mineduWidgetToggle]'
})
export class MineduWidgetToggleDirective
{   
    constructor(
        public elementRef: ElementRef
    )
    {
    }
}
