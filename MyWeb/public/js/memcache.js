$(function(){
    var msg = $('#message');
    $(document).on('click','.detail-key',  function(){
        var key = $(this).attr('data-key');
        var div = $(this).siblings('.key-detail');
        var data= {
            key: key,
        }
        $.ajax({
            type:'post',
            url:'/memcache/detailQuery',
            contentType: 'application/json',
            dataType: 'json',
            timeout :30000,
            data:JSON.stringify(data),
            success:function(data) {
                if(!data.success){
                    var date = new Date();
                    msg.html(date + ' ' + JSON.stringify(data.data));
                }else{
                    var data = data.data;
                    div.html(data ? data : 'undefined');
                }

            },
            error:function(e){
                var date = new Date();
                msg.html(date + ' ' + JSON.stringify(e));
            }
        });
    });

    $(document).on('click', '.toggle', function(){
       var target = $(this).siblings('.key-detail');
        if($(this).html() == '隐藏'){
            $(this).html('显示');
            target.hide();
        }else{
            $(this).html('隐藏');
            target.show();
        }
    });

    $(document).on('click','.del-key',  function(){
        var clickObj = this;
        var key = $(this).attr('data-key');
        var div = $(this).next();
        var data= {
            key: key,
        }
        $.ajax({
            type:'post',
            url:'/memcache/delKey',
            contentType: 'application/json',
            dataType: 'json',
            timeout :30000,
            data:JSON.stringify(data),
            success:function(data) {
                var date = new Date();
                if(!data.success){
                    msg.html(date + ' ' + data.data);
                }else{
                    msg.html(date + ' ' + '删除成功');
                    $(clickObj).closest('tr').remove();
                }

            },
            error:function(e){
                var date = new Date();
                msg.html(date + ' ' + JSON.stringify(e));
            }
        });
    });

    $('#memcacheLink').on('click', function(){
        var host = $('#memcacheHost').val();
        var data= {
            host: host,
        }
        $.ajax({
            type:'post',
            url:'/memcache/link',
            contentType: 'application/json',
            dataType: 'json',
            timeout :30000,
            data:JSON.stringify(data),
            success:function(data) {
                var date = new Date();
                msg.html(date + ' ' + JSON.stringify(data));
            },
            error:function(e){
                var date = new Date();
                msg.html(date + ' ' + JSON.stringify(e));
            }
        });
    });
    $('#query').on('click', function(){
        var data = {
            key: $.trim($('#key').val())
        };

        $.ajax({
            type:'post',
            url:'/memcache/query',
            contentType: 'application/json',
            dataType: 'json',
            timeout :30000,
            data:JSON.stringify(data),
            success:function(data) {
                if(!data.success){
                    var date = new Date();
                    msg.html(date + ' ' + JSON.stringify(data.data));
                }else{
                    var list = data.data;
                    var html = '';
                    list.forEach(function(t){
                        html += '<tr><td>' + t.success + '</td>';
                        html += '<td>' + (!t.success ? t.data :
                            '<a class="detail-key" href="javascript:;" data-key="' + t.data.key + '">'
                            + t.data.key + '</a> <a class="toggle" href="javascript:;">隐藏</a><div class="key-detail"></div>') + '</td><td>';
                        if(t.success) {
                            html += '<a class="del-key" href="javascript:;" data-key="' + t.data.key + '">删除</a>';
                        }
                        html += '</td></tr>';
                    });
                    $('#dataList').html(html);
                }

            },
            error:function(e){
                var date = new Date();
                msg.html(date + ' ' + JSON.stringify(e));
            }
        });
    });
    $('#delNullKey').on('click', function(){
        $.ajax({
            type:'post',
            url:'/memcache/delNullKey',
            contentType: 'application/json',
            dataType: 'json',
            timeout :30000,
            success:function(data) {
                if(!data.success){
                    var date = new Date();
                    msg.html(date + ' ' + JSON.stringify(data.data));
                }else{
                    var date = new Date();
                    msg.html(date + ' ' + JSON.stringify(data.data));
                }

            },
            error:function(e){
                var date = new Date();
                msg.html(date + ' ' + JSON.stringify(e));
            }
        });
    });
});