/*
Navicat MySQL Data Transfer

Source Server         : mysql
Source Server Version : 50710
Source Host           : localhost:3306
Source Database       : myweb

Target Server Type    : MYSQL
Target Server Version : 50710
File Encoding         : 65001

Date: 2017-12-16 15:12:59
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Procedure structure for p_log_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_log_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_log_query`(pr_id int,
	pr_url varchar(50),
	pr_method varchar(50),
	pr_result tinyint,
	pr_code varchar(50),
	pr_req text,
	pr_res text,
	pr_ip varchar(50),
	pr_create_date_start datetime,
	pr_create_date_end datetime,
	pr_remark text,
	pr_guid varchar(50),
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_log WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` IS NULL');
	END IF;

	IF pr_url IS NOT NULL AND length(pr_url) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `url` like ''%',replace_special_char(pr_url), '%''');
	ELSEIF LOCATE(',url,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `url` IS NULL');
	END IF;

	IF pr_method IS NOT NULL AND length(pr_method) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `method` like ''%',replace_special_char(pr_method), '%''');
	ELSEIF LOCATE(',method,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `method` IS NULL');
	END IF;

	IF pr_result IS NOT NULL AND length(pr_result) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `result` = ''',replace_special_char(pr_result), '''');
	ELSEIF LOCATE(',result,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `result` IS NULL');
	END IF;

	IF pr_code IS NOT NULL AND length(pr_code) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `code` = ''',replace_special_char(pr_code), '''');
	ELSEIF LOCATE(',code,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `code` IS NULL');
	END IF;

	IF pr_req IS NOT NULL AND length(pr_req) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `req` like ''%',replace_special_char(pr_req), '%''');
	ELSEIF LOCATE(',req,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `req` IS NULL');
	END IF;

	IF pr_res IS NOT NULL AND length(pr_res) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `res` like ''%',replace_special_char(pr_res), '%''');
	ELSEIF LOCATE(',res,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `res` IS NULL');
	END IF;

	IF pr_ip IS NOT NULL AND length(pr_ip) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `ip` like ''%',replace_special_char(pr_ip), '%''');
	ELSEIF LOCATE(',ip,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `ip` IS NULL');
	END IF;

	IF pr_create_date_start IS NOT NULL AND length(pr_create_date_start) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_date` >= ''',replace_special_char(pr_create_date_start), '''');
	ELSEIF LOCATE(',create_date,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_date` IS NULL');
	END IF;

	IF pr_create_date_end IS NOT NULL AND length(pr_create_date_end) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_date` <= ''',replace_special_char(pr_create_date_end), '''');
	ELSEIF LOCATE(',create_date,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_date` IS NULL');
	END IF;

	IF pr_remark IS NOT NULL AND length(pr_remark) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `remark` like ''%',replace_special_char(pr_remark), '%''');
	ELSEIF LOCATE(',remark,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `remark` IS NULL');
	END IF;

	IF pr_guid IS NOT NULL AND length(pr_guid) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `guid` = ''',replace_special_char(pr_guid), '''');
	ELSEIF LOCATE(',guid,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `guid` IS NULL');
	END IF;
	SET @Sql = CONCAT(@Sql, ' ORDER BY id desc ');

	IF pr_page_index IS NOT NULL AND pr_page_size IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' limit ', (pr_page_index - 1) * pr_page_size, ',', pr_page_size);
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_detail_query`(pr_id int)
    SQL SECURITY INVOKER
BEGIN
	-- 主表
	SELECT t1.*, t2.nickname,t2.account FROM t_main_content t1 
		LEFT JOIN t_user_info t2 on t1.user_info_id = t2.id
	WHERE t1.id = pr_id;

	-- 类型
	select * from t_main_content_type where 
		id in (select main_content_type_id from t_main_content_type_id where main_content_id = pr_id);
	
	-- 内容
	select * from t_main_content_child where main_content_id = pr_id order by num;

	-- 日志
	select * from t_main_content_log where main_content_id = pr_id order by id desc;
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
	pr_user_info_id int,
	pr_title varchar(50),
	pr_description text,
	pr_create_date datetime,
	pr_operate_date datetime,
	pr_operator varchar(50),
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int)
    SQL SECURITY INVOKER
BEGIN 
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	DROP TEMPORARY TABLE IF EXISTS temp_p_main_content_query00; 
 
	SET @Sql ='CREATE TEMPORARY TABLE temp_p_main_content_query00 ';
	SET @Sql = CONCAT(@Sql, 'SELECT t1.id, t1.status, t2.account, t2.nickname FROM t_main_content t1 left join t_user_info t2 on t1.user_info_id = t2.id WHERE 1 = 1 ');
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_type IS NOT NULL AND length(pr_type) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`type` in (',replace_special_char(pr_type), ')');
	ELSEIF LOCATE(',type,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`type` IS NULL');
	END IF;

	IF pr_user_info_id IS NOT NULL AND length(pr_user_info_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`user_info_id` = ''',replace_special_char(pr_user_info_id), '''');
	ELSEIF LOCATE(',user_info_id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`user_info_id` IS NULL');
	END IF;

	IF pr_title IS NOT NULL AND length(pr_title) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`title` = ''',replace_special_char(pr_title), '''');
	ELSEIF LOCATE(',title,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`title` IS NULL');
	END IF;

	IF pr_description IS NOT NULL AND length(pr_description) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`description` = ''',replace_special_char(pr_description), '''');
	ELSEIF LOCATE(',description,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`description` IS NULL');
	END IF;

	IF pr_create_date IS NOT NULL AND length(pr_create_date) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`create_date` = ''',replace_special_char(pr_create_date), '''');
	ELSEIF LOCATE(',create_date,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`create_date` IS NULL');
	END IF;

	IF pr_operate_date IS NOT NULL AND length(pr_operate_date) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`operate_date` = ''',replace_special_char(pr_operate_date), '''');
	ELSEIF LOCATE(',operate_date,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`operate_date` IS NULL');
	END IF;

	IF pr_operator IS NOT NULL AND length(pr_operator) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`operator` = ''',replace_special_char(pr_operator), '''');
	ELSEIF LOCATE(',operator,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`operator` IS NULL');
	END IF;

	SET @Sql = CONCAT(@Sql, ';');


	-- 获取的数据
	SET @Sql2 = 'SELECT SQL_CALC_FOUND_ROWS t1.*, t2.account, t2.nickname FROM t_main_content t1 left join t_user_info t2 on t1.user_info_id = t2.id '; 
	SET @Sql2 = CONCAT(@Sql2, 'WHERE t1.id in (SELECT id from temp_p_main_content_query00) ');

	IF pr_status IS NOT NULL AND length(pr_status) > 0 THEN
		SET @Sql2 = CONCAT(@Sql2, ' AND t1.`status` in (',replace_special_char(pr_status), ')');
	ELSEIF LOCATE(',status,', pr_null_list) > 0 THEN
		SET @Sql2 = CONCAT(@Sql2, ' AND t1.`status` IS NULL');
	END IF;

	SET @Sql2 = CONCAT(@Sql2, ' order by id desc ');

	IF pr_page_index IS NOT NULL AND pr_page_size IS NOT NULL THEN
		SET @Sql2 = CONCAT(@Sql2, ' limit ', (pr_page_index - 1) * pr_page_size, ',', pr_page_size);
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
		`code` in (SELECT authority_code from  t_role_with_authority where`role_code` = pr_code);
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
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql = 'FROM t_role t1 WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_code IS NOT NULL AND length(pr_code) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`code` = ''',replace_special_char(pr_code), '''');
	ELSEIF LOCATE(',code,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`code` IS NULL');
	END IF;

	IF pr_name IS NOT NULL AND length(pr_name) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`name` = ''',replace_special_char(pr_name), '''');
	ELSEIF LOCATE(',name,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`name` IS NULL');
	END IF;

	IF pr_status IS NOT NULL AND length(pr_status) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`status` = ''',replace_special_char(pr_status), '''');
	ELSEIF LOCATE(',status,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`status` IS NULL');
	END IF;


-- 匹配数据
	SET @dataSql = CONCAT('SELECT * ',@Sql);
	SET @tempSql = CONCAT('CREATE TEMPORARY TABLE temp_p_role_query00 SELECT code ',@Sql);
	IF pr_page_index IS NOT NULL AND pr_page_size IS NOT NULL THEN
		SET @dataSql = CONCAT(@dataSql, ' limit ', (pr_page_index - 1) * pr_page_size, ',', pr_page_size);
		SET @tempSql = CONCAT(@tempSql, ' limit ', (pr_page_index - 1) * pr_page_size, ',', pr_page_size);
	END IF;
	SET @dataSql = CONCAT(@dataSql, ';');
	SET @tempSql = CONCAT(@tempSql, ';');
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
	SELECT * FROM t_role_with_authority where`role_code` in (select `code` from temp_p_role_query00);
	SELECT * FROM t_authority WHERE 
		`code` in (SELECT authority_code from  t_role_with_authority where`role_code` in (select `code` from temp_p_role_query00));

END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_detail_query
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_detail_query`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_detail_query`(pr_id int)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_user_info WHERE `id` = pr_id;
	SELECT * FROM t_user_info_log WHERE `user_info_id` = pr_id ORDER BY id DESC;
	-- 用户权限
	SELECT * FROM t_authority WHERE 
		`code` in (select `authority_code` from t_user_info_with_authority where `user_info_id` = pr_id);
	-- 角色
	SELECT * FROM t_role WHERE 
		`code` in (select `role_code` from t_user_info_with_role where `user_info_id` = pr_id);
	-- 角色权限
	SELECT DISTINCT t4.*, t1.code AS role_code, t1.`status` AS role_status FROM t_role t1 
		LEFT JOIN t_user_info_with_role t2 ON t1.`code` = t2.role_code
		LEFT JOIN t_role_with_authority t3 ON t2.role_code = t3.role_code 
		LEFT JOIN t_authority t4 ON t3.authority_code = t4.`code`
		WHERE t2.user_info_id = pr_id;
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
	pr_edit_datetime_start datetime,
	pr_edit_datetime_end datetime,
	pr_create_datetime_start datetime,
	pr_create_datetime_end datetime,
	pr_remark text,
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int)
    SQL SECURITY INVOKER
BEGIN 
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	DROP TEMPORARY TABLE IF EXISTS temp_p_user_info_query00;
	DROP TEMPORARY TABLE IF EXISTS temp_p_user_info_query01;  
	DROP TEMPORARY TABLE IF EXISTS temp_p_user_info_query02;  
	CREATE TEMPORARY TABLE temp_p_user_info_query01(id int);-- 角色
	CREATE TEMPORARY TABLE temp_p_user_info_query02(id int);-- 权限

	IF pr_role IS NOT NULL THEN
		INSERT INTO temp_p_user_info_query01 
			SELECT user_info_id  FROM t_user_info_with_role WHERE role_code LIKE CONCAT('%',replace_special_char(pr_role),'%');
	END IF;

	IF pr_authority IS NOT NULL THEN
		INSERT INTO temp_p_user_info_query02 
			SELECT user_info_id  FROM t_user_info_with_authority WHERE authority_code LIKE CONCAT('%',replace_special_char(pr_authority),'%');
		INSERT INTO temp_p_user_info_query02 
			SELECT user_info_id  FROM t_user_info_with_role t1
			LEFT JOIN t_role_with_authority t2 ON t1.role_code = t2.role_code
			WHERE t2.authority_code LIKE CONCAT('%',replace_special_char(pr_authority),'%');
	END IF;


	SET @Sql = ' FROM t_user_info t1 WHERE 1 = 1 ';
	IF pr_id IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_account IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`account` like ''%',replace_special_char(pr_account), '%''');
	ELSEIF LOCATE(',account,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`account` IS NULL');
	END IF;

	IF pr_password IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`password` like ''%',replace_special_char(pr_password), '%''');
	ELSEIF LOCATE(',password,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`password` IS NULL');
	END IF;

	IF pr_nickname IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`nickname` like ''%',replace_special_char(pr_nickname), '%''');
	ELSEIF LOCATE(',nickname,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`nickname` IS NULL');
	END IF;	

	IF pr_edit_datetime_start IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`edit_datetime` >= ''',replace_special_char(pr_edit_datetime_start), '''');
	ELSEIF LOCATE(',edit_datetime,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`edit_datetime` IS NULL');
	END IF;

	IF pr_edit_datetime_end IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`edit_datetime` <= ''',replace_special_char(pr_edit_datetime_end), '''');
	ELSEIF LOCATE(',edit_datetime,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`edit_datetime` IS NULL');
	END IF;

	IF pr_create_datetime_start IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`create_datetime` >= ''',replace_special_char(pr_create_datetime_start), '''');
	ELSEIF LOCATE(',create_datetime,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`create_datetime` IS NULL');
	END IF;

	IF pr_create_datetime_end IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`create_datetime` <= ''',replace_special_char(pr_create_datetime_end), '''');
	ELSEIF LOCATE(',create_datetime,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`create_datetime` IS NULL');
	END IF;

	IF pr_remark IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`remark` like ''%',replace_special_char(pr_remark), '%''');
	ELSEIF LOCATE(',remark,', pr_null_list) > 0 THEN
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
	IF pr_page_index IS NOT NULL AND pr_page_size IS NOT NULL THEN
		SET @dataSql = CONCAT(@dataSql, ' limit ', (pr_page_index - 1) * pr_page_size, ',', pr_page_size);
		SET @tempSql = CONCAT(@tempSql, ' limit ', (pr_page_index - 1) * pr_page_size, ',', pr_page_size);
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
	SELECT * from t_user_info_with_authority where `user_info_id` in (SELECT id FROM temp_p_user_info_query00);	
	SELECT * FROM t_authority WHERE 
		`code` in (select `authority_code` from t_user_info_with_authority 
				where `user_info_id` in (SELECT id FROM temp_p_user_info_query00));
	
	-- 角色
	SELECT * from t_user_info_with_role where `user_info_id` in (SELECT id FROM temp_p_user_info_query00);	
	SELECT * FROM t_role WHERE 
		`code` in (select `role_code` from t_user_info_with_role 
				where `user_info_id` in (SELECT id FROM temp_p_user_info_query00));

	-- 角色权限
	SELECT DISTINCT t4.*, t1.code AS role_code, t1.`status` AS role_status FROM t_role t1 
		LEFT JOIN t_user_info_with_role t2 ON t1.`code` = t2.role_code
		LEFT JOIN t_role_with_authority t3 ON t2.role_code = t3.role_code 
		LEFT JOIN t_authority t4 ON t3.authority_code = t4.`code`
		WHERE t2.user_info_id in (SELECT id FROM temp_p_user_info_query00);
END
;;
DELIMITER ;

-- ----------------------------
-- Function structure for replace_special_char
-- ----------------------------
DROP FUNCTION IF EXISTS `replace_special_char`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `replace_special_char`(pr_str text) RETURNS text CHARSET utf8
    READS SQL DATA
BEGIN
  SET pr_str = REPLACE(pr_str, '\\', '\\\\');
  SET pr_str = REPLACE(pr_str, '''', '''''');
  RETURN pr_str;
END
;;
DELIMITER ;
