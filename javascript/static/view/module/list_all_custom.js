require(['noext!/setup/apikey','moment', 'jquery', 'underscore', 'backbone', 'mustcach', 'nprogress', 'pageguide'], function(config,moment, $, _, Backbone, mustcach, NProgress) {
    
    var api_gateway = config.api_gateway();
    var apikey = config.apikey();
    var now  = moment().format('YYYY-MM-DD HH:mm:ss');
    var a_day = moment().subtract('days', '7').format('YYYY-MM-DD HH:mm:ss');

    var Data = Backbone.Model.extend({
        defaults: {
            ApiKey: apikey,
            Key: '*',
            Type: 'custom',
            Size: '500',
        }
    });

    var Init = Backbone.View.extend({
        el: $('body'),
        initialize: function() {
            var post_data = new Data();
            this.GetCustom(post_data);
        },
        GetCustom: function(post_data) {
            NProgress.start();
            $('.all_custom_log>.list-group-item').remove();
            $.ajax({
                type: 'POST',
                data: JSON.stringify(post_data),
                contentType: 'application/json',
                url: api_gateway+'/GetSearchResult',
                success: function(data) {
                    NProgress.done();
                    $(data.Data.LogSets).each(function() {
                        $('.all_custom_log').append('<li class="list-group-item">'+this._source.message+'<a></li>')
                    });
                }
            });
        }
    });
    return new Init;
});
