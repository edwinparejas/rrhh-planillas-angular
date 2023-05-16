import { AfterContentChecked, Directive, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[mineduIfOnDom]'
})
export class MineduIfOnDomDirective implements AfterContentChecked
{
    isCreated: boolean;

    constructor(
        private _elementRef: ElementRef,
        private _templateRef: TemplateRef<any>,
        private _viewContainerRef: ViewContainerRef
    )
    {
        this.isCreated = false;
    }

    ngAfterContentChecked(): void
    {
        if ( document.body.contains(this._elementRef.nativeElement) && !this.isCreated )
        {
            setTimeout(() => {
                this._viewContainerRef.createEmbeddedView(this._templateRef);
            }, 300);
            this.isCreated = true;
        }
        else if ( this.isCreated && !document.body.contains(this._elementRef.nativeElement) )
        {
            this._viewContainerRef.clear();
            this.isCreated = false;
        }
    }
}
