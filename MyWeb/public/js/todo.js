var app = angular.module('app', []);
app.controller('TodoListController', function() {
        var todoList = this;
        todoList.html = '<input/>';
        todoList.todos = [
            {text:'learn angular', done:true},
            {text:'build an angular app', done:false}];

        todoList.addTodo = function() {
            //if(!$.trim(todoList.todoText)) return;
            todoList.todos.push({text:todoList.todoText, done:false});
            todoList.todoText = '';
        };

        todoList.remaining = function() {
            var count = 0;
            angular.forEach(todoList.todos, function(todo) {
                count += todo.done ? 0 : 1;
            });
            return count;
        };

        todoList.archive = function() {
            var oldTodos = todoList.todos;
            todoList.todos = [];
            angular.forEach(oldTodos, function(todo) {
                if (!todo.done) todoList.todos.push(todo);
            });
        };

        todoList.test = function(){
            $.ajax({
                type:'get',
                url:'/test',
                dataType:'text',
                success:function(t){
                    console.log('success')
                    //todoList.html = t;
                    var s = 1234;
                    $('#mainDiv').append(s);
                },
                error:function(e){
                    console.log('error')
                    console.log(e)
                }
            })
        };
    });
app.controller('TabController', function($scope){
    $scope.cate = [
        {
            cateId: 1,
            cateName: '前端技术',
            child: [
                {
                    cateId: 4,
                    cateName: 'JavaScript'
                },
                {
                    cateId: 5,
                    cateName: 'HTML 5 + CSS 3'
                }
            ]
        },
        {
            cateId: 2,
            cateName: '后端技术',
            child:[
                {
                    cateId: 3,
                    cateName: 'PHP',
                    child: [
                        {
                            cateId: 6,
                            cateName: 'ThinkPHP'
                        },
                        {
                            cateId: 7,
                            cateName: 'Symfony'
                        }
                    ]
                }
            ]
        }
    ];
});
app.controller('MemcachedController', function(){

});


