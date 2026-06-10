import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private readonly cache = new Map<string, Handlebars.TemplateDelegate>();

  render(templateName: string, context: Record<string, unknown> = {}): string {
    if (!this.cache.has(templateName)) {
      const filePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
      const source = fs.readFileSync(filePath, 'utf-8');
      this.cache.set(templateName, Handlebars.compile(source));
    }
    return this.cache.get(templateName)!(context);
  }
}
