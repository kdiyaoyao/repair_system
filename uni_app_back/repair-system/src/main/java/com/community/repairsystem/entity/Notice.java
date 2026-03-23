package com.community.repairsystem.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("notice")
public class Notice {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String content;

    private Long userId; // 接收通知的用户ID

    // --- 必须添加以下两个字段以匹配数据库和 Controller 逻辑 ---
    private Long orderId; // 关联的报修单ID (用于驱动前端时间轴)

    private Integer type; // 0: 个人业务通知(工单进度), 1: 全小区公共公告

    private Integer isRead; // 0: 未读, 1: 已读 (可选，建议加上)
    // ---------------------------------------------------

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}