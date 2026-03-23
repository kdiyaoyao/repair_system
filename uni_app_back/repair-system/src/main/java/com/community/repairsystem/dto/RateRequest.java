package com.community.repairsystem.dto;

import lombok.Data;

/**
 * 住户提交评价的请求对象
 */
@Data
public class RateRequest {
    private Long id;            // 工单ID
    private Integer score;      // 分数（前端传过来的 score 对应实体类的 rating）
    private String comment;    // 评语（前端传过来的 comment 对应实体类的 voiceComment）
}