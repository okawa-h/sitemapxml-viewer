(function($) {

	var _$win,_$tree;

	$(function() {

		_$win = $(window);
		_$tree = $('#tree');

		_$win.on({

			dragenter: onDragenter,
			dragover : onDragover,
			dragleave: onDragleave,
			drop     : onDrop

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
    const file = event.originalEvent.dataTransfer.files[0];
    const isXML = file.type === 'text/xml';

		if (!isXML) {

			_$tree.empty().html('<p>The only file type that can be read is [text/xml].</p>');
			return;

		}

		const reader = new FileReader();
		reader.onload = function(event) {
			const xml = event.target.result;
			const dom = new DOMParser().parseFromString(xml, 'text/xml');
			loadXML(dom);
		};
		reader.readAsText(file);

	}

	function cancel(event) {

		event.stopPropagation();
		event.preventDefault();

	}

	function loadXML(xml) {

		const $xml = $(xml);
		const $urls = $xml.find('url');
		const location = $urls.eq(0).find('loc').text();
		let map = new Object();

		for (let i = 0; i < $urls.length; i++) {

			const url = $urls.eq(i).find('loc').text().replace(location, '/');
			const array = url.split('/');
			const parentDir = array[1];

			if (!map.hasOwnProperty(parentDir)) map[parentDir] = [];
			map[parentDir].push(url);

		}

		setHtml(map, location);

	}

	function setHtml(map, location) {

    let html = '<h2 class="site-url">URL : ' + location + '</h2>';
    let totalLength = 0;
    const keys = Object.keys(map);
    keys.sort();

		html += '<div class="directory-wrap">';
		for (let i = 0; i < keys.length; i++) {

			let key = keys[i];
			let urls = map[key];

			if (key == '' || key.length <= 0) continue;

			urls.sort();
      html += '<section class="directory" data-js="contenthidder">';

			if (urls.length > 0) {

				const data = getFilelistData(key, urls, location);

				html += '<div class="info" data-contenthidder="toggle">';
          html += '<h3>' + key + '</h3>';
          html += '<p class="pagelength">' + data.length + ' page</p>';
          html += '<button class="toggle">&nbsp</button>';
				html += '</div>';
        html += data.html;

        totalLength += data.length;

			} else {

				html += '<h3>' + key + '</h3>';

			}

			html += '</section>';

		}
    html += '</div>';
    html += '<p class="total">total : ' + totalLength + ' page</p>';

		_$tree.empty().html(html);
		setContentHidder();

	}

	function getFilelistData(key,urls,location) {

		let counter = 0;
		let html = '<ul class="file-list" data-contenthidder="content">';

		for (let i = 0; i < urls.length; i++) {

			const url = urls[i];
			if (url.indexOf('.pdf') > -1 || url.indexOf('.xlsx') > -1) continue;

			const pageUrl = decodeURIComponent(url.split('/' + key)[1]);
			const href = location + url;
			counter++;
			html += '<li><a href="' + href + '" target="_blank">' + pageUrl + '</a></li>';

		}

		return {
      'length': counter,
      'html': html + '</ul>'
    };

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

    function onClick() {

      $parent.toggleClass('active');

    }

		$toggle.on('click', onClick);

	}

})(jQuery);
