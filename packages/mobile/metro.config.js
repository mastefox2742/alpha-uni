// metro.config.js
// Configuration Metro pour monorepo — résout @unigest/shared depuis packages/shared

const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Inclut les dossiers du workspace dans la résolution des modules
config.watchFolders = [workspaceRoot]

// Résolution des packages du workspace (@unigest/*)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Alias pour @/ → répertoire courant (expo-router + tsconfig paths)
config.resolver.extraNodeModules = {
  '@unigest/shared': path.resolve(workspaceRoot, 'packages/shared/src'),
}

module.exports = config
