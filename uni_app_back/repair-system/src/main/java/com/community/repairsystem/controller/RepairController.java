package com.community.repairsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.community.repairsystem.dto.RateRequest;
import com.community.repairsystem.entity.RepairOrder;
import com.community.repairsystem.service.RepairOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/repair")
@CrossOrigin // 建议加上，防止小程序开发工具跨域问题
public class RepairController {

    @Autowired
    private RepairOrderService repairOrderService;

    /**
     * 1. 查询报修列表（支持多条件过滤）
     */
    @GetMapping("/list")
    public List<RepairOrder> getOrders(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Integer status) {

        QueryWrapper<RepairOrder> queryWrapper = new QueryWrapper<>();

        if (userId != null) {
            queryWrapper.eq("user_id", userId);
        }

        if (status != null) {
            // 状态 3,4 都属于已结案，如果前端传 3，我们把评价过的也查出来
            if (status == RepairOrder.STATUS_COMPLETED) {
                queryWrapper.in("status", 3, 4);
                // 已结案的通常只查最近30天，避免数据量过大
                queryWrapper.ge("create_time", LocalDateTime.now().minusDays(30));
            } else {
                queryWrapper.eq("status", status);
            }
        }

        queryWrapper.orderByDesc("create_time");
        return repairOrderService.list(queryWrapper);
    }

    /**
     * 2. 获取单个报修详情
     */
    @GetMapping("/detail/{id}")
    public RepairOrder getDetail(@PathVariable Long id) {
        return repairOrderService.getById(id);
    }

    /**
     * 3. 发起报修 (住户端)
     */
    @PostMapping("/add")
    public Map<String, Object> addOrder(@RequestBody RepairOrder order) {
        Map<String, Object> res = new HashMap<>();
        order.setStatus(RepairOrder.STATUS_PENDING); // 0
        order.setCreateTime(LocalDateTime.now());

        boolean saved = repairOrderService.save(order);
        res.put("code", saved ? 200 : 500);
        res.put("msg", saved ? "提交成功" : "提交失败");
        return res;
    }

    /**
     * 4. 提交评价 (住户端新增)
     * 内部逻辑已在 Service 层处理：更新工单 + 计算师傅平均分
     */
    @PutMapping("/rate")
    public Map<String, Object> submitRate(@RequestBody RateRequest request) {
        Map<String, Object> res = new HashMap<>();

        boolean success = repairOrderService.rateOrder(request);

        res.put("code", success ? 200 : 400);
        res.put("msg", success ? "评价成功" : "评价失败：工单未完成或不存在");
        return res;
    }

    /**
     * 5. 管理员派工接口
     */
    @PutMapping("/assign")
    public Map<String, Object> assignOrder(@RequestBody Map<String, Object> params) {
        Map<String, Object> res = new HashMap<>();
        try {
            Long orderId = Long.valueOf(params.get("orderId").toString());
            Long workerId = Long.valueOf(params.get("workerId").toString());
            String workerName = (String) params.get("workerName");

            // 业务逻辑移至 Service 统一管理（建议在 Service 中实现 assign 逻辑）
            // 这里为了保持演示直观，展示核心字段修改
            RepairOrder order = repairOrderService.getById(orderId);
            if (order != null) {
                order.setWorkerId(workerId);
                order.setWorkerName(workerName);
                order.setStatus(RepairOrder.STATUS_ASSIGNED); // 1
                order.setAssignTime(LocalDateTime.now());
                repairOrderService.updateById(order);

                res.put("code", 200);
                res.put("msg", "派工成功");
            } else {
                res.put("code", 404);
                res.put("msg", "工单不存在");
            }
        } catch (Exception e) {
            res.put("code", 500);
            res.put("msg", "异常: " + e.getMessage());
        }
        return res;
    }

    /**
     * 6. 管理员统计看板
     */
    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // 待受理 (0)
        long pending = repairOrderService.count(new QueryWrapper<RepairOrder>().eq("status", 0));

        // 进行中 (1:已派工, 2:维修中)
        long processing = repairOrderService.count(new QueryWrapper<RepairOrder>().in("status", 1, 2));

        // 已结案 (3:已完成, 4:已评价)
        long completed = repairOrderService.count(new QueryWrapper<RepairOrder>().in("status", 3, 4));

        // 今日新增
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long todayNew = repairOrderService.count(new QueryWrapper<RepairOrder>().ge("create_time", todayStart));

        stats.put("code", 200);
        stats.put("pending", pending);
        stats.put("processing", processing);
        stats.put("completed", completed);
        stats.put("todayNew", todayNew);
        return stats;
    }
}