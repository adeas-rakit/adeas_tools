<script lang="ts">
	import { onMount } from 'svelte';
	import { loadScript, loadCSS } from '$lib/utils/loadAssets';

	let latitude: any = '-0.789275',
		longtitude: any = '113.921327',
		mapCenter = [latitude, longtitude],
		div: string = 'mapView',
		isLoading: boolean = false;

	function validateLatLng(latitude: number, longtitude: number) {
		if (latitude == null || longtitude == null) {
			console.log([
				{
					title: 'Error',
					message: 'Kordinat Masih Kosong'
				}
			]);
			return false;
		} else {
			if (isFinite(latitude) && Math.abs(latitude) <= 90) {
				if (isFinite(longtitude) && Math.abs(longtitude) <= 180) {
					return true;
				} else {
					console.log([
						{
							title: 'Error',
							message: 'Kordinat Longtitude Tidak Valid'
						}
					]);
					return false;
				}
			} else {
				console.log([
					{
						title: 'Error',
						message: 'Kordinat Latitude Tidak Valid'
					}
				]);
				return false;
			}
		}
	}

	onMount(async () => {
		isLoading = true;
		let styles = [
			'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css',
			'https://cdn.jsdelivr.net/gh/Leaflet/Leaflet.fullscreen/dist/leaflet.fullscreen.css',
			'https://cdn.jsdelivr.net/gh/adeas-rakit/Leaflet.switchscale/src/L.Control.SwitchScaleControl.css',
			'https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.82.0/dist/L.Control.Locate.min.css',
			'https://cdn.jsdelivr.net/npm/leaflet.control.layers.tree@1.1.0/L.Control.Layers.Tree.min.css'
		];
		// save all Promises as array
		let promisesCss: any = [];
		styles.forEach(function (url) {
			promisesCss.push(loadCSS(url));
		});

		Promise.all(promisesCss)
			.then(function () {
				setTimeout(() => {}, 2000);
			})
			.catch(function (style) {
				console.log(style + ' failed to load');
			});

		let scripts = [
			'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
			'https://cdn.jsdelivr.net/gh/Leaflet/Leaflet.fullscreen/dist/Leaflet.fullscreen.min.js',
			'https://cdn.jsdelivr.net/gh/adeas-rakit/leaflet-geolet/geolet.js',
			'https://cdn.jsdelivr.net/gh/adeas-rakit/Leaflet.switchscale/src/L.Control.SwitchScaleControl.js',
			'https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.82.0/dist/L.Control.Locate.min.js',
			'https://cdn.jsdelivr.net/npm/leaflet.control.layers.tree@1.1.0/L.Control.Layers.Tree.min.js'
		];

		let promises: any = [];
		scripts.forEach(function (url) {
			promises.push(loadScript(url));
		});

		Promise.all(promises)
			.then(function () {
				setTimeout(async () => {
					await loadMap();
				}, 2000);
			})
			.catch(function (script) {
				console.log(script + ' failed to load');
			});
	});

	async function loadMap() {
		if (validateLatLng(latitude, longtitude)) {
			const conMap = document.getElementById('contmapView');
			if (conMap) {
				conMap.innerHTML = '';
				conMap.style.display = 'block';
				var mapView = document.createElement('div');
				mapView.setAttribute('id', 'mapView');
				mapView.setAttribute('style', 'width: 100%; height: 100%;');
				conMap.appendChild(mapView);

				const basemap = {
					OSM: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						maxZoom: 19
					}),
					Esri_WorldImagery: L.tileLayer(
						'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
						{
							maxNativeZoom: 18,
							maxZoom: 21,
							attribution:
								'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
						}
					),
					Google_Street: L.tileLayer(
						'https://mt0.googleapis.com/vt?lyrs=m@267000000&src=apiv3&hl=en-US&x={x}&y={y}&z={z}&style=50,37%7Csmartmaps&s=Gal&apistyle=s.t%3A1%7Cs.e%3Ag%7Cp.v%3Aoff%2Cs.t%3A2%7Cp.v%3Aoff%2Cs.t%3A3%7Cs.e%3Al.i%7Cp.v%3Aoff%2Cs.t%3A4%7Cp.v%3Aoff',
						{
							maxZoom: 20,
							subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
							attribution:
								'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
						}
					)
				};

				const map = L.map(div, {
					center: mapCenter,
					zoom: 19,
					layers: [basemap.Esri_WorldImagery, basemap.Google_Street]
				});
				map.attributionControl.setPrefix('Powered by <a href="https://leafletjs.com">Leaflet</a>');
				var baseTree = {
					label: '<b>PETA DASAR &#x1f5fa;</b>',
					children: [
						{ label: 'OSM', layer: basemap.OSM },
						{ label: 'Esri WorldImagery', layer: basemap.Esri_WorldImagery }
					]
				};
				var ctl = L.control.layers.tree(baseTree, {
					collapsed: true
				});

				var overlaysTree = {
					label: '<b>PETA TAMPILAN &#x1f5fa;</b>',
					children: [{ label: 'Google_Street', layer: basemap.Google_Street }]
				};
				ctl.addTo(map).collapseTree().expandSelected();
				ctl.setOverlayTree(overlaysTree).expandSelected();

				map.addControl(
					new L.Control.Fullscreen({
						title: {
							false: 'View Fullscreen',
							true: 'Exit Fullscreen'
						}
					})
				);
				let marker: any = false;
				let lc = L.control
					.locate({
						keepCurrentZoomLevel: true,
						initialZoomLevel: 10,
						locateOptions: {
							enableHighAccuracy: true
						},
						strings: {
							title: 'Tunjukan dimana anda berada!',
							popup: 'lokasi anda {distance} {unit} dari titik ini'
						},
						position: 'topleft'
					})
					.addTo(map);

				// request location update and set location
				lc.start();
				// Menangani lokasi yang ditemukan
				map.on('locationfound', function (e) {
					// Ambil latitude dan longitude
					let lat = e.latitude;
					let lng = e.longitude;
					if (!marker) {
						// Tambahkan marker pada lokasi yang ditemukan
						marker = L.marker([lat, lng], { draggable: true }).addTo(map);
						marker
							.bindPopup('Latitude: <b>' + lat + '</b><br>Longitude: <b>' + lng + '</b>')
							.openPopup();
						marker.on('dragend', function (event) {
							const position = event.target.getLatLng();
							marker.setPopupContent(
								'Latitude: <b>' +
									position.lat.toFixed(6) +
									'</b><br>Longitude: <b>' +
									position.lng.toFixed(6) +
									'</b>'
							);
							marker.openPopup();
						});
					}
				});

				map.addControl(
					new L.Control.SwitchScaleControl({
						position: 'bottomright',
						dropdownDirection: 'up',
						updateWhenIdle: true,
						scales: [
							1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000,
							5000000, 10000000, 25000000
						]
					})
				);
			}
		}
		isLoading = false;
	}
</script>

<svelte:head>
	<title>Pencari Lokasi</title>
</svelte:head>
<div id="contmapView" class="h-screen w-screen rounded-lg"></div>
{#if isLoading}
	<div class="loading-indicator animate-pulse">Hallo...</div>
{/if}

<style>
	.loading-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 24px;
		color: #000;
	}
</style>
