function start(token,response) {
	var spotifyApi = new SpotifyWebApi();
	spotifyApi.setAccessToken(token);
	var followed_promise = spotifyApi.getFollowedArtists({limit: 50});
	var artists = [];
	var count = 0;
	var total = 0;

	var addArtists = function(artists,res) {
		res.artists.items.forEach(function(val) {
		    artists.push(
					{ name: val.name, 
					  followers: val.followers.total, 
						link: val.external_urls.spotify, 
						genres: val.genres, 
						image: val.images.length > 0 ? val.images[0].url : "https://appletoolbox.com/wp-content/uploads/2018/11/Blank-iTunes-Album-Cover-no-artwork.jpg"
					});
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

		let artistSource = document.getElementById('artist-template').innerHTML
    let artistTemplate = Handlebars.compile(artistSource)
    let artistPlaceHolder = document.getElementById('artist');

		let artist = artists[0];
		let name = response.display_name.length > 9 ? response.display_name.substr(0,8) : response.display_name
		let genre = artist.genres.size > 0 ? artist.genres[0] : "na."

		let profile_image = response.images[0].url

		let link = `https://res.cloudinary.com/recomiendaunabanda/image/upload/`;
		link += `c_scale,l_fetch:${window.btoa(artist.image)},w_370,x_500,y_240/`;
		link += `co_rgb:feef5e,e_colorize:100,l_text:Francois%20One_50_bold:${name},x_-320,y_-298/`;
		link += `co_rgb:feef5e,e_colorize:100,l_text:Francois%20One_50_bold:${artist.followers},x_-50,y_-110/`;
		link += `co_rgb:feef5e,e_colorize:100,l_text:Francois%20One_60_bold:${genre},x_120,y_55/`;
		link += `co_rgb:feef5e,e_colorize:100,l_text:Francois%20One_50_bold:${artist.name},x_220,y_-298/`;
		// link += `c_scale,l_fetch:${window.btoa(encodeURIComponent(response.images[0].url))},r_max,w_150,x_-550,y_-298/`
		link += `c_crop/v1669749018/artist/final_recomienda.png`;

		artistPlaceHolder.innerHTML = artistTemplate({ "link" : link });
		$('#artist').show();
		twttr.widgets.load(); 
	}

	followed_promise.then(function(res) {
		total = res.artists.total;
		addArtists(artists,res);
		count += 50
		return res;
	}).then(function(res){
		if(count < total){
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
		} else {
			displayResults(artists);
		}
	});
}




