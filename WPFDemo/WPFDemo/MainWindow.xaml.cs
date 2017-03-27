using Prism.Commands;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Globalization;

namespace WPFDemo
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            list = new List<TestModel>() {
                new TestModel() {
                    str1 = "test1_str1",
                    str2 = "test1_str2",
                    style = 1,
                },
                new TestModel() {
                    str1 = "test2_str1",
                    str2 = "test2_str2",
                    style = 2,
                },
                new TestModel() {
                    str1 = "test3_str1",
                    str2 = "test3_str2",
                    style = 1,
                },
                new TestModel() {
                    str1 = "test4_str1",
                    str2 = "test4_str2",
                    style = 2,
                },
                new TestModel() {
                    str1 = "test5_str1",
                    str2 = "test5_str2",
                    style = 1,
                },
                new TestModel() {
                    str1 = "test6_str1",
                    str2 = "test6_str2",
                    style = 2,
                },
            };
            listView.ItemsSource = list;
            DataContext = new MyViewModel();

            var a = new TestModel() { str1 = "aaa" };
            var b = a.Clone();
            var c = a;
            b.str1 = "bbb";
            c.str1 = "ccc";            
        }

        private void Button_Click1(object sender, RoutedEventArgs e)
        {
            Console.WriteLine(123);
        }

        List<TestModel> list;

        private void TabControl_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ButtonState == MouseButtonState.Pressed)
            {
                this.DragMove();
            }
        }

        public static void StaticTest(string str)
        {

        }
        public void Test(string str)
        {
            tb.Text = str;
        }

        private void slider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            var x = inputBox;
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (listView.ItemsSource == null)
                listView.ItemsSource = list;
            else
                listView.ItemsSource = null;
        }

        private void inputBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            double fontSize = 0;
            foreach (var s in inputBox.Text)
            {
                fontSize += MeasureTextWidth(s, inputBox.FontSize, inputBox.FontFamily);
            }
            FontWidth.Text = Math.Round(fontSize, 2).ToString();
        }

        private double MeasureTextWidth(char text, double fontSize, FontFamily fontFamily)
        {
            return MeasureTextWidth(text.ToString(), fontSize, fontFamily);
        }
        private double MeasureTextWidth(string text, double fontSize, FontFamily fontFamily)
        {
            FormattedText formattedText = new FormattedText(
            text,
            CultureInfo.InvariantCulture,
            FlowDirection.LeftToRight,
            new Typeface(fontFamily.ToString()),
            fontSize,
            Brushes.Black);
            return formattedText.WidthIncludingTrailingWhitespace;
        }

        private void Refresh_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var ds = DataBase.ExecSql("select * from test");
                if (ds.Tables.Count > 0)
                {
                    var dbm = DataBase.DataTableToList<DBTestModel>(ds.Tables[0]);
                    DBTestList.ItemsSource = dbm;
                }
            }
            catch (Exception ex)
            {
                UpdateErrorMessage(ex.ToString());
            }
        }

        private void Save_Click(object sender, RoutedEventArgs e)
        {
            var model = DBTestList.SelectedItem as DBTestModel;
            if (model != null)
            {
                //model = new DBTestModel() { ID = model.ID };
                //model.NullList = new string[] { "DateTime" };
                var nullListStr = String.Empty;
                if(model.NullList != null && model.NullList.Length > 0)
                    nullListStr = "," + String.Join(",", model.NullList) + ",";
                try
                {
                    var x = DataBase.ExecProc("p_Test_Save",
                        model.ID,
                        model.String,
                        model.Int,
                        model.DateTime,
                        nullListStr);
                }
                catch (Exception ex)
                {
                    UpdateErrorMessage(ex.ToString());
                }
            }
        }

        private void UpdateErrorMessage(string str)
        {
            ErrorBox.Text = DateTime.Now + str;
        }

        //    另，附送枚举已安装字体的方法：
        //    System.Drawing.FontFamily[] fontFamilies;
        //    InstalledFontCollection installedFontCollection = new InstalledFontCollection();
        //    fontFamilies = installedFontCollection.Families;



        //            int count = fontFamilies.Length;
        //            log("fontFamilies.Length=" + fontFamilies.Length);
        //            for (int i = 0; i<count; i++)
        //            {
        //                fontName = fontFamilies[i].Name;
        //                log("fontName: " + fontName);
        //}

    }

    public class MyDataTemplateSelector : DataTemplateSelector
    {
        public override DataTemplate SelectTemplate(object item, DependencyObject container)
        {
            var model = item as TestModel;
            if (model != null)
            {
                ResourceDictionary resources = new ResourceDictionary();
                resources.Source = new Uri("pack://application:,,,/Themes/Generic.xaml", UriKind.RelativeOrAbsolute);
                switch (model.style)
                {
                    case 1:
                        return resources["DataTemplate1"] as DataTemplate;
                    case 2:
                        return resources["DataTemplate2"] as DataTemplate;
                }
            }
            return base.SelectTemplate(item, container);
        }
    }

    public class MyViewModel : NotificationObject
    {

        public string TestString { get; set; }
        private DelegateCommand<TestModel> testCommand;

        public DelegateCommand<TestModel> TestCommand
        {
            get
            {
                if (testCommand == null)
                {
                    testCommand = new DelegateCommand<TestModel>(new Action<TestModel>(Test));
                }
                return testCommand;
            }
        }

        private void Test(TestModel model)
        {
            TestString = model.str1 + model.str2;
            base.RaisePropertyChanged(nameof(TestString));
            MainWindow.StaticTest(TestString);
            var window = Application.Current.MainWindow as MainWindow;
            window.Test(TestString);
            MessageBox.Show(model.str1 + model.str2);
        }
    }

    public class NotificationObject : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;

        public void RaisePropertyChanged(string propertyName)
        {
            if (PropertyChanged != null)
            {
                PropertyChanged.Invoke(this, new PropertyChangedEventArgs(propertyName));
            }
        }
    }

    public class TestModel
    {
        public string str1 { get; set; }
        public string str2 { get; set; }
        public int style { get; set; }
        public TestModel Clone()
        {
            return this.MemberwiseClone() as  TestModel;
        }
    }

    class NoDataStringConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return ((int)value) == 0 ? "暂无数据":"";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
