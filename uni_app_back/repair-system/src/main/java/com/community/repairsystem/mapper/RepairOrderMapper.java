package com.community.repairsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.community.repairsystem.entity.RepairOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface RepairOrderMapper extends BaseMapper<RepairOrder> {

    /**
     * 大数据核心：计算该师傅所有【已评价】(status=4) 工单的平均分
     * ROUND(..., 2) 保证分数保留两位小数，提升前端显示的友好度
     */
    @Select("SELECT ROUND(AVG(rating), 2) FROM repair_order " +
            "WHERE worker_id = #{workerId} AND status = 4")
    Double getAverageRatingByWorkerId(@Param("workerId") Long workerId);

    /**
     * 绩效核心：计算该师傅【已完成】(status>=3) 的总工单数
     * 包含已完成但未评价(3)和已评价(4)的工单
     */
    @Select("SELECT COUNT(*) FROM repair_order " +
            "WHERE worker_id = #{workerId} AND status >= 3")
    Integer getFinishedCountByWorkerId(@Param("workerId") Long workerId);
}