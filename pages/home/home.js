// pages/home/home.js
import Util from '../../utils/util';
import WCache from '../../utils/wcache';
import WXRequest from '../../utils/wxRequest';
const app = getApp();
var sliderWidth = 96;

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
    tabs: ["Learning", "Sharing"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    ownedSessions: []
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

    // this._loadOwnedSessions(userInfo.id);
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });

    let userId = Util.getUserId();
    if (this.data.ownedSessions.length <= 0) {
      this._loadOwnedSessions(userId);
    }
  },

  _loadOwnedSessions(userId) {
    WXRequest.post('/session/list', {
      pageNum: 1,
      pageSize: 10,
      ownerId: userId
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        this.setData({
          ownedSessions: res.data.retObj
        });
      }
    }).catch(e => {
      console.log(e);
    });
  },

  goOwnedSession(event) {
    let id = event.currentTarget.id;
    wx.navigateTo({
      url: '../session/eventDetail?id=' + id,
    })
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
          that.setUserStatus(user);   
        },
        fail: function (e) {
            Util.showToast('登录失败', 'none', 1500);
        }
      })
    }
  },

  generateCode: function (event) {
    var userInfo = wx.getStorageSync('userInfo');
    var isCheckedIn = WCache.get('checkedIn');
    console.log('generateCode::isCheckedIn from cache: ' + isCheckedIn)
    if (!userInfo) {
      Util.showToast('请先登录', 'none', 1500);
    } else if (isCheckedIn){
      Util.showToast('今天口令已生成', 'none', 1500);
    } else {
      var that = this;
      let isValidTime = this.validateCheckinTime();
      //let isValidTime = true;
      if (isValidTime) {
        wx.request({
          url: app.globalData.host + '/checkin/code/' + app.globalData.openId,
          method: 'GET',
          success: function (res) {
            console.log(res.data);
            if (res.data.msg == "ok") {
              var code = res.data.retObj;
              that.setData({ checkinCode: code });
              that.setData({ isGenerateCodeModal: false });
            }
          },
          fail: function (e) {
            console.log('Failed to get checkin code');
          }
        })
      } else {
        Util.showToast('别慌，还没到签到时间', 'none', 1000);
      }
    }
  },

  changeCheckinCode: function () {
    let that = this;
    wx.request({
      url: app.globalData.host + '/checkin/code/' + app.globalData.openId,
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        if (res.data.msg == "ok") {
          var code = res.data.retObj;
          that.setData({ checkinCode: code });
        }
      },
      fail: function (e) {
        console.log('Failed to get checkin code');
      }
    });
  },

  saveChenkinCode: function () {
    let that = this;
    this.setData({ isGenerateCodeModal: true });
    wx.request({
      url: app.globalData.host + '/checkin/confirm/' + app.globalData.openId + '/' + that.data.checkinCode,
      method: 'GET',
      success: function (res) {
        if (res.data.msg === 'ok') {
          Util.showToast('操作成功', 'success', 2000);
          WCache.put('checkedIn', true, 24 * 60 * 60);
        } else if (res.data.msg === 'checked_in') {
          Util.showToast('口令已生成，请勿重复操作', 'none', 2000);
        } else {
          Util.showToast('操作失败，请重试', 'none', 2000);
        }
      },
      fail: function (error) {
        Util.showToast('操作失败，请重试', 'none', 2000);
      }
    })
  },

  cancelGenerateCode: function () {
    this.setData({ isGenerateCodeModal: true });
  },

  checkIn: function () {
    var userInfo = wx.getStorageSync('userInfo');
    var isCheckedIn = WCache.get('checkedIn');
    console.log('checkIn::isCheckedIn from cache: ' + isCheckedIn)
    if (!userInfo) {
      Util.showToast('请先登录', 'none', 1500);
    } else if (userInfo.status == 0) {
      Util.showToast('游客不能签到', 'none', 1500);
    } else if (isCheckedIn) {
      Util.showToast('今天已签到', 'none', 1500);
    } else {
      let isValidTime = this.validateCheckinTime();
      //let isValidTime = true;
      if (isValidTime) {
        this.setData({ 'isCheckinModalHidden': false });
      } else {
        Util.showToast('别慌，还没到签到时间', 'none', 1500);
      }
    }
  },
  // valid time: Tuesday 12:30 ~ 12:59:59
  validateCheckinTime: function () {
    let isValid = true;
    let date = new Date();
    if (date.getDay() !== 2) {
      isValid = false;
    } else if (date.getHours() < 12 || date.getHours() >= 13) {
      isValid = false;
    } else if (date.getMinutes() < 30) {
      isValid = false;
    }
    return isValid;
  },
  cancelCheckin: function () {
    this.setData({ isCheckinModalHidden: true});
  },
  submitCheckinCode: function () {
    let that = this;
    this.setData({ isCheckinModalHidden: true });
    wx.request({
      url: app.globalData.host + '/checkin/' + app.globalData.openId + '/' + that.data.checkinCode,
      method: 'GET',
      success: function (res) {
        if (res.data.msg === 'ok') {
          Util.showToast('签到成功', 'success', 2000);
          WCache.put('checkedIn', true, 24 * 60 * 60);
        } else if (res.data.msg === 'checked_in') {
          Util.showToast('已签到，请勿重复操作', 'none', 2000);
        } else {
          Util.showToast('签到失败，请核对口令', 'none', 2000);
        }
      },
      fail: function (error) {
        Util.showToast('签到失败', 'none', 2000);
      }
    })
  },

  onCodeInput: function (evt) {
    this.setData({ checkinCode: evt.detail.value })
  },
  // valid time: 13:00~13:59:59
  validateLotteryDrawTime: function () {
    let isValid = true;
    let date = new Date();
    if (date.getDay() !== 2) {
      isValid = false;
    } else if (date.getHours() !== 13) {
      isValid = false;
    }
    return isValid;
  },
  handleLotteryClick: function () {
    var userInfo = wx.getStorageSync('userInfo');
    var isCheckedIn = WCache.get('checkedIn');
    console.log('handleLotteryClick::isCheckedIn from cache: ' + isCheckedIn)
    if (!userInfo) {
      Util.showToast('请先登录', 'none', 1000);
    } else if (userInfo.status == 0) {
      Util.showToast('游客不能抽奖', 'none', 1000);
    } else if (!isCheckedIn){
      Util.showToast('签到完再来抽奖哦', 'none', 1000);
    } else {
      let isTimeValid = this.validateLotteryDrawTime();
      //let isTimeValid = true;
      if (!isTimeValid) {
        let msg = '还未到抽奖时间';
        Util.showToast(msg, 'none', 2000);
      } else {
        wx.navigateTo({
          url: '../lottery/lottery',
        }) 
      }    
    }
  },

  addQuestion: function () {
    var userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      Util.showToast('请先登录', 'none', 1000);
    } else if (userInfo.status == 0) {
      Util.showToast('游客不能添加考题', 'none', 1000);
    } else {
      wx.navigateTo({
        url: '../uploadQuestion/uploadQuestion',
      })
    }
  },

  startExam: function () {
    var userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      Util.showToast('请先登录', 'none', 1000);
    } else if (userInfo.status == 0) {
      Util.showToast('游客不能答题', 'none', 1000);
    } else {
      wx.navigateTo({
        url: '../exam/examList',
      })
    }
  },

  logout: function () {
    var userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      Util.showToast('未登录', 'none', 1500);
    } else {
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确定退出',
        success: function (res) {
          if (res.confirm) {
            wx.removeStorageSync('userInfo');
            that.setData({
              userInfo: {},
              hasUserInfo: false
            })
          }
        }
      })
    }
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
    this.setData({ checkinCode: '' });
    if(app.globalData.openId){
      var userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
      }
    }
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
    console.log('home::onPullDownRefresh::isSessionOwner:' + app.globalData.isSessionOwner)
    if (app.globalData.openId) {
      this.setSessionOwner(app.globalData.openId)
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})