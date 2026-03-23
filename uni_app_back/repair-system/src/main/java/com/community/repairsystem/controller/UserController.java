package com.community.repairsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.community.repairsystem.entity.User;
import com.community.repairsystem.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin // 解决跨域问题
public class UserController {

    @Autowired
    private UserMapper userMapper;

    /**
     * 登录接口
     * @param loginRequest 前端传来的用户名和密码
     * @return 登录结果
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User loginRequest) {
        Map<String, Object> response = new HashMap<>();

        // 1. 使用 QueryWrapper 构建查询条件：username = ? AND password = ?
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", loginRequest.getUsername())
                .eq("password", loginRequest.getPassword());

        // 2. 执行查询
        User user = userMapper.selectOne(queryWrapper);

        // 3. 逻辑判断
        if (user != null) {
            response.put("code", 200);
            response.put("msg", "登录成功");
            // 将用户信息（包含ID和Role）传回前端，方便后续逻辑判断
            response.put("data", user);
        } else {
            response.put("code", 401);
            response.put("msg", "用户名或密码错误");
        }

        return response;
    }

    @PostMapping("/updatePwd")
    public Map<String, Object> updatePwd(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 获取参数
            Long id = Long.valueOf(params.get("id").toString());
            String newPassword = (String) params.get("newPassword");

            // 执行更新
            User user = userMapper.selectById(id);
            if (user != null) {
                user.setPassword(newPassword);
                userMapper.updateById(user);

                result.put("code", 200);
                result.put("msg", "密码修改成功");
            } else {
                result.put("code", 404);
                result.put("msg", "用户不存在");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "服务器异常: " + e.getMessage());
        }

        return result;
    }

    // UserController 中
    @GetMapping("/workers")
    public List<User> getWorkerList() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("role", 2); // 2 代表维修员
        return userMapper.selectList(queryWrapper);
    }
}