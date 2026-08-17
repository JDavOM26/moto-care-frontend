import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appTableColumn]',
  standalone: true
})
export class TableColumnDefDirective {
  public columnName = input.required<string>({ alias: 'appTableColumn' });

  public template = inject(TemplateRef);
}
