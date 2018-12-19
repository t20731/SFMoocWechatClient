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
    tabArr: ["learnSessions", "ownedSessions", "completedSessions"],
    ownedSessionsIsPullDownLoading: false,
    ownedSessionsIsLoading: false,
    ownedSessionsIsNoData: false,
    learnSessionsIsPullDownLoading: false,
    learnSessionsIsLoading: false,
    learnSessionsIsNoData: false,
    pageNum: 1,
    learnSessions: [],
    ownedSessions: [],
    completedSessions: [],
    completedSessionsIsNoData: false,
    totalPoints: 0,
    handleSessionIndex:0,
    confirmButtonVisible: false,
    swipeoutUnclosable: true,
    accessToken: '',
    registeredUsers: []
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

    this._setLoading('learnSessions', true);
    this._loadLearnSessions();
  },

  onCancelOrDelete: function (evt) {
    this.setData({
      confirmButtonVisible: true,
      swipeoutUnclosable: true,
      handleSessionIndex: evt.target.dataset.itemindex
    });
  },

  onConfirm: function (evt) {
    let formId = evt.detail.formId;
    let handleSessionIndex = this.data.handleSessionIndex;
    let handleSession = this.data.ownedSessions[handleSessionIndex];
    this.setData({
      confirmButtonVisible: false,
      swipeoutUnclosable: false,
      handleSessionIndex: evt.target.dataset.itemindex
    });
    if (handleSession.enrollments) {
      let handleSessionId = handleSession.id;
      WXRequest.get('/session/cancel/' + handleSessionId).then(res => {
        if (res.data.msg === 'ok') {
          setTimeout(() => {
            this._sendNotification(formId, handleSessionId);
            Util.showToast('Cancel session successfully！')
            console.log('/session/cancel/' + handleSessionId, res.data);
          }, 500)
        }
      }).catch(e => {
        console.log(e);
      });
    } else {
      this._deleteSession(handleSession.id);
    }
  },

  _deleteSession: function (id) {
    let itemId = id;
    return WXRequest.delete('/session/delete/' + itemId).then(res => {
      if (res.data.msg === 'ok') {
        setTimeout(() => {
          Util.showToast('Delete session successfully！')
          console.log('/session/delete/' + itemId, res.data);
        }, 500);
      }
    }).catch(e => {
      console.log(e);
    });

  },

  _cancelSession: function (id) {
    let itemId = id;
    return WXRequest.get('/session/cancel/' + itemId).then(res => {
      if (res.data.msg === 'ok') {
        setTimeout(() => {
          Util.showToast('Cancel session successfully！')
          console.log('/session/cancel/' + itemId, res.data);
        }, 500)
      }
    }).catch(e => {
      console.log(e);
    });

  },

  _sendNotification: function (fId, sessionId) {
    let formId = fId;
    let handleSessionId = sessionId;
    let sAccessToken = '';
    let aRegisteredUsers = [];

    WXRequest.get('/web/access_token').then(res => {
      if (res.data.msg === 'ok') {
        sAccessToken = res.data.retObj;
        console.log('/web/access_token', sAccessToken);
        this.setData({
          accessToken: sAccessToken
        });

        // get registered user
        let url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='+sAccessToken;

        // let notificationData = {
        //   "touser": "oP7lN5QcjsvyacGLWZM6AF4LcT48",
        //   "template_id": app.globalData.template_id,
        //   "page": "pages/home/home",
        //   "form_id": formId,
        //   "data": {
        //     "keyword1": {
        //       "value": "会议主题"
        //     },
        //     "keyword2": {
        //       "value": "会议时间"
        //     },
        //     "keyword3": {
        //       "value": "会议地点"
        //     },
        //     "keyword4": {
        //       "value": "会议名称"
        //     },
        //     "keyword5": {
        //       "value": "主办方"
        //     }
        //   },
        //   "emphasis_keyword": "keyword1.DATA"
        // };

        WXRequest.get('/session/registeredUsers/' + handleSessionId).then(res => {
          if (res.data.msg === 'ok') {
            aRegisteredUsers = res.data.retObj;
            console.log('/session/registeredUsers/' + handleSessionId, res.data.retObj);
            if (!!aRegisteredUsers && aRegisteredUsers.length > 0) {
              this.setData({
                registeredUsers: aRegisteredUsers
              });

              aRegisteredUsers.map(registerUser => {
                let notificationData = {
                  "touser": registerUser,
                  "weapp_template_msg" : {
                    "template_id": app.globalData.template_id,
                    "page": "pages/home/home",
                    "form_id": fId,
                    "data": {
                      "keyword1": {
                        "value": "会议主题"
                      },
                      "keyword2": {
                        "value": "会议时间"
                      },
                      "keyword3": {
                        "value": "会议地点"
                      },
                      "keyword4": {
                        "value": "会议名称"
                      },
                      "keyword5": {
                        "value": "主办方"
                      }
                    },
                    "emphasis_keyword": "keyword1.DATA"

                  }
                };

                wx.request({
                  url: url,
                  data: notificationData,
                  method: 'POST', //此处不能有请求头
                  success: function (res) {
                    console.log('notificationData',notificationData);
                    console.log(url);
                    console.log(res, "Send notification msg");
                  },
                  fail: function (err) {
                    console.log(url);
                    console.log(err, "Send notification err");
                    console.log('notificationData', notificationData);
                  }
                });
              });
            }
          }
        }).catch(e => {
          console.log(e);
        })
      }
    }).catch(e => {
      console.log(e);
    })

  },

  tabClick: function (e) {
    let currentIndex = e.currentTarget.id;
    let name = this.data.tabArr[currentIndex];
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: currentIndex
    });
    if (currentIndex == 1 && this.data.ownedSessions.length <= 0) {
      this.setData({
        pageNum: 1
      });
      this._setLoading(name, true);
      this._loadOwnedSessions();
    } else if (currentIndex == 2 && this.data.completedSessions.length <= 0){
      this.setData({
        pageNum: 1
      });
      this._setLoading(name, true);
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
    let userId = Util.getUserId();
    let pageNum = this.data.pageNum;
    let postData = {
      pageNum: pageNum,
      pageSize: PAGE_SIZE,
      completed: 1,
      userId: userId
    }
    this._loadSessions(postData, 'completedSessions');
  },

  _loadSessions(postData, name) {
    let pageNum = this.data.pageNum;
     WXRequest.post('/session/list', postData).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        this._setLoading(name, false);
        let sessionPerPage = res.data.retObj;
        if (pageNum === 1) {
          let length = sessionPerPage.length;
          if (length > 0 && length < 5) {
            this.setData({
              [name]: res.data.retObj,
              [name + 'IsNoData']: true,
              [name + 'IsPullDownLoading']: false
            });
          } else if (length === 5) {
            this.setData({
              [name]: res.data.retObj,
              [name + 'IsPullDownLoading']: false
            });
          } else {
            this.setData({
              [name + 'IsNoData']: true,
              [name + 'IsPullDownLoading']: false
            });
          }
          
        } else {
          if (sessionPerPage.length > 0) {
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

  goCompletedSession(event){
    let id = event.currentTarget.id;
    wx.navigateTo({
      url: '../session/eventDetail?id=' + id + '&&isCompleted=true'
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
          that.getTotalPoints(openid);
        },
        fail: function (e) {
            Util.showToast('登录失败', 'none', 1500);
        }
      })
    }
  },
  
  getTotalPoints: function (openid){
    var that = this;
    wx.request({
      url: app.globalData.host + '/user/totalPoints/' + openid,
      method: 'GET',
      success: function (res) {
        that.setData({
          totalPoints: res.data.retObj
        })
      },
      fail: function (e) {
        Util.showToast('Failed to get total points', 'none', 1500);
      }
    })
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
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo != 'undefined' && userInfo.id){
      this.getTotalPoints(userInfo.id);
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
    const activeIndex = this.data.activeIndex;
    let name = this.data.tabArr[activeIndex];
    this.setData({
      pageNum: 1,
      [name + 'IsPullDownLoading']: true,
      [name + 'IsNoData']: false
    });
    if (activeIndex == 0) {
      this._loadLearnSessions();
    } else if (activeIndex == 1){
      
      this._loadOwnedSessions();
    } else if (activeIndex == 2){
      this._loadCompletedSessions();
    }
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let pageNum = this.data.pageNum + 1;
    const activeIndex = this.data.activeIndex;
    let name = this.data.tabArr[activeIndex];
    this._setLoading(name, true);
    this.setData({
      pageNum: pageNum,
      [name + 'IsNoData']: false
    });
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