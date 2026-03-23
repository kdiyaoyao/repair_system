package com.community.repairsystem.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    private String password;

    /**
     * 角色标识
     * 建议改为 Integer 以匹配 SQL 中的设计：
     * 0: 住户(OWNER), 1: 管理员(ADMIN), 2: 维修员(WORKER)
     */
    private Integer role;

    // --- 新增业务字段（支撑报修闭环） ---

    private String nickname;     // 真实姓名，派工时显示“张师傅”

    private String phone;        // 联系电话，方便维修员联系住户

    private String houseNumber;  // 门牌号，老旧小区精准定位

    private String openid;       // 微信一键登录标识

    private Integer isElderly;   // 0:普通, 1:高龄老人（适老化服务标记）

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}