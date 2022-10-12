import { Resolver } from '@parcel/plugin'
import {
  PackageJSON,
  FilePath,
  FileCreateInvalidation,
  SpecifierType,
  SemverRange,
  SourceLocation,
  Dependency,
  PluginOptions,
  PluginLogger
} from '@parcel/types'
import path from 'path'
import NodeResolver from '@parcel/node-resolver-core'

interface Module {
  moduleName?: string
  subPath?: string
  moduleDir?: FilePath
  filePath?: FilePath
  code?: string
  query?: URLSearchParams
}
interface ResolverContext {
  invalidateOnFileCreate: FileCreateInvalidation[]
  invalidateOnFileChange: Set<FilePath>
  specifierType: SpecifierType
  range?: SemverRange | null | undefined
  loc?: SourceLocation | null | undefined
}
interface InternalPackageJSON extends PackageJSON {
  pkgdir: string
  pkgfile: string
}

const WEBPACK_IMPORT_REGEX = /^\w+-loader(?:\?\S*)?!/

export default new Resolver({
  async resolve ({
    dependency,
    options,
    specifier,
    logger
  }: {
    dependency: Dependency
    options: PluginOptions
    specifier: string
    logger: PluginLogger
  }) {
    if (WEBPACK_IMPORT_REGEX.test(dependency.specifier)) {
      throw new Error(
        `The import path: ${dependency.specifier} is using webpack specific loader import syntax, which isn't supported by Parcel.`
      )
    }

    if (
      !specifier.endsWith('.mjs') &&
      !specifier.endsWith('.jsx') &&
      !specifier.endsWith('.js')
    ) {
      return null
    }

    const resolver = new NodeResolver({
      fs: options.inputFS,
      projectRoot: options.projectRoot,
      extensions: ['mjs', 'jsx', 'js', 'mts', 'tsx', 'ts'],
      mainFields: ['source', 'browser', 'module', 'main'],
      packageManager: options.packageManager,
      shouldAutoInstall: options.shouldAutoInstall,
      logger
    })
    const ctx: ResolverContext = {
      invalidateOnFileCreate: [],
      invalidateOnFileChange: new Set(),
      specifierType: dependency.specifierType,
      range: dependency.range,
      loc: dependency.loc
    }
    const builtin: { name: string, range: string } | null =
      resolver.findBuiltin(specifier, dependency.env)
    const modulePath: Module | null = resolver.findNodeModulePath(
      specifier,
      (builtin == null && (dependency.resolveFrom ?? false)) ||
        path.join(options.projectRoot, 'index'),
      ctx
    )

    if (modulePath != null) {
      return null
    }

    const packageJson: InternalPackageJSON | null = await resolver.findPackage(
      dependency.resolveFrom,
      ctx
    )
    const isEsmExtension: boolean =
      dependency.resolveFrom?.endsWith('.mts') ?? false
    const isCjsExtension: boolean =
      (dependency.resolveFrom?.endsWith('.tsx') ?? false) ||
      (dependency.resolveFrom?.endsWith('.ts') ?? false)

    if (
      !isEsmExtension &&
      (!isCjsExtension || packageJson?.type !== 'module')
    ) {
      return null
    }

    return resolver.resolve({
      filename: specifier.slice(0, -1 * (specifier.endsWith('.js') ? 3 : 4)),
      specifierType: dependency.specifierType,
      range: dependency.range,
      parent: dependency.resolveFrom,
      env: dependency.env,
      sourcePath: dependency.sourcePath,
      loc: dependency.loc
    })
  }
})
