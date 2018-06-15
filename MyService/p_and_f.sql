/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50722
Source Host           : localhost:3306
Source Database       : myweb

Target Server Type    : MYSQL
Target Server Version : 50722
File Encoding         : 65001

Date: 2018-06-15 17:44:03
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Procedure structure for p_authority_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_authority_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_authority_query`(pr_id int,
	pr_code varchar(256),
	pr_name varchar(256),
	pr_status int,
	pr_anyKey varchar(256),
	pr_excludeByUserId int,
	pr_excludeByRoleCode varchar(256),
	pr_orderBy varchar(1000),
	pr_nullList varchar(1000),
	pr_pageIndex int,
	pr_pageSize int)
    SQL SECURITY INVOKER
BEGIN    
	IF pr_nullList IS NULL THEN
		SET pr_nullList = '';
	END IF;
	SET pr_nullList = CONCAT(',', pr_nullList, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_authority t1 WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_code IS NOT NULL AND length(pr_code) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`code` like ''%',replace_special_char(pr_code), '%''');
	ELSEIF LOCATE(',code,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`code` IS NULL');
	END IF;

	IF pr_name IS NOT NULL AND length(pr_name) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`name` like ''%',replace_special_char(pr_name), '%''');
	ELSEIF LOCATE(',name,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`name` IS NULL');
	END IF;

	IF pr_status IS NOT NULL AND length(pr_status) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`status` = ''',replace_special_char(pr_status), '''');
	ELSEIF LOCATE(',status,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`status` IS NULL');
	END IF;

	IF pr_anyKey IS NOT NULL AND length(pr_anyKey) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND (t1.`code` like ''%',replace_special_char(pr_anyKey), '%''');
		SET @Sql = CONCAT(@Sql, ' OR t1.`name` like ''%',replace_special_char(pr_anyKey), '%'')');
	END IF;

	IF pr_excludeByUserId IS NOT NULL AND length(pr_excludeByUserId) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`code` NOT IN (SELECT authorityCode FROM t_user_info_with_authority WHERE userInfoId = ',pr_excludeByUserId,')');
	END IF;

	IF pr_excludeByRoleCode IS NOT NULL AND length(pr_excludeByRoleCode) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`code` NOT IN (SELECT authorityCode FROM t_role_with_authority WHERE roleCode = ''',pr_excludeByRoleCode,''')');
	END IF;

	IF pr_orderBy IS NOT NULL AND length(pr_orderBy) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' ORDER BY ', replace_special_char(pr_orderBy));
	END IF;

	IF pr_pageIndex IS NOT NULL AND pr_pageSize IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' limit ', (pr_pageIndex - 1) * pr_pageSize, ',', pr_pageSize);
	END IF;
	SET @Sql = CONCAT(@Sql, ';');
	-- SELECT @Sql;
	PREPARE stmt1 FROM @Sql;
	EXECUTE stmt1;
	SELECT FOUND_ROWS() AS 'count';
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_log_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_log_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_log_query`(pr_id int,
	pr_url varchar(50),
	pr_application varchar(50),
	pr_method varchar(50),
	pr_methodName varchar(50),
	pr_result tinyint,
	pr_code varchar(50),
	pr_req text,
	pr_res text,
	pr_ip varchar(50),
	pr_createDateStart datetime,
	pr_createDateEnd datetime,
	pr_remark text,
	pr_guid varchar(50),
	pr_requestIp varchar(50),
	pr_nullList varchar(1000),
	pr_pageIndex int,
	pr_pageSize int)
    SQL SECURITY INVOKER
BEGIN  
	IF pr_nullList IS NULL THEN
		SET pr_nullList = '';
	END IF;
	SET pr_nullList = CONCAT(',', pr_nullList, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_log WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` IS NULL');
	END IF;

	IF pr_url IS NOT NULL AND length(pr_url) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `url` like ''%',replace_special_char(pr_url), '%''');
	ELSEIF LOCATE(',url,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `url` IS NULL');
	END IF;

	IF pr_application IS NOT NULL AND length(pr_application) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `application` like ''%',replace_special_char(pr_application), '%''');
	ELSEIF LOCATE(',application,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `application` IS NULL');
	END IF;

	IF pr_method IS NOT NULL AND length(pr_method) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `method` like ''%',replace_special_char(pr_method), '%''');
	ELSEIF LOCATE(',method,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `method` IS NULL');
	END IF;

	IF pr_methodName IS NOT NULL AND length(pr_methodName) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `methodName` like ''%',replace_special_char(pr_methodName), '%''');
	ELSEIF LOCATE(',methodName,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `methodName` IS NULL');
	END IF;

	IF pr_result IS NOT NULL AND length(pr_result) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `result` = ''',replace_special_char(pr_result), '''');
	ELSEIF LOCATE(',result,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `result` IS NULL');
	END IF;

	IF pr_code IS NOT NULL AND length(pr_code) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `code` = ''',replace_special_char(pr_code), '''');
	ELSEIF LOCATE(',code,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `code` IS NULL');
	END IF;

	IF pr_req IS NOT NULL AND length(pr_req) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `req` like ''%',replace_special_char(pr_req), '%''');
	ELSEIF LOCATE(',req,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `req` IS NULL');
	END IF;

	IF pr_res IS NOT NULL AND length(pr_res) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `res` like ''%',replace_special_char(pr_res), '%''');
	ELSEIF LOCATE(',res,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `res` IS NULL');
	END IF;

	IF pr_ip IS NOT NULL AND length(pr_ip) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `ip` like ''%',replace_special_char(pr_ip), '%''');
	ELSEIF LOCATE(',ip,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `ip` IS NULL');
	END IF;

	IF pr_createDateStart IS NOT NULL AND length(pr_createDateStart) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `createDate` >= ''',replace_special_char(pr_createDateStart), '''');
	ELSEIF LOCATE(',createDate,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `createDate` IS NULL');
	END IF;

	IF pr_createDateEnd IS NOT NULL AND length(pr_createDateEnd) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `createDate` <= ''',replace_special_char(pr_createDateEnd), '''');
	ELSEIF LOCATE(',createDate,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `createDate` IS NULL');
	END IF;

	IF pr_remark IS NOT NULL AND length(pr_remark) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `remark` like ''%',replace_special_char(pr_remark), '%''');
	ELSEIF LOCATE(',remark,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `remark` IS NULL');
	END IF;

	IF pr_guid IS NOT NULL AND length(pr_guid) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `guid` = ''',replace_special_char(pr_guid), '''');
	ELSEIF LOCATE(',guid,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `guid` IS NULL');
	END IF;


	IF pr_requestIp IS NOT NULL AND length(pr_requestIp) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `requestIp` like ''%',replace_special_char(pr_requestIp), '%''');
	ELSEIF LOCATE(',requestIp,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `requestIp` IS NULL');
	END IF;

	SET @Sql = CONCAT(@Sql, ' ORDER BY id desc ');

	IF pr_pageIndex IS NOT NULL AND pr_pageSize IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' limit ', (pr_pageIndex - 1) * pr_pageSize, ',', pr_pageSize);
	END IF;
	SET @Sql = CONCAT(@Sql, ';');
	-- SELECT @Sql;
	PREPARE stmt1 FROM @Sql;
	EXECUTE stmt1;
	SELECT FOUND_ROWS() AS 'count';
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_detail_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_detail_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_detail_query`(pr_id int, pr_noLog bit)
    SQL SECURITY INVOKER
BEGIN
	-- 主表
	SELECT t1.*, t2.nickname,t2.account FROM t_main_content t1 
		LEFT JOIN t_user_info t2 on t1.userInfoId = t2.id
	WHERE t1.id = pr_id;

	-- 类型
	select * from t_main_content_type where 
		id in (select mainContentTypeId from t_main_content_type_id where mainContentId = pr_id);
	
	-- 内容
	select * from t_main_content_child where mainContentId = pr_id order by num;

	-- 日志
	IF pr_noLog = 1 THEN
		SELECT 1 FROM (SELECT 1) t WHERE 1=0;
	ELSE
		select * from t_main_content_log where mainContentId = pr_id order by id desc;
	END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_query`(pr_id int,
	pr_type int,
	pr_status varchar(50),
	pr_user varchar(50),
	pr_title varchar(50),
	pr_description text,
	pr_createDateStart datetime,
	pr_createDateEnd datetime,
	pr_operateDateStart datetime,
	pr_operateDateEnd datetime,
	pr_operator varchar(50),
	pr_nullList varchar(1000),
	pr_pageIndex int,
	pr_pageSize int)
    SQL SECURITY INVOKER
BEGIN   
	IF pr_nullList IS NULL THEN
		SET pr_nullList = '';
	END IF;
	SET pr_nullList = CONCAT(',', pr_nullList, ',');

	DROP TEMPORARY TABLE IF EXISTS temp_p_main_content_query00;

 
	SET @Sql ='CREATE TEMPORARY TABLE temp_p_main_content_query00 ';
	SET @Sql = CONCAT(@Sql, 'SELECT t1.id, t1.status, t2.account, t2.nickname FROM t_main_content t1 left join t_user_info t2 on t1.userInfoId = t2.id WHERE 1 = 1 ');
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_type IS NOT NULL AND length(pr_type) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`type` in (',replace_special_char(pr_type), ')');
	ELSEIF LOCATE(',type,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`type` IS NULL');
	END IF;

	IF pr_title IS NOT NULL AND length(pr_title) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`title` = ''',replace_special_char(pr_title), '''');
	ELSEIF LOCATE(',title,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`title` IS NULL');
	END IF;

	IF pr_description IS NOT NULL AND length(pr_description) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`description` = ''',replace_special_char(pr_description), '''');
	ELSEIF LOCATE(',description,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`description` IS NULL');
	END IF;

	IF pr_createDateStart IS NOT NULL AND length(pr_createDateStart) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`createDate` >= ''',replace_special_char(pr_createDateStart), '''');
	END IF;
	IF pr_createDateEnd IS NOT NULL AND length(pr_createDateEnd) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`createDate` <= ''',replace_special_char(pr_createDateEnd), '''');
	END IF;
	IF LOCATE(',createDate,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`createDate` IS NULL');
	END IF;

	IF pr_operateDateStart IS NOT NULL AND length(pr_operateDateStart) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`operateDate` >= ''',replace_special_char(pr_operateDateStart), '''');
	END IF;
	IF pr_operateDateEnd IS NOT NULL AND length(pr_operateDateEnd) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`operateDate` <= ''',replace_special_char(pr_operateDateEnd), '''');
	END IF;
	IF LOCATE(',operateDate,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`operateDate` IS NULL');
	END IF;	


	IF pr_user IS NOT NULL AND length(pr_user) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND (t1.`user_info` like ''%', replace_special_char(pr_user), 
				'%'' OR t1.`userInfoId` in ( SELECT id FROM t_user_info WHERE `account` like ''%', 
				replace_special_char(pr_user), '%'' OR `nickname` like ''%',replace_special_char(pr_user), '%''))');
	END IF;

	IF pr_operator IS NOT NULL AND length(pr_operator) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` in ( SELECT distinct mainContentId FROM t_main_content_log WHERE `operator` like ''%', 
				replace_special_char(pr_operator), '%'')');
	END IF;

	SET @Sql = CONCAT(@Sql, ';');


	-- 获取的数据
	SET @Sql2 = 'SELECT SQL_CALC_FOUND_ROWS t1.*, t2.account, t2.nickname FROM t_main_content t1 left join t_user_info t2 on t1.userInfoId = t2.id '; 
	SET @Sql2 = CONCAT(@Sql2, 'WHERE t1.id in (SELECT id from temp_p_main_content_query00) ');

	IF pr_status IS NOT NULL AND length(pr_status) > 0 THEN
		SET @Sql2 = CONCAT(@Sql2, ' AND t1.`status` in (',replace_special_char(pr_status), ')');
	ELSEIF LOCATE(',status,', pr_nullList) > 0 THEN
		SET @Sql2 = CONCAT(@Sql2, ' AND t1.`status` IS NULL');
	END IF;

	SET @Sql2 = CONCAT(@Sql2, ' order by id desc ');

	IF pr_pageIndex IS NOT NULL AND pr_pageSize IS NOT NULL THEN
		SET @Sql2 = CONCAT(@Sql2, ' limit ', (pr_pageIndex - 1) * pr_pageSize, ',', pr_pageSize);
	END IF;
	SET @Sql2 = CONCAT(@Sql2, ';');

	-- SELECT @Sql;
	
	-- 临时表
	PREPARE stmt1 FROM @Sql;
	EXECUTE stmt1;

	-- 获取数据
	PREPARE stmt2 FROM @Sql2;
	EXECUTE stmt2;

	-- 总数
	SELECT FOUND_ROWS() AS "count";
	
-- 状态分组
	SELECT status, count(*) as count FROM temp_p_main_content_query00 GROUP BY status;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_role_detail_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_role_detail_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_role_detail_query`(pr_code varchar(256))
    SQL SECURITY INVOKER
BEGIN 
	SELECT * FROM t_role WHERE `code` = pr_code;
	SELECT * FROM t_authority WHERE 
		`code` in (SELECT authorityCode from  t_role_with_authority where`roleCode` = pr_code)
		ORDER BY `code`;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_role_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_role_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_role_query`(pr_id int,
	pr_code varchar(256),
	pr_name varchar(256),
	pr_status int,
	pr_anyKey varchar(256),
	pr_excludeByUserId int,
	pr_orderBy varchar(1000),
	pr_nullList varchar(1000),
	pr_pageIndex int,
	pr_pageSize int)
    SQL SECURITY INVOKER
BEGIN   
	IF pr_nullList IS NULL THEN
		SET pr_nullList = '';
	END IF;
	SET pr_nullList = CONCAT(',', pr_nullList, ',');

	SET @Sql = 'FROM t_role t1 WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_code IS NOT NULL AND length(pr_code) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`code` like ''%',replace_special_char(pr_code), '%''');
	ELSEIF LOCATE(',code,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`code` IS NULL');
	END IF;

	IF pr_name IS NOT NULL AND length(pr_name) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`name` like ''%',replace_special_char(pr_name), '%''');
	ELSEIF LOCATE(',name,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`name` IS NULL');
	END IF;

	IF pr_status IS NOT NULL AND length(pr_status) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`status` = ''',replace_special_char(pr_status), '''');
	ELSEIF LOCATE(',status,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`status` IS NULL');
	END IF;
	
	IF pr_anyKey IS NOT NULL AND length(pr_anyKey) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND (t1.`code` like ''%',replace_special_char(pr_anyKey), '%''');
		SET @Sql = CONCAT(@Sql, ' OR t1.`name` like ''%',replace_special_char(pr_anyKey), '%'')');
	END IF;

	IF pr_excludeByUserId IS NOT NULL AND length(pr_excludeByUserId) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`code` NOT IN (SELECT roleCode FROM t_user_info_with_role WHERE userInfoId = ',pr_excludeByUserId,')');
	END IF;

	IF pr_orderBy IS NOT NULL AND length(pr_orderBy) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' ORDER BY ', replace_special_char(pr_orderBy));
	END IF;

	IF pr_pageIndex IS NOT NULL AND pr_pageSize IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' limit ', (pr_pageIndex - 1) * pr_pageSize, ',', pr_pageSize);
	END IF;
	SET @Sql = CONCAT(@Sql, ';');
-- 匹配数据
	SET @dataSql = CONCAT('SELECT * ',@Sql);
	SET @tempSql = CONCAT('CREATE TEMPORARY TABLE temp_p_role_query00 SELECT code ',@Sql);
	-- SELECT @Sql;
	PREPARE stmt1 FROM @dataSql;
	EXECUTE stmt1;

	-- 匹配临时表
	DROP TEMPORARY TABLE IF EXISTS temp_p_role_query00;  
	PREPARE stmt2 FROM @tempSql;
	EXECUTE stmt2;

	-- 数量
	SET @countSql = CONCAT('SELECT count(*) AS count ',@Sql);	
	SET @countSql = CONCAT(@countSql, ';');
	PREPARE stmt3 FROM @countSql;
	EXECUTE stmt3;	

	-- 权限关联信息
	SELECT * FROM t_role_with_authority where`roleCode` in (select `code` from temp_p_role_query00);
	SELECT * FROM t_authority WHERE 
		`code` in (SELECT authorityCode from  t_role_with_authority where`roleCode` in (select `code` from temp_p_role_query00)) 
		ORDER BY `code`;

END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_detail_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_detail_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_detail_query`(pr_id int, pr_noLog bit)
    SQL SECURITY INVOKER
BEGIN
	-- 主表
	SELECT * FROM t_user_info WHERE `id` = pr_id;
	-- 日志
	IF pr_noLog = 1 THEN
		SELECT 1 FROM (SELECT 1) t WHERE 1=0;
	ELSE
		SELECT * FROM t_user_info_log WHERE `userInfoId` = pr_id ORDER BY id DESC;
	END IF;
	-- 用户权限
	SELECT * FROM t_authority WHERE 
		`code` in (select `authorityCode` from t_user_info_with_authority where `userInfoId` = pr_id);
	-- 角色
	SELECT * FROM t_role WHERE 
		`code` in (select `roleCode` from t_user_info_with_role where `userInfoId` = pr_id);
	-- 角色权限
	SELECT DISTINCT t4.*, t1.code AS roleCode, t1.`status` AS roleStatus FROM t_role t1 
		LEFT JOIN t_user_info_with_role t2 ON t1.`code` = t2.roleCode
		LEFT JOIN t_role_with_authority t3 ON t2.roleCode = t3.roleCode 
		LEFT JOIN t_authority t4 ON t3.authorityCode = t4.`code`
		WHERE t2.userInfoId = pr_id;
	-- 架构
	SELECT * FROM t_struct t1 WHERE t1.struct in (SELECT t2.struct FROM t_user_info_with_struct t2 WHERE t2.userInfoId = pr_id);
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_query`(pr_id int,
	pr_account varchar(50),
	pr_password varchar(50),
	pr_nickname varchar(50),
	pr_role varchar(200),
	pr_authority varchar(200),
	pr_editDateStart datetime,
	pr_editDateEnd datetime,
	pr_createDateStart datetime,
	pr_createDateEnd datetime,
	pr_remark text,
	pr_nullList varchar(1000),
	pr_pageIndex int,
	pr_pageSize int)
    SQL SECURITY INVOKER
BEGIN  
	IF pr_nullList IS NULL THEN
		SET pr_nullList = '';
	END IF;
	SET pr_nullList = CONCAT(',', pr_nullList, ',');

	DROP TEMPORARY TABLE IF EXISTS temp_p_user_info_query00;
	DROP TEMPORARY TABLE IF EXISTS temp_p_user_info_query01;  
	DROP TEMPORARY TABLE IF EXISTS temp_p_user_info_query02;  
	CREATE TEMPORARY TABLE temp_p_user_info_query01(id int);-- 角色
	CREATE TEMPORARY TABLE temp_p_user_info_query02(id int);-- 权限

	IF pr_role IS NOT NULL THEN
		INSERT INTO temp_p_user_info_query01 
			SELECT userInfoId  FROM t_user_info_with_role WHERE roleCode LIKE CONCAT('%',replace_special_char(pr_role),'%');
	END IF;

	IF pr_authority IS NOT NULL THEN
		INSERT INTO temp_p_user_info_query02 
			SELECT userInfoId  FROM t_user_info_with_authority WHERE authorityCode LIKE CONCAT('%',replace_special_char(pr_authority),'%');
		INSERT INTO temp_p_user_info_query02 
			SELECT userInfoId  FROM t_user_info_with_role t1
			LEFT JOIN t_role_with_authority t2 ON t1.roleCode = t2.roleCode
			WHERE t2.authorityCode LIKE CONCAT('%',replace_special_char(pr_authority),'%');
	END IF;


	SET @Sql = ' FROM t_user_info t1 WHERE 1 = 1 ';
	IF pr_id IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_account IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`account` like ''%',replace_special_char(pr_account), '%''');
	ELSEIF LOCATE(',account,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`account` IS NULL');
	END IF;

	IF pr_password IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`password` like ''%',replace_special_char(pr_password), '%''');
	ELSEIF LOCATE(',password,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`password` IS NULL');
	END IF;

	IF pr_nickname IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`nickname` like ''%',replace_special_char(pr_nickname), '%''');
	ELSEIF LOCATE(',nickname,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`nickname` IS NULL');
	END IF;	

	IF pr_editDateStart IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`editDate` >= ''',replace_special_char(pr_editDateStart), '''');
	ELSEIF LOCATE(',editDate,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`editDate` IS NULL');
	END IF;

	IF pr_editDateEnd IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`editDate` <= ''',replace_special_char(pr_editDateEnd), '''');
	ELSEIF LOCATE(',editDate,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`editDate` IS NULL');
	END IF;

	IF pr_createDateStart IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`createDate` >= ''',replace_special_char(pr_createDateStart), '''');
	ELSEIF LOCATE(',createDate,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`createDate` IS NULL');
	END IF;

	IF pr_createDateEnd IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`createDate` <= ''',replace_special_char(pr_createDateEnd), '''');
	ELSEIF LOCATE(',createDate,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`createDate` IS NULL');
	END IF;

	IF pr_remark IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`remark` like ''%',replace_special_char(pr_remark), '%''');
	ELSEIF LOCATE(',remark,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`remark` IS NULL');
	END IF;
	IF pr_role IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` in (SELECT DISTINCT id FROM temp_p_user_info_query01)');
	END IF;
	IF pr_authority IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` in (SELECT DISTINCT id FROM temp_p_user_info_query02)');
	END IF;

	SET @SqL = CONCAT(@sql,' ORDER BY t1.id desc ');

	-- 匹配数据
	SET @dataSql = CONCAT('SELECT * ',@Sql);
	SET @tempSql = CONCAT('CREATE TEMPORARY TABLE temp_p_user_info_query00 SELECT id ',@Sql);
	IF pr_pageIndex IS NOT NULL AND pr_pageSize IS NOT NULL THEN
		SET @dataSql = CONCAT(@dataSql, ' limit ', (pr_pageIndex - 1) * pr_pageSize, ',', pr_pageSize);
		SET @tempSql = CONCAT(@tempSql, ' limit ', (pr_pageIndex - 1) * pr_pageSize, ',', pr_pageSize);
	END IF;
	SET @dataSql = CONCAT(@dataSql, ';');
	SET @tempSql = CONCAT(@tempSql, ';');
	-- SELECT @Sql;
	PREPARE stmt1 FROM @dataSql;
	EXECUTE stmt1;

	-- 匹配临时表
	PREPARE stmt2 FROM @tempSql;
	EXECUTE stmt2;

	-- 数量
	SET @countSql = CONCAT('SELECT count(*) AS count ',@Sql);	
	SET @countSql = CONCAT(@countSql, ';');
	PREPARE stmt3 FROM @countSql;
	EXECUTE stmt3;
	
	-- 用户权限
	SELECT * from t_user_info_with_authority where `userInfoId` in (SELECT id FROM temp_p_user_info_query00);	
	SELECT * FROM t_authority WHERE 
		`code` in (select `authorityCode` from t_user_info_with_authority 
				where `userInfoId` in (SELECT id FROM temp_p_user_info_query00));
	
	-- 角色
	SELECT * from t_user_info_with_role where `userInfoId` in (SELECT id FROM temp_p_user_info_query00);	
	SELECT * FROM t_role WHERE 
		`code` in (select `roleCode` from t_user_info_with_role 
				where `userInfoId` in (SELECT id FROM temp_p_user_info_query00));

	-- 角色权限
	SELECT DISTINCT t4.*, t1.code AS roleCode, t1.`status` AS roleStatus FROM t_role t1 
		LEFT JOIN t_user_info_with_role t2 ON t1.`code` = t2.roleCode
		LEFT JOIN t_role_with_authority t3 ON t2.roleCode = t3.roleCode 
		LEFT JOIN t_authority t4 ON t3.authorityCode = t4.`code`
		WHERE t2.userInfoId in (SELECT id FROM temp_p_user_info_query00);
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_with_struct_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_with_struct_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_with_struct_query`(pr_id int,
	pr_userInfoId int,
	pr_struct varchar(50),
	pr_orderBy varchar(1000),
	pr_nullList varchar(1000),
	pr_pageIndex int,
	pr_pageSize int)
    SQL SECURITY INVOKER
BEGIN 
	IF pr_nullList IS NULL THEN
		SET pr_nullList = '';
	END IF;
	SET pr_nullList = CONCAT(',', pr_nullList, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS t1.*, t2.type FROM t_user_info_with_struct t1 LEFT JOIN t_struct t2 ON t1.struct = t2.struct WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''', pr_id, '''');
	ELSEIF LOCATE(',id,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_userInfoId IS NOT NULL AND length(pr_userInfoId) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`userInfoId` = ''', pr_userInfoId, '''');
	ELSEIF LOCATE(',userInfoId,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`userInfoId` IS NULL');
	END IF;

	IF pr_struct IS NOT NULL AND length(pr_struct) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`struct` = ''', replace_special_char(pr_struct), '''');
	ELSEIF LOCATE(',struct,', pr_nullList) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`struct` IS NULL');
	END IF;

	IF pr_orderBy IS NOT NULL AND length(pr_orderBy) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' ORDER BY ', replace_special_char(pr_orderBy));
	END IF;
	IF pr_pageIndex IS NOT NULL AND pr_pageSize IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' limit ', (pr_pageIndex - 1) * pr_pageSize, ',', pr_pageSize);
	END IF;
	SET @Sql = CONCAT(@Sql, ';');
	-- SELECT @Sql;
	PREPARE stmt1 FROM @Sql;
	EXECUTE stmt1;
	SELECT FOUND_ROWS() AS 'count';
END
;;
DELIMITER ;
