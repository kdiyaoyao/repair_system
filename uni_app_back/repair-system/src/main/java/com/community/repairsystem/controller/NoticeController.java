package com.community.repairsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.community.repairsystem.entity.Notice;
import com.community.repairsystem.mapper.NoticeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notice")
public class NoticeController {

    @Autowired
    private NoticeMapper noticeMapper;

    /**
     * 获取当前用户的通知列表
     */
    @GetMapping("/list")
    public List<Notice> getMyNotices(@RequestParam Long userId) {
        QueryWrapper<Notice> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                .orderByDesc("create_time");
        return noticeMapper.selectList(queryWrapper);
    }
}