//初始化小说作品页
import { InitPageBase } from '../crawl/InitPageBase'
import { Colors } from '../Colors'
import { lang } from '../Language'
import { store } from '../store/Store'
import { userWorksType } from '../crawl/CrawlArgument'
import { Tools } from '../Tools'
import { API } from '../API'
import { Utils } from '../utils/Utils'
import { log } from '../Log'
import { pageType } from '../PageType'
import { settings } from '../setting/Settings'

class InitNovelPage extends InitPageBase {
  constructor() {
    super()
    this.init()
  }

  private crawlDirection: number = 0 // 抓取方向，指示抓取新作品还是旧作品
  /*
  -1 抓取新作品
  0 不设置抓取方向
  1 抓取旧作品
  */

  protected initAny() {}

  protected addCrawlBtns() {
    Tools.addBtn(
      'crawlBtns',
      Colors.bgBlue,
      '_从本页开始抓取new',
      '',
      'startCrawlingFromCurrentPageNew'
    ).addEventListener('click', () => {
      this.crawlDirection = -1
      this.readyCrawl()
    })

    Tools.addBtn(
      'crawlBtns',
      Colors.bgBlue,
      '_从本页开始抓取old',
      '',
      'startCrawlingFromCurrentPageOld'
    ).addEventListener('click', () => {
      this.crawlDirection = 1
      this.readyCrawl()
    })
  }

  protected destroy() {
    Tools.clearSlot('crawlBtns')
    Tools.clearSlot('otherBtns')
  }

  protected getWantPage() {
    // 检查下载页数的设置
    const crawlAllTip =
      this.crawlDirection === -1
        ? lang.transl('_从本页开始抓取new')
        : lang.transl('_从本页开始抓取old')
    this.crawlNumber = settings.crawlNumber[pageType.type].value
    if (this.crawlNumber === -1) {
      log.warning(crawlAllTip)
    } else {
      log.warning(
        lang.transl('_从本页开始下载x个', this.crawlNumber.toString())
      )
    }
  }

  protected async getIdList() {
    let type: userWorksType[] = ['novels']
    let idList = await API.getUserWorksByType(
      Tools.getCurrentPageUserID(),
      type
    )

    // 储存符合条件的 id
    let nowId = parseInt(Tools.getNovelId(window.location.href))
    idList.forEach((id) => {
      let idNum = parseInt(id.id)
      // 新作品
      if (idNum >= nowId && this.crawlDirection === -1) {
        store.idList.push(id)
      } else if (idNum <= nowId && this.crawlDirection === 1) {
        // 旧作品
        store.idList.push(id)
      }
    })

    // 当设置了下载个数时，进行裁剪
    if (this.crawlNumber !== -1) {
      // 新作品 升序排列
      if (this.crawlDirection === -1) {
        store.idList.sort(Utils.sortByProperty('id')).reverse()
      } else {
        // 旧作品 降序排列
        store.idList.sort(Utils.sortByProperty('id'))
      }

      store.idList = store.idList.splice(0, this.crawlNumber)
    }

    this.getIdListFinished()
  }

  protected resetGetIdListStatus() {
    this.crawlDirection = 0 // 解除下载方向的标记
  }
}
export { InitNovelPage }
