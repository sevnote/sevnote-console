+ function($) {
  $(function() {
    // datatable
    $('[data-ride="datatables"]').each(function() {
      var oTable = $(this).dataTable({
        "processing": true,
        "serverSide": true,
        "ajax": {
          url: '/welcome/datatable',
          type: 'POST'
        },
        "columns": [{
          "data": "user_profile_name"
        }, {
          "data": "user_profile_surname"
        }],
        "sPaginationType": "full_numbers",
        "oLanguage": {
          "sLengthMenu": "每页显示 _MENU_ 条记录",
          "sZeroRecords": "抱歉， 没有找到",
          "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
          "sInfoEmpty": "没有数据",
          "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
          "sZeroRecords": "没有检索到数据",
          "sSearch": "",
          "oPaginate": {
            "sFirst": "首页",
            "sPrevious": "前一页",
            "sNext": "后一页",
            "sLast": "尾页"
          }
        },
      });
    });
  });
}(window.jQuery);