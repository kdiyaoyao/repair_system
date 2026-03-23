package com.community.repairsystem.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("repair_order")
public class RepairOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;
    private String content;

    /**
     * 状态：0:待受理, 1:已派工, 2:维修中, 3:已完成, 4:已评价, 5:已取消
     */
    private Integer status;

    private String faultType;
    private String imageUrls;
    private String address;

    private Long userId;
    private Long workerId;
    private String workerName;

    // --- 评价闭环字段 ---
    @TableField("rating")
    private Integer rating;       // 1-5星评价（对应数据库 rating）

    @TableField("voice_comment")
    private String voiceComment;  // 评价内容（对应数据库 voice_comment）

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    private LocalDateTime assignTime;
    private LocalDateTime finishTime;

    // 状态常量
    public static final int STATUS_PENDING = 0;
    public static final int STATUS_ASSIGNED = 1;
    public static final int STATUS_FIXING = 2;
    public static final int STATUS_COMPLETED = 3;
    public static final int STATUS_EVALUATED = 4;
}