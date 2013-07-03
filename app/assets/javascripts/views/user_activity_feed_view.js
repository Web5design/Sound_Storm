SoundStorm.Views.UserActivityFeedView = Backbone.View.extend({

	id: "user_activity_feed_view",
	tagName: "section",
	className: "middle-column",
	template: JST['users/user_activity_feed'],

	initialize: function(userAssets) {
		this.userAssets = userAssets;
		// this.listenTo(SoundStorm.currentUser.tracks, "change", this.render);
		// this.listenTo(SoundStorm.currentUser.playSets, "change", this.render);		
	},

	events: {
		"click button.add-to-set": "popSetForm",
		"click button.close": "removePopup",
		"click button.submit": "createPlaySet",
		"click .track button.remove": "removeTrack",
		"click .play-set button.remove": "removePlaySet",
		"click button.add-song-to-play-set": "addSong",
		"click button.remove-song-from-play-set": "removeSong"
	},

	popSetForm: function(event) {
		$(event.target).addClass("hidden");
		$(event.target).parent(".track").after(JST['popups/add_to_set']({
			trackId: $(event.target).attr("data-track-id")
		}));		
	},

	removePopup: function(event) {
		$(event.target).closest(".popup").siblings(".track").find("button.add-to-set").removeClass("hidden");
		$(event.target).closest(".popup").remove();
	},

	createPlaySet: function(event) {
		console.log("CREATE PLAY SET")
		event.preventDefault();
		var attrs = $(event.target.form).serializeJSON();
		SoundStorm.currentUser.playSets.create(attrs, {
			success: function(model, response) {
				var $popup = $(event.target).closest("div.popup");
				$popup.find("ul").append(JST['snippets/set']({ set: model}));
				$popup.find("input[type='text']").val("");
			}
		});
		
	},

	removeTrack: function(event) {
		event.preventDefault();
		var that = this;
		var trackId = $(event.target).parent(".track").attr("data-track-id");
		SoundStorm.currentUser.tracks.get(trackId).destroy({ 
			success: function(model, response) {
				console.log(model.get('name') + " deletion success!");
				$(event.target).parent(".track").remove();
			}
		});
	},

	removePlaySet: function(event) {
		var that = this;
		var playSetId = $(event.target).parent(".play-set").attr("data-play-set-id");
		SoundStorm.currentUser.playSets.get(playSetId).destroy({ 
			success: function(model, response) {
				console.log(model.get('name') + " deletion success!");
				$(event.target).parent(".play-set").remove();
			}
		});
	},

	addSong: function(event) {
		$(event.target).addClass("hidden");
		$(event.target).siblings("button").removeClass("hidden");
		var track = SoundStorm.currentUser.tracks.get($(event.target).attr("data-track-id"));
		var playSet = SoundStorm.currentUser.playSets.get($(event.target).attr("data-play-set-id"));
		$.ajax({
			url: "play_settings.json",
			type: "POST",
			data: { play_setting: { 
				track_id: track.id,
				play_set_id: playSet.id
			}},
			success: function(response) {
				playSet.tracks.add(track);
			}
		});	
	},

	removeSong: function(event) {
		$(event.target).addClass("hidden");
		$(event.target).siblings("button").removeClass("hidden");
		var track = SoundStorm.currentUser.tracks.get($(event.target).attr("data-track-id"));
		var playSet = SoundStorm.currentUser.playSets.get($(event.target).attr("data-play-set-id"));
		$.ajax({
			url: "play_settings/1.json", //hackey?
			type: "DELETE",
			data: { 
				track_id: track.id,
				play_set_id: playSet.id
			},
			success: function(response) {
				playSet.tracks.remove(track);
			}
		});	
	},

	render: function() {

		console.log("USER ACTIVITY RENDER")
		var content = this.template({ userAssets: this.userAssets });

		this.$el.html(content);
		return this;
	}
});