package com.community.repairsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.community.repairsystem.entity.Worker; // 确保你已经有了 Worker 实体类
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface WorkerMapper extends BaseMapper<Worker> {

    /**
     * 更新师傅的统计数据
     * @param workerId 师傅ID
     * @param avgScore 最新的平均分
     * @param totalOrders 总完工单数
     */
    @Update("UPDATE worker SET avg_score = #{avgScore}, total_orders = #{totalOrders} WHERE id = #{workerId}")
    void updateWorkerRating(@Param("workerId") Long workerId,
                            @Param("avgScore") Double avgScore,
                            @Param("totalOrders") Integer totalOrders);
}