// pages/home/home.js
import Util from '../../utils/util';
import WCache from '../../utils/wcache';
import WXRequest from '../../utils/wxRequest';
const app = getApp();
var sliderWidth = 96;
const PAGE_SIZE = 5;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    isSessionOwner: false,
    isCheckinModalHidden: true,
    isGenerateCodeModal: true,
    checkinCode: '',
    tabs: ["Learning", "Sharing", "Completed"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    ownedSessionsIsPullDownLoading: false,
    ownedSessionsIsLoading: false,
    ownedSessionsIsNoData: false,
    pageNum: 1,
    learnSessions: [],
    ownedSessions: [],
    compeletedSessions: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    console.log('home::onLoad::openId:' + app.globalData.openId)
    var that = this;
    if (!app.globalData.openId) {
      app.openIdCallback = openId => {
        console.log('home::openIdCallback:' + openId)
        if (openId) {
        }
      }
    }
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });

    this._loadLearnSessions();
  },

  tabClick: function (e) {
    let currentIndex = e.currentTarget.id;
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: currentIndex
    });
    if (currentIndex == 1 && this.data.ownedSessions.length <= 0) {
      this._loadOwnedSessions();
    } else if (currentIndex == 2 && this.data.compeletedSessions.length <= 0){
      this._loadCompletedSessions();
    }
  },

  _loadLearnSessions() {
    console.log('_loadLearnSessions');
    this._loadUnCompletedSessions('userId', 'learnSessions');
  },

  _loadOwnedSessions() {
    console.log('_loadOwnedSessions');
    this._loadUnCompletedSessions('ownerId', 'ownedSessions');
  },

  _loadUnCompletedSessions(role, name) {
    console.log('_loadUnCompletedSessions');
    let userId = Util.getUserId();
    let pageNum = this.data.pageNum;
    let postData = {
      pageNum: pageNum,
      pageSize: PAGE_SIZE,
      [role]: userId
    }
    this._loadSessions(postData, name);
  },

  _loadCompletedSessions() {
    console.log('_loadCompletedSessions');
    let pageNum = this.data.pageNum;
    let postData = {
      pageNum: pageNum,
      pageSize: PAGE_SIZE,
      completed: 1
    }
    this._loadSessions(postData, 'compeletedSessions');
  },

  _loadSessions(postData, name) {
    this._setLoading(name, true);
    //  let userId = Util.getUserId();
    let pageNum = this.data.pageNum;
    WXRequest.post('/session/list', postData).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        this._setLoading(name, false);
        if (pageNum === 1) {
          this.setData({
            [name]: res.data.retObj,
            ownedSessionsIsPullDownLoading: false
          });
        } else {
          let increment = res.data.retObj;
          if (increment.length > 0) {
            this.setData({
              [name]: [...this.data[name], ...res.data.retObj]
            });
          } else {
            this.setData({
              [name + 'IsNoData']: true
            });
          }
          
        }
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _setLoading(name, showLoading) {
    this.setData({
      [name + 'IsLoading']: showLoading
    });
  },

  goOwnedSession(event) {
    let id = event.currentTarget.id;
    wx.navigateTo({
      url: '../session/eventDetail?id=' + id
    })
  },

  goLearnSession(event) {
    let id = event.currentTarget.id;
    wx.navigateTo({
      url: '../session/eventDetail?id=' + id
    })
  },

  onCreateSession() {
    wx.navigateTo({
      url: '../session/newEvent'
    });
  },

  getUserInfo: function (e) {
    console.log(e)
    if (e.detail.userInfo) {
      this.addUser(e.detail.userInfo);
    } else {
      console.log(e.detail.errMsg)
    }
  },

  addUser: function (user) {
    var that = this;
    var openid = wx.getStorageSync('openid');
    console.log('openid: ' + openid)
    if (openid) {
      user.id = openid;
      wx.request({
        url: app.globalData.host + '/user/save',
        method: 'POST',
        data: user,
        success: function (res) {
          console.log(res.data);
          user.status = 0;
          that.setData({
            userInfo: user,
            hasUserInfo: true
          })
          wx.setStorageSync('userInfo', user);   
        },
        fail: function (e) {
            Util.showToast('登录失败', 'none', 1500);
        }
      })
    }
  },

  cancelGenerateCode: function () {
    this.setData({ isGenerateCodeModal: true });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      pageNum: 1
    });
    const activeIndex = this.data.activeIndex;
    if (activeIndex == 0) {
      this._loadLearnSessions();
    } else if (activeIndex == 1){
      this.setData({
        ownedSessionsIsPullDownLoading: true,
        ownedSessionsIsNoData: false
      });
      this._loadOwnedSessions();
    } else if (activeIndex == 2){
      this._loadCompletedSessions();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let pageNum = this.data.pageNum + 1;
    this.setData({
      pageNum: pageNum
    });
    const activeIndex = this.data.activeIndex;
    if (activeIndex == 0) {
      this._loadLearnSessions();
    } else if (activeIndex == 1) {
      this._loadOwnedSessions();
    } else if (activeIndex == 2){
      this._loadCompletedSessions();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})