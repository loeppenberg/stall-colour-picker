/// <reference path="../bin/openrct2.d.ts" />

var stall_colour = context.sharedStorage.get("stall_colour_picker.stall_colour", 0);
var random_colour = context.sharedStorage.get("stall_colour_picker.random_colour", false);

function checkPermissionCurrentPlayer(permission) {
	var lcl_Group = network.getGroup(network.currentPlayer.group)
	return (lcl_Group.permissions.indexOf(permission) != -1);
}

var window = null;
function main() {

	context.registerAction(
		"stall_colour_picker_set_colour",
		function(args) {
			return scpSetColour(false, args);
		},
		function(args) {
			return scpSetColour(true, args);
		}
	);
	context.registerAction(
		"stall_colour_picker_set_random_flag",
		function(args) {
			return scpSetRandomColour(false, args);
		},
		function(args) {
			return scpSetRandomColour(true, args);
		}
	);

	var name = "Stall Colours";
	ui.registerMenuItem(name, function() {
		if (window == null) {
			window = ui.openWindow({
				title: "Stall Colour Picker",
				id: 1,
				classification: "Stall Colour Picker",
				width: 300,
				height: 83,
				onClose: function onClose() {
					window = null;
				},
				widgets: [{
					type: "label",
					name: "randomColour",
					x: 10,
					y: 20,
					width: 300,
					height: 10,
					text: "Changes Colour for EVERY Stall/Facility",
				}, {
					type: "checkbox",
					name: "randomColour",
					x: 10,
					y: 40,
					width: 130,
					height: 13,
					text: "Use Random Colour",
					onChange: function onChange(isChecked) {
						//var isAdmin = checkPermissionCurrentPlayer("cheat");
						//if (isAdmin) {
						if (isChecked) {
							random_colour = true;
						}
						else {
							random_colour = false;
						}
						random_colour = isChecked;
						// TODO do this in an action (sharedstorage), or give number as atttribute to executeaction
						context.sharedStorage.set("stall_colour_picker.random_colour", { random_colour });
						context.executeAction("stall_colour_picker_set_random_flag", { random_colour });
						//	}
					}
				}, {
					type: "colourpicker",
					name: "pickColour",
					x: 10,
					y: 60,
					width: 35,
					height: 13,
					colour: stall_colour,
					onChange: function onChange(number) {
						//var isAdmin = checkPermissionCurrentPlayer("cheat");
						// if (isAdmin) {
						stall_colour = number;
						// TODO do this in an action (sharedstorage), or give number as atttribute to executeaction
						context.sharedStorage.set("stall_colour_picker.stall_colour", { number });

						context.executeAction("stall_colour_picker_set_colour", { number });
						//}
					}
				}]
			})
		}
	});
}
var scpSetColour = function(isExecuting, args) {
	if (isExecuting) {

		console.log("scpSetColour " + JSON.stringify(args));
	}
	if (isExecuting) {
		var chosencolour = 0;
		if (typeof args["args"] !== "undefined") {
			chosencolour = args["args"]["number"];
		}
		if (typeof args["number"] !== "undefined") {
			chosencolour = args["number"];
		}

		var allrides = map.rides;
		for (var i = 0; i < allrides.length; i++) {
			var currRide = allrides[i];
			if (currRide.classification == "stall" || currRide.classification == "facility") {
				var usedColourschemes = currRide.colourSchemes;
				for (var j = 0; j < usedColourschemes.length; j++) {
					if (usedColourschemes[j].main != chosencolour) {
						var actionType = 0; // TrackColourMain
						context.executeAction("ridesetappearance", {
							ride: currRide.id,
							type: actionType,
							value: chosencolour,
							index: j
						}, function(result) {
							if (result["error"] != 0) {
								console.log("executed ridesetappearance. Result: " + JSON.stringify(result));
							}
						});
					}
				}
			}
		}
	}

	return {
		cost: 0,
		expenditureType: "landscaping",
		position: {
			x: -1,
			y: -1,
			z: 0
		}
	}
}
var scpSetRandomColour = function(isExecuting, args) {
	if (isExecuting) {
		var allrides = map.rides;
		var chosenRandomFlag = false;
		if (typeof args["args"] !== "undefined") {
			chosenRandomFlag = args["args"]["random_colour"];
		}
		if (typeof args["random_colour"] !== "undefined") {
			chosenRandomFlag = args["random_colour"];
		}
		for (var i = 0; i < allrides.length; i++) {
			var currRide = allrides[i];
			if (currRide.classification == "stall" || currRide.classification == "facility") {
				var random_as_integer = 0;
				if (chosenRandomFlag) {
					random_as_integer = 1;
				}

				var actionType = 8; // SellingItemColourIsRandom
				context.executeAction("ridesetappearance", {
					ride: currRide.id,
					type: actionType,
					value: random_as_integer,
					index: 0
				}, function(result) {
					if (result["error"] != 0) {
						console.log("executed ridesetappearance. Result: " + JSON.stringify(result));
					}
				});

			}
		}
	}

	return {
		cost: 0,
		expenditureType: "landscaping",
		position: {
			x: -1,
			y: -1,
			z: 0
		}
	}
}

registerPlugin({
	name: 'stall colour picker',
	version: '1.1',
	authors: ['eluya'],
	type: 'remote',
	targetApiVersion: 68,
	minApiVersion: 68,
	licence: 'MIT',
	main: main
});