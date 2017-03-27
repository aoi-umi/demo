using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WPFDemo
{
    public class DBTestModel
    {
        public int ID { get; set; }

        public string String { get; set; }

        public TestTypeEnum? Int { get; set; }

        public DateTime? DateTime { get; set; }

        public string[] NullList { get; set; }
    }

    public enum TestTypeEnum
    {
        One = 1,
        Two = 2,
    }
}
