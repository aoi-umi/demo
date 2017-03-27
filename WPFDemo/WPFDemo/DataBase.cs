using Microsoft.Practices.EnterpriseLibrary.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace WPFDemo
{
    public class DataBase
    {
        static string strConn = "Data Source=.;Initial Catalog=test;User ID=test;Password=123456";
        public static void Connect()
        {
            using (SqlConnection conn = new SqlConnection(strConn))
            {
                try
                {
                    //连接数据库
                    conn.Open();
                    //查询数据库语句
                    string commandStr = "select * from TM_EMPLOYEE";
                    //要对数据源执行的 SQL 语句或存储过程
                    SqlCommand sqlCmd = new SqlCommand(commandStr, conn);
                    //表示一组数据命令和一个数据库连接，它们用于填充 System.Data.DataSet 和更新数据源。
                    SqlDataAdapter sqlDataAda = new SqlDataAdapter(sqlCmd);
                    //数据的内存中缓存
                    DataSet daSet = new DataSet();
                    //将获取到的数据填充到数据缓存中
                    sqlDataAda.Fill(daSet);
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        public static DataSet ExecSql(string sql)
        {
            using (SqlConnection conn = new SqlConnection(strConn))
            {
                try
                {
                    //连接数据库
                    conn.Open();
                    //查询数据库语句
                    //要对数据源执行的 SQL 语句或存储过程
                    SqlCommand sqlCmd = new SqlCommand(sql, conn);
                    //表示一组数据命令和一个数据库连接，它们用于填充 System.Data.DataSet 和更新数据源。
                    SqlDataAdapter sqlDataAda = new SqlDataAdapter(sqlCmd);
                    //数据的内存中缓存
                    DataSet daSet = new DataSet();
                    //将获取到的数据填充到数据缓存中
                    sqlDataAda.Fill(daSet);
                    return daSet;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        public static DataSet ExecProc(string storeProcedureName, params object[] parameterValues)
        {
            Database db = GetWriteOnlyDatabase();
            if (db == null) throw new Exception("数据库连接失败，请检查配置文件！");

            DbCommand dc = db.GetStoredProcCommand(storeProcedureName, parameterValues);
            using (DbConnection Conn = db.CreateConnection())
            {
                Conn.Open();
                try
                {
                    DataSet ds = null;
                    ds = db.ExecuteDataSet(dc);
                    return ds;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        public static Database GetWriteOnlyDatabase()
        {
            try
            {
                Database db = DatabaseFactory.CreateDatabase("Test");
                return db;
            }
            catch (Exception ex) { throw new Exception(ex.Message); }
        }

        public static List<T> DataTableToList<T>(DataTable dt) where T:new ()
        {
            if (dt == null || dt.Rows.Count <= 0)
                return null;
            
            List<T> list = new List<T>();
            try
            {
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    //创建泛型对象
                    T t = Activator.CreateInstance<T>();
                    //获取对象所有属性
                    PropertyInfo[] propertyInfo = t.GetType().GetProperties();
                    for (int j = 0; j < dt.Columns.Count; j++)
                    {
                        foreach (PropertyInfo pi in propertyInfo)
                        {
                            //属性名称和列名相同时赋值
                            if (pi.CanWrite && dt.Columns[j].ColumnName.Equals(pi.Name, StringComparison.OrdinalIgnoreCase))
                            {
                                if (dt.Rows[i][j] != DBNull.Value)
                                {
                                    var name = pi.Name;
                                    try
                                    {
                                        var type = Type.GetType(pi.PropertyType.FullName);
                                        object value = null;
                                        var nullableType = Nullable.GetUnderlyingType(type);
                                        if (nullableType != null) type = nullableType;
                                        //类型转换
                                        if (type.IsEnum)
                                        {
                                            value = Enum.Parse(type, dt.Rows[i][j].ToString());
                                        }
                                        else
                                        {
                                            value = Convert.ChangeType(dt.Rows[i][j], type);
                                        }
                                        pi.SetValue(t, value, null);
                                    }
                                    catch (Exception ex)
                                    {
                                        throw new Exception(string.Format("字段\"{0}\"类型转换出错:{1}", name, ex.Message));
                                    }
                                }
                                break;
                            }
                        }
                    }
                    list.Add(t);
                }
                return list;
            }
            catch (Exception ex)
            {
                throw new Exception(string.Format("数据转换到类出错：{0}", ex.Message));
            }
        }
    }
}
