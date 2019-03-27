const fs = require('fs-extra')
const path = require('path')
const uppercamelize = require('uppercamelcase')
// 拿到packages目录下的所以含组件的文件名字
const Components = require('./get-components')()
const packageJson = require('../package.json')
const version = process.env.VERSION || packageJson.version
const tips = `/* eslint-disable */
// This file is auto gererated by build/build-entry.js`

function buildPackagesEntry () {
  const uninstallComponents = []

  const importList = Components.map(
    name => `import Xr${uppercamelize(name)} from './${name}'`
  )
  const exportList = Components.map(name => `Xr${uppercamelize(name)}`)
  const intallList = exportList.filter(
    name => !~uninstallComponents.indexOf(uppercamelize(name))
  )
  const content = `${tips}
    ${importList.join('\n')}
    const version = '${version}'
    const components = [
      ${intallList.join(',\n  ')}
    ]
    const install = Vue => {
      if (install.installed) return
      install.installed = true
      components.forEach(Component => {
        Vue.use(Component)
      })
    };
    /* istanbul ignore if */
    if (typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }
    export {
      install,
      version,
      ${exportList.join(',\n  ')}
    }
    export default {
      install,
      version
    }
    `

  fs.writeFileSync(path.join(__dirname, '../packages/index.js'), content)
}

buildPackagesEntry()