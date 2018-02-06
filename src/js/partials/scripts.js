(function($) {

	//on ready
	$(document).ready(function() {
		//run modals
		$('.getModal').on('click', function(e){
			e.preventDefault();
			var target_modal = $(this).attr('href');
			if (!target_modal) {
				target_modal = $(this).data('modal');
			}
			$(target_modal).arcticmodal({
				beforeOpen: function() {
					$(target_modal).addClass('openEffect');
					$(target_modal).removeClass('closeEffect');
				},
				beforeClose: function() {
					$(target_modal).removeClass('openEffect');
					$(target_modal).addClass('closeEffect');
				}
			});
			return false;
		});

		//scroll to anchors
		$('.scrolling').click(function(){
			var target = $(this).attr('href');
			$('html, body').animate({scrollTop: $(target).offset().top}, 500);
			return false; 
		});
		
		//masked input
		var phoneMask = ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]; // +7 (___) ___-__-__
		var phoneInputs = document.querySelectorAll('input[name=phone]');
		phoneInputs.forEach(function(phoneInput) {
			vanillaTextMask.maskInput({
				inputElement: phoneInput,
				mask: phoneMask,
				placeholderChar: '_',
				// showMask: true
			});
		});

		// hide placeholder on focus and return it on blur
		$('input, textarea').focus(function () {
			$(this).data('placeholder', $(this).attr('placeholder'));
			$(this).attr('placeholder', '');
		});
		$('input, textarea').blur(function () {
			$(this).attr('placeholder', $(this).data('placeholder'));
		});
		
		//select styler
		$('input[type=checkbox]').styler({
			//selectPlaceholder: 'Выберите...'
		});
		
		//toggleNav function
		function toggleNav() {
			$('.nav-toggle').toggleClass('active');
			$('.nav').toggleClass('open');
			$('.nav-toggle-out').removeClass('notvisible');
			setTimeout(function () {
				if ($('.nav').hasClass('open')) {
					$('.nav-toggle-in').removeClass('notvisible');
					$('.nav-toggle-out').addClass('notvisible');
				} else {
					$('.nav-toggle-in').addClass('notvisible');
				}
			}, 300);
		}
		
		//binding onclick nav-toggle
		$('.nav-toggle').on('click', toggleNav);
		
		//closeNavOnSwipe function
		function closeNavOnSwipe(selectors) {
			selectors = selectors.split(', ');
			selectors.forEach(function (selector) {
				var hammer = new Hammer(document.querySelector(selector), {
					cssProps: {
						userSelect: true
					}
				});
				hammer.on("swiperight", function (e) {
					if ($('.nav').hasClass('open')) {
						toggleNav();
					}
				});
			});
		}
		
		//binding body and .nav to close nav by swiperright
		closeNavOnSwipe('body, .nav');
		
		//index-slider
		if ($('.index-slider-wrap-in').length > 0) {
			var indexSlider = new Swiper('.index-slider-wrap-in', {
				loop: true,
				speed: 1000,
				autoplay: 5000,
				effect: 'cube', // "slide", "fade", "cube", "coverflow" or "flip"
				slidesPerView: 1, // 'auto'
				navigation: {
					prevEl: '.index-slider-prev',
					nextEl: '.index-slider-next'
				},
				pagination: {
					el: '.index-slider-pagination',
					type: 'bullets',
					clickable: true
				},
				autoHeight: true,
				spaceBetween: 0,
				grabCursor: true,
				lazyLoading: true
			});
			setTimeout(function () {
				indexSlider.update();
			}, 50);
		}
		
		//play_btn
		var iframeWrap;
		$('.play-btn').on('click', function(){
			var videoid = $(this).data('videoid');
			iframeWrap = $(this).closest('.item').find('.video-wrap');
			$(this).fadeOut();
			iframeWrap.find('img').fadeOut();
			iframeWrap.append('<iframe src="https://www.youtube.com/embed/' + videoid + '" frameborder="0" allowfullscreen></iframe>');
		});
		
		//blog-slider
		if ($('.blog-slider-wrap-in').length > 0) {
			var blogSlider = new Swiper('.blog-slider-wrap-in', {
				loop: true,
				autoplay: 5000,
				effect: 'slide',
				slidesPerView: 3, // 'auto'
				navigation: {
					prevEl: '.blog-slider-prev',
					nextEl: '.blog-slider-next'
				},
				autoHeight: true,
//				freeMode: true,
				spaceBetween: 30,
				grabCursor: true,
				lazyLoading: true,
				breakpoints: {
					1024: {
						slidesPerView: 3,
						spaceBetween: 20
					},
					900: {
						slidesPerView: 2,
						spaceBetween: 15
					},
					560: {
						slidesPerView: 1,
						autoHeight: false,
						spaceBetween: 0
					}
				}
			});
			setTimeout(function () {
				blogSlider.update();
			}, 50);
		}
		
		//go-top
		$('.go-top').click(function () {
			$('html, body').animate({scrollTop: 0}, 300);
		});


        var bottomIndent = 30;

		$(window).scroll(function (e) {
			if ($(window).scrollTop() > 150) {
                $('.go-top').fadeIn();
            } else {
				$('.go-top').fadeOut();
			}

            if  ($(window).scrollTop() > $(document).height() - $(window).height() - 180)
            {
            	var s = $(document).height() - $(window).height() - $(window).scrollTop();
            	var b = 180 - s;

                $('.go-top').css("bottom", b + bottomIndent);
            } else {
                $('.go-top').css("bottom", bottomIndent);
			}

		});
		
		//svg img to inline svg
		$('img.svg').each(function(){
			var $img = $(this);
			var imgID = $img.attr('id');
			var imgClass = $img.attr('class');
			var imgURL = $img.attr('src');
			
			$.get(imgURL, function(data) {
				// Get the SVG tag, ignore the rest
				var $svg = $(data).find('svg');
				
				// Add replaced image's ID to the new SVG
				if(typeof imgID !== 'undefined') {
					$svg = $svg.attr('id', imgID);
				}
				// Add replaced image's classes to the new SVG
				if(typeof imgClass !== 'undefined') {
					$svg = $svg.attr('class', imgClass+' replaced-svg');
				}
				
				// Remove any invalid XML tags as per http://validator.w3.org
				$svg = $svg.removeAttr('xmlns:a');
				
				// Check if the viewport is set, if the viewport is not set the SVG wont't scale.
				if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
					$svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
				}
				
				// Replace image with new SVG
				$img.replaceWith($svg);
				
			}, 'xml');
			
		});

		/********************  forms  *********************/  
		$('.cmd-form, .modal-form').on('submit', function(){
			var self = $(this);
			var phoneInput = self.find('input[name=phone]');
			self.find('input, textarea').filter('[required]:visible').css('outline','none');
			var proceed = true;

			self.find('input, textarea').filter('[required]:visible').each(function(){
				if ($(this).val() === "") {
					$(this).css('outline','1px solid red'); 
					proceed = false;
				}
			});
			if ( phoneInput.val().includes('_') ) {
				phoneInput.css('outline','1px solid red'); 
				proceed = false;
			}

			if(proceed) {
				var send_data = $(this).serialize(); // +"&send_to_email="+from_back.send_to_email;

				$.ajax({
					type: "POST",
					url: 'send.php', // from_back.send_url
					data: send_data,
					success: function (data) {
						$.arcticmodal('close');
						$('#modal-success').arcticmodal();
					},
					error: function (xhr, str) {
						alert("Возникла ошибка!");
					}
				});
			}
			
			return false;
		});


	}); //END on ready

})(jQuery);