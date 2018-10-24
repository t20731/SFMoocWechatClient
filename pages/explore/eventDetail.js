import WXRequest from '../../utils/wxRequest';
import Util from '../../utils/util';

Page({
  data: { // 参与页面渲染的数据
    disabled: false,
    loading: false,
    registerBtnVal: 'Register',
    eventDetail: {
      owner: {
        id: '001',
        nickname: 'Mickey White',
        avatarUrl: 'https://developers.weixin.qq.com/miniprogram/dev/image/cat/0.jpg?t=18101919'
      },
      topic: 'Event Detail',
      description: 'Bacon ipsum dolor amet shankle buffalo salami biltong, meatloaf pork strip steak meatball ham sausage chicken leberkas. Corned beef capicola picanha pork loin fatback hamburger. Leberkas short ribs pork chuck. Beef boudin turkey capicola, shankle ham hock frankfurter leberkas spare ribs shoulder ground round flank ham sirloin.',
      startDate: '2018-10-21 15:00',
      endDate: '2018-10-21 16:00',
      location: {id: null, name: 'PVG 03 1C'}
    }
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
        this.setData({
          eventDetail: eventDetail
        });
        if (userId && retObj.userRegistered) {
          this._markRegistered();
        }
      }
    }).catch(e => {
      console.log(e);
    });
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

  showError: function(title) {
    Util.showToast(title, 'none');
  }
});