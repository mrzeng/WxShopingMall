// myOrders.js
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["所有订单", "待付款", "配送中", "待评价"],//商品收藏Tab
    activeIndex: 0,//商品详情Tab
    sliderOffset: 0,//商品详情Tab
    sliderLeft: 0,//商品详情Tab

    startX: 0, //开始坐标
    startY: 0
  },
  /*商品详情Tab 开始*/
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  /*商品详情Tab 结束*/


  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.myOrders.forEach(function (v, i) {
      if (v.isTouchMove == undefined || v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      myOrders: this.data.myOrders
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.myOrders.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      myOrders: that.data.myOrders
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function (e) {
    this.data.myOrders.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      myOrders: this.data.myOrders
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    /*商品详情Tab 开始*/
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    /*商品详情Tab 结束*/
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
    var that = this;
    var thirdSessionKey = wx.getStorageSync('thirdSessionKey');
    if (thirdSessionKey != null) {
      app.ajax.reqPost('/shoppingMall/orderInfoGet', {
        "thirdSessionKey": thirdSessionKey
      }, function (res) {
        if (!res || res.error == true) {//失败直接返回        
          return;
        }
        // 格式化
        var tempArr = res.myOrders;
        tempArr.forEach(item => {
          var temp;
          if (item.orderStatus == 0) {
            temp = '待付款';
          }
          else if (item.orderStatus == 1) {
            temp = '待发货';
          }
          else if (item.orderStatus == 1) {
            temp = '待确认收货';
          }
          else if (item.orderStatus == 1) {
            temp = '待评价';
          }
          else if (item.orderStatus == 1) {
            temp = '待再次购买';
          }
          item.orderStatus = temp;
        });
        that.checkOrders(that, tempArr);
      });
    }
  },
  checkOrders: function (that, tempArr) {
    var waitingForPay = tempArr.filter(item => {
      if (item.orderStatus == '待付款')
        return {};
    });
    var waitingForComfirm = tempArr.filter(item => {
      if (item.orderStatus == '待确认收货')
        return {};
    });
    var waitingForComment = tempArr.filter(item => {
      if (item.orderStatus == '待评价')
        return {};
    });
    that.setData({
      myOrders: tempArr,
      waitingForPay: waitingForPay,
      waitingForComfirm: waitingForComfirm,
      waitingForComment: waitingForComment
    });
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