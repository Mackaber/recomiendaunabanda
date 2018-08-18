function start(token,response) {
	var spotifyApi = new SpotifyWebApi();
	spotifyApi.setAccessToken(token);
	var followed_promise = spotifyApi.getFollowedArtists({limit: 50});
	var artists = [];
	var count = 0;
	var total = 0;

	var addArtists = function(artists,res) {
		res.artists.items.forEach(function(val) {
		    artists.push({ "name": val.name, "followers": val.followers.total, "link": val.external_urls.spotify, "genres": val.genres, "image": val.images[0].url });
		});
	}

	var compare = function(a,b) {
	  if (a.followers < b.followers)
	    return -1;
	  if (a.followers > b.followers)
	    return 1;
	  return 0;
	}

	var displayResults = function(artists){
		artists.sort(compare);

		var artistSource = document.getElementById('artist-template').innerHTML,
        	artistTemplate = Handlebars.compile(artistSource),
        	artistPlaceHolder = document.getElementById('artist');
        	artist = artists[0];
        	name = response.display_name.length > 9 ? response.display_name.substr(0,8) : response.display_name
        	genre = artist.genres.size > 0 ? artist.genres[0] : "na."
        	artistPlaceHolder.innerHTML = artistTemplate({"user_name": name, "user_image": window.btoa(response.images[0].url), "artist": artist, "genre": genre, "image": window.btoa(artist.image)});

		$('#artist').show();
		twttr.widgets.load(); 
	}

	followed_promise.then(function(res) {
		total = res.artists.total;
		addArtists(artists,res);
		return res;
	}).then(function(res){
		while(count < total) {
			prom = spotifyApi.getFollowedArtists({limit: 50, after: res.artists.items[49].id})
			prom.then(function(r) {
				addArtists(artists,r);
			}).then(function(){
				if(count > total) {
					displayResults(artists);
				}
			});
			count += 50
		}
	});
}




