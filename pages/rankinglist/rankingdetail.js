import Util from '../../utils/util';
const app = getApp();
var sliderWidth = 96;

Page({

  data: {
    initial: 0,
    userInfo: {},
    details: [],
    tabs: ["Data", "Level"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0
  },

  onLoad: function (options) {
    console.log('userId: ' + options.userId);
    var userId = options.userId;
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    if(userId){
      wx.request({
        url: app.globalData.host + '/ranking/points/' + userId,
        method: 'GET',
        success: function (res) {
          console.log(res.data);
          that.setData({
            userInfo: res.data.retObj.user,
            details: res.data.retObj.pointsList
          });
        },
        fail: function (e) {
          Util.showToast('数据获取失败', 'none', 2000);
        }
      })
    }
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
})