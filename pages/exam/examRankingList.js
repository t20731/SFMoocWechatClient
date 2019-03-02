import Util from '../../utils/util';
import WXRequest from '../../utils/wxRequest';
const app = getApp();

Page({
  data: {
    examRankingList: [],
    sessionId: 0
  },
  onLoad: function (options) {
    console.log('examRankingList::onLoad');
    let that = this;
    that.setData({
      sessionId: options.sessionId
    })
    this.loadExamRanking(options.sessionId);
  },

  onShow: function () {
  },

  onPullDownRefresh: function () {
    this.loadExamRanking(this.data.sessionId);
    wx.stopPullDownRefresh();

  },

  // User
  loadExamRanking: function (sessionId) {
    let that = this;
    wx.request({
      url: app.globalData.host + '/exam/ranking/list/' + sessionId,
      method: 'GET',
      success: function (res) {
        console.log(res.data.retObj);
        if (res.data.msg == 'ok') {
          that.setData({
            examRankingList: res.data.retObj
          });
        }
      },
      fail: function (e) {
        Util.showToast('Failed to get data', 'none', 2000);
      }
    });
  }
})
