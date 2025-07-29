import { lang } from './Lang'
import { Config } from './Config'
import { msgBox } from './MsgBox'
import { Utils } from './utils/Utils'
import { EVT } from './EVT'
import { setSetting, settings } from './setting/Settings'

// 显示最近更新内容
class ShowWhatIsNew {
  constructor() {
    this.bindEvents()
  }

  private flag = '17.7.4'

  private bindEvents() {
    window.addEventListener(EVT.list.settingInitialized, () => {
      // 消息文本要写在 settingInitialized 事件回调里，否则它们可能会被翻译成错误的语言
      let msg = `
      <span>${lang.transl('_扩展程序升到x版本', this.flag)}</span>
      <br>
      <br>
      <span>${lang.transl('_优化性能和用户体验')}</span>
      `

      // <strong><span>✨${lang.transl('_新增设置项')}:</span></strong
      // <strong><span>✨${lang.transl('_新增功能')}:</span></strong
      // <strong><span>⚙️${lang.transl('_行为变更')}:</span></strong>
      // <span>🗑${lang.transl('_移除设置项')}</span>
      // <span class="blue">${lang.transl('_下载间隔')}</span>

      // ${lang.transl(
      //   '_你可以在更多选项卡的xx分类里找到它',
      //   lang.transl('_下载')
      // )}

      // <br>
      // <br>
      // <span>${lang.transl('_该功能默认启用')}</span>
      // <span>${lang.transl('_修复已知问题')}</span>
      // <span>${lang.transl('_优化性能和用户体验')}</span>
      // <span>${lang.transl('_其他优化')}</span>

      // 在更新说明的下方显示赞助提示
      msg += `
      <br>
      <br>
      ${lang.transl('_赞助方式提示')}`

      this.show(msg)
    })
  }

  private show(msg: string) {
    if (Utils.isPixiv() && settings.whatIsNewFlag !== this.flag) {
      msgBox.show(msg, {
        title: Config.appName + ` ${lang.transl('_最近更新')}`,
        btn: lang.transl('_我知道了'),
      })
      setSetting('whatIsNewFlag', this.flag)
    }
  }
}

new ShowWhatIsNew()
