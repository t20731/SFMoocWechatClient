import Util from '../../utils/util';
import wxCharts from '../../utils/wxcharts.js';

const app = getApp();
let sliderWidth = 96;
let radarChart = null;
let skillPoints = [
  {
    name: 'Java',
    points: 19,
    endorsed: false
  },
  {
    name: 'Database',
    points: 10,
    endorsed: false
  },
  {
    name: 'Javascript',
    points: 16,
    endorsed: false
  },
  {
    name: 'Testing',
    points: 12,
    endorsed: false
  },
  {
    name: 'Linux',
    points: 8,
    endorsed: false
  },
  {
    name: 'UI Design',
    points: 6,
    endorsed: false
  }
]

Page({

  data: {
    initial: 0,
    userInfo: {},
    tabs: ['Competence', 'Introduction', 'Endorsement'],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    skills: ['Java', 'DB', 'Javascript', 'Testing', 'Linux', 'UI design'],
    skillPoints: skillPoints
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
    if (userId) {
      wx.request({
        url: app.globalData.host + '/user/' + userId,
        method: 'GET',
        success: function (res) {
          console.log(res.data);
          that.setData({
            userInfo: res.data.retObj
          });
        },
        fail: function (e) {
          Util.showToast('Failed to get user data', 'none', 2000);
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
  addSkillPoints: function (evt) {
    let index = evt.target.dataset.skillindex;
    this.data.skillPoints[index].points += 1;
    this.data.skillPoints[index].endorsed = true;
    this.setData({
      skillPoints: this.data.skillPoints
    });
  },
  revertAddSkillPoints: function (evt) {
    let index = evt.target.dataset.skillindex;
    this.data.skillPoints[index].points -= 1;
    this.data.skillPoints[index].endorsed = false;
    this.setData({
      skillPoints: this.data.skillPoints
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
      categories: this.data.skills,
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
