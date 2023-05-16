import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MineduCopierService
{
    private textarea: HTMLTextAreaElement;

    copyText(text: string): boolean
    {
        this.createTextareaAndSelect(text);

        const copySuccessful = document.execCommand('copy');
        this._removeFake();

        return copySuccessful;
    }

    private createTextareaAndSelect(text: string): void
    {
        this.textarea = document.createElement('textarea');
        this.textarea.style.fontSize = '12pt';
        this.textarea.classList.add('cdk-visually-hidden');
        const yPosition = window.pageYOffset || document.documentElement.scrollTop;
        this.textarea.style.top = yPosition + 'px';
        this.textarea.setAttribute('readonly', '');
        this.textarea.value = text;
        document.body.appendChild(this.textarea);
        this.textarea.select();
        this.textarea.setSelectionRange(0, this.textarea.value.length);
    }

    private _removeFake(): void
    {
        if ( this.textarea )
        {
            document.body.removeChild(this.textarea);
            this.textarea = null;
        }
    }
}
