// pages/explore/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCloseHidden: true,
    searchValue: "",
    searchSubmitHidden: true,
    searchResetHidden: false,
    switchFlag: true,
    hotSearchKeys1: ['Java', 'Javascript', 'Python', 'HANA'],
    hotSearchKeys2: ['React', 'VUE', 'Product', 'Mysql', 'UI design'],
    historyData: [],
    historyDataHidden: false,
    searchResult: false,
    inputSearch: "",
    searchResult: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSearchHistory();
  },
  /*输入框输入后触发，用于联想搜索和切换取消确认*/
  handleInputChange: function (e) {
    this.setData({
      searchSubmitHidden: false,
      searchResetHidden: true,
      isCloseHidden: false,
      searchValue: e.detail.value
    })
  },
  
  resetInputValue: function () {
    this.setData({
      searchSubmitHidden: true,
      searchResetHidden: false,
      isClose: true,
      inputSearch: "",
      searchResult: false
    })
  },
  cancelSearch: function () {
    wx.navigateBack({
      url: 'explore'
    })
  },

  changeHotSearchKeys: function () {
    this.setData({
      switchFlag: !this.data.switchFlag
    })
  },
  searchEvents: function () {
    let newHistoryData = this.data.historyData.concat(this.data.searchValue);
    this.setSearchHistory(newHistoryData);
  },
  clearSearchHistory: function () {
    this.setSearchHistory([]);
  },
  setSearchHistory: function (newData) {
    let that = this;
    wx.setStorage({
      key: "historydata",
      data: newData,
      success: function (res) {
        that.setData({
          historyData: newData
        })
      }
    })
  },
  getSearchHistory: function () {
    let that = this;
    wx.getStorage({
      key: "historydata",
      success: function (res) {
        that.setData({
          historyData: res.data
        })
      }
    })
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
