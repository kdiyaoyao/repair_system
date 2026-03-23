Page({
  data: {
    orders: [],
    currentTab: 0, // 0: 待受理, 1: 全部流水
    stats: {
      pending: 0,
      todayNew: 0,
      processing: 0,
      completed: 0
    }
  },

  onShow() {
    // 每次进入页面刷新数据，确保管理员看到的是最新工单
    this.refreshPage();
  },

  // 封装刷新逻辑，方便下拉刷新或操作后调用
  refreshPage() {
    this.getStats();
    this.fetchOrders(this.data.currentTab);
  },

  // 1. 获取顶部看板统计数据（对接后端 /api/repair/stats）
  getStats() {
    wx.request({
      url: 'http://localhost:8080/api/repair/stats',
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          // res.data 包含了 pending, todayNew, processing, completed
          this.setData({
            stats: res.data
          });
        }
      }
    });
  },

  // 2. 获取报修列表（根据 Tab 过滤）
  fetchOrders(tabIndex) {
    wx.showLoading({ title: '加载中' });
    
    // 逻辑：
    // tabIndex 为 0 时，只查询 status = 0 (待受理)
    // tabIndex 为 1 时，查询全部（不传 status 参数）
    const queryData = {};
    if (tabIndex === 0) {
      queryData.status = 0;
    }

    wx.request({
      url: 'http://localhost:8080/api/repair/list',
      method: 'GET',
      data: queryData,
      success: (res) => {
        // 对返回的列表进行时间格式化处理（去掉 ISO 时间中的 T）
        const formattedList = (res.data || []).map(item => {
          if (item.createTime) {
            item.createTime = item.createTime.replace('T', ' ').substring(0, 16);
          }
          return item;
        });

        this.setData({
          orders: formattedList
        });
      },
      fail: () => {
        wx.showToast({ title: '列表加载失败', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 3. 切换 Tab 逻辑
  switchTab(e) {
    // dataset 获取到的是字符串，转为数字
    const status = parseInt(e.currentTarget.dataset.status);
    if (this.data.currentTab === status) return; // 避免重复点击

    this.setData({ 
      currentTab: status,
      orders: [] // 切换时先清空列表，提升用户体验
    });
    this.fetchOrders(status);
  },

  // 4. 处理指派逻辑（目前为 ActionSheet 模拟，后续可改为动态获取）
  updateStatus(e) {
    const orderId = e.currentTarget.dataset.id;
    
    wx.showActionSheet({
      itemList: ['指派给 张师傅 (电路)', '指派给 李师傅 (水路)', '指派给 王师傅 (综合)'],
      success: (res) => {
        // 模拟维修员 ID（对应 User 表中 role=2 的用户）
        const workers = [
          { id: 8, name: '张师傅' },
          { id: 9, name: '李师傅' },
          { id: 10, name: '王师傅' }
        ];
        const selectedWorker = workers[res.tapIndex];
        
        // 执行派工请求
        this.assignWorker(orderId, selectedWorker);
      }
    });
  },

  // 调用后端指派接口
  assignWorker(orderId, worker) {
    wx.showLoading({ title: '指派中...' });
    wx.request({
      url: 'http://localhost:8080/api/repair/assign',
      method: 'PUT',
      data: {
        orderId: orderId,
        workerId: worker.id,
        workerName: worker.name
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 200) {
          wx.showToast({
            title: '已指派至 ' + worker.name,
            icon: 'success'
          });
          // 操作成功后，刷新看板数字和当前列表
          this.refreshPage();
        } else {
          wx.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      }
    });
  }
});