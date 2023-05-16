import { Directive, Input, TemplateRef } from '@angular/core';
@Directive({
    selector: '[libTemplate]',
    host: {
    }
})
export class TemplateDirective {
    @Input('libTemplate') name: string;
    constructor(public template: TemplateRef<any>) { }
    getType(): string {
        return this.name;
    }
}
