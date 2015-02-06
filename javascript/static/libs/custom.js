
function check_browser() {
		var isOpera = !! window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
		var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
		var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		// At least Safari 3+: "[object HTMLElementConstructor]"
		var isChrome = !! window.chrome && !isOpera; // Chrome 1+
		var isIE = /*@cc_on!@*/ false || !! document.documentMode; // At least IE6

		/*			var output = 'Detecting browsers by ducktyping:<hr>';
			output += 'isFirefox: ' + isFirefox + '<br>';
			output += 'isChrome: ' + isChrome + '<br>';
			output += 'isSafari: ' + isSafari + '<br>';
			output += 'isOpera: ' + isOpera + '<br>';
			output += 'isIE: ' + isIE + '<br>';*/
	}


	// sparkline
	var sr, sparkline = function($re) {
			$(".sparkline").each(function() {
				var $data = $(this).data();
				if ($re && !$data.resize) return;
				($data.type == 'pie') && $data.sliceColors && ($data.sliceColors = eval($data.sliceColors));
				($data.type == 'bar') && $data.stackedBarColor && ($data.stackedBarColor = eval($data.stackedBarColor));
				$data.valueSpots = {
					'0:': $data.spotColor
				};
				$(this).sparkline('html', $data);
			});
		};
	$(window).resize(function(e) {
		clearTimeout(sr);
		sr = setTimeout(function() {
			sparkline(true)
		}, 500);
	});
	sparkline(false);

	// slider
	$('.slider').each(function() {
		$(this).slider();
	});

	// sortable
	if ($.fn.sortable) {
		$('.sortable').sortable();
	}

	// slim-scroll
	$('.no-touch .slim-scroll').each(function() {
		var $self = $(this),
			$data = $self.data(),
			$slimResize;
		$self.slimScroll($data);
		$(window).resize(function(e) {
			clearTimeout($slimResize);
			$slimResize = setTimeout(function() {
				$self.slimScroll($data);
			}, 500);
		});
		$(document).on('updateNav', function() {
			$self.slimScroll($data);
		});
	});

	// portlet
	$('.portlet').each(function() {
		$(".portlet").sortable({
			connectWith: '.portlet',
			iframeFix: false,
			items: '.portlet-item',
			opacity: 0.8,
			helper: 'original',
			revert: true,
			forceHelperSize: true,
			placeholder: 'sortable-box-placeholder round-all',
			forcePlaceholderSize: true,
			tolerance: 'pointer'
		});
	});

	// docs
	$('#docs pre code').each(function() {
		var $this = $(this);
		var t = $this.html();
		$this.html(t.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
	});

	// table select/deselect all
	$(document).on('change', 'table thead [type="checkbox"]', function(e) {
		e && e.preventDefault();
		var $table = $(e.target).closest('table'),
			$checked = $(e.target).is(':checked');
		$('tbody [type="checkbox"]', $table).prop('checked', $checked);
	});

	// random progress
	$(document).on('click', '[data-toggle^="progress"]', function(e) {
		e && e.preventDefault();

		var $el = $(e.target),
			$target = $($el.data('target'));
		$('.progress', $target).each(
			function() {
				var $max = 50,
					$data, $ps = $('.progress-bar', this).last();
				($(this).hasClass('progress-xs') || $(this).hasClass('progress-sm')) && ($max = 100);
				$data = Math.floor(Math.random() * $max) + '%';
				$ps.css('width', $data).attr('data-original-title', $data);
			}
		);
	});

	// add notes

	// function addMsg($msg) {
	// 	var $el = $('.nav-user'),
	// 		$n = $('.count:first', $el),
	// 		$v = parseInt($n.text());
	// 	$('.count', $el).fadeOut().fadeIn().text($v + 1);
	// 	$($msg).hide().prependTo($el.find('.list-group')).slideDown().css('display', 'block');
	// }
	// var $msg = '<a href="#" class="media list-group-item">' +
	// 	'<span class="pull-left thumb-sm text-center">' +
	// 	'<i class="fa fa-envelope-o fa-2x text-success"></i>' +
	// 	'</span>' +
	// 	'<span class="media-body block m-b-none">' +
	// 	'Sophi sent you a email<br>' +
	// 	'<small class="text-muted">1 minutes ago</small>' +
	// 	'</span>' +
	// 	'</a>';
	// setTimeout(function() {
	// 	addMsg($msg);
	// }, 1500);




	

