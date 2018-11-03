// pages/notice/notice.js
import Util from '../../utils/util';
import WXRequest from '../../utils/wxRequest';
import * as CONST from '../../utils/const';
const app = getApp()
const systemInfo = app.globalData.systemInfo;
let listVisibleHeight = systemInfo.windowHeight * (750 / systemInfo.windowWidth) - 400

Page({

  /**
   * 页面的初始数据
   */
  data: {
    listVisibleHeight: listVisibleHeight,
    imgPaths: [
      '../../images/vue.jpg',
      '../../images/weapp.jpg',
      '../../images/python.jpg',
    ],
    // tabItems: CONST.EXPLORE_TOPIC_CATEGORY,
    selectedTabIndex: 0,
    scrollLeft: 0,
    showFilterPopup: false,
    directions: [],
    sessions: [],
    pageNum: 1,
    showNoData: 'false',
    difficultyLevels: CONST.DIFFICULTY_LEVELS,
    orderByFields: CONST.ORDER_BY,
    selectedLevel: -1,
    selectedOrder: null,
    loadingStatusVals: {
      isLoading: false,
      isNoMoreData: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
  },

  init: function(){
    WXRequest.post('/session/all', {
      pageNum: 1,
      pageSize: 10
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log(res.data);
        let swiperHeight = this.getCoumptedSwiperHeight(res.data.retObj.sessions.length)
        this.setData({
          directions: res.data.retObj.directions,
          sessions: res.data.retObj.sessions,
          swiperHeight: swiperHeight
        });
      }
    }).catch(e => {
        console.log(e)
    });
  },

  swichNav: function (evt) {
    let cur = evt.target.dataset.current;
    this._resetData();
    if (this.data.selectedTabIndex === cur) { 
      return false; 
    } else {
      this.loadNewTabItemData(cur);
    }
  },
  switchTab: function (evt) {
    this._resetData();
    let cur = evt.detail.current;
    this.loadNewTabItemData(cur);    
  },

  loadNewTabItemData: function (selectedTabIndex) {
    this.setData({
      selectedTabIndex: selectedTabIndex
    });
    let directionId = this.data.directions[selectedTabIndex].id;
    let options = {
      "pageNum": 1,
      "pageSize": 10,
      "directionId": directionId
    };
    this._fetchSessionList(options);
  },
  getCoumptedSwiperHeight: function (count) {
    let itemsHeight = count * 200;
    let swiperHeight = itemsHeight > this.data.listVisibleHeight  ? itemsHeight : this.data.listVisibleHeight;
    return swiperHeight;
  },
  goToSearchPage: function (evt) {
    wx.navigateTo({
      url: 'search/search'
    })
  },

  goToFilterPage: function () {
    this.setData({
      showFilterPopup: true
    });
  },
 
  goDetail: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../session/eventDetail?id=' + id,
    })
  },

  onTagChange: function (evt) {
    let filterType = evt.target.dataset.type;
    let newValue = evt.target.dataset.tagvalue;
    let dataPropertyName;
    if (filterType === 'level') {
      dataPropertyName = 'selectedLevel';
    } else {
      dataPropertyName = 'selectedOrder';
    }
    if (newValue !== this.data[dataPropertyName]) {
      this.setData({
        [dataPropertyName]: newValue
      });
    }
  },

  comfirmFilter: function () {
    this.setData({
      showFilterPopup: false
    });
    if (this.data.selectedLevel < 0 && !this.data.selectedOrder) {
      return;
    }
    let selectedIndex = this.data.selectedTabIndex;
    let directionId = this.data.directions[selectedIndex].id;    
    WXRequest.post('/session/list', {
      "pageNum": 1,
      "pageSize": 10,
      "directionId": directionId,
      "difficulty": this.data.selectedLevel,
      "orderField": this.data.selectedOrder
    }).then(res => {
      console.log(res);
      if (res.data.msg === 'ok') {
        let swiperHeight = this.getCoumptedSwiperHeight(res.data.retObj.length);
        this.setData({
          sessions: res.data.retObj,
          swiperHeight: swiperHeight,
          showNoData: res.data.retObj.length === 0,
          selectedLevel: -1,
          selectedOrder: ''
        });
      }
    }).catch(err => {
      console.log(err);
    });
  },
  closeFilterPopup: function () {
    this.setData({
      showFilterPopup: false,
      selectedLevel: -1,
      selectedOrder: ''
    });
  },
  _fetchSessionList: function (options) {
    return WXRequest.post('/session/list', options).then(res => {
      let swiperHeight = this.getCoumptedSwiperHeight(res.data.retObj.length);
      this.setData({
        sessions: res.data.retObj,
        swiperHeight: swiperHeight,
        showNoData: res.data.retObj.length === 0,
      });
    }).catch(e => {
      console.log(e)
    });
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
    //  this.init();
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
    console.log('onPullDownRefresh...');
    let selectedIndex = this.data.selectedTabIndex;
    let directionId = this.data.directions[selectedIndex].id;
    let options = {
      "pageNum": 1,
      "pageSize": 10,
      "directionId": directionId,
    };
    this._fetchSessionList(options);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadingStatusVals.isNoMoreData) return;
    this._setLoadingText('isLoading', true);
    let selectedIndex = this.data.selectedTabIndex;
    let directionId = this.data.directions[selectedIndex].id;
    let pageNum = this.data.pageNum + 1;
    this.setData({
      pageNum: pageNum
    });
    WXRequest.post('/session/list', {
      "pageNum": pageNum,
      "pageSize": 10,
      "directionId": directionId
      // "orderField": "total_members"
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log(this.data.sessions);
        if (res.data.retObj.length) {
          let newSessions = this.data.sessions.concat(res.data.retObj)
          let swiperHeight = this.getCoumptedSwiperHeight(newSessions.length);
          this.setData({
            sessions: newSessions,
            swiperHeight: swiperHeight,
            showNoData: false
          });
          console.log(this.data.sessions);
        } else {
          if (!this.data.loadingStatusVals.isNoMoreData) {
            this._setLoadingText('isNoMoreData', true);
          }
        }
      }
      this._setLoadingText('isLoading', false);
    }).catch(e => {
      console.log(e)
      this._setLoadingText('isLoading', false);
    });
  },
  // Todo: miss loading text
  _setLoadingText: function (propName, status) {
    this.data.loadingStatusVals[propName] = status;
    this.setData({
      loadingStatusVals: this.data.loadingStatusVals,
    });
    if (propName === 'isNoMoreData' ) {
      this.setData({
        swiperHeight: this.data.swiperHeight + 85
      })
    }
  },
  _resetData: function () {
    this.setData({
      pageNum: 1,
      loadingStatusVals: {
        isLoading: false,
        isNoMoreData: false
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
