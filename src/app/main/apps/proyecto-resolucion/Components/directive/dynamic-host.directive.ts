import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[mineduDynamicHost]'
})
export class DynamicHostDirective {

  constructor(
    public viewContainerRef: ViewContainerRef
  ) { }

}
