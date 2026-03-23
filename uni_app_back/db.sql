-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: community_repair
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `notice`
--

DROP TABLE IF EXISTS `notice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '接收通知的用户ID',
  `order_id` bigint DEFAULT NULL COMMENT '关联的报修单ID',
  `title` varchar(100) DEFAULT NULL COMMENT '通知标题',
  `content` text COMMENT '通知内容/进度说明',
  `type` int DEFAULT '0' COMMENT '0:个人业务通知, 1:全小区公共公告',
  `is_read` tinyint(1) DEFAULT '0' COMMENT '是否已读',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_notices` (`user_id`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='通知与工单进度流水表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notice`
--

LOCK TABLES `notice` WRITE;
/*!40000 ALTER TABLE `notice` DISABLE KEYS */;
/*!40000 ALTER TABLE `notice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repair_order`
--

DROP TABLE IF EXISTS `repair_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repair_order` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(100) DEFAULT NULL COMMENT '报修简述',
  `content` text COMMENT '详细描述/故障说明',
  `status` int DEFAULT '0' COMMENT '0:待受理, 1:已派工, 2:维修中, 3:已完成, 4:已评价, 5:已取消',
  `fault_type` varchar(50) DEFAULT NULL COMMENT '智能化识别：设施名称',
  `image_urls` text COMMENT '现场图片地址',
  `address` varchar(255) DEFAULT NULL COMMENT '门牌号/具体位置',
  `user_id` bigint NOT NULL COMMENT '发起报修的业主ID',
  `worker_id` bigint DEFAULT NULL COMMENT '指派的维修员ID',
  `worker_name` varchar(50) DEFAULT NULL COMMENT '维修员姓名',
  `rating` int DEFAULT NULL COMMENT '满意度评分(1-5星)',
  `voice_comment` text COMMENT '语音转文字后的评价建议',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '报修提交时间',
  `assign_time` datetime DEFAULT NULL COMMENT '管理员派工时间',
  `finish_time` datetime DEFAULT NULL COMMENT '维修完成时间',
  `score` int DEFAULT '5',
  `comment` text,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='老旧小区报修工单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repair_order`
--

LOCK TABLES `repair_order` WRITE;
/*!40000 ALTER TABLE `repair_order` DISABLE KEYS */;
INSERT INTO `repair_order` VALUES (1,'电梯故障','电梯门关不住',1,'',NULL,'1-302',2,8,'张师傅',NULL,NULL,'2026-03-19 18:22:32','2026-03-19 18:56:25',NULL,5,NULL),(2,'路灯不亮','路灯一闪一闪的',4,'',NULL,'1-302',2,NULL,NULL,4,'师傅修好了，但是环境没有清理干净','2026-03-19 18:32:58',NULL,NULL,5,NULL);
/*!40000 ALTER TABLE `repair_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '登录账号',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `nickname` varchar(50) DEFAULT NULL COMMENT '姓名/昵称',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `role` int DEFAULT '0' COMMENT '角色权限：0:普通住户, 1:物业管理员, 2:维修人员',
  `openid` varchar(100) DEFAULT NULL COMMENT '微信唯一标识(用于一键登录)',
  `house_number` varchar(50) DEFAULT NULL COMMENT '关联门牌号(如: 3号楼2单元401)',
  `is_elderly` tinyint(1) DEFAULT '0' COMMENT '是否为高龄/孤寡老人(适老化标记)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户信息与角色权限表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','123456','admin','15811111111',1,NULL,'1-301',0,'2026-03-19 18:05:26'),(2,'user','123456','user','13388888888',0,NULL,'1-302',0,'2026-03-19 18:05:58');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker`
--

DROP TABLE IF EXISTS `worker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(50) NOT NULL COMMENT '维修员姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `skills` varchar(255) DEFAULT NULL COMMENT '擅长领域（如：电路,水管,木工）',
  `avg_score` double DEFAULT '5' COMMENT '平均评分（5分制）',
  `total_orders` int DEFAULT '0' COMMENT '累计完成单数',
  `status` int DEFAULT '0' COMMENT '工作状态（0:空闲, 1:忙碌, 2:休假）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '入职时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='维修员信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker`
--

LOCK TABLES `worker` WRITE;
/*!40000 ALTER TABLE `worker` DISABLE KEYS */;
/*!40000 ALTER TABLE `worker` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'community_repair'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-19 21:03:25
