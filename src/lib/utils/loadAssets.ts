function checkCSS(url: string): boolean {
	var links = document.getElementsByTagName('link');
	for (var i = links.length; i--; ) {
		if (links[i].href == url) return true;
	}
	return false;
}

export function loadCSS(url: string): Promise<string> | undefined {
	if (!checkCSS(url)) {
		return new Promise(function (resolve, reject) {
			let link = document.createElement('link');
			link.crossOrigin = 'anonymous';
			link.rel = 'stylesheet';
			link.href = url;
			link.onload = function () {
				resolve(url);
			};
			link.onerror = function () {
				reject(url);
			};
			document.head.appendChild(link);
		});
	}
}

function checkScript(url: string): boolean {
	var scripts = document.getElementsByTagName('script');
	for (var i = scripts.length; i--; ) {
		if (scripts[i].src == url) return true;
	}
	return false;
}

export function loadScript(url: string): Promise<string> | undefined {
	if (!checkScript(url)) {
		return new Promise(function (resolve, reject) {
			let script = document.createElement('script');
			script.src = url;
			script.async = false;
			script.onload = function () {
				resolve(url);
			};
			script.onerror = function () {
				reject(url);
			};
			document.body.appendChild(script);
		});
	}
}
