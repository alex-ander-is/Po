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
	'ojs/ojkeyset',
	'ojs/ojknockout',
	'ojs/ojtable',
	'ojs/ojchart',

	'ojs/ojbutton',
	'ojs/ojselectsingle',
	'ojs/ojformlayout'
	],

	function (
		ko,
		Bootstrap,
		ArrayDataProvider,
		KeySet,
	) {
		window.ko = ko;

		const apiBasePath = 'https://pokeapi.co/api/v2';
		const apiPokemon = '/pokemon';
		const apiPokemonSpecies = '/pokemon-species';
		const numPokemons = 5;
		const listElement = document.getElementById('list');
		const pieElement = document.getElementById('pie');

		let elementH1;
		let numFetchedPokemons = 0;
		let pokemonsData = [];
		let typesCollection = ko.observableArray([]);

		function init(value) {
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
				.then(data => fetchRandomPokemons(numPokemons, data.count))
				.catch(error => console.error(error));
		}

		function fetchRandomPokemons(count, total) {
			let randomIDs = generateRandomIds(count, total);

			for (let i = 1; i <= count; i++)
				fetchPokemonById(i, randomIDs.shift());
		}

		function generateRandomIds (count, total) {
			let id;
			let result = [];

			while (result.length < count) {
				id = Math.round((Math.random() * total));

				if (result.indexOf(id) < 0) {
					result.push(id);
				}
			}

			return result;
		}

		function fetchPokemonById(sortNumber, id) {
			fetch(apiBasePath + apiPokemon + '/' + id)
				.then(response => response.json())
				.then(data => {
					numFetchedPokemons++;
					data.sortNumber = sortNumber;
					data.isChecked = false;
					data.numMoves = numMoves(data);
					data.typesList = typesList(data);
					pokemonsData[sortNumber - 1] = data;
					onPokemonFetched();
				})
				.catch(error => console.error(error));
		}

		function numMoves(data) {
			return data.moves.length;
		}

		function typesList(data) {
			let result = [];
			data.types.forEach(element => result.push(element.type.name))
			return result;
		}

		function generateTypesCollection() {
			let typeExists;
			let typesCollectionHelper;
			typesCollection.removeAll();

			pokemonsData.forEach(entry => {
				entry.isChecked && entry.typesList.forEach(element => {
					typeExists = false;

					// observableArray is buggy and can't be used, within
					// ko.utils.arrayForEach, see the bug:
					// https://github.com/knockout/knockout/issues/2035
					typesCollectionHelper = [...typesCollection()];
					typesCollectionHelper.forEach(item => {
						if (item.type === element) {
							item.value++;
							typeExists = true;
						}
					});

					if (!typeExists) {
						typesCollectionHelper.push({
							type: element,
							value: 1
						});
					}

					typesCollection.removeAll();
					typesCollectionHelper.forEach(item => typesCollection.push(item));
				});
			});
			// <oj-chart> is buggy and does not refresh the visual
			// representation of data properly. See typesCollection real value
			// and compare to the visualisation.
			console.info(typesCollection());
		}

		function ListModel() {
			this.columns = [
				{ field: 'sortNumber',	headerText: '#'},
				{ field: 'id',			headerText: 'ID'},
				{ field: 'name',		headerText: 'Name'},
				{ field: 'height',		headerText: 'Height'},
				{ field: 'weight',		headerText: 'Weight'},
				{ field: 'numMoves',	headerText: 'Number of Moves'},
				{ field: 'typesList',	headerText: 'Type(s)'}
			];

			this.selectedItems = ko.observable({
				row: new KeySet.KeySetImpl(),
				column: new KeySet.KeySetImpl()
			});

			this.onSelectedChanged = function (event) {
				let isAddAll = event.detail.value.row.isAddAll();
				let previousValueRow = event.detail.previousValue.row;
				let valueRow = event.detail.value.row;
				let before = [0];
				let after = [0];
				let changed;
				let element;

				// The easiest way how to get a single changed item
				let reducer = (a, c) => a + c;

				if (isAddAll) {
					previousValueRow.deletedValues && previousValueRow.deletedValues()
						.forEach(element => before.push(element));
					valueRow.deletedValues && valueRow.deletedValues()
						.forEach(element => after.push(element));
				} else {
					previousValueRow.values && previousValueRow.values()
						.forEach(element => before.push(element));
					valueRow.values && valueRow.values()
						.forEach(element => after.push(element));
				}

				if (before.length == after.length) {
					pokemonsData.forEach(element => element.isChecked = isAddAll);
				} else {
					changed = Math.abs(before.reduce(reducer) - after.reduce(reducer));
					element = pokemonsData[changed - 1]
					element.isChecked = !element.isChecked;
				}
				generateTypesCollection();
			}.bind(this);

			this.dataprovider = new ArrayDataProvider(pokemonsData, {
				keyAttributes: 'sortNumber'
			});
		}

		function PieModel() {
			this.dataprovider = new ArrayDataProvider(typesCollection, {
				keyAttributes: 'value'
			});
		}

		function onPokemonFetched() {
			if(numFetchedPokemons == numPokemons) {
				h1('Phở Kémons');
				generateTypesCollection();
				ko.applyBindings(new ListModel(), listElement);
				ko.applyBindings(new PieModel(), pieElement);

			}
		}

		Bootstrap.whenDocumentReady().then(init);
	}
);
