package com.community.repairsystem.service;

import com.community.repairsystem.dto.RateRequest;
import com.community.repairsystem.entity.RepairOrder;
import com.baomidou.mybatisplus.extension.service.IService;

public interface RepairOrderService extends IService<RepairOrder> {
    // 定义评价业务逻辑接口
    boolean rateOrder(RateRequest request);
}