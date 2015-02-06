require.config({
	paths: {
		select2: 'libs/select2/select2.min',
	},
	shim: {
    	'select2': ['jquery']
    }
});

require(['select2'],function(){
	$(".select2").select2();
});