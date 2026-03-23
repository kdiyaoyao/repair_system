Page({
  data: {
    allOrders: [],
    displayOrders: [],
    notices: [],
    currentType: 'all', // all: 全部, doing: 进行中, done: 已办结
    tabLineLeft: 0,
    unreadNoticeCount: 0 // 新增：未读消息红点统计
  },

  onShow: function () {
    this.fetchAllData();
  },

  fetchAllData: function () {
    const userInfo = wx.getStorageSync('userInfo');
    // 强制登录校验
    if (!userInfo || !userInfo.id) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }

    wx.showLoading({ title: '加载中...' });

    // 1. 获取该住户的所有报修单
    wx.request({
      url: 'http://localhost:8080/api/repair/list',
      method: 'GET',
      data: { userId: userInfo.id }, // 后端根据 userId 过滤该住户的单子
      success: (res) => {
        let list = res.data || [];
        
        // 格式化数据：处理时间字符串 & 状态排序
        list = list.map(item => {
          if (item.createTime) {
            item.createTime = item.createTime.replace('T', ' ').substring(0, 16);
          }
          return item;
        });

        // 排序逻辑：待处理(0) > 已派工(1) > 维修中(2) > 已完成(3) > 已评价(4)
        // 同状态下按创建时间倒序
        list.sort((a, b) => {
          if (a.status !== b.status) return a.status - b.status;
          return new Date(b.createTime) - new Date(a.createTime);
        });

        this.setData({ allOrders: list }, () => {
          this.filterOrders();
        });
      }
    });

    // 2. 获取通知/进度流水（对应时间轴数据源）
    wx.request({
      url: 'http://localhost:8080/api/notice/list',
      method: 'GET',
      data: { userId: userInfo.id },
      success: (res) => {
        const noticeList = res.data || [];
        const unread = noticeList.filter(n => n.isRead === 0).length;
        this.setData({ 
          notices: noticeList,
          unreadNoticeCount: unread
        });
      },
      complete: () => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    });
  },

  // 切换顶部 Tab
  switchTab: function (e) {
    const type = e.currentTarget.dataset.type;
    let left = 0;
    if (type === 'doing') left = 33.33;
    if (type === 'done') left = 66.66;

    wx.vibrateShort({ type: 'light' });

    this.setData({ 
      currentType: type,
      tabLineLeft: left 
    }, () => {
      this.filterOrders();
    });
  },

  // 核心：基于新状态体系的过滤逻辑
  filterOrders: function () {
    const { allOrders, currentType } = this.data;
    let filtered = [];
    
    if (currentType === 'all') {
      filtered = allOrders;
    } else if (currentType === 'doing') {
      // 状态 0, 1, 2 均属于“正在处理中”
      filtered = allOrders.filter(item => item.status < 3);
    } else if (currentType === 'done') {
      // 状态 3, 4 属于“已办结”
      filtered = allOrders.filter(item => item.status >= 3);
    }
    
    this.setData({ displayOrders: filtered });
  },

  // --- 导航跳转 ---

  navToApply: function () {
    // 跳转报修申请页，老年人点击“我要报修”大按钮
    wx.navigateTo({ url: '/pages/repair/apply' });
  },

  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/repair/detail/detail?id=${id}`
    });
  },

  goToNoticeCenter: function () {
    wx.navigateTo({ url: '/pages/notice/notice' });
  },
  
  onPullDownRefresh: function () {
    this.fetchAllData();
  }
})