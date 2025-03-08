import type {
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  Statement,
} from '@babel/types'
import { packages } from '@babel/standalone'
import { expose } from 'comlink'
import * as convert from 'convert-source-map'
import { groupBy } from 'lodash-es'
import defineCode from './define?raw'
import { isWebWorker } from './isWebWorker'

type ImportType = {
  source: string
} & (
  | {
    type: 'namespace'
    name: string
  }
  | {
    type: 'default'
    name: string
  }
  | {
    type: 'named'
    imports: Record<string, string>
  }
  )

export function transformImports(code: string): string {
  const { parser, types, generator } = packages
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
    sourceFilename: 'ctaiyi-example.ts',
  })

  const defineAst = parser.parse(defineCode, {
    sourceType: 'module',
    plugins: ['typescript'],
  })

  const grouped = groupBy(ast.program.body, it => types.isImportDeclaration(it))
  const imports = (grouped.true ?? []) as ImportDeclaration[]
  const nonImportBody = (grouped.false ?? []) as Statement[]
  if (imports.length === 0) {
    return code
  }

  const t = types

  const parsedImports = imports.flatMap((imp): ImportType[] => {
    // 解析 import 为不同类型，例如 import * as _ from 'lodash-es' 和 import React from 'react'
    // 然后分别处理
    const specifiers = imp.specifiers
    const source = imp.source.value
    const isNamespace
      = specifiers.length === 1 && t.isImportNamespaceSpecifier(specifiers[0])
    const includeDefault = specifiers.some(it =>
      t.isImportDefaultSpecifier(it),
    )
    if (isNamespace) {
      return [
        {
          type: 'namespace',
          source,
          name: specifiers[0].local.name,
        },
      ]
    }
    const namedImport = specifiers.filter(
      it => !t.isImportDefaultSpecifier(it),
    )
    const result: ImportType[] = []
    if (namedImport.length > 0) {
      result.push({
        type: 'named',
        source,
        imports: namedImport.reduce(
          (acc, it) => {
            acc[((it as ImportSpecifier).imported as Identifier).name]
              = it.local.name
            return acc
          },
          {} as Record<string, string>,
        ),
      } as ImportType)
    }
    if (includeDefault) {
      result.push({
        type: 'default',
        source,
        name: specifiers[0].local.name,
      } as ImportType)
    }
    return result
  })

  const params = parsedImports.map(imp =>
    imp.type === 'named'
      ? t.objectPattern(
          Object.entries(imp.imports).map(spec =>
            t.objectProperty(t.identifier(spec[0]), t.identifier(spec[1])),
          ),
        )
      : t.identifier(imp.name),
  )

  const newAst = t.program([
    defineAst.program.body[0],
    t.expressionStatement(
      t.callExpression(t.identifier('define'), [
        t.arrayExpression(
          parsedImports.map((it) => {
            return t.stringLiteral(it.source)
          }),
        ),
        t.arrowFunctionExpression(
          params,
          t.blockStatement(nonImportBody),
          true,
        ),
      ]),
    ),
  ])

  ast.program = newAst

  const result = generator.default(
    ast,
    {
      retainLines: true,
      sourceMaps: true,
      sourceFileName: 'ctaiyi-example.ts',
    },
    code,
  )

  const inlineSourceMap = convert.fromObject(result.map).toComment()
  return `${result.code}\n${inlineSourceMap}`
}

if (isWebWorker()) {
  expose(transformImports)
}
