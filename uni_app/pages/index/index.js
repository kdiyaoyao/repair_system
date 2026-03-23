Page({
  data: {
    orders: [],
    role: '',     // 存储当前角色：OWNER 或 ADMIN
    userId: null  // 存储用户ID
  },

  onShow: function () {
    // 1. 从缓存获取登录时存入的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    
    if (!userInfo) {
      // 如果没登录，打回登录页
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }

    this.setData({
      role: userInfo.role,
      userId: userInfo.id
    });

    // 2. 根据身份请求不同的数据
    this.fetchOrders();
  },

  fetchOrders: function () {
    const { role, userId } = this.data;
    let url = 'http://localhost:8080/api/repair/list';
    
    // 如果是业主，只查自己的，把 userId 发给后端
    if (role === 'OWNER') {
      url += '?userId=' + userId;
    }

    wx.request({
      url: url,
      method: 'GET',
      success: (res) => {
        this.setData({ orders: res.data });
      }
    });
  }
})