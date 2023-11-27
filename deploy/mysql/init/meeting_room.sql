/*
 Navicat Premium Data Transfer

 Source Server         : hello-mysql
 Source Server Type    : MySQL
 Source Server Version : 80200
 Source Host           : localhost:3306
 Source Schema         : meeting_room

 Target Server Type    : MySQL
 Target Server Version : 80200
 File Encoding         : 65001

 Date: 27/11/2023 15:07:17
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for booking
-- ----------------------------
DROP TABLE IF EXISTS `booking`;
CREATE TABLE `booking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `startTime` datetime NOT NULL COMMENT '会议开始时间',
  `endTime` datetime NOT NULL COMMENT '会议结束时间',
  `status` varchar(20) NOT NULL DEFAULT '1' COMMENT '状态(申请中=1、审批通过=2、审批驳回=3、已解除=4)',
  `note` varchar(100) NOT NULL DEFAULT '' COMMENT '备注',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `userId` int DEFAULT NULL,
  `roomId` int DEFAULT NULL COMMENT '会议室ID',
  PRIMARY KEY (`id`),
  KEY `FK_336b3f4a235460dc93645fbf222` (`userId`),
  KEY `FK_769a5e375729258fd0bbfc0a456` (`roomId`),
  CONSTRAINT `FK_336b3f4a235460dc93645fbf222` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_769a5e375729258fd0bbfc0a456` FOREIGN KEY (`roomId`) REFERENCES `meeting_room` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of booking
-- ----------------------------
BEGIN;
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (1, '2023-10-30 16:10:44', '2023-10-30 17:10:44', '4', '没事啊', '2023-10-30 08:10:43.530030', '2023-11-20 10:49:55.000000', 1, 1);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (2, '2023-10-30 16:10:44', '2023-10-30 17:10:44', '2', '反正他读不能', '2023-10-30 08:10:43.547102', '2023-11-20 09:31:42.896773', 2, 2);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (3, '2023-10-30 16:10:44', '2023-10-30 17:10:44', '3', '饭饭宝宝', '2023-10-30 08:10:43.559597', '2023-11-20 09:31:42.899899', 2, 1);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (4, '2023-10-30 16:10:44', '2023-10-30 17:10:44', '4', '我要结婚了', '2023-10-30 08:10:43.571131', '2023-11-20 09:31:42.902513', 1, 2);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (5, '2023-11-21 09:09:53', '2023-11-21 09:09:53', '1', '没事', '2023-11-21 09:10:55.000000', '2023-11-21 01:15:13.111618', 3, 3);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (6, '2023-11-21 09:10:13', '2023-11-21 09:09:53', '1', '你觉得', '2023-11-21 09:11:01.000000', '2023-11-21 01:15:13.126200', 3, 3);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (7, '2023-11-21 09:09:53', '2023-11-21 09:09:53', '1', '我不觉得', '2023-11-21 09:11:05.000000', '2023-11-21 01:15:13.136442', 4, 4);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (8, '2023-11-21 09:09:53', '2023-11-21 09:10:32', '1', '你的货', '2023-11-21 09:11:06.000000', '2023-11-21 01:15:13.145580', 4, 4);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (9, '2023-11-21 09:15:26', '2023-11-21 09:15:29', '1', 'note', '2023-11-21 09:15:46.000000', '2023-11-21 09:15:48.000000', 1, 1);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (10, '2023-11-21 09:15:28', '2023-11-21 09:15:30', '1', 'note2', '2023-11-21 09:15:47.000000', '2023-11-21 09:15:49.000000', 1, 1);
INSERT INTO `booking` (`id`, `startTime`, `endTime`, `status`, `note`, `createTime`, `updateTime`, `userId`, `roomId`) VALUES (11, '2023-11-21 09:16:59', '2023-11-21 09:17:01', '1', '浓浓的', '2023-11-21 09:17:10.000000', '2023-11-21 09:17:13.000000', 2, 2);
COMMIT;

-- ----------------------------
-- Table structure for meeting_room
-- ----------------------------
DROP TABLE IF EXISTS `meeting_room`;
CREATE TABLE `meeting_room` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '会议室ID',
  `name` varchar(50) NOT NULL COMMENT '会议室名称',
  `capacity` int NOT NULL COMMENT '会议室容量',
  `location` varchar(50) NOT NULL COMMENT '会议室位置',
  `equipment` varchar(50) NOT NULL DEFAULT '' COMMENT '会议室设备',
  `description` varchar(100) NOT NULL DEFAULT '' COMMENT '会议室描述',
  `isBooked` tinyint NOT NULL DEFAULT '0' COMMENT '会议室是否被预定',
  `createdTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of meeting_room
-- ----------------------------
BEGIN;
INSERT INTO `meeting_room` (`id`, `name`, `capacity`, `location`, `equipment`, `description`, `isBooked`, `createdTime`, `updatedTime`) VALUES (1, '木星', 10, '一层西', '白板', '', 0, '2023-10-30 08:09:32.918124', '2023-10-30 08:09:32.918124');
INSERT INTO `meeting_room` (`id`, `name`, `capacity`, `location`, `equipment`, `description`, `isBooked`, `createdTime`, `updatedTime`) VALUES (2, '金星', 5, '二层东', '', '', 0, '2023-10-30 08:09:32.918124', '2023-10-30 08:09:32.918124');
INSERT INTO `meeting_room` (`id`, `name`, `capacity`, `location`, `equipment`, `description`, `isBooked`, `createdTime`, `updatedTime`) VALUES (3, '天王星', 30, '三层东', '白板，电视', '', 0, '2023-10-30 08:09:32.918124', '2023-10-30 08:09:32.918124');
INSERT INTO `meeting_room` (`id`, `name`, `capacity`, `location`, `equipment`, `description`, `isBooked`, `createdTime`, `updatedTime`) VALUES (4, '我的会议室', 100, '荣都', '应有尽有', '描述不当', 0, '2023-11-08 07:15:55.402710', '2023-11-08 07:15:55.402710');
COMMIT;

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '权限代码',
  `description` varchar(100) NOT NULL COMMENT '权限描述',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of permissions
-- ----------------------------
BEGIN;
INSERT INTO `permissions` (`id`, `code`, `description`) VALUES (1, 'ccc', '访问 ccc 接口');
INSERT INTO `permissions` (`id`, `code`, `description`) VALUES (2, 'ddd', '访问 ddd 接口');
COMMIT;

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `rolesId` int NOT NULL,
  `permissionsId` int NOT NULL,
  PRIMARY KEY (`rolesId`,`permissionsId`),
  KEY `IDX_0cb93c5877d37e954e2aa59e52` (`rolesId`),
  KEY `IDX_d422dabc78ff74a8dab6583da0` (`permissionsId`),
  CONSTRAINT `FK_0cb93c5877d37e954e2aa59e52c` FOREIGN KEY (`rolesId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_d422dabc78ff74a8dab6583da02` FOREIGN KEY (`permissionsId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
BEGIN;
INSERT INTO `role_permissions` (`rolesId`, `permissionsId`) VALUES (1, 1);
INSERT INTO `role_permissions` (`rolesId`, `permissionsId`) VALUES (1, 2);
INSERT INTO `role_permissions` (`rolesId`, `permissionsId`) VALUES (2, 1);
COMMIT;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL COMMENT '角色名',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of roles
-- ----------------------------
BEGIN;
INSERT INTO `roles` (`id`, `name`) VALUES (1, '管理员');
INSERT INTO `roles` (`id`, `name`) VALUES (2, '普通用户');
COMMIT;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(50) NOT NULL COMMENT '密码',
  `nick_name` varchar(50) NOT NULL COMMENT '昵称',
  `email` varchar(50) NOT NULL COMMENT '邮箱',
  `headPic` varchar(100) DEFAULT NULL COMMENT '头像',
  `phoneNumber` varchar(20) DEFAULT NULL COMMENT '手机号',
  `isFreeze` tinyint NOT NULL DEFAULT '0' COMMENT '是否冻结',
  `isAdmin` tinyint NOT NULL DEFAULT '0' COMMENT '是否是管理员',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of user
-- ----------------------------
BEGIN;
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (1, 'zhangsan', '7fa8282ad93047a4d6fe6111c93b308a', '张三', 'xxx@xx.com', 'uploads/avatar.jpg', '13233323333', 0, 1, '2023-10-30 08:06:43.440373', '2023-10-30 08:32:51.930660');
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (2, 'lisi', 'e3ceb5881a0a1fdaad01296d7554868d', '李四', 'yyy@yy.com', 'uploads/avatar', NULL, 0, 0, '2023-10-30 08:06:43.480136', '2023-10-30 08:32:29.521045');
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (3, '小胖', 'e3ceb5881a0a1fdaad01296d7554868d', '曾小胖', 'zeng@qq.com', NULL, '12343223423', 0, 1, '2023-11-21 09:12:01.000000', '2023-11-21 09:12:04.000000');
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (4, '饭饭', 'e3ceb5881a0a1fdaad01296d7554868d', '曾饭', 'fam@qq.com', NULL, '423423423', 0, 1, '2023-11-21 09:12:45.000000', '2023-11-21 09:12:47.000000');
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (5, '无名氏', 'e3ceb5881a0a1fdaad01296d7554868d', '俺是无名', 'wuming@163.com', NULL, '12312', 0, 0, '2023-11-21 09:13:36.000000', '2023-11-21 09:13:39.000000');
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (6, 'zxp', 'e10adc3949ba59abbe56e057f20f883e', '小胖', 'zengxpang@163.com', NULL, '13312343441', 0, 1, '2023-11-24 06:51:46.986892', '2023-11-24 07:15:55.431501');
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (7, 'xun', 'e10adc3949ba59abbe56e057f20f883e', '洵', 'zengxpang@163.com', 'uploads/1700809335297-160757125-371699925158_.pic.jpg', '13456789919', 0, 0, '2023-11-24 07:03:56.160039', '2023-11-24 10:38:25.743039');
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (8, '荒', 'e10adc3949ba59abbe56e057f20f883e', 'Huang', 'zengxpang@163.com', NULL, '13344342131', 0, 1, '2023-11-24 07:06:39.747748', '2023-11-24 07:06:39.747748');
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (9, 'ye', 'e10adc3949ba59abbe56e057f20f883e', '叶', 'zengxpang@163.com', NULL, '13455467890', 0, 1, '2023-11-24 07:12:44.313601', '2023-11-24 07:12:44.313601');
INSERT INTO `user` (`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFreeze`, `isAdmin`, `createTime`, `updateTime`) VALUES (10, 'ye3', 'e10adc3949ba59abbe56e057f20f883e', '叶', 'zengxpang@163.com', NULL, '13455467890', 0, 1, '2023-11-24 07:13:05.363385', '2023-11-24 07:13:05.363385');
COMMIT;

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `userId` int NOT NULL,
  `rolesId` int NOT NULL,
  PRIMARY KEY (`userId`,`rolesId`),
  KEY `IDX_472b25323af01488f1f66a06b6` (`userId`),
  KEY `IDX_13380e7efec83468d73fc37938` (`rolesId`),
  CONSTRAINT `FK_13380e7efec83468d73fc37938e` FOREIGN KEY (`rolesId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_472b25323af01488f1f66a06b67` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of user_roles
-- ----------------------------
BEGIN;
INSERT INTO `user_roles` (`userId`, `rolesId`) VALUES (1, 1);
INSERT INTO `user_roles` (`userId`, `rolesId`) VALUES (2, 2);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
