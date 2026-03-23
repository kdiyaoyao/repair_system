package com.community.repairsystem.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("worker")
public class Worker {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 维修员姓名
     */
    private String name;

    /**
     * 联系电话
     */
    private String phone;

    /**
     * 擅长领域：用于智能匹配报修单的 faultType
     */
    private String skills;

    /**
     * 大数据评分：由 RepairOrderServiceImpl 实时回写
     * 默认值建议设为 5.0
     */
    @TableField("avg_score")
    private Double avgScore;

    /**
     * 累计完工数：体现师傅的资历
     */
    @TableField("total_orders")
    private Integer totalOrders;

    /**
     * 工作状态：0:空闲, 1:忙碌, 2:休假
     */
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    // 状态常量定义
    public static final int STATUS_IDLE = 0;   // 空闲
    public static final int STATUS_BUSY = 1;   // 忙碌
    public static final int STATUS_LEAVE = 2;  // 休假
}