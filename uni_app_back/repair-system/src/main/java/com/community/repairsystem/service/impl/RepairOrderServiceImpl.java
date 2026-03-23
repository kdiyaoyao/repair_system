package com.community.repairsystem.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.community.repairsystem.dto.RateRequest;
import com.community.repairsystem.entity.RepairOrder;
import com.community.repairsystem.mapper.RepairOrderMapper;
import com.community.repairsystem.mapper.WorkerMapper;
import com.community.repairsystem.service.RepairOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RepairOrderServiceImpl extends ServiceImpl<RepairOrderMapper, RepairOrder> implements RepairOrderService {

    @Autowired
    private RepairOrderMapper repairOrderMapper;

    @Autowired
    private WorkerMapper workerMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean rateOrder(RateRequest request) {
        // 1. 获取工单
        RepairOrder order = this.getById(request.getId());

        // --- 修正点：使用括号包裹比较逻辑，或者使用 Object 比较 ---
        // 逻辑：如果工单不存在，或者工单状态不等于“已完成(3)”，则拒绝评价
        if (order == null || !order.getStatus().equals(RepairOrder.STATUS_COMPLETED)) {
            return false;
        }

        // 2. 更新工单评价字段
        order.setRating(request.getScore());
        order.setVoiceComment(request.getComment());
        order.setStatus(RepairOrder.STATUS_EVALUATED); // 状态变为 4
        boolean orderUpdated = this.updateById(order);

        // 3. 级联更新师傅的大数据统计信息
        if (orderUpdated && order.getWorkerId() != null) {
            updateWorkerStats(order.getWorkerId());
        }

        return orderUpdated;
    }

    private void updateWorkerStats(Long workerId) {
        // 从 Mapper 中获取该师傅的最新统计数据
        Double avgRating = repairOrderMapper.getAverageRatingByWorkerId(workerId);
        Integer finishedCount = repairOrderMapper.getFinishedCountByWorkerId(workerId);

        // 容错处理：如果平均分为空则设为初始 5.0
        if (avgRating == null) avgRating = 5.0;

        // 更新 Worker 表
        workerMapper.updateWorkerRating(workerId, avgRating, finishedCount);
    }
}