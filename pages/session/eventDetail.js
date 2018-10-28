import WXRequest from '../../utils/wxRequest';
import Util from '../../utils/util';

const ENROLL_NUMBER = 1;
Page({
  data: { // 参与页面渲染的数据
    isOwner: false,
    disabled: false,
    loading: false,
    registerBtnVal: 'Register',
    startBtnVal: 'Start Session',
    startBtnDisabled: false,
    quizBtnVal: 'Quiz Management',
    quizBtnDisabled: false,
    eventDetail: null
  },

  onLoad: function (e) {
    let userId = Util.getUserId();

    this._checkGuest(userId);

    WXRequest.post('/session/detail',{
      sessionId: e.id,
      userId: userId
    }).then(res => {
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
    if (userId === null) {
      // guest cannot register
      this.setData({
        registerBtnVal: 'Login to Register',
        disabled: true
      });
    }
  },

  _markRegistered: function () {
    this.setData({
      disabled: true,
      registerBtnVal: 'Registered'
    });
  },

  onRegister: function(event) {
    // call API to register the event
    console.log('Register: ', event);
    this.setData({
      disabled: !this.data.disabled,
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
          registerBtnVal: 'Registered'
        })
      } else {
        this.setData({
          disabled: false
        });
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

  onStartSession(event) {
    let userId = Util.getUserId();
    let canStart = this._canStart(this.data.eventDetail.enrollments);
    if (canStart) {
      WXRequest.post('/session/start', {
        sessionId: this.data.eventDetail.id,
        userId: userId
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log(res.data);
          let checkInCode = res.data.retObj.CheckInCode;
          this._markStarted(checkInCode);
        }
      }).catch(e => {
        console.log(e);
      });
    } else {
      Util.showToast("Enrollments has not reached to the threshold.", 'none', 3000);
    }
  },

  _markStarted(checkInCode) {
    this.setData({
      startBtnVal: `Started (${checkInCode})`,
      startBtnDisabled: true,
    });
  },

  showError: function(title) {
    Util.showToast(title, 'none');
  }
});