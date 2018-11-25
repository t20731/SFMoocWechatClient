import WXRequest from '../../utils/wxRequest';
import WCache from '../../utils/wcache';
import Util from '../../utils/util';

const ENROLL_NUMBER = 1;
Page({
  data: { // 参与页面渲染的数据
    difficulties: {
      '0': 'Beginner',
      '1': 'Intermediate',
      '2': 'Advanced'
    },
    isOwner: false,
    disabled: false,
    loading: false,
    registerBtnVal: 'Register',
    startBtnVal: 'Start Session',
    startBtnDisabled: false,
    quizBtnVal: 'Quiz Management',
    lotteryBtnVal: 'Feel Lucky',
    quizBtnDisabled: false,
    eventDetail: null,
    sessionId: 0,
    checkInBtnVal: 'Check In',
    checkInDisabled: false,
    checkInCode: '',
    isCheckInModalHidden: true,
    isRewardModalHidden: true,
    startQuizBtnVal: 'Quiz',
    startQuizBtnDisabled: false,
    isCompleted: false,
    isRegistered: false
  },

  onLoad: function (e) {
    let userId = Util.getUserId();
    this.setData({
      sessionId: e.id
    });
    if (e.isCompleted){
      this.setData({
        isCompleted: e.isCompleted
      });
    }
    this._checkGuest(userId);
    this._isCheckedIn();

    wx.showLoading({
      title: 'Loading',
      mask: true
    })
    WXRequest.post('/session/detail',{
      sessionId: e.id,
      userId: userId
    }).then(res => {
      wx.hideLoading();
      if (res.data.msg === 'ok') {
        console.log(res.data);
        let retObj = res.data.retObj;
        let eventDetail = retObj.session;

        let isOwner = this._isOwner(eventDetail.owner.id);
        this.setData({
          isOwner: isOwner,
          eventDetail: eventDetail
        });
        if (userId && retObj.userRegistered) {
          this._markRegistered();
        }
        let checkInCode = eventDetail.checkInCode;
        if (checkInCode) {
          this._markStarted(checkInCode);
        }
      }
    }).catch(e => {
      console.log(e);
    });
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
    // call API to register the event
    console.log('Register: ', event);
    this.setData({
      loading: !this.data.loading,
    });

    let userId = Util.getUserId();
    WXRequest.post('/session/register/', {
      userId: userId,
      sessionId: this.data.eventDetail.id
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        Util.showToast('Successfully');
        this.setData({
          loading: false,
          isRegistered: true,
          registerBtnVal: 'Registered'
        })
      } else {
        this.showError('Register failed. Please try again');
      }
    }).catch(e => {
      this.showError('Please try again');
      console.log(e);
    });
    this.setData({
      loading: !this.data.loading,
    });
  },

  onReward: function(){
    this.setData({
      isRewardModalHidden: false
    });
  },
  
  submitRewardAmount: function(){
    console.log('submitRewardAmount');
    this.setData({
      isRewardModalHidden: true
    });
  },

  cancelReward: function(){
    console.log('cancelReward');
    this.setData({
      isRewardModalHidden: true
    });
  },

  _isCheckedIn() {
    let isCheckedIn = WCache.get(this.data.sessionId + '_checkedIn');
    if (isCheckedIn) {
      this._markCheckedIn();
    }
  },

  _markCheckedIn() {
    this.setData({
      checkInDisabled: true,
      checkInBtnVal: 'Checked In'
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
      }
    }).catch(e => {
      console.log(e);
    });
  },    

  cancelCheckIn() {
    this.setData({ isCheckInModalHidden: true });
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
      startBtnVal: `Check-in Code: (${checkInCode})`,
      startBtnDisabled: true,
    });
  },

  showError: function(title) {
    Util.showToast(title, 'none');
  }
});