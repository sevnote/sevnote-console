+function ($) {

  $(function(){

    $('#wizardform').bootstrapWizard({
      'tabClass': 'nav nav-tabs',
      'onNext': function(tab, navigation, index) {
        var valid = false;
        $('[data-required="true"]', $( $(tab.html()).attr('href') )).each(function(){
          return (valid = $(this).parsley( 'validate' ));
        });
        return valid;
      },
      onTabClick: function(tab, navigation, index) {
        return false;
      },
      onTabShow: function(tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index+1;
        var $percent = ($current/$total) * 100;
        $('#wizardform').find('.progress-bar').css({width:$percent+'%'});
      }
    });

    
  });
}(window.jQuery);