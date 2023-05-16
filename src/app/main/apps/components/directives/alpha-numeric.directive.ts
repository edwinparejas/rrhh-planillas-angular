import { Directive, HostListener, ElementRef, Input } from '@angular/core';
@Directive({
    selector: '[alphaNumeric]'
})
export class AlphaNumericDirective {
    regexStr = /^[\w\-/°ñÑÀÁÈÉÌÍÒÓÙÚÜÝàáèéìíòóùúüý&.\s]+$/;
    @Input() isAlphaNumeric: boolean;

    constructor(private el: ElementRef) { }


    @HostListener('keypress', ['$event']) onKeyPress(event) {
        return new RegExp(this.regexStr).test(event.key);
    }

    @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
        this.validateFields(event);
    }

    validateFields(event) {
        setTimeout(() => {
            this.el.nativeElement.value = this.el.nativeElement.value.replace(/[^\w\-/°ñÑÀÁÈÉÌÍÒÓÙÚÜÝàáèéìíòóùúüý&.\s]/g, '').replace(/\s/g, '');
            event.preventDefault();
        }, 100)
    }
}