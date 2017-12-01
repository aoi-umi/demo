/*
Navicat MySQL Data Transfer

Source Server         : mysql
Source Server Version : 50710
Source Host           : localhost:3306
Source Database       : myweb

Target Server Type    : MYSQL
Target Server Version : 50710
File Encoding         : 65001

Date: 2017-12-01 22:08:27
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Procedure structure for p_log_del_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_log_del_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_log_del_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	DELETE FROM t_log WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_log_detail_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_log_detail_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_log_detail_query_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_log WHERE `id` = pr_id;
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
-- Procedure structure for p_log_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_log_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_log_query_auto`(
	pr_id int,
	pr_url varchar(50),
	pr_method varchar(50),
	pr_result tinyint,
	pr_code varchar(50),
	pr_req text,
	pr_res text,
	pr_ip varchar(50),
	pr_create_date datetime,
	pr_remark text,
	pr_guid varchar(50),
	pr_duration int,
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int
)
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
		SET @Sql = CONCAT(@Sql, ' AND `url` = ''',replace_special_char(pr_url), '''');
	ELSEIF LOCATE(',url,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `url` IS NULL');
	END IF;

	IF pr_method IS NOT NULL AND length(pr_method) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `method` = ''',replace_special_char(pr_method), '''');
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
		SET @Sql = CONCAT(@Sql, ' AND `req` = ''',replace_special_char(pr_req), '''');
	ELSEIF LOCATE(',req,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `req` IS NULL');
	END IF;

	IF pr_res IS NOT NULL AND length(pr_res) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `res` = ''',replace_special_char(pr_res), '''');
	ELSEIF LOCATE(',res,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `res` IS NULL');
	END IF;

	IF pr_ip IS NOT NULL AND length(pr_ip) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `ip` = ''',replace_special_char(pr_ip), '''');
	ELSEIF LOCATE(',ip,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `ip` IS NULL');
	END IF;

	IF pr_create_date IS NOT NULL AND length(pr_create_date) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_date` = ''',replace_special_char(pr_create_date), '''');
	ELSEIF LOCATE(',create_date,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_date` IS NULL');
	END IF;

	IF pr_remark IS NOT NULL AND length(pr_remark) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `remark` = ''',replace_special_char(pr_remark), '''');
	ELSEIF LOCATE(',remark,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `remark` IS NULL');
	END IF;

	IF pr_guid IS NOT NULL AND length(pr_guid) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `guid` = ''',replace_special_char(pr_guid), '''');
	ELSEIF LOCATE(',guid,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `guid` IS NULL');
	END IF;

	IF pr_duration IS NOT NULL AND length(pr_duration) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `duration` = ''',replace_special_char(pr_duration), '''');
	ELSEIF LOCATE(',duration,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `duration` IS NULL');
	END IF;

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
-- Procedure structure for p_log_save_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_log_save_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_log_save_auto`(
	pr_id int,
	pr_url varchar(50),
	pr_method varchar(50),
	pr_result tinyint,
	pr_code varchar(50),
	pr_req text,
	pr_res text,
	pr_ip varchar(50),
	pr_create_date datetime,
	pr_remark text,
	pr_guid varchar(50),
	pr_duration int,
	pr_null_list varchar(1000)
)
    SQL SECURITY INVOKER
BEGIN

IF pr_id IS NULL OR pr_id = 0 
THEN
	INSERT INTO t_log (
		`url`,
		`method`,
		`result`,
		`code`,
		`req`,
		`res`,
		`ip`,
		`create_date`,
		`remark`,
		`guid`,
		`duration`
	) VALUES( 
		pr_url,
		pr_method,
		pr_result,
		pr_code,
		pr_req,
		pr_res,
		pr_ip,
		pr_create_date,
		pr_remark,
		pr_guid,
		pr_duration
	);
	SELECT LAST_INSERT_ID() as 'id';
ELSE
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='UPDATE t_log SET ';
	IF pr_url IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' url = ''', replace_special_char(pr_url), ''',');
	ELSEIF LOCATE(',url,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' url = null,');
	END IF;

	IF pr_method IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' method = ''', replace_special_char(pr_method), ''',');
	ELSEIF LOCATE(',method,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' method = null,');
	END IF;

	IF pr_result IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' result = ''', replace_special_char(pr_result), ''',');
	ELSEIF LOCATE(',result,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' result = null,');
	END IF;

	IF pr_code IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' code = ''', replace_special_char(pr_code), ''',');
	ELSEIF LOCATE(',code,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' code = null,');
	END IF;

	IF pr_req IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' req = ''', replace_special_char(pr_req), ''',');
	ELSEIF LOCATE(',req,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' req = null,');
	END IF;

	IF pr_res IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' res = ''', replace_special_char(pr_res), ''',');
	ELSEIF LOCATE(',res,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' res = null,');
	END IF;

	IF pr_ip IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' ip = ''', replace_special_char(pr_ip), ''',');
	ELSEIF LOCATE(',ip,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' ip = null,');
	END IF;

	IF pr_create_date IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' create_date = ''', replace_special_char(pr_create_date), ''',');
	ELSEIF LOCATE(',create_date,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' create_date = null,');
	END IF;

	IF pr_remark IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' remark = ''', replace_special_char(pr_remark), ''',');
	ELSEIF LOCATE(',remark,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' remark = null,');
	END IF;

	IF pr_guid IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' guid = ''', replace_special_char(pr_guid), ''',');
	ELSEIF LOCATE(',guid,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' guid = null,');
	END IF;

	IF pr_duration IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' duration = ''', replace_special_char(pr_duration), ''',');
	ELSEIF LOCATE(',duration,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' duration = null,');
	END IF;

	-- SELECT @Sql;
	IF LOCATE(',',@Sql)>0 THEN
		SET @Sql = LEFT(@Sql,CHAR_LENGTH(@Sql)-1);
		SET @Sql = CONCAT(@Sql,' WHERE id = ''', pr_id, ''';	');
		PREPARE stmt1 FROM @Sql;
		EXECUTE stmt1;
	END IF;
	SELECT pr_id AS 'id';
END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_child_del_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_child_del_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_child_del_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	DELETE FROM t_main_content_child WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_child_detail_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_child_detail_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_child_detail_query_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_main_content_child WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_child_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_child_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_child_query_auto`(
	pr_id int,
	pr_num int,
	pr_main_content_id int,
	pr_type int,
	pr_content text,
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int
)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_main_content_child WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` IS NULL');
	END IF;

	IF pr_num IS NOT NULL AND length(pr_num) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `num` = ''',replace_special_char(pr_num), '''');
	ELSEIF LOCATE(',num,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `num` IS NULL');
	END IF;

	IF pr_main_content_id IS NOT NULL AND length(pr_main_content_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `main_content_id` = ''',replace_special_char(pr_main_content_id), '''');
	ELSEIF LOCATE(',main_content_id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `main_content_id` IS NULL');
	END IF;

	IF pr_type IS NOT NULL AND length(pr_type) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `type` = ''',replace_special_char(pr_type), '''');
	ELSEIF LOCATE(',type,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `type` IS NULL');
	END IF;

	IF pr_content IS NOT NULL AND length(pr_content) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `content` = ''',replace_special_char(pr_content), '''');
	ELSEIF LOCATE(',content,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `content` IS NULL');
	END IF;

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
-- Procedure structure for p_main_content_child_save_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_child_save_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_child_save_auto`(
	pr_id int,
	pr_num int,
	pr_main_content_id int,
	pr_type int,
	pr_content text,
	pr_null_list varchar(1000)
)
    SQL SECURITY INVOKER
BEGIN

IF pr_id IS NULL OR pr_id = 0 
THEN
	INSERT INTO t_main_content_child (
		`num`,
		`main_content_id`,
		`type`,
		`content`
	) VALUES( 
		pr_num,
		pr_main_content_id,
		pr_type,
		pr_content
	);
	SELECT LAST_INSERT_ID() as 'id';
ELSE
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='UPDATE t_main_content_child SET ';
	IF pr_num IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' num = ''', replace_special_char(pr_num), ''',');
	ELSEIF LOCATE(',num,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' num = null,');
	END IF;

	IF pr_main_content_id IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' main_content_id = ''', replace_special_char(pr_main_content_id), ''',');
	ELSEIF LOCATE(',main_content_id,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' main_content_id = null,');
	END IF;

	IF pr_type IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' type = ''', replace_special_char(pr_type), ''',');
	ELSEIF LOCATE(',type,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' type = null,');
	END IF;

	IF pr_content IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' content = ''', replace_special_char(pr_content), ''',');
	ELSEIF LOCATE(',content,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' content = null,');
	END IF;

	-- SELECT @Sql;
	IF LOCATE(',',@Sql)>0 THEN
		SET @Sql = LEFT(@Sql,CHAR_LENGTH(@Sql)-1);
		SET @Sql = CONCAT(@Sql,' WHERE id = ''', pr_id, ''';	');
		PREPARE stmt1 FROM @Sql;
		EXECUTE stmt1;
	END IF;
	SELECT pr_id AS 'id';
END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_del_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_del_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_del_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	DELETE FROM t_main_content WHERE `id` = pr_id;
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
	SELECT t1.*, t2.account, t2.nickname FROM t_main_content t1 
		LEFT JOIN t_user_info t2 on t1.`user_info_id` = t2.id
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
-- Procedure structure for p_main_content_detail_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_detail_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_detail_query_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_main_content WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_log_del_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_log_del_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_log_del_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	DELETE FROM t_main_content_log WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_log_detail_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_log_detail_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_log_detail_query_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_main_content_log WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_log_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_log_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_log_query_auto`(
	pr_id int,
	pr_main_content_id int,
	pr_type int,
	pr_src_status varchar(20),
	pr_dest_status varchar(20),
	pr_content text,
	pr_create_date datetime,
	pr_operate_date datetime,
	pr_operator varchar(50),
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int
)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_main_content_log t1 WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_main_content_id IS NOT NULL AND length(pr_main_content_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`main_content_id` = ''',replace_special_char(pr_main_content_id), '''');
	ELSEIF LOCATE(',main_content_id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`main_content_id` IS NULL');
	END IF;

	IF pr_type IS NOT NULL AND length(pr_type) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`type` = ''',replace_special_char(pr_type), '''');
	ELSEIF LOCATE(',type,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`type` IS NULL');
	END IF;

	IF pr_src_status IS NOT NULL AND length(pr_src_status) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`src_status` = ''',replace_special_char(pr_src_status), '''');
	ELSEIF LOCATE(',src_status,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`src_status` IS NULL');
	END IF;

	IF pr_dest_status IS NOT NULL AND length(pr_dest_status) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`dest_status` = ''',replace_special_char(pr_dest_status), '''');
	ELSEIF LOCATE(',dest_status,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`dest_status` IS NULL');
	END IF;

	IF pr_content IS NOT NULL AND length(pr_content) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`content` = ''',replace_special_char(pr_content), '''');
	ELSEIF LOCATE(',content,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`content` IS NULL');
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
-- Procedure structure for p_main_content_log_save_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_log_save_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_log_save_auto`(
	pr_id int,
	pr_main_content_id int,
	pr_type int,
	pr_src_status varchar(20),
	pr_dest_status varchar(20),
	pr_content text,
	pr_create_date datetime,
	pr_operate_date datetime,
	pr_operator varchar(50),
	pr_null_list varchar(1000)
)
    SQL SECURITY INVOKER
BEGIN

IF pr_id IS NULL OR pr_id = 0 
THEN
	INSERT INTO t_main_content_log (
		`main_content_id`,
		`type`,
		`src_status`,
		`dest_status`,
		`content`,
		`create_date`,
		`operate_date`,
		`operator`
	) VALUES( 
		pr_main_content_id,
		pr_type,
		pr_src_status,
		pr_dest_status,
		pr_content,
		pr_create_date,
		pr_operate_date,
		pr_operator
	);
	SELECT LAST_INSERT_ID() as 'id';
ELSE
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='UPDATE t_main_content_log SET ';
	IF pr_main_content_id IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `main_content_id` = ''', replace_special_char(pr_main_content_id), ''',');
	ELSEIF LOCATE(',main_content_id,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `main_content_id` = null,');
	END IF;

	IF pr_type IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `type` = ''', replace_special_char(pr_type), ''',');
	ELSEIF LOCATE(',type,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `type` = null,');
	END IF;

	IF pr_src_status IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `src_status` = ''', replace_special_char(pr_src_status), ''',');
	ELSEIF LOCATE(',src_status,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `src_status` = null,');
	END IF;

	IF pr_dest_status IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `dest_status` = ''', replace_special_char(pr_dest_status), ''',');
	ELSEIF LOCATE(',dest_status,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `dest_status` = null,');
	END IF;

	IF pr_content IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `content` = ''', replace_special_char(pr_content), ''',');
	ELSEIF LOCATE(',content,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `content` = null,');
	END IF;

	IF pr_create_date IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `create_date` = ''', replace_special_char(pr_create_date), ''',');
	ELSEIF LOCATE(',create_date,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `create_date` = null,');
	END IF;

	IF pr_operate_date IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `operate_date` = ''', replace_special_char(pr_operate_date), ''',');
	ELSEIF LOCATE(',operate_date,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `operate_date` = null,');
	END IF;

	IF pr_operator IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `operator` = ''', replace_special_char(pr_operator), ''',');
	ELSEIF LOCATE(',operator,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `operator` = null,');
	END IF;

	-- SELECT @Sql;
	IF LOCATE(',',@Sql)>0 THEN
		SET @Sql = LEFT(@Sql,CHAR_LENGTH(@Sql)-1);
		SET @Sql = CONCAT(@Sql,' WHERE id = ''', pr_id, ''';	');
		PREPARE stmt1 FROM @Sql;
		EXECUTE stmt1;
	END IF;
	SELECT pr_id AS 'id';
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
-- Procedure structure for p_main_content_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_query_auto`(
	pr_id int,
	pr_type int,
	pr_status int,
	pr_user_info_id int,
	pr_title varchar(50),
	pr_description text,
	pr_create_date datetime,
	pr_operate_date datetime,
	pr_operator varchar(50),
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int
)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_main_content WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` IS NULL');
	END IF;

	IF pr_type IS NOT NULL AND length(pr_type) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `type` = ''',replace_special_char(pr_type), '''');
	ELSEIF LOCATE(',type,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `type` IS NULL');
	END IF;

	IF pr_status IS NOT NULL AND length(pr_status) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `status` = ''',replace_special_char(pr_status), '''');
	ELSEIF LOCATE(',status,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `status` IS NULL');
	END IF;

	IF pr_user_info_id IS NOT NULL AND length(pr_user_info_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `user_info_id` = ''',replace_special_char(pr_user_info_id), '''');
	ELSEIF LOCATE(',user_info_id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `user_info_id` IS NULL');
	END IF;

	IF pr_title IS NOT NULL AND length(pr_title) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `title` = ''',replace_special_char(pr_title), '''');
	ELSEIF LOCATE(',title,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `title` IS NULL');
	END IF;

	IF pr_description IS NOT NULL AND length(pr_description) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `description` = ''',replace_special_char(pr_description), '''');
	ELSEIF LOCATE(',description,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `description` IS NULL');
	END IF;

	IF pr_create_date IS NOT NULL AND length(pr_create_date) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_date` = ''',replace_special_char(pr_create_date), '''');
	ELSEIF LOCATE(',create_date,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_date` IS NULL');
	END IF;

	IF pr_operate_date IS NOT NULL AND length(pr_operate_date) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `operate_date` = ''',replace_special_char(pr_operate_date), '''');
	ELSEIF LOCATE(',operate_date,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `operate_date` IS NULL');
	END IF;

	IF pr_operator IS NOT NULL AND length(pr_operator) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `operator` = ''',replace_special_char(pr_operator), '''');
	ELSEIF LOCATE(',operator,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `operator` IS NULL');
	END IF;

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
-- Procedure structure for p_main_content_save_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_save_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_save_auto`(
	pr_id int,
	pr_type int,
	pr_status int,
	pr_user_info_id int,
	pr_title varchar(50),
	pr_description text,
	pr_create_date datetime,
	pr_operate_date datetime,
	pr_operator varchar(50),
	pr_null_list varchar(1000)
)
    SQL SECURITY INVOKER
BEGIN

IF pr_id IS NULL OR pr_id = 0 
THEN
	INSERT INTO t_main_content (
		`type`,
		`status`,
		`user_info_id`,
		`title`,
		`description`,
		`create_date`,
		`operate_date`,
		`operator`
	) VALUES( 
		pr_type,
		pr_status,
		pr_user_info_id,
		pr_title,
		pr_description,
		pr_create_date,
		pr_operate_date,
		pr_operator
	);
	SELECT LAST_INSERT_ID() as 'id';
ELSE
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='UPDATE t_main_content SET ';
	IF pr_type IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' type = ''', replace_special_char(pr_type), ''',');
	ELSEIF LOCATE(',type,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' type = null,');
	END IF;

	IF pr_status IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' status = ''', replace_special_char(pr_status), ''',');
	ELSEIF LOCATE(',status,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' status = null,');
	END IF;

	IF pr_user_info_id IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' user_info_id = ''', replace_special_char(pr_user_info_id), ''',');
	ELSEIF LOCATE(',user_info_id,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' user_info_id = null,');
	END IF;

	IF pr_title IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' title = ''', replace_special_char(pr_title), ''',');
	ELSEIF LOCATE(',title,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' title = null,');
	END IF;

	IF pr_description IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' description = ''', replace_special_char(pr_description), ''',');
	ELSEIF LOCATE(',description,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' description = null,');
	END IF;

	IF pr_create_date IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' create_date = ''', replace_special_char(pr_create_date), ''',');
	ELSEIF LOCATE(',create_date,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' create_date = null,');
	END IF;

	IF pr_operate_date IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' operate_date = ''', replace_special_char(pr_operate_date), ''',');
	ELSEIF LOCATE(',operate_date,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' operate_date = null,');
	END IF;

	IF pr_operator IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' operator = ''', replace_special_char(pr_operator), ''',');
	ELSEIF LOCATE(',operator,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' operator = null,');
	END IF;

	-- SELECT @Sql;
	IF LOCATE(',',@Sql)>0 THEN
		SET @Sql = LEFT(@Sql,CHAR_LENGTH(@Sql)-1);
		SET @Sql = CONCAT(@Sql,' WHERE id = ''', pr_id, ''';	');
		PREPARE stmt1 FROM @Sql;
		EXECUTE stmt1;
	END IF;
	SELECT pr_id AS 'id';
END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_tag_del_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_tag_del_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_tag_del_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	DELETE FROM t_main_content_tag WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_tag_detail_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_tag_detail_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_tag_detail_query_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_main_content_tag WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_tag_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_tag_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_tag_query_auto`(
	pr_id int,
	pr_main_content_id int,
	pr_name varchar(50),
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int
)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_main_content_tag WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` IS NULL');
	END IF;

	IF pr_main_content_id IS NOT NULL AND length(pr_main_content_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `main_content_id` = ''',replace_special_char(pr_main_content_id), '''');
	ELSEIF LOCATE(',main_content_id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `main_content_id` IS NULL');
	END IF;

	IF pr_name IS NOT NULL AND length(pr_name) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `name` = ''',replace_special_char(pr_name), '''');
	ELSEIF LOCATE(',name,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `name` IS NULL');
	END IF;

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
-- Procedure structure for p_main_content_tag_save_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_tag_save_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_tag_save_auto`(
	pr_id int,
	pr_main_content_id int,
	pr_name varchar(50),
	pr_null_list varchar(1000)
)
    SQL SECURITY INVOKER
BEGIN

IF pr_id IS NULL OR pr_id = 0 
THEN
	INSERT INTO t_main_content_tag (
		`main_content_id`,
		`name`
	) VALUES( 
		pr_main_content_id,
		pr_name
	);
	SELECT LAST_INSERT_ID() as 'id';
ELSE
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='UPDATE t_main_content_tag SET ';
	IF pr_main_content_id IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' main_content_id = ''', replace_special_char(pr_main_content_id), ''',');
	ELSEIF LOCATE(',main_content_id,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' main_content_id = null,');
	END IF;

	IF pr_name IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' name = ''', replace_special_char(pr_name), ''',');
	ELSEIF LOCATE(',name,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' name = null,');
	END IF;

	-- SELECT @Sql;
	IF LOCATE(',',@Sql)>0 THEN
		SET @Sql = LEFT(@Sql,CHAR_LENGTH(@Sql)-1);
		SET @Sql = CONCAT(@Sql,' WHERE id = ''', pr_id, ''';	');
		PREPARE stmt1 FROM @Sql;
		EXECUTE stmt1;
	END IF;
	SELECT pr_id AS 'id';
END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_type_del_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_type_del_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_type_del_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	DELETE FROM t_main_content_type WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_type_detail_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_type_detail_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_type_detail_query_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_main_content_type WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_type_id_del_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_type_id_del_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_type_id_del_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	DELETE FROM t_main_content_type_id WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_type_id_detail_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_type_id_detail_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_type_id_detail_query_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_main_content_type_id WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_type_id_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_type_id_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_type_id_query_auto`(
	pr_id int,
	pr_main_content_id int,
	pr_main_content_type_id int,
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int
)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_main_content_type_id WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` IS NULL');
	END IF;

	IF pr_main_content_id IS NOT NULL AND length(pr_main_content_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `main_content_id` = ''',replace_special_char(pr_main_content_id), '''');
	ELSEIF LOCATE(',main_content_id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `main_content_id` IS NULL');
	END IF;

	IF pr_main_content_type_id IS NOT NULL AND length(pr_main_content_type_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `main_content_type_id` = ''',replace_special_char(pr_main_content_type_id), '''');
	ELSEIF LOCATE(',main_content_type_id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `main_content_type_id` IS NULL');
	END IF;

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
-- Procedure structure for p_main_content_type_id_save_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_type_id_save_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_type_id_save_auto`(
	pr_id int,
	pr_main_content_id int,
	pr_main_content_type_id int,
	pr_null_list varchar(1000)
)
    SQL SECURITY INVOKER
BEGIN

IF pr_id IS NULL OR pr_id = 0 
THEN
	INSERT INTO t_main_content_type_id (
		`main_content_id`,
		`main_content_type_id`
	) VALUES( 
		pr_main_content_id,
		pr_main_content_type_id
	);
	SELECT LAST_INSERT_ID() as 'id';
ELSE
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='UPDATE t_main_content_type_id SET ';
	IF pr_main_content_id IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' main_content_id = ''', replace_special_char(pr_main_content_id), ''',');
	ELSEIF LOCATE(',main_content_id,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' main_content_id = null,');
	END IF;

	IF pr_main_content_type_id IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' main_content_type_id = ''', replace_special_char(pr_main_content_type_id), ''',');
	ELSEIF LOCATE(',main_content_type_id,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' main_content_type_id = null,');
	END IF;

	-- SELECT @Sql;
	IF LOCATE(',',@Sql)>0 THEN
		SET @Sql = LEFT(@Sql,CHAR_LENGTH(@Sql)-1);
		SET @Sql = CONCAT(@Sql,' WHERE id = ''', pr_id, ''';	');
		PREPARE stmt1 FROM @Sql;
		EXECUTE stmt1;
	END IF;
	SELECT pr_id AS 'id';
END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_main_content_type_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_type_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_type_query_auto`(
	pr_id int,
	pr_type varchar(50),
	pr_type_name varchar(50),
	pr_parent_type varchar(50),
	pr_level int,
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int
)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_main_content_type WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` IS NULL');
	END IF;

	IF pr_type IS NOT NULL AND length(pr_type) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `type` = ''',replace_special_char(pr_type), '''');
	ELSEIF LOCATE(',type,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `type` IS NULL');
	END IF;

	IF pr_type_name IS NOT NULL AND length(pr_type_name) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `type_name` = ''',replace_special_char(pr_type_name), '''');
	ELSEIF LOCATE(',type_name,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `type_name` IS NULL');
	END IF;

	IF pr_parent_type IS NOT NULL AND length(pr_parent_type) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `parent_type` = ''',replace_special_char(pr_parent_type), '''');
	ELSEIF LOCATE(',parent_type,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `parent_type` IS NULL');
	END IF;

	IF pr_level IS NOT NULL AND length(pr_level) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `level` = ''',replace_special_char(pr_level), '''');
	ELSEIF LOCATE(',level,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `level` IS NULL');
	END IF;

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
-- Procedure structure for p_main_content_type_save_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_main_content_type_save_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_main_content_type_save_auto`(
	pr_id int,
	pr_type varchar(50),
	pr_type_name varchar(50),
	pr_parent_type varchar(50),
	pr_level int,
	pr_null_list varchar(1000)
)
    SQL SECURITY INVOKER
BEGIN

IF pr_id IS NULL OR pr_id = 0 
THEN
	INSERT INTO t_main_content_type (
		`type`,
		`type_name`,
		`parent_type`,
		`level`
	) VALUES( 
		pr_type,
		pr_type_name,
		pr_parent_type,
		pr_level
	);
	SELECT LAST_INSERT_ID() as 'id';
ELSE
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='UPDATE t_main_content_type SET ';
	IF pr_type IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' type = ''', replace_special_char(pr_type), ''',');
	ELSEIF LOCATE(',type,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' type = null,');
	END IF;

	IF pr_type_name IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' type_name = ''', replace_special_char(pr_type_name), ''',');
	ELSEIF LOCATE(',type_name,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' type_name = null,');
	END IF;

	IF pr_parent_type IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' parent_type = ''', replace_special_char(pr_parent_type), ''',');
	ELSEIF LOCATE(',parent_type,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' parent_type = null,');
	END IF;

	IF pr_level IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' level = ''', replace_special_char(pr_level), ''',');
	ELSEIF LOCATE(',level,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' level = null,');
	END IF;

	-- SELECT @Sql;
	IF LOCATE(',',@Sql)>0 THEN
		SET @Sql = LEFT(@Sql,CHAR_LENGTH(@Sql)-1);
		SET @Sql = CONCAT(@Sql,' WHERE id = ''', pr_id, ''';	');
		PREPARE stmt1 FROM @Sql;
		EXECUTE stmt1;
	END IF;
	SELECT pr_id AS 'id';
END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_del_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_del_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_del_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	DELETE FROM t_user_info WHERE `id` = pr_id;
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
	SELECT * FROM t_user_info_log WHERE `user_info_id` = pr_id ORDER BY id desc;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_detail_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_detail_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_detail_query_auto`(pr_id int)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_user_info WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_log_del_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_log_del_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_log_del_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	DELETE FROM t_user_info_log WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_log_detail_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_log_detail_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_log_detail_query_auto`(
	pr_id int
)
    SQL SECURITY INVOKER
BEGIN
	SELECT * FROM t_user_info_log WHERE `id` = pr_id;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_log_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_log_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_log_query_auto`(
	pr_id int,
	pr_user_info_id int,
	pr_type int,
	pr_content text,
	pr_create_date datetime,
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int
)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_user_info_log t1 WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`id` IS NULL');
	END IF;

	IF pr_user_info_id IS NOT NULL AND length(pr_user_info_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`user_info_id` = ''',replace_special_char(pr_user_info_id), '''');
	ELSEIF LOCATE(',user_info_id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`user_info_id` IS NULL');
	END IF;

	IF pr_type IS NOT NULL AND length(pr_type) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`type` = ''',replace_special_char(pr_type), '''');
	ELSEIF LOCATE(',type,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`type` IS NULL');
	END IF;

	IF pr_content IS NOT NULL AND length(pr_content) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`content` = ''',replace_special_char(pr_content), '''');
	ELSEIF LOCATE(',content,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`content` IS NULL');
	END IF;

	IF pr_create_date IS NOT NULL AND length(pr_create_date) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`create_date` = ''',replace_special_char(pr_create_date), '''');
	ELSEIF LOCATE(',create_date,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND t1.`create_date` IS NULL');
	END IF;

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
-- Procedure structure for p_user_info_log_save_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_log_save_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_log_save_auto`(
	pr_id int,
	pr_user_info_id int,
	pr_type int,
	pr_content text,
	pr_create_date datetime,
	pr_null_list varchar(1000)
)
    SQL SECURITY INVOKER
BEGIN

IF pr_id IS NULL OR pr_id = 0 
THEN
	INSERT INTO t_user_info_log (
		`user_info_id`,
		`type`,
		`content`,
		`create_date`
	) VALUES( 
		pr_user_info_id,
		pr_type,
		pr_content,
		pr_create_date
	);
	SELECT LAST_INSERT_ID() as 'id';
ELSE
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='UPDATE t_user_info_log SET ';
	IF pr_user_info_id IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `user_info_id` = ''', replace_special_char(pr_user_info_id), ''',');
	ELSEIF LOCATE(',user_info_id,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `user_info_id` = null,');
	END IF;

	IF pr_type IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `type` = ''', replace_special_char(pr_type), ''',');
	ELSEIF LOCATE(',type,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `type` = null,');
	END IF;

	IF pr_content IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `content` = ''', replace_special_char(pr_content), ''',');
	ELSEIF LOCATE(',content,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `content` = null,');
	END IF;

	IF pr_create_date IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' `create_date` = ''', replace_special_char(pr_create_date), ''',');
	ELSEIF LOCATE(',create_date,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' `create_date` = null,');
	END IF;

	-- SELECT @Sql;
	IF LOCATE(',',@Sql)>0 THEN
		SET @Sql = LEFT(@Sql,CHAR_LENGTH(@Sql)-1);
		SET @Sql = CONCAT(@Sql,' WHERE id = ''', pr_id, ''';	');
		PREPARE stmt1 FROM @Sql;
		EXECUTE stmt1;
	END IF;
	SELECT pr_id AS 'id';
END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_user_info_query_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_query_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_query_auto`(
	pr_id int,
	pr_account varchar(50),
	pr_password varchar(50),
	pr_nickname varchar(50),
	pr_auth varchar(200),
	pr_edit_datetime datetime,
	pr_create_datetime datetime,
	pr_remark text,
	pr_null_list varchar(1000),
	pr_page_index int,
	pr_page_size int
)
    SQL SECURITY INVOKER
BEGIN
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='SELECT SQL_CALC_FOUND_ROWS * FROM t_user_info WHERE 1 = 1 ';
	IF pr_id IS NOT NULL AND length(pr_id) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` = ''',replace_special_char(pr_id), '''');
	ELSEIF LOCATE(',id,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `id` IS NULL');
	END IF;

	IF pr_account IS NOT NULL AND length(pr_account) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `account` = ''',replace_special_char(pr_account), '''');
	ELSEIF LOCATE(',account,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `account` IS NULL');
	END IF;

	IF pr_password IS NOT NULL AND length(pr_password) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `password` = ''',replace_special_char(pr_password), '''');
	ELSEIF LOCATE(',password,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `password` IS NULL');
	END IF;

	IF pr_nickname IS NOT NULL AND length(pr_nickname) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `nickname` = ''',replace_special_char(pr_nickname), '''');
	ELSEIF LOCATE(',nickname,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `nickname` IS NULL');
	END IF;

	IF pr_auth IS NOT NULL AND length(pr_auth) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `auth` = ''',replace_special_char(pr_auth), '''');
	ELSEIF LOCATE(',auth,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `auth` IS NULL');
	END IF;

	IF pr_edit_datetime IS NOT NULL AND length(pr_edit_datetime) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `edit_datetime` = ''',replace_special_char(pr_edit_datetime), '''');
	ELSEIF LOCATE(',edit_datetime,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `edit_datetime` IS NULL');
	END IF;

	IF pr_create_datetime IS NOT NULL AND length(pr_create_datetime) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_datetime` = ''',replace_special_char(pr_create_datetime), '''');
	ELSEIF LOCATE(',create_datetime,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `create_datetime` IS NULL');
	END IF;

	IF pr_remark IS NOT NULL AND length(pr_remark) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `remark` = ''',replace_special_char(pr_remark), '''');
	ELSEIF LOCATE(',remark,', pr_null_list) > 0 THEN
		SET @Sql = CONCAT(@Sql, ' AND `remark` IS NULL');
	END IF;

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
-- Procedure structure for p_user_info_save_auto
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_user_info_save_auto`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `p_user_info_save_auto`(
	pr_id int,
	pr_account varchar(50),
	pr_password varchar(50),
	pr_nickname varchar(50),
	pr_auth varchar(200),
	pr_edit_datetime datetime,
	pr_create_datetime datetime,
	pr_remark text,
	pr_null_list varchar(1000)
)
    SQL SECURITY INVOKER
BEGIN

IF pr_id IS NULL OR pr_id = 0 
THEN
	INSERT INTO t_user_info (
		`account`,
		`password`,
		`nickname`,
		`auth`,
		`edit_datetime`,
		`create_datetime`,
		`remark`
	) VALUES( 
		pr_account,
		pr_password,
		pr_nickname,
		pr_auth,
		pr_edit_datetime,
		pr_create_datetime,
		pr_remark
	);
	SELECT LAST_INSERT_ID() as 'id';
ELSE
	IF pr_null_list IS NULL THEN
		SET pr_null_list = '';
	END IF;
	SET pr_null_list = CONCAT(',', pr_null_list, ',');

	SET @Sql ='UPDATE t_user_info SET ';
	IF pr_account IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' account = ''', replace_special_char(pr_account), ''',');
	ELSEIF LOCATE(',account,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' account = null,');
	END IF;

	IF pr_password IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' password = ''', replace_special_char(pr_password), ''',');
	ELSEIF LOCATE(',password,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' password = null,');
	END IF;

	IF pr_nickname IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' nickname = ''', replace_special_char(pr_nickname), ''',');
	ELSEIF LOCATE(',nickname,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' nickname = null,');
	END IF;

	IF pr_auth IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' auth = ''', replace_special_char(pr_auth), ''',');
	ELSEIF LOCATE(',auth,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' auth = null,');
	END IF;

	IF pr_edit_datetime IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' edit_datetime = ''', replace_special_char(pr_edit_datetime), ''',');
	ELSEIF LOCATE(',edit_datetime,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' edit_datetime = null,');
	END IF;

	IF pr_create_datetime IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' create_datetime = ''', replace_special_char(pr_create_datetime), ''',');
	ELSEIF LOCATE(',create_datetime,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' create_datetime = null,');
	END IF;

	IF pr_remark IS NOT NULL THEN
		SET @Sql = CONCAT(@Sql,' remark = ''', replace_special_char(pr_remark), ''',');
	ELSEIF LOCATE(',remark,', pr_null_list)>0 THEN
		SET @Sql = CONCAT(@Sql,' remark = null,');
	END IF;

	-- SELECT @Sql;
	IF LOCATE(',',@Sql)>0 THEN
		SET @Sql = LEFT(@Sql,CHAR_LENGTH(@Sql)-1);
		SET @Sql = CONCAT(@Sql,' WHERE id = ''', pr_id, ''';	');
		PREPARE stmt1 FROM @Sql;
		EXECUTE stmt1;
	END IF;
	SELECT pr_id AS 'id';
END IF;
END
;;
DELIMITER ;

-- ----------------------------
-- Function structure for replace_special_char
-- ----------------------------
DROP FUNCTION IF EXISTS `replace_special_char`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `replace_special_char`(`fun_str` text) RETURNS text CHARSET utf8
BEGIN
	SET fun_str = REPLACE(fun_str, '\\', '\\\\');
  SET fun_str = REPLACE(fun_str, '''', '''''');
  RETURN fun_str;
END
;;
DELIMITER ;
