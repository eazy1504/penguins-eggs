/**
 * penguins-eggs: 
 * author: Piero Proietti
 * mail: piero.proietti@gmail.com
 *
 */

// packages
import fs from 'fs'
import mustache from 'mustache'
import Settings from './settings'
import Utils from './utils'

// libraries
import { exec } from '../lib/utils'

/**
 * I18n
 */
export default class I18n {
  verbose = false

  echo = {}

  toNull = ''

  chroot = '/'

  settings = {} as Settings

  constructor(chroot = '/', verbose = false) {
    this.verbose = verbose
    this.echo = Utils.setEcho(verbose)
    if (this.verbose) {
      this.toNull = ' > /dev/null 2>&1'
    }
    this.settings = new Settings()
    this.chroot = chroot
  }


  /**
   * reinstall
   */
  async reinstall() {
    Utils.warning('reinstalling locales')
    await exec('apt-get purge locales --yes', this.echo)
    await exec('apt-get reinstall locales --yes', this.echo)
    process.exit()
  }

  /**
   * 
   */
  async generate(fromSettings = true, defaultLocale = 'en_EN.UTF-8', locales = ['en_EN.UTF-8']) {

    if (fromSettings) {
      this.settings.load()

      Utils.warning("Configuring locales from /etc/penguins-eggs.d/eggs.yml")
      defaultLocale = this.settings.config.locales_default
      locales = []
      for (let i = 0; i < this.settings.config.locales.length; i++) {
        locales.push(this.settings.config.locales[i])
      }
    } else {
      Utils.warning("Configuring locales from krill")
    }
    console.log(`default: ${defaultLocale}`)
    console.log('create locales:')
    for (let i = 0; i < locales.length; i++) {
      console.log(`- ${locales[i]}`)
    }

    await this.localeGen(locales)
    await this.defaultLocale(defaultLocale)
    await this.localeConf(defaultLocale)
    await exec(`chroot ${this.chroot} /usr/sbin/locale-gen`, this.echo)
  }

  /**
   * localeGen
   */
  private async localeGen(locales: string[]) {
    let lgt = ''
    lgt += '# File generated by penguins-eggs\n'
    lgt += '# This file lists locales that you wish to have built. You can find a list\n'
    lgt += '# of valid supported locales at /usr/share/i18n/SUPPORTED, and you can add\n'
    lgt += '# user defined locales to /usr/local/share/i18n/SUPPORTED. If you change\n'
    lgt += '# this file, you need to rerun locale-gen.\n'
    lgt += '{{#locales}}\n'
    lgt += '{{{locale}}}\n'
    lgt += '{{/locales}}\n'

    const viewGen = { locales: [{}] }
    for (let i = 0; i < locales.length; i++) {
      viewGen.locales.push({ locale: locales[i] + ' UTF-8' })
    }
    const destGen = `${this.chroot}/etc/locale.gen`
    // console.log(mustache.render(lgt, viewGen))
    fs.writeFileSync(destGen, mustache.render(lgt, viewGen))
  }

  /**
   * /etc/locale.conf
   */
  private async localeConf(defaultLocale: string) {
    let lct = ''
    lct += '#  File generated by penguins-eggs\n'
    lct += 'LANG={{{locale}}}\n'
    lct += 'LC_ADDRESS={{{locale}}}\n'
    lct += 'LC_IDENTIFICATION={{{locale}}}\n'
    lct += 'LC_MEASUREMENT={{{locale}}}\n'
    lct += 'LC_MONETARY={{{locale}}}\n'
    lct += 'LC_NAME={{{locale}}}\n'
    lct += 'LC_NUMERIC={{{locale}}}\n'
    lct += 'LC_PAPER={{{locale}}}\n'
    lct += 'LC_TELEPHONE={{{locale}}}\n'
    lct += 'LC_TIME={{{locale}}}\n'
    const destConf = `${this.chroot}/etc/locale.conf`
    const view = {
      locale: defaultLocale
    }
    // console.log(mustache.render(lct, view))
    fs.writeFileSync(destConf, mustache.render(lct, view))
  }

  /**
 * /etc/default/locale
 */
  private async defaultLocale(defaultLocale: string) {
    let lct = ''
    lct += '#  File generated by penguins-eggs\n'
    lct += 'LANG={{{locale}}}\n'
    lct += 'LC_ADDRESS={{{locale}}}\n'
    lct += 'LC_IDENTIFICATION={{{locale}}}\n'
    lct += 'LC_MEASUREMENT={{{locale}}}\n'
    lct += 'LC_MONETARY={{{locale}}}\n'
    lct += 'LC_NAME={{{locale}}}\n'
    lct += 'LC_NUMERIC={{{locale}}}\n'
    lct += 'LC_PAPER={{{locale}}}\n'
    lct += 'LC_TELEPHONE={{{locale}}}\n'
    lct += 'LC_TIME={{{locale}}}\n'
    const destConf = `${this.chroot}/etc/default/locale`
    const view = {
      locale: defaultLocale
    }
    // console.log(mustache.render(lct, view))
    fs.writeFileSync(destConf, mustache.render(lct, view))
  }
}
