import WXRequest from '../../utils/wxRequest';
import WCache from '../../utils/wcache';
import Util from '../../utils/util';

const app = getApp();

const ENROLL_NUMBER = 1;
Page({
  data: { // 参与页面渲染的数据
    pageQueries: {},
    difficulties: {
      '0': 'Beginner',
      '1': 'Intermediate',
      '2': 'Advanced'
    },
    isOwner: false,
    disabled: false,
    loading: false,
    registerBtnVal: 'Register',
    unRegisterBtnVal: 'UnRegister',
    startBtnVal: 'Start Session',
    startBtnDisabled: false,
    quizBtnVal: 'Quiz-M',
    lotteryBtnVal: 'Lottery',
    quizBtnDisabled: false,
    eventDetail: null,
    status: -1,
    sessionId: 0,
    checkInBtnVal: 'Check-In',
    checkInDisabled: false,
    checkInCode: '',
    isCheckInModalHidden: true,
    isRewardModalHidden: true,
    startQuizBtnVal: 'Quiz',
    startQuizBtnDisabled: false,
    isRegistered: false,
    canEdit: false,
    isLiked: 0,
    totalLikeCount: 0,
    share: app.globalData.share
  },

  onLoad: function (e) {
    this.data.pageQueries = e;
    this.doLoadDetail();
  },

  onShow: function(e){
    this.setData({
      share: app.globalData.share
    })
  },

  doLoadDetail: function () {
    const {id} = this.data.pageQueries;

    let userId = Util.getUserId();
    this.setData({
      sessionId: id
    });
    this._checkGuest(userId);
    this._isCheckedIn();
    wx.showLoading({
      title: 'Loading',
      mask: true
    })
    WXRequest.post('/session/detail', {
      sessionId: id,
      userId: userId
    }).then(res => {
      wx.hideLoading();
      if (res.data.msg === 'ok') {
        console.log(res.data);
        let retObj = res.data.retObj;
        let eventDetail = retObj.session;
        let likeCount = retObj.userLike;
        let isOwner = this._isOwner(eventDetail.owner.id);
        let checkInCode = eventDetail.checkInCode;
        if (checkInCode) {
          this._markStarted(checkInCode);
        }
        this.setData({
          isOwner: isOwner,
          eventDetail: eventDetail,
          status: retObj.session.status,
          canEdit: isOwner && (retObj.session.status == 0),
          totalLikeCount: likeCount
        });
        if (userId && retObj.userRegistered) {
          this._markRegistered();
        }
      }
    }).catch(e => {
      console.log(e);
    });
    this._getLike(userId);
  },

  goRankDetail(e) {
    let userId = e.currentTarget.id;
    wx.navigateTo({
      url: '../rankinglist/rankingdetail?userId=' + userId,
    })
  },
  
  _isOwner(ownerId) {
    let userId = Util.getUserId();
    if (ownerId === userId) {
      return true;
    }
    return false;
  },

  _canStart(enrollments) {
    return enrollments >= ENROLL_NUMBER;
  },

  _checkGuest: function (userId) {
    if (userId === 'abc') {
      // guest cannot register
      this.setData({
        registerBtnVal: 'Login to Register',
        disabled: true
      });
    }
  },

  _markRegistered: function () {
    this.setData({
      isRegistered: true,
      registerBtnVal: 'Registered'
    });
  },

  onManageQuiz: function(){
    wx.navigateTo({
      url: '../uploadQuestion/uploadQuestion?sessionId=' + this.data.sessionId,
    })
  },

  onStartQuiz: function () {
    let userInfo = wx.getStorageSync('userInfo');
    let isCheckedIn = WCache.get(this.data.sessionId + '_checkedIn');
    if (!userInfo) {
      Util.showToast('Please login fisrt', 'none', 2000);
    } else if (!isCheckedIn) {
      Util.showToast('Please check in first', 'none', 2000);
    } else {
      wx.navigateTo({
        url: '../exam/exam?sessionId=' + this.data.sessionId,
      })
    }
  },

  onStartLottery: function () {
    let userInfo = wx.getStorageSync('userInfo');
    let isCheckedIn = WCache.get(this.data.sessionId + '_checkedIn');
    if (!userInfo) {
      Util.showToast('Please login fisrt', 'none', 2000);
    } else if (!isCheckedIn) {
      Util.showToast('Please check in first', 'none', 2000);
    } else {
      wx.navigateTo({
        url: '../lottery/lottery?sessionId=' + this.data.sessionId + '&isOwner=' + this.data.isOwner,
      })
    }
  },

  onRegister: function(event) {
    console.log('Register: ', event);
    let userId = Util.getUserId();
    if(userId  == 'abc'){
      wx.switchTab({
        url: '../../pages/home/home',
      })
    } else {
      WXRequest.post('/session/register/', {
        userId: userId,
        sessionId: this.data.eventDetail.id
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log(res.data);
          this.setData({
            isRegistered: true
          })
          Util.showToast('Success', 'success', 1000);
        } else {
          this.showError('Register failed. Please try again');
        }
      }).catch(e => {
        this.showError('Please try again');
        console.log(e);
      });
    }
  },

  unRegister: function (event) {
    console.log('unRegister: ', event);
    let userId = Util.getUserId();
    WXRequest.post('/session/unregister/', {
      userId: userId,
      sessionId: this.data.eventDetail.id
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        this.setData({
          isRegistered: false
        })
        Util.showToast('Success', 'success', 1000);
      } else {
        this.showError('unRegister failed. Please try again');
      }
    }).catch(e => {
      this.showError('Please try again');
      console.log(e);
    });
  },

  // onReward: function(){
  //   this.setData({
  //     isRewardModalHidden: false
  //   });
  // },
  
  // submitRewardAmount: function(){
  //   console.log('submitRewardAmount');
  //   this.setData({
  //     isRewardModalHidden: true
  //   });
  // },

  // cancelReward: function(){
  //   console.log('cancelReward');
  //   this.setData({
  //     isRewardModalHidden: true
  //   });
  // },

  _isCheckedIn() {
    let isCheckedIn = WCache.get(this.data.sessionId + '_checkedIn');
    if (isCheckedIn) {
      this._markCheckedIn();
    }
  },

  _markCheckedIn() {
    this.setData({
      checkInDisabled: true,
      checkInBtnVal: 'Checked-In'
    });
  },

  onCheckIn() {
    this.setData({
      isCheckInModalHidden: false
    });
  },

  onCheckInCodeInput(event) {
    this.setData({
      checkInCode: event.detail.value
    });
  },

  submitCheckInCode() {
    this.setData({ isCheckInModalHidden: true });
    let userId = Util.getUserId();
    let checkInCode = this.data.checkInCode;
    var that = this;
    WXRequest.post('/checkin/submit', {
      sessionId: this.data.eventDetail.id,
      userId: userId,
      code: checkInCode
    }).then(res => {
      if (res.data.msg === 'ok') {
        Util.showToast('Credits +1', 'success', 2000);
        WCache.put(that.data.sessionId + '_checkedIn', true, 24 * 60 * 60);
        this._markCheckedIn();
      } else {
        Util.showToast('Failed', 'none', 2000);
      }
    }).catch(e => {
      console.log(e);
    });
  },    

  cancelCheckIn() {
    this.setData({ isCheckInModalHidden: true });
  },

  _getLike: function (userId) {
    WXRequest.post('/session/getlike/', {
      userId: userId,
      sessionId: this.data.sessionId
    }).then(res => {
      if (res.data.msg === 'ok') {
        this.setData({
          isLiked: res.data.retObj
        })
      } else {
        this.showError('get like count failed. Please try again');
      }
    }).catch(e => {
      this.showError('Please try again');
      console.log(e);
    });
  },
  onStartSession(event) {
    let userId = Util.getUserId();
    let canStart = this._canStart(this.data.eventDetail.enrollments);
    var that = this;
    if (canStart) {
      WXRequest.post('/session/start', {
        sessionId: this.data.eventDetail.id,
        userId: userId
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log(res.data);
          Util.showToast('Credits +5', 'success', 2000);
          let checkInCode = res.data.retObj.CheckInCode;
          this._markStarted(checkInCode);
          WCache.put(that.data.sessionId + '_started', true, 24 * 60 * 60);
        }
      }).catch(e => {
        console.log(e);
      });
    } else {
      Util.showToast("Enrollments has not reached to the threshold.", 'none', 3000);
    }
  },

  onEditSession() {
    wx.navigateTo({
      url: '../session/newEvent?id=' + this.data.sessionId
    });
  },

  _markStarted(checkInCode) {
    this.setData({
      startBtnVal: `${checkInCode}`,
      startBtnDisabled: true,
      status: 1
    });
  },

  onChangeLikeStatus: function () {
    if (this.data.isOwner){
      Util.showToast('Cannot like your own session', 'none', 2000);
    } else {
      let userId = Util.getUserId();
      let likeStatus = this.data.isLiked === 1 ? 0 : 1;
      let addCount = likeStatus === 1 ? 1 : -1;
      let currenttotalLikeCount = this.data.totalLikeCount + addCount;
      WXRequest.post('/session/like/', {
        userId: userId,
        sessionId: this.data.eventDetail.id,
        like: likeStatus
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log(res.data);
          this.setData({
            isLiked: likeStatus,
            totalLikeCount: currenttotalLikeCount
          })
        } else {
          if (res.data.status == 0){
            Util.showToast('You havent checked in', 'none', 2000);
          }else{
            this.showError('You havent registered this seesion');
          }
        }
      }).catch(e => {
        this.showError('Please try again');
        console.log(e);
      });
    }
  },

  showError: function(title) {
    Util.showToast(title, 'none');
  },

  // onShareAppMessage: function (res) {
  //   return {
  //     title: this.data.eventDetail.topic,
  //     path: '/pages/session/eventDetail?id=' + this.data.sessionId,
  //     imageUrl: app.globalData.host + this.data.eventDetail.tileImageSrc
  //   }
  // }

  onPullDownRefresh: function () {
    console.log('eventdetail.js onPullDownRefresh...');
    this.doLoadDetail();
    wx.stopPullDownRefresh();
  },

  goToIndex: function() {
    app.globalData.share = false;
    wx.switchTab({
      url: '../../pages/explore/explore',
    })
  }

});
