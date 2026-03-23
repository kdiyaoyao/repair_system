package com.community.repairsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.community.repairsystem.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}