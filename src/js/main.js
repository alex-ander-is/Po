/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
'use strict';

/**
 * Example of Require.js boostrap javascript
 */

 // The UserAgent is used to detect IE11. Only IE11 requires ES5.
(function () {

	function _ojIsIE11() {
		var nAgt = navigator.userAgent;
		return nAgt.indexOf('MSIE') !== -1 || !!nAgt.match(/Trident.*rv:11./);
	};
	var _ojNeedsES5 = _ojIsIE11();

	requirejs.config(
		{
			baseUrl: 'js',

			paths:
			/* DO NOT MODIFY
			** All paths are dynamicaly generated from the path_mappings.json file.
			** Add any new library dependencies in path_mappings json file
			*/
			// injector:mainReleasePaths
			{
				'knockout': 'libs/knockout/knockout-3.5.1.debug',
				'jquery': 'libs/jquery/jquery-3.5.1',
				'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.1',
				'hammerjs': 'libs/hammer/hammer-2.0.8',
				'ojdnd': 'libs/dnd-polyfill/dnd-polyfill-1.0.2',
				'ojs': 'libs/oj/v9.2.0/debug' + (_ojNeedsES5 ? '_es5' : ''),
				'ojL10n': 'libs/oj/v9.2.0/ojL10n',
				'ojtranslations': 'libs/oj/v9.2.0/resources',
				'text': 'libs/require/text',
				'signals': 'libs/js-signals/signals',
				'customElements': 'libs/webcomponents/custom-elements.min',
				'proj4': 'libs/proj4js/dist/proj4-src',
				'css': 'libs/require-css/css',
				'touchr': 'libs/touchr/touchr',
				'persist': '@samplesjsloc@/persist/debug',
				'corejs' : 'libs/corejs/shim',
				'chai': 'libs/chai/chai-4.2.0',
				'regenerator-runtime' : 'libs/regenerator-runtime/runtime'
			}
			// endinjector
		}
	);
}());

require([
	'knockout',
	'ojs/ojbootstrap',
	'ojs/ojarraydataprovider',
	'ojs/ojknockout-keyset',
	'ojs/ojresponsiveutils',
	'ojs/ojresponsiveknockoututils',

	'ojs/ojchart',
	'ojs/ojknockout',
	'ojs/ojarraydataprovider',
	'ojs/ojavatar',
	'ojs/ojbutton',
	'ojs/ojknockout',
	'ojs/ojlistitemlayout',
	'ojs/ojlistview',
	'ojs/ojselector',
	'ojs/ojtoolbar'
	],
	function (
		ko,
		Bootstrap,
		ArrayDataProvider,
		keySet,
		ResponsiveUtils,
		ResponsiveKnockoutUtils
	) {
		const dataPie = [{
			'id': 0,
			'series': 'Series 1',
			'group': 'Group A',
			'value': 25
		},
		{
			'id': 1,
			'series': 'Series 2',
			'group': 'Group A',
			'value': 75
		}];

		let dataList = [];

		const apiBasePath = 'https://pokeapi.co/api/v2';
		const apiPokemon = '/pokemon';
		const apiPokemonSpecies = '/pokemon-species';
		// const listOfPokemons = '?offset=0&limit=5';
		let elementH1;
		let numPokemons = 5;
		let numPokemonsTotal = 0;
		let numFetchedPokemons = 0;

		function init() {
			fetchPoKemonSpecies();
		}

		function h1(value) {
			if (elementH1 == undefined)
				elementH1 = document.getElementById('h1');
			elementH1.innerHTML = value;
		}

		function fetchPoKemonSpecies () {
			h1('Phở Kémons Loading…');
			fetch(apiBasePath + apiPokemonSpecies)
				.then(response => response.json())
				.then((data) => {
					numPokemonsTotal = data.count;
					fetchRandomPoKemons(numPokemons);
				})
				.catch((error) => {
					console.error(error);
				});
		}

		function fetchRandomPoKemons(n) {
			let id;
			let randomIDs = [];
			let numGeneratedIDs = 0;

			while (numGeneratedIDs < n) {
				id = Math.round((Math.random() * numPokemonsTotal));

				if (randomIDs.indexOf(id) < 0) {
					randomIDs.push(id);
					numGeneratedIDs++;
				}
			}

			for (let i = 1; i <= n; i++)
				fetchPoKemonById(i, randomIDs.shift());
		}

		function fetchPoKemonById(sortNumber, id) {
			fetch(apiBasePath + apiPokemon + '/' + id)
				.then(response => response.json())
				.then((data) => {
					numFetchedPokemons++;
					data.sortNumber = sortNumber;
					dataList[sortNumber - 1] = data;
					numFetchedPokemons == numPokemons && onFetchedPokemons();
				})
				.catch((error) => {
					console.error(error);
				});
		}

		function onFetchedPokemons() {
			h1('Phở Kémons');
			ko.applyBindings(modelList, document.getElementById('list-container'));
			// ko.applyBindings(modelList, document.getElementById('pie-container'));
		}

		function ModelPie() {
			this.dataProviderPie = new ArrayDataProvider(dataPie, {keyAttributes: 'id'});
			this.dataProviderList = new ArrayDataProvider(dataList, { keyAttributes: "id" });
			this.selectorSelectedItems = new keySet.ObservableKeySet();
		}

		function ModelList() {
			this.dataProviderPie = new ArrayDataProvider(dataPie, {keyAttributes: 'id'});
			this.dataProviderList = new ArrayDataProvider(dataList, { keyAttributes: "id" });
			this.selectorSelectedItems = new keySet.ObservableKeySet();
		}

		let modelList = new ModelList();
		// let modelPie = new ModelPie();

		Bootstrap.whenDocumentReady().then(() => {
			init();
		});
	}
);
