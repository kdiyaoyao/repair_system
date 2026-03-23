Page({
  /**
   * 1. 完善页面的初始数据
   */
  data: {
    userInfo: {},
    // --- 新增：报修统计数据结构 ---
    orderStats: {
      pending: 0,    // 待处理
      processing: 0, // 维修中
      completed: 0   // 已结案
    }
  },

  /**
   * 每次显示页面时触发
   */
  onShow() {
    // A. 获取并展示用户信息
    const user = wx.getStorageSync('userInfo');
    this.setData({ userInfo: user || {} });

    // B. 安全校验：如果没登录，跳转回登录页（防止意外进入）
    if (!user || !user.id) {
      this.forceLogout();
      return;
    }

    // C. --- 新增：如果是普通业主，则自动获取他的报修统计 ---
    if (user.role !== 'admin') {
      this.fetchUserOrderStats(user.id);
    }
  },

  /**
   * --- 新增方法：从后端获取该用户的报修统计 ---
   * 亮点：实时反映报修进度
   */
  fetchUserOrderStats(userId) {
    wx.showNavigationBarLoading(); // 在标题栏显示加载圈，不打断用户操作

    wx.request({
      // 这里可以复用之前的 /list 接口，让前端来进行状态聚合统计
      url: `http://localhost:8080/api/repair/list?userId=${userId}`,
      method: 'GET',
      success: (res) => {
        // 假设后端直接返回了列表数据
        const list = res.data;
        if (Array.isArray(list)) {
          // 在前端根据 status 进行聚合统计（0=待受理, 1-2=处理中, 3-4=已完成）
          const pendingCount = list.filter(item => item.status === 0).length;
          const processingCount = list.filter(item => item.status === 1 || item.status === 2).length;
          const completedCount = list.filter(item => item.status >= 3).length;

          this.setData({
            'orderStats.pending': pendingCount,
            'orderStats.processing': processingCount,
            'orderStats.completed': completedCount
          });
        }
      },
      fail: (err) => {
        console.error("获取统计数据失败", err);
        // 这里可以不做提示，保持界面安静
      },
      complete: () => {
        wx.hideNavigationBarLoading(); // 关闭标题栏加载圈
      }
    });
  },

  /**
   * 导航至修改密码页
   */
  navToPassword() {
    wx.navigateTo({ url: '/pages/me/password' });
  },

  /**
   * --- 新增方法：联系物业（配合 WXML 中的“联系物业”菜单） ---
   */
  contactSupport() {
    // 毕设亮点：模拟拨打 24 小时服务热线
    wx.makePhoneCall({
      phoneNumber: '021-12345678', // 这里可以改为你们物业真实的电话或管理员手机号
      success: () => {
        wx.showToast({ title: '准备拨打', icon: 'none' });
      },
      fail: () => {
        // 用户取消或未插入SIM卡时的友好提示
        wx.showToast({ title: '无法拨打，请检查SIM卡', icon: 'none' });
      }
    });
  },

  /**
   * 处理退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出当前账号吗？',
      confirmText: '退出', // 将确认按钮文字改为更直观的“退出”
      confirmColor: '#ff3b30', // 使用醒目的红色，强调警告操作
      success: (res) => {
        if (res.confirm) {
          this.forceLogout(); // 调用封装好的退出逻辑
        }
      }
    });
  },

  /**
   * --- 新增方法：封装强行退出并跳转的逻辑 ---
   */
  forceLogout() {
    // 1. 清除所有本地缓存（包括 token, userInfo 等）
    wx.clearStorageSync();
    // 2. 使用 reLaunch 关闭所有页面，重启到登录页
    wx.reLaunch({ url: '/pages/login/login' });
  }
})