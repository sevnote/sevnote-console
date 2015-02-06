require(['noext!/setup/apikey','moment', 'jquery', 'underscore', 'backbone', 'mustcach', 'nprogress', 'pageguide'], function(config,moment, $, _, Backbone, mustcach, NProgress) {

    var api_gateway = config.api_gateway();
    var apikey = config.apikey();
    var now  = moment().format('YYYY-MM-DD HH:mm:ss');
    var a_day = moment().subtract('days', '7').format('YYYY-MM-DD HH:mm:ss');

    var Data = Backbone.Model.extend({
        defaults: {
            ApiKey: apikey,
        }
    });


    var Init = Backbone.View.extend({
        el: $('body'),
        initialize: function() {
            var post_data = new Data();
            this.GetCustom();
            this.InitRender();
            this.GetPattern(post_data);
            this.PageGuide();
            this.ChangeButton();
        },
        events: {
            "click .view_pattern": "ViewPattern",
            "click #check_match": "CheckMatch",
            "click #reset": "ResetForm",
            "click #chose_custom":"GetCustom",
            "click #add":"AddPattern",
        },
        InitRender: function() {
            //加载匹配菜单
            $("#field_filter").append('<li class="active"> <a href="#pattern-file" class="auto"> <span class="pull-right text-muted"> <i class="fa fa-angle-left text"></i> <i class="fa fa-angle-down text-active"></i> </span><span>系统规则</span> </a><ul class="nav dk text-sm" id="basic_pattern"></ul></li>');
            $("#field_filter").append('<li class="active"> <a href="#pattern-file" class="auto"> <span class="pull-right text-muted"> <i class="fa fa-angle-left text"></i> <i class="fa fa-angle-down text-active"></i> </span><span>我的规则</span> </a><ul class="nav dk text-sm" id="custom_pattern"></ul></li>');
        },
        PageGuide: function() {
            var guide = {
                id: 'simple',
                'title': '指导您如何创建自定义的数据源',
                steps: [{
                    target: '#tutorial_input',
                    content: '输入数据源：例如:<br/>Jul 28 00:36:45 <123.456> 10-4-7-31 rsyslogd:[00b57ae3-6929-9390-6525-8a44b9862a41] [origin software="rsyslogd" swVersion="5.8.10" x-pid="6125" x-info="http://www.rsyslog.com"] exiting on signal 15.',
                    direction: 'left'
                }, {
                    target: '#tutorial_pattern',
                    content: '输入GROK匹配规则:例如:<br/>\
					(?:%{SYSLOGTIMESTAMP:timestamp}|%{TIMESTAMP_ISO8601:timestamp8601}) ?%{SYSLOGFACILITY_TEXT} ?%{SYSLOGHOST:source} %{SYSLOGPROG}:\\[%{UUID:uuid}\\]?%{GREEDYDATA:message}',
                    direction: 'left',
                }]
            }

            $.pageguide(guide);
        },
        AddPattern:function(){
            noty({
                'text': '正在添加数据，请稍后',
                'type': 'information',
                'layout': 'bottomRight'
            });
            var post_data = ({
                ApiKey : apikey,
                PatternName:$("input[name='PatternName']").val(),
                Type : $("input[name='Type']").val(),
                PatternExp : $("textarea[name='pattern']").val(),
            });

            $.ajax({
                type: 'POST',
                data: JSON.stringify(post_data),
                contentType: 'application/json',
                url: api_gateway+'/AddCustomLogType',
                success: function(data) {
                    if(data.RetCode === 0){
                        noty({
                            'text': '规则已添加',
                            'type': 'success',
                            'layout': 'bottomRight',
                            'timeout': 2000,
                        });
                        $("#add_pattern").hide().fadeOut();
                    }
                }
            });
        },
        ResetForm: function() {
            $(':input,textarea')
                .not(':button, :submit, :reset, :hidden')
                .val('')
                .removeAttr('checked')
                .removeAttr('selected');
        },
        ChangeButton: function() {
            $("textarea[name='input_source'],textarea[name='pattern']").change(function() {
                $("#grok_output").text('');
                $("#add_pattern").hide().fadeOut();
                $("#output").hide().fadeOut();
                if ($(this).val() !== "") {
                    $("#check_match").removeAttr("disabled");
                } else {
                    $("#check_match").attr('disabled', "true");
                }

            });
        },
        CheckMatch: function() {
            NProgress.start();
            $("#output").hide();
            $("#grok_output").text('');
            var input = $("textarea[name='input_source']").val();
            var pattern = $("textarea[name='pattern']").val();
            var post_data = new Data();
            post_data.set({
                Input: input,
                Pattern: pattern
            });

            $.ajax({
                type: 'POST',
                data: JSON.stringify(post_data),
                contentType: 'application/json',
                url: api_gateway_'/GetGrokMatch',
                success: function(data) {
                    NProgress.done();
                    if (data.RetCode !== 0) {
                        noty({
                            'text': '匹配失败',
                            'type': 'warning',
                            'layout': 'bottomRight'
                        });
                    } else {
                        $("#add").removeAttr("disabled");
                        $("#add_pattern").show().fadeIn();
                        var jsonPretty = JSON.stringify(data.Data.AfterGrok, null, 3)
                        $("#grok_output").text(jsonPretty);
                        $("#output").show().fadeIn();
                    }
                }
            });
        },

        ViewPattern: function(e) {
            $('#pattern-file-content').text('')
            var filename = $(e.currentTarget.children).text();
            var post_data = new Data();
            post_data.set({
                FileName: filename,
            });

            $.ajax({
                type: 'POST',
                data: JSON.stringify(post_data),
                contentType: 'application/json',
                url: 'http://api.sevnote.com/GetPatternFile',
                success: function(data) {
                    $('#pattern-file-content').text(data.Data.filecontent)
                }
            });
            $('#pattern-file').show().slideDown("slow");
        },
        GetPattern: function(post_data) {
            $.ajax({
                type: 'POST',
                data: JSON.stringify(post_data),
                contentType: 'application/json',
                url: 'http://api.sevnote.com/GetPatternFileList',
                success: function(data) {
                    //渲染规则文件列表
                    $(data.Data.BasicPattern).each(function() {
                        $("#basic_pattern").append('<li class="active"><a href="#pattern-file" class="auto view_pattern"> <i class="fa fa-angle-right text-xs"></i> <span>' + this + '</span></a></li>');
                    });
                    $(data.Data.CustomPattern).each(function() {
                        $("#custom_pattern").append('<li class="active"><a href="#pattern-file" class="auto view_pattern"> <i class="fa fa-angle-right text-xs"></i> <span>' + this + '</span></a></li>');
                    });
                }
            });
        },
        GetCustom: function() {
            $('.old_log>.list-group-item').remove();
            var post_data = ({
                ApiKey: apikey,
                Key: '*',
                Type: 'custom',
                Size: '1',
            });
            $.ajax({
                type: 'POST',
                data: JSON.stringify(post_data),
                contentType: 'application/json',
                url: 'http://api.sevnote.com/GetSearchResult',
                success: function(data) {

                    $(data.Data.LogSets).each(function() {
                        $('.old_log').append('<li class="list-group-item">'+this._source.message+'<a></li>')
                    });
                }
            });
        }

    });

    return new Init;
});
