import { AfterContentInit, Component, ContentChildren, ElementRef, HostBinding, QueryList, Renderer2, ViewEncapsulation } from '@angular/core';
import { MineduWidgetToggleDirective } from './widget-toggle.directive';

@Component({
    selector     : 'minedu-widget',
    templateUrl  : './widget.component.html',
    styleUrls    : ['./widget.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class MineduWidgetComponent implements AfterContentInit
{
    @HostBinding('class.flipped')
    flipped = false;

    @ContentChildren(MineduWidgetToggleDirective, {descendants: true})
    toggleButtons: QueryList<MineduWidgetToggleDirective>;

    constructor(
        private _elementRef: ElementRef,
        private _renderer: Renderer2
    )
    {
    }

    ngAfterContentInit(): void
    {
        setTimeout(() => {
            this.toggleButtons.forEach(flipButton => {
                this._renderer.listen(flipButton.elementRef.nativeElement, 'click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.toggle();
                });
            });
        });
    }

    toggle(): void
    {
        this.flipped = !this.flipped;
    }

}
