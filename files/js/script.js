(function($) {

	var _$win,_$tree;

	$(function() {

		_$win  = $(window);
		_$tree = $('#tree');
		// start();
		
		_$win.on({

			dragenter:onDragenter,
			dragover :onDragover,
			dragleave:onDragleave,
			drop     :onDrop

		});

	});

	function onDragenter(event) {
		
		cancel(event);

	}

	function onDragover(event) {
		
		cancel(event);

	}

	function onDragleave(event) {
		
		cancel(event);

	}

	function onDrop(event) {

		cancel(event);
		let file  = event.originalEvent.dataTransfer.files[0];

		if (file.type != 'text/xml') {

			_$tree.empty().html('<p>File type is only [text/xml]</p>');
			return;

		}

		let reader = new FileReader();
		reader.onload = function(event) {
			var xml = event.target.result;
			var dom = new DOMParser().parseFromString(xml, 'text/xml');
			onSuccess(dom);
		};
		reader.readAsText(file);

	}

	function cancel(event) {

		event.stopPropagation();
		event.preventDefault();

	}

	function start() {

		$.ajax({
			url     :'./sitemap.xml',
			type    :'GET',
			dataType:'xml'
		})
		.then((...args) => {

			const [data, textStatus, jqXHR] = args;
			onSuccess(data);

		})
		.catch((...args) => {

			const [jqXHR, textStatus, errorThrown] = args;
			console.log('fail', jqXHR.status);

		});

	}

	function onSuccess(xml) {

		const $document = $(xml);
		const $urlList  = $document.find('url');
		const location  = $urlList.eq(0).find('loc').text();
		let map         = new Object();

		for (let i = 0; i < $urlList.length; i++) {

			let url      = $urlList.eq(i).find('loc').text().replace(location,'/');
			let array    = url.split('/');
			let category = array[1];

			if (!map.hasOwnProperty(category)) map[category] = [];
			map[category].push(url);

		}

		setHtml(map,location);

	}

	function setHtml(map,location) {

		let html = '<h2 class="site-url">' + location + '</h2>';
		let keys = Object.keys(map);

		html += '<div class="directory-wrap">';
		for (let i = 0; i < keys.length; i++) {

			let key     = keys[i];
			let urls    = map[key];

			if (key == '' || key.length <= 0) continue;

			urls.sort();

			html += '<section class="directory" data-js="contenthidder">';
			if (0 < urls.length) {

				let data = getFilelistData(key,urls,location);

				html += '<div class="info" data-contenthidder="toggle">';
				html += '<h3>' + key + '</h3>';
				html += '<p class="pagelength">' + data.length + 'ページ</p>';
				html += '<button class="toggle">&nbsp</button>';
				html += '</div>';
				html += data.html;

			} else {

				html += '<h3>' + key + '</h3>';

			}

			html += '</section>';

		}
		html += '<div>';

		_$tree.empty().html(html);
		setContentHidder();

	}

	function getFilelistData(key,urls,location) {

		let counter = 0;
		let html = '<ul class="file-list" data-contenthidder="content">';

		for (let i = 0; i < urls.length; i++) {

			const url = urls[i];
			if (-1 < url.indexOf('.pdf') || -1 < url.indexOf('.xlsx')) continue;

			const pageUrl = decodeURI(url.split('/' + key)[1]);
			const href    = location + url;
			counter++;
			html += '<li><a href="' + href + '" target="_blank">' + pageUrl + '</a></li>';

		}

		return { 'length':counter,'html':html + '</ul>' };

	}

	function setContentHidder() {

		let $targets = $('[data-js="contenthidder"]');
		for (let i = 0; i < $targets.length; i++) {
			new ContentHidder($targets.eq(i));
		}

	}

	let ContentHidder = function($parent) {

		const $content = $parent.find('[data-contenthidder="content"]');
		const $toggle  = $parent.find('[data-contenthidder="toggle"]');

		$toggle.on('click',function() {
			$parent.toggleClass('active');
		});

	}

})(jQuery);
