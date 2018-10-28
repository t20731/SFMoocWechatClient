import Util from '../../utils/util';
import wxCharts from '../../utils/wxcharts.js';

const app = getApp();
let sliderWidth = 96;
let radarChart = null;

Page({

  data: {
    initial: 0,
    userInfo: {},
    details: [],
    tabs: ['Capability', 'Introdution', 'Recognition'],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0
  },

  onLoad: function (options) {
    console.log('userId: ' + options.userId);
    let userId = options.userId;
    let that = this;
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
  touchHandler: function (e) {
    console.log(radarChart.getCurrentDataIndex(e));
  },
  onReady: function (e) {
    let windowWidth = 320;
    try {
      let res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    radarChart = new wxCharts({
      canvasId: 'radarCanvas',
      type: 'radar',
      categories: ['Java', 'DB', 'Javascript', 'Testing', 'Linux', 'UI design'],
      series: [{
        name: 'Total-70',
        data: [150, 110, 225, 165, 87, 122]
      }],
      width: windowWidth,
      height: 300,
      extra: {
        radar: {
          max: 300
        }
      }
    });
  }
})
