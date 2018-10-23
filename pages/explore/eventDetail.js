import WXRequest from '../../utils/wxRequest';

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
      location: 'PVG 03 1C'
    }
  },

  onLoad: function (e) {
    WXRequest.request.get('/session/' + e.id).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        var eventDetail = res.data.retObj;
        this.setData({
          eventDetail: eventDetail
        });
      }
    }).catch(e => {
      console.log(e);
    });
  },

  onRegister: function(event) {
    // call API to register the event
    console.log('Register: ', event);
    this.setData({
      disabled: !this.data.disabled,
      loading: !this.data.loading,
    });

    var me = this;
    setTimeout(function() {
      wx.showToast({title: 'Successfully'});
      me.setData({
        loading: !me.data.loading,
        registerBtnVal: 'Registered'
      })
    }, 2000);
  }
});