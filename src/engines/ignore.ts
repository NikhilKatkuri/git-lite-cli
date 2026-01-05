import type { ignoreOptions } from '../types/ignore.js'

class glcIgnoreManager {
    private verbose: boolean = false

    public async run(options: ignoreOptions) {
        this.verbose = options.verbose ?? false

        const template = options.template ?? this.getTemplateName()
        this.applyTemplate(template)
    }

    private getTemplateName(): string {
        return ''
    }

    private applyTemplate(templateName: string) {}
}
export default glcIgnoreManager
