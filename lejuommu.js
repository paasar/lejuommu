    window.lejuommu = {
      radioIsPlaying: true,
      automaticChanging: true,
      };

    const mute = document.getElementById('mute0');

    window.lejuommu.storeTwitchSource = function(sourceType, sourceValue) {
      window.localStorage.setItem('lejuommu.twitch.type', sourceType);
      window.localStorage.setItem('lejuommu.twitch.value', sourceValue);
    }

    window.lejuommu.loadTwitchSource = function() {
      const sourceType = window.localStorage.getItem('lejuommu.twitch.type');
      const sourceValue = window.localStorage.getItem('lejuommu.twitch.value');
      if (sourceType && sourceValue) {
        return {type: sourceType,
                value: sourceValue};
      } else {
        return {type: 'videoId',
                value: 'v408440508'};
      }
    }

    window.lejuommu.updateNowPlaying = function(shouldChangeChannel) {
      console.log('fetching data');

      fetch('https://listenapi.planetradio.co.uk/api9/initdadi/radio-nova')
        .then(function(response) { return response.json(); })
        .then(function(json) {
          const track = json.stationNowPlaying.nowPlayingTrack;
          const artist = json.stationNowPlaying.nowPlayingArtist;
          document.getElementById('fetch-result').innerHTML =
            track !== '' ? track + ' by ' + artist : 'Host(s) talking / advertisement';

          if (shouldChangeChannel) {
            if (track === '') {
              window.lejuommu.switchToRadio();
            } else {
              window.lejuommu.switchToTwitch();
            }
          }
        });
    };

    window.lejuommu.repeatingUpdate = function() {
      window.lejuommu.updateNowPlaying(window.lejuommu.automaticChanging);
      const checkIntervalMillis = window.lejuommu.radioIsPlaying ? 7000 : 1000;
      setTimeout(window.lejuommu.repeatingUpdate, checkIntervalMillis);
    };

    window.lejuommu.repeatingUpdate();

    window.lejuommu.switchToRadio = function() {
      player.pause();
      radio.volume(0.6);
      mute.style.opacity = 0;
      window.lejuommu.radioIsPlaying = true;
      document.getElementById('current-source').innerHTML = 'Radio';
    };

    window.lejuommu.switchToTwitch = function() {
      radio.volume(0);
      mute.style.opacity = 1;
      player.play();
      window.lejuommu.radioIsPlaying = false;
      document.getElementById('current-source').innerHTML = 'Twitch';
    };

    document.getElementById('switch-button').addEventListener('click',
      function() {
        if (!window.lejuommu.radioIsPlaying) {
          window.lejuommu.switchToRadio();
        } else {
          window.lejuommu.switchToTwitch();
        }
      });

    document.getElementById('automatic-button').addEventListener('click',
      function() {
        const autoState = document.getElementById('automatic-state');

        if (window.lejuommu.automaticChanging) {
          autoState.innerHTML = 'OFF';
        } else {
          autoState.innerHTML = 'ON';
        }

        window.lejuommu.automaticChanging = !window.lejuommu.automaticChanging;
      });

    document.getElementById('search-button').addEventListener('click',
      function() {
        const searchTerm = document.getElementById('search-input').value;
        if (searchTerm) {
          fetch('https://api.twitch.tv/helix/users?login=' + searchTerm,
                {headers: {'Client-ID': window.twitchClientId}})
            .then(function(response) { return response.json(); })
            .then(function(json) { if (json.data[0]) {
                                     return json.data[0].id;
                                   } else {
                                     throw new Error('Could not find user with: ' + searchTerm);
                                   }
                                 })
            .then(function(userId) {
              fetch('https://api.twitch.tv/helix/videos?user_id=' + userId,
                    {headers: {'Client-ID': window.twitchClientId}})
              .then(function(response) { return response.json(); })
              .then(function(json) {
                console.log('twitch response', json);
                if (json.data) {
                   const searchResults = document.getElementById('search-results');

                   while (searchResults.firstChild) {
                     searchResults.removeChild(searchResults.firstChild);
                   }

                   const videos = json.data;
                   videos.forEach(function(video) {
                      const videoElement = document.createElement('div');
                      videoElement.setAttribute("data-video-id", video.id);
                      videoElement.appendChild(document.createTextNode(video.created_at + " | " + video.duration + " | " + video.title));
                      videoElement.className = 'found-video';
                      searchResults.appendChild(videoElement);
                   });

                   searchResults.scrollIntoView();
                } else {
                  console.log('Search with "' + searchTerm + '" failed: ' +
                              json.status + ", " +
                              json.error + ", " +
                              json.message);
                }
              })
            })
            .catch(function(error) {
              console.log(error);
            });
        }
      });

    document.getElementById('search-results').addEventListener('click',
      function(event) {
        const videoId = event.target.dataset.videoId;
        player.setVideo('v' + videoId);
        window.scrollTo(0,0);
        window.lejuommu.storeTwitchSource('videoId', 'v' + videoId);
      });

    document.getElementById('watch-button').addEventListener('click',
      function() {
        const channelName = document.getElementById('watch-input').value;
        player.setChannel(channelName);
        window.scrollTo(0,0);
        window.lejuommu.storeTwitchSource('channel', channelName);
      });

    document.getElementById('watch-video-button').addEventListener('click',
      function() {
        const videoId = document.getElementById('watch-video-input').value;
        player.setVideo('v' + videoId);
        window.scrollTo(0,0);
        window.lejuommu.storeTwitchSource('videoId', 'v' + videoId);
      });
