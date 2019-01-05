//index.js
//获取应用实例
import Util from '../../utils/util';
import WXRequest from '../../utils/wxRequest';
const app = getApp();
let sliderWidth = 96;

Page({
  data: {
    myRanking: {},
    userRankingList: [],
    hasUserInfo: false,
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    tabArr: ["User", "Session"],
    sessionRankingList: [],
    sessions: [],
    groupArr: [],
    selectedGroupId: 0,
    selectedGroupName: ''
  },
  onLoad: function () {
    console.log('userRankingList::onLoad');
    let userInfo = wx.getStorageSync('userInfo');
    let that = this;
    if (userInfo) {
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            sliderLeft: (res.windowWidth / that.data.tabArr.length - sliderWidth) / 2,
            sliderOffset: res.windowWidth / that.data.tabArr.length * that.data.activeIndex,
            hasUserInfo: true
          });
        }
      });
    }
    WXRequest.get('/group/list').then(res => {
      if (res.data.length > 0) {
        console.log('/group/list', res.data);
        this.setData({
          groupArr: res.data,
          selectedGroupId: res.data[0].id,
          selectedGroupName: res.data[0].name
        });
        this._loadUserRanking();        
      }
    }).catch(e => {
      console.log(e);
    });

  },

  onShow: function(){
  },

  onPullDownRefresh: function () {
    this._refreshRanking();
    wx.stopPullDownRefresh();

  },

  onGroupChange: function (e) {
    let selectedGroupIndex = e.detail.value;
    this.setData({
      selectedGroupId: this.data.groupArr[selectedGroupIndex].id,
      selectedGroupName: this.data.groupArr[selectedGroupIndex].name
    });
    this._refreshRanking();
  },

  tabClick: function (e) {
    let currentIndex = e.currentTarget.id;
    let name = this.data.tabArr[currentIndex];
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: currentIndex
    });
    if (currentIndex == 0) {
      this._setLoading(name, true);
      this._loadUserRanking();
    } else if (currentIndex == 1) {
      this._setLoading(name, true);
      this._loadSessionRanking();
    }
  },

  goSessionDetail: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../session/eventDetail?id=' + id,
    })
  },

// User
  _loadUserRanking: function () {
    let that = this;
    wx.request({
      url: app.globalData.host + '/ranking/list/' + this.data.selectedGroupId,
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          userRankingList: res.data
        });
        that._findMyRanking();
      },
      fail: function (e) {
        Util.showToast('数据获取失败', 'none', 2000);
      }
    });
  },

  _findMyRanking: function () {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.id) {
      let myId = userInfo.id;
      let myRanking = this.data.userRankingList.filter(item => item.userId === myId)[0];
      myRanking && this.setData({
        myRanking: myRanking
      });
    }
  },

// Session
  _loadSessionRanking: function () {
    let that = this;
    wx.request({
      url: app.globalData.host + '/ranking/listSession/' + this.data.selectedGroupId,
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          sessions: res.data
        });
      },
      fail: function (e) {
        Util.showToast('数据获取失败', 'none', 2000);
      }
    })
  },

  _setLoading: function (name, showLoading) {
    this.setData({
      [name + ' Ranking Is Loading']: showLoading
    });
  },

  _refreshRanking: function () {
    console.log('userRankingList::onPullDownRefresh');
    const activeIndex = this.data.activeIndex;
    let name = this.data.tabArr[activeIndex];
    if (activeIndex == 0) {
      this._setLoading(name, true);
      this._loadUserRanking();
    } else if (activeIndex == 1) {
      this._setLoading(name, true);
      this._loadSessionRanking();
    }
  }
})
