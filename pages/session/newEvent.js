// pages/session/newEvent.js
import Util from '../../utils/util';
import WXRequest from '../../utils/wxRequest';

Page({

  /**
   * Page initial data
   */
  data: {
    dateTimeArray: null,
    startDateTime: null,
    // endDateTime: null,
    startDateTimeVal: '',
    // endDateTimeVal: '',
    startYear: 2018,
    endYear: 2118,
    durations: ['30 Minutes', '45 Minutes', '1 Hour'],
    durationIndex: 0,
    difficulties: ['Beginner', 'Intermediate', 'Advanced'],
    difficultyIndex: 0,
    locations: [
      { id: 2, name: "PVG03 D5.2" },
      { id: 3, name: "PVG03 D5.3" }
    ],
    locationIndex: 0,
    directions: [
      { id: 2, name: "Cutting Edge Tech", imageSrc: null },
      { id: 3, name: "Frontend", imageSrc: null }
    ],
    directionIndex: 0
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this._initDateTimePicker();
    this._initData();
  },

  _initData: function() {
    WXRequest.get('/session/init').then(res => {
      if (res.data.msg === 'ok') {
        console.log('/session/init', res.data);
        let retObj = res.data.retObj;
        this.setData({
          directions: retObj.directions,
          locations: retObj.locations
        });
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _initDateTimePicker: function () {
    // 获取完整的年月日 时分秒，以及默认显示的数组
    let dateTimeObj = Util.dateTimePicker(this.data.startYear, this.data.endYear);
    let dateTimeArray = dateTimeObj.dateTimeArray;
    let dateTime = dateTimeObj.dateTime;

    let startDateTimeVal = this._calDateTimeVal(dateTime, dateTimeArray)

    this.setData({
      dateTimeArray: dateTimeArray,
      startDateTime: dateTime,
      startDateTimeVal: startDateTimeVal
      // endDateTime: dateTimeObj.dateTime
    });
  },

  changeSartDateTimeVal(e) {
    let dateTime = e.detail.value;
    let startDateTimeVal = this._calDateTimeVal(dateTime);
    this.inputChange('startDateTimeVal', startDateTimeVal);
  },

  _calDateTimeVal: function (dateTime, oriDateTimeArray) {
    let dateTimeArray = this.data.dateTimeArray || oriDateTimeArray;
    let temp = dateTime.map((val, i) => {
      return dateTimeArray[i][val];
    });
    let dateTimeVal = `${temp[0]}-${temp[1]}-${temp[2]} ${temp[3]}:${ temp[4]}`;
    console.log(dateTimeVal);
    return dateTimeVal;
  },

  changeStartDateTimeColumn(e) {
    let arr = this.data.startDateTime, 
        dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = Util.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({
      dateTimeArray: dateArr,
      startDateTime: arr
    });
  },

  bindDurationChange: function(e) {
    this.inputChange('durationIndex', e.detail.value);
  },

  bindLocationChange: function (e) {
    this.inputChange('locationIndex', e.detail.value);
  },

  bindDirectionChange: function(e) {
    this.inputChange('directionIndex', e.detail.value);
  },

  bindDifficultyChange: function(e) {
    this.inputChange('difficultyIndex', e.detail.value);
  },

  inputChange: function (name, value) {
    this.setData({
      [name]: value
    });
  },

  onSubmit: function(event) {
    let value = event.detail.value;
    let eventDetail = this._buildEventDetail(value);

    WXRequest.post('/session/edit', eventDetail).then(res => {
      if (res.data.msg === 'ok') {
        wx.navigateBack({
          delta: 1
        });
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _buildEventDetail: function(value) {
    let startDateTimeVal = this.data.startDateTimeVal;
    let duration = this.data.durations[value.duration];
    let endDateTimeVal = this._calEndDateTimeVal(startDateTimeVal, duration);

    let eventDetail = {
      owner: {
        id: Util.getUserId()
      },
      topic: value.topic,
      description: value.description,
      startDate: startDateTimeVal,
      endDate: endDateTimeVal,
      direction: {
        id: this.data.directions[value.direction].id
      },
      difficulty: value.difficulty,
      location: {
        id: this.data.locations[value.location].id
      }
    };
    return eventDetail;
  },

  _calEndDateTimeVal: (startDateTime, duration) => {
    let iosTime = startDateTime.replace(/-/g, '/');

    let n = duration.split(' ')[0];
    let time = parseInt(n === '1' ? '60' : n);
    let endDateTime = new Date(new Date(iosTime).getTime() + time * 60 * 1000);

    return Util.getDateTime(endDateTime);
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  }
})