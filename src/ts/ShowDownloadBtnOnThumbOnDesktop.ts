import { EVT } from './EVT'
import { settings } from './setting/Settings'
import { artworkThumbnail } from './ArtworkThumbnail'
import { states } from './store/States'
import { toast } from './Toast'
import { lang } from './Language'
import { IDData } from './store/StoreType'
import { Colors } from './Colors'
import { Config } from './Config'
import { store } from './store/Store'

// 在图片作品的缩略图上显示下载按钮，点击按钮会直接下载这个作品
class ShowDownloadBtnOnThumbOnDesktop {
  constructor() {
    if (Config.mobile) {
      return
    }

    // 在桌面端，只有一个下载按钮，当鼠标经过作品缩略图时才会显示下载按钮
    this.addBtn()
    this.bindEvents()
  }

  private btn!: HTMLButtonElement
  private readonly btnId = 'downloadBtnOnThumb'
  private readonly btnSize = 32

  private currentWorkId = '' // 保存触发事件的缩略图的作品 id
  private workEL?: HTMLElement // 保存触发事件的缩略图的作品元素

  private hiddenBtnTimer = 0 // 使用定时器让按钮延迟消失。这是为了解决一些情况下按钮闪烁的问题
  private hiddenBtnDelay = 100
  private doNotShowBtn = false // 当点击了按钮后，进入此状态，此状态中不会显示按钮
  // 此状态是为了解决这个问题：点击了按钮之后，按钮会被隐藏，隐藏之后，鼠标下方就是图片缩略图区域，这会触发缩略图的鼠标事件，导致按钮马上就又显示了出来。所以点击按钮之后设置这个状态，在其为 true 的期间不会显示按钮。过一段时间再把它复位。复位所需的时间很短，因为只要能覆盖这段时间就可以了：从隐藏按钮开始算起，到缩略图触发鼠标事件结束。

  private addBtn() {
    const btn = document.createElement('button')
    btn.id = this.btnId
    btn.classList.add(this.btnId)
    btn.innerHTML = `
    <svg class="icon" aria-hidden="true">
  <use xlink:href="#icon-download"></use>
</svg>`
    this.btn = document.body.appendChild(btn)
  }

  private bindEvents() {
    // 页面切换时隐藏按钮
    window.addEventListener(EVT.list.pageSwitch, () => {
      this.hiddenBtn()
    })

    window.addEventListener(EVT.list.clickBtnOnThumb, () => {
      this.hiddenBtnNow()
    })

    // 鼠标移入按钮时取消隐藏按钮
    this.btn.addEventListener('mouseenter', (ev) => {
      window.clearTimeout(this.hiddenBtnTimer)
    })

    // 鼠标移出按钮时隐藏按钮
    this.btn.addEventListener('mouseleave', () => {
      this.hiddenBtn()
    })

    // 点击按钮时发送下载任务
    this.btn.addEventListener('click', (ev) => {
      this.hiddenBtnNow()
      EVT.fire('clickBtnOnThumb')

      if (this.currentWorkId) {
        const IDData: IDData = {
          type: 'illusts',
          id: this.currentWorkId,
        }

        // 在多图作品的缩略图列表上触发时，获取 data-index 属性的值，只下载这一张图片
        if (Config.checkImageViewerLI(this.workEL)) {
          const _index = Number.parseInt(this.workEL!.dataset!.index!)
          store.setDownloadOnlyPart(Number.parseInt(this.currentWorkId), [
            _index,
          ])
        }

        EVT.fire('crawlIdList', [IDData])
      }
    })

    artworkThumbnail.onEnter((el: HTMLElement, id: string) => {
      this.currentWorkId = id
      this.workEL = el
      this.showBtn(el)
    })

    artworkThumbnail.onLeave(() => {
      this.hiddenBtn()
    })
  }

  // 显示按钮
  private showBtn(target: HTMLElement) {
    if (this.doNotShowBtn || !settings.showDownloadBtnOnThumb) {
      return
    }

    window.clearTimeout(this.hiddenBtnTimer)
    const rect = target.getBoundingClientRect()
    this.btn.style.left =
      window.scrollX +
      rect.left +
      (settings.magnifierPosition === 'left' ? 0 : rect.width - this.btnSize) +
      'px'

    let top = window.scrollY + rect.top
    // 如果显示了放大按钮，就需要增加 top 值，让下载按钮显示在放大按钮下面
    if (settings.magnifier) {
      // 在多图作品的缩略图列表上触发时，下载器不会显示放大按钮，也就不需要增加 top 值
      if (Config.checkImageViewerLI(target) === false) {
        top = top + this.btnSize + 8
      }
    }
    this.btn.style.top = top + 'px'

    this.btn.style.display = 'flex'
  }

  // 延迟隐藏按钮
  private hiddenBtn() {
    window.clearTimeout(this.hiddenBtnTimer)
    this.hiddenBtnTimer = window.setTimeout(() => {
      this.btn.style.display = 'none'
    }, this.hiddenBtnDelay)
  }

  // 立刻隐藏按钮
  private hiddenBtnNow() {
    this.doNotShowBtn = true
    window.setTimeout(() => {
      this.doNotShowBtn = false
    }, 100)

    window.clearTimeout(this.hiddenBtnTimer)
    this.btn.style.display = 'none'
  }
}

export { ShowDownloadBtnOnThumbOnDesktop }
