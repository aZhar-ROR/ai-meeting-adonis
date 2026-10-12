import type { ApplicationService } from '@adonisjs/core/types'

export default class EdgeCompatProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    const edge = await import('edge.js').then((m) => m.default)

    // edge.js v6 removed @layout/@section from non-compat mode.
    // Register them as recognized tags so the lexer tokenizes them,
    // then enable compat mode so the compiler merges sections with layouts.
    edge.registerTag({
      tagName: 'layout',
      seekable: true,
      block: false,
      compile(_parser, _buffer, _token) {},
    })

    edge.registerTag({
      tagName: 'section',
      seekable: true,
      block: true,
      compile(parser, buffer, token) {
        token.children.forEach((child: any) => parser.processToken(child, buffer))
      },
    })

    edge.compiler.compat = true
    edge.asyncCompiler.compat = true
  }
}
